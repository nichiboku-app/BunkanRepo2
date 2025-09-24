import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
// 👇 Voice puede ser null en Expo Go; lo guardamos en un ref y ponemos guards
import Voice, { SpeechErrorEvent, SpeechResultsEvent } from "@react-native-voice/voice";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

/* ======================= DATA (solo hira/kata, sin kanji) ======================= */
type Item = { id: string; es: string; jp: string; emoji: string; variants: string[] };

const DATA: Item[] = [
  { id: "sensei", es: "Maestro/a", jp: "せんせい", emoji: "🎓", variants: ["せんせい", "センセイ"] },
  { id: "isha", es: "Doctor/a", jp: "いしゃ", emoji: "🩺", variants: ["いしゃ", "イシャ", "おいしゃさん"] },
  { id: "kangoshi", es: "Enfermero/a", jp: "かんごし", emoji: "🏥", variants: ["かんごし", "カンゴシ"] },
  { id: "keisatsukan", es: "Policía", jp: "けいさつかん", emoji: "🚓", variants: ["けいさつかん", "ケイサツカン"] },
  { id: "shouboushi", es: "Bombero", jp: "しょうぼうし", emoji: "🚒", variants: ["しょうぼうし", "ショウボウシ"] },
  { id: "shefu", es: "Chef", jp: "シェフ", emoji: "👩‍🍳", variants: ["シェフ", "しぇふ"] },
  { id: "puroguramaa", es: "Programador/a", jp: "プログラマー", emoji: "💻", variants: ["プログラマー", "ぷろぐらまー"] },
  { id: "enjiniyaa", es: "Ingeniero/a", jp: "エンジニア", emoji: "🛠️", variants: ["エンジニア", "えんじにあ"] },
  { id: "bengoshi", es: "Abogado/a", jp: "べんごし", emoji: "⚖️", variants: ["べんごし", "ベンゴシ"] },
  { id: "kenchikuka", es: "Arquitecto/a", jp: "けんちくか", emoji: "🏗️", variants: ["けんちくか", "ケンチクカ"] },
  { id: "ongakuka", es: "Músico/a", jp: "おんがくか", emoji: "🎼", variants: ["おんがくか", "オンガクカ"] },
  { id: "kaishain", es: "Empleado/a", jp: "かいしゃいん", emoji: "🏢", variants: ["かいしゃいん", "カイシャイン"] },
];

/* ======================= utils ======================= */
const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function normalizeJP(s: string) {
  return s
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[。、，,.!！?？〜~\-—ー]/g, "")
    .replace(/[（）\(\)\[\]「」『』]/g, "");
}

type Theme = {
  bg: string; text: string; sub: string; line: string; card: string; pill: string;
  rightBg: string; rightLine: string; wrongBg: string; wrongLine: string; primary: string;
};
const themeLight: Theme = {
  bg: "#faf6ef", text: "#2f2a22", sub: "#6c6556", line: "#e7dfc6", card: "#ffffff", pill: "#ffffff",
  rightBg: "#e7f6e9", rightLine: "#7fd38d", wrongBg: "#fde9ea", wrongLine: "#f19aa2", primary: "#e84b3c",
};
const themeDark: Theme = {
  bg: "#0f1014", text: "#f5efe5", sub: "#c9c1b3", line: "#2a2b33", card: "#171821", pill: "#1c1d27",
  rightBg: "#123222", rightLine: "#3bbb7d", wrongBg: "#3b1b23", wrongLine: "#ff7d8f", primary: "#ff625f",
};

/* ======================= diálogo ======================= */
function makeDialog(): [Item, Item] {
  const [p1, p2] = shuffle(DATA).slice(0, 2);
  return [p1, p2];
}
const L1_MODEL = "おしごとは なん です か？";
const L1_ALT = "なんの しごとを して います か？";
const line2Model = (p: Item) => `わたしは ${p.jp} です。あなたは？`;
const line3Model = (p: Item) => `わたしは ${p.jp} です。`;

