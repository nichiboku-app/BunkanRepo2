import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import { useB3Score } from "../../../context/B3ScoreContext";

const { width: W } = Dimensions.get("window");

/* ======================
   Utilidades de voz (SOLO tarjetas de transporte)
====================== */
function speakJa(text: string) {
  try {
    Speech.stop();
    Speech.speak(text, { language: "ja", rate: 1.0, pitch: 1.0 });
  } catch {}
}
function stopSpeech() {
  try {
    Speech.stop();
  } catch {}
}

/* ===========================
   Estaciones y tarifas (ES)
=========================== */
const STATIONS_ES = ["Tokio", "Shinjuku", "Shibuya", "Shinagawa", "Ueno", "Asakusa", "Yokohama"] as const;
type TransportKindES = "Tren" | "Metro" | "Bus";

const BASE_FARE_ES: Record<TransportKindES, number> = { Tren: 160, Metro: 170, Bus: 200 };
const STEP_FARE_ES: Record<TransportKindES, number> = { Tren: 30, Metro: 20, Bus: 0 };

function calcFareES(from: string, to: string, kind: TransportKindES) {
  if (from === to) return 0;
  const i = STATIONS_ES.indexOf(from as any), j = STATIONS_ES.indexOf(to as any);
  if (i < 0 || j < 0) return 0;
  const dist = Math.abs(i - j);
  return BASE_FARE_ES[kind] + Math.max(0, dist - 1) * STEP_FARE_ES[kind];
}
function prevStationES(current: string, step: 1 | -1) {
  const i = STATIONS_ES.indexOf(current as any);
  if (i < 0) return STATIONS_ES[0];
  const next = (i + step + STATIONS_ES.length) % STATIONS_ES.length;
  return STATIONS_ES[next];
}

/* ===========================
   10 Transportes (icono + palabra + lectura + audio)
=========================== */
type Vehicle = { key: string; icon: string; jp: string; hira: string; es: string };
const VEHICLES: Vehicle[] = [
  { key: "densha", icon: "🚆", jp: "電車", hira: "でんしゃ", es: "Tren" },
  { key: "chikatetsu", icon: "🚇", jp: "地下鉄", hira: "ちかてつ", es: "Metro" },
  { key: "bus", icon: "🚌", jp: "バス", hira: "ばす", es: "Autobús" },
  { key: "shinkansen", icon: "🚄", jp: "新幹線", hira: "しんかんせん", es: "Shinkansen" },
  { key: "monorail", icon: "🚝", jp: "モノレール", hira: "ものれーる", es: "Monorriel" },
  { key: "tram", icon: "🚋", jp: "路面電車", hira: "ろめんでんしゃ", es: "Tranvía" },
  { key: "taxi", icon: "🚕", jp: "タクシー", hira: "たくしー", es: "Taxi" },
  { key: "ferry", icon: "⛴️", jp: "フェリー", hira: "ふぇりー", es: "Ferry" },
  { key: "bike", icon: "🚲", jp: "自転車", hira: "じてんしゃ", es: "Bicicleta" },
  { key: "plane", icon: "✈️", jp: "飛行機", hira: "ひこうき", es: "Avión" },
];

/* ===========================
   Gramática — datasets
=========================== */
type Sent = { jp: string; hira: string; es: string };

const EX_NI_NORIMASU: Sent[] = [
  { jp: "電車に乗ります。", hira: "でんしゃ に のります。", es: "Me subo al tren / Tomo el tren." },
  { jp: "バスに乗ります。", hira: "ばす に のります。", es: "Tomo el autobús." },
  { jp: "自転車に乗ります。", hira: "じてんしゃ に のります。", es: "Monto en bicicleta." },
  { jp: "タクシーに乗ります。", hira: "たくしー に のります。", es: "Tomo un taxi." },
];

const EX_O_ORIMASU: Sent[] = [
  { jp: "電車を降ります。", hira: "でんしゃ を おります。", es: "Me bajo del tren." },
  { jp: "バスを降ります。", hira: "ばす を おります。", es: "Me bajo del autobús." },
  { jp: "タクシーを降ります。", hira: "たくしー を おります。", es: "Me bajo del taxi." },
  { jp: "モノレールを降ります。", hira: "ものれーる を おります。", es: "Me bajo del monorriel." },
];

