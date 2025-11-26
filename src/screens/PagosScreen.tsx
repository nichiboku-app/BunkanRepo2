import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  ImageBackground,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../config/firebaseConfig";

// 🔴 MODO PRUEBA – Payment Links TEST (Stripe TEST)
const PREMIUM_URL =
  "https://buy.stripe.com/cNi28j37f5xOaXFaIz83C00"; // Plan Premium 400 MXN (TEST)

const STUDENT_URL =
  "https://buy.stripe.com/00w8wHcHPgcs7Lt03V83C01"; // Plan Estudiante 250 MXN (TEST)

// ⬇ TAMAÑO SOLO DE LAS IMÁGENES DE CADA TARJETA ⬇
const FREE_CARD_WIDTH = 450;
const FREE_CARD_HEIGHT = 240;

const STUDENT_CARD_WIDTH = 540;
const STUDENT_CARD_HEIGHT = 210;

const PREMIUM_CARD_WIDTH = 450;
const PREMIUM_CARD_HEIGHT = 300;
// Subes/bajas estos valores para ajustar SOLO las imágenes de las tarjetas.

// 🔐 Valida credencial en Firestore
async function validateStudentCredential(rawCode: string) {
  const sanitized = (rawCode || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, ""); // solo A-Z y 0-9

  if (!sanitized) {
    throw new Error("Por favor escribe tu número de credencial.");
  }

  if (sanitized.length < 6) {
    throw new Error(
      "La credencial debe tener al menos 6 caracteres (solo letras y números, sin guiones)."
    );
  }

  const docRef = doc(db, "studentCredentials", sanitized);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    throw new Error(
      "El número de la credencial es incorrecto. Revisa que esté bien escrito o consulta a tu profesor."
    );
  }

  const data = snap.data() || {};

  if ((data as any).active === false) {
    throw new Error("Esta credencial está inactiva. Habla con tu profesor.");
  }

  if ((data as any).used) {
    throw new Error("Esta credencial ya fue utilizada por otro alumno.");
  }

  const uid = auth.currentUser?.uid || null;

  await updateDoc(docRef, {
    used: true,
    usedByUid: uid,
    usedAt: new Date(),
  });

  return {
    code: sanitized,
    ownerName: (data as any).ownerName || "",
  };
}

async function openPaymentLink(url: string) {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert("Error", "No se pudo abrir la página de pago.");
      return;
    }
    await Linking.openURL(url);
  } catch (err) {
    console.log(err);
    Alert.alert("Error", "Ocurrió un problema al abrir el pago.");
  }
}

