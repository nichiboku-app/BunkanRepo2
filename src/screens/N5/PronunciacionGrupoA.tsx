// src/screens/PronunciacionGrupoA.tsx  (expo-audio, grabación OK)
import { Asset } from 'expo-asset';
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';

// ✅ expo-audio (repro y grabación)
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
} from 'expo-audio';

type KanaKey = 'a' | 'i' | 'u' | 'e' | 'o';

type KanaItem = {
  key: KanaKey;
  hira: string;
  romaji: string;
  example: { jp: string; romaji: string; es: string };
  phraseKey?: KanaKey;
  phraseUri?: string;
};

const LOCAL_PHRASE: Partial<Record<KanaKey, number>> = {
  a: require('../../../assets/audio/n5/grupoA/a.mp3'),
  i: require('../../../assets/audio/n5/grupoA/i.mp3'),
  u: require('../../../assets/audio/n5/grupoA/u.mp3'),
  e: require('../../../assets/audio/n5/grupoA/e.mp3'),
  o: require('../../../assets/audio/n5/grupoA/o.mp3'),
};

const DATA: KanaItem[] = [
  { key: 'a', hira: 'あ', romaji: 'a', example: { jp: 'あめ', romaji: 'ame', es: 'lluvia' }, phraseKey: 'a' },
  { key: 'i', hira: 'い', romaji: 'i', example: { jp: 'いぬ', romaji: 'inu', es: 'perro' }, phraseKey: 'i' },
  { key: 'u', hira: 'う', romaji: 'u', example: { jp: 'うみ', romaji: 'umi', es: 'mar' }, phraseKey: 'u' },
  { key: 'e', hira: 'え', romaji: 'e', example: { jp: 'えき', romaji: 'eki', es: 'estación' }, phraseKey: 'e' },
  { key: 'o', hira: 'お', romaji: 'o', example: { jp: 'おちゃ', romaji: 'ocha', es: 'té' }, phraseKey: 'o' },
];

export default function PronunciacionGrupoA() {
  // ===== Precarga de assets locales → URIs =====
  const [uris, setUris] = useState<Partial<Record<KanaKey, string>>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const out: Partial<Record<KanaKey, string>> = {};
        for (const k of ['a', 'i', 'u', 'e', 'o'] as KanaKey[]) {
          const mod = LOCAL_PHRASE[k];
          if (!mod) continue;
          const asset = Asset.fromModule(mod);
          await asset.downloadAsync();
          out[k] = asset.localUri || asset.uri;
        }
        if (!cancelled) setUris(out);
      } catch (e) {
        console.warn('[PRELOAD] Pronunciación error', e);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
      try { Speech.stop(); } catch {}
    };
  }, []);

  // ===== TTS (respaldo) =====
  const [jaVoiceId, setJaVoiceId] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const vs = await Speech.getAvailableVoicesAsync();
        const ja = vs.find(v => v.language?.toLowerCase().startsWith('ja'));
        setJaVoiceId(ja?.identifier ?? null);
      } catch {}
    })();
  }, []);
  const speak = useCallback(
    async (text: string) => {
      try {
        Speech.stop();
        Vibration.vibrate(6);
        Speech.speak(text, { language: 'ja-JP', voice: jaVoiceId ?? undefined, rate: 1.0, pitch: 1.0 });
      } catch {}
    },
    [jaVoiceId]
  );

  // ===== Grabación con expo-audio (API correcta) =====
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const recPlayer = useAudioPlayer(recordedUri ?? undefined);

  const startRecording = useCallback(async () => {
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permiso requerido', 'Activa el micrófono para grabar tu voz.');
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });

      // preparar y comenzar
      await recorder.prepareToRecordAsync();
      recorder.record();

      setRecordedUri(null);
      setIsRecording(true);
      Vibration.vibrate(10);
    } catch (e) {
      console.warn('[REC] start error', e);
    }
  }, [recorder]);

  const stopRecording = useCallback(async () => {
    try {
      await recorder.stop();
      // la URI queda en recorder.uri
      setRecordedUri(recorder.uri ?? null);
    } catch (e) {
      console.warn('[REC] stop error', e);
    } finally {
      setIsRecording(false);
      Vibration.vibrate(10);
      // (opcional) salir de modo grabación
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
    }
  }, [recorder]);

  const playRecording = useCallback(async () => {
    if (!recordedUri) return;
    try {
      recPlayer.seekTo(0);
      recPlayer.play();
    } catch (e) {
      console.warn('[PLAY] grabación error', e);
    }
  }, [recordedUri, recPlayer]);

  // ===== Render =====
  const missing = useMemo(
    () => (['a', 'i', 'u', 'e', 'o'] as KanaKey[]).filter(k => !uris[k]),
    [uris]
  );

  const renderItem = ({ item }: { item: KanaItem }) => (
    <KanaCard item={item} localUris={uris} speak={speak} />
  );

  const isDisabled = !recordedUri;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pronunciación — Grupo A</Text>
      <Text style={styles.subtitle}>Toca “Escuchar” para oír al instante.</Text>

      {!ready && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 8, fontWeight: '700' }}>Preparando audios…</Text>
            <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
              Solo la primera vez que abres esta pantalla.
            </Text>
          </View>
        </View>
      )}

      {ready && missing.length > 0 && (
        <Text style={{ textAlign: 'center', color: '#666', marginBottom: 8 }}>
          Faltan audios locales: {missing.join(', ')} (si falta alguno usaremos TTS).
        </Text>
      )}

      <FlatList
        data={DATA}
        keyExtractor={(it) => it.key}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      <View style={styles.practiceBox}>
        <Text style={styles.practiceTitle}>Práctica rápida</Text>
        <Text style={styles.practiceHint}>
          Mantén presionado “Grabar” y di el sonido (por ejemplo “あ” o “あめ”).
        </Text>

        <View style={styles.row}>
          <Pressable
            onPressIn={startRecording}
            onPressOut={stopRecording}
            style={({ pressed }) => [
              styles.recBtn,
              isRecording && styles.recActive,
              pressed && styles.btnPressed,
            ]}
          >
            <Text style={styles.recText}>{isRecording ? 'Grabando…' : '🎙️ Mantén para Grabar'}</Text>
          </Pressable>

          <Pressable
            disabled={isDisabled}
            onPress={playRecording}
            style={[styles.playbackBtn, isDisabled && { opacity: 0.6 }]}
          >
            <Text style={styles.playbackText}>▶️ Escuchar mi grabación</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.footerNote}>
        Tip: practica con ritmo “a-i-u-e-o”, abriendo bien en “a” y cerrando en “u”.
      </Text>
    </View>
  );
}

