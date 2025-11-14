// src/screens/N5/OrigenesSerie.tsx
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from 'react-native';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';
import { useFeedbackSounds } from '../../hooks/useFeedbackSounds';

/* ★★★ XP/Logros ★★★ */
import { awardOnSuccess, useAwardOnEnter } from '../../services/achievements';

/* ====== Layout y assets ====== */
const CONTENT_PAD = 18;
const CARD_PAD    = 16;
const CARD_RADIUS = 16;

const FIXED_CARD_TARGET_W = 350;
const FIXED_IMG_TARGET_H  = 240;

const IMG_KANJI    = require('../../../assets/images/origenes_kanji.webp');
const IMG_HIRAGANA = require('../../../assets/images/origenes_hiragana.webp');
const IMG_KATAKANA = require('../../../assets/images/origenes_katakana.webp');
const IMG_MAP      = require('../../../assets/images/origenes_mapa.webp');

// Fondo patrón seigaiha (ya lo tienes en IntroJapones)
const BG_PATTERN   = require('../../../assets/icons/intro/bg_seigaiha.webp');

/* ====== YouTube (dejamos el player como estaba) ====== */
const VIDEO_ID = '2bRN6Zr_XeU';
const YT_URL   = `https://youtu.be/${VIDEO_ID}`;

/* =========================
   GLOSARIO (tooltips)
========================= */
const GLOSSARY: Record<string, string> = {
  Japón: 'País insular del este de Asia compuesto por cuatro islas principales y muchas menores.',
  Jōmon: 'Periodo prehistórico de las islas japonesas (≈ 14,000–300 a.C.).',
  'familia japónica': 'Grupo de lenguas al que pertenecen el japonés y las lenguas de Ryukyu.',
  japonés: 'Lengua principal hablada en Japón; variedad estándar: hyōjungo.',
  Ryukyu: 'Archipiélago al sur de Japón; lenguas ryukyuenses son parientes del japonés.',
  Yayoi: 'Periodo (≈ 300 a.C.–300 d.C.) con agricultura de arroz y fuerte contacto desde Corea.',
  'península coreana': 'Puente cultural e histórico entre China y Japón; gran intercambio humano.',
  Kofun: 'Periodo (≈ 300–538 d.C.) famoso por grandes túmulos funerarios; mayor centralización.',
  escribir: 'Representar el lenguaje mediante signos gráficos (sistemas de escritura).',
  kanji: 'Caracter logográfico de origen chino usado en japonés; puede tener lecturas on/kun.',
  partículas: 'Mini-palabras (は, が, を, に, で, の, へ, も, と) que marcan funciones gramaticales.',
  manyōgana: 'Uso temprano de kanji por su SONIDO para escribir japonés; puente a los silabarios.',
  'Man’yōshū': 'Antología poética del s. VIII que muestra el uso de manyōgana.',
  hiragana: 'Silabario cursivo; se usa para gramática, partículas y palabras nativas.',
  katakana: 'Silabario angular; se usa para préstamos, onomatopeyas y énfasis.',
  gramática: 'Estructura de una lengua: morfología, orden y relaciones (p. ej., partículas).',
  préstamos: 'Palabras tomadas de otros idiomas (gairaigo), p. ej., テレビ, コーヒー.',
  'núcleo semántico': 'La parte central de significado de una palabra o compuesto.',
  学生: '“Estudiante” (gakusei). Kanji 学 (aprender) + 生 (persona/vida).',
  rangaku: '“Estudios holandeses”: vía de entrada de ciencia occidental durante Edo.',
  Meiji: 'Periodo (1868–1912) de modernización acelerada en Japón.',
  'genbun-itchi': 'Movimiento que unificó lengua hablada y escrita para que “sonaran igual”.',
  kango: 'Vocabulario de raíz china leído a la japonesa (p. ej., 経済 “economía”).',
  hyōjungo: '“Lengua estándar” japonesa, basada en Tokio.',
  'jōyō kanji': 'Lista oficial de kanji de uso común (educación y prensa).',
  furigana: 'Pequeños kana sobre/junto al kanji que indican su lectura.',
  'wasei-eigo': '“Inglés hecho en Japón”: palabras que parecen inglesas pero son japonesas (サラリーマン).',
  kokuji: 'Kanji creados en Japón (p. ej., 働 “trabajar”).',
  rendaku: '“Voceo” en compuestos: k→g, t→d… (手+紙 → てがみ).',
  tegami: 'てがみ = “carta”; ejemplo clásico de rendaku (te+kami → teGami).',
  'melodía (pitch accent)': 'Contorno tonal que distingue palabras en japonés; no es acento de intensidad.',
  moras: 'Unidad rítmica breve; no siempre coincide con la sílaba.',
  'vocales largas': 'Vocal prolongada (おう/うう → ō). En katakana se marca con ー.',
  kōhī: 'コーヒー: transcripción de “coffee”; muestra vocal larga en katakana.',
  radicales: 'Partes recurrentes que forman kanji y dan pistas de significado/lectura.',
  'S-O-V': 'Orden oracional típico del japonés: Sujeto–Objeto–Verbo.',
  'です/ます': 'Sufijos/verbo-cópula de la forma cortés en japonés.',
};

