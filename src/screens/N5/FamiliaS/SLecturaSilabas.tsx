// src/screens/N5/FamiliaN/NLecturaGuiadaScreen.tsx
import { Asset } from 'expo-asset';
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';

// ✅ Nueva API de audio
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';

/* =========================
   Tipos
========================= */
type KanaKeyN = 'na' | 'ni' | 'nu' | 'ne' | 'no';

type ItemN = {
  key: KanaKeyN;
  hira: string;
  romaji: string;
  example: { jp: string; romaji: string; es: string };
  audioKey: KanaKeyN; // para mapear al mp3 local
};

/* =========================
   MP3 locales (gTTS)
========================= */
const LOCAL_N: Record<KanaKeyN, number> = {
  na: require('../../../../assets/audio/n5/grupoN/na.mp3'),
  ni: require('../../../../assets/audio/n5/grupoN/ni.mp3'),
  nu: require('../../../../assets/audio/n5/grupoN/nu.mp3'),
  ne: require('../../../../assets/audio/n5/grupoN/ne.mp3'),
  no: require('../../../../assets/audio/n5/grupoN/no.mp3'),
};

/* =========================
   Datos de práctica (grupo N)
========================= */
const DATA: ItemN[] = [
  { key: 'na', hira: 'な', romaji: 'na', example: { jp: 'なつ', romaji: 'natsu', es: 'verano' }, audioKey: 'na' },
  { key: 'ni', hira: 'に', romaji: 'ni', example: { jp: 'にほん', romaji: 'nihon', es: 'Japón' }, audioKey: 'ni' },
  { key: 'nu', hira: 'ぬ', romaji: 'nu', example: { jp: 'ぬの', romaji: 'nuno', es: 'tela' }, audioKey: 'nu' },
  { key: 'ne', hira: 'ね', romaji: 'ne', example: { jp: 'ねこ', romaji: 'neko', es: 'gato' }, audioKey: 'ne' },
  { key: 'no', hira: 'の', romaji: 'no', example: { jp: 'のむ', romaji: 'nomu', es: 'beber' }, audioKey: 'no' },
];

/* =========================
   Pantalla
========================= */
export default function NLecturaGuiadaScreen() {
  const [ready, setReady] = useState(false);
  const [jaVoiceId, setJaVoiceId] = useState<string | null>(null);

  // URIs locales precargadas por clave
  const [uris, setUris] = useState<Partial<Record<KanaKeyN, string>>>({});

  /* Precarga de MP3 locales + voz TTS */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // precargar assets a disco y guardar sus URIs
        const map: Partial<Record<KanaKeyN, string>> = {};
        for (const it of DATA) {
          const mod = LOCAL_N[it.audioKey];
          const asset = Asset.fromModule(mod);
          await asset.downloadAsync();
          map[it.audioKey] = asset.localUri || asset.uri;
        }
        if (!cancelled) setUris(map);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    // detectar voz japonesa para TTS
    (async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        const ja = voices.find(v => v.language?.toLowerCase().startsWith('ja'));
        setJaVoiceId(ja?.identifier ?? null);
      } catch {}
    })();

    return () => {
      try { Speech.stop(); } catch {}
    };
  }, []);

  // Reproducir solo la sílaba (TTS)
  const speakKana = useCallback(
    async (text: string) => {
      try {
        Vibration.vibrate(6);
        await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
        Speech.stop();
        Speech.speak(text, {
          language: 'ja-JP',
          voice: jaVoiceId ?? undefined,
          rate: 1.0,
          pitch: 1.0,
        });
      } catch {}
    },
    [jaVoiceId]
  );

  /* =========================
     UI
  ========================= */
  const missing = useMemo(
    () => (['na', 'ni', 'nu', 'ne', 'no'] as KanaKeyN[]).filter(k => !uris[k]),
    [uris]
  );

  const renderItem = ({ item }: { item: ItemN }) => (
    <RowN
      item={item}
      localUri={uris[item.audioKey]}
      onSpeakKana={() => speakKana(item.hira)}
      ready={ready}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lectura guiada — Familia N</Text>
      <Text style={styles.subtitle}>
        Toca “Sílaba” para oír solo el sonido, o “Ejemplo completo” para escuchar la frase.
      </Text>

      {ready && missing.length > 0 && (
        <Text style={{ textAlign: 'center', color: '#666', marginBottom: 8 }}>
          Faltan audios locales: {missing.join(', ')} (puedes seguir usando “Sílaba” con TTS).
        </Text>
      )}

      <FlatList
        data={DATA}
        keyExtractor={(it) => it.key}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

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

      <Text style={styles.footerNote}>
        Tip: repite en voz alta, primero despacio (“ね… ねこ”), luego continuo (“ね。ねこ。”).
      </Text>
    </View>
  );
}

/** Fila con reproductor propio (expo-audio) */
function RowN({
  item,
  localUri,
  onSpeakKana,
  ready,
}: {
  item: ItemN;
  localUri?: string;
  onSpeakKana: () => void;
  ready: boolean;
}) {
  // Un player por fila con la fuente local (si existe)
  const player = useAudioPlayer(localUri ?? undefined);

  const playExample = useCallback(async () => {
    if (!ready) return;
    if (!localUri) {
      // Fallback TTS: “ね。ねこ。”
      onSpeakKana();
      return;
    }
    try {
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
    } catch {}
    Vibration.vibrate(8);
    player.seekTo(0);
    player.play();
  }, [ready, localUri, player, onSpeakKana]);

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
        <Pressable onPressIn={onSpeakKana} style={({ pressed }) => [styles.btnRed, pressed && styles.btnPressed]}>
          <Text style={styles.btnText}>▶︎ Sílaba</Text>
        </Pressable>

        <Pressable
          onPressIn={playExample}
          disabled={!ready}
          style={({ pressed }) => [styles.btnDark, (!ready || pressed) && styles.btnPressed]}
        >
          <Text style={styles.btnText}>{ready ? '▶︎ Ejemplo completo' : 'Cargando…'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* =========================
   Estilos
========================= */
const INK = '#111827';
const PAPER = '#faf7f0';
const RED = '#B32133';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAPER, paddingHorizontal: 16, paddingTop: 12 },
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
  btnRed: { backgroundColor: RED, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, minWidth: 120 },
  btnDark: { backgroundColor: INK, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, minWidth: 160 },
  btnPressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '700' },

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
