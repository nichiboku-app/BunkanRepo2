// src/screens/N5/HiraganaM/M_PracticaVoz.tsx
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

/**
 * ✅ expo-audio (SDK 54+)
 * - useAudioPlayer para reproducir (muestras y tu grabación)
 * - useAudioRecorder para grabar (reemplaza Audio.Recording de expo-av)
 */
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

/* =================== STT opcional (react-native-voice) =================== */
let Voice: any = null;
try {
  // Si no está instalado, este require fallará y seguimos sin STT.
  // @ts-ignore
  Voice = require("react-native-voice")?.default ?? require("react-native-voice");
} catch {}

/* =================== Tipos y datos =================== */
type KanaKey = "ma" | "mi" | "mu" | "me" | "mo";
type KanaItem = { key: KanaKey; char: string; romaji: string; audio: any };

const KANA_M: KanaItem[] = [
  { key: "ma", char: "ま", romaji: "ma", audio: require("../../../../assets/audio/hiragana/m/ma.mp3") },
  { key: "mi", char: "み", romaji: "mi", audio: require("../../../../assets/audio/hiragana/m/mi.mp3") },
  { key: "mu", char: "む", romaji: "mu", audio: require("../../../../assets/audio/hiragana/m/mu.mp3") },
  { key: "me", char: "め", romaji: "me", audio: require("../../../../assets/audio/hiragana/m/me.mp3") },
  { key: "mo", char: "も", romaji: "mo", audio: require("../../../../assets/audio/hiragana/m/mo.mp3") },
];

const onlyKana = (s: string) =>
  (s || "").replace(/\s+/g, "").replace(/[。、．，.]/g, "").toLowerCase();

// Hiragana → Katakana simple (para comparar si STT devuelve katakana)
const H2K: Record<string, string> = { ま: "マ", み: "ミ", む: "ム", め: "メ", も: "モ" };
const hiraToKata = (s: string) => s.split("").map((ch) => H2K[ch] ?? ch).join("");

