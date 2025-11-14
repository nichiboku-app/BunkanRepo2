// src/screens/N5/HiraganaWN/WN_PracticaNFinal.tsx
import { Asset } from "expo-asset";
import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

// Gamificación (servicio real que compartiste)
import {
  awardAchievement,
  awardOnSuccess,
  useAwardOnEnter,
} from "src/services/achievements";

/* ===================== KANA hasta ん (sin っ ni ゃゅょ) ===================== */
const KANA_BASE = [
  "あ","い","う","え","お",
  "か","き","く","け","こ",
  "さ","し","す","せ","そ",
  "た","ち","つ","て","と",
  "な","に","ぬ","ね","の",
  "は","ひ","ふ","へ","ほ",
  "ま","み","む","め","も",
  "や","ゆ","よ",
  "ら","り","る","れ","ろ",
  "わ","を","ん",
];
const KANA_DAKU = [
  "が","ぎ","ぐ","げ","ご",
  "ざ","じ","ず","ぜ","ぞ",
  "だ","ぢ","づ","で","ど",
  "ば","び","ぶ","べ","ぼ",
  "ぱ","ぴ","ぷ","ぺ","ぽ",
];
const MASTER_KANA = [...KANA_BASE, ...KANA_DAKU];

/* ===================== Datos — Palabras para construir ===================== */
type ExamWord = { id: string; jp: string; romaji: string; es?: string };
const EXAM_WORDS: ExamWord[] = [
  { id: "yama",     jp: "やま",       romaji: "yama",    es: "montaña" },
  { id: "yuki",     jp: "ゆき",       romaji: "yuki",    es: "nieve" },
  { id: "yoru",     jp: "よる",       romaji: "yoru",    es: "noche" },
  { id: "ringo",    jp: "りんご",     romaji: "ringo",   es: "manzana" },
  { id: "reizouko", jp: "れいぞうこ", romaji: "reizōko", es: "refrigerador" },
  { id: "raion",    jp: "らいおん",   romaji: "raion",   es: "león" },
  { id: "hon",      jp: "ほん",       romaji: "hon",     es: "libro" },
  { id: "ongaku",   jp: "おんがく",   romaji: "ongaku",  es: "música" },
  { id: "ginkou",   jp: "ぎんこう",   romaji: "ginkō",   es: "banco" },
  { id: "san",      jp: "さん",       romaji: "san",     es: "tres / Sr./Sra." },
  { id: "ten",      jp: "てん",       romaji: "ten",     es: "punto/cielo" },
  { id: "ame",      jp: "あめ",       romaji: "ame",     es: "lluvia/caramelo" },
  { id: "sakana",   jp: "さかな",     romaji: "sakana",  es: "pez" },
  { id: "hayai",    jp: "はやい",     romaji: "hayai",   es: "rápido/temprano" },
  // Reemplazos SIN yōon:
  { id: "neko",     jp: "ねこ",       romaji: "neko",    es: "gato" },
  { id: "mizu",     jp: "みず",       romaji: "mizu",    es: "agua" },
];

/* ====== MP3 locales (si no existe, el botón dirá “Sin audio”) ====== */
const AUDIO: Record<string, any> = {
  yama: require("../../../../assets/audio/n5/yr/yama.mp3"),
  yuki: require("../../../../assets/audio/n5/yr/yuki.mp3"),
  yoru: require("../../../../assets/audio/n5/yr/yoru.mp3"),
  ringo: require("../../../../assets/audio/n5/yr/ringo.mp3"),
  reizouko: require("../../../../assets/audio/n5/yr/reizouko.mp3"),
  raion: require("../../../../assets/audio/n5/yr/raion.mp3"),
  hon: require("../../../../assets/audio/n5/wn/hon.mp3"),
  ongaku: require("../../../../assets/audio/n5/wn/ongaku.mp3"),
  ginkou: require("../../../../assets/audio/n5/wn/ginkou.mp3"),
  san: require("../../../../assets/audio/n5/wn/san.mp3"),
  ten: require("../../../../assets/audio/n5/wn/ten.mp3"),
  ame: require("../../../../assets/audio/n5/wn/ame.mp3"),
  sakana: require("../../../../assets/audio/n5/wn/sakana.mp3"),
  hayai: require("../../../../assets/audio/n5/wn/hayai.mp3"),
  // neko / mizu sin audio → “Sin audio”
};

