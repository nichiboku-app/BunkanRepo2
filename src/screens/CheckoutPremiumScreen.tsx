// src/screens/CheckoutPremiumScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";

const CheckoutPremiumScreen: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [numero, setNumero] = useState("");
  const [expira, setExpira] = useState("");
  const [cvc, setCvc] = useState("");

  const handlePay = () => {
    // Aquí irá la lógica real de pago (Stripe / backend)
    if (!nombre || !numero || !expira || !cvc) {
      Alert.alert("Datos incompletos", "Por favor llena todos los campos.");
      return;
    }

    Alert.alert(
      "Pago simulado",
      "Aquí iría el flujo real de Stripe para cobrar $400 MXN."
    );
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Pagar app premium</Text>
      <Text style={styles.subtitle}>Plan Autodidacta · $400 MXN/mes (lanzamiento)</Text>

      {/* Imagen de la tarjeta Bunkan (ajusta la ruta al asset real) */}
      <View style={styles.cardImageWrapper}>
        <Image
          source={require("../assets/bunkan-card.png")} // ⚠️ cambia la ruta si tu imagen está en otro lado
          style={styles.cardImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nombre en la tarjeta</Text>
        <TextInput
          style={styles.input}
          placeholder="Como aparece en la tarjeta"
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={styles.label}>Número de tarjeta</Text>
        <TextInput
          style={styles.input}
          placeholder="•••• •••• •••• ••••"
          keyboardType="number-pad"
          value={numero}
          onChangeText={setNumero}
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Vence</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/AA"
              keyboardType="number-pad"
              value={expira}
              onChangeText={setExpira}
            />
          </View>

          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>CVC</Text>
            <TextInput
              style={styles.input}
              placeholder="•••"
              keyboardType="number-pad"
              secureTextEntry
              value={cvc}
              onChangeText={setCvc}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.payButton} onPress={handlePay}>
          <Text style={styles.payButtonText}>Pagar $400 MXN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CheckoutPremiumScreen;

const JAPAN_RED = "#e11d2f";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#4b5563",
    marginBottom: 16,
  },
  cardImageWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  cardImage: {
    width: "100%",
    height: 160,
  },
  form: {
    marginTop: 4,
  },
  label: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#f9fafb",
  },
  row: {
    flexDirection: "row",
  },
  payButton: {
    backgroundColor: JAPAN_RED,
    marginTop: 20,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  payButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
});
