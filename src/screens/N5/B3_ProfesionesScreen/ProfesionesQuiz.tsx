import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ProfesionesQuiz() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz</Text>
      <Text style={styles.note}>Selecciona la opción correcta para cada pregunta.</Text>
      {/* TODO: preguntas con 4 opciones, temporizador opcional y puntaje */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5dc", padding: 16 },
  title: { fontSize: 22, fontWeight: "bold" },
  note: { marginTop: 6, opacity: 0.7 },
});
