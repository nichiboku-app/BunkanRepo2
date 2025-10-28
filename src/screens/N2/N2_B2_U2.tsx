// src/screens/N2/N2_B2_U2.tsx
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import UnitTemplate from "./UnitTemplate";

/* =========================================================
   Tipos locales
========================================================= */
export type Stroke = { d: string };
type Word = { jp: string; reading: string; es: string };

export type KanjiItem = {
  kanji: string;
  readingJP: string;
  meaningEs: string;
  hex?: string;
  strokeAsset?: any; // require(...) del webp con números
  words?: Word[];
};

/* =========================================================
   Mapa estático de assets (evita require dinámico)
========================================================= */
const STROKE_ASSETS: Record<string, any> = {
  "4ef6": require("../../../assets/kanjivg/n2/4ef6_nums.webp"), // 件
  "6dfb": require("../../../assets/kanjivg/n2/6dfb_nums.webp"), // 添
  "4ed8": require("../../../assets/kanjivg/n2/4ed8_nums.webp"), // 付
  "5b9b": require("../../../assets/kanjivg/n2/5b9b_nums.webp"), // 宛
  "7528": require("../../../assets/kanjivg/n2/7528_nums.webp"), // 用
  "656c": require("../../../assets/kanjivg/n2/656c_nums.webp"), // 敬
  "62dd": require("../../../assets/kanjivg/n2/62dd_nums.webp"), // 拝
  "627f": require("../../../assets/kanjivg/n2/627f_nums.webp"), // 承
  "81f4": require("../../../assets/kanjivg/n2/81f4_nums.webp"), // 致
  "9023": require("../../../assets/kanjivg/n2/9023_nums.webp"), // 連
  "5148": require("../../../assets/kanjivg/n2/5148_nums.webp"), // 先
  "9001": require("../../../assets/kanjivg/n2/9001_nums.webp"), // 送
};

/* Helper: normaliza hex (sin ceros a la izquierda) y busca asset */
export function createKanji(
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

/* ---------- Nav / theme ---------- */
type Nav = NativeStackNavigationProp<any>;
const accent = "#9B1221"; // B2
const { width } = Dimensions.get("window");

/* ---------- TTS helpers ---------- */
function speakJP(text: string, opts?: Speech.SpeechOptions) {
  try {
    Speech.stop();
    Speech.speak(text, { language: "ja-JP", rate: 0.98, pitch: 1.02, ...opts });
  } catch {}
}
function speakES(text: string, opts?: Speech.SpeechOptions) {
  try {
    Speech.stop();
    Speech.speak(text, { language: "es-MX", rate: 1.0, pitch: 1.0, ...opts });
  } catch {}
}

/* ---------- UI pequeñas ---------- */
function ExampleRow({ jp, es, note }: { jp: string; es: string; note?: string }) {
  return (
    <View style={styles.example}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={() => speakJP(jp)} style={[styles.playBtn, { borderColor: accent }]}>
          <MCI name="play" size={18} color={accent} />
        </Pressable>
        <Text style={styles.jp}>{jp}</Text>
      </View>
      <Text style={styles.es}>{es}</Text>
      {!!note && <Text style={styles.note}>{note}</Text>}
    </View>
  );
}
function ActivityCard({
  icon, title, desc, onPress,
}: { icon: keyof typeof MCI.glyphMap; title: string; desc: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.cardAct}>
      <LinearGradient colors={["#161922", "#121319"]} style={StyleSheet.absoluteFill} />
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={[styles.iconWrap, { borderColor: accent }]}>
          <MCI name={icon} size={22} color={accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.actTitle}>{title}</Text>
          <Text style={styles.actDesc}>{desc}</Text>
        </View>
        <MCI name="chevron-right" size={24} color="rgba(255,255,255,0.7)" />
      </View>
    </Pressable>
  );
}

