// src/screens/N3/N3_Block1/N3_Block1_Unit5Screen.tsx
// BLOQUE 1 — 05 Reglas y normas –「〜なければならない」「〜なくてもいい」
// 👉 Imagen: copia tu foto a assets y ajusta la ruta del require() más abajo.
//    Si la tenías en D:\imagenes\mi_foto.jpg (o la que subiste), muévela a
//    /assets/images/n3/b1_u5.webp  y cambia la ruta del require a la correcta.

import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useFeedbackSounds } from "../../../src/hooks/useFeedbackSounds";

/* ---------------- Types (local) ---------------- */
type RootStackParamList = {
  N3_Unit: { block: number; unit: number; title: string } | undefined;
  N3_Block1_Unit5: undefined | { block: number; unit: number; title?: string };
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_Block1_Unit5">;

type Ex = { jp: string; romaji: string; es: string };
type Q = { id: number; stem: string; options: string[]; answer: string; explain: string };
type OrderQ = { id: number; jp: string; romaji: string; es: string; tokens: string[] };
type Kanji = { hex: string; char: string; gloss: string; sample: string };

/* ---------------- Tema / Objetivo ---------------- */
const BLOQUE = 1;
const UNIDAD = 5;
const TEMA_ES = "5️⃣ Reglas y normas –「〜なければならない」「〜なくてもいい」";
const OBJETIVO_ES = "Indicar obligación o ausencia de ella.";

/* ---------------- Chips (3–5 relacionados) ---------------- */
const CHIPS = ["〜なければならない", "〜なくてはいけない", "〜ないといけない", "〜なくてもいい"];

/* ---------------- Ejemplos por gramática (7 c/u) ---------------- */
/** 1) 〜なければならない (deber/obligación; más escrito/objetivo) */
const EX_NAKEREBA: Ex[] = [
  { jp: "明日までにレポートを出さなければならない。", romaji: "ashita made ni repōto o dasanakereba naranai", es: "Debo entregar el informe para mañana." },
  { jp: "ここではヘルメットを着用しなければならない。", romaji: "koko de wa herumetto o chakuyō shinakereba naranai", es: "Aquí hay que llevar casco." },
  { jp: "外国人は在留カードを持ち歩かなければならない。", romaji: "gaikokujin wa zairyū kādo o mochi arukanakereba naranai", es: "Los extranjeros deben llevar su tarjeta de residencia." },
  { jp: "試験に合格するには、もっと勉強しなければならない。", romaji: "shiken ni gōkaku suru ni wa, motto benkyō shinakereba naranai", es: "Para aprobar, tengo que estudiar más." },
  { jp: "電車の中ではマスクをつけなければならない場合がある。", romaji: "densha no naka de wa masuku o tsukenakereba naranai baai ga aru", es: "En el tren a veces es obligatorio usar mascarilla." },
  { jp: "会議の前に資料を準備しなければならない。", romaji: "kaigi no mae ni shiryō o junbi shinakereba naranai", es: "Debo preparar los materiales antes de la reunión." },
  { jp: "引っ越しまでに住所変更をしなければならない。", romaji: "hikkoshi made ni jūsho henkō o shinakereba naranai", es: "Debo cambiar mi dirección antes de la mudanza." },
];

/** 2) 〜なくてはいけない (deber/obligación; muy común en habla) */
const EX_NAKUTEHA: Ex[] = [
  { jp: "この薬は毎日飲まなくてはいけない。", romaji: "kono kusuri wa mainichi nomanakute wa ikenai", es: "Tengo que tomar esta medicina todos los días." },
  { jp: "ゴミは分別しなくてはいけない。", romaji: "gomi wa bunbetsu shinakute wa ikenai", es: "Hay que separar la basura." },
  { jp: "提出期限を守らなくてはいけない。", romaji: "teishutsu kigen o mamoranakute wa ikenai", es: "Hay que respetar el plazo de entrega." },
  { jp: "面接では時間を守らなくてはいけない。", romaji: "mensetsu de wa jikan o mamoranakute wa ikenai", es: "En una entrevista debes ser puntual." },
  { jp: "自転車でも夜はライトをつけなくてはいけない。", romaji: "jitensha demo yoru wa raito o tsukenakute wa ikenai", es: "Incluso en bici hay que llevar luces por la noche." },
  { jp: "図書館では静かにしなくてはいけない。", romaji: "toshokan de wa shizuka ni shinakute wa ikenai", es: "En la biblioteca hay que estar en silencio." },
  { jp: "申請のとき、身分証を見せなくてはいけない。", romaji: "shinsei no toki, mibunshō o misenakute wa ikenai", es: "Al solicitar, debes mostrar una identificación." },
];

/** 3) 〜ないといけない (coloquial, obligación práctica/resultado) */
const EX_NAITO: Ex[] = [
  { jp: "もう行かないといけない。", romaji: "mō ikanai to ikenai", es: "Ya tengo que irme." },
  { jp: "早く寝ないといけないよ。", romaji: "hayaku nenai to ikenai yo", es: "Tienes que dormir temprano." },
  { jp: "締め切りまでに終わらないといけない。", romaji: "shimekiri made ni owaranai to ikenai", es: "Tengo que terminar antes del plazo." },
  { jp: "部屋を片付けないといけない。", romaji: "heya o katazukenai to ikenai", es: "Debo ordenar la habitación." },
  { jp: "予約を確認しないといけない。", romaji: "yoyaku o kakunin shinai to ikenai", es: "Tengo que confirmar la reserva." },
  { jp: "明日は早いから、準備しないといけない。", romaji: "ashita wa hayai kara, junbi shinai to ikenai", es: "Mañana es temprano, así que tengo que prepararme." },
  { jp: "先生に謝らないといけない。", romaji: "sensei ni ayamaranai to ikenai", es: "Tengo que disculparme con el profesor." },
];

/** 4) 〜なくてもいい (no es necesario / ausencia de obligación) */
const EX_NAKUTEMOII: Ex[] = [
  { jp: "今日はスーツを着なくてもいい。", romaji: "kyō wa sūtsu o kinakute mo ii", es: "Hoy no hace falta ponerse traje." },
  { jp: "宿題は明日出さなくてもいいですよ。", romaji: "shukudai wa ashita dasanakute mo ii desu yo", es: "La tarea no hace falta entregarla hoy; puede ser mañana." },
  { jp: "急がなくてもいい。", romaji: "isoganakute mo ii", es: "No hace falta apresurarse." },
  { jp: "この会議は参加しなくてもいい。", romaji: "kono kaigi wa sanka shinakute mo ii", es: "No tienes que asistir a esta reunión." },
  { jp: "現金を持たなくてもいい。カードで払えます。", romaji: "genkin o motanakute mo ii. kādo de haraemasu", es: "No hace falta traer efectivo; puedes pagar con tarjeta." },
  { jp: "全部覚えなくてもいい。大事な所だけでいい。", romaji: "zenbu oboenakute mo ii. daiji na tokoro dake de ii", es: "No tienes que memorizar todo; basta con lo importante." },
  { jp: "雨なら、外で練習しなくてもいい。", romaji: "ame nara, soto de renshū shinakute mo ii", es: "Si llueve, no es necesario practicar fuera." },
];

/* ---------------- Ordenar ---------------- */
const ORDERS: OrderQ[] = [
  { id: 1, jp: "申請のとき、身分証を見せなくてはいけない。", romaji: "shinsei no toki, mibunshō o misenakute wa ikenai", es: "Al solicitar, debes mostrar una identificación.", tokens: ["申請のとき、","身分証を","見せなくては","いけない。"] },
  { id: 2, jp: "現金を持たなくてもいい。", romaji: "genkin o motanakute mo ii", es: "No hace falta traer efectivo.", tokens: ["現金を","持たなくても","いい。"] },
  { id: 3, jp: "会議の前に資料を準備しなければならない。", romaji: "kaigi no mae ni shiryō o junbi shinakereba naranai", es: "Debo preparar los materiales antes de la reunión.", tokens: ["会議の前に","資料を","準備しなければ","ならない。"] },
];

/* ---------------- Quiz (8 ítems) ---------------- */
const QUIZ: Q[] = [
  { id: 1, stem: "図書館では静かにし___。", options: ["なくてもいい","なければならない","すぎる"], answer: "なければならない", explain: "Regla/obligación general → しなければならない／しなくてはいけない。" },
  { id: 2, stem: "今日はスーツを着___。ラフでOK。", options: ["なくてもいい","なければならない","ないといけない"], answer: "なくてもいい", explain: "Ausencia de obligación → 〜なくてもいい。" },
  { id: 3, stem: "薬は毎日飲ま___。", options: ["なくてもいい","なくてはいけない","すぎない"], answer: "なくてはいけない", explain: "Necesidad práctica/obligación habitual → 〜なくてはいけない。" },
  { id: 4, stem: "そろそろ出発し___よ。電車に間に合わない。", options: ["ないといけない","なくてもいい","すぎる"], answer: "ないといけない", explain: "Habla coloquial, obligación por situación → 〜ないといけない。" },
  { id: 5, stem: "会社ではIDカードを持ち歩か___。", options: ["なくてもいい","なければならない","なくてはいけない"], answer: "なければならない", explain: "Obligación normativa; forma más formal/escrita。" },
  { id: 6, stem: "雨なら外で練習し___。", options: ["なければならない","なくてもいい","ないといけない"], answer: "なくてもいい", explain: "Condición que elimina la obligación → 〜なくてもいい。" },
  { id: 7, stem: "明日は早いから、今夜は早く寝___。", options: ["ないといけない","なくてもいい","なければならない"], answer: "ないといけない", explain: "Consejo fuerte/obligación práctica en coloquial → 〜ないといけない。" },
  { id: 8, stem: "提出期限は絶対に守ら___。", options: ["なくてもいい","なければならない","ないで"], answer: "なければならない", explain: "Regla obligatoria → 〜なければならない。" },
];

/* ---------------- Mini guía (como en primaria) ---------------- */
const PRIMARIA = {
  definiciones: [
    { tag: "〜なければならない", exp: "Obligación normativa/objetiva (tono más escrito/neutro)." },
    { tag: "〜なくてはいけない", exp: "Obligación muy común en habla; similar a ↑." },
    { tag: "〜ないといけない", exp: "Coloquial: obligación por situación ('tengo que…')." },
    { tag: "〜なくてもいい", exp: "No es necesario; ausencia de obligación." },
  ],
  pistas: [
    "📜 Regla general → なければならない / なくてはいけない",
    "🗣️ Conversación cotidiana → ないといけない",
    "🆓 No hace falta → なくてもいい",
  ],
};

/* ---------------- Comparación rápida ---------------- */
const COMPARA = [
  {
    patron: "V-なければならない",
    uso: "Obligación normativa/objetiva (más escrito)",
    forma: "V-ない形 + ければならない",
    ok: "書類を提出しなければならない。",
    es: "Debo presentar los documentos.",
  },
  {
    patron: "V-なくてはいけない",
    uso: "Obligación frecuente en habla",
    forma: "V-ない形 + くては いけない",
    ok: "薬を飲まなくてはいけない。",
    es: "Tengo que tomar la medicina.",
  },
  {
    patron: "V-ないといけない",
    uso: "Coloquial; obligación práctica",
    forma: "V-ない形 + と いけない",
    ok: "もう行かないといけない。",
    es: "Ya tengo que irme.",
  },
  {
    patron: "V-なくてもいい",
    uso: "No es necesario; permitido no hacer",
    forma: "V-ない形 + くても いい",
    ok: "参加しなくてもいい。",
    es: "No tienes que participar.",
  },
];

/* ---------------- Kanji del bloque (completados por defecto) ----------------
   No se proporcionaron 10 hex; añadimos una selección útil para “reglas/obligación”.
   Para usar trazos, asegúrate de tener assets en: assets/kanjivg/n3/<hex>_web.webp
-----------------------------------------------------------------------------*/
/* ---------------- Kanji (10 nuevos, tema “reglas / obligación / permiso”) ---------------- */
const KANJI: Kanji[] = [
  { hex: "5b88", char: "守", gloss: "proteger / cumplir",      sample: "守る（まもる）" },
  { hex: "898f", char: "規", gloss: "regla / estándar",        sample: "規則（きそく）" },
  { hex: "6cd5", char: "法", gloss: "ley / método",            sample: "法律（ほうりつ）" },
  { hex: "4fc2", char: "係", gloss: "encargado / relación",     sample: "係員（かかりいん）" },
  { hex: "65ad", char: "断", gloss: "cortar / decidir",         sample: "中断（ちゅうだん）" },
  { hex: "6ce8", char: "注", gloss: "verter / atención",        sample: "注意（ちゅうい）" },
  { hex: "610f", char: "意", gloss: "intención / significado",  sample: "意見（いけん）" },
  { hex: "9858", char: "願", gloss: "deseo / petición",         sample: "お願い（おねがい）" },
  { hex: "8a31", char: "許", gloss: "permitir",                 sample: "許可（きょか）" },
  { hex: "53ef", char: "可", gloss: "posible / aprobable",      sample: "可能（かのう）" },
];


/* ---------------- Helpers ---------------- */
function useChevron(open: boolean) {
  const anim = useRef(new Animated.Value(open ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: open ? 1 : 0, duration: 160, useNativeDriver: true }).start();
  }, [open]);
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  return rotate;
}