/* ===== Tooltip ===== */
function useTooltip() {
  const [tip, setTip] = useState<{visible:boolean; title:string; text:string; x:number; y:number}>({
    visible: false, title: '', text: '', x: 0, y: 0,
  });
  const show = (title: string, text: string, x: number, y: number) =>
    setTip({ visible: true, title, text, x, y });
  const hide = () => setTip(t => ({ ...t, visible: false }));
  return { tip, show, hide };
}

/* ===== Imagen auto ===== */
function AutoImage({
  source,
  bleed = false,
  forcedWidth,
  forcedHeight,
  borderRadius = CARD_RADIUS,
}: {
  source: any;
  bleed?: boolean;
  forcedWidth?: number;
  forcedHeight?: number;
  borderRadius?: number;
}) {
  const meta = Image.resolveAssetSource(source) || { width: 1, height: 1 };
  const aspect = meta.width / meta.height;

  const styleBase: any = {
    width: forcedWidth ? (bleed ? forcedWidth : Math.max(0, forcedWidth - CARD_PAD * 2)) : '100%',
    resizeMode: 'contain',
  };
  if (forcedHeight) styleBase.height = forcedHeight;
  else styleBase.aspectRatio = aspect;

  if (bleed) {
    return (
      <View style={{ marginHorizontal: -CARD_PAD, borderRadius, overflow: 'hidden', backgroundColor: '#fff' }}>
        <Image source={source} style={styleBase} />
      </View>
    );
  }
  return (
    <Image
      source={source}
      style={{ ...styleBase, alignSelf: 'center', borderRadius, backgroundColor: '#fff' }}
    />
  );
}