/* =========================================================
   CONTENIDO — Emails y llamadas
========================================================= */
const EMAIL_FRAMES = [
  { jp: "（件名）【日程ご調整のお願い】4/18（木）打ち合わせの件", es: "(Asunto) [Solicitud de ajuste de fecha] Sobre la reunión del 18/4 (jue.)" },
  { jp: "株式会社アオイ　人事部　鈴木様", es: "Aoi S.A. – Dpto. RRHH – Sr./Sra. Suzuki" },
  { jp: "いつもお世話になっております。株式会社ミドリの田中でございます。", es: "Gracias por su amable atención. Soy Tanaka de Midori S.A." },
  { jp: "来週の打ち合わせにつきまして、以下の通りご連絡申し上げます。", es: "Con respecto a la reunión de la próxima semana, me permito informarle lo siguiente." },
];

const PHONE_LINES = [
  { jp: "お世話になっております。ミドリの田中と申します。鈴木様はいらっしゃいますか。", es: "Buenos días. Habla Tanaka de Midori. ¿Se encuentra el Sr./Sra. Suzuki?" },
  { jp: "少々お待ちくださいませ。おつなぎいたします。", es: "Un momento por favor. Le comunico." },
  { jp: "恐れ入りますが、ただいま席を外しております。折り返しをご希望でしょうか。", es: "Disculpe, ahora no está en su puesto. ¿Desea que le devuelva la llamada?" },
];

/* =========================================================
   PLANTILLAS DE CORREO — 5 ejemplos segmentados (tipos + data)
========================================================= */
type Seg = { jp: string; es: string; why: string };

type EmailTpl = {
  id: string;
  subject: string;
  headerTo: string;
  segments: Seg[]; // cuerpo segmentado, toque para tooltip
  closing: string;
  signature: string;
};

const EMAIL_TEMPLATES: EmailTpl[] = [
  {
    id: "t1",
    subject: "【日程ご調整のお願い】4/18（木）打ち合わせの件",
    headerTo: "株式会社アオイ　人事部　鈴木様",
    segments: [
      {
        jp: "いつもお世話になっております。株式会社ミドリの田中でございます。",
        es: "Gracias por su amable atención. Soy Tanaka de Midori S.A.",
        why: "Fórmula de apertura muy habitual en negocios; mantiene tono cortés y continuo.",
      },
      {
        jp: "来週の打ち合わせにつきまして、以下の通りご連絡申し上げます。",
        es: "Con respecto a la reunión de la próxima semana, me permito informarle lo siguiente.",
        why: "～につきまして eleva el tema; ご連絡申し上げます usa 謙譲語 (humilde).",
      },
      {
        jp: "4/18（木）13:30～のご都合はいかがでしょうか。",
        es: "¿Le viene bien el 18/4 (jue.) de 13:30?",
        why: "～はいかがでしょうか suaviza la solicitud (indirecto y respetuoso).",
      },
      {
        jp: "もし難しい場合は、代替候補を頂けますと幸いです。",
        es: "Si fuese complicado, le agradecería proponer alternativas.",
        why: "～て頂けますと幸いです: petición suave con matiz de agradecimiento.",
      },
    ],
    closing: "お手数をおかけしますが、何卒よろしくお願いいたします。",
    signature: "株式会社ミドリ　営業部　田中",
  },
  {
    id: "t2",
    subject: "【資料送付の件】ご確認のお願い",
    headerTo: "株式会社さくら　経営企画部　山本様",
    segments: [
      {
        jp: "添付の資料をご確認いただけますと幸いです。",
        es: "Le agradecería revisar los documentos adjuntos.",
        why: "添付（てんぷ）: adjunto. ～いただけますと幸いです: cortesía + deseo.",
      },
      {
        jp: "ご不明点がございましたら、ご遠慮なくお知らせください。",
        es: "Si tiene dudas, no dude en avisarme.",
        why: "ご遠慮なく: invita a preguntar sin reservas; muy usado en atención.",
      },
      {
        jp: "差し支えなければ、4/20（金）までにご返信いただけますと幸いです。",
        es: "Si no es molestia, le agradecería responder para el 20/4 (vie.).",
        why: "差し支えなければ atenúa la petición de fecha límite.",
      },
    ],
    closing: "引き続きよろしくお願いいたします。",
    signature: "株式会社ミドリ　田中",
  },
  {
    id: "t3",
    subject: "【面談設定のお願い】候補日時のご提示",
    headerTo: "アオイ大学　国際交流課　佐藤様",
    segments: [
      {
        jp: "面談の件につき、候補日時を共有いたします。",
        es: "En relación con la entrevista, comparto fechas posibles.",
        why: "～の件につき: ‘con respecto a’. 共有いたします: humilde.",
      },
      {
        jp: "4/22（月）午前／4/23（火）午後はいかがでしょうか。",
        es: "¿Le viene bien 22/4 por la mañana o 23/4 por la tarde?",
        why: "Alternativas facilitan la decisión y reducen back-and-forth.",
      },
      {
        jp: "ご都合の良い方をお選びいただければ幸いです。",
        es: "Le agradecería escoger la opción conveniente.",
        why: "～いただければ幸いです: solicita acción de forma muy suave.",
      },
    ],
    closing: "お忙しいところ恐れ入りますが、何卒よろしくお願いいたします。",
    signature: "ミドリ語学センター　田中",
  },
  {
    id: "t4",
    subject: "【発注書送付のお願い】ご確認のほど",
    headerTo: "株式会社ブルー　購買部　高橋様",
    segments: [
      {
        jp: "発注書をお送りいたしますので、ご確認のほどお願い申し上げます。",
        es: "Le enviamos la orden de compra; agradeceremos su revisión.",
        why: "～のほど: matiz formal para solicitar cortesmente.",
      },
      {
        jp: "内容に相違がございましたら、お手数ですがご指摘ください。",
        es: "Si hay discrepancias, agradeceremos nos indique.",
        why: "お手数ですが reconoce molestia y suaviza la petición.",
      },
    ],
    closing: "取り急ぎ、用件のみ失礼いたします。",
    signature: "株式会社ミドリ　購買担当　田中",
  },
  {
    id: "t5",
    subject: "【面接結果のご連絡】○○様",
    headerTo: "○○様",
    segments: [
      {
        jp: "先日はお忙しい中、面接のお時間を頂戴し誠にありがとうございました。",
        es: "Muchas gracias por su tiempo para la entrevista el otro día.",
        why: "頂戴する（ちょうだい）: recibir (hum.). 誠に: énfasis formal.",
      },
      {
        jp: "選考の結果、次のステップにお進みいただくこととなりました。",
        es: "Como resultado, pasará a la siguiente etapa.",
        why: "受け手中心の表現 ‘お進みいただく’: cortesía al candidato.",
      },
      {
        jp: "詳細は添付資料をご確認ください。",
        es: "Vea los detalles en el documento adjunto.",
        why: "Frase estándar para remitir a un adjunto.",
      },
    ],
    closing: "引き続きよろしくお願い申し上げます。",
    signature: "株式会社ミドリ　人事部",
  },
];

