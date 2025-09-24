// src/components/KanaStrokeFrame.tsx
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import Svg, { G, Line, Text as SvgText } from "react-native-svg";

/**
 * Stroke definiciones mínimas por letra (coordenadas en un lienzo 300x300).
 * Cada "stroke" es una línea Line simple para ilustrar el orden; puedes
 * reemplazar por paths complejos después si lo deseas.
 * 
 * Notas:
 * - La idea es mostrar ORDEN y POSICIÓN relativa (como hacía tu frame anterior),
 *   sin depender de PNGs. Mantiene numeritos y animación de entrada.
 * - He cubierto familia A con trazos aproximados (educativos, consistentes).
 *   Vamos añadiendo K, S, T... en seguida.
 */

type Stroke = { x1: number; y1: number; x2: number; y2: number; nPos: { x: number; y: number } };
type StrokeMap = Record<string, Stroke[]>;

const STROKES_A: StrokeMap = {
  // ア (3 trazos)
  "ア": [
    { x1: 60, y1: 50, x2: 240, y2: 50, nPos: { x: 250, y: 45 } },      // trazo 1 (arriba, horizontal corto)
    { x1: 150, y1: 50, x2: 110, y2: 250, nPos: { x: 100, y: 200 } },   // trazo 2 (diagonal a la izq.)
    { x1: 120, y1: 170, x2: 230, y2: 260, nPos: { x: 235, y: 255 } },  // trazo 3 (diagonal abajo-dcha)
  ],
  // イ (2 trazos)
  "イ": [
    { x1: 80, y1: 70, x2: 220, y2: 40, nPos: { x: 230, y: 35 } },
    { x1: 180, y1: 60, x2: 120, y2: 260, nPos: { x: 110, y: 210 } },
  ],
  // ウ (3 trazos)
  "ウ": [
    { x1: 70, y1: 70, x2: 230, y2: 70, nPos: { x: 240, y: 65 } },
    { x1: 150, y1: 70, x2: 120, y2: 200, nPos: { x: 110, y: 170 } },
    { x1: 120, y1: 200, x2: 240, y2: 230, nPos: { x: 245, y: 225 } },
  ],
  // エ (3 trazos)
  "エ": [
    { x1: 60, y1: 60, x2: 240, y2: 60, nPos: { x: 245, y: 55 } },
    { x1: 60, y1: 150, x2: 240, y2: 150, nPos: { x: 245, y: 145 } },
    { x1: 120, y1: 60, x2: 120, y2: 260, nPos: { x: 125, y: 250 } },
  ],
  // オ (3 trazos)
  "オ": [
    { x1: 60, y1: 70, x2: 240, y2: 70, nPos: { x: 245, y: 65 } },
    { x1: 170, y1: 60, x2: 120, y2: 260, nPos: { x: 110, y: 210 } },
    { x1: 90, y1: 180, x2: 240, y2: 180, nPos: { x: 245, y: 175 } },
  ],
};

const FAMILY_A = ["ア","イ","ウ","エ","オ"] as const;
const isFamilyA = (kana: string) => FAMILY_A.includes(kana as any);

const FadeIn = ({ delay, children }: { delay: number; children: React.ReactNode }) => {
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.timing(op, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);
  return <Animated.View style={{ opacity: op }}>{children}</Animated.View>;
};

export default function KanaStrokeFrame({
  kana,
  showNumbers = true,
  width = 300,
  height = 300,
}: {
  kana: string;
  showNumbers?: boolean;
  width?: number;
  height?: number;
}) {
  // fallback didáctico: si no tenemos el set de trazos, mostramos un trazo simple con (1)
  const strokes: Stroke[] =
    (isFamilyA(kana) ? STROKES_A[kana] : undefined) ??
    [{ x1: 80, y1: 80, x2: 220, y2: 220, nPos: { x: 230, y: 215 } }];

  return (
    <View style={styles.wrap}>
      <Svg width={width} height={height} viewBox="0 0 300 300">
        <G>
          {strokes.map((s, i) => (
            <FadeIn key={i} delay={i * 250}>
              <G>
                {/* línea del trazo */}
                <Line
                  x1={s.x1}
                  y1={s.y1}
                  x2={s.x2}
                  y2={s.y2}
                  stroke="#1f2937"
                  strokeWidth={10}
                  strokeLinecap="round"
                  opacity={0.92}
                />
                {/* numerito del trazo */}
                {showNumbers && (
                  <G>
                    <Line
                      x1={s.nPos.x}
                      y1={s.nPos.y}
                      x2={s.nPos.x}
                      y2={s.nPos.y}
                      stroke="#b32133"
                      strokeWidth={14}
                      strokeLinecap="round"
                    />
                    <SvgText
                      x={s.nPos.x}
                      y={s.nPos.y + 4}
                      textAnchor="middle"
                      fontSize={12}
                      fill="#fff"
                      fontWeight="bold"
                    >
                      {i + 1}
                    </SvgText>
                  </G>
                )}
              </G>
            </FadeIn>
          ))}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
});
