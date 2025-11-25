// src/components/RequirePlan.tsx
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useUserPlan } from "../context/UserPlanContext";

type RequirePlanProps = {
  children: React.ReactNode;
  // "premium" = solo premium activo
  // "student" = solo student activo
  // "anyPaid" = cualquier plan de pago activo
  required: "premium" | "student" | "anyPaid";
};

export function RequirePlan({ children, required }: RequirePlanProps) {
  const navigation = useNavigation<any>();
  const { loading, plan, planStatus, isPremiumActive, isStudentActive, hasAnyPaidPlan } =
    useUserPlan();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.text}>Cargando tu plan...</Text>
      </View>
    );
  }

  // Si no está activo, bloqueamos según el tipo requerido
  let hasAccess = false;

  if (required === "premium") {
    hasAccess = isPremiumActive;
  } else if (required === "student") {
    hasAccess = isStudentActive;
  } else if (required === "anyPaid") {
    hasAccess = hasAnyPaidPlan;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  // 🔒 Pantalla bloqueada
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Contenido bloqueado 🔒</Text>
      <Text style={styles.text}>
        Este módulo está disponible solo para usuarios con plan {required === "premium"
          ? "Premium"
          : required === "student"
          ? "Estudiante"
          : "activo"}.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Pagos" as never)}
      >
        <Text style={styles.buttonText}>Ver planes y activar acceso</Text>
      </TouchableOpacity>

      <Text style={styles.small}>
        Tu plan actual: {plan} ({planStatus})
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#f9fafb",
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: "#e5e7eb",
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    backgroundColor: "#facc15",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonText: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 14,
  },
  small: {
    marginTop: 12,
    fontSize: 12,
    color: "#9ca3af",
  },
});
