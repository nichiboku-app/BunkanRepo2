// src/screens/N2/N2_B2_U3.tsx
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import UnitTemplate from "./UnitTemplate";

/* =========================================================
   Tipos + helpers
========================================================= */
type Nav = NativeStackNavigationProp<any>;
type Word = { jp: string; reading: string; es: string };
export type KanjiItem = {
  kanji: string;
  readingJP: string;
  meaningEs: string;
  hex?: string;
  strokeAsset?: any; // require(...) del webp con números
  words?: Word[];
};

const { width } = Dimensions.get("window");
const accent = "#9B1221";

/* ---------- TTS ---------- */
function speakJP(text: string) {
  try {
    Speech.stop();
    Speech.speak(text, { language: "ja-JP", rate: 0.98, pitch: 1.02 });
  } catch {}
}
function speakES(text: string) {
  try {
    Speech.stop();
    Speech.speak(text, { language: "es-MX", rate: 1.0, pitch: 1.0 });
  } catch {}
}

/* =========================================================
   Mapa estático de assets (evita require dinámico)
   (añade aquí los 12 kanji nuevos con _nums.webp)
========================================================= */
const STROKE_ASSETS: Record<string, any> = {
  // U3 — permisos, favores, disculpas
  "81f4": require("../../../assets/kanjivg/n2/81f4_nums.webp"), // 致
  "65ad": require("../../../assets/kanjivg/n2/65ad_nums.webp"), // 断 (断る)
  "7531": require("../../../assets/kanjivg/n2/7531_nums.webp"), // 由 (理由)
  "8a31": require("../../../assets/kanjivg/n2/8a31_nums.webp"), // 許 (許可)
  "9858": require("../../../assets/kanjivg/n2/9858_nums.webp"), // 願 (お願い)
  "8ff7": require("../../../assets/kanjivg/n2/8ff7_nums.webp"), // 迷 (迷惑)
  "60d1": require("../../../assets/kanjivg/n2/60d1_nums.webp"), // 惑 (迷惑)
  "6050": require("../../../assets/kanjivg/n2/6050_nums.webp"), // 恐 (恐れ入ります)
  "7e2e": require("../../../assets/kanjivg/n2/7e2e_nums.webp"), // 縮 (恐縮)
  "914d": require("../../../assets/kanjivg/n2/914d_nums.webp"), // 配 (配慮)
  "691c": require("../../../assets/kanjivg/n2/691c_nums.webp"), // 検 (検討)
  "78ba": require("../../../assets/kanjivg/n2/78ba_nums.webp"), // 確 (確認)
};

/* Helper: normaliza hex y busca asset */
function createKanji(
  kanji: string,
  readingJP: string,
  meaningEs: string,
  hex?: string,
  words: Word[] = []
): KanjiItem {
  const normalizedHex = hex ? hex.replace(/^0+/, "").toLowerCase() : undefined;
  const strokeAsset = normalizedHex ? STROKE_ASSETS[normalizedHex] : undefined;
  return { kanji, readingJP, meaningEs, hex: normalizedHex, strokeAsset, words };
}

/* =========================================================
   Gramática — audio (JP) + lecturas + traducción (ES)
========================================================= */
type GrammarExample = { jp: string; reading: string; es: string };
type GrammarPoint = { title: string; examples: GrammarExample[]; es: string };

/** Línea de ejemplo con:
 *  - Botón play para audio JP
 *  - Oración en japonés
 *  - Lectura en hiragana (toggle)
 *  - Traducción al español con bocina para TTS-ES
 */
function ExampleLine({
  ex,
  showReading,
}: {
  ex: GrammarExample;
  showReading: boolean;
}) {
  return (
    <View style={{ marginTop: 8 }}>
      <Pressable onPress={() => speakJP(ex.jp)} style={styles.exampleRow}>
        <View style={styles.playPill}>
          <MCI name="play" size={14} color="#111" />
        </View>
        <Text style={styles.jp}>・{ex.jp}</Text>
      </Pressable>

      {showReading && <Text style={styles.readingSmall}>{ex.reading}</Text>}

      <View style={styles.transRow}>
        <Pressable onPress={() => speakES(ex.es)} style={styles.playPillSm}>
          <MCI name="volume-high" size={14} color="#111" />
        </Pressable>
        <Text style={styles.esLine}>{ex.es}</Text>
      </View>
    </View>
  );
}

