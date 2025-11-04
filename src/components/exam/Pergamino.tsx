import { Image as ExpoImage } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";

// Este componente PONE una tarjeta crema detrás (por si el PNG del pergamino
// tuviera artefactos) y luego sobrepone la imagen del pergamino con transparencia.
const SCROLL_PANEL = require("../../../assets/images/diagnostic/scroll_panel.webp");

export default function Pergamino({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View style={styles.wrap}>
      {/* “Tapete” crema por detrás, ayuda a ocultar cualquier cuadriculado residual */}
      <View style={styles.underlay} />

      {/* Imagen de pergamino (transparente) */}
      <ExpoImage
        source={SCROLL_PANEL}
        style={styles.scrollImg}
        contentFit="contain"
      />

      {/* Contenido centrado */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    // ancho máximo para que los pills nunca “se salgan”
    maxWidth: 520,
    alignSelf: "center",
  },
  underlay: {
    position: "absolute",
    width: "92%",
    aspectRatio: 3 / 4,
    backgroundColor: "#FFF5E6",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e6d9b8",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  scrollImg: {
    position: "absolute",
    width: "100%",
    // relación pensada para el PNG que mandaste; si tu pergamino es más alto,
    // sube a 1.45–1.5
    aspectRatio: 1.35,
  },
  content: {
    // “zona segura” dentro del pergamino:
    width: "78%",
    paddingTop: 24,
    paddingBottom: 18,
  },
});
