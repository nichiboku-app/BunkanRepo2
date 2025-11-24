// app/pago-exitoso.tsx
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
// aquí luego metes tu lógica real de Firestore

export default function PagoExitosoScreen() {
  const [estado, setEstado] = useState<"waiting" | "ok" | "error">("waiting");

  useEffect(() => {
    // TODO: escuchar documento Usuarios/{uid} con onSnapshot
    // cuando planStatus === "active" -> setEstado("ok")
    // si hay error -> setEstado("error")
  }, []);

  if (estado === "waiting") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
        <Text>Verificando tu pago…</Text>
      </View>
    );
  }

  if (estado === "ok") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>✅ Pago confirmado. ¡Ya eres premium!</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>No pudimos verificar tu pago. Intenta nuevamente.</Text>
    </View>
  );
}
