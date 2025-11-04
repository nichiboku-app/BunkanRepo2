// src/components/ui/ChoicePill.tsx
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type PillColor = "pink" | "teal" | "amber" | "peach";

const palettes: Record<PillColor, { bg: string; dot: string; text: string; border: string }> = {
  pink:  { bg: "#FDE7EF", dot: "#F58CB0", text: "#7B2943", border: "#F6C9DA" },
  teal:  { bg: "#E6FAF4", dot: "#66D6C6", text: "#1C6B62", border: "#BFEFE8" },
  amber: { bg: "#FFF3D9", dot: "#F2C461", text: "#7C5B1E", border: "#F5E4BD" },
  peach: { bg: "#FFE9E3", dot: "#FFB29E", text: "#7C3A2F", border: "#F7D1C8" },
};

function palette(col?: string) {
  if (!col) return palettes.pink;
  return (palettes[col as PillColor] ?? palettes.pink);
}

export default function ChoicePill({
  label,
  color = "pink",
  disabled,
  onPress,
  rightIcon,
}: {
  label: string;
  color?: PillColor | string;
  disabled?: boolean;
  onPress?: () => void;
  rightIcon?: React.ReactNode;
}) {
  const c = palette(color);
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: c.bg, borderColor: c.border, opacity: disabled ? 0.85 : pressed ? 0.94 : 1 },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: c.dot }]} />
      <Text style={[styles.label, { color: c.text }]} numberOfLines={1}>
        {label}
      </Text>
      {rightIcon ? <View style={{ marginLeft: 8 }}>{rightIcon}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    width: "100%",
    minHeight: 52,
    borderRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  label: { flex: 1, fontSize: 16, fontWeight: "800", letterSpacing: 0.2 },
});
