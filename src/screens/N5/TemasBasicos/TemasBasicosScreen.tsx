import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Headphones,
  Info,
  ListChecks,
  Play,
  Quote,
  Shuffle,
  Sparkles,
} from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { RootStackParamList } from "../../../../types";

/** 🔊 Sonidos (tu hook) */
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

type Nav = NativeStackNavigationProp<RootStackParamList>;
const { width: W } = Dimensions.get("window");

/* ---------- UI simples ---------- */
function SectionHead({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <View className="sectionHead" style={styles.sectionHead}>
      {icon}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function ActivityItem({
  icon,
  title,
  subtitle,
  expanded,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable style={styles.activity} onPress={onToggle}>
      <View style={styles.activityIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activitySub}>{subtitle}</Text>
      </View>
      {expanded ? <ChevronUp size={18} color="#0b2e59" /> : <ChevronDown size={18} color="#0b2e59" />}
    </Pressable>
  );
}

/* ---------- DATA ---------- */
const COUNTRIES = [
  { country: "nihon", nat: "nihonjin", es: "Japón / japonés(a)" },
  { country: "mekishiko", nat: "mekishikojin", es: "México / mexicano(a)" },
  { country: "amerika", nat: "amerikajin", es: "EE.UU. / estadounidense" },
  { country: "supein", nat: "supeinjin", es: "España / español(a)" },
] as const;

const COLOR_ES: Record<string, string> = {
  aka: "rojo",
  ao: "azul",
  midori: "verde",
  kiiro: "amarillo",
  shiro: "blanco",
  kuro: "negro",
};
const SHAPE_ES: Record<string, string> = {
  maru: "círculo",
  sankaku: "triángulo",
  shikaku: "cuadrado",
  hoshi: "estrella",
};
const COLORS = Object.keys(COLOR_ES) as (keyof typeof COLOR_ES)[];
const SHAPES = Object.keys(SHAPE_ES) as (keyof typeof SHAPE_ES)[];
const FOODS = ["ramen", "sushi", "tenpura", "yasai", "niku", "koohii", "ocha", "sakana", "miruku"] as const;

type Q = { q: string; choices: string[]; a: number; why: string; es: string };
const QUIZ: Q[] = [
  {
    q: "¿Cómo dices ‘Soy japonés(a)’?",
    choices: ["watashi wa nihonjin desu", "watashi wa nihon desu"],
    a: 0,
    why: "Para nacionalidad se usa [país]+jin → nihonjin (japonés).",
    es: "“Soy japonés(a)”.",
  },
  {
    q: "‘americano(a)’ en romaji:",
    choices: ["amerika", "amerikajin"],
    a: 1,
    why: "El sufijo -jin forma la nacionalidad: amerikajin = ‘estadounidense’.",
    es: "amerikajin = estadounidense.",
  },
  {
    q: "Color ‘kiiro’:",
    choices: ["amarillo", "verde"],
    a: 0,
    why: "kiiro = ‘amarillo’.",
    es: "kiiro → amarillo.",
  },
  {
    q: "Forma ‘sankaku’:",
    choices: ["triángulo", "cuadrado"],
    a: 0,
    why: "sankaku = ‘triángulo’.",
    es: "sankaku → triángulo.",
  },
  {
    q: "Frase de gusto correcta:",
    choices: ["ramen ga suki desu", "ramen wa suki desu"],
    a: 0,
    why: "El elemento que ‘te gusta’ lleva が (ga) antes de suki desu.",
    es: "“Me gusta el ramen”.",
  },
  {
    q: "‘shiro’ es…",
    choices: ["blanco", "negro"],
    a: 0,
    why: "shiro = ‘blanco’.",
    es: "shiro → blanco.",
  },
  {
    q: "‘hoshi’ es…",
    choices: ["estrella", "círculo"],
    a: 0,
    why: "hoshi = ‘estrella’.",
    es: "hoshi → estrella.",
  },
  {
    q: "‘mekishiko’ significa…",
    choices: ["México", "mexicano(a)"],
    a: 0,
    why: "‘mekishiko’ es el país (México). La nacionalidad sería mekishikojin.",
    es: "mekishiko → México.",
  },
  {
    q: "Completa: ___ ga suki desu.",
    choices: ["sushi", "sukidesu"],
    a: 0,
    why: "La estructura es [NOMBRE] + ga + suki desu.",
    es: "sushi ga suki desu → Me gusta el sushi.",
  },
  {
    q: "‘miruku’ es…",
    choices: ["leche", "té"],
    a: 0,
    why: "miruku = ‘leche’.",
    es: "miruku → leche.",
  },
];

/* ========================================================= */
export default function TemasBasicosScreen() {
  const navigation = useNavigation<Nav>();
  const { playCorrect, playWrong, ready } = useFeedbackSounds();

  const scrollRef = useRef<ScrollView>(null);
  const anchors = useRef<Record<string, number>>({});
  const saveAnchor = useCallback((key: string) => (e: LayoutChangeEvent) => {
    anchors.current[key] = e.nativeEvent.layout.y;
  }, []);
  const scrollTo = useCallback((key: string) => {
    const y = anchors.current[key] ?? 0;
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
  }, []);

  // Paneles
  const [open, setOpen] = useState<Record<string, boolean>>({
    a1: false, a2: false, a3: false, a4: false, a5: false,
  });
  const toggle = (k: keyof typeof open) => setOpen(s => ({ ...s, [k]: !s[k] }));

  /* ====== A1: Flashcards ====== */
  const [idxFC, setIdxFC] = useState(0);
  const [showNat, setShowNat] = useState(false);

  /* ====== A2: Listening ====== */
  const [promptLS, setPromptLS] = useState<{ type: "color" | "shape"; value: string } | null>(null);
  const [fbLS, setFbLS] = useState<{ ok: boolean; why: string; es: string } | null>(null);

  /* ====== A3: Matching ====== */
  const [choiceFood, setChoiceFood] = useState<string | null>(null);

  /* ====== A4: Constructor ====== */
  const TOK_SUBJ = ["watashi", "anata", "tomodachi", "sensei"];
  const [suj, setSuj] = useState<string | null>(null);
  const [obj, setObj] = useState<string | null>(null);
  const [fbBuild, setFbBuild] = useState<{ ok: boolean; why: string; es: string } | null>(null);

  /* ====== A5: Quiz ====== */
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [fbQuiz, setFbQuiz] = useState<{ ok: boolean; why: string; es: string } | null>(null);

  /* ---------- Handlers ---------- */
  const nextFC = () => { setShowNat(false); setIdxFC((i) => (i + 1) % COUNTRIES.length); };

  const askLS = () => {
    const pool = Math.random() < 0.6 ? COLORS : SHAPES;
    const val = pool[Math.floor(Math.random() * pool.length)];
    setPromptLS({ type: pool === COLORS ? "color" : "shape", value: val });
    setFbLS(null);
  };
  const checkLS = async (ans: string) => {
    if (!promptLS) return;
    const isColor = promptLS.type === "color";
    const dict = isColor ? COLOR_ES : SHAPE_ES;
    const ok = ans === promptLS.value;
    ok ? await playCorrect() : await playWrong();
    setFbLS({
      ok,
      why: ok
        ? `Coincide con el prompt: “${promptLS.value}” es ${isColor ? "color" : "forma"} correcta.`
        : `El prompt pedía “${promptLS.value}”. Tu elección fue “${ans}”.`,
      es: isColor
        ? `${promptLS.value} = ${dict[promptLS.value]}`
        : `${promptLS.value} = ${dict[promptLS.value]}`,
    });
  };

  const makeSentence = (food: string) => `${food} ga suki desu.`;
  const selectFood = (f: string) => setChoiceFood(f);

  const tryBuild = async () => {
    const ok = !!(suj && obj);
    ok ? await playCorrect() : await playWrong();
    if (ok) {
      setFbBuild({
        ok: true,
        why: "Estructura: [TEMA] wa [OBJETO] ga suki desu. El objeto que ‘te gusta’ usa が (ga).",
        es: `${suj} wa ${obj} ga suki desu. = “A ${suj === "watashi" ? "mí" : suj} le gusta ${obj}”.`,
      });
    } else {
      setFbBuild({
        ok: false,
        why: "Falta seleccionar sujeto y comida para formar la oración completa.",
        es: "Ej.: watashi wa sushi ga suki desu. = “Me gusta el sushi”.",
      });
    }
  };

  const answerQ = async (i: number) => {
    const cur = QUIZ[qi];
    const ok = i === cur.a;
    ok ? setScore(s => s + 1) : null;
    ok ? await playCorrect() : await playWrong();
    setFbQuiz({ ok, why: cur.why, es: cur.es });
    // avanzar a la siguiente tras un breve momento visual (sin setTimeout para mantenerlo simple)
    setQi(n => (n + 1) % QUIZ.length);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#1e1230" }}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.c} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.kicker}>Temas básicos (N5) ✿</Text>
          <Text style={styles.h1}>N5 — Temas y Gramática</Text>
          <Text style={styles.lead}>
            Países y nacionalidades, colores, formas y comida.{"\n"}
            Todo en <Text style={styles.bold}>romaji</Text>, simple y con ejemplos.{"\n"}
            Después practica con <Text style={styles.bold}>5 actividades</Text> en esta misma pantalla.
          </Text>
          {!ready && <Text style={{ color: "#fff", marginTop: 6, opacity: 0.7 }}>Cargando sonidos…</Text>}
        </View>

        {/* Teoría: País / Nacionalidad */}
        <View style={styles.card} onLayout={saveAnchor("theory")}>
          <Text style={styles.cardTitle}>País y nacionalidad</Text>
          <Text style={styles.rule}>
            <Text style={styles.bold}>Estructura:</Text> {"[país] + jin"} → nacionalidad.{"\n"}
            <Text style={styles.mono}>watashi wa nihonjin desu</Text> = soy japonés(a).{"\n"}
            <Text style={styles.mono}>anata wa doko no hito desu ka?</Text> = ¿de qué país eres?
          </Text>
          <Text style={styles.examplesTitle}>Vocabulario básico</Text>
          <Text style={styles.bullets}>
            • nihon / nihonjin — Japón / japonés(a){"\n"}
            • mekishiko / mekishikojin — México / mexicano(a){"\n"}
            • amerika / amerikajin — EE.UU. / estadounidense{"\n"}
            • supein / supeinjin — España / español(a)
          </Text>
        </View>

        {/* Colores y Formas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Colores y formas</Text>
          <Text style={styles.rule}>
            <Text style={styles.bold}>Colores:</Text> aka, ao, midori, kiiro, shiro, kuro.{"\n"}
            <Text style={styles.bold}>Formas:</Text> maru (círculo), sankaku (triángulo), shikaku (cuadrado), hoshi (estrella).
          </Text>
          <Text style={styles.examplesTitle}>Frases rápidas</Text>
          <Text style={styles.bullets}>
            • ringo wa <Text style={styles.mono}>aka</Text> desu.{"\n"}
            • sora wa <Text style={styles.mono}>ao</Text> desu.{"\n"}
            • booru wa <Text style={styles.mono}>maru</Text> desu.
          </Text>
        </View>

        {/* Gramática suki */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>“ga suki desu” / “suki janai” / “suki ja arimasen”</Text>
          <Text style={styles.rule}>
            <Text style={styles.bold}>Me gusta:</Text> <Text style={styles.mono}>NOUN + ga suki desu</Text>{"\n"}
            <Text style={styles.bold}>No me gusta (informal):</Text> <Text style={styles.mono}>NOUN + wa suki janai</Text>{"\n"}
            <Text style={styles.bold}>No me gusta (formal):</Text> <Text style={styles.mono}>NOUN + wa suki ja arimasen</Text>
          </Text>

          <View style={styles.examplesBlock}>
            <View style={styles.exampleHeader}>
              <Quote size={16} color="#1e1230" />
              <Text style={styles.examplesTitleDark}>5 oraciones de ejemplo</Text>
            </View>
            <Text style={styles.examples}>
              1) ramen <Text style={styles.mono}>ga suki desu</Text>.{"\n"}
              2) sushi <Text style={styles.mono}>ga suki desu</Text>.{"\n"}
              3) koohii <Text style={styles.mono}>ga suki desu</Text>.{"\n"}
              4) yasai <Text style={styles.mono}>ga suki desu</Text>.{"\n"}
              5) miruku <Text style={styles.mono}>ga suki desu</Text>.
            </Text>
          </View>
        </View>

        {/* ---------- ACTIVIDADES ---------- */}
        <SectionHead icon={<Sparkles size={16} color="#0b2e59" />} title="Actividades" />

        {/* A1: Flashcards */}
        <ActivityItem
          icon={<BookOpen size={20} color="#0b2e59" />}
          title="Flashcards de países y nacionalidades"
          subtitle="Romaji ↔ significado. Toca para voltear."
          expanded={open.a1}
          onToggle={() => toggle("a1")}
        />
        {open.a1 && (
          <View style={styles.panel} onLayout={saveAnchor("a1")}>
            <Text style={styles.panelText}>
              País: <Text style={styles.mono}>{COUNTRIES[idxFC].country}</Text> — {COUNTRIES[idxFC].es}
            </Text>
            <Pressable style={styles.btn} onPress={() => setShowNat(v => !v)}>
              <Play size={16} color="#fff" />
              <Text style={styles.btnTxt}>{showNat ? "Ocultar nacionalidad" : "Ver nacionalidad"}</Text>
            </Pressable>
            {showNat && (
              <View style={[styles.fbBox, { marginTop: 8 }]}>
                <Info size={16} color="#0b2e59" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.fbWhy}>
                    <Text style={styles.bold}>Por qué:</Text> {COUNTRIES[idxFC].country}+jin →{" "}
                    <Text style={styles.mono}>{COUNTRIES[idxFC].nat}</Text>.
                  </Text>
                  <Text style={styles.fbEs}>
                    <Text style={styles.bold}>Traducción:</Text> {COUNTRIES[idxFC].nat} = nacionalidad de {COUNTRIES[idxFC].es.split("/")[0].trim()}.
                  </Text>
                </View>
              </View>
            )}
            <Pressable style={[styles.btn, { backgroundColor: "#0b2e59" }]} onPress={nextFC}>
              <Text style={styles.btnTxt}>Siguiente</Text>
            </Pressable>
          </View>
        )}

        {/* A2: Listening */}
        <ActivityItem
          icon={<Headphones size={20} color="#0b2e59" />}
          title="Listening de colores y formas"
          subtitle="Elige lo que ‘escuchas’ (prompt)."
          expanded={open.a2}
          onToggle={() => toggle("a2")}
        />
        {open.a2 && (
          <View style={styles.panel} onLayout={saveAnchor("a2")}>
            <Pressable style={styles.btn} onPress={askLS}>
              <Play size={16} color="#fff" />
              <Text style={styles.btnTxt}>Nueva indicación</Text>
            </Pressable>
            {promptLS && (
              <Text style={[styles.panelText, { marginTop: 6 }]}>
                Indicador: <Text style={styles.mono}>{promptLS.value}</Text>
              </Text>
            )}
            <View style={styles.gridChoices}>
              {[...COLORS, ...SHAPES].map((opt) => (
                <Pressable key={opt} style={styles.choice} onPress={() => checkLS(opt)}>
                  <Text style={styles.choiceTxt}>{opt}</Text>
                </Pressable>
              ))}
            </View>
            {fbLS && (
              <View style={[styles.fbBox, { marginTop: 10, borderColor: fbLS.ok ? "#2aa6ff" : "#e57373" }]}>
                <Info size={16} color="#0b2e59" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.fbWhy}><Text style={styles.bold}>{fbLS.ok ? "Correcto:" : "Incorrecto:"}</Text> {fbLS.why}</Text>
                  <Text style={styles.fbEs}><Text style={styles.bold}>Traducción:</Text> {fbLS.es}.</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* A3: Matching (sin negación) */}
        <ActivityItem
          icon={<Shuffle size={20} color="#0b2e59" />}
          title="Matching: comida → frase de gusto"
          subtitle='Elige comida y se construye “NOUN ga suki desu”.'
          expanded={open.a3}
          onToggle={() => toggle("a3")}
        />
        {open.a3 && (
          <View style={styles.panel} onLayout={saveAnchor("a3")}>
            <View style={styles.gridChoices}>
              {FOODS.map((f) => (
                <Pressable key={f} style={[styles.choice, choiceFood === f && styles.choiceActive]} onPress={() => selectFood(f)}>
                  <Text style={styles.choiceTxt}>{f}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.panelText, { marginTop: 8 }]}>
              Oración: <Text style={styles.mono}>{choiceFood ? `${choiceFood} ga suki desu.` : "—"}</Text>
            </Text>
            {choiceFood && (
              <View style={[styles.fbBox, { marginTop: 8 }]}>
                <Info size={16} color="#0b2e59" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.fbWhy}>
                    <Text style={styles.bold}>Por qué:</Text> el elemento que te gusta va con が (ga) antes de{" "}
                    <Text style={styles.mono}>suki desu</Text>.
                  </Text>
                  <Text style={styles.fbEs}>
                    <Text style={styles.bold}>Traducción:</Text> “Me gusta {choiceFood}”.
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* A4: Constructor */}
        <ActivityItem
          icon={<ListChecks size={20} color="#0b2e59" />}
          title="Constructor de oraciones"
          subtitle="Selecciona sujeto y comida → genera la frase."
          expanded={open.a4}
          onToggle={() => toggle("a4")}
        />
        {open.a4 && (
          <View style={styles.panel} onLayout={saveAnchor("a4")}>
            <Text style={styles.panelText}>1) Sujeto:</Text>
            <View style={styles.gridChoices}>
              {["watashi", "anata", "tomodachi", "sensei"].map((t) => (
                <Pressable key={t} style={[styles.choice, suj === t && styles.choiceActive]} onPress={() => setSuj(t)}>
                  <Text style={styles.choiceTxt}>{t}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.panelText, { marginTop: 8 }]}>2) Objeto (comida):</Text>
            <View style={styles.gridChoices}>
              {FOODS.map((t) => (
                <Pressable key={t} style={[styles.choice, obj === t && styles.choiceActive]} onPress={() => setObj(t)}>
                  <Text style={styles.choiceTxt}>{t}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={[styles.btn, { marginTop: 10 }]} onPress={tryBuild}>
              <Check size={16} color="#fff" />
              <Text style={styles.btnTxt}>Probar</Text>
            </Pressable>

            <Text style={[styles.panelText, { marginTop: 8 }]}>
              Resultado:{" "}
              <Text style={styles.mono}>
                {suj && obj ? `${suj} wa ${obj} ga suki desu.` : "— Selecciona sujeto y comida —"}
              </Text>
            </Text>

            {fbBuild && (
              <View style={[styles.fbBox, { marginTop: 8, borderColor: fbBuild.ok ? "#2aa6ff" : "#e57373" }]}>
                <Info size={16} color="#0b2e59" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.fbWhy}><Text style={styles.bold}>{fbBuild.ok ? "Correcto:" : "Atención:"}</Text> {fbBuild.why}</Text>
                  <Text style={styles.fbEs}><Text style={styles.bold}>Traducción:</Text> {fbBuild.es}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* A5: Quick Quiz */}
        <ActivityItem
          icon={<Sparkles size={20} color="#0b2e59" />}
          title="Quick Quiz (10 ítems)"
          subtitle="Opción múltiple con explicación y traducción."
          expanded={open.a5}
          onToggle={() => toggle("a5")}
        />
        {open.a5 && (
          <View style={styles.panel} onLayout={saveAnchor("a5")}>
            <Text style={styles.panelText}>Puntaje: {score}/{QUIZ.length}</Text>
            <Text style={[styles.panelText, { marginBottom: 8 }]}>{QUIZ[qi].q}</Text>
            {QUIZ[qi].choices.map((c, i) => (
              <Pressable key={i} style={styles.btnAlt} onPress={() => answerQ(i)}>
                <Text style={styles.btnAltTxt}>{c}</Text>
              </Pressable>
            ))}
            {fbQuiz && (
              <View style={[styles.fbBox, { marginTop: 10, borderColor: fbQuiz.ok ? "#2aa6ff" : "#e57373" }]}>
                <Info size={16} color="#0b2e59" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.fbWhy}><Text style={styles.bold}>{fbQuiz.ok ? "Correcto:" : "Incorrecto:"}</Text> {fbQuiz.why}</Text>
                  <Text style={styles.fbEs}><Text style={styles.bold}>Traducción:</Text> {fbQuiz.es}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
  );
}

/* ============ styles ============ */
const CARD_BG = "rgba(255,255,255,0.96)";
const styles = StyleSheet.create({
  c: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 36 },
  hero: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    marginBottom: 14,
  },
  kicker: { color: "#7ad0ff", fontSize: 12, letterSpacing: 1, fontWeight: "800", marginBottom: 6 },
  h1: { color: "#0b2e59", fontSize: 22, fontWeight: "900", marginBottom: 6 },
  lead: { color: "#0b2e59", opacity: 0.95, lineHeight: 22 },
  bold: { fontWeight: "900" },
  mono: { fontFamily: "System", fontWeight: "700" },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(11,46,89,0.12)",
    marginBottom: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: "900", color: "#0b2e59", marginBottom: 8 },
  rule: { color: "#0b2e59", opacity: 0.95, lineHeight: 24, marginBottom: 12 },
  bullets: { color: "#0b2e59", lineHeight: 24 },
  examplesTitle: { fontWeight: "900", color: "#0b2e59", marginBottom: 6 },
  examplesTitleDark: { fontWeight: "900", color: "#1e1230", marginLeft: 6 },
  examples: { color: "#1e1230", lineHeight: 24 },
  examplesBlock: { backgroundColor: "rgba(122,208,255,0.30)", borderRadius: 14, padding: 12 },
  exampleHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },

  sectionHead: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(11,46,89,0.12)",
    marginTop: 6,
    marginBottom: 8,
  },
  sectionTitle: { color: "#0b2e59", fontWeight: "900", fontSize: 16 },

  activity: {
    width: W - 32,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(11,46,89,0.12)",
    padding: 12,
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(163,216,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  activityTitle: { fontWeight: "900", color: "#0b2e59", marginBottom: 2 },
  activitySub: { color: "#0b2e59", opacity: 0.9, lineHeight: 20 },

  panel: {
    width: W - 32,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(11,46,89,0.12)",
    padding: 12,
    marginTop: -4,
    marginBottom: 10,
  },
  panelText: { color: "#0b2e59", lineHeight: 22 },

  gridChoices: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  choice: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(11,46,89,0.18)",
    backgroundColor: "rgba(163,216,255,0.35)",
  },
  choiceActive: { backgroundColor: "rgba(122,208,255,0.7)" },

  btn: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#2aa6ff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  btnTxt: { color: "#fff", fontWeight: "900" },

  btnAlt: {
    borderWidth: 1,
    borderColor: "rgba(11,46,89,0.18)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 6,
    backgroundColor: "rgba(163,216,255,0.35)",
  },
  btnAltTxt: { color: "#0b2e59", fontWeight: "800" },

  fbBox: {
    flexDirection: "row",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "rgba(42,166,255,0.6)",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "rgba(163,216,255,0.25)",
    alignItems: "flex-start",
  },
  fbWhy: { color: "#0b2e59", lineHeight: 20 },
  fbEs: { color: "#0b2e59", opacity: 0.95, marginTop: 4 },
});