/* =========================================================
   UI — Plantilla de correo (tarjeta) + modal y tooltips
========================================================= */
function PhraseBlock({ seg }: { seg: Seg }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={12}
        style={({ pressed }) => [
          styles.phraseBlock,
          pressed && { opacity: 0.95, transform: [{ scale: 0.995 }] },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.phraseBlockJP}>{seg.jp}</Text>
        </View>

        {/* Botón play (no abre modal) */}
        <Pressable
          hitSlop={10}
          onPress={(e) => {
            // @ts-ignore
            e.stopPropagation?.();
            speakJP(seg.jp);
          }}
          style={styles.playIconBtn}
        >
          <MCI name="play" size={18} color="#111" />
        </Pressable>
      </Pressable>

      {/* Tooltip/explicación */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.tipBackdrop}>
          <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)} />
          <View style={styles.tipCard}>
            <Text style={styles.tipJp} onPress={() => speakJP(seg.jp)}>{seg.jp}</Text>
            <Text style={styles.tipEs}>{seg.es}</Text>
            <Text style={styles.tipWhyTitle}>¿Por qué así?</Text>
            <Text style={styles.tipWhy}>{seg.why}</Text>
            <Pressable onPress={() => setOpen(false)} style={styles.tipClose}>
              <MCI name="check" size={18} color="#111" />
              <Text style={styles.tipCloseTxt}>Entendido</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

