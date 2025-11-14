// src/screens/N5/B5_DiasMeses.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";
import { awardAchievement, awardOnSuccess, useAwardOnEnter } from "../../services/achievements";

/**
 * B5_DiasMeses — Días, meses, fechas y excepciones
 * - Explicación clara (sin kanji para números): “Xがつ Yにち”
 * - Vocabulario: meses (1〜12) y días del mes (1〜31) con excepciones
 * - Kanji (trazos blancos, fondo blanco): 月（mes）、日（día）、年（año）、曜（día de la semana）、何（qué）
 * - Ejemplos con TTS
 * - 2 minijuegos
 * - Logro al completar
 *
 * Genera las imágenes de kanji con:
 *   node scripts/make_kanji_webp.js --level n5 --suffix nums --stroke=white 6708 65e5 5e74 66dc 4f55
 */

const PAPER = "#0b1020";
const WHITE = "#fff";
const STROKE = "rgba(255,255,255,0.14)";
const CARD = "rgba(255,255,255,0.08)";
const VIOLET = "#8B5CF6";
const MINT = "#34D399";
const ROSE = "#FB7185";
const AMBER = "#F59E0B";
const GOLD = "#F2C94C";
const INK_DARK = "#0b1020";

const speakJP = (t: string) => Speech.speak(t, { language: "ja-JP", rate: 0.98 });
const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

/* ========= Kanji (trazos blancos) ========= */
const KANJI_IMG = {
  "月": require("../../../assets/kanjivg/n5/6708_nums.webp"),
  "日": require("../../../assets/kanjivg/n5/65e5_nums.webp"),
  "年": require("../../../assets/kanjivg/n5/5e74_nums.webp"),
  "曜": require("../../../assets/kanjivg/n5/66dc_nums.webp"),
  "何": require("../../../assets/kanjivg/n5/4f55_nums.webp"),
} as const;

type KanjiMeta = { on: string[]; kun: string[]; es: string; note?: string };
const KANJI_INFO: Record<keyof typeof KANJI_IMG, KanjiMeta> = {
  月: { on: ["ゲツ","ガツ"], kun: ["つき"], es: "mes / luna", note: "Xがつ = mes (número + 月)" },
  日: { on: ["ニチ","ジツ"], kun: ["ひ","か"], es: "día / sol", note: "Yにち = día del mes (número + 日)" },
  年: { on: ["ネン"], kun: ["とし"], es: "año", note: "２０２５年（にせんにじゅうご ねん）" },
  曜: { on: ["ヨウ"], kun: [], es: "día de la semana", note: "月よう日（げつようび）= lunes, etc." },
  何: { on: ["カ"], kun: ["なに","なん"], es: "qué", note: "なんがつ？ / なんにち？" },
};

/* ========= Explicación sencilla ========= */
const EXPLICACION = [
  "Para decir una FECHA usamos: “mes + がつ” y “día + にち”.",
  "Ejemplo: 5がつ 14にち = 14 de mayo.",
  "Los números los diremos con cifras (5, 14) y en japonés solo decimos がつ / にち.",
  "Los días 1〜10 y 14, 20, 24 tienen lecturas especiales (excepciones).",
  "Pregunta: なんがつ なんにち です か。= ¿Qué mes y qué día es?",
];

/* ========= Vocabulario: Meses ========= */
const MESES = [
  { num: 1,  jp: "いちがつ", es: "enero" },
  { num: 2,  jp: "にがつ",   es: "febrero" },
  { num: 3,  jp: "さんがつ", es: "marzo" },
  { num: 4,  jp: "しがつ",   es: "abril" }, // (no *よんがつ)
  { num: 5,  jp: "ごがつ",   es: "mayo" },
  { num: 6,  jp: "ろくがつ", es: "junio" },
  { num: 7,  jp: "しちがつ", es: "julio" }, // (no *なながつ)
  { num: 8,  jp: "はちがつ", es: "agosto" },
  { num: 9,  jp: "くがつ",   es: "septiembre" }, // (no *きゅうがつ)
  { num: 10, jp: "じゅうがつ", es: "octubre" },
  { num: 11, jp: "じゅういちがつ", es: "noviembre" },
  { num: 12, jp: "じゅうにがつ",   es: "diciembre" },
];

