// src/screens/MejorasScreen.tsx
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth, db } from "../config/firebaseConfig";

type Feedback = {
  id: string;
  userId: string | null;
  displayName: string;
  rating: number;
  comment: string;
  createdAt: Date | null;
};

export default function MejorasScreen() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const user = auth.currentUser;
  const displayName = user?.displayName || "Alumno";

  // Escuchar opiniones en tiempo real
  useEffect(() => {
    const ref = collection(db, "appFeedback");
    const q = query(ref, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: Feedback[] = snap.docs.map((d) => {
          const data: any = d.data();
          return {
            id: d.id,
            userId: data.userId ?? null,
            displayName: data.displayName ?? "Alumno",
            rating: data.rating ?? 0,
            comment: data.comment ?? "",
            createdAt: data.createdAt?.toDate?.() ?? null,
          };
        });
        setFeedbackList(list);
        setLoading(false);
      },
      (err) => {
        console.warn("Error leyendo appFeedback", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const avgRating = useMemo(() => {
    if (feedbackList.length === 0) return 0;
    const sum = feedbackList.reduce((acc, f) => acc + (f.rating || 0), 0);
    return Math.round((sum / feedbackList.length) * 10) / 10;
  }, [feedbackList]);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Inicia sesión", "Necesitas iniciar sesión para opinar.");
      return;
    }

    if (rating < 1 || rating > 5) {
      Alert.alert("Evalúa la app", "Por favor selecciona entre 1 y 5 estrellas.");
      return;
    }

    const text = comment.trim();
    if (!text) {
      Alert.alert("Escribe un comentario", "Cuéntanos qué te gusta o qué mejorarías.");
      return;
    }

    try {
      setSubmitting(true);
      await addDoc(collection(db, "appFeedback"), {
        userId: user.uid,
        displayName,
        rating,
        comment: text,
        createdAt: serverTimestamp(),
      });

      setRating(0);
      setComment("");
      Alert.alert("¡Gracias!", "Tu opinión nos ayuda a mejorar.");
    } catch (e) {
      console.warn("Error enviando feedback", e);
      Alert.alert("Error", "No se pudo enviar tu opinión.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f0f0f0" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mejoras y opiniones</Text>
          <Text style={styles.headerSubtitle}>
            Evalúa la app, cuéntanos qué te gusta y qué podemos mejorar. Tu opinión es pública
            para que otros alumnos también la vean.
          </Text>
        </View>

        {/* Resumen de rating */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Valoración general</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryScore}>{avgRating.toFixed(1)}</Text>
            <StarDisplay rating={avgRating} size={20} />
          </View>
          <Text style={styles.summaryCount}>
            {feedbackList.length} opinión{feedbackList.length === 1 ? "" : "es"} registradas
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Tu evaluación</Text>
          <Text style={styles.formLabel}>Selecciona estrellas</Text>
          <StarSelector rating={rating} onChange={setRating} />

          <Text style={[styles.formLabel, { marginTop: 10 }]}>Comentario</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Escribe aquí tu opinión sobre la app..."
            placeholderTextColor="#aaa"
            value={comment}
            onChangeText={setComment}
          />

          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Enviar opinión</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Lista de opiniones */}
        <Text style={styles.listTitle}>Opiniones de alumnos</Text>

        {loading ? (
          <View style={{ paddingVertical: 20, alignItems: "center" }}>
            <ActivityIndicator size="small" color="#b6111b" />
          </View>
        ) : feedbackList.length === 0 ? (
          <Text style={styles.emptyText}>
            Aún no hay opiniones. Sé el primero en dejarnos tu comentario.
          </Text>
        ) : (
          <View style={styles.listWrap}>
            {feedbackList.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeaderRow}>
                  <Text style={styles.itemName}>{item.displayName}</Text>
                  <StarDisplay rating={item.rating} size={14} />
                </View>
                <Text style={styles.itemComment}>{item.comment}</Text>
                {item.createdAt && (
                  <Text style={styles.itemDate}>
                    {item.createdAt.toLocaleDateString()}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ======= Componentes auxiliares de estrellas ======= */

function StarSelector({
  rating,
  onChange,
}: {
  rating: number;
  onChange: (n: number) => void;
}) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity
          key={n}
          onPress={() => onChange(n)}
          activeOpacity={0.8}
          style={styles.starTouchable}
        >
          <Text style={[styles.starIcon, n <= rating && styles.starIconActive]}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function StarDisplay({ rating, size }: { rating: number; size: number }) {
  const full = Math.round(rating); // simple: redondeamos
  return (
    <View style={styles.starRowDisplay}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Text
          key={n}
          style={[
            styles.starIconDisplay,
            { fontSize: size },
            n <= full && styles.starIconActive,
          ]}
        >
          ★
        </Text>
      ))}
    </View>
  );
}

/* ======= Estilos ======= */

const styles = StyleSheet.create({
  scrollContent: {
    padding: 14,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#222",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#555",
    marginTop: 4,
  },
  summaryCard: {
    borderRadius: 14,
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  summaryScore: {
    fontSize: 26,
    fontWeight: "900",
    marginRight: 8,
    color: "#B80C1F",
  },
  summaryCount: {
    fontSize: 11,
    color: "#777",
    marginTop: 4,
  },
  formCard: {
    borderRadius: 14,
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#222",
    marginBottom: 4,
  },
  formLabel: {
    fontSize: 12,
    color: "#555",
    marginTop: 4,
    marginBottom: 2,
  },
  starRow: {
    flexDirection: "row",
  },
  starRowDisplay: {
    flexDirection: "row",
  },
  starTouchable: {
    paddingHorizontal: 2,
  },
  starIcon: {
    fontSize: 24,
    color: "#ccc",
  },
  starIconDisplay: {
    color: "#ccc",
  },
  starIconActive: {
    color: "#ffb400",
  },
  input: {
    marginTop: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 8 : 6,
    minHeight: 70,
    textAlignVertical: "top",
    fontSize: 13,
    color: "#222",
  },
  submitBtn: {
    marginTop: 10,
    borderRadius: 999,
    backgroundColor: "#000",
    paddingVertical: 10,
    alignItems: "center",
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#222",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 12,
    color: "#777",
  },
  listWrap: {
    gap: 8,
  },
  itemCard: {
    borderRadius: 10,
    backgroundColor: "#fff",
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  itemHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
  },
  itemComment: {
    fontSize: 12,
    color: "#444",
  },
  itemDate: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
    textAlign: "right",
  },
});