function EmailTemplateCard({ tpl }: { tpl: EmailTpl }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={styles.mailCard}>
        <LinearGradient colors={["#151823", "#101216"]} style={StyleSheet.absoluteFill} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={styles.mailIcon}>
            <MCI name="email-outline" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.mailSubject}>{tpl.subject}</Text>
            <Text style={styles.mailTo}>{tpl.headerTo}</Text>
          </View>
          <MCI name="open-in-new" size={20} color="rgba(255,255,255,0.8)" />
        </View>
      </Pressable>

      {/* Modal de correo */}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.mailModalCard}>
            <View style={styles.mailModalHeader}>
              <Text style={styles.mailModalSubject}>{tpl.subject}</Text>
              <Pressable onPress={() => setOpen(false)} style={styles.closeBtnLight}>
                <MCI name="close" size={22} color="#111" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
              <Text style={styles.mailToDark}>{tpl.headerTo}</Text>

              <View style={styles.mailBodyBox}>
                {tpl.segments.map((seg, i) => (
                  <PhraseBlock key={i} seg={seg} />
                ))}
              </View>

              <Text style={styles.mailClosing}>{tpl.closing}</Text>
              <Text style={styles.mailSignature}>{tpl.signature}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ---------- Bias fino (recorte mitad derecha) ---------- */
const KANJI_RIGHT_BIAS: Record<string, number> = {
  // "件": 101,
};