export const GRAMMAR_POINTS: GrammarPoint[] = [
  {
    title: "〜いたします（humilde de します）",
    examples: [
      {
        jp: "明日、改めてご連絡いたします。",
        reading: "あした、あらためて ごれんらく いたします。",
        es: "Mañana me pondré en contacto nuevamente.",
      },
      {
        jp: "資料を送付いたします。",
        reading: "しりょう を そうふ いたします。",
        es: "Le enviaré los documentos.",
      },
      {
        jp: "内容を確認いたします。",
        reading: "ないよう を かくにん いたします。",
        es: "Confirmaré el contenido.",
      },
      {
        jp: "少々、失礼いたします。",
        reading: "しょうしょう、しつれい いたします。",
        es: "Con permiso un momento.",
      },
    ],
    es: "Acciones propias en tono humilde/profesional. No implica pedir permiso.",
  },
  {
    title: "〜させていただきます（con permiso/afecta al otro）",
    examples: [
      {
        jp: "本日の会議は欠席させていただきます。",
        reading: "ほんじつ の かいぎ は けっせき させて いただきます。",
        es: "Con su permiso, me ausentaré de la reunión de hoy.",
      },
      {
        jp: "日程を再調整させていただきます。",
        reading: "にってい を さいちょうせい させて いただきます。",
        es: "Con su venia, reprogramaremos el calendario.",
      },
      {
        jp: "こちらの提案で進行させていただきます。",
        reading: "こちら の ていあん で しんこう させて いただきます。",
        es: "Con su autorización, procederemos con esta propuesta.",
      },
    ],
    es: "Anuncia una acción propia que requiere permiso o impacta al receptor.",
  },
  {
    title: "Pedir permiso (directo)",
    examples: [
      {
        jp: "録音させていただけますか。",
        reading: "ろくおん させて いただけます か。",
        es: "¿Me permitiría grabar, por favor?",
      },
      {
        jp: "明日はオンライン参加させてください。",
        reading: "あした は オンライン さんか させて ください。",
        es: "Permítame participar en línea mañana, por favor.",
      },
      {
        jp: "もう一日だけお時間をいただけますでしょうか。",
        reading: "もう いちにち だけ おじかん を いただけます でしょう か。",
        es: "¿Podría concedernos un día más, por favor?",
      },
    ],
    es: "Solicitudes suaves. 〜させていただけますか es más formal que 〜させてください。",
  },
  {
    title: "Negarse / disculparse con cortesía",
    examples: [
      {
        jp: "誠に恐れ入りますが、今回は参加いたしかねます。",
        reading: "まことに おそれいります が、こんかい は さんか いたしかねます。",
        es: "Con todo respeto, en esta ocasión no podré participar.",
      },
      {
        jp: "大変恐縮ですが、明日のご依頼には対応いたしかねます。",
        reading: "たいへん きょうしゅく です が、あした の ごいらい に は たいおう いたしかねます。",
        es: "Lamento mucho informarle que no podré atender su solicitud de mañana.",
      },
      {
        jp: "ご迷惑をおかけし、誠に申し訳ございません。",
        reading: "ごめいわく を おかけ し、まことに もうしわけ ございません。",
        es: "Le ofrezco una sincera disculpa por las molestias.",
      },
    ],
    es: "〜いたしかねます: ‘no puedo (hacerlo)’ en registro muy formal.",
  },
];

function GrammarBox() {
  const [showReadings, setShowReadings] = useState(true);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Gramática — 「〜させていただきます」vs「〜いたします」</Text>
      <Text style={styles.li}>
        Pista rápida: si tu acción afecta al receptor o “pide permiso implícito”, usa{" "}
        <Text style={{ fontWeight: "900" }}>〜させていただきます</Text>. Si solo informas tu acción con
        humildad, usa <Text style={{ fontWeight: "900" }}>〜いたします</Text>.
      </Text>

      {/* Toggle lecturas */}
      <Pressable
        onPress={() => setShowReadings((s) => !s)}
        style={[styles.toggleRow, { alignSelf: "flex-start", marginTop: 6 }]}
        accessibilityRole="button"
        accessibilityLabel="Mostrar u ocultar lecturas"
      >
        <View style={[styles.toggleDot, { backgroundColor: showReadings ? "#16A34A" : "#9CA3AF" }]} />
        <Text style={styles.toggleTxt}>Lecturas: {showReadings ? "ON" : "OFF"}</Text>
      </Pressable>

      {GRAMMAR_POINTS.map((g, idx) => (
        <View key={idx} style={[styles.example, { marginTop: 10 }]}>
          <Text style={[styles.cardTitle, { fontSize: 15 }]}>{g.title}</Text>

          {g.examples.map((ex, i) => (
            <ExampleLine key={i} ex={ex} showReading={showReadings} />
          ))}

          <Text style={[styles.es, { marginTop: 8 }]}>{g.es}</Text>
        </View>
      ))}
    </View>
  );
}

