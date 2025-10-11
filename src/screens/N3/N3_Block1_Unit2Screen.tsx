// src/screens/N3/N3_Block1_Unit2Screen.tsx
// Kanji propuestos (hex): 670d, 5225, 610f, 9078, 7d9a, 7d50, 5a5a, 7531, 90fd, 90e8
// Asegúrate de tener los assets como assets/kanjivg/n3/<hex>_web.webp

import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFeedbackSounds } from "../../../src/hooks/useFeedbackSounds";

type RootStackParamList = {
  N3_Unit: { block: number; unit: number; title: string } | undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_Unit">;
type Ex = { jp: string; romaji: string; es: string };
type Q = { id: number; stem: string; options: string[]; answer: string; explain: string };
type Kanji = { hex: string; char: string; gloss: string; sample: string };
type OrderQ = { id: number; jp: string; romaji: string; es: string; tokens: string[] };

// =================== Datos: Kanji ===================
const KANJI: Kanji[] = [
  { hex: "670d", char: "服", gloss: "ropa / obedecer",   sample: "制服（せいふく）" },
  { hex: "5225", char: "別", gloss: "separar / distinto", sample: "特別（とくべつ）" },
  { hex: "610f", char: "意", gloss: "intención / idea",   sample: "意見（いけん）" },
  { hex: "9078", char: "選", gloss: "elegir",             sample: "選択（せんたく）" },
  { hex: "7d9a", char: "続", gloss: "continuar",          sample: "連続（れんぞく）" },
  { hex: "7d50", char: "結", gloss: "atado / resultado",  sample: "結果（けっか）" },
  { hex: "5a5a", char: "婚", gloss: "matrimonio",         sample: "結婚（けっこん）" },
  { hex: "7531", char: "由", gloss: "origen / razón",     sample: "理由（りゆう）" },
  { hex: "90fd", char: "都", gloss: "ciudad / conveniencia", sample: "都合（つごう）" },
  { hex: "90e8", char: "部", gloss: "sección / club",     sample: "部長（ぶちょう）" },
];

// =================== Datos: Ejemplos ===================
const EXAMPLES: Ex[] = [
  { jp: "来年日本に留学することにしました。", romaji: "rainen nihon ni ryūgaku suru koto ni shimashita", es: "Decidí estudiar en Japón el próximo año." },
  { jp: "会議は来週の月曜日に行うことになった。", romaji: "kaigi wa raishū no getsuyōbi ni okonau koto ni natta", es: "Se decidió que la reunión será el lunes próximo." },
  { jp: "健康のため、毎朝走ることにしている。", romaji: "kenkō no tame, mai-asa hashiru koto ni shite iru", es: "Por salud, tengo por costumbre correr cada mañana." },
  { jp: "予算の都合で、計画を変更することになりました。", romaji: "yosan no tsugō de, keikaku o henkō suru koto ni narimashita", es: "Por presupuesto, se decidió cambiar el plan." },
  { jp: "甘い物を控えることにした。", romaji: "amai mono o hikaeru koto ni shita", es: "Decidí reducir los dulces." },
  { jp: "雨のため、試合は中止することになった。", romaji: "ame no tame, shiai wa chūshi suru koto ni natta", es: "Por la lluvia, se decidió suspender el partido." },
  { jp: "会社の規則で、土曜は出勤することになっています。", romaji: "kaisha no kisoku de, doyō wa shukkin suru koto ni natte imasu", es: "Por norma de la empresa, los sábados se trabaja." },
  { jp: "チームで話し合って、A案を採用することにした。", romaji: "chīmu de hanashiatte, A-an o saiyō suru koto ni shita", es: "El equipo decidió adoptar la propuesta A." },
  { jp: "上司の判断で、締め切りを延ばすことになった。", romaji: "jōshi no handan de, shimekiri o nobasu koto ni natta", es: "Por decisión del jefe, se extendió el plazo." },
  { jp: "環境のために、エコバッグを使うことにしています。", romaji: "kankyō no tame ni, ekobaggu o tsukau koto ni shite imasu", es: "Por el ambiente, suelo usar bolsa reutilizable." },
  { jp: "新しいプロジェクトを担当することになりました。", romaji: "atarashii purojekuto o tantō suru koto ni narimashita", es: "Me asignaron un nuevo proyecto." },
  { jp: "家族と相談して、引っ越すことにした。", romaji: "kazoku to sōdan shite, hikkosu koto ni shita", es: "Tras hablar con mi familia, decidí mudarme." },
  { jp: "在宅勤務は週2回にすることになった。", romaji: "zaitaku kinmu wa shū ni-kai ni suru koto ni natta", es: "Se decidió que el trabajo remoto será dos veces por semana." },
  { jp: "健康診断の結果、しばらく運動を控えることになった。", romaji: "kenkō shindan no kekka, shibaraku undō o hikaeru koto ni natta", es: "Por los resultados médicos, debo evitar ejercicio un tiempo." },
  { jp: "大学では経済を専攻することにしました。", romaji: "daigaku de wa keizai o senkō suru koto ni shimashita", es: "Decidí especializarme en economía." },
];

// =================== Datos: Ordenar y Quiz ===================
const ORDERS: OrderQ[] = [
  { id: 1, jp: "来年日本に留学することにしました。", romaji: "rainen nihon ni ryūgaku suru koto ni shimashita", es: "Decidí estudiar en Japón el próximo año.", tokens: ["来年","日本","に","留学","する","ことに","しました。"] },
  { id: 2, jp: "会議は来週の月曜日に行うことになった。", romaji: "kaigi wa raishū no getsuyōbi ni okonau koto ni natta", es: "Se decidió que la reunión será el lunes próximo.", tokens: ["会議","は","来週","の","月曜日","に","行う","ことに","なった。"] },
  { id: 3, jp: "毎朝走ることにしている。", romaji: "mai-asa hashiru koto ni shite iru", es: "Tengo por costumbre correr cada mañana.", tokens: ["毎朝","走る","ことに","している。"] },
  { id: 4, jp: "A案を採用することにした。", romaji: "A an o saiyō suru koto ni shita", es: "Decidí adoptar la propuesta A.", tokens: ["A案","を","採用","する","ことに","した。"] },
  { id: 5, jp: "新しいプロジェクトを担当することになりました。", romaji: "atarashii purojekuto o tantō suru koto ni narimashita", es: "Me asignaron un nuevo proyecto.", tokens: ["新しい","プロジェクト","を","担当","する","ことに","なりました。"] },
];

const QUIZ: Q[] = [
  { id: 1,  stem: "会社の方針で、来月から制服を変える___。", options: ["ことにする","ことになる","ことにしている"], answer: "ことになる", explain: "Decisión externa / regla → ことになる" },
  { id: 2,  stem: "健康のため、毎朝ストレッチをする___。",     options: ["ことにする","ことになる","ことにしている"], answer: "ことにしている", explain: "Hábito establecido → ことにしている" },
  { id: 3,  stem: "家族と相談して、引っ越す___。",             options: ["ことにする","ことになる","ことにしている"], answer: "ことにする", explain: "Decisión propia → ことにする" },
  { id: 4,  stem: "台風の影響で、イベントは中止する___。",       options: ["ことにする","ことになる","ことにしている"], answer: "ことになる", explain: "Circunstancia externa → ことになる" },
  { id: 5,  stem: "出費を減らすため、外食を控える___。",        options: ["ことにする","ことになる","ことにしている"], answer: "ことにする", explain: "Decisión del hablante → ことにする" },
  { id: 6,  stem: "このクラスでは、毎週小テストを行う___。",     options: ["ことにする","ことになる","ことにしている"], answer: "ことになる", explain: "Regla establecida (frecuente: ことになっている)" },
  { id: 7,  stem: "医者に言われて、甘い物を控える___。",         options: ["ことにする","ことになる","ことにしている"], answer: "ことになる", explain: "Indicación externa (médico) → ことになる" },
  { id: 8,  stem: "チームで話し合い、A案を採用する___。",        options: ["ことにする","ことになる","ことにしている"], answer: "ことにする", explain: "Decisión del grupo con el hablante → ことにする" },
  { id: 9,  stem: "ダイエット中なので、夜食は食べない___。",      options: ["ことにする","ことになる","ことにしている"], answer: "ことにしている", explain: "Regla personal habitual → ことにしている" },
  { id: 10, stem: "不具合のため、アプリを一時停止する___。",       options: ["ことにする","ことになる","ことにしている"], answer: "ことになる", explain: "Resultado por circunstancias técnicas → ことになる" },
  { id: 11, stem: "来学期は経済学を専攻する___。",               options: ["ことにする","ことになる","ことにしている"], answer: "ことにする", explain: "Decisión académica → ことにする" },
  { id: 12, stem: "会社の規則で、残業は申請が必要な___。",        options: ["ことにする","ことになる","ことにしている"], answer: "ことになる", explain: "Norma/reglamento (frecuente: ことになっている)" },
  { id: 13, stem: "環境のために、車ではなく自転車に乗る___。",    options: ["ことにする","ことになる","ことにしている"], answer: "ことにしている", explain: "Hábito/decisión sostenida → ことにしている" },
  { id: 14, stem: "上司の判断で、締め切りを一週間延ばす___。",     options: ["ことにする","ことになる","ことにしている"], answer: "ことになる", explain: "Decisión ajena al hablante → ことになる" },
  { id: 15, stem: "健康診断の結果、しばらく運動を控える___。",      options: ["ことにする","ことになる","ことにしている"], answer: "ことになる", explain: "Resultado impuesto por el médico → ことになる" },
];

// =================== Datos: Gramática como en primaria ===================
const PRIMARIA = {
  definiciones: [
    { tag: "ことにする", simple: "Yo decido.", extra: "Decisión personal, voluntaria.", ej: "来月から走ることにする。→ \"(Yo) decido correr desde el mes que viene\"." },
    { tag: "ことになる", simple: "Otros deciden / la situación decide.", extra: "Regla, orden, resultado inevitable.", ej: "雨で試合は中止することになった。→ \"Por la lluvia, se decidió suspender el partido\"." },
    { tag: "ことにしている", simple: "Hábito por decisión propia.", extra: "Una decisión que mantienes en el tiempo.", ej: "毎朝６時に起きることにしている。→ \"Tengo por costumbre levantarme a las 6\"." },
    { tag: "ことになっている", simple: "Regla/hábito institucional.", extra: "Norma establecida por un sistema.", ej: "この会社では土曜も出勤することになっている。→ \"En esta empresa se trabaja los sábados\"." },
    { tag: "こととなる", simple: "Forma formal de ことになる.", extra: "Aparece en anuncios/escritos formales.", ej: "本件は来月より適用されることとなる。→ \"Esto pasará a aplicarse desde el próximo mes\"." },
  ],
  cuandoUsar: [
    { k: "¿Quién toma la decisión?", v: "Yo/grupo con hablante → ことにする.  Otros/reglas/hechos → ことになる." },
    { k: "¿Es costumbre?", v: "Personal → ことにしている.  Institucional → ことになっている." },
    { k: "¿Tono formal?", v: "Usa こととなる (≈ ことになる formal)." },
  ],
  señalesDeTexto: [
    "会社の方針で… / 規則で… / 上司の判断で… → ことになる",
    "〜ため（de salud/dinero/ambiente）に（自分）… → ことにする／ことにしている",
    "結果 / 都合 / 事情 / 天候 / 不具合 → ことになる",
  ],
  conj: [
    { rotulo: "ことにする（decisión propia）", filas: [
      { patron: "V dic. + ことにする", ejemplo: "留学することにする（decidir estudiar fuera）" },
      { patron: "V-ない + ことにする", ejemplo: "食べないことにする（decidir no comer）" },
      { patron: "Pasado (decisión tomada)", ejemplo: "〜ことにした（ya decidí）" },
      { patron: "Formal", ejemplo: "〜ことにします（decido / decidiré）" },
    ]},
    { rotulo: "ことになる（decisión externa/resultado）", filas: [
      { patron: "V dic. + ことになる", ejemplo: "中止することになる（se decidirá suspender）" },
      { patron: "V-ない + ことになる", ejemplo: "行かないことになる（se decidirá no ir）" },
      { patron: "Pasado (ya decidido por otros)", ejemplo: "〜ことになった" },
      { patron: "Muy formal", ejemplo: "〜こととなる" },
    ]},
    { rotulo: "Hábito", filas: [
      { patron: "（personal）V dic./V-ない + ことにしている", ejemplo: "走る／走らないことにしている" },
      { patron: "（regla）V dic./V-ない + ことになっている", ejemplo: "休む／休まないことになっている" },
    ]},
  ],
  contrastes: [
    { a: "ことにする", b: "ことになる", diff: "¿Quién decide? Yo vs. otros/las circunstancias." },
    { a: "ことにしている", b: "ことになっている", diff: "Hábito personal vs. regla del sistema." },
    { a: "ことになる", b: "こととなる", diff: "Neutro coloquial vs. formal (documentos/comunicados)." },
  ],
  errores: [
    "❌ Decir ことにする cuando claramente decide la empresa/otra persona. ✔ Usa ことになる / ことになっている.",
    "❌ Usar ことになる para hábito personal. ✔ Usa ことにしている.",
    "❌ Mezclar pasado/actual: 〜ことにした (decisión ya tomada) vs 〜ことにする (decido ahora).",
  ],
  arbol: [
    { q: "¿Decido YO ahora?", r: "→ ことにする / （pasado）ことにした" },
    { q: "¿Lo decidió OTRO / es regla / fue el clima?", r: "→ ことになる / （pasado）ことになった" },
    { q: "¿Es costumbre MÍA?", r: "→ ことにしている" },
    { q: "¿Es regla de la escuela/empresa?", r: "→ ことになっている" },
    { q: "¿Necesito tono muy formal?", r: "→ こととなる" },
  ],
  miniPares: [
    { jpA: "来月から禁煙することにした。", esA: "Decidí dejar de fumar desde el mes que viene.",
      jpB: "健康診断の結果、禁煙することになった。", esB: "Por el resultado médico, se decidió que deje de fumar." },
    { jpA: "毎朝走ることにしている。", esA: "Tengo por costumbre correr cada mañana.",
      jpB: "この部活では毎朝走ることになっている。", esB: "En este club hay la regla de correr cada mañana." },
  ],
};

// =================== Pantalla ===================
export default function N3_Block1_Unit2Screen() {
  const navigation = useNavigation<Nav>();
  const { playCorrect, playWrong } = useFeedbackSounds();

  const heroH = 300;
  const scrollY = useRef(new Animated.Value(0)).current;
  const tY = scrollY.interpolate({ inputRange: [-100, 0, 200], outputRange: [-80, 60, 100] });
  const scale = scrollY.interpolate({ inputRange: [-100, 0], outputRange: [1.08, 1] });

  const speakJa = (t: string) =>
    Speech.speak(t, { language: "ja-JP", rate: 0.96, pitch: 1.05 });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      {/* HERO */}
      <Animated.View style={[styles.heroWrap, { height: heroH }]}>
        <Animated.Image
          source={require("../../../assets/images/n3/b1_u2.webp")}
          style={[styles.heroImg, { transform: [{ translateY: tY }, { scale }] }]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.45)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroContent}>
          <ExpoImage
            source={require("../../../assets/images/leon_blanco_transparente.webp")}
            style={styles.heroMark}
          />
          <Text style={styles.heroTitle}>BLOQUE 1 — Decisiones & cambios</Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipTxt}>ことになる</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>ことにする</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>ことにしている</Text></View>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: heroH + 12, paddingBottom: 48 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* RESUMEN RÁPIDO */}
        <View style={styles.card}>
          <Text style={styles.h2}>📌 En una línea</Text>
          <Text style={styles.p}>
            <Text style={styles.bold}>ことにする</Text> = decisión propia.{"  "}
            <Text style={styles.bold}>ことになる</Text> = decisión externa / resultado / regla.{"  "}
            <Text style={styles.bold}>ことにしている</Text> = hábito personal.{"  "}
            <Text style={styles.bold}>ことになっている</Text> = regla establecida.
          </Text>

          <Text style={[styles.h3, { marginTop: 12 }]}>🧩 Patrones clave</Text>
          {[
            "V（辞書形）＋ことにする ／ V（ない形）＋ことにする",
            "V（辞書形）＋ことになる ／ V（ない形）＋ことになる",
            "V（辞書形/ない）＋ことにしている",
            "V（辞書形/ない）＋ことになっている",
            "（フォーマル）〜こととなる",
            "過去：〜ことにした／〜ことになった",
          ].map((p, i) => (
            <View key={i} style={styles.codeBlock}>
              <Text style={styles.code}>{p}</Text>
            </View>
          ))}

          <Text style={[styles.h3, { marginTop: 12 }]}>🔤 Mini-guía</Text>
          {[
            { k: "¿Quién decide?", v: "Yo→ことにする / Otros・regla→ことになる" },
            { k: "Hábito", v: "Personal→ことにしている / Institucional→ことになっている" },
            { k: "Formalidad", v: "Documento oficial→こととなる" },
          ].map((it, i) => (
            <Text key={i} style={styles.p}><Text style={styles.bold}>{it.k}:</Text> {it.v}</Text>
          ))}
        </View>

        {/* 💡 GRAMÁTICA COMO EN PRIMARIA (NUEVO) */}
        <View style={styles.card}>
          <Text style={styles.h2}>💡 Gramática como en primaria</Text>

          {/* Definiciones */}
          <Text style={styles.h3}>1) Definiciones fáciles</Text>
          {PRIMARIA.definiciones.map((d, i) => (
            <View key={i} style={styles.blockRow}>
              <Text style={styles.tag}>{d.tag}</Text>
              <Text style={styles.p}><Text style={styles.bold}>{d.simple}</Text> — {d.extra}</Text>
              <Text style={styles.gray}>{d.ej}</Text>
            </View>
          ))}

          {/* Cuándo usar */}
          <Text style={styles.h3}>2) ¿Cuándo usar cada una?</Text>
          {PRIMARIA.cuandoUsar.map((x, i) => (
            <Text key={i} style={styles.p}><Text style={styles.bold}>{x.k}:</Text> {x.v}</Text>
          ))}

          {/* Señales de texto */}
          <Text style={styles.h3}>3) Señales que te ayudan a elegir</Text>
          {PRIMARIA.señalesDeTexto.map((s, i) => (
            <View key={i} style={styles.liDot}><Text style={styles.p}>{s}</Text></View>
          ))}

          {/* Conjugación práctica */}
          <Text style={styles.h3}>4) Conjugación práctica (patrones + ejemplo)</Text>
          {PRIMARIA.conj.map((tbl, i) => (
            <View key={i} style={[styles.table, { marginTop: 6 }]}>
              <Text style={styles.tableTitle}>{tbl.rotulo}</Text>
              {tbl.filas.map((f, j) => (
                <View key={j} style={styles.tr}>
                  <Text style={[styles.td, { flex: 1.1 }]}>{f.patron}</Text>
                  <Text style={[styles.td, { flex: 1 }]}>{f.ejemplo}</Text>
                </View>
              ))}
            </View>
          ))}

          {/* Contrastes */}
          <Text style={styles.h3}>5) Diferencias importantes</Text>
          {PRIMARIA.contrastes.map((c, i) => (
            <View key={i} style={styles.contrastRow}>
              <Text style={[styles.tag, { backgroundColor: "#F1F5F9", color: "#0E1015" }]}>{c.a}</Text>
              <Text style={styles.vs}>vs</Text>
              <Text style={[styles.tag, { backgroundColor: "#F1F5F9", color: "#0E1015" }]}>{c.b}</Text>
              <Text style={[styles.p, { marginTop: 6 }]}>{c.diff}</Text>
            </View>
          ))}

          {/* Errores comunes */}
          <Text style={styles.h3}>6) Errores comunes</Text>
          {PRIMARIA.errores.map((e, i) => (
            <View key={i} style={styles.liCross}><Text style={styles.p}>{e}</Text></View>
          ))}

          {/* Árbol rápido */}
          <Text style={styles.h3}>7) Árbol rápido de decisión</Text>
          {PRIMARIA.arbol.map((a, i) => (
            <View key={i} style={styles.treeRow}>
              <Text style={styles.treeQ}>{a.q}</Text>
              <Text style={styles.treeA}>{a.r}</Text>
            </View>
          ))}

          {/* Pares mínimos (comparar significado) */}
          <Text style={styles.h3}>8) Pares mínimos (mismo tema, distinto matiz)</Text>
          {PRIMARIA.miniPares.map((p, i) => (
            <View key={i} style={styles.miniPair}>
              <Text style={styles.jp}>{p.jpA}</Text>
              <Text style={styles.es}>→ {p.esA}</Text>
              <Text style={[styles.jp, { marginTop: 6 }]}>{p.jpB}</Text>
              <Text style={styles.es}>→ {p.esB}</Text>
            </View>
          ))}
        </View>

        {/* EJEMPLOS CON AUDIO */}
        <View style={styles.card}>
          <Text style={styles.h2}>🗣️ Ejemplos (toca el altavoz)</Text>
          {EXAMPLES.map((ex, i) => (
            <View key={i} style={styles.exampleRow}>
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
          <Text style={styles.p}>Toca “Trazos” para ver el orden y el ejemplo; toca el altavoz para escuchar el compuesto.</Text>
          <View style={styles.kanjiGrid}>
            {KANJI.map((k) => (
              <KanjiCard key={k.hex} k={k} onSpeak={() => speakJa(k.sample)} />
            ))}
          </View>
        </View>

        {/* ORDENAR */}
        <View style={styles.card}>
          <Text style={styles.h2}>🧩 Construye la oración（並び替え）</Text>
          {ORDERS.map((o) => (
            <OrderQuestion key={o.id} q={o} onCorrect={() => {}} />
          ))}
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

/* ============ Subcomponentes ============ */
function KanjiCard({ k, onSpeak }: { k: Kanji; onSpeak: () => void }) {
  const [showStroke, setShowStroke] = useState(false);

  // ⚠️ Asegúrate de que estos archivos EXISTAN.
  const REQ: Record<string, any> = {
    "670d": require("../../../assets/kanjivg/n3/670d_web.webp"),
    "5225": require("../../../assets/kanjivg/n3/5225_web.webp"),
    "610f": require("../../../assets/kanjivg/n3/610f_web.webp"),
    "9078": require("../../../assets/kanjivg/n3/9078_web.webp"),
    "7d9a": require("../../../assets/kanjivg/n3/7d9a_web.webp"),
    "7d50": require("../../../assets/kanjivg/n3/7d50_web.webp"),
    "5a5a": require("../../../assets/kanjivg/n3/5a5a_web.webp"),
    "7531": require("../../../assets/kanjivg/n3/7531_web.webp"),
    "90fd": require("../../../assets/kanjivg/n3/90fd_web.webp"),
    "90e8": require("../../../assets/kanjivg/n3/90e8_web.webp"),
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

function OrderQuestion({ q, onCorrect }: { q: OrderQ; onCorrect: () => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [done, setDone] = useState<null | boolean>(null); // null = en curso; true ok; false mal

  const pool = useRef<string[]>(
    [...q.tokens].sort(() => Math.random() - 0.5)
  ).current;

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

  const undo = () => {
    if (done !== null) return;
    setPicked((a) => a.slice(0, -1));
  };
  const reset = () => {
    setPicked([]);
    setDone(null);
  };

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

// =================== Estilos ===================
const R = 16;
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B0C0F" },
  heroWrap: { position: "absolute", left: 0, right: 0, top: 0, overflow: "hidden" },
  heroImg: { position: "absolute", width: "100%", height: "100%" },
  heroContent: { flex: 1, justifyContent: "flex-end", alignItems: "center", paddingBottom: 18 },
  heroMark: { width: 78, height: 78, marginBottom: 6, opacity: 0.95 },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "900", textShadowColor: "rgba(0,0,0,.75)", textShadowRadius: 10 },
  chipsRow: { flexDirection: "row", gap: 8, marginTop: 6 },
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

  blockRow: { paddingVertical: 6, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
  tag: { alignSelf: "flex-start", backgroundColor: "#0E1015", color: "#fff", fontWeight: "900", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 6 },
  liDot: { paddingLeft: 10, borderLeftWidth: 3, borderLeftColor: "#E5E7EB", marginVertical: 4 },
  liCross: { paddingLeft: 10, borderLeftWidth: 3, borderLeftColor: "#FCA5A5", marginVertical: 4 },

  table: { borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", borderRadius: 10, overflow: "hidden" },
  tableTitle: { backgroundColor: "#F8FAFC", paddingHorizontal: 10, paddingVertical: 8, fontWeight: "900", color: "#0E1015" },
  tr: { flexDirection: "row", gap: 10, paddingHorizontal: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
  td: { color: "#1f2330", flexWrap: "wrap" },
  contrastRow: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
  vs: { marginHorizontal: 8, fontWeight: "900", color: "#6B7280" },
  treeRow: { paddingVertical: 6, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
  treeQ: { fontWeight: "900", color: "#0E1015" },
  treeA: { color: "#1f2330" },

  exampleRow: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 10 },
  playBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: "#111827", alignItems: "center", justifyContent: "center" },
  jp: { fontSize: 15, fontWeight: "800", color: "#0E1015" },
  romaji: { color: "#6B7280", marginTop: 2 },
  es: { color: "#111827", marginTop: 2 },

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

  answerBox: { borderRadius: 10, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 12, marginTop: 8 },
  tokenRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  tokenBtn: { borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#F6F7FB" },
  tokenTxt: { fontWeight: "800", color: "#0E1015" },

  qItem: { marginTop: 12 },
  qStem: { fontWeight: "800", color: "#0E1015", marginBottom: 8 },
  optRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  optBtn: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  optTxt: { fontWeight: "800" },
  explain: { color: "#1f2330", marginTop: 6 },

  primaryBtn: { marginHorizontal: 16, backgroundColor: "#AF0F2A", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  primaryBtnTxt: { color: "#fff", fontWeight: "900" },
});
