// src/screens/N5/GifSaludo.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';
import {
  AchievementPayload,
  awardAchievement,
  getAchievement,
} from '../../services/achievements';

/* ================================
   Reproductor embebido + fallback 150/153
================================ */
function YouTubeBox({ videoId }: { videoId: string }) {
  const ref = useRef<YoutubeIframeRef>(null);
  const [playing, setPlaying] = useState(true);
  const [ready, setReady] = useState(false);
  const [needGesture, setNeedGesture] = useState(true);  // empezamos mute
  const [failed, setFailed] = useState<null | number>(null);

  const openInApp = () => {
    const url =
      Platform.OS === 'ios'
        ? `youtube://${videoId}`
        : Platform.OS === 'android'
        ? `vnd.youtube:${videoId}`
        : `https://www.youtube.com/watch?v=${videoId}`;
    Linking.openURL(url);
  };

  const onChangeState = useCallback((state: string) => {
    if (state === 'playing') setReady(true);
    if (state === 'ended') setPlaying(false);
  }, []);

  const onError = useCallback((e: string) => {
    // La lib entrega string, intentamos parsear número común (150/101/5/2)
    const code = Number(e);
    if ([150, 101, 5, 2].includes(code)) {
      setFailed(code);
      setPlaying(false);
    } else {
      setFailed(code || -1);
      setPlaying(false);
    }
  }, []);

  return (
    <View style={stylesYT.wrap}>
      {!ready && !failed && (
        <View style={stylesYT.loading}><ActivityIndicator /></View>
      )}

      {failed ? (
        <Pressable style={[stylesYT.overlayBtn, stylesYT.errorBtn]} onPress={openInApp}>
          <Text style={stylesYT.btnTxt}>Abrir en YouTube (error {failed})</Text>
        </Pressable>
      ) : (
        <>
          <YoutubePlayer
            ref={ref}
            height={'100%'}
            width={'100%'}
            videoId={videoId}
            play={playing}
            onReady={() => setReady(true)}
            onError={onError}
            onChangeState={onChangeState}
            // Autoplay con mute (cumple políticas)
            initialPlayerParams={{
              controls: true,
              rel: false,
              modestbranding: true,
              iv_load_policy: 3,
              // La lib no expone "mute" directo; arrancamos, y dejamos el botón para habilitar sonido.
            }}
            webViewProps={{
              allowsInlineMediaPlayback: true,
              allowsFullscreenVideo: true,
              // userGestureRequired en iOS para sonido: lo resolvemos con el botón
            }}
          />

          {needGesture && ready && (
            <Pressable
              style={stylesYT.overlayBtn}
              onPress={() => {
                // gesto del usuario: quitamos overlay y dejamos que el usuario controle el volumen
                setNeedGesture(false);
                // Si quieres forzar sonido, puedes pausar y reanudar:
                setPlaying(false);
                setTimeout(() => setPlaying(true), 150);
              }}
            >
              <Text style={stylesYT.btnTxt}>▶ Reproducir con sonido</Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

const stylesYT = StyleSheet.create({
  wrap: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000', borderRadius: 10, overflow: 'hidden' },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  overlayBtn: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  errorBtn: { backgroundColor: 'rgba(0,0,0,0.6)' },
  btnTxt: {
    color: '#fff', fontWeight: '800',
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: '#fff', borderRadius: 8,
  },
});

/* ================================
   Datos de los videos
================================ */
const YT = {
  konnichiwa: 'qI9Szm9y_m0',
  ohayoo: 'QhJxyWH8hhc',
  konbanwa: 'AjhdWufJZgY',
};

type Item = {
  id: string;
  youtubeId: string;
  jp: string;
  romaji: string;
  es: string;
  usage: {
    cuando: string;
    formal: string;
    informal: string;
    tips?: string[];
    imitacion: string[];
  };
  syllablesH: string[];
  syllablesR: string[];
  dialogos: { jp: string; romaji: string; es: string }[];
};

const ITEMS: Item[] = [
  {
    id: 'konnichiwa',
    youtubeId: YT.konnichiwa,
    jp: 'こんにちは',
    romaji: 'konnichiwa',
    es: 'hola / buenas tardes',
    usage: {
      cuando:
        'saludo diurno general (aprox. 11:00 hasta el atardecer). evita usarlo muy temprano o muy tarde por la noche.',
      formal:
        'neutral y correcto en casi cualquier situación. tras saludar, puedes continuar con una presentación básica más adelante en el curso.',
      informal:
        'perfecto con amistades y conocidos durante el día; tono relajado y amable.',
      tips: ['al contestar el teléfono se usa もしもし (moshi moshi), no こんにちは.'],
      imitacion: [
        '1) postura recta, sonrisa suave.',
        '2) pequeña reverencia (ojigi) con cabeza y hombros.',
        '3) pronuncia: こ・ん・に・ち・は  (ko-n-ni-chi-wa).',
        '4) ritmo parejo, tono amable.',
      ],
    },
    syllablesH: ['こ', 'ん', 'に', 'ち', 'は'],
    syllablesR: ['ko', 'n', 'ni', 'chi', 'wa'],
    dialogos: [
      { jp: 'a: こんにちは。', romaji: 'a: konnichiwa.', es: 'a: hola, buenas.' },
      { jp: 'b: こんにちは。おげんきですか。', romaji: 'b: konnichiwa. ogenki desu ka.', es: 'b: hola. ¿cómo estás?' },
    ],
  },
  {
    id: 'ohayoo',
    youtubeId: YT.ohayoo,
    jp: 'おはよう / おはようございます',
    romaji: 'ohayou / ohayou gozaimasu',
    es: 'buenos días (casual / cortés)',
    usage: {
      cuando:
        'por la mañana (hasta ~10–11 am). en algunos trabajos con turnos, se usa al iniciar la jornada.',
      formal: 'おはようございます (ohayou gozaimasu) con profes, jefes o personas que no conoces.',
      informal: 'おはよう (ohayou) con familia y amistades; en confianza puedes decir おはよ (ohayo).',
      tips: ['en contextos formales de mañana: おはようございます。つづきはのちほどべんきょうします。'],
      imitacion: [
        '1) postura con energía (como recién despertado).',
        '2) sonrisa abierta, mirada amable.',
        '3) pronuncia: お・は・よ・う  (o-ha-yo-u) / お・は・よ・う・ご・ざ・い・ま・す.',
        '4) tono alegre, sube un poco la entonación.',
      ],
    },
    syllablesH: ['お', 'は', 'よ', 'う'],
    syllablesR: ['o', 'ha', 'yo', 'u'],
    dialogos: [
      { jp: 'a: おはようございます。', romaji: 'a: ohayou gozaimasu.', es: 'a: buenos días.' },
      { jp: 'b: おはよう。', romaji: 'b: ohayou.', es: 'b: buenos días. (casual)' },
    ],
  },
  {
    id: 'konbanwa',
    youtubeId: YT.konbanwa,
    jp: 'こんばんは',
    romaji: 'konbanwa',
    es: 'buenas noches (saludo)',
    usage: {
      cuando:
        'desde el anochecer. se usa para saludar, no para despedirse (para despedirnos veremos おやすみ más adelante).',
      formal: 'natural y correcto en situaciones formales por la noche; tono calmado.',
      informal: 'también funciona con amistades y vecindario; se siente cercano y tranquilo.',
      tips: ['al contestar teléfono, también se prefiere もしもし.'],
      imitacion: [
        '1) postura relajada, sonrisa leve.',
        '2) saludo con la mano o breve inclinación.',
        '3) pronuncia: こ・ん・ば・ん・は  (ko-n-ba-n-wa).',
        '4) tono calmado, ritmo más lento que de día.',
      ],
    },
    syllablesH: ['こ', 'ん', 'ば', 'ん', 'は'],
    syllablesR: ['ko', 'n', 'ba', 'n', 'wa'],
    dialogos: [
      { jp: 'a: こんばんは。', romaji: 'a: konbanwa.', es: 'a: buenas noches.' },
      { jp: 'b: こんばんは。きょうはすずしいですね。', romaji: 'b: konbanwa. kyou wa suzushii desu ne.', es: 'b: buenas noches. hoy está fresco, ¿no?' },
    ],
  },
];

/* ================================
   Toast de logro
================================ */
function AchievementToast({
  visible,
  title,
  subtitle,
}: {
  visible: boolean;
  title: string;
  subtitle: string;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
        Animated.delay(2200),
        Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true, easing: Easing.in(Easing.ease) }),
      ]).start();
    }
  }, [visible]);
  if (!visible) return null;
  return (
    <Animated.View style={[s.toast, { opacity }]}>
      <Text style={s.toastTitle}>🏅 ¡Logro desbloqueado!</Text>
      <Text style={s.toastSubtitle}>{subtitle}</Text>
    </Animated.View>
  );
}