export default function OrigenesSerie() {
  const { tip, show, hide } = useTooltip();
  const { width: screenW } = useWindowDimensions();
  const cardW = Math.min(FIXED_CARD_TARGET_W, screenW - CONTENT_PAD * 1);

  // Player state (igual que antes, solo estilos nuevos)
  const playerRef = useRef<YoutubeIframeRef>(null);
  const [playing, setPlaying] = useState(true);
  const [ready, setReady]   = useState(false);
  const [error, setError]   = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setPlaying(true);
      return () => setPlaying(false);
    }, [])
  );

  const onChangeState = useCallback((state: string) => {
    if (state === 'ended') setPlaying(false);
  }, []);
  const onError = useCallback((e: string) => {
    setError(e || 'unknown');
    setPlaying(false);
  }, []);

  // Texto tocable en verde
  const Term = ({ k, children }: { k: keyof typeof GLOSSARY; children: React.ReactNode }) => (
    <Text
      onPress={(e) => {
        const { pageX, pageY } = e.nativeEvent;
        const def = GLOSSARY[k] ?? 'Definición no disponible.';
        show(String(children), def, pageX, pageY);
      }}
      style={s.term}
      suppressHighlighting={false}
    >
      <Text style={s.termTxt}>{children}</Text>
    </Text>
  );

  const quiz = useMemo(
    () =>
      [
        {
          q: '¿Cuál fue el gran cambio de la era Yayoi que impactó la formación del japonés?',
          options: ['Aislamiento total de la península coreana','Agricultura de arroz + contacto intenso con Corea','Nacimiento de hiragana y katakana'],
          a: 1,
          why: 'El arroz y el intercambio con Corea impulsaron transformaciones tecnológicas y culturales clave.',
        },
        {
          q: '¿Qué describe mejor a manyōgana?',
          options: ['Un silabario simplificado como hiragana','Una lista moderna de kanji de uso común','Escribir japonés usando kanji por su sonido'],
          a: 2,
          why: 'Manyōgana emplea kanji por su valor fonético; fue el puente hacia los silabarios.',
        },
        {
          q: '¿Cuál es el reparto actual correcto entre los sistemas de escritura?',
          options: ['Hiragana = préstamos; Katakana = gramática; Kanji = decorativos','Hiragana = gramática/nativas; Katakana = préstamos/onomatopeyas; Kanji = núcleo de significado','Hiragana = solo nombres propios; Katakana = solo marcas; Kanji = números'],
          a: 1,
          why: 'Estructura (hiragana), préstamos/onomatopeyas (katakana) y significado (kanji).',
        },
        {
          q: '¿Cómo se llama el movimiento de Meiji que acercó la lengua escrita a la hablada?',
          options: ['Rendaku','Genbun-itchi','Hyōjungo'],
          a: 1,
          why: 'Genbun-itchi buscó que los textos sonaran a conversación real.',
        },
        {
          q: '¿Qué hace el rendaku en palabras compuestas?',
          options: ['Elimina vocales largas','Cambia katakana por hiragana','Vuelve sonora la consonante inicial del segundo elemento (k→g, t→d, etc.)'],
          a: 2,
          why: 'Por eso 手 + 紙 pasa a てがみ (tegami).',
        },
        {
          q: '¿Para qué sirve el furigana en un texto japonés?',
          options: ['Marcar el tema de la oración','Indicar la lectura (pronunciación) de un kanji','Convertir préstamos a katakana'],
          a: 1,
          why: 'El furigana muestra cómo se lee un kanji.',
        },
      ] as { q: string; options: string[]; a: number; why: string }[],
    []
  );

  /* ▼▼▼ XP en la entrada (first open + repetición) ▼▼▼ */
  useAwardOnEnter('N5_OrigenesSerie', {
    xpOnEnter: 10,
    repeatXp: 5,
    achievementId: 'intro_primera_visita',
    achievementSub: 'N5',
    meta: { label: 'Orígenes del idioma' },
  });

  // Modal de logro al terminar el quiz
  const [showCongrats, setShowCongrats] = useState(false);
  const [finalScore, setFinalScore] = useState<{ok: number; total: number}>({ ok: 0, total: 0 });

  const handleQuizComplete = useCallback(async (ok: number, total: number) => {
    setFinalScore({ ok, total });
    setShowCongrats(true);
    // +20 XP y logro "Ciestionario1" (idempotente)
    try {
      await awardOnSuccess('N5_OrigenesSerie', {
        xpOnSuccess: 20,
        achievementId: 'Ciestionario1',
        achievementSub: 'N5',
        meta: { score: ok, total },
      });
    } catch {}
  }, []);

  return (
    <View style={s.root}>
      <StatusBar backgroundColor="#5f4b32" barStyle="light-content" />

      {/* Fondo degradado + patrón */}
      <LinearGradient
        colors={['#F3E3C6', '#F2D7B3']}
        start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <ImageBackground source={BG_PATTERN} resizeMode="repeat" style={StyleSheet.absoluteFill} imageStyle={{ opacity: 0.07 }} />

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="always">

        {/* Encabezado grande estilo app de cine */}
        <Text style={s.screenTitle}>Orígenes del idioma japonés</Text>

        {/* Tarjeta del video */}
        <View style={s.videoCard}>
          <View style={s.videoBox}>
            {!ready && !error && (
              <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                <ActivityIndicator />
              </View>
            )}
            {error ? (
              <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', padding: 12 }]}>
                <Text style={{ color: '#fff', textAlign: 'center', marginBottom: 10 }}>
                  No se puede reproducir embebido (código: {error}).
                </Text>
                <Pressable onPress={() => Linking.openURL(YT_URL)} style={({ pressed }) => [s.openBtn, pressed && { opacity: 0.85 }]}>
                  <Text style={s.openBtnTxt}>Abrir video en YouTube</Text>
                </Pressable>
              </View>
            ) : (
              <YoutubePlayer
                ref={playerRef}
                height={190}
                width={'100%'}
                videoId={VIDEO_ID}
                play={playing}
                webViewProps={{ allowsFullscreenVideo: true, allowsInlineMediaPlayback: true }}
                initialPlayerParams={{ modestbranding: true, rel: false, controls: true, preventFullScreen: false }}
                onReady={() => setReady(true)}
                onError={onError}
                onChangeState={onChangeState}
              />
            )}
          </View>

          <Pressable onPress={() => Linking.openURL(YT_URL)} style={({ pressed }) => [s.youtubeBtn, pressed && { opacity: 0.8 }]}>
            <Text style={s.youtubeBtnTxt}>Ver video en YouTube</Text>
          </Pressable>
        </View>

        {/* Tip: palabras en verde */}
        <View style={s.tipCard}>
          <Text style={s.tipTitle}>💡 Tip interactivo</Text>
          <Text style={s.tipText}>
            Las <Text style={s.termInline}>palabras en verde</Text> son tocables. Tócalas para ver una definición breve.
          </Text>
        </View>

        {/* Bloque de texto principal con términos tocables */}
        <View style={s.textCard}>
          <Text style={s.h1}>Orígenes del idioma japonés</Text>

          <Text style={s.pJ}>
            Imagina abrir <Term k="Japón">Japón</Term> como si fuera el primer capítulo de una saga 🌏. Antes de los
            ideogramas, antes de los animes y las apps, ya había voces en esas islas. En la era
            <Term k="Jōmon"> Jōmon</Term>, muy atrás en el calendario, diferentes comunidades hablaban lenguas que no
            eran chinas ni coreanas: eran suyas, de un árbol que los lingüistas llaman
            <Term k="familia japónica"> familia japónica</Term>, donde hoy viven el <Term k="japonés">japonés</Term> y
            las lenguas de <Term k="Ryukyu">Ryukyu</Term> (Okinawa y alrededores).
          </Text>

          <Text style={s.pJ}>
            Luego llega <Term k="Yayoi">Yayoi</Term> y con él el arroz, el metal y —sobre todo— el trato constante con
            la <Term k="península coreana">península coreana</Term> 🤝. No fue copiar y pegar un idioma; fue una chispa:
            nuevas técnicas, gente que va y viene, palabras que se rozan, ideas que se mezclan.
          </Text>

          <Text style={s.pJ}>
            Con <Term k="Kofun">Kofun</Term> cambia el escenario. Aparecen enormes tumbas con forma de cerradura, la
            política se ordena, y surge una necesidad muy humana: <Term k="escribir">escribir</Term>. Entra el “plot
            twist” 📜: llegan los <Term k="kanji">kanji</Term>. El japonés usa <Term k="partículas">partículas</Term> y
            flexiona verbos; la respuesta creativa fue el <Term k="manyōgana">manyōgana</Term>, visible en el
            <Term k="Man’yōshū"> Man’yōshū</Term>.
          </Text>

          <Text style={s.pJ}>
            De ese puente nacen <Term k="hiragana">hiragana</Term> y <Term k="katakana">katakana</Term> ✍️. Con el
            tiempo: hiragana para la <Term k="gramática">gramática</Term> y palabras nativas; katakana para
            <Term k="préstamos"> préstamos</Term> y onomatopeyas; kanji para el
            <Term k="núcleo semántico"> núcleo semántico</Term>. Cuando lees わたしは<Term k="学生">学生</Term>です, la banda
            suena completa 🎶.
          </Text>

          <Text style={s.pJ}>
            La saga sigue. Llegan europeos y, en Edo, el <Term k="rangaku">rangaku</Term> 🔬. En
            <Term k="Meiji"> Meiji</Term> aparece <Term k="genbun-itchi">genbun-itchi</Term>; florecen neologismos de
            raíz <Term k="kango">kango</Term> y se consolida <Term k="hyōjungo">hyōjungo</Term>.
          </Text>

          <Text style={s.pJ}>
            El siglo XX fija <Term k="jōyō kanji">jōyō kanji</Term> y normaliza <Term k="furigana">furigana</Term> 🧠.
            Surgen <Term k="wasei-eigo">wasei-eigo</Term> y <Term k="kokuji">kokuji</Term>. Juega el
            <Term k="rendaku"> rendaku</Term>, que convierte 手+紙 en <Term k="tegami">tegami</Term>.
          </Text>

          <Text style={s.pJ}>
            En resumen: primero voz; luego <Term k="kanji">kanji</Term>; por fin
            <Term k="hiragana"> hiragana</Term> y <Term k="katakana">katakana</Term>. Desde entonces,
            <Term k="kanji"> kanji</Term> + <Term k="hiragana">hiragana</Term> + <Term k="katakana">katakana</Term> =
            un idioma que mezcla sin perder identidad ✨.
          </Text>
        </View>

        {/* Lo básico */}
        <View style={s.textCard}>
          <Text style={s.h2}>Temporada 0: cómo suena y cómo se arma 🎧</Text>

          <Text style={s.pJ}>
            El japonés va de <Term k="melodía (pitch accent)">melodía (pitch accent)</Term>. Su ritmo usa
            <Term k="moras"> moras</Term>: ta–be–ma–su tiene cuatro; la っ cuenta como una. Hay
            <Term k="vocales largas"> vocales largas</Term> —コーヒー = <Term k="kōhī">kōhī</Term>.
          </Text>

          <Text style={s.pJ}>
            Empiezas con <Term k="hiragana">hiragana</Term> y <Term k="furigana">furigana</Term>, sigues con
            <Term k="katakana"> katakana</Term> (コンビニ, アプリ, ゲーム) y pasas a <Term k="kanji">kanji</Term> apoyándote en
            <Term k="radicales"> radicales</Term>.
          </Text>

          <Text style={s.pJ}>
            En gramática, piensa en LEGO: orden <Term k="S-O-V">S-O-V</Term>, verbo al final y
            <Term k="partículas"> partículas</Term> marcando funciones. Con <Term k="です/ます">です/ます</Term> suenas cortés; el
            informal llega después.
          </Text>
        </View>

        {/* Sistemas de escritura – tarjetas */}
        <View style={s.grid3}>
          <View style={[s.textCard, { width: cardW, alignSelf: 'center' }]}>
            <Text style={s.h3}>漢字 Kanji</Text>
            <Text style={s.pJ}>Ideogramas con <Text style={s.bold}>significado</Text>.</Text>
            <AutoImage source={IMG_KANJI} bleed forcedWidth={cardW} forcedHeight={FIXED_IMG_TARGET_H} />
          </View>

          <View style={[s.textCard, { width: cardW, alignSelf: 'center' }]}>
            <Text style={s.h3}>ひらがな Hiragana</Text>
            <Text style={s.pJ}>Silabario de la <Text style={s.bold}>gramática</Text> y palabras nativas.</Text>
            <AutoImage source={IMG_HIRAGANA} forcedWidth={cardW} forcedHeight={FIXED_IMG_TARGET_H} />
          </View>

          <View style={[s.textCard, { width: cardW, alignSelf: 'center' }]}>
            <Text style={s.h3}>カタカナ Katakana</Text>
            <Text style={s.pJ}>Silabario de <Text style={s.bold}>préstamos</Text> y onomatopeyas.</Text>
            <AutoImage source={IMG_KATAKANA} forcedWidth={cardW} forcedHeight={FIXED_IMG_TARGET_H} />
          </View>
        </View>

        {/* Mapa */}
        <View style={[s.textCard, { width: cardW, alignSelf: 'center' }]}>
          <Text style={s.h2}>Mapa de rutas culturales 🗺️</Text>
          <Text style={s.pJ}>
            China → Corea → Japón: la escritura, la religión y la tecnología viajan y dejan huella.
          </Text>
          <AutoImage source={IMG_MAP} forcedWidth={cardW} forcedHeight={FIXED_IMG_TARGET_H} bleed />
        </View>

        {/* Quiz */}
        <QuizBlock questions={quiz} onComplete={handleQuizComplete} />
      </ScrollView>

      {/* Tooltip rojo */}
      {tip.visible && (
        <Pressable style={s.overlay} onPress={hide}>
          <View style={[s.tooltip, { top: Math.max(tip.y - 120, 80), left: 16, right: 16 }]}>
            <Text style={s.tooltipTitle}>{tip.title}</Text>
            <Text style={s.tooltipText}>{tip.text}</Text>
          </View>
        </Pressable>
      )}

      {/* Modal logro final */}
      {showCongrats && (
        <Pressable style={s.congratsOverlay} onPress={() => setShowCongrats(false)}>
          <View style={s.congratsCard}>
            <Text style={s.congratsTitle}>🎉 ¡Logro desbloqueado!</Text>
            <Text style={s.congratsName}>Ciestionario1</Text>
            <Text style={s.congratsXP}>+20 XP</Text>
            <Text style={s.congratsScore}>Puntuación: {finalScore.ok}/{finalScore.total}</Text>
            <Text style={s.congratsHint}>Toca para cerrar</Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}

/* ===== Quiz con sonidos ===== */
function QuizBlock({
  questions,
  onComplete,
}: {
  questions: { q: string; options: string[]; a: number; why: string }[];
  onComplete?: (ok: number, total: number) => void;
}) {
  const { playCorrect, playWrong } = useFeedbackSounds();
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [finished, setFinished] = useState(false);

  const correct = answers.reduce((acc, cur, i) => (cur === questions[i].a ? acc + 1 : acc), 0);
  const total = questions.length;

  const handlePress = (qIndex: number, optIndex: number, isRight: boolean) => {
    setAnswers(prev => {
      if (prev[qIndex] !== -1) return prev; // evitar cambiar respuesta
      const next = [...prev];
      next[qIndex] = optIndex;
      return next;
    });
    try {
      if (isRight) playCorrect();
      else playWrong();
    } catch {}
  };

  // Cuando todas están respondidas y aún no se ha marcado como finalizado → disparar onComplete una sola vez
  useEffect(() => {
    if (!finished && answers.every(a => a !== -1)) {
      setFinished(true);
      onComplete?.(correct, total);
    }
  }, [answers, finished, correct, total, onComplete]);

  return (
    <View style={s.textCard}>
      <Text style={s.h2}>Mini-quiz (6)</Text>
      <Text style={[s.caption, { marginBottom: 8 }]}>
        Toca una opción y revisa la explicación. Puntuación: {correct}/{total}
      </Text>

      {questions.map((it, idx) => {
        const selected = answers[idx];
        const isAnswered = selected !== -1;
        const isCorrect = isAnswered && selected === it.a;

        return (
          <View key={idx} style={{ marginBottom: 16 }}>
            <Text style={s.h3}>{idx + 1}. {it.q}</Text>
            <View style={{ gap: 8, marginTop: 6 }}>
              {it.options.map((opt, i) => {
                const chosen = selected === i;
                const ok = i === it.a;
                return (
                  <Pressable
                    key={i}
                    onPressIn={() => handlePress(idx, i, ok)}
                    android_ripple={{ color: '#e5e7eb' }}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    pressRetentionOffset={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    style={[s.opt, chosen && (ok ? s.optOk : s.optNo)]}
                  >
                    <Text style={[s.optTxt, chosen && { color: '#111827' }]}>{opt}</Text>
                  </Pressable>
                );
              })}
            </View>

            {isAnswered && (
              <Text style={[s.pJ, { marginTop: 6 }]}>
                {isCorrect ? '✅ ¡Correcto!' : '❌ No exactamente.'} {it.why}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

/* ================== ESTILOS ================== */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2D7B3' },
  content: { padding: CONTENT_PAD, paddingBottom: 48, gap: 14 },

  screenTitle: {
    fontSize: 24, fontWeight: '900', color: '#2A1B0F',
    textAlign: 'left', marginTop: 6, marginBottom: 8,
  },

  // Tarjeta video
  videoCard: {
    borderRadius: 20,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 6 },
  },
  videoBox: {
    height: 190, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000',
  },
  youtubeBtn: {
    marginTop: 10,
    alignSelf: 'center',
    paddingHorizontal: 18, paddingVertical: 10,
    backgroundColor: '#F1E9DC',
    borderRadius: 24,
    borderWidth: 1, borderColor: '#CBB6A0',
  },
  youtubeBtnTxt: { color: '#2A1B0F', fontWeight: '800' },

  // Tip
  tipCard: {
    marginTop: 14,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#0B1224',
  },
  tipTitle: { color: '#fff', fontWeight: '900', marginBottom: 6, fontSize: 14 },
  tipText:  { color: '#fff', fontSize: 13, lineHeight: 20 },
  termInline: { color: '#0ea5a3', fontWeight: '900' },

  // Cards de texto
  textCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: CARD_RADIUS,
    padding: CARD_PAD,
    borderWidth: 1,
    borderColor: '#eadfcd',
  },

  h1: { color: '#2A1B0F', fontSize: 20, fontWeight: '900', marginBottom: 8 },
  h2: { color: '#2A1B0F', fontSize: 18, fontWeight: '900', marginBottom: 8 },
  h3: { color: '#2A1B0F', fontSize: 16, fontWeight: '800', marginBottom: 6 },

  pJ: {
    color: '#3b2b1b',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'justify',
    marginBottom: 12,
  },
  caption: { color: '#6b7280', fontSize: 12 },

  grid3: { gap: 15 },

  // Fallback open
  openBtn: {
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#ff0000',
    borderRadius: 10,
  },
  openBtnTxt: { color: '#fff', fontWeight: '900' },

  bold: { fontWeight: '900', color: '#2A1B0F' },

  // Termino tocable (verde)
  term: { paddingHorizontal: 1 },
  termTxt: {
    color: '#0ea5a3', // verde turquesa
    fontWeight: '900',
  },

  // Quiz
  opt: {
    borderWidth: 1,
    borderColor: '#d8cbb8',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  optOk: { backgroundColor: '#c8f7c5', borderColor: '#8ee08a' },
  optNo: { backgroundColor: '#fde2e2', borderColor: '#f5b5b5' },
  optTxt: { color: '#2A1B0F', fontSize: 14 },

  // Tooltip rojo
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17,24,39,0.25)',
    justifyContent: 'flex-start',
    zIndex: 1000,
  },
  tooltip: {
    position: 'absolute',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: '#b91c1c',
  },
  tooltipTitle: { color: '#fff', fontWeight: '800', marginBottom: 4, fontSize: 14 },
  tooltipText: { color: '#fff', fontSize: 13, lineHeight: 19 },

  // Modal logro final
  congratsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  congratsCard: {
    width: 300,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#F5D38A',
    alignItems: 'center',
  },
  congratsTitle: { fontWeight: '900', color: '#1f2937', fontSize: 16, marginBottom: 6 },
  congratsName: { fontWeight: '900', color: '#7a2e0e', fontSize: 18 },
  congratsXP: { fontWeight: '900', color: '#0f766e', marginTop: 2 },
  congratsScore: { color: '#374151', marginTop: 4 },
  congratsHint: { color: '#6b7280', fontSize: 12, marginTop: 10 },
});