const EX_DE_ORIMASU: Sent[] = [
  { jp: "渋谷駅で降ります。", hira: "しぶやえき で おります。", es: "Me bajo en la estación Shibuya." },
  { jp: "上野駅で降ります。", hira: "うえのえき で おります。", es: "Me bajo en Ueno." },
  { jp: "バス停で降ります。", hira: "ばすてい で おります。", es: "Me bajo en la parada de bus." },
  { jp: "空港で降ります。", hira: "くうこう で おります。", es: "Me bajo en el aeropuerto." },
];

const EX_DE_IKIMASU: Sent[] = [
  { jp: "電車で新宿へ行きます。", hira: "でんしゃ で しんじゅく へ いきます。", es: "Voy a Shinjuku en tren." },
  { jp: "地下鉄で空港に行きます。", hira: "ちかてつ で くうこう に いきます。", es: "Voy al aeropuerto en metro." },
  { jp: "バスで学校に行きます。", hira: "ばす で がっこう に いきます。", es: "Voy a la escuela en autobús." },
  { jp: "自転車で駅に行きます。", hira: "じてんしゃ で えき に いきます。", es: "Voy a la estación en bicicleta." },
];

const EX_KARA_MADE: Sent[] = [
  { jp: "東京から横浜まで電車で行きます。", hira: "とうきょう から よこはま まで でんしゃ で いきます。", es: "Voy de Tokio a Yokohama en tren." },
  { jp: "家から学校までバスで行きます。", hira: "いえ から がっこう まで ばす で いきます。", es: "Voy de casa a la escuela en autobús." },
  { jp: "空港からホテルまでタクシーで行きます。", hira: "くうこう から ほてる まで たくしー で いきます。", es: "Voy del aeropuerto al hotel en taxi." },
  { jp: "渋谷駅から新宿駅まで何分ですか。", hira: "しぶやえき から しんじゅくえき まで なんぷん です か。", es: "¿Cuántos minutos hay de Shibuya a Shinjuku?" },
];

type QAPair = { qjp: string; qhira: string; ajp: string; ahira: string; es: string };
const EX_DOUYATTE: QAPair[] = [
  {
    qjp: "どうやって学校へ行きますか。", qhira: "どうやって がっこう へ いきます か。",
    ajp: "バスで行きます。", ahira: "ばす で いきます。",
    es: "—¿Cómo vas a la escuela? —Voy en autobús.",
  },
  {
    qjp: "どうやって空港に行きますか。", qhira: "どうやって くうこう に いきます か。",
    ajp: "電車で行きます。", ahira: "でんしゃ で いきます。",
    es: "—¿Cómo vas al aeropuerto? —En tren.",
  },
  {
    qjp: "どうやって渋谷へ行きますか。", qhira: "どうやって しぶや へ いきます か。",
    ajp: "地下鉄で行きます。", ahira: "ちかてつ で いきます。",
    es: "—¿Cómo vas a Shibuya? —En metro.",
  },
  {
    qjp: "どうやって大阪へ行きますか。", qhira: "どうやって おおさか へ いきます か。",
    ajp: "新幹線で行きます。", ahira: "しんかんせん で いきます。",
    es: "—¿Cómo vas a Osaka? —En Shinkansen.",
  },
];