/* =========================================================
   DRAW PAD — pizarra (SVG) CONTROLADA
========================================================= */
export type DrawPadProps = {
  size?: number;
  value?: Stroke[];
  onChange?: (next: Stroke[]) => void;
  onDrawingChange?: (drawing: boolean) => void;
};
function DrawPad({
  size = Math.min(width - 32, 340),
  value,
  onChange,
  onDrawingChange,
}: DrawPadProps) {
  const [internal, setInternal] = useState<Stroke[]>([]);
  const isControlled = value !== undefined && onChange !== undefined;
  const strokes = Array.isArray(value) ? value : internal;

  const setStrokesArray = (next: Stroke[]) => {
    if (isControlled) onChange!(next);
    else setInternal(next);
  };

  const current = useRef<string>("");

  const start = (x: number, y: number) => {
    current.current = `M${x},${y}`;
    setStrokesArray([...strokes, { d: current.current }]);
  };
  const move = (x: number, y: number) => {
    if (!current.current) return;
    current.current += ` L${x},${y}`;
    const next = strokes.slice();
    next[next.length - 1] = { d: current.current };
    setStrokesArray(next);
  };
  const end = () => {
    current.current = "";
  };

  const undo = () => {
    if (strokes.length > 0) setStrokesArray(strokes.slice(0, -1));
  };
  const clear = () => setStrokesArray([]);

  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={[styles.drawWrap, { width: size, height: size, backgroundColor: "#fff" }]}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) => {
          const { locationX, locationY } = e.nativeEvent;
          start(locationX, locationY);
          onDrawingChange?.(true);
        }}
        onResponderMove={(e) => {
          const { locationX, locationY } = e.nativeEvent;
          move(locationX, locationY);
        }}
        onResponderRelease={() => {
          end();
          onDrawingChange?.(false);
        }}
        onResponderTerminate={() => {
          end();
          onDrawingChange?.(false);
        }}
      >
        <Svg width={size} height={size}>
          <Rect x={0} y={0} width={size} height={size} fill="#FFFFFF" />
          <Rect x={1.5} y={1.5} width={size - 3} height={size - 3} fill="none" stroke="#D0D4DA" strokeWidth={3} />
          {strokes.map((s, i) => (
            <Path
              key={`stroke-${i}`}
              d={s.d}
              fill="none"
              stroke="#111111"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </Svg>
      </View>
      <View style={styles.toolsRow}>
        <Pressable onPress={undo} style={styles.toolBtn}>
          <MCI name="undo" size={18} color="#fff" />
          <Text style={styles.toolTxt}>Deshacer</Text>
        </Pressable>
        <Pressable onPress={clear} style={styles.toolBtn}>
          <MCI name="trash-can-outline" size={18} color="#fff" />
          <Text style={styles.toolTxt}>Borrar</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* =========================================================
   KANJI — data + modal
========================================================= */
const KANJI_12_B2U2: KanjiItem[] = [
  createKanji("件", "けん", "asunto; caso", "4ef6", [
    { jp: "件名", reading: "けんめい", es: "asunto (email)" },
    { jp: "案件", reading: "あんけん", es: "caso; expediente" },
  ]),
  createKanji("添", "てん／そ(える)", "adjuntar; acompañar", "6dfb", [
    { jp: "添付", reading: "てんぷ", es: "adjunto" },
    { jp: "添える", reading: "そえる", es: "añadir; acompañar" },
  ]),
  createKanji("付", "ふ／つ(ける)", "adjuntar; pegar", "4ed8", [
    { jp: "〜付き", reading: "〜つき", es: "con; incluido" },
    { jp: "記載付", reading: "きさいつき", es: "con nota incluida" },
  ]),
  createKanji("宛", "あ(て)", "dirigido a; destinatario", "5b9b", [
    { jp: "〜宛", reading: "〜あて", es: "a la atención de" },
    { jp: "宛先", reading: "あてさき", es: "destinatario" },
  ]),
  createKanji("用", "よう", "uso; asunto", "7528", [{ jp: "用件", reading: "ようけん", es: "asunto; motivo" }]),
  createKanji("敬", "けい", "respeto", "656c", [
    { jp: "敬具", reading: "けいぐ", es: "atentamente (cierre)" },
    { jp: "敬称", reading: "けいしょう", es: "tratamiento honorífico" },
  ]),
  createKanji("拝", "はい", "reverencia (hum.)", "62dd", [
    { jp: "拝見", reading: "はいけん", es: "ver (hum.)" },
    { jp: "拝受", reading: "はいじゅ", es: "recibir (hum.)" },
  ]),
  createKanji("承", "しょう／う(けたまわる)", "recibir (hum.)", "627f", [
    { jp: "承知", reading: "しょうち", es: "entendido" },
    { jp: "了承", reading: "りょうしょう", es: "aprobación" },
  ]),
  createKanji("致", "いた(す)", "hacer (hum.)", "81f4", [{ jp: "致します", reading: "いたします", es: "hacer (hum.)" }]),
  createKanji("連", "れん", "conectar", "9023", [{ jp: "連絡", reading: "れんらく", es: "contacto; avisar" }]),
  createKanji("先", "せん", "previo; anterior", "5148", [{ jp: "先件", reading: "せんけん", es: "asunto anterior" }]),
  createKanji("送", "そう", "enviar", "9001", [
    { jp: "送付", reading: "そうふ", es: "envío (docs.)" },
    { jp: "送信", reading: "そうしん", es: "enviar (email)" },
  ]),
];

function KanjiModal({
  visible,
  onClose,
  data,
  strokes,
  onChangeStrokes,
}: {
  visible: boolean;
  onClose: () => void;
  data: KanjiItem | null;
  strokes: Stroke[];
  onChangeStrokes: (next: Stroke[]) => void;
}) {
  const [scrollEnabled, setScrollEnabled] = useState(true);
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

          <ScrollView
            contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 16 }}
            showsVerticalScrollIndicator={false}
            scrollEnabled={scrollEnabled}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.modalReadingDark} onPress={() => speakJP(data.readingJP)}>
              {data.readingJP} · {data.meaningEs} <Text style={{ opacity: 0.7 }}>(Toca para oír)</Text>
            </Text>

            {/* Imagen numerada del trazo */}
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
              <View style={{ alignItems: "center", marginVertical: 10 }}>
                <Text style={{ color: "#6B7280", fontSize: 12, textAlign: "center" }}>
                  No hay imagen de trazos; practica en la cuadrícula.
                </Text>
              </View>
            )}

            <View style={{ marginTop: 12 }}>
              <DrawPad
                size={Math.min(width - 32, 330)}
                value={strokes}
                onChange={onChangeStrokes}
                onDrawingChange={(drawing) => setScrollEnabled(!drawing)}
              />
            </View>

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
   QUIZ — MC + completar
========================================================= */
type QuizQ =
  | { type: "mc"; id: number; stem: string; options: string[]; answer: string; why: string }
  | { type: "fill"; id: number; stem: string; answer: string; why: string };