/* =================== Pantalla =================== */
export default function M_PracticaVoz() {
  const [selected, setSelected] = useState<KanaItem>(KANA_M[0]);

  // ✅ Reproductores: uno para la muestra y otro para tu grabación
  // El hook recarga al cambiar la "source" (selected.audio o recURI)
  const samplePlayer = useAudioPlayer(selected.audio);
  const [recURI, setRecURI] = useState<string | null>(null);
  const playbackPlayer = useAudioPlayer(recURI ? { uri: recURI } : null);

  // ✅ Grabación con expo-audio
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recState = useAudioRecorderState(recorder); // isRecording, etc.

  // SFX de acierto/error (tu hook existente)
  const { playCorrect, playWrong } = useFeedbackSounds();

  // STT (si existe)
  const sttAvailable = !!Voice;
  const [recognized, setRecognized] = useState<string>("");
  const [matchResult, setMatchResult] = useState<"idle" | "ok" | "bad">("idle");

  /* -------- permisos y modo de audio --------
   * Nota: con expo-audio los nombres cambian:
   * - requestRecordingPermissionsAsync (NO requestPermissionsAsync)
   * - setAudioModeAsync({ playsInSilentMode, allowsRecording })
   */
  useEffect(() => {
    (async () => {
      try {
        const perm = await AudioModule.requestRecordingPermissionsAsync();
        if (!perm.granted) {
          console.warn("[audio] Mic permission not granted");
        }
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } catch (e) {
        console.warn("[audio] setAudioMode error:", e);
      }
    })();
  }, []);

  /* -------- STT handlers (opcional) -------- */
  useEffect(() => {
    if (!Voice) return;

    const onResults = (e: any) => setRecognized((e?.value?.[0] ?? "") as string);
    const onError = (e: any) => console.warn("[STT] error:", e);

    Voice.onSpeechResults = onResults;
    Voice.onSpeechError = onError;

    return () => {
      try {
        Voice.destroy?.();
        Voice.removeAllListeners?.();
      } catch {}
    };
  }, []);

  /* -------- reproducción de muestra -------- */
  const playSample = useCallback(async () => {
    try {
      // expo-audio NO reinicia solo al finalizar; para "replay":
      samplePlayer.seekTo(0);
      await samplePlayer.play();
    } catch (e) {
      console.warn("[sample] play error:", e);
    }
  }, [samplePlayer]);

  /* -------- grabar -------- */
  const startRecording = useCallback(async () => {
    if (recState.isRecording) return;

    setMatchResult("idle");
    setRecognized("");
    setRecURI(null);

    // STT en vivo (opcional)
    if (sttAvailable) {
      try { await Voice.stop?.(); } catch {}
      try { await Voice.start?.("ja-JP"); } catch (e) { console.warn("[STT] start error:", e); }
    }

    try {
      await recorder.prepareToRecordAsync(); // con las opciones del preset
      recorder.record();                    // comienza a grabar
    } catch (e) {
      console.warn("[recorder] start error:", e);
    }
  }, [recState.isRecording, sttAvailable, recorder]);

  const stopRecording = useCallback(async () => {
    if (!recState.isRecording) return;
    try {
      await recorder.stop(); // la URI queda en recorder.uri
      setRecURI(recorder.uri ?? null);
    } catch (e) {
      console.warn("[recorder] stop error:", e);
    } finally {
      if (sttAvailable) {
        try { await Voice.stop?.(); } catch {}
      }
    }
  }, [recState.isRecording, recorder, sttAvailable]);

  /* -------- reproducir mi grabación -------- */
  const playRecording = useCallback(async () => {
    if (!recURI) return;
    try {
      playbackPlayer.seekTo(0);
      await playbackPlayer.play();
    } catch (e) {
      console.warn("[rec] playback error:", e);
    }
  }, [recURI, playbackPlayer]);

  /* -------- evaluar (si hay STT) -------- */
  const evaluate = useCallback(async () => {
    if (!sttAvailable) return;

    const got = onlyKana(recognized);
    const expectedKana = onlyKana(selected.char);
    const expectedRomaji = onlyKana(selected.romaji);

    const ok =
      got === expectedKana ||
      got === hiraToKata(expectedKana) ||
      got === expectedRomaji;

    setMatchResult(ok ? "ok" : "bad");
    if (ok) await playCorrect();
    else await playWrong();
  }, [recognized, selected, sttAvailable, playCorrect, playWrong]);

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>Práctica con voz — Grupo M (ま・み・む・め・も)</Text>
      <Text style={s.subtitle}>
        1) Escucha la muestra · 2) Di la sílaba · 3) Reproduce tu grabación · {sttAvailable ? "4) Evalúa (STT)" : "Opcional: instala STT"}
      </Text>

      {/* Selector */}
      <View style={s.selector}>
        {KANA_M.map((k) => {
          const active = selected.key === k.key;
          return (
            <Pressable
              key={k.key}
              onPress={() => { setSelected(k); setMatchResult("idle"); setRecognized(""); }}
              style={[s.selBtn, active && s.selBtnActive]}
            >
              <Text style={[s.selKana, active && s.selKanaActive]}>{k.char}</Text>
              <Text style={[s.selRomaji, active && s.selKanaActive]}>{k.romaji}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Controles */}
      <View style={s.row}>
        <Pressable style={[s.btn, s.btnDark]} onPress={playSample}>
          <Text style={s.btnText}>🔊 Muestra ({selected.char})</Text>
        </Pressable>

        {!recState.isRecording ? (
          <Pressable style={[s.btn, s.btnGold]} onPress={startRecording}>
            <Text style={s.btnText}>● Grabar</Text>
          </Pressable>
        ) : (
          <Pressable style={[s.btn, s.btnStop]} onPress={stopRecording}>
            <Text style={s.btnText}>■ Detener</Text>
          </Pressable>
        )}

        <Pressable
          style={[s.btn, s.btnOutline]}
          onPress={playRecording}
          disabled={!recURI}
        >
          <Text style={[s.btnText, s.btnTextDark]}>
            {recURI ? "▶︎ Mi grabación" : "Sin grabación"}
          </Text>
        </Pressable>
      </View>

      {/* Evaluación (si hay STT) */}
      {sttAvailable && (
        <View style={s.evalRow}>
          <Pressable
            style={[s.btn, s.btnDark, { flex: 1 }]}
            onPress={evaluate}
            disabled={!recognized}
          >
            <Text style={s.btnText}>Evaluar</Text>
          </Pressable>
          <Text
            style={[
              s.badge,
              matchResult === "ok" && s.badgeOk,
              matchResult === "bad" && s.badgeBad,
            ]}
          >
            {matchResult === "idle"
              ? "—"
              : matchResult === "ok"
              ? "✅ Correcto"
              : "✖️ Intenta de nuevo"}
          </Text>
        </View>
      )}

      {/* Curiosidad */}
      <Text style={s.trivia}>
        Curiosidad: en Japón los trenes son tan puntuales que, si se retrasan,
        a veces entregan un certificado de tardanza para presentarlo en el trabajo o la escuela.
      </Text>
    </ScrollView>
  );
}

/* =================== Estilos =================== */
const FRAME = "#0C0C0C";
const BLACK = "#111827";
const GOLD = "#E7A725";

const s = StyleSheet.create({
  container: { padding: 16, paddingBottom: 36, gap: 12, backgroundColor: "#FFFFFF" },
  title: { fontSize: 22, fontWeight: "900", color: BLACK },
  subtitle: { fontSize: 13.5, color: "#374151" },

  selector: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  selBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: FRAME,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 74,
    backgroundColor: "#fff",
  },
  selBtnActive: { backgroundColor: "#111827" },
  selKana: { fontSize: 28, fontWeight: "900", color: BLACK, lineHeight: 28 },
  selKanaActive: { color: "#fff" },
  selRomaji: { fontSize: 12, color: "#6b7280", marginTop: 2, fontWeight: "800" },

  row: { flexDirection: "row", gap: 10, marginTop: 8, flexWrap: "wrap" },

  btn: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: FRAME,
  },
  btnDark: { backgroundColor: BLACK },
  btnGold: { backgroundColor: GOLD },
  btnStop: { backgroundColor: "#DC2626", borderColor: "#7F1D1D" },
  btnOutline: { backgroundColor: "#fff" },
  btnText: { color: "#fff", fontWeight: "900", letterSpacing: 0.3 },
  btnTextDark: { color: BLACK },

  evalRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: FRAME,
    backgroundColor: "#fff",
    fontWeight: "900",
    color: BLACK,
    minWidth: 130,
    textAlign: "center",
  },
  badgeOk: { backgroundColor: "#ecfdf5", borderColor: "#16a34a", color: "#065f46" },
  badgeBad: { backgroundColor: "#fef2f2", borderColor: "#dc2626", color: "#991b1b" },

  trivia: {
    marginTop: 14,
    color: "#4b5563",
    fontSize: 12.5,
    lineHeight: 18,
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
});