/* ===========================
   Quiz (10) — SOLO usa hook global aquí
=========================== */
type QuizRow = { es: string; tokens: string[]; solution: string; hira: string };
const QUIZ: QuizRow[] = [
  { es: "Me subo al tren.", tokens: ["電車", "に", "のります", "。"], solution: "電車にのります。", hira: "でんしゃ に のります。" },
  { es: "Bajo en la estación Shibuya.", tokens: ["しぶや駅", "で", "おります", "。"], solution: "しぶや駅でおります。", hira: "しぶやえき で おります。" },
  { es: "¿Este tren va a Shinjuku?", tokens: ["この", "電車", "は", "新宿", "へ", "いきます", "か", "。"], solution: "この電車は新宿へいきますか。", hira: "この でんしゃ は しんじゅく へ いきます か。" },
  { es: "¿Este tren es local?", tokens: ["この", "電車", "は", "各駅", "です", "か", "。"], solution: "この電車は各駅ですか。", hira: "この でんしゃ は かくえき です か。" },
  { es: "Un boleto hasta Tokio, por favor.", tokens: ["東京", "まで", "の", "切符", "を", "ください", "。"], solution: "東京までの切符をください。", hira: "とうきょう まで の きっぷ を ください。" },
  { es: "Me subo al autobús.", tokens: ["バス", "に", "のります", "。"], solution: "バスにのります。", hira: "ばす に のります。" },
  { es: "Bajo en Ueno.", tokens: ["上野", "で", "おります", "。"], solution: "上野でおります。", hira: "うえの で おります。" },
  { es: "Hago transbordo en Shibuya.", tokens: ["渋谷", "で", "のりかえます", "。"], solution: "渋谷でのりかえます。", hira: "しぶや で のりかえます。" },
  { es: "¿Cuánto cuesta el boleto?", tokens: ["切符", "は", "いくら", "です", "か", "。"], solution: "切符はいくらですか。", hira: "きっぷ は いくら です か。" },
  { es: "Voy a Yokohama en metro.", tokens: ["地下鉄", "で", "横浜", "へ", "いきます", "。"], solution: "地下鉄で横浜へいきます。", hira: "ちかてつ で よこはま へ いきます。" },
];