const QUIZ: QuizQ[] = [
  { type: "mc", id: 1, stem: "（自己紹介）田中と（　　）。", options: ["申します", "言います", "おっしゃいます"], answer: "申します", why: "Para presentarte: 謙譲『申します』。" },
  { type: "mc", id: 2, stem: "（電話）鈴木様に（　　）いたします。", options: ["代わり", "お繋ぎ", "お返し"], answer: "お繋ぎ", why: "『お繋ぎいたします』 es fórmula de centralita." },
  { type: "fill", id: 3, stem: "（結び）何卒よろしく__。", answer: "お願いいたします", why: "Cierre formal estándar." },
];

/* =========================================================
   SCREEN
========================================================= */
export default function N2_B2_U2() {
  const navigation = useNavigation<Nav>();
  const [progress, setProgress] = useState(0);

  const [showKanji, setShowKanji] = useState(false);
  const [currentKanji, setCurrentKanji] = useState<KanjiItem | null>(null);

  // Persistencia de trazos
  const STORAGE_KEY = "N2_B2_U2__sketchesByKanji";
  const [sketchesByKanji, setSketchesByKanji] = useState<Record<string, Stroke[]>>({});

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setSketchesByKanji(JSON.parse(raw));
      } catch {}
    })();
  }, []);
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sketchesByKanji));
      } catch {}
    })();
  }, [sketchesByKanji]);

  const setStrokesForKanji = (kanji: string, next: Stroke[]) => {
    setSketchesByKanji((m) => ({ ...m, [kanji]: next }));
  };

  const KANJIS = useMemo<KanjiItem[]>(() => KANJI_12_B2U2, []);
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
      hero={require("../../../assets/images/n2/covers/b2_u2.webp")}
      accent={accent}
      breadcrumb="B2 · U2"
      title="Correos y llamadas formales"
      subtitle="Plantillas reales para escribir y hablar con cortesía natural."
      ctas={[
        { label: "Frases clave (メール)", onPress: () => speakES("Frases de correo, toca cada línea para oírla.") },
        { label: "Frases clave (電話)", onPress: () => speakES("Frases de teléfono, toca cada línea para oírla.") },
      ]}
      progress={progress}
      onContinue={next}
      continueLabel="Continuar"
    >
      {/* ---- Instrucción global de la sección ---- */}
      <Text style={styles.hint}>
        En esta sección puedes: <Text style={{fontWeight:"900"}}>leer el correo</Text>, tocar <Text style={{fontWeight:"900"}}>▶</Text> para <Text style={{fontWeight:"900"}}>escucharlo</Text> y <Text style={{fontWeight:"900"}}>presionar cualquier renglón</Text> para ver la <Text style={{fontWeight:"900"}}>traducción</Text> y una <Text style={{fontWeight:"900"}}>explicación</Text>.
      </Text>

      {/* ===== Email ===== */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Correo formal — esqueleto útil</Text>
        {EMAIL_FRAMES.map((x, i) => (
          <ExampleRow key={i} jp={x.jp} es={x.es} />
        ))}
        <ExampleRow
          jp="添付（てんぷ）の資料をご確認いただけますと幸いです。"
          es="Le agradecería revisar los documentos adjuntos."
        />
        <ExampleRow
          jp="取り急ぎ、用件（ようけん）のみご連絡申し上げます。"
          es="Sin más, me limito a informarle el asunto."
        />
        <ExampleRow
          jp="何卒よろしくお願いいたします。"
          es="Sin otro particular, reciba un cordial saludo."
        />
      </View>

      {/* ===== Teléfono ===== */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Llamada — frases de recepción y de parte del cliente</Text>
        {PHONE_LINES.map((x, i) => (
          <ExampleRow key={i} jp={x.jp} es={x.es} />
        ))}
        <ExampleRow jp="少々お待ちくださいませ。" es="Un momento, por favor." />
        <ExampleRow jp="折り返しご連絡いたします。" es="Le devuelvo la llamada." />
      </View>

      {/* ===== Plantillas de correo (5) ===== */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Plantillas de correo（5）</Text>
        <Text style={styles.li}>
          Toca una tarjeta para abrir el correo completo. Dentro, toca cualquier renglón para ver su significado y por qué se usa.
        </Text>
        <View style={{ gap: 10, marginTop: 8 }}>
          {EMAIL_TEMPLATES.map((tpl) => (
            <EmailTemplateCard key={tpl.id} tpl={tpl} />
          ))}
        </View>
      </View>

      {/* ===== Kanjis (12) ===== */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Kanjis del bloque（12）</Text>
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

      {/* ===== Quiz ===== */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quiz — Email/Teléfono</Text>
        <Text style={styles.li}>Incluye fórmulas típicas de negocios.</Text>
        <QuizModalTrigger />
      </View>

      {/* MODAL KANJI */}
      <KanjiModal
        visible={showKanji}
        onClose={() => setShowKanji(false)}
        data={currentKanji}
        strokes={currentKanji ? sketchesByKanji[currentKanji.kanji] ?? [] : []}
        onChangeStrokes={(next) => {
          if (currentKanji) setStrokesForKanji(currentKanji.kanji, next);
        }}
      />
    </UnitTemplate>
  );
}

/* ---------- Quiz trigger ---------- */
function QuizModalTrigger() {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Pressable onPress={() => setVisible(true)} style={[styles.ctrlBtn, { alignSelf: "flex-start", marginTop: 8 }]}>
        <MCI name="clipboard-check-outline" size={18} color="#fff" />
        <Text style={styles.ctrlTxt}>Empezar</Text>
      </Pressable>
      <QuizModalUI visible={visible} onClose={() => setVisible(false)} />
    </>
  );
}

/* ---------- Quiz Modal UI ---------- */
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
            <Text style={styles.modalTitleDark}>Quiz · Correos y llamadas</Text>
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
                    {answer ? q.stem.replace("__", q.answer) : q.stem}
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

/* ---------- Styles ---------- */
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
  playBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 1.5,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  jp: { color: "#fff", fontWeight: "800", flex: 1, flexWrap: "wrap" },
  es: { color: "rgba(255,255,255,0.92)", marginTop: 6 },
  note: { color: "rgba(255,255,255,0.85)", marginTop: 6, fontSize: 12 },

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
  modalTitleDark: { color: "#111827", fontSize: 22, fontWeight: "900" },
  modalReadingDark: { color: "#1F2937", marginTop: 6 },

  drawWrap: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignSelf: "center",
    backgroundColor: "#fff",
  },
  toolsRow: { flexDirection: "row", gap: 12, marginTop: 10, alignItems: "center", justifyContent: "center" },
  toolBtn: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  toolTxt: { color: "#fff", fontWeight: "800" },

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

  /* ---- Indicaciones / hint ---- */
  hint: {
    color: "rgba(255,255,255,0.92)",
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },

  /* ---- Email cards ---- */
  mailCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 12,
  },
  mailIcon: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  mailSubject: { color: "#fff", fontWeight: "900" },
  mailTo: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },

  /* ---- Email modal ---- */
  mailModalCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: "92%",
    overflow: "hidden",
  },
  mailModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  mailModalSubject: { color: "#111827", fontSize: 18, fontWeight: "900", flex: 1, marginRight: 8 },
  mailToDark: { color: "#111827", opacity: 0.9, marginBottom: 10 },

  mailBodyBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  /* ---- Bloque de frase grande + tooltip ---- */
  phraseBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
    minHeight: 52,
  },
  phraseBlockJP: {
    color: "#111827",
    fontWeight: "800",
  },
  playIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5E7EB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },

  tipBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  tipCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },
  tipJp: { color: "#111827", fontWeight: "900" },
  tipEs: { color: "#374151", marginTop: 6 },
  tipWhyTitle: { color: "#111827", fontWeight: "900", marginTop: 10, fontSize: 13 },
  tipWhy: { color: "#374151", marginTop: 4 },
  tipClose: {
    alignSelf: "flex-start",
    marginTop: 12,
    flexDirection: "row", gap: 6, alignItems: "center",
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
  },
  tipCloseTxt: { color: "#111", fontWeight: "800" },

  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: "#E5E7EB" },
  quizStem: { color: "#111827", fontWeight: "900", marginBottom: 8 },
  fillBox: { backgroundColor: "#fff", borderRadius: 12, padding: 10, borderWidth: 1, borderColor: "#E5E7EB" },
  explBox: { backgroundColor: "#F3F4F6", borderRadius: 10, padding: 10, marginTop: 8, borderWidth: 1, borderColor: "#E5E7EB" },
});