/* ========= Vocabulario: Días del mes (excepciones) ========= */
const DIAS_EXC = [
  { num: 1,  jp: "ついたち", es: "día 1" },
  { num: 2,  jp: "ふつか",   es: "día 2" },
  { num: 3,  jp: "みっか",   es: "día 3" },
  { num: 4,  jp: "よっか",   es: "día 4" },
  { num: 5,  jp: "いつか",   es: "día 5" },
  { num: 6,  jp: "むいか",   es: "día 6" },
  { num: 7,  jp: "なのか",   es: "día 7" },
  { num: 8,  jp: "ようか",   es: "día 8" },
  { num: 9,  jp: "ここのか", es: "día 9" },
  { num: 10, jp: "とおか",   es: "día 10" },
  { num: 14, jp: "じゅうよっか", es: "día 14" },
  { num: 20, jp: "はつか",   es: "día 20" },
  { num: 24, jp: "にじゅうよっか", es: "día 24" },
];
// Para los otros días (11,12,13,15…31) usamos “número + にち” (p.ej. 15にち).

/* ========= Ejemplos ========= */
const EJEMPLOS = [
  { jp: "いま は 5がつ 14にち です。", es: "Ahora es 14 de mayo." },
  { jp: "たんじょうび は 12がつ 24にち です。", es: "Mi cumpleaños es el 24 de diciembre." },
  { jp: "テスト は 6がつ 2にち です。", es: "El examen es el 2 de junio." },
  { jp: "やすみ は 8がつ 20にち です。", es: "Las vacaciones son el 20 de agosto." },
  { jp: "なんがつ なんにち です か。", es: "¿Qué mes y qué día es?" },
];

/* ========= Juegos ========= */
// Juego A: “Mes correcto para la cifra”
type QA = { prompt: string; options: string[]; correct: string };
const QUIZ_A: QA[] = [
  { prompt: "Mes 1 →", options: ["いちがつ", "にがつ", "しがつ"], correct: "いちがつ" },
  { prompt: "Mes 4 →", options: ["よんがつ", "しがつ", "くがつ"], correct: "しがつ" },
  { prompt: "Mes 7 →", options: ["なながつ", "しちがつ", "はちがつ"], correct: "しちがつ" },
  { prompt: "Mes 9 →", options: ["きゅうがつ", "くがつ", "じゅうがつ"], correct: "くがつ" },
  { prompt: "Mes 12 →", options: ["じゅうにがつ", "じゅういちがつ", "はちがつ"], correct: "じゅうにがつ" },
];

// Juego B: “Día del mes (excepción)”
const QUIZ_B: QA[] = [
  { prompt: "Día 1 →", options: ["いちにち", "ついたち", "とおか"], correct: "ついたち" },
  { prompt: "Día 2 →", options: ["ふつか", "ににち", "ようか"], correct: "ふつか" },
  { prompt: "Día 4 →", options: ["よんにち", "よっか", "むいか"], correct: "よっか" },
  { prompt: "Día 14 →", options: ["じゅうよっか", "じゅうよんにち", "はつか"], correct: "じゅうよっか" },
  { prompt: "Día 20 →", options: ["にじゅうにち", "はつか", "にじゅうよっか"], correct: "はつか" },
];