export default function ProfesionesRoleplay() {
  const { playCorrect, playWrong } = useFeedbackSounds();
  const [night, setNight] = useState(false);
  const T = night ? themeDark : themeLight;

  const [[profA, profB], setPair] = useState<[Item, Item]>(() => makeDialog());
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);

  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [ok, setOk] = useState<boolean | null>(null);

  // Voice puede ser null (Expo Go). Lo guardamos y checamos disponibilidad.
  const VoiceMod = useRef<typeof Voice | null>((Voice && (Voice as any).start ? Voice : null)).current;
  const [voiceReady, setVoiceReady] = useState<boolean>(!!VoiceMod);

  // animación del botón de mic
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (recording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 650, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 650, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(0);
    }
  }, [recording, pulse]);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] });

  /* ======= STT listeners con guards ======= */
  useEffect(() => {
    let mounted = true;
    if (!VoiceMod) { setVoiceReady(false); return; }

    // algunos entornos requieren llamar a isAvailable o services para confirmar
    (async () => {
      try {
        // @ts-ignore: algunos builds no exponen este método, por eso el guard
        if (VoiceMod.getSpeechRecognitionServices) {
          await VoiceMod.getSpeechRecognitionServices();
        }
        if (mounted) setVoiceReady(true);
      } catch {
        if (mounted) setVoiceReady(false);
      }
    })();

    const onResults = (e: SpeechResultsEvent) => {
      if (!mounted) return;
      const text = (e.value?.[0] ?? "").trim();
      setTranscript(text);
    };
    const onError = (_e: SpeechErrorEvent) => {
      if (!mounted) return;
      setRecording(false);
    };

    // Asignación segura
    // (si VoiceMod es válido, estas props existen; si no, no tocamos nada)
    // @ts-ignore
    VoiceMod.onSpeechResults = onResults;
    // @ts-ignore
    VoiceMod.onSpeechError = onError;

    return () => {
      mounted = false;
      // Limpieza segura
      try {
        // @ts-ignore
        VoiceMod?.destroy?.().finally(() => {
          // @ts-ignore
          VoiceMod?.removeAllListeners?.();
        });
      } catch {}
    };
  }, [VoiceMod]);

  const ensureMicPermission = useCallback(async () => {
    if (Platform.OS === "android") {
      const has = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      if (!has) {
        const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
        if (res !== PermissionsAndroid.RESULTS.GRANTED) throw new Error("Mic permission denied");
      }
    }
  }, []);

  const startRecord = useCallback(async () => {
    if (!VoiceMod) return; // sin módulo, no intentes grabar
    try {
      await ensureMicPermission();
      setTranscript("");
      setOk(null);
      setRecording(true);
      await VoiceMod.start("ja-JP");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    } catch {
      setRecording(false);
    }
  }, [VoiceMod, ensureMicPermission]);

  const stopRecord = useCallback(async () => {
    if (!VoiceMod) return;
    try { await VoiceMod.stop(); } catch {}
    setRecording(false);

    // validar línea actual
    const t = normalizeJP(transcript);
    const containsAny = (arr: string[]) => arr.some((v) => t.includes(normalizeJP(v)));

    let pass = false;
    if (step === 0) {
      const hasOshigoto = t.includes("おしごと") || t.includes("しごと");
      const hasNan = t.includes("なん");
      const hasDesuKa = t.includes("ですか") || t.endsWith("か");
      const alt = t.includes("なんのしごとをしていますか");
      pass = (hasOshigoto && hasNan && hasDesuKa) || alt;
    } else if (step === 1) {
      const hasProf = containsAny(profA.variants);
      const hasDesu = t.includes("です");
      const hasWatashi = t.includes("わたしは");
      const hasAnata = t.includes("あなたは");
      pass = hasProf && hasDesu && (hasWatashi || hasAnata);
    } else {
      const hasProf = containsAny(profB.variants);
      const hasDesu = t.includes("です");
      pass = hasProf && hasDesu;
    }

    setOk(pass);
    if (pass) {
      setScore((s) => s + 1);
      playCorrect();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      playWrong();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [VoiceMod, transcript, step, profA.variants, profB.variants, playCorrect, playWrong]);

  /* ======= TTS ======= */
  const stopTTS = useCallback(() => Speech.stop(), []);
  useEffect(() => () => { stopTTS(); }, [stopTTS]);

  const speak = useCallback((text: string, rate = 1.0) => {
    Speech.speak(text, { language: "ja-JP", rate, pitch: 1.0 });
  }, []);

  const speakLine = useCallback((i: 0 | 1 | 2) => {
    if (i === 0) speak(L1_MODEL);
    if (i === 1) speak(line2Model(profA));
    if (i === 2) speak(line3Model(profB));
  }, [profA, profB, speak]);

  const speakAltQuestion = useCallback(() => {
    speak(L1_ALT, 0.95);
  }, [speak]);

  const speakDialog = useCallback(() => {
    stopTTS();
    Speech.speak(L1_MODEL, {
      language: "ja-JP", rate: 1.0, pitch: 1.0,
      onDone: () => Speech.speak(line2Model(profA), {
        language: "ja-JP", rate: 1.0, pitch: 1.0,
        onDone: () => Speech.speak(line3Model(profB), { language: "ja-JP", rate: 1.0, pitch: 1.0 }),
      }),
    });
  }, [profA, profB, stopTTS]);

  /* ======= avanzar / reiniciar ======= */
  const next = useCallback(() => {
    stopTTS();
    if (step < 2) setStep((s) => (s + 1) as 0 | 1 | 2);
    else { setPair(makeDialog()); setStep(0); setRound((r) => r + 1); }
    setTranscript("");
    setOk(null);
  }, [step, stopTTS]);

  const newDialog = useCallback(() => {
    stopTTS();
    setPair(makeDialog());
    setStep(0);
    setTranscript("");
    setOk(null);
    setRound((r) => r + 1);
  }, [stopTTS]);

  /* ======= UI ======= */
  const PROGRESS = (step + 1) / 3;

  return (
    <View style={[styles.flex1, { backgroundColor: T.bg }]}>
      {/* Header */}
      <LinearGradient
        colors={night ? ["#14151d", "#1b1c26"] : ["#fff5f0", "#fde3de"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.kouhaku}>
          <View style={[styles.kouhakuRed, { backgroundColor: T.primary }]} />
          <View style={styles.kouhakuWhite} />
        </View>
        <Text style={[styles.title, { color: T.text }]}>Roleplay · しょくぎょう の かいわ</Text>
        <Text style={[styles.subtitle, { color: T.sub }]}>Traduce las líneas (es → jp) y habla para practicar.</Text>

        <View style={[styles.explain, { backgroundColor: T.card, borderColor: T.line }]}>
          <Text style={[styles.explainTitle, { color: T.text }]}>Cómo preguntar:</Text>
          <Text style={[styles.explainBullet, { color: T.text }]}>• おしごとは なん です か？</Text>
          <Text style={[styles.explainBullet, { color: T.sub }]}>  (formal y natural; お = cortesía)</Text>
          <Text style={[styles.explainBullet, { color: T.text }]}>• なんの しごとを して います か？</Text>
          <Text style={[styles.explainBullet, { color: T.sub }]}>  (también común; “qué trabajo haces”)</Text>
          <View style={styles.explainBtns}>
            <Pill label="▶️ おしごとは なん です か？" onPress={() => speakLine(0)} T={T} />
            <Pill label="▶️ Alternativa" onPress={speakAltQuestion} T={T} />
          </View>
        </View>

        <View style={[styles.progressRail, { backgroundColor: night ? "#222433" : "#efe6d4" }]}>
          <View style={[styles.progressFill, { width: `${PROGRESS * 100}%`, backgroundColor: T.primary }]} />
        </View>

        <Pressable
          onPress={() => setNight((v) => !v)}
          style={({ pressed }) => [
            styles.nightPill,
            { backgroundColor: T.pill, borderColor: T.line },
            pressed && { opacity: 0.9 },
          ]}
        >
          <Text style={{ fontWeight: "800", color: T.text }}>{night ? "☀️ 昼モード" : "🌙 夜モード"}</Text>
        </Pressable>
      </LinearGradient>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Tarjeta del diálogo actual */}
        <View style={[styles.goalCard, { backgroundColor: T.card, borderColor: T.line }]}>
          <View style={styles.goalTop}>
            <View style={[styles.badge, { backgroundColor: T.bg, borderColor: T.line }]}><Text style={styles.badgeEmoji}>{profA.emoji}</Text></View>
            <Text style={[styles.goalText, { color: T.text }]}>B: Soy {profA.es}. ¿Y tú?</Text>
          </View>
          <View style={styles.goalTop}>
            <View style={[styles.badge, { backgroundColor: T.bg, borderColor: T.line }]}><Text style={styles.badgeEmoji}>{profB.emoji}</Text></View>
            <Text style={[styles.goalText, { color: T.text }]}>A: Soy {profB.es}.</Text>
          </View>

          <View style={styles.models}>
            <Pill label="▶️ Línea 1 (jp)" onPress={() => speakLine(0)} T={T} />
            <Pill label="▶️ Línea 2 (jp)" onPress={() => speakLine(1)} T={T} />
            <Pill label="▶️ Línea 3 (jp)" onPress={() => speakLine(2)} T={T} />
            <Pill label="▶️ Repetir diálogo" onPress={speakDialog} T={T} />
          </View>
        </View>

        {/* Reto actual */}
        <View style={[styles.challenge, { backgroundColor: T.card, borderColor: T.line }]}>
          <Text style={[styles.challengeTitle, { color: T.text }]}>Traduce y di la línea {step + 1}:</Text>
          {step === 0 && <Text style={[styles.challengeText, { color: T.sub }]}>A (es): ¿Cuál es tu trabajo?</Text>}
          {step === 1 && <Text style={[styles.challengeText, { color: T.sub }]}>B (es): Soy {profA.es}. ¿Y tú?</Text>}
          {step === 2 && <Text style={[styles.challengeText, { color: T.sub }]}>A (es): Soy {profB.es}.</Text>}

          <View style={styles.modelAfter}>
            <Text style={[styles.modelHint, { color: T.sub }]}>Modelo (jp):</Text>
            {step === 0 && <Text style={[styles.modelText, { color: T.text }]}>{L1_MODEL}</Text>}
            {step === 1 && <Text style={[styles.modelText, { color: T.text }]}>{line2Model(profA)}</Text>}
            {step === 2 && <Text style={[styles.modelText, { color: T.text }]}>{line3Model(profB)}</Text>}
          </View>

          {/* Micrófono con fallback si no hay Voice */}
          <View style={styles.micRow}>
            {voiceReady ? (
              <Animated.View style={{ transform: [{ scale }] }}>
                <Pressable
                  onPressIn={startRecord}
                  onPressOut={stopRecord}
                  style={[
                    styles.micBtn,
                    { borderColor: recording ? T.primary : T.line, backgroundColor: T.card },
                    recording && { shadowColor: T.primary, shadowOpacity: 0.3 },
                  ]}
                >
                  <Text style={[styles.micTxt, { color: T.text }]}>{recording ? "Grabando…" : "Mantén para hablar 🎤"}</Text>
                </Pressable>
              </Animated.View>
            ) : (
              <View style={[styles.micUnavailable, { borderColor: T.line, backgroundColor: T.pill }]}>
                <Text style={{ color: T.sub, textAlign: "center" }}>
                  🎤 Micrófono no disponible en este entorno.\n
                  Usa un **Dev Client** con @react-native-voice/voice para activar STT.
                </Text>
              </View>
            )}
          </View>

          {/* Transcripción + feedback */}
          <View
            style={[
              styles.transcriptCard,
              { borderColor: ok == null ? T.line : ok ? T.rightLine : T.wrongLine, backgroundColor: T.card },
            ]}
          >
            <Text style={[styles.transcriptTitle, { color: T.sub }]}>Tu transcripción</Text>
            <Text style={[styles.transcriptText, { color: T.text }]} selectable>
              {transcript || (voiceReady ? "— — —" : "Mic no disponible")}
            </Text>
            {ok != null && (
              <Text style={[styles.transcriptHint, { color: ok ? T.rightLine : T.wrongLine }]}>
                {ok ? "よくできました ✅" : "✖︎ もういちど"}
              </Text>
            )}
          </View>

          <View style={styles.footerRow}>
            <Text style={{ color: T.sub }}>Ronda {round} · Puntaje {score}</Text>
            <Pressable
              onPress={() => {
                if (ok === false) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                next();
              }}
              style={({ pressed }) => [
                styles.primary,
                { backgroundColor: T.primary },
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={styles.primaryTxt}>{step < 2 ? "Siguiente línea ▶" : "Nuevo diálogo ▶"}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <Pressable
            onPress={newDialog}
            style={({ pressed }) => [
              styles.secondary,
              { borderColor: T.line, backgroundColor: T.pill },
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={{ fontWeight: "800", color: T.text }}>Cambiar profesiones ↻</Text>
          </Pressable>
          <Pressable
            onPress={() => setNight((v) => !v)}
            style={({ pressed }) => [
              styles.secondary,
              { borderColor: T.line, backgroundColor: T.pill },
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={{ fontWeight: "800", color: T.text }}>{night ? "☀️ 昼モード" : "🌙 夜モード"}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

/* ====== Subcomponentes ====== */
function Pill({ label, onPress, T }: { label: string; onPress: () => void; T: any }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        { backgroundColor: "#fff", borderColor: "#e7dfc6" },
        pressed && { opacity: 0.9 },
      ]}
    >
      <Text style={styles.pillTxt}>{label}</Text>
    </Pressable>
  );
}

/* ======================= estilos ======================= */
const styles = StyleSheet.create({
  flex1: { flex: 1 },

  /* Header */
  hero: { width: "100%", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16 },
  kouhaku: { flexDirection: "row", alignSelf: "flex-start", overflow: "hidden", borderRadius: 999, marginBottom: 10 },
  kouhakuRed: { width: 24, height: 6, backgroundColor: "#e84b3c" },
  kouhakuWhite: { width: 24, height: 6, backgroundColor: "#fff" },

  title: { fontSize: 22, fontWeight: "800", marginBottom: 2 },
  subtitle: { letterSpacing: 1, marginBottom: 6 },

  explain: {
    borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 10,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  explainTitle: { fontWeight: "800", marginBottom: 6 },
  explainBullet: { marginLeft: 2 },
  explainBtns: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },

  progressRail: { height: 8, borderRadius: 999, overflow: "hidden", marginTop: 8 },
  progressFill: { height: "100%", borderRadius: 999 },

  nightPill: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },

  /* Contenido principal */
  content: { padding: 16, paddingBottom: 36, gap: 12 },

  goalCard: {
    borderWidth: 1, borderRadius: 16, padding: 14, gap: 10,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  goalTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  goalText: { fontSize: 16, fontWeight: "700" },

  models: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },

  challenge: {
    borderWidth: 1, borderRadius: 16, padding: 14, gap: 10,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  challengeTitle: { fontSize: 16, fontWeight: "800" },
  challengeText: {},

  micRow: { alignItems: "center", marginTop: 6, marginBottom: 2 },
  micBtn: {
    borderWidth: 2,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  micUnavailable: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignSelf: "stretch",
  },
  micTxt: { fontWeight: "800" },

  transcriptCard: {
    borderWidth: 1, borderRadius: 14, padding: 12,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  transcriptTitle: { fontSize: 12, marginBottom: 6 },
  transcriptText: { fontSize: 16, fontWeight: "600" },
  transcriptHint: { marginTop: 8, fontWeight: "700" },

  footerRow: { marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  bottomRow: { marginTop: 8, flexDirection: "row", gap: 10 },
  secondary: {
    borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14,
    shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },

  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pillTxt: { fontWeight: "800", color: "#2f2a22" },

  badge: {
    width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center",
    borderWidth: 1,
  },
  badgeEmoji: { fontSize: 26 },

  smallNote: { fontSize: 12, marginTop: 10 },

  primary: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  primaryTxt: { color: "#fff", fontWeight: "900" },

  modelAfter: { marginTop: 4 },
  modelHint: { fontSize: 12 },
  modelText: { fontSize: 16, fontWeight: "700" },
});