/* =========================================================
   Kanji (12)
========================================================= */
const KANJI_U3: KanjiItem[] = [
  createKanji("致", "いた(す)", "hacer (hum.)", "81f4", [
    { jp: "致します", reading: "いたします", es: "hacer (hum.)" },
  ]),
  createKanji("断", "ことわ(る)／だん", "rechazar; cortar", "65ad", [
    { jp: "お断り", reading: "おことわり", es: "disculpa/negativa" },
    { jp: "断念", reading: "だんねん", es: "renunciar (a un plan)" },
  ]),
  createKanji("由", "ゆ／よし", "motivo; razón", "7531", [
    { jp: "理由", reading: "りゆう", es: "razón" },
  ]),
  createKanji("許", "ゆる(す)／きょ", "permitir", "8a31", [
    { jp: "許可", reading: "きょか", es: "permiso" },
  ]),
  createKanji("願", "ねが(う)／がん", "pedir; desear", "9858", [
    { jp: "お願い", reading: "おねがい", es: "favor; por favor" },
  ]),
  createKanji("迷", "まよ(う)／めい", "dudar; molestar", "8ff7", [
    { jp: "迷惑", reading: "めいわく", es: "molestia" },
  ]),
  createKanji("惑", "まど(う)／わく", "confundir", "60d1", [
    { jp: "惑わす", reading: "まどわす", es: "confundir" },
  ]),
  createKanji("恐", "おそ(れる)／きょう", "temer; disculparse", "6050", [
    { jp: "恐れ入ります", reading: "おそれいります", es: "disculpe (muy cortés)" },
  ]),
  createKanji("縮", "ちぢ(む)／しゅく", "encoger; modestia", "7e2e", [
    { jp: "恐縮", reading: "きょうしゅく", es: "con toda humildad; disculpas" },
  ]),
  createKanji("配", "くば(る)／はい", "distribuir; considerar", "914d", [
    { jp: "配慮", reading: "はいりょ", es: "consideración" },
  ]),
  createKanji("検", "けん", "examinar; estudiar", "691c", [
    { jp: "検討", reading: "けんとう", es: "considerar/discutir" },
  ]),
  createKanji("確", "たし(か)／かく", "seguro; confirmar", "78ba", [
    { jp: "確認", reading: "かくにん", es: "confirmación" },
  ]),
];