/* ========= Componente ========= */
export default function B5_DiasMeses() {
  // Gamificación
  const LEVEL = "N5";
  const SCREEN_KEY = "B5_DiasMeses";
  const ACHIEVEMENT_ID = "dias_meses_n5";
  const ACHIEVEMENT_TITLE = "Fechas: meses y días";
  useAwardOnEnter(SCREEN_KEY, { xpOnEnter: 0, repeatXp: 0, meta: { level: LEVEL } });

  const { playCorrect, playWrong } = useFeedbackSounds();

  // hero anim
  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 2200, useNativeDriver: false }),
        Animated.timing(glow, { toValue: 0, duration: 2200, useNativeDriver: false }),
      ])
    ).start();
  }, [glow]);
  const glowSize = glow.interpolate({ inputRange: [0, 1], outputRange: [8, 20] });

  // tabs & quiz states
  const [tab, setTab] = useState<"meses" | "dias">("meses");

  const quizA = useMemo(() => shuffle(QUIZ_A), []);
  const [aIdx, setAIdx] = useState(0);
  const [aScore, setAScore] = useState(0);
  const [aSel, setASel] = useState<string | null>(null);
  const [aFlash, setAFlash] = useState<"ok" | "bad" | null>(null);
  const [aStarted, setAStarted] = useState(false);

  const quizB = useMemo(() => shuffle(QUIZ_B), []);
  const [bIdx, setBIdx] = useState(0);
  const [bScore, setBScore] = useState(0);
  const [bSel, setBSel] = useState<string | null>(null);
  const [bFlash, setBFlash] = useState<"ok" | "bad" | null>(null);
  const [bStarted, setBStarted] = useState(false);

  // logro
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [modalPoints, setModalPoints] = useState(0);
  const [hasAwarded, setHasAwarded] = useState(false);

  const giveAchievementOnce = async () => {
    if (hasAwarded) return;
    await awardOnSuccess(SCREEN_KEY, { xpOnSuccess: 0, meta: { level: LEVEL } });
    const res = await awardAchievement(ACHIEVEMENT_ID, {
      xp: 10,
      sub: ACHIEVEMENT_TITLE,
      meta: { screenKey: SCREEN_KEY, level: LEVEL },
    });
    setModalPoints(res.firstTime ? 10 : 0);
    setRewardModalVisible(true);
    setHasAwarded(true);
  };

  const endIfBothDone = () => {
    const aDone = !aStarted && aIdx > 0;
    const bDone = !bStarted && bIdx > 0;
    if (aDone && bDone) void giveAchievementOnce();
  };

  const answerA = async (opt: string) => {
    if (aSel !== null) return;
    const ok = opt === quizA[aIdx].correct;
    setASel(opt);
    if (ok) { setAScore((s) => s + 100); setAFlash("ok"); await playCorrect(); }
    else { setAFlash("bad"); await playWrong(); }
    setTimeout(() => {
      setAFlash(null); setASel(null);
      if (aIdx + 1 < quizA.length) setAIdx(i => i + 1); else { setAStarted(false); endIfBothDone(); }
    }, 600);
  };

  const answerB = async (opt: string) => {
    if (bSel !== null) return;
    const ok = opt === quizB[bIdx].correct;
    setBSel(opt);
    if (ok) { setBScore((s) => s + 100); setBFlash("ok"); await playCorrect(); }
    else { setBFlash("bad"); await playWrong(); }
    setTimeout(() => {
      setBFlash(null); setBSel(null);
      if (bIdx + 1 < quizB.length) setBIdx(i => i + 1); else { setBStarted(false); endIfBothDone(); }
    }, 600);
  };

  // Zoom Kanji
  const [zoomKanji, setZoomKanji] = useState<null | { k: keyof typeof KANJI_IMG }>(null);

  return (
    <>
      <ScrollView contentContainerStyle={s.container}>
        {/* HERO */}
        <View style={s.hero}>
          <View style={s.blob1} />
          <View style={s.blob2} />
          <View style={s.blob3} />
          <Animated.View style={[s.glowDot, { width: glowSize, height: glowSize }]} />
          <Text style={s.kicker}>BLOQUE 5 · N5</Text>
          <Text style={s.title}>Meses（がつ）y días（にち）</Text>
          <Text style={s.subtitle}>Fechas claras con excepciones y práctica con audio.</Text>
        </View>

        {/* EXPLICACIÓN */}
        <Section title="Explicación básica（やさしい）" tint="violet">
          {EXPLICACION.map((t, i) => (
            <Text key={i} style={s.infoLine}>• <Text style={{ color: WHITE }}>{t}</Text></Text>
          ))}
        </Section>

        {/* VOCAB: MESES */}
        <Section title="Vocabulario — Meses（Xがつ）" tint="mint">
          <View style={s.grid}>
            {MESES.map((m) => (
              <VocabCard
                key={m.num}
                title={`${m.num} — ${m.jp}`}
                sub={m.es}
                onSpeak={() => speakJP(m.jp)}
              />
            ))}
          </View>
        </Section>

        {/* VOCAB: DÍAS DEL MES (EXCEPCIONES) */}
        <Section title="Vocabulario — Días del mes（excepciones）" tint="mint">
          <View style={s.grid}>
            {DIAS_EXC.map((d) => (
              <VocabCard
                key={d.num}
                title={`${d.num} — ${d.jp}`}
                sub={d.es}
                onSpeak={() => speakJP(d.jp)}
              />
            ))}
          </View>
          <Text style={[s.p, { marginTop: 8 }]}>
            Para otros días (11,12,13,15…31) usa “número + にち” (p.ej. 15にち).
          </Text>
        </Section>

        {/* KANJI TRAZOS — fondo BLANCO */}
        <Section title="Trazos y lecturas — 月・日・年・曜・何" tint="mint">
          <Text style={s.kExplain}>
            Recuadro <Text style={{ fontWeight: "900", color: WHITE }}>blanco</Text> para que los trazos (blancos) se vean bien.{"\n"}
            <Text style={{ fontWeight: "900", color: WHITE }}>おんよみ（ON）</Text> = lectura “china” / compuestos.{"  "}
            <Text style={{ fontWeight: "900", color: WHITE }}>くんよみ（KUN）</Text> = lectura nativa japonesa.
          </Text>

          <View style={s.kanjiGrid}>
            {(Object.keys(KANJI_IMG) as (keyof typeof KANJI_IMG)[]).map((k) => (
              <View key={k} style={s.kanjiCard}>
                <Pressable onPress={() => setZoomKanji({ k })}>
                  <View style={s.kanjiImgWrap}>
                    <Image source={KANJI_IMG[k]} style={s.kanjiImg} resizeMode="contain" />
                  </View>
                </Pressable>

                <View style={s.kanjiRow}>
                  <Text style={s.kanjiBig}>{k}</Text>
                  <Pressable
                    style={[s.ttsBtn, { backgroundColor: "#A7F3D0" }]}
                    onPress={() => speakJP([...(KANJI_INFO[k].kun ?? []), ...(KANJI_INFO[k].on ?? [])].join("、"))}
                  >
                    <Ionicons name="volume-high" size={16} color={INK_DARK} />
                  </Pressable>
                </View>

                <Text style={s.kanjiLine}><Text style={s.bold}>ON:</Text> {KANJI_INFO[k].on.join("・") || "—"}</Text>
                <Text style={s.kanjiLine}><Text style={s.bold}>KUN:</Text> {KANJI_INFO[k].kun.join("・") || "—"}</Text>
                <Text style={s.kanjiLine}><Text style={s.bold}>Significado:</Text> {KANJI_INFO[k].es}</Text>
                {!!KANJI_INFO[k].note && <Text style={s.kanjiNote}>{KANJI_INFO[k].note}</Text>}
              </View>
            ))}
          </View>
        </Section>

        {/* EJEMPLOS */}
        <Section title="Ejemplos con audio" tint="pink">
          <View style={{ gap: 12 }}>
            {EJEMPLOS.map((ex, i) => (
              <View key={i} style={s.exampleTile}>
                <View style={s.exampleHead}>
                  <Text style={s.exampleJP}>{ex.jp}</Text>
                  <Pressable style={[s.ttsBtn, { backgroundColor: "#FBCFE8" }]} onPress={() => speakJP(ex.jp)}>
                    <Ionicons name="volume-high" size={18} color={INK_DARK} />
                  </Pressable>
                </View>
                <Text style={s.exampleES}>{ex.es}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* TABS JUEGOS */}
        <View style={s.tabsRow}>
          <TabBtn label="Juego: Meses" active={tab === "meses"} onPress={() => setTab("meses")} icon="sparkles" />
          <TabBtn label="Juego: Días (excepciones)" active={tab === "dias"} onPress={() => setTab("dias")} icon="time" />
        </View>

        {/* Juego A: Meses */}
        {tab === "meses" && (
          <>
            {!aStarted && aIdx === 0 && aScore === 0 && (
              <PlayCard
                title="アクティビティ A: Meses（がつ）"
                desc="Elige la lectura correcta para el número de mes."
                cta="はじめる"
                tone="mint"
                onPress={() => { setAStarted(true); setAIdx(0); setAScore(0); setASel(null); }}
              />
            )}
            {aStarted && quizA[aIdx] && (
              <GameCard flash={aFlash}>
                <HeaderRow
                  left={<Chip icon="bookmark" label={`もんだい ${aIdx + 1}/${quizA.length}`} />}
                  right={<Chip icon="star" label={`${aScore} pts`} />}
                />
                <Prompt>{quizA[aIdx].prompt}</Prompt>
                <Options options={quizA[aIdx].options} chosen={aSel} correct={quizA[aIdx].correct} onChoose={answerA} />
              </GameCard>
            )}
            {!aStarted && aIdx > 0 && (
              <SummaryCard title="けっか（アクティビティ A）" list={[{ icon: "star", text: `Puntaje: ${aScore}` }, { icon: "book", text: `Preguntas: ${quizA.length}` }]} />
            )}
          </>
        )}

        {/* Juego B: Días (excepciones) */}
        {tab === "dias" && (
          <>
            {!bStarted && bIdx === 0 && bScore === 0 && (
              <PlayCard
                title="アクティビティ B: Días（excepciones）"
                desc="Elige la forma especial correcta: ついたち, ふつか, よっか…"
                cta="はじめる"
                tone="amber"
                onPress={() => { setBStarted(true); setBIdx(0); setBScore(0); setBSel(null); }}
              />
            )}
            {bStarted && quizB[bIdx] && (
              <GameCard flash={bFlash}>
                <HeaderRow
                  left={<Chip icon="bookmark" label={`もんだい ${bIdx + 1}/${quizB.length}`} />}
                  right={<Chip icon="star" label={`${bScore} pts`} />}
                />
                <Prompt>{quizB[bIdx].prompt}</Prompt>
                <Options options={quizB[bIdx].options} chosen={bSel} correct={quizB[bIdx].correct} onChoose={answerB} />
              </GameCard>
            )}
            {!bStarted && bIdx > 0 && (
              <SummaryCard title="けっか（アクティビティ B）" list={[{ icon: "star", text: `Puntaje: ${bScore}` }, { icon: "book", text: `Preguntas: ${quizB.length}` }]} />
            )}
          </>
        )}
      </ScrollView>

      {/* Modal de logro */}
      <Modal animationType="fade" transparent visible={rewardModalVisible} onRequestClose={() => setRewardModalVisible(false)}>
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <Ionicons name="trophy" size={30} color={GOLD} />
            <Text style={s.modalTitle}>¡Logro desbloqueado!</Text>
            <Text style={s.modalAchievementName}>{ACHIEVEMENT_TITLE}</Text>
            <Text style={s.modalPoints}>+{modalPoints} XP</Text>
            <Pressable style={s.modalButton} onPress={() => setRewardModalVisible(false)}>
              <Ionicons name="checkmark" size={16} color={INK_DARK} />
              <Text style={s.modalButtonText}>Continuar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal zoom kanji (fondo BLANCO) */}
      <Modal animationType="fade" transparent visible={!!zoomKanji} onRequestClose={() => setZoomKanji(null)}>
        <View style={s.zoomBackdrop}>
          <View style={s.zoomCard}>
            {zoomKanji && (
              <>
                <View style={s.zoomImgWrap}>
                  <Image source={KANJI_IMG[zoomKanji.k]} style={s.zoomImg} resizeMode="contain" />
                </View>
                <View style={s.zoomRow}>
                  <Text style={s.zoomTitle}>
                    {zoomKanji.k} · {KANJI_INFO[zoomKanji.k].kun.join("・") || "—"} ／ {KANJI_INFO[zoomKanji.k].on.join("・") || "—"}
                  </Text>
                  <Pressable
                    style={[s.ttsBtn, { backgroundColor: "#FDE68A" }]}
                    onPress={() => speakJP([...(KANJI_INFO[zoomKanji.k].kun ?? []), ...(KANJI_INFO[zoomKanji.k].on ?? [])].join("、"))}
                  >
                    <Ionicons name="volume-high" size={18} color={INK_DARK} />
                  </Pressable>
                </View>
                <Text style={[s.kanjiMeaning, { marginTop: 4 }]}>
                  いみ: <Text style={{ fontWeight: "900", color: WHITE }}>{KANJI_INFO[zoomKanji.k].es}</Text>
                </Text>
                {!!KANJI_INFO[zoomKanji.k].note && <Text style={s.kanjiNote}>{KANJI_INFO[zoomKanji.k].note}</Text>}
                <Pressable onPress={() => setZoomKanji(null)} style={s.zoomCloseBtn}>
                  <Ionicons name="close" size={18} color={INK_DARK} />
                  <Text style={s.zoomCloseTxt}>Cerrar</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ========= Subcomponentes UI ========= */
function Section({ title, tint, children }: { title: string; tint: "violet" | "mint" | "pink"; children: React.ReactNode }) {
  const color = tint === "violet" ? VIOLET : tint === "mint" ? MINT : ROSE;
  const bg = tint === "violet" ? "rgba(139,92,246,0.10)" : tint === "mint" ? "rgba(52,211,153,0.10)" : "rgba(251,113,133,0.10)";
  return (
    <View style={[s.section, { borderColor: color, backgroundColor: bg }]}>
      <View style={s.sectionHead}>
        <View style={[s.badge, { backgroundColor: color }]} />
        <Text style={[s.sectionTitle, { color: WHITE }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}
const VocabCard = ({ title, sub, onSpeak }: { title: string; sub?: string; onSpeak?: () => void }) => (
  <View style={s.vcard}>
    <View style={{ flex: 1 }}>
      <Text style={s.vTitle}>{title}</Text>
      {!!sub && <Text style={s.vSub}>{sub}</Text>}
    </View>
    {onSpeak && (
      <Pressable style={s.ttsBtn} onPress={onSpeak}>
        <Ionicons name="volume-high" size={18} color={INK_DARK} />
      </Pressable>
    )}
  </View>
);
const Chip = ({ icon, label }: { icon: keyof typeof Ionicons.glyphMap | "star" | "book" | "bookmark"; label: string }) => (
  <View style={stylesChip.chip}><Ionicons name={icon as any} size={14} color={INK_DARK} /><Text style={stylesChip.txt}>{label}</Text></View>
);
const HeaderRow = ({ left, right }: { left: React.ReactNode; right: React.ReactNode }) => (
  <View style={s.rowBetween}>{left}{right}</View>
);
const Prompt = ({ children }: { children: React.ReactNode }) => (
  <View style={s.promptWrap}><Text style={s.prompt}>{children}</Text></View>
);
function Options({ options, chosen, correct, onChoose }:{ options: string[]; chosen: string | null; correct: string; onChoose: (o: string) => void }) {
  return (
    <View style={s.optionsGrid}>
      {options.map((opt, i) => {
        const chosenNow = chosen !== null && chosen === opt;
        const isRight = chosen !== null && opt === correct;
        return (
          <Pressable
            key={`${i}-${opt}`}
            onPress={() => onChoose(opt)}
            style={({ pressed }) => [
              s.option,
              pressed && s.optionPressed,
              chosenNow && s.optionChosen,
              isRight && s.optionRight,
              chosen && !isRight && chosenNow && s.optionWrong,
            ]}
          >
            <Text style={s.optionTxt}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
const TabBtn = ({ label, active, onPress, icon }:{
  label: string; active: boolean; onPress: () => void; icon: keyof typeof Ionicons.glyphMap | "sparkles" | "time";
}) => (
  <Pressable onPress={onPress} style={[s.tabBtn, active && s.tabActive]}>
    <Ionicons name={icon as any} size={14} color={active ? INK_DARK : "#E5E7EB"} />
    <Text style={[s.tabTxt, active && s.tabTxtActive]}>{label}</Text>
  </Pressable>
);
const PlayCard = ({ title, desc, cta, onPress, tone }:{
  title: string; desc: string; cta: string; onPress: () => void; tone: "mint" | "amber";
}) => {
  const border = tone === "mint" ? "#34D399" : "#F59E0B";
  const bg = tone === "mint" ? "rgba(167,243,208,0.12)" : "rgba(253,230,138,0.12)";
  return (
    <View style={[s.playCard, { backgroundColor: bg, borderColor: border }]}>
      <View style={s.cardHeaderRow}><Ionicons name="clipboard" size={18} color={WHITE} /><Text style={s.h}> {title}</Text></View>
      <Text style={s.p}>{desc}</Text>
      <Pressable style={[s.btnPrimary, { backgroundColor: border, borderColor: border }]} onPress={onPress}>
        <Ionicons name="play" size={16} color={INK_DARK} /><Text style={[s.btnTxt, { color: INK_DARK }]}>{cta}</Text>
      </Pressable>
    </View>
  );
};
const GameCard = ({ children, flash }:{ children: React.ReactNode; flash: "ok" | "bad" | null }) => (
  <View style={[s.gameCard, flash === "ok" ? { borderColor: MINT, shadowColor: MINT } : flash === "bad" ? { borderColor: ROSE, shadowColor: ROSE } : null]}>
    {children}
  </View>
);
const SummaryCard = ({ title, list }:{ title: string; list: { icon: keyof typeof Ionicons.glyphMap | "star" | "book"; text: string }[] }) => (
  <View style={s.playCard}>
    <View style={s.cardHeaderRow}><Ionicons name="ribbon" size={18} color={WHITE} /><Text style={s.h}>{title}</Text></View>
    <View style={s.summaryRow}>
      {list.map((it, i) => (
        <View key={i} style={stylesChip.chip}>
          <Ionicons name={it.icon as any} size={14} color={INK_DARK} />
          <Text style={stylesChip.txt}>{it.text}</Text>
        </View>
      ))}
    </View>
  </View>
);

/* ========= Estilos ========= */
const s = StyleSheet.create({
  container: { padding: 16, backgroundColor: PAPER },

  hero: { borderRadius: 22, padding: 18, overflow: "hidden", borderWidth: 1, borderColor: STROKE, backgroundColor: "rgba(255,255,255,0.04)" },
  blob1: { position: "absolute", top: -60, left: -40, width: 180, height: 180, borderRadius: 999, backgroundColor: "rgba(14,165,233,0.20)" },
  blob2: { position: "absolute", bottom: -70, right: -50, width: 220, height: 220, borderRadius: 999, backgroundColor: "rgba(139,92,246,0.16)" },
  blob3: { position: "absolute", top: 30, right: -60, width: 120, height: 120, borderRadius: 999, backgroundColor: "rgba(236,72,153,0.18)" },
  glowDot: { position: "absolute", top: 24, left: 24, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.35)" },

  kicker: { color: "#C7D2FE", fontSize: 12, fontWeight: "800", letterSpacing: 1, marginBottom: 6 },
  title: { fontSize: 28, fontWeight: "900", color: WHITE, letterSpacing: 0.2 },
  subtitle: { color: "#E5E7EB", marginTop: 6 },

  section: { borderRadius: 18, borderWidth: 2, padding: 14, marginTop: 14 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  badge: { width: 10, height: 10, borderRadius: 999 },
  sectionTitle: { fontWeight: "900", fontSize: 16 },
  infoLine: { marginTop: 6, color: "#93C5FD" },

  grid: { marginTop: 8, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  vcard: { width: "48%", backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: STROKE, padding: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  vTitle: { fontSize: 18, fontWeight: "900", color: WHITE },
  vSub: { marginTop: 4, color: WHITE, opacity: 0.9, fontSize: 12 },

  kExplain: { color: WHITE, marginTop: 2, lineHeight: 20 },
  kanjiGrid: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 },
  kanjiCard: { width: "48%", backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: STROKE, padding: 10 },
  kanjiImgWrap: { width: "100%", height: 160, borderRadius: 12, backgroundColor: WHITE, borderWidth: 1, borderColor: "#e5e7eb", overflow: "hidden" },
  kanjiImg: { width: "100%", height: "100%", backgroundColor: WHITE },
  kanjiRow: { marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  kanjiBig: { fontSize: 22, fontWeight: "900", color: WHITE },
  kanjiLine: { marginTop: 2, color: WHITE, fontSize: 12 },
  kanjiNote: { marginTop: 4, color: "#C7D2FE", fontSize: 12 },
  kanjiMeaning: { marginTop: 2, color: WHITE, fontSize: 12 },

  exampleTile: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: STROKE, paddingVertical: 12, paddingHorizontal: 12 },
  exampleHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  exampleJP: { fontSize: 16, fontWeight: "900", color: WHITE, flexShrink: 1, paddingRight: 8 },
  exampleES: { marginTop: 4, color: WHITE, fontSize: 12 },

  tabsRow: { flexDirection: "row", gap: 8, marginTop: 20 },
  tabBtn: { flexDirection: "row", gap: 6, alignItems: "center", borderWidth: 1, borderColor: STROKE, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.06)" },
  tabActive: { backgroundColor: "#FDE68A" },
  tabTxt: { color: WHITE, fontWeight: "800" },
  tabTxtActive: { color: INK_DARK },

  playCard: { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: STROKE, marginTop: 12 },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  h: { fontWeight: "900", color: WHITE, fontSize: 16 },
  p: { marginTop: 6, color: WHITE, lineHeight: 20 },

  btnPrimary: {
    marginTop: 14, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, alignItems: "center", borderWidth: 1,
    flexDirection: "row", gap: 8, alignSelf: "center", minWidth: 220, justifyContent: "center",
  },
  btnTxt: { fontWeight: "900", letterSpacing: 0.3 },

  gameCard: { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: STROKE, marginTop: 12, shadowColor: MINT, shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 3 } },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },

  promptWrap: { marginTop: 10, alignItems: "center", paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: "rgba(253,230,138,0.35)", backgroundColor: "rgba(253,230,138,0.10)" },
  prompt: { fontSize: 18, fontWeight: "900", color: WHITE, textAlign: "center" },

  optionsGrid: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  option: {
    width: "48%", borderWidth: 1, borderColor: STROKE, backgroundColor: "rgba(255,255,255,0.06)",
    paddingVertical: 14, borderRadius: 14, alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  optionPressed: { transform: [{ scale: 0.98 }] },
  optionTxt: { fontSize: 16, fontWeight: "800", color: WHITE, textAlign: "center" },
  optionChosen: { borderColor: "#93C5FD", backgroundColor: "rgba(147,197,253,0.14)" },
  optionRight: { borderColor: MINT, backgroundColor: "rgba(52,211,153,0.14)" },
  optionWrong: { borderColor: ROSE, backgroundColor: "rgba(251,113,133,0.14)" },

  summaryRow: { flexDirection: "row", gap: 10, marginTop: 8 },

  ttsBtn: { backgroundColor: "#93C5FD", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10 },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 24 },
  modalCard: { width: "100%", maxWidth: 380, backgroundColor: INK_DARK, borderRadius: 16, paddingVertical: 20, paddingHorizontal: 20, borderWidth: 1, borderColor: "#1f2937", alignItems: "center", gap: 6 },
  modalTitle: { fontSize: 16, fontWeight: "900", color: "#A7F3D0" },
  modalAchievementName: { fontSize: 22, fontWeight: "900", color: WHITE, textAlign: "center" },
  modalPoints: { fontSize: 26, fontWeight: "900", color: GOLD, marginTop: 2, marginBottom: 10 },
  modalButton: { backgroundColor: "#FDE68A", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, minWidth: 160, alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "center" },
  modalButtonText: { color: INK_DARK, fontWeight: "800" },

  zoomBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 20 },
  zoomCard: { width: "100%", maxWidth: 420, backgroundColor: "#0f172a", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#1f2937" },
  zoomImgWrap: { width: "100%", height: 360, borderRadius: 12, backgroundColor: WHITE, borderWidth: 1, borderColor: "#e5e7eb", overflow: "hidden" },
  zoomImg: { width: "100%", height: "100%", backgroundColor: WHITE },
  zoomRow: { marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  zoomTitle: { fontSize: 18, fontWeight: "900", color: WHITE },
  zoomCloseBtn: { marginTop: 12, alignSelf: "center", backgroundColor: "#A7F3D0", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexDirection: "row", gap: 8, alignItems: "center" },
  zoomCloseTxt: { color: INK_DARK, fontWeight: "900" },
});

const stylesChip = StyleSheet.create({
  chip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FDE68A", borderWidth: 0, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  txt: { fontSize: 12, color: "#0b1020", fontWeight: "900" },
});
