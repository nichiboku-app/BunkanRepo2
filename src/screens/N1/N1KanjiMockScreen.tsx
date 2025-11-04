import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    FlatList,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { N1_KANJI_META } from "../../data/n1_kanji_meta";
// Opcional: si quieres sonidos de feedback, descomenta la línea siguiente y usa playCorrect/playWrong en pick().
// import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

/* ------------------ NAV ------------------ */
type RootStackParamList = {
  N1Home: undefined;
  N1KanjiMock: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N1KanjiMock">;

/* ------------------ TYPES ------------------ */
type Meta = {
  hex: string;
  k: string;             // kanji
  on: string[];
  kun: string[];
  es: string;            // significado español corto
  words: { jp: string; reading: string; es: string }[];
};

type Q = {
  id: string;
  kind: "on" | "kun" | "es" | "kanjiFromES";
  prompt: string;
  choices: string[];
  answerIndex: number;
  ref?: { k: string; es?: string }; // referencia ligera para mostrar en revisión
};

/* ------------------ HELPERS ------------------ */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sample<T>(arr: T[], n: number): T[] {
  const a = shuffle(arr);
  return a.slice(0, Math.min(n, a.length));
}

function uniqueBy<T>(arr: T[], key: (x: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of arr) {
    const k = key(it);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(it);
    }
  }
  return out;
}

/* ------------------ QUESTION BUILD ------------------ */
function buildQuestions(pool: Meta[], total: number): Q[] {
  const base = sample(pool, total); // base de items únicos

  const qs: Q[] = [];

  for (const item of base) {
    const k = item.k;
    const es = item.es;

    // 1) Onyomi si existe, con 3 distractores de otras onyomi
    if (item.on && item.on.length > 0) {
      const correct = item.on[0];
      const others = shuffle(
        pool.flatMap(m => m.on).filter(r => r && r !== correct)
      ).slice(0, 3);
      if (others.length === 3) {
        const options = shuffle([correct, ...others]);
        qs.push({
          id: `on_${k}_${Math.random().toString(36).slice(2, 7)}`,
          kind: "on",
          prompt: `【${k}】の音読みは？`,
          choices: options,
          answerIndex: options.indexOf(correct),
          ref: { k, es },
        });
        continue;
      }
    }

    // 2) Kunyomi si existe
    if (item.kun && item.kun.length > 0) {
      const correct = item.kun[0];
      const others = shuffle(
        pool.flatMap(m => m.kun).filter(r => r && r !== correct)
      ).slice(0, 3);
      if (others.length === 3) {
        const options = shuffle([correct, ...others]);
        qs.push({
          id: `kun_${k}_${Math.random().toString(36).slice(2, 7)}`,
          kind: "kun",
          prompt: `【${k}】の訓読みは？`,
          choices: options,
          answerIndex: options.indexOf(correct),
          ref: { k, es },
        });
        continue;
      }
    }

    // 3) Significado ES: elige el ES correcto del kanji
    {
      const correct = es;
      const others = shuffle(
        pool.map(m => m.es).filter(v => v && v !== correct)
      ).slice(0, 3);
      if (others.length === 3) {
        const options = shuffle([correct, ...others]);
        qs.push({
          id: `es_${k}_${Math.random().toString(36).slice(2, 7)}`,
          kind: "es",
          prompt: `「${k}」の意味（最も近い）は？`,
          choices: options,
          answerIndex: options.indexOf(correct),
          ref: { k, es },
        });
        continue;
      }
    }

    // 4) Desde español → elige el kanji correcto
    {
      const correctK = k;
      const others = shuffle(
        pool.map(m => m.k).filter(v => v && v !== correctK)
      ).slice(0, 3);
      if (others.length === 3) {
        const options = shuffle([correctK, ...others]);
        qs.push({
          id: `kanjiFromES_${k}_${Math.random().toString(36).slice(2, 7)}`,
          kind: "kanjiFromES",
          prompt: `『${es}』に最も適切な漢字は？`,
          choices: options,
          answerIndex: options.indexOf(correctK),
          ref: { k, es },
        });
        continue;
      }
    }
  }

  // Asegura cantidad requerida: si por datos faltantes quedaron menos, rellena con más del pool
  if (qs.length < total) {
    const need = total - qs.length;
    const extras = buildQuestions(shuffle(pool), need);
    return [...qs, ...extras].slice(0, total);
  }

  // Qs únicas por id
  return uniqueBy(qs, q => q.id).slice(0, total);
}