export default function PagosScreen() {
  const pulsePremium = useRef(new Animated.Value(1)).current;
  const pulseStudent = useRef(new Animated.Value(1)).current;

  // Modal estudiante
  const [studentModalVisible, setStudentModalVisible] = useState(false);
  const [credentialInput, setCredentialInput] = useState("");
  const [validating, setValidating] = useState(false);

  // Plan actual del usuario
  const [plan, setPlan] = useState<"free" | "student" | "premium">("free");
  const [planStatus, setPlanStatus] = useState<"none" | "active" | "inactive">(
    "none"
  );

  useEffect(() => {
    // Premium
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulsePremium, {
          toValue: 1.04,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulsePremium, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Estudiante (rojo)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseStudent, {
          toValue: 1.04,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseStudent, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulsePremium, pulseStudent]);

  // Escuchar plan del usuario en Firestore
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const ref = doc(db, "Usuarios", uid);

    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as any;
          setPlan((data.plan as any) || "free");
          setPlanStatus((data.planStatus as any) || "none");
          console.log("Plan desde Firestore:", data.plan, data.planStatus);
        } else {
          setPlan("free");
          setPlanStatus("none");
        }
      },
      (error) => {
        console.log("Error leyendo plan del usuario:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleStudentPress = () => {
    setStudentModalVisible(true);
  };

  const handleConfirmStudent = async () => {
    try {
      setValidating(true);
      const result = await validateStudentCredential(credentialInput);

      setValidating(false);
      setStudentModalVisible(false);
      setCredentialInput("");

      Alert.alert(
        "Credencial validada 🎓",
        result.ownerName
          ? `Hola ${result.ownerName}, se activará el pago especial para alumnos.`
          : "Se activará el pago especial para alumnos."
      );

      openPaymentLink(STUDENT_URL);
    } catch (err: any) {
      console.log(err);
      setValidating(false);
      Alert.alert(
        "No pudimos validar tu credencial",
        err?.message || "El número de la credencial es incorrecto."
      );
    }
  };

  const isActive = planStatus === "active";
  const planLabel =
    plan === "premium"
      ? "Plan Premium Autodidacta"
      : plan === "student"
      ? "Plan Estudiante / Alumno"
      : "Versión gratuita";
  const statusLabel = isActive ? "Activo" : "Sin activar";

  const bannerStyle = [
    styles.planBanner,
    plan === "premium" && styles.planBannerPremium,
    plan === "student" && styles.planBannerStudent,
    plan === "free" && styles.planBannerFree,
  ];

  return (
    <ImageBackground
      source={require("../../assets/pagos-bg.webp")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* BANNER PLAN ACTUAL */}
        <View style={bannerStyle}>
          <Text style={styles.planBannerTitle}>Tu plan actual</Text>
          <Text style={styles.planBannerPlan}>{planLabel}</Text>
          <Text style={styles.planBannerStatus}>
            Estado:{" "}
            <Text
              style={
                isActive ? styles.planStatusActive : styles.planStatusInactive
              }
            >
              {statusLabel}
            </Text>
          </Text>
        </View>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.logoText}>NICHIBOKU</Text>
          <Text style={styles.title}>Activa tu acceso Nichiboku</Text>
          <Text style={styles.subtitle}>
            Elige el plan que mejor se adapte a tu forma de estudiar japonés.
            Tus pagos son procesados de forma segura con Stripe.
          </Text>
        </View>

        {/* ========== TARJETA AZUL – VERSIÓN GRATUITA ========== */}
        <View style={styles.cardContainerTop}>
          <ImageBackground
            source={require("../../assets/card-free-blue.webp")}
            style={{
              width: FREE_CARD_WIDTH,
              height: FREE_CARD_HEIGHT,
            }}
            imageStyle={styles.cardImage}
          >
            <View style={styles.cardInnerFree}>
              <Text style={styles.badgeFree}>PRUEBA</Text>

              <Text style={styles.cardTitleLight}>Versión gratuita</Text>
              <Text style={styles.priceLight}>
                <Text style={styles.priceCurrencyLight}>MXN </Text>
                <Text style={styles.priceNumberLight}>0</Text>
                <Text style={styles.pricePeriodLight}> / mes</Text>
              </Text>

              <View style={styles.bulletList}>
                <Text style={styles.bulletText}>• Acceso limitado</Text>
                <Text style={styles.bulletText}>• Sin acceso completo</Text>
              </View>

              <TouchableOpacity
                style={styles.buttonFree}
                onPress={() =>
                  Alert.alert(
                    "Versión gratuita",
                    "Puedes seguir usando la versión gratuita con funciones limitadas."
                  )
                }
              >
                <Text style={styles.buttonFreeText}>Seguir gratis</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        {/* ========== TARJETA ROJA – PLAN ESTUDIANTE ========== */}
        <View style={styles.cardContainer}>
          <Animated.View style={{ transform: [{ scale: pulseStudent }] }}>
            <ImageBackground
              source={require("../../assets/card-student-red.webp")}
              style={{
                width: STUDENT_CARD_WIDTH,
                height: STUDENT_CARD_HEIGHT,
              }}
              imageStyle={styles.cardImage}
            >
              <View style={styles.cardInnerStudent}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardTitleLight}>
                    Plan Estudiante / Alumno
                  </Text>
                  <Text style={styles.badgeStudent}>ESTUDIANTE</Text>
                </View>

                <Text style={styles.priceLight}>
                  <Text style={styles.priceCurrencyLight}>MXN </Text>
                  <Text style={styles.priceNumberStudent}>250</Text>
                  <Text style={styles.pricePeriodLight}> / mes</Text>
                </Text>

                <View style={styles.bulletList}>
                  <Text style={styles.bulletText}>• Precio especial</Text>
                  <Text style={styles.bulletText}>
                    • Acceso completo a todos si ya estudias con profesor
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.buttonStudent}
                  onPress={handleStudentPress}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.buttonStudentText}>Soy estudiante</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </Animated.View>
        </View>

        {/* ========== TARJETA NEGRA – PLAN PREMIUM AUTODIDACTA ========== */}
        <View style={styles.cardContainer}>
          <Animated.View style={{ transform: [{ scale: pulsePremium }] }}>
            <ImageBackground
              source={require("../../assets/card-premium-black.webp")}
              style={{
                width: PREMIUM_CARD_WIDTH,
                height: PREMIUM_CARD_HEIGHT,
              }}
              imageStyle={styles.cardImage}
            >
              <View style={styles.cardInnerPremium}>
                <View style={styles.cardHeaderRow}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.crown}>👑 </Text>
                    <Text style={styles.cardTitlePremium}>
                      Plan Premium Autodidacta
                    </Text>
                  </View>
                  <Text style={styles.badgePremium}>RECOMENDADO</Text>
                </View>

                <Text style={styles.pricePremium}>
                  <Text style={styles.priceCurrencyPremium}>MXN </Text>
                  <Text style={styles.priceNumberPremium}>400</Text>
                  <Text style={styles.pricePeriodPremium}> / mes</Text>
                </Text>

                <View style={styles.bulletList}>
                  <Text style={styles.bulletTextPremium}>
                    • IA para completo N5 → N1
                  </Text>
                  <Text style={styles.bulletTextPremium}>
                    • Videojuego educativo y logros
                  </Text>
                  <Text style={styles.bulletTextPremium}>
                    • Red social integrada y cuaderno japonés
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.buttonPremium}
                  onPress={() => openPaymentLink(PREMIUM_URL)}
                >
                  <Text style={styles.buttonPremiumText}>
                    Quiero app premium
                  </Text>
                </TouchableOpacity>

                <Text style={styles.notePremium}>
                  Pagos protegidos con Stripe. Puedes ajustar o cancelar tu plan
                  cuando lo necesites.
                </Text>
              </View>
            </ImageBackground>
          </Animated.View>
        </View>
      </ScrollView>

      {/* MODAL CREDENCIAL ESTUDIANTE */}
      <Modal
        visible={studentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !validating && setStudentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirmar credencial</Text>
            <Text style={styles.modalSubtitle}>
              Ingresa tu número de credencial Nichiboku para activar el precio
              especial de alumno presencial.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Ej. BKN1234ABCD"
              placeholderTextColor="#6b7280"
              autoCapitalize="characters"
              value={credentialInput}
              onChangeText={setCredentialInput}
              editable={!validating}
              maxLength={20}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  if (!validating) {
                    setStudentModalVisible(false);
                    setCredentialInput("");
                  }
                }}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleConfirmStudent}
                disabled={validating}
              >
                {validating ? (
                  <ActivityIndicator color="#0f172a" />
                ) : (
                  <Text style={styles.modalButtonPrimaryText}>
                    Validar y pagar
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHint}>
              Escribe tu credencial todo junto, sin guiones, mínimo 6 caracteres
              (solo letras y números). Si no la conoces, pide ayuda a tu
              profesor.
            </Text>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

/* ================= ESTILOS ================= */

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#050816",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 40,
  },

  /* BANNER PLAN ACTUAL */
  planBanner: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    alignItems: "flex-start",
    backgroundColor: "rgba(15,23,42,0.9)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
  },
  planBannerFree: {
    backgroundColor: "rgba(30,64,175,0.85)", // azul
    borderColor: "rgba(191,219,254,0.8)",
  },
  planBannerStudent: {
    backgroundColor: "rgba(185,28,28,0.9)", // rojo
    borderColor: "rgba(254,202,202,0.9)",
  },
  planBannerPremium: {
    backgroundColor: "rgba(161,98,7,0.95)", // dorado oscuro
    borderColor: "#facc15",
  },
  planBannerTitle: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#e5e7eb",
    marginBottom: 2,
  },
  planBannerPlan: {
    fontSize: 15,
    fontWeight: "700",
    color: "#f9fafb",
  },
  planBannerStatus: {
    marginTop: 2,
    fontSize: 12,
    color: "#e5e7eb",
  },
  planStatusActive: {
    fontWeight: "700",
    color: "#bbf7d0", // verde claro
  },
  planStatusInactive: {
    fontWeight: "700",
    color: "#fee2e2", // rojo claro
  },

  /* HEADER */
  header: {
    marginBottom: 24,
  },
  logoText: {
    color: "#f9fafb",
    fontWeight: "700",
    letterSpacing: 3,
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#f9fafb",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#d1d5db",
  },

  /* CONTENEDORES DE TARJETAS */
  cardContainerTop: {
    alignItems: "center",
    marginBottom: 2,
  },
  cardContainer: {
    alignItems: "center",
    marginBottom: 2,
  },

  cardImage: {
    borderRadius: 24,
  },

  // 🔵 Solo tarjeta azul
  cardInnerFree: {
    flex: 1,
    paddingHorizontal: 60,
    paddingVertical: 15,
    justifyContent: "flex-start",
  },

  // 🔴 Solo tarjeta roja
  cardInnerStudent: {
    flex: 1,
    paddingHorizontal: 130,
    paddingVertical: 30,
    justifyContent: "space-between",
  },

  // ⚫ Tarjeta premium
  cardInnerPremium: {
    flex: 1,
    paddingHorizontal: 70,
    paddingVertical: 40,
    justifyContent: "space-between",
  },

  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  /* BADGES */
  badgeFree: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#ffffff",
    backgroundColor: "rgba(15,23,42,0.6)",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  badgeStudent: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#ffffff",
    backgroundColor: "rgba(248,113,113,0.9)",
    textTransform: "uppercase",
  },
  badgePremium: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#111827",
    backgroundColor: "#facc15",
    textTransform: "uppercase",
  },

  /* TEXTOS CLAROS (AZUL/ROJO) – BLANCO */
  cardTitleLight: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 2,
  },
  priceLight: {
    marginTop: 4,
    marginBottom: 8,
  },
  priceCurrencyLight: {
    fontSize: 12,
    color: "#e5e7eb",
  },
  priceNumberLight: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
  },
  priceNumberStudent: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
  },
  pricePeriodLight: {
    fontSize: 13,
    color: "#e5e7eb",
  },

  /* TEXTOS PREMIUM (NEGRO) */
  crown: {
    fontSize: 18,
  },
  cardTitlePremium: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f9fafb",
  },
  pricePremium: {
    marginTop: 4,
    marginBottom: 10,
  },
  priceCurrencyPremium: {
    fontSize: 12,
    color: "#e5e7eb",
  },
  priceNumberPremium: {
    fontSize: 22,
    fontWeight: "800",
    color: "#facc15",
  },
  pricePeriodPremium: {
    fontSize: 13,
    color: "#e5e7eb",
  },

  /* BULLETS */
  bulletList: {
    marginBottom: 12,
  },
  bulletText: {
    fontSize: 13,
    color: "#f9fafb",
  },
  bulletTextPremium: {
    fontSize: 13,
    color: "#e5e7eb",
  },

  /* BOTONES DENTRO DE LAS TARJETAS */
  buttonFree: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: "#111827",
    marginTop: 6,
  },
  buttonFreeText: {
    color: "#f9fafb",
    fontWeight: "700",
    fontSize: 14,
  },

  buttonStudent: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 9,
    backgroundColor: "#facc15",
    marginTop: 8,
  },
  buttonStudentText: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 14,
  },

  buttonPremium: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 9,
    backgroundColor: "rgba(15,23,42,0.9)",
    borderWidth: 1.5,
    borderColor: "#67e8f9",
    marginTop: 4,
  },
  buttonPremiumText: {
    color: "#e0f2fe",
    fontWeight: "700",
    fontSize: 14,
  },

  notePremium: {
    marginTop: 8,
    fontSize: 11,
    color: "#9ca3af",
  },

  /* MODAL ESTUDIANTE */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.85)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    borderRadius: 20,
    backgroundColor: "#020617",
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.5)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#f9fafb",
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#cbd5f5",
    marginBottom: 12,
  },
  modalInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4b5563",
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#e5e7eb",
    marginBottom: 14,
    fontSize: 14,
    backgroundColor: "rgba(15,23,42,0.9)",
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 4,
  },
  modalButton: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalButtonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#6b7280",
  },
  modalButtonSecondaryText: {
    color: "#e5e7eb",
    fontWeight: "600",
    fontSize: 13,
  },
  modalButtonPrimary: {
    backgroundColor: "#facc15",
  },
  modalButtonPrimaryText: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 13,
  },
  modalHint: {
    marginTop: 10,
    fontSize: 11,
    color: "#9ca3af",
  },
});
