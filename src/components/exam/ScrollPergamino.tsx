import { Image as ExpoImage } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";

const SCROLL = require("../../../assets/images/diagnostic/scroll_panel.webp");

type Props = {
  width: number;
  height: number;
  children?: React.ReactNode;
  /** "fill" estira sin límites; puedes usar "cover"/"contain" si prefieres */
  contentFit?: "fill" | "cover" | "contain";
};

export default function ScrollPergamino({
  width,
  height,
  children,
  contentFit = "fill",
}: Props) {
  return (
    <View style={[styles.wrap, { width, height }]}>
      <ExpoImage
        source={SCROLL}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        transition={0}
      />
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "visible",        // <- importante: que no recorte el contenido
    alignItems: "center",
    justifyContent: "flex-start",
  },
  inner: {
    flex: 1,
    width: "86%",               // margen interior agradable
    alignSelf: "center",
    justifyContent: "flex-start",
  },
});