/* ------------------ TIMER SUGGESTION ------------------ */
// 25s por pregunta, con mínimo 10 min. Ajusta si deseas.
function secondsFor(total: number) {
  return Math.max(10 * 60, total * 25);
}

export default function N1KanjiMockScreen() {
  const nav = useNavigation<Nav>();

  // Opcional: sonidos
  // const { playCorrect, playWrong, ready } = useFeedbackSounds();

  // Pool de 200 kanji
  const POOL: Meta[] = useMemo(() => N1_KANJI_META as Meta[], []);

  // Config inicial
  const [qCount, setQCount] = useState<20 | 50 | 100 | 200>(20);
  const [started, setStarted] = useState(false);

  // Examen
  const [questions, setQuestions] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({});
  const [submitted, setSubmitted] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(secondsFor(qCount));

  // Construye Qs al iniciar
  const build = () => {
    const qs = buildQuestions(POOL, qCount);
    setQuestions(qs);
    setAnswers({});
    setSubmitted(false);
    setTimeLeft(secondsFor(qCount));
  };

  const start = () => {
    build();
    setStarted(true);
  };

  // Timer
  useEffect(() => {
    if (!started || submitted) return;
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(id);
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started, submitted]);

  const mmss = useMemo(() => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, "0");
    const s = (timeLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [timeLeft]);

  const selectChoice = (qid: string, idx: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qid]: prev[qid] === idx ? undefined : idx }));
  };

  const correctCount = useMemo(
    () =>
      questions.reduce((acc, q) => {
        const ai = answers[q.id];
        return acc + (ai === q.answerIndex ? 1 : 0);
      }, 0),
    [answers, questions]
  );

  const handleSubmit = (auto = false) => {
    setSubmitted(true);
    const total = questions.length;
    const score = correctCount;
    const pc = Math.round((score / Math.max(1, total)) * 100);

    Alert.alert(auto ? "Tiempo agotado" : "Mock test entregado", `Aciertos: ${score}/${total} (${pc}%)`, [
      { text: "Volver a N1 Home", onPress: () => nav.replace("N1Home") },
      { text: "Reintentar con mismos ajustes", onPress: () => start() },
    ]);
  };

  /* ------------------ UI ------------------ */
  const Header = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Mock Test · Kanji N1</Text>
      {started ? (
        <View style={styles.timerPill}>
          <Text style={styles.timerTxt}>{mmss}</Text>
        </View>
      ) : null}
    </View>
  );

  if (!started) {
    return (
      <View style={styles.wrap}>
        <StatusBar barStyle="light-content" />
        <Header />

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>200 Kanji N1</Text>
          <Text style={styles.heroSub}>Genera un examen simulado solo de kanji: lecturas y significado.</Text>

          <Text style={styles.section}>Número de preguntas</Text>
          <View style={styles.qtyRow}>
            <QtyBtn label="20" active={qCount === 20} onPress={() => setQCount(20)} />
            <QtyBtn label="50" active={qCount === 50} onPress={() => setQCount(50)} />
            <QtyBtn label="100" active={qCount === 100} onPress={() => setQCount(100)} />
            <QtyBtn label="200" active={qCount === 200} onPress={() => setQCount(200)} />
          </View>

          <View style={{ height: 10 }} />

          <Pressable style={styles.primaryBtn} onPress={start}>
            <Text style={styles.primaryTxt}>Comenzar</Text>
          </Pressable>
          <Pressable
            style={[styles.secondaryBtn, { marginTop: 10 }]}
            onPress={() => nav.replace("N1Home")}
          >
            <Text style={styles.secondaryTxt}>Volver a N1 Home</Text>
          </Pressable>

          <Text style={styles.tinyNote}>
            Tiempo asignado: {Math.round(secondsFor(qCount) / 60)} min (≈25 s por pregunta / mínimo 10 min).
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <StatusBar barStyle="light-content" />
      <Header />

      <FlatList
        data={questions}
        keyExtractor={(q) => q.id}
        contentContainerStyle={{ padding: 14, paddingBottom: 120 }}
        renderItem={({ item: q, index }) => {
          const selected = answers[q.id];
          return (
            <View style={styles.card}>
              <Text style={styles.qMeta}>
                {index + 1}/{questions.length} · {labelFor(q.kind)}
              </Text>
              <Text style={styles.prompt}>{q.prompt}</Text>

              <View style={{ gap: 8, marginTop: 8 }}>
                {q.choices.map((c, i) => {
                  const isSel = selected === i;
                  const isCorrect = submitted && i === q.answerIndex;
                  const isWrong = submitted && isSel && i !== q.answerIndex;

                  let bg = "#101827";
                  if (isSel) bg = "#2742A0";
                  if (isCorrect) bg = "#1F7A3D";
                  if (isWrong) bg = "#7A1F1F";

                  return (
                    <Pressable
                      key={i}
                      style={[styles.choice, { backgroundColor: bg }]}
                      onPress={() => selectChoice(q.id, i)}
                    >
                      <Text style={styles.choiceTxt}>{c}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {submitted && q.ref ? (
                <Text style={styles.tip}>💡 Referencia: {q.ref.k}{q.ref.es ? `（${q.ref.es}）` : ""}</Text>
              ) : null}
            </View>
          );
        }}
      />

      <View style={styles.bottomBar}>
        {!submitted ? (
          <Pressable style={styles.primaryBtn} onPress={() => handleSubmit(false)}>
            <Text style={styles.primaryTxt}>Entregar</Text>
          </Pressable>
        ) : (
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              style={[styles.secondaryBtn, { flex: 1 }]}
              onPress={() => nav.replace("N1Home")}
            >
              <Text style={styles.secondaryTxt}>Volver a N1 Home</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryBtn, { flex: 1 }]}
              onPress={() => start()}
            >
              <Text style={styles.primaryTxt}>Nuevo mock</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

/* ------------------ SUBS ------------------ */
function labelFor(kind: Q["kind"]) {
  switch (kind) {
    case "on": return "音読み";
    case "kun": return "訓読み";
    case "es": return "意味（ES）";
    case "kanjiFromES": return "ES→漢字";
  }
}

function QtyBtn({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.qtyBtn,
        active && { backgroundColor: "rgba(100,116,255,0.24)", borderColor: "rgba(100,116,255,0.85)" }
      ]}
    >
      <Text style={[styles.qtyTxt, active && { color: "#E7EBFF", fontWeight: "900" }]}>{label}</Text>
    </Pressable>
  );
}

/* ------------------ STYLES ------------------ */
const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#0B0F19" },

  header: {
    height: 64 + (StatusBar.currentHeight ?? 0),
    paddingTop: (StatusBar.currentHeight ?? 0),
    paddingHorizontal: 16,
    backgroundColor: "#0B0F19",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  headerTitle: { color: "#FFFFFF", fontWeight: "900", fontSize: 16, letterSpacing: 0.3 },

  hero: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 10 },
  heroTitle: { color: "white", fontSize: 22, fontWeight: "900" },
  heroSub: { color: "rgba(255,255,255,0.78)", textAlign: "center" },

  section: { color: "#CFE4FF", fontWeight: "900", marginTop: 16, marginBottom: 8, letterSpacing: 0.3 },
  qtyRow: { flexDirection: "row", gap: 8 },

  qtyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  qtyTxt: { color: "#C7D2FE", fontWeight: "800" },

  card: {
    backgroundColor: "#111727",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 14,
    marginBottom: 12,
  },
  qMeta: { color: "rgba(255,255,255,0.6)", fontWeight: "800", marginBottom: 6 },
  prompt: { color: "white", fontSize: 16, fontWeight: "900", lineHeight: 22 },

  choice: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  choiceTxt: { color: "#EAF1FF", fontWeight: "800" },
  tip: { color: "rgba(255,255,255,0.75)", marginTop: 8, fontStyle: "italic" },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 14,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  primaryBtn: {
    backgroundColor: "#2B7FFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryTxt: { color: "#EAF1FF", fontWeight: "900", letterSpacing: 0.3 },

  secondaryBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryTxt: { color: "rgba(255,255,255,0.9)", fontWeight: "900", letterSpacing: 0.3 },

  tinyNote: { color: "rgba(255,255,255,0.55)", marginTop: 8, fontSize: 12, textAlign: "center" },
});
