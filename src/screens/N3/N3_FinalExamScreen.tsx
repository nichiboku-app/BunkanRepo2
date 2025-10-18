import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

/* ---------------- Types ---------------- */
type RootStackParamList = { N3_FinalExam: undefined; CursoN3: undefined };
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_FinalExam">;

type Q = {
  id: number;
  stem: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explain: string;
};

/* ---------------- Helpers ---------------- */
const formatMS = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, "0");
  return `${m}:${ss}`;
};
const ABCD = ["A", "B", "C", "D"] as const;

/* ---------------- Data (40 únicas) ---------------- */
const QUESTIONS: Q[] = [
  { id:1, stem:"「わけがない」 expresa…", options:["posibilidad baja","negación categórica","sorpresa","recordatorio"], answer:1, explain:"「わけがない」= ‘no hay manera de que…’; negación rotunda." },
  { id:2, stem:"明日の会議は何時___？（recuerdo dudoso）", options:["っけ","わけがない","みたい","ほど"], answer:0, explain:"「っけ」 se usa para recordar algo con duda en habla coloquial." },
  { id:3, stem:"彼が約束を破る___。", options:["わけがない","っけ","そうだ","かもしれない"], answer:0, explain:"Se afirma que ‘no hay forma’ de que incumpla: わけがない." },
  { id:4, stem:"「っけ」 se usa principalmente en…", options:["escritura formal","habla coloquial","manuales","discurso público"], answer:1, explain:"「っけ」 es marcadamente coloquial para recordar/preguntar." },
  { id:5, stem:"この値段で本物な___。", options:["わけがない","っけ","ほど","だけ"], answer:0, explain:"Con ese precio, ‘no puede ser auténtico’ → わけがない." },
  { id:6, stem:"昨日のテスト、難しかった___？", options:["わけがない","っけ","そうだ","にしては"], answer:1, explain:"Se intenta confirmar un recuerdo: 「…難しかったっけ？」" },
  { id:7, stem:"彼女が遅刻する___。いつも早いから。", options:["っけ","わけがない","みたい","に違いない"], answer:1, explain:"Con la razón a favor, la negación enfática es わけがない." },
  { id:8, stem:"“No puede ser cierto” → 日本語", options:["本当だっけ","本当なわけがない","本当すぎる","本当のようだ"], answer:1, explain:"‘No puede ser verdad’ → 本当なわけがない." },
  { id:9, stem:"締め切りは金曜だった___？", options:["わけがない","っけ","らしい","というと"], answer:1, explain:"Confirmación de recuerdo: …だったっけ？" },
  { id:10, stem:"「わけがない」 — tono:", options:["muy suave","neutral","fuerte","dubitativo"], answer:2, explain:"Es una negación **fuerte**/categórica." },
  { id:11, stem:"あの静かな人が犯人の___。", options:["わけがない","らしい","でしょう","そうに見える"], answer:0, explain:"Se niega rotundamente la posibilidad → わけがない." },
  { id:12, stem:"この店、月曜は休み___？", options:["かな","だろう","っけ","らしい"], answer:2, explain:"Se intenta confirmar info del recuerdo → っけ." },
  { id:13, stem:"彼にそんなお金がある___。学生だし。", options:["に違いない","わけがない","らしい","ようだ"], answer:1, explain:"Se descarta con fuerza: ‘no puede tener tanto dinero’." },
  { id:14, stem:"先生の名前は…なんだ___。", options:["っけ","らしい","わけがない","に違いない"], answer:0, explain:"Recordar algo que se ha olvidado → っけ." },
  { id:15, stem:"このサイズで軽い___。最新技術だ。", options:["わけがない","とは限らない","はずだ","かもしれない"], answer:2, explain:"‘Debería ser ligero’ (expectativa razonada) → はずだ." },
  { id:16, stem:"そんな簡単に治る___。", options:["わけがない","ようだ","にしては","ことはない"], answer:0, explain:"Negación categórica: ‘no se cura tan fácil’." },
  { id:17, stem:"明日、集合は駅前だ___？", options:["らしい","って","だっけ","わけがない"], answer:2, explain:"Confirmación de recuerdo → だっけ." },
  { id:18, stem:"彼が日本語を話せない___。", options:["わけがない","そうだ","らしい","っけ"], answer:0, explain:"Se niega con fuerza: ‘no hay forma de que no hable’." },
  { id:19, stem:"こんなに安い___。", options:["わけだ","わけがない","わけではない","はず"], answer:1, explain:"‘No puede ser tan barato’ → わけがない." },
  { id:20, stem:"昨日の結果、良かった___？", options:["かな","よね","っけ","らしい"], answer:2, explain:"Se intenta confirmar recuerdo → っけ." },
  { id:21, stem:"彼は嘘をつく人___。", options:["に違いない","わけがない","らしい","そうだ"], answer:1, explain:"Se descarta: ‘él no es alguien que mienta’ → わけがない." },
  { id:22, stem:"会議はどこだった___。", options:["らしい","っけ","にしては","ほど"], answer:1, explain:"Recordar (auto-pregunta) → っけ." },
  { id:23, stem:"この量で足りる___。もっと必要だ。", options:["はずだ","わけがない","にしては","みたい"], answer:1, explain:"‘No alcanza con esta cantidad’ → わけがない." },
  { id:24, stem:"君、北海道出身だった___？", options:["よね","かな","だろう","っけ"], answer:3, explain:"Confirmación de recuerdo con coloquial → だったっけ？" },
  { id:25, stem:"彼が歌手？そんな___。", options:["わけがない","わけではない","わけだ","っけ"], answer:0, explain:"‘¿Cantante? ¡No puede ser!’ → わけがない." },
  { id:26, stem:"あれはいくらだった___。", options:["かも","だろう","っけ","らしい"], answer:2, explain:"‘¿Cuánto costaba?’ (recordar) → っけ." },
  { id:27, stem:"こんな難題、私に解ける___。", options:["に違いない","わけがない","らしい","ようだ"], answer:1, explain:"Negación enfática: ‘yo no puedo con esto’ → わけがない." },
  { id:28, stem:"今日の宿題、何ページだった___。", options:["らしい","っけ","だろう","わけがない"], answer:1, explain:"Recordar indicación de tarea → っけ." },
  { id:29, stem:"彼が来ない___。さっき出発した。", options:["わけがない","っけ","はずがない","ようだ"], answer:2, explain:"Con evidencia, ‘no puede ser que no venga’ → はずがない." },
  { id:30, stem:"あの映画がつまらない___。評価が高い。", options:["に違いない","とは限らない","わけがない","そうだ"], answer:2, explain:"Se niega categóricamente que sea aburrida → わけがない." },
  { id:31, stem:"今日は何曜日だ___？", options:["っけ","かな","だろう","わけがない"], answer:0, explain:"‘¿Qué día era hoy?’ → だっけ／っけ." },
  { id:32, stem:"彼女がそんなことを言う___。", options:["らしい","わけがない","そうだ","ようだ"], answer:1, explain:"Negación fuerte: ‘ella no diría eso’." },
  { id:33, stem:"この鍵で開く___。", options:["はずだ","わけがない","っけ","らしい"], answer:1, explain:"Se descarta que abra con esa llave → わけがない." },
  { id:34, stem:"予約は6時だった___。", options:["わけではない","っけ","ほど","ようだ"], answer:1, explain:"Confirmación de un detalle que no se recuerda bien → っけ." },
  { id:35, stem:"彼が負ける___。", options:["わけがない","にしては","らしい","そうだ"], answer:0, explain:"‘No hay forma de que él pierda’ → わけがない." },
  { id:36, stem:"私のミスな___。", options:["わけだ","わけがない","わけではない","はず"], answer:1, explain:"‘No puede ser mi error’ → わけがない." },
  { id:37, stem:"駅の出口は北口だった___？", options:["に違いない","わけがない","っけ","らしい"], answer:2, explain:"Recordar/confirmar salida → っけ." },
  { id:38, stem:"こんな重さ、子どもに持てる___。", options:["わけがない","ようだ","かもしれない","に違いない"], answer:0, explain:"‘Un niño no puede cargar esto’ → わけがない." },
  { id:39, stem:"今日の先生は誰だった___。", options:["かな","っけ","らしい","でしょう"], answer:1, explain:"Autopregunta de recuerdo → っけ." },
  { id:40, stem:"彼がここにいる___。", options:["ようだ","わけがない","かもしれない","って"], answer:1, explain:"Se niega categóricamente que esté aquí → わけがない." },
].sort(() => Math.random() - 0.5);