/* ===========================
   Pantalla principal
=========================== */
export default function B6_Transporte() {
  useEffect(() => () => stopSpeech(), []);

  // ====== Estado de compra de boletos (ES) ======
  const [kind, setKind] = useState<TransportKindES>("Tren");
  const [from, setFrom] = useState<string>("Shinjuku");
  const [to, setTo] = useState<string>("Shibuya");
  const [lastMsg, setLastMsg] = useState<string>("");
  const fare = useMemo(() => calcFareES(from, to, kind), [from, to, kind]);

  function buyTicket() {
    if (from === to) {
      Vibration.vibrate(20);
      setLastMsg("Origen y destino no pueden ser iguales.");
      return;
    }
    Vibration.vibrate(8);
    setLastMsg(
      `Frase modelo (JP): 「${to} まで の きっぷ を ください。」\nES: Un boleto hasta ${to}, por favor.\nTotal: ¥${fare}`
    );
  }

  // ====== Quiz — SOLO aquí el hook global ======
  const { addPoints } = useB3Score();
  const [qIndex, setQIndex] = useState(0);
  const [pool, setPool] = useState<string[]>(() => shuffle(QUIZ[0].tokens));
  const [answer, setAnswer] = useState<string[]>([]);
  const [checked, setChecked] = useState<null | boolean>(null);

  useEffect(() => {
    setPool(shuffle(QUIZ[qIndex].tokens));
    setAnswer([]);
    setChecked(null);
  }, [qIndex]);

  function pick(i: number) {
    const t = pool[i];
    setPool((p) => p.filter((_, idx) => idx !== i));
    setAnswer((a) => [...a, t]);
    Vibration.vibrate(6);
  }
  function unpick(i: number) {
    const t = answer[i];
    setAnswer((a) => a.filter((_, idx) => idx !== i));
    setPool((p) => [...p, t]);
    Vibration.vibrate(4);
  }
  function check() {
    const good = answer.join("") === QUIZ[qIndex].solution;
    setChecked(good);
    if (good) {
      try { addPoints?.(5, "B6_Transporte_Quiz"); } catch {}
    } else {
      Vibration.vibrate(30);
    }
  }
  function next() { setQIndex((i) => (i + 1) % QUIZ.length); }
  function clearQuiz() {
    setPool(shuffle(QUIZ[qIndex].tokens));
    setAnswer([]);
    setChecked(null);
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0b1221" }}>
      {/* Fondo estático simple */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#0b1221" }]} />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "#0e1630", borderTopLeftRadius: 32, borderTopRightRadius: 32, top: 110 },
        ]}
      />

      <ScrollView contentContainerStyle={s.c} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={s.headerEmoji}>🚉</Text>
            <Text style={s.h}>Transporte</Text>
          </View>
          <Text style={s.sub}>
            Aprende <Text style={s.bold}>に のります／を・で おります／で いきます／から・まで／どうやって いきますか</Text>,
            practica con tarjetas (audio), compra de boletos y un quiz final.
          </Text>
        </View>

        {/* ========= Gramática con ejemplos ========= */}
        <GrammarBox title="「〜に のります」— me subo / tomo" note="Marca a qué te subes con に.">
          {EX_NI_NORIMASU.map((row, i) => <Phrase key={`ni-${i}`} {...row} />)}
        </GrammarBox>

        <GrammarBox title="「（乗り物）を おります」— me bajo (del vehículo)" note="Marca de qué te bajas con を.">
          {EX_O_ORIMASU.map((row, i) => <Phrase key={`wo-${i}`} {...row} />)}
        </GrammarBox>

        <GrammarBox title="「（場所）で おります」— me bajo en (lugar)" note="Marca el lugar con で.">
          {EX_DE_ORIMASU.map((row, i) => <Phrase key={`deori-${i}`} {...row} />)}
        </GrammarBox>

        <GrammarBox title="「（手段）で 行きます」— voy en/por (medio)" note="Medio de transporte + で + 行きます. Destino con へ／に.">
          {EX_DE_IKIMASU.map((row, i) => <Phrase key={`deiki-${i}`} {...row} />)}
        </GrammarBox>

        <GrammarBox title="「A から B まで」— desde / hasta" note="Muy útil para rutas y tiempo.">
          {EX_KARA_MADE.map((row, i) => <Phrase key={`km-${i}`} {...row} />)}
        </GrammarBox>

        <View style={s.box}>
          <Text style={s.b}>「どうやって 行きますか」— ¿Cómo vas?</Text>
          <Text style={s.p}>Pregunta por el método (más natural que 何で en conversación).</Text>
          {EX_DOUYATTE.map((qa, i) => (
            <QAPairView key={`qa-${i}`} {...qa} />
          ))}
        </View>

        {/* ===============================
             COMPRA DE BOLETOS — TABLA EN ESPAÑOL
           (sin TTS en esta sección)
        =============================== */}
        <View style={s.box}>
          <Text style={s.b}>Compra de boletos (tabla en español)</Text>
          <Text style={s.p}>
            Selecciona el <Text style={s.bold}>medio</Text>, el <Text style={s.bold}>origen</Text> y el{" "}
            <Text style={s.bold}>destino</Text>. Presiona <Text style={s.bold}>Comprar</Text> para simular el ticket.
          </Text>

          {/* Controles */}
          <View style={s.ticketControls}>
            <SegmentES
              items={["Tren", "Metro", "Bus"] as TransportKindES[]}
              value={kind}
              onChange={(v) => setKind(v)}
            />

            <PickerRow
              label="Origen"
              value={from}
              onPrev={() => setFrom(prevStationES(from, -1))}
              onNext={() => setFrom(prevStationES(from, +1))}
            />
            <PickerRow
              label="Destino"
              value={to}
              onPrev={() => setTo(prevStationES(to, -1))}
              onNext={() => setTo(prevStationES(to, +1))}
            />
          </View>

          {/* Ticket en español */}
          <View style={s.ticket}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={s.ticketTitle}>🧾 Boleto</Text>
              <Text style={[s.ticketPrice, s.bold]}>¥{fare} (yenes)</Text>
            </View>
            <View style={s.ticketRow}>
              <Text style={s.ticketItem}>Origen</Text>
              <Text style={s.ticketItem}>{from}</Text>
            </View>
            <View style={s.ticketRow}>
              <Text style={s.ticketItem}>Destino</Text>
              <Text style={s.ticketItem}>{to}</Text>
            </View>
            <View style={s.ticketRow}>
              <Text style={s.ticketItem}>Medio</Text>
              <Text style={s.ticketItem}>{kind}</Text>
            </View>

            <View style={[s.rowBtns, { marginTop: 8 }]}>
              <Pressable
                style={[s.btn, s.btnPrimary]}
                onPress={buyTicket}
                android_ripple={{ color: "rgba(255,255,255,0.2)" }}
              >
                <Ionicons name="card-outline" size={16} color="#fff" />
                <Text style={s.btnTxtPrimary}>Comprar (simulado)</Text>
              </Pressable>
              <Pressable
                style={s.btn}
                onPress={() => {
                  Vibration.vibrate(6);
                  setLastMsg(`Ruta: ${from} → ${to}\nEn ${kind}. Precio estimado: ¥${fare}`);
                }}
                android_ripple={{ color: "rgba(0,0,0,0.08)" }}
              >
                <Ionicons name="swap-horizontal-outline" size={16} color="#0b1221" />
                <Text style={s.btnTxt}>Ver ruta</Text>
              </Pressable>
            </View>

            {!!lastMsg && (
              <View style={[s.boxLite, { marginTop: 10 }]}>
                <Text style={s.p}>{lastMsg}</Text>
              </View>
            )}
          </View>

          {/* Nota gramatical corta */}
          <View style={[s.boxLite, { marginTop: 10 }]}>
            <Text style={s.bSmall}>Patrones útiles</Text>
            <GlossES
              tokens={["(destino)", "まで", "の", "きっぷ", "を", "ください", "。"]}
              glossES={["hasta", "hasta", "de (posesivo)", "boleto", "objeto directo", "por favor (deme)", "punto"]}
            />
            <GlossES
              tokens={["(origen)", "から", "(destino)", "まで", "いきます", "。"]}
              glossES={["(desde)", "desde", "(hasta)", "hasta", "voy / va", "punto"]}
            />
          </View>
        </View>

        {/* ===============================
             TARJETAS: 10 TRANSPORTES (con audio)
        =============================== */}
        <View style={s.box}>
          <Text style={s.b}>Transportes (toca para escuchar)</Text>
          <View style={s.grid}>
            {VEHICLES.map((v) => (
              <View key={v.key} style={s.card}>
                <Text style={s.emoji}>{v.icon}</Text>
                <Text style={s.cardTitle}>
                  {v.jp} <Text style={s.dim}>({v.hira})</Text>
                </Text>
                <Text style={s.cardSub}>{v.es}</Text>
                <View style={s.rowBtns}>
                  <Pressable
                    style={s.btn}
                    onPress={() => speakJa(v.hira)}
                    android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                  >
                    <Ionicons name="volume-high-outline" size={14} color="#0b1221" />
                    <Text style={s.btnTxt}>Escuchar</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ===== Quiz (10) — único que suma puntos globales ===== */}
        <View style={s.box}>
          <Text style={s.b}>Quiz: ordena la oración (10)</Text>
          <Text style={s.p}>
            Arma la frase en japonés para: <Text style={s.bold}>{QUIZ[qIndex].es}</Text>
          </Text>

          <View style={s.quizBuild}>
            {answer.length === 0 ? (
              <Text style={{ color: "#0b1221", opacity: 0.6 }}>Toca las fichas…</Text>
            ) : (
              <View style={s.chipsRow}>
                {answer.map((t, i) => (
                  <Pressable
                    key={`${t}-${i}`}
                    onPress={() => unpick(i)}
                    style={[s.chip, s.chipActive]}
                    android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                  >
                    <Text style={s.chipTxtDark}>{t}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View style={s.chipsRow}>
            {pool.map((t, i) => (
              <Pressable
                key={`${t}-${i}`}
                onPress={() => pick(i)}
                style={s.chip}
                android_ripple={{ color: "rgba(0,0,0,0.06)" }}
              >
                <Text style={s.chipTxt}>{t}</Text>
              </Pressable>
            ))}
          </View>

          <View style={s.rowBtns}>
            <Pressable style={[s.btn, s.btnPrimary]} onPress={check} android_ripple={{ color: "rgba(255,255,255,0.2)" }}>
              <Ionicons name="checkmark-outline" size={16} color="#fff" />
              <Text style={s.btnTxtPrimary}>Comprobar</Text>
            </Pressable>
            <Pressable style={s.btn} onPress={clearQuiz} android_ripple={{ color: "rgba(0,0,0,0.08)" }}>
              <Ionicons name="backspace-outline" size={16} color="#0b1221" />
              <Text style={s.btnTxt}>Borrar</Text>
            </Pressable>
            <Pressable style={s.btn} onPress={next} android_ripple={{ color: "rgba(0,0,0,0.08)" }}>
              <Ionicons name="arrow-forward-outline" size={16} color="#0b1221" />
              <Text style={s.btnTxt}>Siguiente</Text>
            </Pressable>
          </View>

          {checked !== null && (
            <View style={[s.resultPill, { marginTop: 8 }]}>
              <Ionicons
                name={checked ? "checkmark-circle-outline" : "close-circle-outline"}
                size={16}
                color={checked ? "#0a7f3f" : "#7f1020"}
              />
              <View>
                <Text style={[s.resultTxt, { color: checked ? "#0a7f3f" : "#7f1020" }]}>
                  {checked ? "¡Correcto! +5 pts" : "Casi, revisa el orden（～に のります／～で おります）"}
                </Text>
                <Text style={[s.esSmall, { marginTop: 2 }]}>
                  <Text style={s.dim}>ひらがな：</Text>{QUIZ[qIndex].hira}
                </Text>
                <Text style={[s.esSmall, { marginTop: 2 }]}>
                  <Text style={s.dim}>Traducción:</Text> {QUIZ[qIndex].es}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ===== Práctica rápida de partículas（を・で・に） — local, sin puntos globales ===== */}
        <ParticlePractice />

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

/* ================
   Subcomponentes
================ */
function GrammarBox({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <View style={s.box}>
      <Text style={s.b}>{title}</Text>
      {note ? <Text style={[s.p, { marginTop: 2 }]}>{note}</Text> : null}
      <View style={{ gap: 8, marginTop: 6 }}>{children}</View>
    </View>
  );
}

function Phrase({ jp, hira, es }: Sent) {
  return (
    <View style={s.phraseRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.jpBig}>{jp}</Text>
        <Text style={s.hiraSmall}><Text style={s.dim}>ひらがな：</Text>{hira}</Text>
        <Text style={s.esSmall}>{es}</Text>
      </View>
    </View>
  );
}

function QAPairView({ qjp, qhira, ajp, ahira, es }: QAPair) {
  return (
    <View style={s.qaRow}>
      <Text style={s.qaLabel}>Q:</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.jpBig}>{qjp}</Text>
        <Text style={s.hiraSmall}><Text style={s.dim}>ひらがな：</Text>{qhira}</Text>
      </View>
      <Text style={s.qaLabel}>A:</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.jpBig}>{ajp}</Text>
        <Text style={s.hiraSmall}><Text style={s.dim}>ひらがな：</Text>{ahira}</Text>
        <Text style={s.esSmall}>{es}</Text>
      </View>
    </View>
  );
}

function SegmentES<T extends string>({
  items, value, onChange,
}: { items: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={s.segment}>
      {items.map((it) => {
        const active = value === it;
        return (
          <Pressable
            key={it}
            onPress={() => onChange(it)}
            style={[s.segmentBtn, active && s.segmentBtnActive]}
            android_ripple={{ color: "rgba(0,0,0,0.06)" }}
          >
            <Text style={[s.segmentTxt, active && s.segmentTxtActive]}>{it}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PickerRow({
  label, value, onPrev, onNext,
}: { label: string; value: string; onPrev: () => void; onNext: () => void }) {
  return (
    <View style={s.pickerRow}>
      <Text style={s.pickerLabel}>{label}</Text>
      <View style={s.pickerBox}>
        <Pressable style={s.pickerBtn} onPress={onPrev}>
          <Ionicons name="chevron-back-outline" size={18} color="#0b1221" />
        </Pressable>
        <Text style={s.pickerVal}>{value}</Text>
        <Pressable style={s.pickerBtn} onPress={onNext}>
          <Ionicons name="chevron-forward-outline" size={18} color="#0b1221" />
        </Pressable>
      </View>
    </View>
  );
}

function GlossES({ tokens, glossES }: { tokens: string[]; glossES: string[] }) {
  return (
    <View style={{ gap: 8 }}>
      <View style={s.glossLine}>
        {tokens.map((t, i) => (
          <View key={`${t}-${i}`} style={s.glossToken}>
            <Text style={s.glossJa}>{t}</Text>
            <Text style={s.glossEs}>{glossES[i] ?? ""}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ====== Práctica (local): elige la partícula correcta ====== */
function ParticlePractice() {
  type Item = { id: number; es: string; jp: string; hira: string; correct: "を" | "で" | "に" };
  const items: Item[] = [
    { id: 1, es: "Me subo al tren.", jp: "電車（　）乗ります。", hira: "でんしゃ（　） のります。", correct: "に" },
    { id: 2, es: "Me bajo del autobús.", jp: "バス（　）おります。", hira: "ばす（　） おります。", correct: "を" },
    { id: 3, es: "Me bajo en la estación Ueno.", jp: "上野駅（　）おります。", hira: "うえのえき（　） おります。", correct: "で" },
    { id: 4, es: "Voy a la escuela en metro.", jp: "地下鉄（　）学校（　）行きます。", hira: "ちかてつ（　）がっこう（　）いきます。", correct: "で" }, // segundo hueco = に
    { id: 5, es: "Voy a Shibuya en tren.", jp: "電車（　）渋谷（　）行きます。", hira: "でんしゃ（　）しぶや（　）いきます。", correct: "で" }, // segundo hueco = に
    { id: 6, es: "Me bajo en la parada de bus.", jp: "バス停（　）おります。", hira: "ばすてい（　） おります。", correct: "で" },
  ];

  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [feedback, setFeedback] = useState<Record<number, boolean | null>>({});

  function choose(id: number, particle: "を" | "で" | "に") {
    setAnswers((prev) => {
      const curr = prev[id] ?? [];
      const limit = id === 4 || id === 5 ? 2 : 1;
      const next = curr.length < limit ? [...curr, particle] : [particle];
      return { ...prev, [id]: next };
    });
  }

  function checkItem(it: Item) {
    const arr = answers[it.id] ?? [];
    let ok = false;
    if (it.id === 4 || it.id === 5) {
      ok = arr.length === 2 && arr[0] === "で" && arr[1] === "に";
    } else {
      ok = arr.length === 1 && arr[0] === it.correct;
    }
    setFeedback((f) => ({ ...f, [it.id]: ok }));
    if (!ok) Vibration.vibrate(20);
  }

  function renderJP(it: Item) {
    const arr = answers[it.id] ?? [];
    if (it.id === 4 || it.id === 5) {
      const first = arr[0] ?? "　";
      const second = arr[1] ?? "　";
      const jp = it.id === 4
        ? `地下鉄（${first}）学校（${second}）行きます。`
        : `電車（${first}）渋谷（${second}）行きます。`;
      const hira = it.id === 4
        ? `ちかてつ（${first}） がっこう（${second}） いきます。`
        : `でんしゃ（${first}） しぶや（${second}） いきます。`;
      return (
        <>
          <Text style={s.jpBig}>{jp}</Text>
          <Text style={s.hiraSmall}><Text style={s.dim}>ひらがな：</Text>{hira}</Text>
        </>
      );
    }
    const jp = it.jp.replace("（　）", `（${arr[0] ?? "　"}）`);
    const hira = it.hira.replace("（　）", `（${arr[0] ?? "　"}）`);
    return (
      <>
        <Text style={s.jpBig}>{jp}</Text>
        <Text style={s.hiraSmall}><Text style={s.dim}>ひらがな：</Text>{hira}</Text>
      </>
    );
  }

  return (
    <View style={s.box}>
      <Text style={s.b}>Práctica: elige la partícula correcta（を・で・に）</Text>
      <Text style={s.p}>Toca una opción para llenar el/los huecos y luego pulsa “Comprobar”.</Text>

      {items.map((it) => (
        <View key={it.id} style={[s.boxLite, { marginTop: 8 }]}>
          <Text style={s.esSmall}><Text style={s.dim}>ES:</Text> {it.es}</Text>
          {renderJP(it)}
          <View style={[s.rowBtns, { marginTop: 8 }]}>
            {(["を", "で", "に"] as const).map((p) => (
              <Pressable
                key={p}
                style={s.chip}
                onPress={() => choose(it.id, p)}
                android_ripple={{ color: "rgba(0,0,0,0.06)" }}
              >
                <Text style={s.chipTxt}>{p}</Text>
              </Pressable>
            ))}
            <Pressable
              style={[s.btn, s.btnPrimary]}
              onPress={() => checkItem(it)}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            >
              <Ionicons name="checkmark-outline" size={14} color="#fff" />
              <Text style={s.btnTxtPrimary}>Comprobar</Text>
            </Pressable>
          </View>
          {feedback[it.id] !== undefined && feedback[it.id] !== null && (
            <View style={[s.resultPill, { marginTop: 8 }]}>
              <Ionicons
                name={feedback[it.id] ? "checkmark-circle-outline" : "close-circle-outline"}
                size={16}
                color={feedback[it.id] ? "#0a7f3f" : "#7f1020"}
              />
              <Text style={[s.resultTxt, { color: feedback[it.id] ? "#0a7f3f" : "#7f1020" }]}>
                {feedback[it.id] ? "¡Correcto!" : "Intenta de nuevo: medio（で）, destino（に）, de qué te bajas（を）"}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

/* ================
   Helpers
================ */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ======================
         Estilos
====================== */
const s = StyleSheet.create({
  c: { padding: 16, paddingTop: 110 },

  header: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    padding: 16,
    gap: 8,
  },
  headerEmoji: { fontSize: 20 },
  h: { fontSize: 24, fontWeight: "900", color: "#ffffff" },
  sub: { marginTop: 2, color: "#e8f0ff", opacity: 0.95 },
  bold: { fontWeight: "900" },

  box: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    padding: 14,
    gap: 10,
    marginTop: 14,
  },
  boxLite: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    padding: 12,
    gap: 8,
  },

  /* Tipografía */
  p: { color: "#0b1221", opacity: 0.95, lineHeight: 18 },
  jp: { fontWeight: "800", color: "#0b1221" },
  dim: { opacity: 0.6 },

  /* Títulos dentro de box */
  b: { fontWeight: "900", color: "#0b1221", fontSize: 16 },
  bSmall: { fontWeight: "900", color: "#0b1221", fontSize: 14 },

  /* Phrases */
  phraseRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  jpBig: { fontSize: 18, fontWeight: "800", color: "#0b1221" },
  hiraSmall: { color: "#0b1221", opacity: 0.85, fontSize: 13 },
  esSmall: { color: "#0b1221", opacity: 0.75 },

  /* QA */
  qaRow: {
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    padding: 10,
  },
  qaLabel: { fontWeight: "900", color: "#0b1221", marginRight: 6 },

  /* Botones / filas */
  rowBtns: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,235,183,0.9)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,235,183,0.8)",
  },
  btnTxt: { color: "#0b1221", fontWeight: "800", fontSize: 12 },
  btnPrimary: { backgroundColor: "#0b1221", borderColor: "rgba(255,255,255,0.2)" },
  btnTxtPrimary: { color: "#fff", fontWeight: "900", fontSize: 12 },

  /* Segment */
  ticketControls: { gap: 10 },
  segment: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  segmentBtn: { flex: 1, paddingVertical: 8, alignItems: "center" },
  segmentBtnActive: { backgroundColor: "rgba(255,235,183,0.9)", borderRadius: 12 },
  segmentTxt: { color: "#0b1221", fontWeight: "800" },
  segmentTxtActive: { color: "#0b1221", fontWeight: "900" },

  /* Picker */
  pickerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pickerLabel: { color: "#0b1221", fontWeight: "900" },
  pickerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pickerBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.06)",
    alignItems: "center", justifyContent: "center",
  },
  pickerVal: {
    minWidth: 56, textAlign: "center", fontWeight: "900", color: "#0b1221",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },

  /* Ticket */
  ticket: {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(0,0,0,0.15)",
    padding: 14,
    gap: 6,
  },
  ticketTitle: { fontWeight: "900", color: "#0b1221" },
  ticketItem: {
    color: "#0b1221",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
  ticketRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ticketPrice: {
    color: "#0b1221",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },

  /* Grid tarjetas de transporte */
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    flexBasis: (W - 16 * 2 - 12) / 2,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    padding: 12,
    gap: 6,
  },
  emoji: { fontSize: 28 },
  cardTitle: { color: "#0b1221", fontWeight: "900" },
  cardSub: { color: "#0b1221", opacity: 0.8 },

  /* Quiz */
  quizBuild: {
    minHeight: 56,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    padding: 10,
    justifyContent: "center",
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chip: {
    paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: "rgba(255,235,183,0.9)",
    borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,235,183,0.8)",
  },
  chipActive: { backgroundColor: "rgba(255,210,122,0.95)", borderColor: "rgba(255,200,120,0.9)" },
  chipTxt: { color: "#0b1221", fontWeight: "800" },
  chipTxtDark: { color: "#0b1221", fontWeight: "900" },

  resultPill: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 12, borderWidth: 1, borderColor: "rgba(0,0,0,0.12)",
  },
  resultTxt: { fontWeight: "800", fontSize: 12 },

  /* Glosa */
  glossLine: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  glossToken: {
    paddingVertical: 6, paddingHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 10, borderWidth: 1, borderColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
  },
  glossJa: { fontWeight: "800", color: "#0b1221" },
  glossEs: { color: "#0b1221", opacity: 0.8, fontSize: 12 },
});