/* ===================== Audio helpers (expo-audio) ===================== */
function useBankAudio<T extends string>(bank: Record<T, any>) {
  const playerRef = useRef<AudioPlayer | null>(null);
  const sourcesRef = useRef<Partial<Record<T, { uri: string }>>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Descarga/resolve de los assets -> { uri } reproducible
        for (const key of Object.keys(bank) as T[]) {
          const asset = Asset.fromModule(bank[key]);
          await asset.downloadAsync();
          sourcesRef.current[key] = { uri: asset.localUri ?? asset.uri };
        }
        if (!cancelled) {
          playerRef.current = createAudioPlayer();
          setReady(true);
        }
      } catch (e) {
        console.warn("[Exam preload error]", e);
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
      const p = playerRef.current;
      if (p) {
        try {
          p.pause();
          p.seekTo(0);
        } catch {}
      }
    };
  }, [bank]);

  const hasAudio = useCallback((id: string) => !!sourcesRef.current[id as T], []);

  const play = useCallback(async (id: T) => {
    const src = sourcesRef.current[id];
    const p = playerRef.current;
    if (!src || !p) return;
    try {
      await p.replace(src);
      p.seekTo(0);
      await p.play();
    } catch (e) {
      console.warn("[Exam play error]", e);
    }
  }, []);

  return { ready, hasAudio, play };
}