/** Tarjeta que reproduce la frase con expo-audio, o TTS si no hay fuente */
function KanaCard({
  item,
  localUris,
  speak,
}: {
  item: KanaItem;
  localUris: Partial<Record<KanaKey, string>>;
  speak: (t: string) => Promise<void> | void;
}) {
  const key = (item.phraseKey ?? item.key) as KanaKey;

  const localPlayer = useAudioPlayer(localUris[key] ?? undefined);
  const [remoteSource, setRemoteSource] = useState<string | undefined>(undefined);
  const remotePlayer = useAudioPlayer(remoteSource);

  const onPlay = useCallback(async () => {
    try {
      if (item.phraseUri) {
        setRemoteSource(item.phraseUri);
        setTimeout(() => {
          remotePlayer.seekTo(0);
          remotePlayer.play();
        }, 0);
        return;
      }
      if (localUris[key]) {
        localPlayer.seekTo(0);
        localPlayer.play();
        return;
      }
      const frase = `${item.hira}、${item.example.jp}`;
      await speak(frase);
    } catch (e) {
      console.log('[PHRASE] play error', e);
      Alert.alert('Audio', 'No se pudo reproducir el audio.');
    }
  }, [item, key, localUris, localPlayer, remotePlayer, speak]);

  return (
    <View style={styles.card}>
      <Text style={styles.kana}>{item.hira}</Text>
      <Text style={styles.romaji}>{item.romaji}</Text>

      <View style={styles.examples}>
        <Text style={styles.exampleJP}>{item.example.jp}</Text>
        <Text style={styles.exampleRomaji}>
          {item.example.romaji} — {item.example.es}
        </Text>
      </View>

      <View style={styles.row}>
        <Pressable onPress={onPlay} style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}>
          <Text style={styles.btnText}>▶️ Escuchar</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ================== Estilos ================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf7f0', paddingHorizontal: 16, paddingTop: 12 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  subtitle: { textAlign: 'center', fontSize: 13, color: '#444', marginTop: 6, marginBottom: 10 },
  listContent: { paddingBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  kana: { fontSize: 56, textAlign: 'center', lineHeight: 64 },
  romaji: { fontSize: 16, textAlign: 'center', color: '#666', marginTop: 4 },
  examples: { marginTop: 10, alignItems: 'center' },
  exampleJP: { fontSize: 20, lineHeight: 26 },
  exampleRomaji: { fontSize: 13, color: '#666', marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'center', columnGap: 10, marginTop: 12 },
  btn: { backgroundColor: '#111827', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, minWidth: 140 },
  btnPressed: { opacity: 0.7, transform: [{ scale: 0.99 }] },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '600' },

  practiceBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  practiceTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  practiceHint: { fontSize: 12, color: '#666', textAlign: 'center' },
  recBtn: { backgroundColor: '#b91c1c', flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  recActive: { backgroundColor: '#ef4444' },
  recText: { color: '#fff', fontWeight: '700' },
  playbackBtn: { backgroundColor: '#111827', flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  playbackText: { color: '#fff', fontWeight: '700' },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  footerNote: { textAlign: 'center', fontSize: 12, color: '#555', marginBottom: 12 },
});
