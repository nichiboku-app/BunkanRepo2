// src/screens/VowelExercisesScreen.tsx
import { useAudioPlayer } from 'expo-audio';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { audioCache } from '../audio/cache';

type Key = 'a' | 'i' | 'u' | 'e' | 'o';
const KEYS: Key[] = ['a', 'i', 'u', 'e', 'o'];

export default function VowelExercisesScreen() {
  const [uris, setUris] = useState<Record<Key, string | null>>({
    a: null, i: null, u: null, e: null, o: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carga URIs desde tu cache (ya precargadas en otra pantalla)
    const next: Record<Key, string | null> = { a: null, i: null, u: null, e: null, o: null };
    for (const k of KEYS) {
      const uri = audioCache.get(`vowels:${k}`) ?? null;
      next[k] = uri;
      if (!uri) {
        console.log(`[VowelExercises] ❗ no URI cache for vowels:${k}`);
      }
    }
    setUris(next);
    setLoading(false);
  }, []);

  const missing = useMemo(
    () => KEYS.filter(k => !uris[k]),
    [uris]
  );

  return (
    <ScrollView contentContainerStyle={s.content}>
      <Text style={s.title}>Ejercicios de Vocales</Text>
      {loading && <Text style={s.note}>Preparando audio…</Text>}

      {!loading && missing.length > 0 && (
        <Text style={s.note}>
          Faltan audios en caché: {missing.join(', ')}. Regresa y entra de nuevo para recargarlos.
        </Text>
      )}

      {/* Solo renderizamos el pad cuando ya tenemos TODAS las URIs */}
      {!loading && missing.length === 0 && (
        <VowelPad
          uris={{
            a: uris.a as string,
            i: uris.i as string,
            u: uris.u as string,
            e: uris.e as string,
            o: uris.o as string,
          }}
        />
      )}

      <Text style={s.help}>
        Si no suena a la primera, vuelve a la pantalla anterior para recargar los audios.
      </Text>
    </ScrollView>
  );
}

/** Grid con 5 reproductores (uno por vocal) usando expo-audio */
function VowelPad({ uris }: { uris: Record<Key, string> }) {
  // Creamos 5 players, cada uno con su fuente
  const pA = useAudioPlayer(uris.a);
  const pI = useAudioPlayer(uris.i);
  const pU = useAudioPlayer(uris.u);
  const pE = useAudioPlayer(uris.e);
  const pO = useAudioPlayer(uris.o);

  const players: Record<Key, ReturnType<typeof useAudioPlayer>> = {
    a: pA, i: pI, u: pU, e: pE, o: pO,
  };

  const play = useCallback((k: Key) => {
    try {
      const p = players[k];
      p.seekTo(0);
      p.play();
    } catch (e) {
      console.log('[VowelExercises] play error', e);
      Alert.alert('Audio', `No se pudo reproducir "${k.toUpperCase()}".`);
    }
  }, [players.a, players.i, players.u, players.e, players.o]);

  // Liberar recursos cuando el componente se desmonta
  useEffect(() => {
    return () => {
      Object.values(players).forEach(p => {
        try { p.release(); } catch {}
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={s.grid}>
      {KEYS.map((k) => (
        <Pressable key={k} onPress={() => play(k)} style={s.card}>
          <Text style={s.kanji}>{k.toUpperCase()}</Text>
          <Text style={s.small}>Tocar para escuchar</Text>
        </Pressable>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  content: { padding: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  note: { color: '#666' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  card: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  kanji: { fontSize: 28, fontWeight: '800' },
  small: { fontSize: 12, color: '#666', marginTop: 4 },
  help: { marginTop: 16, color: '#666' },
});
