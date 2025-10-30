// src/screens/N2/N2_B5_U2.tsx
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useMemo, useState } from "react";
import { Alert, Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";
import UnitTemplate from "./UnitTemplate";

const { width } = Dimensions.get("window");
const accent = "#0EA5E9";
const BG = "#0B0F19";
const BORDER = "rgba(255,255,255,0.08)";

function speakJP(t: string) {
  try { Speech.stop(); Speech.speak(t, { language: "ja-JP", rate: 1.0 }); } catch {}
}
function speakES(t: string) {
  try { Speech.stop(); Speech.speak(t, { language: "es-MX", rate: 1.0 }); } catch {}
}

/* ===================== Guía ===================== */
type Ex = { jp: string; yomi: string; es: string };
const GUIA: {
  tag: string;
  descES: string;
  puntos: string[];
  ejemplos: Ex[];
}[] = [
  {
    tag: "共感・気遣い（きづかい）",
    descES: "Empatía/cuidado: cuando alguien está enfermo, cansado o tuvo un problema.",
    puntos: [
      "お大事に：a un enfermo. / お疲れ様です：reconocer esfuerzo.",
      "ご無理のないように：Que no se fuerce; tómelo con calma.",
      "ご自愛ください：Cuídese (cierre formal de correo).",
    ],
    ejemplos: [
      { jp: "どうぞお大事に。", yomi: "どうぞ おだいじに。", es: "Que se mejore pronto." },
      { jp: "ご無理のないようにお願いします。", yomi: "ごむり の ない ように おねがいします。", es: "Por favor, sin forzarse." },
    ],
  },
  {
    tag: "謝罪・配慮（はいりょ）",
    descES: "Disculpas y consideración: evita culpar, ofrece solución.",
    puntos: [
      "申し訳ございません：disculpa muy formal.",
      "差し支えなければ：si no es inconveniente… (peticiones suaves).",
      "お手数をおかけしますが：lamento las molestias, pero…",
    ],
    ejemplos: [
      { jp: "ご迷惑をおかけして申し訳ございません。", yomi: "ごめいわく を おかけして もうしわけ ございません。", es: "Disculpe las molestias." },
      { jp: "差し支えなければ、本日中にご返信いただけますか。", yomi: "さしつかえ なければ、ほんじつちゅう に ごへんしん いただけます か。", es: "Si no es inconveniente, ¿podría responder hoy?" },
    ],
  },
];

/* ===================== Actividad 1: Situación → mejor frase ===================== */
type Choice = { jp: string; yomi: string; es: string; why: string; correct: boolean };
type Case = { id: string; sitJP: string; yomi: string; choices: Choice[] };

const CASOS: Case[] = [
  {
    id: "c1",
    sitJP: "同僚が風邪でつらそう。何と言う？",
    yomi: "どうりょう が かぜ で つらそう。なん と いう？",
    choices: [
      { jp: "お大事に。早く良くなってください。", yomi: "おだいじに。はやく よく なって ください。", es: "Que se mejore pronto.", why: "Frase estándar de empatía por enfermedad.", correct: true },
      { jp: "頑張れ。", yomi: "がんばれ。", es: "¡Échale ganas!", why: "Puede sonar brusco.", correct: false },
      { jp: "忙しいから我慢して。", yomi: "いそがしい から がまん して。", es: "Aguanta, estamos ocupados.", why: "Inadecuado, cero empatía.", correct: false },
    ],
  },
  {
    id: "c2",
    sitJP: "先方に手間をかける依頼。どう前置きする？",
    yomi: "せんぽう に てま を かける いらい。どう まえおき する？",
    choices: [
      { jp: "お手数をおかけして恐縮ですが、", yomi: "おてすう を おかけして きょうしゅく ですが、", es: "Lamento las molestias, pero…", why: "Fórmula cortés para pedir algo laborioso.", correct: true },
      { jp: "ちょっとお願い。", yomi: "ちょっと おねがい。", es: "Oye, un favor.", why: "Demasiado casual.", correct: false },
      { jp: "今すぐやって。", yomi: "いますぐ やって。", es: "Hazlo ya.", why: "Imperativo grosero.", correct: false },
    ],
  },
];

/* ===================== Actividad 2: Quiz (16) ===================== */
type Q = { id: string; stem: string; options: string[]; answer: number; explain: string };
const QUIZ: Q[] = [
  { id: "q1", stem: "“Lo siento mucho” (muy formal)", options: ["すみません", "ごめんなさい", "申し訳ございません"], answer: 2, explain: "Más alto que すみません / ごめんなさい." },
  { id: "q2", stem: "“Si no es molestia…”", options: ["もしよかったら", "差し支えなければ", "別に"], answer: 1, explain: "Suaviza petición educadamente." },
  { id: "q3", stem: "Cierre amable de correo", options: ["よろしく", "ご自愛ください", "じゃね"], answer: 1, explain: "Carta/correo formal." },
  { id: "q4", stem: "“Gracias por su esfuerzo”", options: ["お疲れ様です", "頑張れ", "どうも"], answer: 0, explain: "Reconoce trabajo/horario." },
  { id: "q5", stem: "Mitigar directivo", options: ["今すぐやってください", "可能でしたらご対応いただけますでしょうか", "はやく！"], answer: 1, explain: "Petición en super-cortés." },
  { id: "q6", stem: "Empatía por pérdida", options: ["残念", "お悔やみ申し上げます", "まじか"], answer: 1, explain: "Condolencias formales." },
  { id: "q7", stem: "Enfermedad de cliente", options: ["お大事にしてください", "気にしないで", "早く来て"], answer: 0, explain: "Cuidado/respeto." },
  { id: "q8", stem: "Agradecer atención recibida", options: ["ありがとうございます", "誠にありがとうございます", "ありがと"], answer: 1, explain: "‘誠に’ eleva el registro." },
  { id: "q9", stem: "Pedir confirmación", options: ["見てください", "ご確認のほどお願いいたします", "見ろ"], answer: 1, explain: "Fórmula fija." },
  { id: "q10", stem: "Invitar a no forzarse", options: ["ご無理のないように", "我慢して", "すぐやって"], answer: 0, explain: "Cuidado/empatía." },
  { id: "q11", stem: "Abrir con consideración", options: ["突然ですが", "恐れ入りますが", "てかさ"], answer: 1, explain: "恐れ入りますが = muy cortés." },
  { id: "q12", stem: "Disculparse por tardar", options: ["遅くなりました", "返信が遅れ、申し訳ございません", "返事遅い？"], answer: 1, explain: "Disculpa + causa." },
  { id: "q13", stem: "Suavizar rechazo", options: ["できません", "難しい状況でして", "無理"], answer: 1, explain: "Explica y suaviza." },
  { id: "q14", stem: "Pedir tiempo", options: ["少々お待ちください", "待って", "ちょっと"], answer: 0, explain: "少々 = cortés." },
  { id: "q15", stem: "Derivar a otra persona", options: ["別の人に聞いて", "担当へおつなぎいたします", "知らない"], answer: 1, explain: "‘おつなぎいたします’ humilde." },
  { id: "q16", stem: "Cerrar correo", options: ["以上", "何卒よろしくお願いいたします", "じゃ"], answer: 1, explain: "何卒 = fórmula alta." },
];

/* ===================== Actividad 3: Sube de registro (con guía y explicación por opción) ===================== */
type Trio = {
  id: string;
  title: string; // micro-situación
  opts: {
    jp: string;
    yomi: string;
    rank: number; // 1 bajo, 2 medio, 3 alto
    uso: string;  // cuándo usarla
    ejemplo: string; // ejemplo breve
  }[];
  best: number; // índice de la mejor
  why: string;  // por qué la mejor es superior
};

const RANKER: Trio[] = [
  {
    id: "r1",
    title: "Confirmar recepción/entendimiento",
    opts: [
      { jp: "わかりました。", yomi: "わかりました。", rank: 1, uso: "Neutral cotidiano. Con colegas o trato cercano. Evítalo con cliente/superior en correos formales.", ejemplo: "わかりました。また連絡します。" },
      { jp: "了解です。", yomi: "りょうかい です。", rank: 2, uso: "Negocios informal/neutral. Útil en chat interno con pares. A veces suena seco en correos formales.", ejemplo: "了解です。対応いたします。" },
      { jp: "承知いたしました。", yomi: "しょうち いたしました。", rank: 3, uso: "Más cortés/humilde. Con clientes, superiores y correos/actas.", ejemplo: "承知いたしました。本日中に送付いたします。" },
    ],
    best: 2,
    why: "‘承知いたしました’ expresa humildad y formalidad máximas en contextos profesionales.",
  },
  {
    id: "r2",
    title: "Pedir confirmación de documento",
    opts: [
      { jp: "見てください。", yomi: "みて ください。", rank: 1, uso: "Imperativo cortés básico. Puede sonar directo con cliente/superior.", ejemplo: "この資料を見てください。" },
      { jp: "ご確認ください。", yomi: "ごかくにん ください。", rank: 2, uso: "Fórmula educada estándar en negocios.", ejemplo: "添付ファイルをご確認ください。" },
      { jp: "ご確認のほどお願いいたします。", yomi: "ごかくにん の ほど おねがい いたします。", rank: 3, uso: "Súper cortés en correos formales a clientes/superiores.", ejemplo: "ご確認のほどお願い申し上げます。" },
    ],
    best: 2,
    why: "El giro ‘〜のほどお願いいたします’ eleva el registro y suena más deferente.",
  },
  {
    id: "r3",
    title: "Prometer envío rápido",
    opts: [
      { jp: "すぐ送る。", yomi: "すぐ おくる。", rank: 1, uso: "Casual. Útil solo con mucha confianza.", ejemplo: "すぐ送る。" },
      { jp: "すぐ送ります。", yomi: "すぐ おくります。", rank: 2, uso: "Polite estándar. Bien con colegas o proveedores conocidos.", ejemplo: "すぐ送りますので、ご確認ください。" },
      { jp: "ただちに送付いたします。", yomi: "ただちに そうふ いたします。", rank: 3, uso: "Formal con humildad. Correo a cliente/superior/externo.", ejemplo: "ただちに送付いたします。到着次第ご確認ください。" },
    ],
    best: 2,
    why: "‘送付いたします’ (humilde) + ‘ただちに’ refuerza eficacia y respeto.",
  },
  {
    id: "r4",
    title: "Abrir una petición con amortiguador",
    opts: [
      { jp: "お願い。", yomi: "おねがい。", rank: 1, uso: "Muy casual. Evítalo en negocios.", ejemplo: "お願い、手伝って。" },
      { jp: "お願いします。", yomi: "おねがい します。", rank: 2, uso: "Cortés estándar. Bien con pares.", ejemplo: "こちらの対応をお願いします。" },
      { jp: "恐れ入りますが、〜をお願いできますでしょうか。", yomi: "おそれいります が、〜 を おねがい できます でしょう か。", rank: 3, uso: "Máxima cortesía. Cliente/superior; pedidos difíciles o urgentes.", ejemplo: "恐れ入りますが、明朝までにご共有いただけますでしょうか。" },
    ],
    best: 2,
    why: "‘恐れ入りますが’ + ‘〜できますでしょうか’ atenúan y muestran deferencia.",
  },
  {
    id: "r5",
    title: "Disculpa por molestia o error",
    opts: [
      { jp: "すみません。", yomi: "すみません。", rank: 1, uso: "Cortés básico/coloquial. Apto en oral con confianza.", ejemplo: "すみません、遅れました。" },
      { jp: "申し訳ありません。", yomi: "もうしわけ ありません。", rank: 2, uso: "Formal serio. En negocios y correos.", ejemplo: "返信が遅れ、申し訳ありません。" },
      { jp: "申し訳ございません。", yomi: "もうしわけ ございません。", rank: 3, uso: "Muy formal. Con cliente/superior o fallas serias.", ejemplo: "多大なご迷惑をおかけし、誠に申し訳ございません。" },
    ],
    best: 2,
    why: "‘ございません’ es el grado más alto de formalidad en esta familia.",
  },
  {
    id: "r6",
    title: "Prometer contacto posterior",
    opts: [
      { jp: "また連絡します。", yomi: "また れんらく します。", rank: 1, uso: "Básico neutral. Apto con colegas.", ejemplo: "また連絡しますね。" },
      { jp: "後ほどご連絡いたします。", yomi: "のちほど ごれんらく いたします。", rank: 2, uso: "Más cortés, natural en correos.", ejemplo: "後ほどご連絡いたします。" },
      { jp: "追ってご連絡申し上げます。", yomi: "おって ごれんらく もうしあげます。", rank: 3, uso: "Muy formal. Anuncios oficiales/externos.", ejemplo: "詳細は追ってご連絡申し上げます。" },
    ],
    best: 2,
    why: "‘申し上げます’ introduce el tono más respetuoso (kenjōgo).",
  },
  {
    id: "r7",
    title: "Agradecer con distintos registros",
    opts: [
      { jp: "ありがとう。", yomi: "ありがとう。", rank: 1, uso: "Casual. Amistad/pares cercanos.", ejemplo: "手伝ってくれて、ありがとう。" },
      { jp: "ありがとうございます。", yomi: "ありがとうございます。", rank: 2, uso: "Cortés estándar.", ejemplo: "ご対応ありがとうございます。" },
      { jp: "誠にありがとうございます。", yomi: "まことに ありがとうございます。", rank: 3, uso: "Muy formal. Comunicado oficial/cliente.", ejemplo: "平素よりお引き立ていただき、誠にありがとうございます。" },
    ],
    best: 2,
    why: "‘誠に’ eleva solemnidad y respeto sin sonar exagerado.",
  },
  {
    id: "r8",
    title: "Cerrar con ‘yoroshiku’ en tres niveles",
    opts: [
      { jp: "よろしく。", yomi: "よろしく。", rank: 1, uso: "Casual. Chat interno con confianza.", ejemplo: "明日よろしく。" },
      { jp: "よろしくお願いします。", yomi: "よろしく おねがい します。", rank: 2, uso: "Cierre estándar.", ejemplo: "引き続きよろしくお願いします。" },
      { jp: "何卒よろしくお願いいたします。", yomi: "なにとぞ よろしく おねがい いたします。", rank: 3, uso: "Muy formal. Peticiones sensibles/externas.", ejemplo: "何卒よろしくお願いいたします。" },
    ],
    best: 2,
    why: "‘何卒’ agrega deferencia y seriedad en el cierre.",
  },
];

export default function N2_B5_U2() {
  const [progress, setProgress] = useState(0);
  const { playCorrect, playWrong } = useFeedbackSounds();
  const mark = () => setProgress((p) => Math.min(1, p + 0.2));

  // A1
  const [ans1, setAns1] = useState<Record<string, number | null>>(Object.fromEntries(CASOS.map((c) => [c.id, null])));
  const [done1, setDone1] = useState(false);

  // A2
  const [ans2, setAns2] = useState<Record<string, number | null>>(Object.fromEntries(QUIZ.map((q) => [q.id, null])));
  const score2 = useMemo(() => QUIZ.reduce((s, q) => s + ((ans2[q.id] === q.answer) ? 1 : 0), 0), [ans2]);

  // A3
  const [rankPick, setRankPick] = useState<Record<string, number | null>>(Object.fromEntries(RANKER.map((r) => [r.id, null])));
  const [rankDone, setRankDone] = useState(false);

  return (
    <UnitTemplate
      hero={require("../../../assets/images/n2/covers/b5_u2.webp")}
      accent={accent}
      breadcrumb="B5 · U2"
      title="Empatía y cortesía natural"
      subtitle="Frases reales para cuidar el tono: disculpa, ánimo, consideración."
      ctas={[
        { label: "Tip rápido", onPress: () => speakES("Antes de pedir, amortigua: 恐れ入りますが／お手数ですが／差し支えなければ…") },
        { label: "Marcar avance", onPress: mark },
      ]}
      progress={progress}
      onContinue={mark}
      continueLabel="Siguiente"
    >
      {/* Guía */}
      <View style={[styles.card, { borderColor: accent }]}>
        <Text style={styles.h2}>Guía de uso (con lectura y ejemplos)</Text>
        {GUIA.map((g, i) => (
          <View key={i} style={{ marginTop: 8 }}>
            <View className="tagRow" style={styles.tagRow}><Text style={styles.badge}>{g.tag}</Text></View>
            <Text style={styles.p}>{g.descES}</Text>
            {g.puntos.map((p, k) => (<Text key={k} style={styles.li}>• {p}</Text>))}
            {g.ejemplos.map((ex, k) => (
              <View key={k} style={styles.inner}>
                <View style={styles.rowBetween}>
                  <Text style={styles.jp}>{ex.jp}</Text>
                  <Pressable onPress={() => speakJP(ex.jp)}><MCI name="volume-high" size={18} color="#fff" /></Pressable>
                </View>
                <Text style={styles.yomi}>{ex.yomi}</Text>
                <Text style={styles.es}>{ex.es}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* A1 */}
      <View style={styles.card}>
        <Text style={styles.h2}>Actividad 1 · Situación → mejor frase</Text>
        {CASOS.map((c) => {
          const chosen = ans1[c.id];
          const show = done1 && chosen !== null;
          return (
            <View key={c.id} style={{ marginTop: 10 }}>
              <View style={styles.rowBetween}>
                <Text style={styles.jp}>{c.sitJP}</Text>
                <Pressable onPress={() => speakJP(c.sitJP)}><MCI name="volume-high" size={18} color="#fff" /></Pressable>
              </View>
              <Text style={styles.yomi}>{c.yomi}</Text>
              {c.choices.map((ch, idx) => {
                const isChosen = chosen === idx;
                const ok = show && isChosen && ch.correct;
                const ko = show && isChosen && !ch.correct;
                return (
                  <Pressable
                    key={idx}
                    onPress={() => {
                      setAns1((prev) => ({ ...prev, [c.id]: idx }));
                      if (done1) (ch.correct ? playCorrect() : playWrong());
                    }}
                    style={[
                      styles.choice,
                      isChosen && { backgroundColor: "rgba(14,165,233,0.18)", borderColor: accent },
                      ok && { borderColor: "#16a34a" },
                      ko && { borderColor: "#ef4444" },
                    ]}
                  >
                    <Text style={styles.choiceText}>{ch.jp}</Text>
                    <Text style={styles.yomi}>{ch.yomi}</Text>
                    <Text style={styles.es}>{ch.es}</Text>
                    {show && isChosen && <Text style={styles.explain}>Por qué: {ch.why}</Text>}
                  </Pressable>
                );
              })}
            </View>
          );
        })}
        <View style={styles.actions}>
          <Btn
            label="Calificar"
            onPress={() => {
              setDone1(true);
              Object.entries(ans1).forEach(([id, idx]) => {
                const item = CASOS.find((x) => x.id === id);
                if (!item || idx == null) return;
                item.choices[idx].correct ? playCorrect() : playWrong();
              });
            }}
          />
          <Btn
            label="Reiniciar"
            variant="ghost"
            onPress={() => {
              setDone1(false);
              setAns1(Object.fromEntries(CASOS.map((c) => [c.id, null])));
            }}
          />
        </View>
      </View>

      {/* A2 */}
      <View style={styles.card}>
        <Text style={styles.h2}>Actividad 2 · Quiz (16)</Text>
        {QUIZ.map((q) => {
          const chosen = ans2[q.id];
          const show = chosen !== null && chosen !== undefined;
          return (
            <View key={q.id} style={{ marginTop: 10 }}>
              <Text style={styles.jp}>{q.stem}</Text>
              {q.options.map((opt, idx) => {
                const isChosen = chosen === idx;
                const isCorrect = idx === q.answer;
                const border = show && isChosen ? (isCorrect ? { borderColor: "#16a34a" } : { borderColor: "#ef4444" }) : {};
                return (
                  <Pressable
                    key={idx}
                    onPress={() => {
                      setAns2((prev) => ({ ...prev, [q.id]: idx }));
                      (idx === q.answer) ? playCorrect() : playWrong();
                    }}
                    style={[styles.choice, isChosen && { backgroundColor: "rgba(14,165,233,0.18)", borderColor: accent }, border]}
                  >
                    <Text style={styles.choiceText}>{opt}</Text>
                  </Pressable>
                );
              })}
              {show && <Text style={styles.explain}>Explicación: {q.explain}</Text>}
            </View>
          );
        })}
        <View style={styles.actions}>
          <Btn label={`Ver puntuación: ${score2}/16`} onPress={() => Alert.alert("Resultado", `Tu puntuación: ${score2}/16`)} />
          <Btn label="Reiniciar" variant="ghost" onPress={() => setAns2(Object.fromEntries(QUIZ.map((q) => [q.id, null])))} />
        </View>
      </View>

      {/* A3 */}
      <View style={styles.card}>
        <Text style={styles.h2}>Actividad 3 · Sube de registro</Text>

        {/* Guía rápida de registros */}
        <View style={[styles.inner, { marginTop: 4 }]}>
          <Text style={[styles.es, { marginBottom: 6 }]}>
            <Text style={{ fontWeight: "900", color: "#93C5FD" }}>Cómo elegir el registro: </Text>
            ① Cliente/superior → nivel <Text style={{ fontWeight: "900" }}>3</Text>. ② Colegas/neutral → <Text style={{ fontWeight: "900" }}>2</Text>. ③ Informal/confianza → <Text style={{ fontWeight: "900" }}>1</Text>.
          </Text>
          <Text style={styles.p}>
            Regla de oro: abre peticiones con amortiguadores（恐れ入りますが／お手数ですが） y cierra correos con
            「何卒よろしくお願いいたします」 cuando el asunto es sensible.
          </Text>
        </View>

        {RANKER.map((r) => {
          const pick = rankPick[r.id];
          const show = rankDone && pick !== null;
          return (
            <View key={r.id} style={{ marginTop: 12 }}>
              <Text style={[styles.p, { marginBottom: 6 }]}>
                <Text style={styles.k}>Situación:</Text> {r.title}
              </Text>
              {r.opts.map((o, idx) => {
                const chosen = pick === idx;
                const ok = show && chosen && idx === r.best;
                const ko = show && chosen && idx !== r.best;
                return (
                  <Pressable
                    key={idx}
                    onPress={() => {
                      setRankPick((prev) => ({ ...prev, [r.id]: idx }));
                      if (rankDone) (idx === r.best ? playCorrect() : playWrong());
                    }}
                    style={[
                      styles.choice,
                      chosen && { backgroundColor: "rgba(14,165,233,0.18)", borderColor: accent },
                      ok && { borderColor: "#16a34a" },
                      ko && { borderColor: "#ef4444" },
                    ]}
                  >
                    <View style={styles.rowBetween}>
                      <Text style={styles.jp}>{o.jp}</Text>
                      <Pressable onPress={() => speakJP(o.jp)}><MCI name="volume-high" size={18} color="#fff" /></Pressable>
                    </View>
                    <Text style={styles.yomi}>{o.yomi}</Text>
                    <Text style={styles.es}>Uso: {o.uso}</Text>
                    <Text style={styles.es}>Ej.: {o.ejemplo}</Text>
                  </Pressable>
                );
              })}
              {show && (
                <View style={[styles.inner, { marginTop: 6 }]}>
                  <Text style={styles.explain}>
                    <Text style={{ fontWeight: "900" }}>¿Por qué es mejor?</Text> {r.why}
                  </Text>
                  <Text style={[styles.explain, { marginTop: 4 }]}>
                    <Text style={{ fontWeight: "900" }}>Cuándo usar cada una:</Text> Nivel 1 → informal/pares cercanos;
                    Nivel 2 → negocios estándar (colegas/proveedores habituales);
                    Nivel 3 → clientes, superiores, correos formales, solicitudes sensibles o anuncios oficiales.
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.actions}>
          <Btn
            label="Comprobar"
            onPress={() => {
              setRankDone(true);
              Object.entries(rankPick).forEach(([id, idx]) => {
                const item = RANKER.find((x) => x.id === id);
                if (!item || idx == null) return;
                (idx === item.best) ? playCorrect() : playWrong();
              });
            }}
          />
          <Btn
            label="Reiniciar"
            variant="ghost"
            onPress={() => {
              setRankDone(false);
              setRankPick(Object.fromEntries(RANKER.map((r) => [r.id, null])));
            }}
          />
        </View>
      </View>
    </UnitTemplate>
  );
}

function Btn({ label, onPress, variant = "primary" }: { label: string; onPress?: () => void; variant?: "primary" | "ghost" | "alt" }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.btn, variant === "primary" ? styles.btnPrimary : variant === "ghost" ? styles.btnGhost : styles.btnAlt]}
    >
      <Text style={[styles.btnText, variant === "alt" && { color: "#0B0F19" }]}>{label}</Text>
    </Pressable>
  );
}

const R = 14;
const styles = StyleSheet.create({
  card: { backgroundColor: BG, borderRadius: R, padding: 14, borderWidth: 1, borderColor: BORDER, marginHorizontal: 16, marginBottom: 12 },
  tagRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  badge: { color: "#fff", backgroundColor: "rgba(14,165,233,0.95)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, fontWeight: "800" },
  h2: { color: "#fff", fontWeight: "900", fontSize: 16, marginBottom: 6 },
  p: { color: "rgba(255,255,255,0.9)", lineHeight: 20 },
  li: { color: "rgba(255,255,255,0.85)", marginTop: 2 },
  inner: { backgroundColor: "#0F1423", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", padding: 12, marginTop: 8 },

  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  jp: { color: "#fff", fontSize: 16, fontWeight: "800" },
  yomi: { color: "#D1D5DB", fontSize: 14, marginTop: 4 },
  es: { color: "#93C5FD", fontSize: 15 },
  explain: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 },

  choice: { borderRadius: 12, padding: 12, borderWidth: 2, borderColor: "transparent", marginTop: 8 },
  choiceText: { color: "#fff" },

  actions: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 10 },
  btn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999 },
  btnPrimary: { backgroundColor: "rgba(14,165,233,0.95)" },
  btnGhost: { backgroundColor: "rgba(255,255,255,0.14)" },
  btnAlt: { backgroundColor: "#60A5FA" },
  btnText: { color: "#fff", fontWeight: "700", letterSpacing: 0.3 },

  // etiqueta pequeña estilo "kbd"
  k: { backgroundColor: "rgba(255,255,255,0.14)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, color: "#fff", fontWeight: "800" },
});