/* ================================
   Pantalla principal
================================ */
const ACH_ID = 'gif_saludo_01';
const XP_POINTS = 10; // 👈 10 px / 10 XP

type IntervalId = ReturnType<typeof globalThis.setInterval>;
type TimeoutId  = ReturnType<typeof globalThis.setTimeout>;

export default function GifSaludo() {
  const [awarded, setAwarded] = useState<boolean | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Estado práctica rítmica
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [practiceSeqH, setPracticeSeqH] = useState<string[]>([]);
  const [practiceSeqR, setPracticeSeqR] = useState<string[]>([]);

  const [isMarking, setIsMarking] = useState(false);

  const intervalRef = useRef<IntervalId | null>(null);
  const timeoutRef  = useRef<TimeoutId  | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const a = await getAchievement(ACH_ID);
        if (!mounted) return;
        setAwarded(!!a);
      } catch {
        if (mounted) setAwarded(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const clearTimers = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const stopPractice = useCallback(() => {
    clearTimers();
    setPracticeId(null);
    setPracticeIdx(0);
    setPracticeSeqH([]);
    setPracticeSeqR([]);
  }, []);

  const startPractice = useCallback((item: Item) => {
    Vibration.vibrate(10);
    clearTimers();
    setPracticeId(item.id);
    setPracticeIdx(0);
    setPracticeSeqH(item.syllablesH);
    setPracticeSeqR(item.syllablesR);

    let i = 0;
    intervalRef.current = setInterval(() => {
      i += 1;
      if (i >= item.syllablesH.length) {
        clearTimers();
        timeoutRef.current = setTimeout(() => {
          stopPractice();
        }, 500);
      } else {
        setPracticeIdx(i);
      }
    }, 650);
  }, [stopPractice]);

  useEffect(() => () => clearTimers(), []);

  const markLearned = useCallback(async () => {
    if (awarded || isMarking) return;
    setIsMarking(true);
    const payload: AchievementPayload = {
      title: 'Saludando', // 👈 nombre del logro
      description: 'Revisaste los saludos básicos con video y teoría.',
      icon: 'saludo_mapache',
      badgeColor: '#8FBF8F',
      points: XP_POINTS,  // 10 px
      xp: XP_POINTS,      // 10 XP
      score: ITEMS.length,
      total: ITEMS.length,
      type: 'practice',
      quizKey: 'GifSaludo',
      sub: 'gif_saludo',
      version: 1,
      createdAt: Date.now(),
    };
    try {
      await awardAchievement(ACH_ID, payload); // idempotente en servicio
      setAwarded(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsMarking(false);
    }
  }, [awarded, isMarking]);

  if (awarded === null) {
    return (
      <View style={s.loading}>
        <StatusBar barStyle="dark-content" />
        <Text style={s.loadingTxt}>Cargando…</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />

      {awarded && (
        <View style={s.banner}>
          <Text style={s.bannerTitle}>🔒 Mini-logro obtenido</Text>
          <Text style={s.bannerText}>Ya desbloqueaste “Saludando”. ¡+{XP_POINTS} XP!</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="always">
        <View style={s.header}>
          <Text style={s.title}>👋 Saludos (video + práctica)</Text>
          <Text style={s.sub}>
            Reproduce e <Text style={{fontWeight:'bold'}}>imita</Text> postura, gesto y pronunciación (hiragana + romaji).
            Pulsa “Practicar pronunciación” para ver las sílabas resaltadas en ritmo (sin kanji).
          </Text>
        </View>

        {ITEMS.map((it) => (
          <View key={it.id} style={s.card}>
            <View style={s.videoBox}>
              <YouTubeBox videoId={it.youtubeId} />
            </View>

            <Text style={s.jp}>{it.jp}</Text>
            <Text style={s.romaji}>
              {it.romaji} — <Text style={s.es}>{it.es}</Text>
            </Text>

            <Pressable
              onPressIn={() => startPractice(it)}
              style={({ pressed }) => [
                s.btn,
                { backgroundColor: '#B3001B', marginTop: 8, opacity: pressed ? 0.85 : 1 },
                s.btnPriority,
              ]}
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
            >
              <Text style={s.btnTxt}>Practicar pronunciación</Text>
            </Pressable>

            <View style={s.sep} />

            <Text style={s.h3}>¿cuándo usarlo?</Text>
            <Text style={s.p}>{it.usage.cuando}</Text>

            <Text style={s.h3}>formal</Text>
            <Text style={s.p}>{it.usage.formal}</Text>

            <Text style={s.h3}>informal</Text>
            <Text style={s.p}>{it.usage.informal}</Text>

            {it.usage.tips?.length ? (
              <>
                <Text style={s.h3}>tips</Text>
                {it.usage.tips.map((t, i) => (
                  <Text key={i} style={s.p}>• {t}</Text>
                ))}
              </>
            ) : null}

            <Text style={s.h3}>imítalo (gesto + voz)</Text>
            {it.usage.imitacion.map((line, i) => (
              <Text key={i} style={s.p}>{line}</Text>
            ))}

            <Text style={s.h3}>mini-diálogo</Text>
            {it.dialogos.map((d, i) => (
              <View key={i} style={{ marginBottom: 6 }}>
                <Text style={s.pMono}>{d.jp}</Text>
                <Text style={s.pLight}>{d.romaji}</Text>
                <Text style={s.pLight}>{d.es}</Text>
              </View>
            ))}
          </View>
        ))}

        <Pressable
          onPressIn={markLearned}
          disabled={awarded || isMarking}
          style={({ pressed }) => [
            s.btn,
            { marginTop: 12, opacity: (awarded || isMarking) ? 0.5 : (pressed ? 0.85 : 1) },
            s.btnPriority,
          ]}
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
        >
          <Text style={s.btnTxt}>
            {awarded ? 'ya marcado como aprendido' : (isMarking ? 'guardando…' : 'marcar como aprendido (+10 xp)')}
          </Text>
        </Pressable>

        <View style={{ height: 28 }} />
      </ScrollView>

      {/* Overlay de práctica en Modal */}
      <Modal visible={!!practiceId} transparent animationType="fade" onRequestClose={stopPractice}>
        <View style={s.practiceOverlay}>
          <View style={s.practiceCard}>
            <Text style={s.practiceTitle}>Pronuncia al ritmo</Text>
            <Text style={s.practiceH}>{practiceSeqH[practiceIdx] ?? ''}</Text>
            <Text style={s.practiceR}>{practiceSeqR[practiceIdx] ?? ''}</Text>
            <Text style={s.practiceHint}>sigue el tempo…</Text>
            <Pressable onPressIn={stopPractice} style={({ pressed }) => [s.practiceBtn, pressed && { opacity: 0.85 }]}>
              <Text style={s.practiceBtnTxt}>Salir</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <AchievementToast
        visible={showToast}
        title="¡Logro desbloqueado!"
        subtitle={`Saludando (+${XP_POINTS} XP)`}
      />
    </View>
  );
}

/* ================================
   Estilos
================================ */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  loadingTxt: { color: '#374151' },

  banner: {
    backgroundColor: '#ECFDF5',
    borderBottomWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bannerTitle: { color: '#065F46', fontWeight: '800' },
  bannerText: { color: '#065F46' },

  container: { padding: 16, paddingBottom: 40 },

  header: {
    backgroundColor: '#111827', borderRadius: 12, padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: '#1f2937',
  },
  title: { color: '#fff', fontWeight: '800', fontSize: 18, marginBottom: 4, textAlign: 'center' },
  sub:   { color: '#e5e7eb', fontSize: 13, textAlign: 'center' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginTop: 14,
  },

  videoBox: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000',
    height: undefined,
    aspectRatio: 16 / 9,
    marginBottom: 8,
  },

  jp: { fontSize: 18, fontWeight: '800', color: '#111827' },
  romaji: { fontSize: 13, color: '#374151', marginTop: 2, textTransform: 'none' },
  es: { fontSize: 12, color: '#6b7280' },

  sep: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 10 },

  h3: { fontSize: 14, fontWeight: '800', color: '#111827', marginTop: 6, marginBottom: 2, textTransform: 'lowercase' },
  p:  { fontSize: 13, color: '#374151', lineHeight: 20, textAlign: 'justify' },
  pMono:  { fontSize: 13, color: '#111827', fontFamily: 'monospace' },
  pLight: { fontSize: 12, color: '#6b7280' },

  btn: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnTxt: { color: '#fff', fontWeight: '800', textTransform: 'lowercase' },
  btnPriority: { zIndex: 10, elevation: 10 },

  toast: {
    position: 'absolute',
    top: 18,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    elevation: 4,
  },
  toastTitle: { color: '#fff', fontWeight: '800', fontSize: 14, marginBottom: 2, textAlign: 'center' },
  toastSubtitle: { color: '#e5e7eb', fontSize: 12, textAlign: 'center' },

  practiceOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17,24,39,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceCard: {
    width: '86%',
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
  },
  practiceTitle: { color: '#fff', fontWeight: '800', fontSize: 16, marginBottom: 8 },
  practiceH: { color: '#fff', fontSize: 56, fontWeight: '900', marginTop: 6 },
  practiceR: { color: '#e5e7eb', fontSize: 18, marginTop: 4 },
  practiceHint: { color: '#c7d2fe', fontSize: 12, marginTop: 6 },
  practiceBtn: {
    marginTop: 12,
    backgroundColor: '#B3001B',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  practiceBtnTxt: { color: '#fff', fontWeight: '800' },
});