/* =========================================================
   Dinámica 1 — Simulación de entrevista
========================================================= */
function InterviewSimModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const cards = [
    {
      q: "自己紹介：はじめまして。田中と申します。本日はお時間を頂戴し、誠にありがとうございます。",
      good: "Humildad correcta（申します・頂戴）",
    },
    {
      q: "志望動機：御社の理念に共感し、微力ながら貢献できればと存じます。",
      good: "謙遜 + 意欲の言い方",
    },
    {
      q: "逆質問：本ポジションの評価基準について、差し支えなければお伺いできますでしょうか。",
      good: "差し支えなければ + お伺いできますでしょうか",
    },
  ];
  const [idx, setIdx] = useState(0);
  const item = cards[idx];

  useEffect(() => {
    if (visible) { setIdx(0); }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCardWhite}>
          <View style={styles.modalHeaderWhite}>
            <Text style={styles.modalTitleDark}>Simulación de entrevista</Text>
            <Pressable onPress={onClose} style={styles.closeBtnLight}>
              <MCI name="close" size={22} color="#111" />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
            <Text style={styles.jp} onPress={() => speakJP(item.q)}>{item.q}</Text>
            <Text style={[styles.es, { marginTop: 8 }]}>Punto a observar: {item.good}</Text>

            <View style={[styles.controlsRow, { marginTop: 16 }]}>
              <Pressable
                onPress={() => setIdx((i) => Math.max(0, i - 1))}
                style={[styles.ctrlBtn, { opacity: idx === 0 ? 0.5 : 1 }]}
                disabled={idx === 0}
              >
                <MCI name="arrow-left-bold" size={18} color="#fff" />
                <Text style={styles.ctrlTxt}>Anterior</Text>
              </Pressable>
              <Pressable
                onPress={() => setIdx((i) => Math.min(cards.length - 1, i + 1))}
                style={styles.ctrlBtn}
              >
                <MCI name="arrow-right-bold" size={18} color="#fff" />
                <Text style={styles.ctrlTxt}>Siguiente</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* =========================================================
   Dinámica 2 — Errores de etiqueta
========================================================= */
function EtiquetteGameModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const items = [
    { jp: "（電話）田中と「言います」。", ok: false, why: "En negocios: 田中と申します（humilde）。" },
    { jp: "（メール）内容を確認「いたします」。", ok: true, why: "Acción propia sin pedir permiso explícito." },
    { jp: "（メール）録音「させてください」。", ok: true, why: "Pedir permiso directo es correcto aquí." },
    { jp: "（連絡）明日の会議は欠席「させていただきます」。", ok: true, why: "Afecta al receptor → permiso implícito." },
    { jp: "（謝罪）誠に申し訳「ありません」。", ok: false, why: "Muy formal: 申し訳ございません。の方が無難。" },
  ];
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<boolean | null>(null);

  useEffect(() => { if (!visible) { setI(0); setPicked(null); } }, [visible]);

  const cur = items[i];
  const answer = (val: boolean) => setPicked(val);
  const next = () => { setI((x) => (x + 1) % items.length); setPicked(null); };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCardWhite}>
          <View style={styles.modalHeaderWhite}>
            <Text style={styles.modalTitleDark}>Juego: ¿Correcto o no?</Text>
            <Pressable onPress={onClose} style={styles.closeBtnLight}>
              <MCI name="close" size={22} color="#111" />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
            <Text style={styles.jp} onPress={() => speakJP(cur.jp)}>{cur.jp}</Text>

            <View style={[styles.controlsRow, { marginTop: 12 }]}>
              <Pressable onPress={() => answer(true)} style={[styles.ctrlBtn, { backgroundColor: "#065F46" }]}>
                <MCI name="check" size={18} color="#fff" />
                <Text style={styles.ctrlTxt}>Correcto</Text>
              </Pressable>
              <Pressable onPress={() => answer(false)} style={[styles.ctrlBtn, { backgroundColor: "#7C2D12" }]}>
                <MCI name="close" size={18} color="#fff" />
                <Text style={styles.ctrlTxt}>Incorrecto</Text>
              </Pressable>
            </View>

            {picked !== null && (
              <View style={[styles.explBox, { marginTop: 12 }]}>
                <Text style={{ color: "#111827", fontWeight: "900" }}>
                  {picked === cur.ok ? "✔ ¡Bien!" : "✖ Ojo…"}
                </Text>
                <Text style={{ color: "#374151", marginTop: 6 }}>{cur.why}</Text>
                <View style={[styles.controlsRow, { marginTop: 8 }]}>
                  <Pressable onPress={next} style={styles.ctrlBtn}>
                    <MCI name="arrow-right-bold" size={18} color="#fff" />
                    <Text style={styles.ctrlTxt}>Siguiente</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* =========================================================
   Dinámica 3 — Redacción de correo con feedback
========================================================= */
function EmailFeedbackModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [text, setText] = useState("");
  const [report, setReport] = useState<string[] | null>(null);

  useEffect(() => { if (!visible) { setText(""); setReport(null); } }, [visible]);

  const check = () => {
    const tips: string[] = [];
    const t = text;

    if (!/(申し訳ございません|失礼いたします|恐れ入ります)/.test(t)) {
      tips.push("Añade una fórmula de cortesía/disculpa (例: 恐れ入りますが／申し訳ございません).");
    }
    if (/(します。)/.test(t) && !/(いたします)/.test(t)) {
      tips.push("En negocios, prefiere 〜いたします (humilde) sobre 〜します en frases clave.");
    }
    if (/(欠席|変更|取り消)/.test(t) && !/(させていただきます)/.test(t)) {
      tips.push("Si ‘te permites’ una acción que afecta al receptor, usa 〜させていただきます。");
    }
    if (!/(ご確認|ご連絡|ご返信|ご査収)/.test(t)) {
      tips.push("Incluye una petición suave (例: ご確認いただけますと幸いです).");
    }
    if (!/(何卒|引き続き|よろしく)/.test(t)) {
      tips.push("Cierre: 何卒よろしくお願いいたします。など");
    }

    setReport(tips.length ? tips : ["¡Se ve muy bien! ✅ Mantén el registro y cortesía."]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCardWhite}>
          <View style={styles.modalHeaderWhite}>
            <Text style={styles.modalTitleDark}>Redacción con feedback</Text>
            <Pressable onPress={onClose} style={styles.closeBtnLight}>
              <MCI name="close" size={22} color="#111" />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
            <Text style={{ color: "#111827" }}>Escribe un mini correo (JP). Ej: avisar ausencia, pedir cambio de hora…</Text>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="例：恐れ入りますが、本日の会議を欠席させていただきます。..."
              placeholderTextColor="#9CA3AF"
              multiline
              style={styles.input}
            />
            <View style={[styles.controlsRow, { marginTop: 10 }]}>
              <Pressable onPress={check} style={styles.ctrlBtn}>
                <MCI name="spellcheck" size={18} color="#fff" />
                <Text style={styles.ctrlTxt}>Revisar</Text>
              </Pressable>
            </View>

            {report && (
              <View style={[styles.explBox, { marginTop: 10 }]}>
                {report.map((r, i) => (
                  <Text key={i} style={{ color: "#111827", marginBottom: 4 }}>• {r}</Text>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* =========================================================
   Modal Kanji (solo imagen + palabras)
========================================================= */
function KanjiModal({
  visible,
  onClose,
  data,
}: {
  visible: boolean;
  onClose: () => void;
  data: KanjiItem | null;
}) {
  if (!data) return null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCardWhite}>
          <View style={styles.modalHeaderWhite}>
            <Text style={styles.modalTitleDark}>{data.kanji}</Text>
            <Pressable onPress={onClose} style={styles.closeBtnLight}>
              <MCI name="close" size={22} color="#111" />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
            <Text style={styles.modalReadingDark} onPress={() => speakJP(data.readingJP)}>
              {data.readingJP} · {data.meaningEs} <Text style={{ opacity: 0.7 }}>(Toca para oír)</Text>
            </Text>

            {data.strokeAsset ? (
              <View style={{ alignItems: "center", marginTop: 10 }}>
                <ExpoImage
                  source={data.strokeAsset}
                  style={{
                    width: Math.min(width - 32, 330),
                    height: Math.min(width - 32, 330),
                    borderRadius: 16,
                    overflow: "hidden",
                    backgroundColor: "#fff",
                  }}
                  contentFit="contain"
                />
                <Text style={{ color: "#6B7280", fontSize: 12, textAlign: "center", marginTop: 6 }}>
                  Orden de trazos (KanjiVG)
                </Text>
              </View>
            ) : (
              <Text style={{ color: "#6B7280", marginTop: 10 }}>Sin imagen de trazos.</Text>
            )}

            <View style={{ marginTop: 16 }}>
              <Text style={styles.wordsTitleDark}>Palabras con「{data.kanji}」</Text>
              {(data.words ?? []).map((w, i) => (
                <Pressable key={i} onPress={() => speakJP(w.jp)} style={styles.wordItemLight}>
                  <Text style={styles.wordJpDark}>{w.jp}</Text>
                  <Text style={styles.wordReadingDark}>{w.reading}</Text>
                  <Text style={styles.wordEsDark}>{w.es}</Text>
                  <MCI name="play" size={18} color={accent} />
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* =========================================================
   Quiz final
========================================================= */
type QuizQ =
  | { type: "mc"; id: number; stem: string; options: string[]; answer: string; why: string }
  | { type: "fill"; id: number; stem: string; answer: string; why: string };

const QUIZ: QuizQ[] = [
  {
    type: "mc",
    id: 1,
    stem: "（欠席連絡）本日の会議は（　　）いただきます。",
    options: ["欠席させて", "欠席いたし", "欠席しますで"],
    answer: "欠席させて",
    why: "Afecta al receptor → させていただきます。",
  },
  {
    type: "mc",
    id: 2,
    stem: "（メール）資料を送付（　　）。",
    options: ["します", "いたします", "させてください"],
    answer: "いたします",
    why: "Acción propia estándar → いたします。",
  },
  {
    type: "fill",
    id: 3,
    stem: "（お願い）録音____か。",
    answer: "させていただけます",
    why: "Petición formal y suave。",
  },
];

function QuizModalUI({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const q = QUIZ[index];

  useEffect(() => {
    if (!visible) {
      setIndex(0);
      setAnswer(null);
      setScore(0);
    }
  }, [visible]);

  const check = (opt: string) => {
    if (answer !== null) return;
    setAnswer(opt);
    if (opt === q.answer) {
      setScore((s) => s + 1);
      speakES("¡Correcto!");
    } else {
      speakES("Respuesta incorrecta");
    }
  };

  const next = () => {
    if (index < QUIZ.length - 1) {
      setIndex(index + 1);
      setAnswer(null);
    } else {
      speakES(`Has terminado el quiz con ${score} puntos.`);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCardWhite}>
          <View style={styles.modalHeaderWhite}>
            <Text style={styles.modalTitleDark}>Quiz · Permisos & Disculpas</Text>
            <Pressable onPress={onClose} style={styles.closeBtnLight}>
              <MCI name="close" size={22} color="#111" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
            <Text style={{ color: "#111827", fontWeight: "900" }}>
              Pregunta {index + 1} / {QUIZ.length}
            </Text>
            <Text style={[styles.quizStem, { marginTop: 8 }]}>{q.stem}</Text>

            {"options" in q && q.type === "mc" && (
              <View style={{ gap: 8 }}>
                {q.options.map((opt, i) => {
                  const picked = answer === opt;
                  const ok = picked && opt === q.answer;
                  const wrong = picked && opt !== q.answer;
                  return (
                    <Pressable
                      key={i}
                      disabled={answer !== null}
                      onPress={() => check(opt)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: ok ? "#16A34A" : wrong ? "#DC2626" : picked ? "#111827" : "#F3F4F6",
                          borderColor: ok || wrong ? "transparent" : "#E5E7EB",
                        },
                      ]}
                    >
                      <Text style={{ color: ok || wrong ? "#fff" : picked ? "#fff" : "#111", fontWeight: "800" }}>
                        {opt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {q.type === "fill" && (
              <View style={{ marginTop: 8 }}>
                <Pressable
                  onPress={() => check(q.answer)}
                  style={[styles.fillBox, { backgroundColor: answer ? "#F9FAFB" : "#fff" }]}
                >
                  <Text style={{ color: "#111827" }}>
                    {answer ? q.stem.replace("____", q.answer) : q.stem}
                  </Text>
                </Pressable>
                {!answer && (
                  <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 4 }}>(Toca para ver la respuesta)</Text>
                )}
              </View>
            )}

            {answer && (
              <View style={styles.explBox}>
                <Text style={{ color: "#111827", fontWeight: "900" }}>
                  {answer === q.answer ? "✔ Correcto" : "✖ Incorrecto"}
                </Text>
                {"why" in q && <Text style={{ color: "#374151", marginTop: 4 }}>{q.why}</Text>}
              </View>
            )}

            <View style={[styles.controlsRow, { marginTop: 16 }]}>
              <Pressable onPress={next} style={styles.ctrlBtn}>
                <MCI name="arrow-right-bold" size={18} color="#fff" />
                <Text style={styles.ctrlTxt}>Siguiente</Text>
              </Pressable>
              <View style={[styles.ctrlBtnAlt, { gap: 4 }]}>
                <MCI name="star" size={16} color="#111" />
                <Text style={styles.ctrlTxtAlt}>Puntaje: {score}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* =========================================================
   Screen
========================================================= */
export default function N2_B2_U3() {
  const navigation = useNavigation<Nav>();
  const [progress, setProgress] = useState(0);

  const [showKanji, setShowKanji] = useState(false);
  const [currentKanji, setCurrentKanji] = useState<KanjiItem | null>(null);

  const [showInterview, setShowInterview] = useState(false);
  const [showEtiquette, setShowEtiquette] = useState(false);
  const [showEmailFB, setShowEmailFB] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const KANJIS = useMemo<KanjiItem[]>(() => KANJI_U3, []);
  const openKanji = (k: KanjiItem) => {
    setCurrentKanji(k);
    setShowKanji(true);
  };

  const next = () => {
    const np = Math.min(1, progress + 0.33);
    setProgress(np);
    if (np >= 1) {
      (navigation as any).navigate("CursoN2");
    }
  };

  return (
    <UnitTemplate
      hero={require("../../../assets/images/n2/covers/b2_u3.webp")}
      accent={accent}
      breadcrumb="B2 · U3"
      title="Negarse, pedir favores y disculparse correctamente"
      subtitle="〜させていただきます · 〜いたします · negativas y cortesías finas."
      ctas={[
        { label: "Repasar gramática", onPress: () => speakES("Repasemos el contraste entre 〜させていただきます y 〜いたします.") },
        { label: "Empezar actividades", onPress: () => speakES("Abramos las actividades prácticas.") },
      ]}
      progress={progress}
      onContinue={next}
      continueLabel="Continuar"
    >
      <GrammarBox />

      {/* Dinámicas */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dinámicas</Text>
        <Pressable onPress={() => setShowInterview(true)} style={styles.cardAct}>
          <LinearGradient colors={["#161922", "#121319"]} style={StyleSheet.absoluteFill} />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={[styles.iconWrap, { borderColor: accent }]}>
              <MCI name="account-tie" size={22} color={accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actTitle}>Simulación de entrevista</Text>
              <Text style={styles.actDesc}>Frases modelo y evaluación rápida.</Text>
            </View>
            <MCI name="open-in-new" size={20} color="rgba(255,255,255,0.8)" />
          </View>
        </Pressable>

        <Pressable onPress={() => setShowEtiquette(true)} style={styles.cardAct}>
          <LinearGradient colors={["#161922", "#121319"]} style={StyleSheet.absoluteFill} />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={[styles.iconWrap, { borderColor: accent }]}>
              <MCI name="alert-circle-outline" size={22} color={accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actTitle}>Juego de “errores de etiqueta”</Text>
              <Text style={styles.actDesc}>Detecta lo inapropiado en frases reales.</Text>
            </View>
            <MCI name="open-in-new" size={20} color="rgba(255,255,255,0.8)" />
          </View>
        </Pressable>

        <Pressable onPress={() => setShowEmailFB(true)} style={styles.cardAct}>
          <LinearGradient colors={["#161922", "#121319"]} style={StyleSheet.absoluteFill} />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={[styles.iconWrap, { borderColor: accent }]}>
              <MCI name="email-edit-outline" size={22} color={accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actTitle}>Redacción de correo con feedback</Text>
              <Text style={styles.actDesc}>Escribe y recibe sugerencias de cortesía.</Text>
            </View>
            <MCI name="open-in-new" size={20} color="rgba(255,255,255,0.8)" />
          </View>
        </Pressable>
      </View>

      {/* Kanji (12) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Kanjis del bloque（12）</Text>
        <Text style={styles.li}>Toca para ver orden de trazos y palabras útiles.</Text>
        <View style={styles.kanjiGrid}>
          {KANJIS.map((k) => (
            <Pressable
              key={k.kanji}
              onPress={() => openKanji(k)}
              style={[styles.kanjiCell, { borderColor: "rgba(255,255,255,0.1)" }]}
            >
              <Text style={styles.kanjiBig}>{k.kanji}</Text>
              <Text style={styles.kanjiReading}>{k.readingJP}</Text>
              <Text style={styles.kanjiEs}>{k.meaningEs}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Quiz */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quiz — Permisos & Disculpas</Text>
        <Text style={styles.li}>Contraste 〜させていただきます / 〜いたします + fórmulas finas.</Text>
        <Pressable onPress={() => setShowQuiz(true)} style={[styles.ctrlBtn, { alignSelf: "flex-start", marginTop: 8 }]}>
          <MCI name="clipboard-check-outline" size={18} color="#fff" />
          <Text style={styles.ctrlTxt}>Empezar</Text>
        </Pressable>
      </View>

      {/* Modales */}
      <InterviewSimModal visible={showInterview} onClose={() => setShowInterview(false)} />
      <EtiquetteGameModal visible={showEtiquette} onClose={() => setShowEtiquette(false)} />
      <EmailFeedbackModal visible={showEmailFB} onClose={() => setShowEmailFB(false)} />
      <KanjiModal visible={showKanji} onClose={() => setShowKanji(false)} data={currentKanji} />
      <QuizModalUI visible={showQuiz} onClose={() => setShowQuiz(false)} />
    </UnitTemplate>
  );
}

/* =========================================================
   Styles
========================================================= */
const R = 16;
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#121319",
    borderRadius: R,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  cardTitle: { color: "#fff", fontWeight: "900", marginBottom: 8, fontSize: 16 },

  li: { color: "rgba(255,255,255,0.94)", marginBottom: 6 },

  example: {
    backgroundColor: "#0F1117",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginTop: 8,
  },
  exampleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playPill: {
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  playPillSm: {
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  jp: { color: "#fff", fontWeight: "800", flexWrap: "wrap" },
  readingSmall: { color: "#A7B0BE", fontSize: 12, marginTop: 2, marginLeft: 34 },

  es: { color: "rgba(255,255,255,0.92)", marginTop: 6 },

  transRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginLeft: 34,
  },
  esLine: { color: "#D6DEE9", fontSize: 13, flexShrink: 1, flexWrap: "wrap" },

  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  toggleDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  toggleTxt: { color: "#fff", fontWeight: "800" },

  cardAct: {
    marginTop: 10,
    borderRadius: 14,
    overflow: "hidden",
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  actTitle: { color: "#fff", fontWeight: "900" },
  actDesc: { color: "rgba(255,255,255,0.9)", marginTop: 2, fontSize: 12 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    marginRight: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  kanjiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 6 },
  kanjiCell: {
    width: "30.8%",
    backgroundColor: "#0F1117",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  kanjiBig: { color: "#fff", fontSize: 28, fontWeight: "900" },
  kanjiReading: { color: "rgba(255,255,255,0.92)", marginTop: 4 },
  kanjiEs: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2, textAlign: "center", paddingHorizontal: 6 },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalCardWhite: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: "92%",
    overflow: "hidden",
  },
  modalHeaderWhite: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  closeBtnLight: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  modalTitleDark: { color: "#111827", fontSize: 20, fontWeight: "900" },
  modalReadingDark: { color: "#1F2937", marginTop: 6 },

  controlsRow: { flexDirection: "row", gap: 10, marginTop: 12, alignItems: "center", flexWrap: "wrap" },
  ctrlBtn: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  ctrlTxt: { color: "#fff", fontWeight: "800" },
  ctrlBtnAlt: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  ctrlTxtAlt: { color: "#111", fontWeight: "800" },

  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: "#E5E7EB" },
  quizStem: { color: "#111827", fontWeight: "900", marginBottom: 8 },

  explBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  wordsTitleDark: { color: "#111827", fontWeight: "900", fontSize: 16 },
  wordItemLight: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  wordJpDark: { color: "#111827", fontWeight: "900", marginRight: 8 },
  wordReadingDark: { color: "#4B5563", fontSize: 12, marginRight: 8 },
  wordEsDark: { color: "#111827", flex: 1 },

  input: {
    marginTop: 8,
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
    color: "#111827",
    backgroundColor: "#fff",
  },

  fillBox: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
});

/* =========================================================
   ▶ Comando (comentario) para generar los 12 _nums.webp
   Ejecuta en PowerShell desde la raíz del proyecto:
-----------------------------------------------------------
# (Una vez) Clonar KanjiVG:
# git clone --depth 1 https://github.com/KanjiVG/kanjivg.git $env:TEMP/kanjivg-clone

$hex = '81f4','65ad','7531','8a31','9858','8ff7','60d1','6050','7e2e','914d','691c','78ba'
$KVG = Join-Path $env:TEMP 'kanjivg-clone\kanji'
New-Item -ItemType Directory -Force assets/kanjivg/n2 | Out-Null
foreach ($h in $hex) {
  $hit = Get-ChildItem -Recurse $KVG -File -Include "u$h.svg","$h.svg","*-$h.svg","*$h*.svg" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($hit) { Copy-Item $hit.FullName ("assets/kanjivg/n2\{0}.svg" -f $h) -Force; Write-Host "OK: $h" -ForegroundColor Green }
  else { Write-Host "NO SVG: $h" -ForegroundColor Red }
}
node tools/kanjivg-to-nums.js --in=assets/kanjivg/n2 --out=assets/kanjivg/n2 @hex
-----------------------------------------------------------
*/