/* ===================== Utils ===================== */
const uid = () => Math.random().toString(36).slice(2, 9);
function shuffle<T>(arr: T[]): T[] { const a = arr.slice(); for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
const normalizeJP = (s: string) => s.replace(/[ \u3000。、・〜ー\.！!？?]/g, "");
const MAX_OPTIONS = 18;

/* ===================== Subvista única: Dictado (construir) ===================== */
function DictationBuilder({
  words, audioReady, hasAudio, play, onFinished,
}: {
  words: ExamWord[];
  audioReady: boolean;
  hasAudio: (id: string) => boolean;
  play: (id: any) => Promise<void>;
  onFinished?: (score: number) => void;
}) {
  const { playCorrect, playWrong } = useFeedbackSounds();
  const deck = useMemo(() => shuffle(words), [words]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const current = deck[idx];

  const target = useMemo(() => Array.from(normalizeJP(current.jp)), [current.jp]);
  const targetLen = target.length;

  const [showRomaji, setShowRomaji] = useState(true);
  const [pool, setPool] = useState<{ uid: string; ch: string; required: boolean }[]>([]);
  const [picked, setPicked] = useState<{ uid: string; ch: string; required: boolean }[]>([]);
  const [checked, setChecked] = useState<null | boolean>(null);

  useEffect(() => {
    const req = target.map((ch) => ({ uid: uid(), ch, required: true }));
    const needExtra = Math.max(0, MAX_OPTIONS - req.length);
    const extras = shuffle(MASTER_KANA.filter((k) => !target.includes(k)))
      .slice(0, needExtra).map((ch) => ({ uid: uid(), ch, required: false }));
    setPool(shuffle([...req, ...extras]));
    setPicked([]); setChecked(null);
  }, [target]);

  const isFull = picked.length === targetLen;
  const userStr = picked.map((t) => t.ch).join("");
  const correctStr = target.join("");

  const onPick = (tile: { uid: string; ch: string; required: boolean }) => {
    if (picked.length >= targetLen) return;
    setPool((p) => p.filter((t) => t.uid !== tile.uid));
    setPicked((p) => [...p, tile]);
    setChecked(null);
  };
  const removePicked = (i: number) => {
    setPicked((p) => {
      const c = p.slice();
      const [t] = c.splice(i, 1);
      if (t) setPool((pp) => shuffle([...pp, t]));
      return c;
    });
    setChecked(null);
  };
  const clear = () => { setPool((p) => shuffle([...p, ...picked])); setPicked([]); setChecked(null); };

  const autoCheck = useCallback(async () => {
    if (!isFull) return;
    const ok = userStr === correctStr;
    setChecked(ok);
    if (ok) { setScore((s) => s + 1); await playCorrect(); } else { await playWrong(); }
  }, [isFull, userStr, correctStr, playCorrect, playWrong]);

  useEffect(() => { autoCheck(); }, [picked.length, autoCheck]);

  const next = () => { if (idx < deck.length - 1) setIdx((i) => i + 1); else onFinished?.(score); };

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.stateTxt}>Progreso: {idx + 1}/{deck.length} · Aciertos: {score}</Text>
      </View>

      <View style={[styles.card, checked === true && styles.cardOk, checked === false && styles.cardBad]}>
        <Text style={styles.es}>{current.es ?? "—"}</Text>
        {showRomaji && <Text style={styles.romaji}>{current.romaji}</Text>}

        <View style={styles.row}>
          <Pressable onPress={() => setShowRomaji((v) => !v)} style={[styles.pill, !showRomaji && styles.pillActive]}>
            <Text style={[styles.pillText, !showRomaji && styles.pillTextActive]}>
              {showRomaji ? "Ocultar romaji" : "Mostrar romaji"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => play(current.id as any)}
            disabled={!audioReady || !hasAudio(current.id)}
            style={[styles.btnDark, (!audioReady || !hasAudio(current.id)) && styles.btnDisabled]}
          >
            <Text style={styles.btnText}>
              {audioReady ? (hasAudio(current.id) ? "▶︎ Escuchar" : "Sin audio") : "Cargando…"}
            </Text>
          </Pressable>
        </View>

        {/* Slots destino */}
        <View style={styles.slotsWrap}>
          {Array.from({ length: targetLen }).map((_, i) => {
            const t = picked[i];
            const wrong = checked === false && t && t.ch !== target[i];
            return (
              <Pressable
                key={`slot-${i}`}
                onPress={() => removePicked(i)}
                style={[styles.slot, t && styles.slotFilled, wrong && styles.slotWrong, checked === true && styles.slotOk]}
              >
                <Text style={[styles.slotText, t && styles.slotTextFilled]}>{t ? t.ch : "＿"}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.row}>
          <Pressable onPress={clear} style={styles.btnOutline}>
            <Text style={styles.btnTextDark}>Limpiar</Text>
          </Pressable>
          {checked === true && (
            <Pressable onPress={next} style={styles.btnDark}>
              <Text style={styles.btnText}>Siguiente ›</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Bandeja en DOS COLUMNAS */}
      <View style={styles.choicesCard}>
        <Text style={styles.sectionSmall}>Elige letras</Text>

        <View style={styles.gridWrap}>
          {pool.map((item) => (
            <Pressable key={item.uid} onPress={() => onPick(item)} style={styles.kanaOptionCol}>
              <Text style={styles.kanaOptionTxt}>{item.ch}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.helpSmall}>Tip: toca una casilla para quitar una letra colocada.</Text>
      </View>
    </View>
  );
}

/* ===================== Principal ===================== */
export default function WN_PracticaNFinal() {
  const { ready: audioReady, hasAudio, play } = useBankAudio(AUDIO);

  // Configuración de gamificación solicitada
  const LEVEL = "N5";
  const SCREEN_KEY = "N5_IntroJapones";

  // Estado para Modal de logro
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [modalPoints, setModalPoints] = useState<number>(0);

  // Al entrar: +10 XP primera vez; repeticiones: +5 XP
  useAwardOnEnter(SCREEN_KEY, {
    xpOnEnter: 10,
    repeatXp: 5,
    meta: { level: LEVEL },
  });

  // Éxito: al terminar el examen
  const handleFinish = useCallback(async (finalScore: number) => {
    // 1) Marca éxito + XP de éxito (solo primera vez)
    await awardOnSuccess(SCREEN_KEY, {
      xpOnSuccess: 20,
      meta: { level: LEVEL, finalScore },
    });

    // 2) Otorga logro idempotente con 30 XP solo la primera vez
    const res = await awardAchievement("final_hiragana", {
      xp: 30,
      sub: "Final Hiragana",
      meta: { screenKey: SCREEN_KEY, level: LEVEL, finalScore },
    });

    // Puntos a mostrar en el modal:
    // - Si fue primera vez del logro: 30 XP (del logro)
    // - Si ya estaba otorgado: mostramos 5 XP (repetición de la actividad)
    const pointsThisFinish = res.firstTime ? 30 : 5;
    setModalPoints(pointsThisFinish);
    setRewardModalVisible(true);
  }, []);

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 28 }}>
        <Text style={styles.title}>Examen final — Hiragana (hasta ん)</Text>
        <Text style={styles.subtitle}>
          Construye las palabras en <Text style={{ fontWeight: "900" }}>hiragana</Text> usando la bandeja de letras (2 columnas).
        </Text>

        <DictationBuilder
          words={EXAM_WORDS}
          audioReady={audioReady}
          hasAudio={hasAudio}
          play={play}
          onFinished={(score) => { void handleFinish(score); }}
        />
      </ScrollView>

      {/* Modal de recompensa */}
      <Modal
        animationType="fade"
        transparent
        visible={rewardModalVisible}
        onRequestClose={() => setRewardModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>¡Logro desbloqueado!</Text>
            <Text style={styles.modalAchievementName}>Final Hiragana</Text>
            <Text style={styles.modalPoints}>+{modalPoints} XP</Text>

            <Pressable style={styles.modalButton} onPress={() => setRewardModalVisible(false)}>
              <Text style={styles.modalButtonText}>Continuar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ===================== Estilos ===================== */
const INK = "#111827";
const PAPER = "#faf7f0";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAPER },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center", marginTop: 12 },
  subtitle: { textAlign: "center", fontSize: 13, color: "#444", marginTop: 6, marginBottom: 10, paddingHorizontal: 16 },

  headerRow: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 8,
  },
  stateTxt: { fontWeight: "900", color: "#111827" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 2,
    borderColor: "#111827",
  },
  cardOk: { borderColor: "#16a34a", backgroundColor: "#ecfdf5" },
  cardBad: { borderColor: "#dc2626", backgroundColor: "#fef2f2" },

  es: { textAlign: "center", color: "#374151", fontWeight: "800" },
  romaji: { textAlign: "center", color: "#111827", marginTop: 2, fontWeight: "900" },

  row: { flexDirection: "row", justifyContent: "center", marginTop: 10, columnGap: 10 },

  pill: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 2, borderColor: "#111", backgroundColor: "#fff", minWidth: 140, alignItems: "center" },
  pillActive: { backgroundColor: "#111", borderColor: "#111" },
  pillText: { fontWeight: "900", color: "#111" },
  pillTextActive: { fontWeight: "900", color: "#fff" },

  btnDark: { backgroundColor: INK, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, minWidth: 140, alignItems: "center" },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: "#fff", fontWeight: "800" },
  btnOutline: { borderWidth: 2, borderColor: "#111", backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, minWidth: 120, alignItems: "center" },
  btnTextDark: { color: "#111", fontWeight: "800" },

  slotsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 10, marginBottom: 6 },
  slot: { minWidth: 36, minHeight: 42, borderWidth: 2, borderColor: "#111", borderStyle: "dashed", borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", paddingHorizontal: 6 },
  slotFilled: { borderStyle: "solid", backgroundColor: "#f8fafc" },
  slotWrong: { borderColor: "#dc2626", backgroundColor: "#fef2f2" },
  slotOk: { borderColor: "#16a34a" },
  slotText: { fontSize: 22, fontWeight: "900", color: "#9ca3af" },
  slotTextFilled: { color: INK },

  choicesCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginHorizontal: 16, marginTop: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  sectionSmall: { fontWeight: "900", marginBottom: 8, color: "#1f2937" },
  helpSmall: { marginTop: 8, color: "#6b7280", fontSize: 12, textAlign: "center" },

  // Grid 2 columnas
  gridWrap: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  kanaOptionCol: {
    width: "48%",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#111",
    backgroundColor: "#FFF8EF",
    alignItems: "center",
  },
  kanaOptionTxt: { fontSize: 22, fontWeight: "900", color: "#111" },

  /* ===== Modal estilos ===== */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: INK,
    alignItems: "center",
  },
  modalTitle: { fontSize: 16, fontWeight: "900", color: "#065f46", marginBottom: 6 },
  modalAchievementName: { fontSize: 22, fontWeight: "900", color: INK, textAlign: "center" },
  modalPoints: { fontSize: 26, fontWeight: "900", color: INK, marginTop: 8, marginBottom: 14 },
  modalButton: {
    backgroundColor: INK,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 140,
    alignItems: "center",
  },
  modalButtonText: { color: "#fff", fontWeight: "800" },
});