/* ---------------- Screen ---------------- */
export default function N3_FinalExamScreen() {
  const nav = useNavigation<Nav>();

  // 45 minutos
  const LIMIT_MS = 45 * 60 * 1000;
  const [leftMs, setLeftMs] = useState<number>(LIMIT_MS);
  const [answers, setAnswers] = useState<Record<number, 0|1|2|3 | null>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const timerRef = useRef<NodeJS.Timer | null>(null);

  useEffect(() => {
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const remain = LIMIT_MS - (Date.now() - start);
      setLeftMs(remain);
      if (remain <= 0) {
        clearInterval(timerRef.current!);
        handleSubmit(true);
      }
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const pick = (qid: number, opt: 0|1|2|3) => {
    if (submitted) return;
    setAnswers(a => ({ ...a, [qid]: opt }));
  };

  const answeredCount = useMemo(
    () => Object.values(answers).filter(v => v !== null && v !== undefined).length,
    [answers]
  );

  const handleSubmit = async (auto = false) => {
    if (submitted) return;
    if (timerRef.current) clearInterval(timerRef.current);

    let ok = 0;
    for (const q of QUESTIONS) if (answers[q.id] === q.answer) ok++;
    setScore(ok);
    setSubmitted(true);

    try {
      await AsyncStorage.setItem(
        "n3_final_exam_result",
        JSON.stringify({
          when: new Date().toISOString(),
          score: ok,
          total: QUESTIONS.length,
          timeLeftMs: Math.max(0, leftMs),
          autoSubmit: auto,
          achievement: ok >= 28 ? "LEON" : null,
        })
      );
    } catch {}
  };

  const resetExam = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setLeftMs(LIMIT_MS);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={["#0B0C0F", "#151826"]} style={styles.header}>
        <Text style={styles.hTitle}>🦁 Prueba Final — N3</Text>
        <View style={styles.hRow}>
          <View style={styles.pill}>
            <MCI name="clock-outline" size={16} color="#fff" />
            <Text style={styles.pillTxt}> {formatMS(leftMs)}</Text>
          </View>
          <View style={styles.pill}>
            <MCI name="progress-check" size={16} color="#fff" />
            <Text style={styles.pillTxt}> {answeredCount}/{QUESTIONS.length}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Lista */}
      <ScrollView
        contentContainerStyle={{ padding: 14, paddingBottom: 220 }}
        keyboardShouldPersistTaps="handled"
      >
        {QUESTIONS.map((q) => {
          const chosen = answers[q.id] ?? null;
          const pickedIndex = chosen as 0|1|2|3 | null;

          return (
            <View key={q.id} style={styles.card}>
              <Text style={styles.qNum}>Q{String(q.id).padStart(2,"0")}</Text>
              <Text style={styles.qStem}>{q.stem}</Text>

              {q.options.map((opt, idx) => {
                const i = idx as 0|1|2|3;
                const picked = pickedIndex === i;
                const correctNow = submitted && q.answer === i;
                const wrongNow = submitted && picked && q.answer !== i;

                const border =
                  submitted ? (correctNow ? "#10B981" : wrongNow ? "#EF4444" : "rgba(0,0,0,0.1)")
                            : picked ? "#111" : "rgba(0,0,0,0.1)";
                const bg =
                  submitted ? (correctNow ? "rgba(16,185,129,.12)" : wrongNow ? "rgba(239,68,68,.12)" : "transparent")
                            : picked ? "rgba(0,0,0,0.05)" : "transparent";
                const col =
                  submitted ? (correctNow ? "#0f9a6a" : wrongNow ? "#c62828" : "#0E1015")
                            : picked ? "#0E1015" : "#0E1015";

                return (
                  <Pressable
                    key={i}
                    onPress={() => pick(q.id, i)}
                    style={[styles.optBtn, { borderColor: border, backgroundColor: bg }]}
                  >
                    <Text style={[styles.optTxt, { color: col }]}>
                      {ABCD[i]}. {opt}
                    </Text>
                  </Pressable>
                );
              })}

              {/* ✅ Feedback SOLO después de enviar */}
              {submitted && (
                <View style={[
                  styles.feedbackBox,
                  { borderColor: pickedIndex === q.answer ? "#10B981" : "#EF4444", backgroundColor: pickedIndex === q.answer ? "rgba(16,185,129,.12)" : "rgba(239,68,68,.12)" }
                ]}>
                  <Text style={[styles.feedbackTitle, { color: pickedIndex === q.answer ? "#0f9a6a" : "#c62828" }]}>
                    {pickedIndex === q.answer ? "✅ Correcto" : "❌ Incorrecto"}
                  </Text>
                  {pickedIndex !== q.answer && (
                    <Text style={styles.feedbackText}>
                      Respuesta correcta: {ABCD[q.answer]} — {q.options[q.answer]}
                    </Text>
                  )}
                  <Text style={styles.feedbackText}>{q.explain}</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Botón flotante (más alto) */}
      {!submitted ? (
        <View style={styles.fabWrap} pointerEvents="box-none">
          <Pressable style={styles.fabBtn} onPress={handleSubmit}>
            <Text style={styles.fabTxt}>Entregar examen</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.resultBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.resultTitle}>Puntaje: {score}/{QUESTIONS.length}</Text>
            <Text style={styles.resultSub}>Tiempo restante: {formatMS(leftMs)}</Text>
          </View>
          <View style={styles.resultActions}>
            <Pressable style={[styles.smallBtn, { backgroundColor:"#0E1015" }]} onPress={resetExam}>
              <Text style={styles.smallBtnTxt}>Reintentar</Text>
            </Pressable>
            <Pressable style={[styles.smallBtn, { backgroundColor:"#111" }]} onPress={()=>nav.navigate("CursoN3")}>
              <Text style={styles.smallBtnTxt}>Volver</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

/* ---------------- Styles ---------------- */
const R = 14;
const styles = StyleSheet.create({
  root:{ flex:1, backgroundColor:"#0B0C0F" },

  header:{ paddingTop:54, paddingBottom:12, paddingHorizontal:14, borderBottomWidth:1, borderBottomColor:"rgba(255,255,255,0.06)" },
  hTitle:{ color:"#fff", fontWeight:"900", fontSize:18 },
  hRow:{ flexDirection:"row", gap:8, marginTop:8 },
  pill:{ flexDirection:"row", alignItems:"center", backgroundColor:"rgba(255,255,255,.1)", paddingHorizontal:10, paddingVertical:6, borderRadius:999, borderWidth:1, borderColor:"rgba(255,255,255,.18)" },
  pillTxt:{ color:"#fff", fontWeight:"800" },

  card:{ backgroundColor:"#fff", borderRadius:R, padding:12, borderWidth:1, borderColor:"rgba(0,0,0,0.06)", marginBottom:10 },
  qNum:{ fontWeight:"900", color:"#6B7280", marginBottom:4, fontSize:12 },
  qStem:{ color:"#0E1015", fontWeight:"800", marginBottom:8 },

  optBtn:{ borderWidth:1, borderRadius:10, paddingHorizontal:10, paddingVertical:8, marginBottom:6 },
  optTxt:{ fontWeight:"800", color:"#0E1015" },

  feedbackBox:{ borderWidth:1, borderRadius:10, padding:10, marginTop:6 },
  feedbackTitle:{ fontWeight:"900", marginBottom:4 },
  feedbackText:{ color:"#0E1015" },

  /* FAB (subido) */
  fabWrap:{
    position:"absolute",
    left:0, right:0,
    bottom:32, // más arriba
    paddingHorizontal:16,
  },
  fabBtn:{
    backgroundColor:"#111",
    paddingVertical:14,
    borderRadius:12,
    alignItems:"center",
    shadowColor:"#000",
    shadowOpacity:0.25,
    shadowRadius:8,
    shadowOffset:{ width:0, height:4 },
    elevation:5,
  },
  fabTxt:{ color:"#fff", fontWeight:"900" },

  /* Resultado */
  resultBar:{
    position:"absolute",
    left:0, right:0, bottom:0,
    padding:14,
    backgroundColor:"#0B0C0F",
    borderTopWidth:1,
    borderTopColor:"rgba(255,255,255,0.08)",
    flexDirection:"row",
    alignItems:"center",
    gap:12,
  },
  resultTitle:{ color:"#fff", fontWeight:"900", fontSize:16 },
  resultSub:{ color:"#cbd5e1", marginTop:2 },
  resultActions:{ flexDirection:"row", gap:8 },
  smallBtn:{ paddingHorizontal:12, paddingVertical:10, borderRadius:10 },
  smallBtnTxt:{ color:"#fff", fontWeight:"900" },
});
