import { Image as ExpoImage } from "expo-image";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

const PETAL = require("../../../assets/images/diagnostic/petal.webp"); // puedes duplicar una florcita pequeña

type Props = { width: number; height: number; count?: number };

export default function SakuraLayer({ width, height, count = 8 }: Props) {
  // Cada pétalo es un Animated.Value independiente
  const anims = useRef(
    Array.from({ length: count }).map(() => ({
      y: new Animated.Value(-40),
      x: Math.random() * (width - 40),
      rot: new Animated.Value(0),
      delay: Math.random() * 3000,
      dur: 6500 + Math.random() * 2500,
    }))
  ).current;

  useEffect(() => {
    const loops = anims.map(a =>
      Animated.loop(
        Animated.parallel([
          Animated.timing(a.y, { toValue: height + 40, duration: a.dur, useNativeDriver: true, easing: Easing.inOut(Easing.quad), delay: a.delay }),
          Animated.timing(a.rot, { toValue: 1, duration: a.dur, useNativeDriver: true, easing: Easing.inOut(Easing.quad), delay: a.delay }),
        ])
      )
    );
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, [anims, height]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {anims.map((a, i) => {
        const rotate = a.rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${Math.random() > 0.5 ? "" : "-"}360deg`] });
        return (
          <Animated.View
            key={i}
            style={{ position: "absolute", transform: [{ translateX: a.x }, { translateY: a.y }, { rotate }] }}
          >
            <ExpoImage source={PETAL} style={{ width: 20, height: 20, opacity: 0.9 }} />
          </Animated.View>
        );
      })}
    </View>
  );
}