/* ---------------- Screen ---------------- */
export default function N3_Block1_Unit5Screen() {
  const navigation = useNavigation<Nav>();
  const { playCorrect, playWrong } = useFeedbackSounds();

  const heroH = 300;
  const scrollY = useRef(new Animated.Value(0)).current;
  const tY = scrollY.interpolate({ inputRange: [-100, 0, 200], outputRange: [-80, 60, 100] });
  const scale = scrollY.interpolate({ inputRange: [-100, 0], outputRange: [1.08, 1] });

  const speakJa = (t: string) =>
    Speech.speak(t, { language: "ja-JP", rate: 0.96, pitch: 1.05 });

  // Toggles
  const [openNakereba, setOpenNakereba] = useState(true);
  const [openNakuteha, setOpenNakuteha] = useState(false);
  const [openNaito, setOpenNaito] = useState(false);
  const [openNakutemoii, setOpenNakutemoii] = useState(false);

  const rNakereba = useChevron(openNakereba);
  const rNakuteha = useChevron(openNakuteha);
  const rNaito = useChevron(openNaito);
  const rNakutemoii = useChevron(openNakutemoii);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      {/* HERO */}
      <Animated.View style={[styles.heroWrap, { height: heroH }]}>
        {/* ⚠️ Reemplaza la ruta si usas otra imagen local */}
        <Animated.Image
          source={require("../../../assets/images/n3/b1_u5.webp")}
          // Sube tu foto (por ejemplo la que compartiste) a assets/images/n3/ como b1_u5.webp
          style={[styles.heroImg, { transform: [{ translateY: tY }, { scale }] }]}
          resizeMode="cover"
        />
        <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.45)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroContent}>
          <ExpoImage
            source={require("../../../assets/images/leon_blanco_transparente.webp")}
            style={styles.heroMark}
          />
          <Text style={styles.heroTitle}>{`BLOQUE ${BLOQUE} — ${TEMA_ES}`}</Text>
          <View style={styles.chipsRow}>
            {CHIPS.map((c) => (
              <View key={c} style={styles.chip}><Text style={styles.chipTxt}>{c}</Text></View>
            ))}
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: heroH + 12, paddingBottom: 48 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* RESUMEN */}
        <View style={styles.card}>
          <Text style={styles.h2}>📌 En una línea</Text>
          <Text style={styles.p}>
            <Text style={styles.bold}>〜なければならない／〜なくてはいけない／〜ないといけない</Text> = “tener que / deber”.{"  "}
            <Text style={styles.bold}>〜なくてもいい</Text> = “no hace falta / no es necesario”.
          </Text>

          <Text style={[styles.h3, { marginTop: 10 }]}>🧩 Patrones clave</Text>
          {[
            "V（ない）＋ければならない → 義務（más escrito）",
            "V（ない）＋くては いけない → 義務（habla común）",
            "V（ない）＋と いけない → 義務（coloquial）",
            "V（ない）＋くても いい → 不要・任意（no obligatorio）",
          ].map((p, i) => (
            <View key={i} style={styles.codeBlock}><Text style={styles.code}>{p}</Text></View>
          ))}
          <Text style={[styles.gray, { marginTop: 6 }]}>🎯 Objetivo: {OBJETIVO_ES}</Text>
        </View>

        {/* PRIMARIA */}
        <View style={styles.card}>
          <Text style={styles.h2}>💡 Gramática como en primaria</Text>
          <Text style={styles.h3}>Definiciones rápidas</Text>
          {PRIMARIA.definiciones.map((d, i) => (
            <View key={i} style={styles.liDot}><Text style={styles.p}><Text style={styles.bold}>{d.tag}</Text> — {d.exp}</Text></View>
          ))}
          <Text style={styles.h3}>Pistas para elegir</Text>
          {PRIMARIA.pistas.map((s, i) => (<View key={i} style={styles.liDot}><Text style={styles.p}>{s}</Text></View>))}
        </View>

        {/* COMPARACIÓN */}
        <View style={styles.card}>
          <Text style={styles.h2}>🔎 Comparación rápida</Text>
          {COMPARA.map((row, i) => (
            <View key={i} style={{ marginTop: 10 }}>
              <Text style={styles.jp}><Text style={styles.bold}>{row.patron}</Text> — {row.uso}</Text>
              <Text style={styles.romaji}>Forma: {row.forma}</Text>
              <Text style={styles.p}><Text style={styles.bold}>Ejemplo: </Text>{row.ok}</Text>
              <Text style={styles.es}>{row.es}</Text>
            </View>
          ))}
        </View>

        {/* EJEMPLOS CON TOGGLES */}
        <View style={styles.card}>
          <Text style={styles.h2}>🗣️ Ejemplos por gramática</Text>

          {/* 1) なければならない */}
          <Pressable onPress={() => setOpenNakereba(!openNakereba)} style={styles.toggleHeader}>
            <Text style={styles.h3}>1) 〜なければならない</Text>
            <Animated.View style={{ transform: [{ rotate: rNakereba }] }}>
              <MCI name="chevron-down" size={20} color="#0E1015" />
            </Animated.View>
          </Pressable>
          {openNakereba && EX_NAKEREBA.map((ex, i) => (
            <View key={`nkr-${i}`} style={styles.exampleRow}>
              <Pressable onPress={() => speakJa(ex.jp)} style={styles.playBtn}>
                <MCI name="volume-high" size={18} color="#fff" />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={styles.jp}>{ex.jp}</Text>
                <Text style={styles.romaji}>{ex.romaji}</Text>
                <Text style={styles.es}>{ex.es}</Text>
              </View>
            </View>
          ))}

          {/* 2) なくてはいけない */}
          <Pressable onPress={() => setOpenNakuteha(!openNakuteha)} style={styles.toggleHeader}>
            <Text style={styles.h3}>2) 〜なくてはいけない</Text>
            <Animated.View style={{ transform: [{ rotate: rNakuteha }] }}>
              <MCI name="chevron-down" size={20} color="#0E1015" />
            </Animated.View>
          </Pressable>
          {openNakuteha && EX_NAKUTEHA.map((ex, i) => (
            <View key={`nkth-${i}`} style={styles.exampleRow}>
              <Pressable onPress={() => speakJa(ex.jp)} style={styles.playBtn}>
                <MCI name="volume-high" size={18} color="#fff" />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={styles.jp}>{ex.jp}</Text>
                <Text style={styles.romaji}>{ex.romaji}</Text>
                <Text style={styles.es}>{ex.es}</Text>
              </View>
            </View>
          ))}

          {/* 3) ないといけない */}
          <Pressable onPress={() => setOpenNaito(!openNaito)} style={styles.toggleHeader}>
            <Text style={styles.h3}>3) 〜ないといけない（coloquial）</Text>
            <Animated.View style={{ transform: [{ rotate: rNaito }] }}>
              <MCI name="chevron-down" size={20} color="#0E1015" />
            </Animated.View>
          </Pressable>
          {openNaito && EX_NAITO.map((ex, i) => (
            <View key={`nt-${i}`} style={styles.exampleRow}>
              <Pressable onPress={() => speakJa(ex.jp)} style={styles.playBtn}>
                <MCI name="volume-high" size={18} color="#fff" />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={styles.jp}>{ex.jp}</Text>
                <Text style={styles.romaji}>{ex.romaji}</Text>
                <Text style={styles.es}>{ex.es}</Text>
              </View>
            </View>
          ))}

          {/* 4) なくてもいい */}
          <Pressable onPress={() => setOpenNakutemoii(!openNakutemoii)} style={styles.toggleHeader}>
            <Text style={styles.h3}>4) 〜なくてもいい（no es necesario）</Text>
            <Animated.View style={{ transform: [{ rotate: rNakutemoii }] }}>
              <MCI name="chevron-down" size={20} color="#0E1015" />
            </Animated.View>
          </Pressable>
          {openNakutemoii && EX_NAKUTEMOII.map((ex, i) => (
            <View key={`nmei-${i}`} style={styles.exampleRow}>
              <Pressable onPress={() => speakJa(ex.jp)} style={styles.playBtn}>
                <MCI name="volume-high" size={18} color="#fff" />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={styles.jp}>{ex.jp}</Text>
                <Text style={styles.romaji}>{ex.romaji}</Text>
                <Text style={styles.es}>{ex.es}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* KANJI DEL BLOQUE */}
        <View style={styles.card}>
          <Text style={styles.h2}>🈶 Kanji del bloque（10）</Text>
          <Text style={styles.p}>Toca “Trazos” para ver el orden; toca el altavoz para escuchar el compuesto.</Text>
          <View style={styles.kanjiGrid}>
            {KANJI.map((k) => (
              <KanjiCard key={k.hex} k={k} onSpeak={() => speakJa(k.sample)} />
            ))}
          </View>
        </View>

        {/* ORDENAR */}
        <View style={styles.card}>
          <Text style={styles.h2}>🧩 Construye la oración（並び替え）</Text>
          {ORDERS.map((o) => (<OrderQuestion key={o.id} q={o} onCorrect={() => {}} />))}
        </View>

        {/* QUIZ */}
        <View style={styles.card}>
          <Text style={styles.h2}>✅ Practica (elige la correcta)</Text>
          {QUIZ.map((q, idx) => (
            <QuizItem key={q.id} q={q} idx={idx} onResult={(ok)=> ok?playCorrect():playWrong()} />
          ))}
        </View>

        <View style={{ height: 8 }} />
        <Pressable style={styles.primaryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryBtnTxt}>Volver al curso</Text>
        </Pressable>
        <View style={{ height: 24 }} />
      </Animated.ScrollView>
    </View>
  );
}

