import { Image as ExpoImage } from "expo-image";
import { useState } from "react";
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { KANJI_STROKE_NUMS } from "../kanjiStrokeNums";
import { KANJI_VOCAB } from "../kanjiVocab";

const W = Math.min( (Dimensions.get("window").width - 16*2 - 10*2) / 3, 110 );

export default function KanjiSection({ kanjis }: { kanjis: string[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <View style={{ marginTop: 16 }}>
      <Text style={styles.h2}>Kanjis nuevos (12)</Text>
      <View style={styles.grid}>
        {kanjis.map((k) => (
          <Pressable key={k} style={styles.card} onPress={() => setOpen(k)}>
            <Text style={styles.big}>{k}</Text>
            <Text style={styles.small}>ver trazos</Text>
          </Pressable>
        ))}
      </View>

      {/* Modal de detalle */}
      <Modal visible={!!open} animationType="slide" onRequestClose={() => setOpen(null)} transparent>
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{open}</Text>
              <Pressable onPress={() => setOpen(null)}><Text style={styles.close}>Cerrar</Text></Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
              {/* Orden de trazo numerado */}
              {open && KANJI_STROKE_NUMS[open] && (
                <ExpoImage
                  source={KANJI_STROKE_NUMS[open]}
                  style={{ width: "100%", height: 260, borderRadius: 12, backgroundColor: "#fff" }}
                  contentFit="contain"
                />
              )}

              {/* 3 palabras de práctica */}
              <Text style={styles.sub}>Palabras ejemplo</Text>
              {open && (KANJI_VOCAB[open] || []).map((v, i) => (
                <View key={i} style={styles.vRow}>
                  <Text style={styles.vJp}>{v.jp}</Text>
                  <Text style={styles.vRomaji}>{v.romaji}</Text>
                  <Text style={styles.vEs}>{v.es}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  h2: { color: "#fff", fontWeight: "900", fontSize: 16, marginHorizontal: 16, marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 16 },
  card: {
    width: W, height: W, borderRadius: 14, alignItems: "center", justifyContent: "center",
    backgroundColor: "#161922", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  big: { fontSize: 34, color: "#fff", fontWeight: "900", lineHeight: 36 },
  small: { marginTop: 6, color: "rgba(255,255,255,0.8)", fontSize: 12 },

  modalWrap: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#0E1015", borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: "88%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  modalTitle: { color: "#fff", fontSize: 20, fontWeight: "900" },
  close: { color: "#fff", fontWeight: "800" },
  sub: { color: "rgba(255,255,255,0.9)", fontWeight: "800", marginTop: 12, marginHorizontal: 14, marginBottom: 6 },

  vRow: { paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  vJp: { color: "#fff", fontWeight: "900", fontSize: 16 },
  vRomaji: { color: "rgba(255,255,255,0.85)" },
  vEs: { color: "rgba(255,255,255,0.9)" },
});