/* ---------------- Subcomponentes ---------------- */
function OrderQuestion({ q, onCorrect }: { q: OrderQ; onCorrect: () => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [done, setDone] = useState<null | boolean>(null);
  const pool = useRef<string[]>([...q.tokens].sort(() => Math.random() - 0.5)).current;

  const speakJa = (t: string) =>
    Speech.speak(t, { language: "ja-JP", rate: 0.96, pitch: 1.05 });

  const onPick = (t: string) => {
    if (done !== null) return;
    const arr = [...picked, t];
    setPicked(arr);
    if (arr.length === q.tokens.length) {
      const ok = arr.join("") === q.tokens.join("");
      setDone(ok);
      if (ok) onCorrect();
    }
  };

  const undo = () => { if (done !== null) return; setPicked((a) => a.slice(0, -1)); };
  const reset = () => { setPicked([]); setDone(null); };

  const border = done === null ? "rgba(0,0,0,0.08)" : done ? "#10B981" : "#EF4444";
  const bg = done === null ? "transparent" : done ? "rgba(16,185,129,.12)" : "rgba(239,68,68,.12)";
  const col = done === null ? "#0E1015" : done ? "#0f9a6a" : "#c62828";

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.p}>{q.es}</Text>
      <View style={[styles.answerBox, { borderColor: border, backgroundColor: bg }]}>
        <Text style={[styles.jp, { color: col }]}>{picked.join("") || "　"}</Text>
      </View>
      <View style={styles.tokenRow}>
        {pool.map((t, i) => (
          <Pressable key={i} onPress={() => onPick(t)} style={styles.tokenBtn}>
            <Text style={styles.tokenTxt}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.kActions}>
        <Pressable onPress={undo} style={styles.kBtn}><Text style={styles.kBtnTxt}>Deshacer</Text></Pressable>
        <Pressable onPress={reset} style={styles.kBtn}><Text style={styles.kBtnTxt}>Reiniciar</Text></Pressable>
        <Pressable onPress={() => speakJa(q.jp)} style={styles.kIconBtn}>
          <MCI name="volume-high" size={18} color="#fff" />
        </Pressable>
      </View>
      {done !== null && (
        <Text style={[styles.gray, { marginTop: 6 }]}>
          <Text style={styles.bold}>Solución: </Text>{q.jp}（{q.romaji}）
        </Text>
      )}
    </View>
  );
}

function QuizItem({ q, idx, onResult }: { q: Q; idx: number; onResult: (ok:boolean)=>void }) {
  const [sel, setSel] = useState<string | null>(null);
  const done = sel !== null;

  const optStyle = (op: string) => {
    const pickedNow = sel === op;
    const border = !done ? "rgba(0,0,0,0.08)" : op === q.answer ? "#10B981" : pickedNow ? "#EF4444" : "rgba(0,0,0,0.08)";
    const bg = !done ? "transparent" : op === q.answer ? "rgba(16,185,129,.12)" : pickedNow ? "rgba(239,68,68,.12)" : "transparent";
    const col = done && op === q.answer ? "#0f9a6a" : done && pickedNow ? "#c62828" : "#0E1015";
    return { border, bg, col };
  };

  const onPick = (op: string) => {
    if (done) return;
    setSel(op);
    onResult(op === q.answer);
  };

  return (
    <View style={styles.qItem}>
      <Text style={styles.qStem}>{String(idx + 1).padStart(2, "0")}．{q.stem}</Text>
      <View style={styles.optRow}>
        {q.options.map((op) => {
          const s = optStyle(op);
          return (
            <Pressable key={op} onPress={() => onPick(op)} style={[styles.optBtn, { backgroundColor: s.bg, borderColor: s.border }]}>
              <Text style={[styles.optTxt, { color: s.col }]}>{op}</Text>
            </Pressable>
          );
        })}
      </View>
      {done && <Text style={styles.explain}><Text style={styles.bold}>Explicación: </Text>{q.explain}</Text>}
    </View>
  );
}

function KanjiCard({ k, onSpeak }: { k: Kanji; onSpeak: () => void }) {
  const [showStroke, setShowStroke] = useState(false);
  // Asegúrate de generar estos archivos con el script (hex_web.webp)
const REQ: Record<string, any> = {
  "5b88": require("../../../assets/kanjivg/n3/5b88_web.webp"), // 守
  "898f": require("../../../assets/kanjivg/n3/898f_web.webp"), // 規
  "6cd5": require("../../../assets/kanjivg/n3/6cd5_web.webp"), // 法
  "4fc2": require("../../../assets/kanjivg/n3/4fc2_web.webp"), // 係
  "65ad": require("../../../assets/kanjivg/n3/65ad_web.webp"), // 断
  "6ce8": require("../../../assets/kanjivg/n3/6ce8_web.webp"), // 注
  "610f": require("../../../assets/kanjivg/n3/610f_web.webp"), // 意
  "9858": require("../../../assets/kanjivg/n3/9858_web.webp"), // 願
  "8a31": require("../../../assets/kanjivg/n3/8a31_web.webp"), // 許
  "53ef": require("../../../assets/kanjivg/n3/53ef_web.webp"), // 可
};

  const src = REQ[k.hex];

  return (
    <View style={styles.kCard}>
      <View style={styles.kTop}>
        {!showStroke ? (
          <Text style={styles.kChar}>{k.char}</Text>
        ) : src ? (
          <ExpoImage source={src} style={{ width: "100%", height: "100%" }} contentFit="contain" />
        ) : (
          <Text style={styles.kChar}>{k.char}</Text>
        )}
      </View>
      <View style={styles.kMeta}>
        <Text style={styles.kGloss}>{k.gloss}</Text>
        <Text style={styles.kSample}>{k.sample}</Text>
      </View>
      <View style={styles.kActions}>
        <Pressable onPress={() => src && setShowStroke((s) => !s)} style={[styles.kBtn, { opacity: src ? 1 : 0.6 }]}>
          <Text style={styles.kBtnTxt}>{showStroke ? "Ocultar trazos" : "Trazos"}</Text>
        </Pressable>
        <Pressable onPress={onSpeak} style={styles.kIconBtn}>
          <MCI name="volume-high" size={18} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

/* ---------------- Styles ---------------- */
const R = 16;
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B0C0F" },
  heroWrap: { position: "absolute", left: 0, right: 0, top: 0, overflow: "hidden" },
  heroImg: { position: "absolute", width: "100%", height: "100%" },
  heroContent: { flex: 1, justifyContent: "flex-end", alignItems: "center", paddingBottom: 18 },
  heroMark: { width: 78, height: 78, marginBottom: 6, opacity: 0.95 },
  heroTitle: { color: "#fff", fontSize: 18, fontWeight: "900", textAlign: "center", paddingHorizontal: 12, textShadowColor: "rgba(0,0,0,.75)", textShadowRadius: 10 },
  chipsRow: { flexDirection: "row", gap: 8, marginTop: 6, flexWrap: "wrap", justifyContent: "center" },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.22)", borderWidth: 1, borderColor: "rgba(255,255,255,0.30)" },
  chipTxt: { color: "#fff", fontWeight: "800" },

  card: { marginHorizontal: 16, marginTop: 12, backgroundColor: "#fff", borderRadius: R, padding: 14, borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },
  h2: { fontSize: 16, fontWeight: "900", color: "#0E1015", marginBottom: 6 },
  h3: { fontSize: 14, fontWeight: "900", color: "#0E1015", marginTop: 2, marginBottom: 6 },
  p: { color: "#1f2330", lineHeight: 20 },
  bold: { fontWeight: "900" },
  gray: { color: "#6B7280" },
  codeBlock: { backgroundColor: "#0b0c0f", borderColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderRadius: 12, padding: 10, marginTop: 6 },
  code: { color: "#fff", fontWeight: "800", marginBottom: 4 },

  // Toggle header
  toggleHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6, marginTop: 8, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },

  exampleRow: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 10 },
  playBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: "#111827", alignItems: "center", justifyContent: "center" },
  jp: { fontSize: 15, fontWeight: "800", color: "#0E1015" },
  romaji: { color: "#6B7280", marginTop: 2 },
  es: { color: "#111827", marginTop: 2 },

  answerBox: { borderRadius: 10, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 12, marginTop: 8 },
  tokenRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  tokenBtn: { borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#F6F7FB" },
  tokenTxt: { fontWeight: "800", color: "#0E1015" },

  // Kanji grid
  kanjiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  kCard: { width: "48%", borderRadius: 14, borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", padding: 10 },
  kTop: { height: 110, borderRadius: 10, backgroundColor: "#F6F7FB", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  kChar: { fontSize: 64, fontWeight: "900", color: "#0E1015" },
  kMeta: { marginTop: 8 },
  kGloss: { fontWeight: "900", color: "#0E1015" },
  kSample: { color: "#6B7280", marginTop: 2 },
  kActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  kBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: "#0E1015" },
  kBtnTxt: { color: "#fff", fontWeight: "900" },
  kIconBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: "#111827", alignItems: "center", justifyContent: "center" },

  qItem: { marginTop: 12 },
  qStem: { fontWeight: "800", color: "#0E1015", marginBottom: 8 },
  optRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  optBtn: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  optTxt: { fontWeight: "800" },
  explain: { color: "#1f2330", marginTop: 6 },

  primaryBtn: { marginHorizontal: 16, backgroundColor: "#AF0F2A", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  primaryBtnTxt: { color: "#fff", fontWeight: "900" },

  liDot: { paddingLeft: 10, borderLeftWidth: 3, borderLeftColor: "#E5E7EB", marginVertical: 4 },
  liCross: { paddingLeft: 10, borderLeftWidth: 3, borderLeftColor: "#FCA5A5", marginVertical: 4 },
});
