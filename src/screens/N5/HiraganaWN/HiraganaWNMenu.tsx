import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import type { RootStackParamList } from "../../../../types";
import { useUserPlan } from "../../../context/UserPlanContext"; // ✅ NUEVO

type Nav = NativeStackNavigationProp<RootStackParamList>;
const { width: W, height: H } = Dimensions.get("window");

/* =========================================================
   BOTÓN GENÉRICO CON EFECTOS PREMIUM
   ========================================================= */

type Palette = {
  bg: string;
  border: string;
  text: string;
  subText?: string;
  accent?: string;
  shine: string;
  ripple: string;
};

type NichiBtnProps = {
  title: string;
  desc?: string;
  onPress: () => void;
  palette: Palette;
  centerText?: boolean;
  rightAdornment?: React.ReactNode;
  style?: any;
};

function hashStr(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 2 ** 32;
}

function useShineSweep(seed = 0) {
  const sweep = useRef(new Animated.Value(-160)).current;
  useEffect(() => {
    let alive = true;
    const loop = () => {
      if (!alive) return;
      Animated.sequence([
        Animated.timing(sweep, {
          toValue: 240,
          duration: 1900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sweep, { toValue: -160, duration: 0, useNativeDriver: true }),
        Animated.delay(700 + Math.round(seed * 800)),
      ]).start(() => loop());
    };
    loop();
    return () => {
      alive = false;
      sweep.stopAnimation();
    };
  }, [sweep, seed]);
  return sweep;
}

function NichiBtn({
  title,
  desc,
  onPress,
  palette,
  centerText,
  rightAdornment,
  style,
}: NichiBtnProps) {
  const press = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;

  const [box, setBox] = useState({ w: 0, h: 0 });
  const [ripples, setRipples] = useState<
    { key: number; x: number; y: number; a: Animated.Value; scale: number }[]
  >([]);
  const rippleKey = useRef(0);
  const seed = useMemo(() => hashStr(title), [title]);

  const scale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] });
  const rotateX = tiltX.interpolate({
    inputRange: [-1, 1],
    outputRange: ["6deg", "-6deg"],
  });
  const rotateY = tiltY.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-6deg", "6deg"],
  });
  const liftY = breathe.interpolate({ inputRange: [0, 1], outputRange: [0, -2.2] });
  const accentOpacity = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  useEffect(() => {
    const d = 2200 + Math.round(seed * 900);
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: d,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: d,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [breathe, seed]);

  const sweep = useShineSweep(seed);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBox({ w: width, h: height });
  };

  const spawnRipple = (x: number, y: number) => {
    const dx = Math.max(x, box.w - x);
    const dy = Math.max(y, box.h - y);
    const radius = Math.sqrt(dx * dx + dy * dy);
    const base = 140;
    const scale = (radius * 2) / base;
    const key = rippleKey.current++;
    const a = new Animated.Value(0);
    setRipples((rs) => [...rs, { key, x: x - base / 2, y: y - base / 2, a, scale }]);
    Animated.timing(a, {
      toValue: 1,
      duration: 560,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setRipples((rs) => rs.filter((r) => r.key !== key));
    });
  };

  const pressIn = (e: any) => {
    const { locationX, locationY } = e.nativeEvent;
    spawnRipple(locationX, locationY);
    Vibration.vibrate(8);
    Animated.parallel([
      Animated.spring(press, {
        toValue: 1,
        useNativeDriver: true,
        stiffness: 240,
        damping: 20,
        mass: 0.9,
      }),
      Animated.timing(tiltX, {
        toValue: (locationY / Math.max(box.h, 1)) * 2 - 1,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(tiltY, {
        toValue: (locationX / Math.max(box.w, 1)) * 2 - 1,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const pressOut = () => {
    Animated.parallel([
      Animated.spring(press, {
        toValue: 0,
        useNativeDriver: true,
        stiffness: 220,
        damping: 18,
        mass: 0.9,
      }),
      Animated.timing(tiltX, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(tiltY, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const blobRot = useMemo(() => `${(seed * 20 - 10).toFixed(2)}deg`, [seed]);
  const blobOp = useMemo(() => 0.12 + seed * 0.12, [seed]);

  return (
    <Animated.View
      style={[
        styles.btnBase,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          transform: [{ translateY: liftY }],
        },
        style,
      ]}
      onLayout={onLayout}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.decor, { opacity: blobOp, transform: [{ rotate: blobRot }] }]}
      />

      <Animated.View
        style={{
          transform: [
            { perspective: 800 },
            { rotateX },
            { rotateY },
            { scale },
          ],
          shadowColor: "#000",
          shadowOpacity: 0.22,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
        }}
      >
        <Pressable
          onPress={() => onPress()}
          onPressIn={pressIn}
          onPressOut={pressOut}
          android_ripple={{ color: palette.ripple }}
          style={styles.btnPressable}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.shine,
              {
                backgroundColor: palette.shine,
                transform: [{ translateX: sweep }, { rotateZ: "-12deg" }],
              },
            ]}
          />

          <Animated.View
            pointerEvents="none"
            style={[
              styles.accentBar,
              {
                backgroundColor: (palette.accent ?? palette.text) + "22",
                opacity: accentOpacity,
              },
            ]}
          />

          <View style={[styles.btnContent, centerText && { alignItems: "center" }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.btnTitle, { color: palette.text }]} numberOfLines={1}>
                {title}
              </Text>
              {!!desc && (
                <Text
                  style={[
                    styles.btnDesc,
                    { color: palette.subText ?? palette.text },
                  ]}
                  numberOfLines={2}
                >
                  {desc}
                </Text>
              )}
            </View>
            {!!rightAdornment && <View style={{ marginLeft: 10 }}>{rightAdornment}</View>}
          </View>

          {ripples.map((r) => (
            <Animated.View
              key={r.key}
              pointerEvents="none"
              style={[
                styles.ripple,
                {
                  left: r.x,
                  top: r.y,
                  transform: [
                    {
                      scale: r.a.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.01, r.scale],
                      }),
                    },
                  ],
                  opacity: r.a.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.35, 0],
                  }),
                },
              ]}
            />
          ))}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

/* ============================ Paletas ============================ */
const CRIMSON = "#B32133";

const PALETTES = {
  light: {
    bg: "rgba(250,253,255,0.98)",
    border: "rgba(255,255,255,0.22)",
    text: "#0B1020",
    subText: "#334155",
    accent: "#0B1020",
    shine: "rgba(0,0,0,0.06)",
    ripple: "rgba(0,0,0,0.08)",
  } satisfies Palette,
  premium: {
    bg: "rgba(255,247,248,0.96)",
    border: "#ead5d9",
    text: "#111827",
    subText: "#6B7280",
    accent: CRIMSON,
    shine: "rgba(0,0,0,0.04)",
    ripple: "rgba(179,33,51,0.08)",
  } satisfies Palette,
  dark: {
    bg: "#111433",
    border: "rgba(255,255,255,0.18)",
    text: "#FFFFFF",
    subText: "#E6EDF7",
    accent: "#93C5FD",
    shine: "rgba(255,255,255,0.26)",
    ripple: "rgba(255,255,255,0.14)",
  } satisfies Palette,
  red: {
    bg: CRIMSON,
    border: "rgba(0,0,0,0.12)",
    text: "#FFFFFF",
    subText: "#FFE5EA",
    accent: "#FFFFFF",
    shine: "rgba(255,255,255,0.30)",
    ripple: "rgba(255,255,255,0.16)",
  } satisfies Palette,
  gold: {
    bg: "#E6B422",
    border: "#6B4E00",
    text: "#1E1B12",
    subText: "#3A2F12",
    accent: "#1E1B12",
    shine: "rgba(255,255,255,0.45)",
    ripple: "rgba(0,0,0,0.10)",
  } satisfies Palette,
};

function PremiumTag() {
  return (
    <View style={styles.lockTag}>
      <Ionicons name="lock-closed" size={14} color={CRIMSON} />
      <Text style={styles.lockTxt}>Premium</Text>
    </View>
  );
}

/* =========================================================
   FONDO ANIMADO
   ========================================================= */
function DayNightFujiBackground({ cycleMs = 24000 }: { cycleMs?: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(t, {
          toValue: 1,
          duration: cycleMs / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(t, {
          toValue: 0,
          duration: cycleMs / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => loop());
    };
    loop();
    return () => t.stopAnimation();
  }, [t, cycleMs]);

  const dayOp = t;
  const nightOp = Animated.subtract(1, t);
  const SEA_Y = H * 0.72;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* NOCHE */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: nightOp }]}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "#0C1A2A" }]} />
        <GlowDisc
          x={W * 0.3}
          y={H * 0.22}
          r={W * 0.75}
          color="#E11D48"
          op={0.18}
        />
        <GlowDisc
          x={W * 0.7}
          y={H * 0.16}
          r={W * 0.55}
          color="#F59E0B"
          op={0.1}
        />
        <PaperGrain />
        <StarField count={70} />
        <MoonArc p={Animated.subtract(1, t)} />
        <Fuji y={H * 0.38} palette="night" />
        <Torii x={W * 0.72} y={H * 0.46} />
        <FireworksOverlay />
        <Seigaiha
          y={SEA_Y}
          rowH={42}
          color="#0A334F"
          stroke="#E6EEF7"
          speed={18000}
          amp={6}
        />
        <Seigaiha
          y={SEA_Y + 0.07 * H}
          rowH={46}
          color="#082C44"
          stroke="#E6EEF7"
          speed={14000}
          amp={8}
        />
        <Seigaiha
          y={SEA_Y + 0.14 * H}
          rowH={50}
          color="#062437"
          stroke="#E6EEF7"
          speed={11000}
          amp={10}
        />
      </Animated.View>

      {/* DÍA */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: dayOp }]}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "#BFE3FF" }]} />
        <GlowDisc
          x={W * 0.65}
          y={H * 0.2}
          r={W * 0.7}
          color="#FCD34D"
          op={0.25}
        />
        <GlowDisc
          x={W * 0.25}
          y={H * 0.1}
          r={W * 0.55}
          color="#93C5FD"
          op={0.18}
        />
        <PaperGrain light />
        <SunArc p={t} />
        <Fuji y={H * 0.38} palette="day" />
        <Torii x={W * 0.72} y={H * 0.46} />
        <Cloud
          xStart={W * 1.1}
          y={H * 0.14}
          size={44}
          speed={15000}
          delay={0}
          opacity={0.95}
        />
        <Cloud
          xStart={W}
          y={H * 0.2}
          size={40}
          speed={17000}
          delay={900}
          opacity={0.9}
        />
        <Cloud
          xStart={W * 0.9}
          y={H * 0.26}
          size={36}
          speed={16000}
          delay={1600}
          opacity={0.85}
        />
        <TsuruFlight />
        <Seigaiha
          y={SEA_Y}
          rowH={42}
          color="#4AA3D3"
          stroke="#E8F5FE"
          speed={18000}
          amp={6}
        />
        <Seigaiha
          y={SEA_Y + 0.07 * H}
          rowH={46}
          color="#338CBD"
          stroke="#E8F5FE"
          speed={14000}
          amp={8}
        />
        <Seigaiha
          y={SEA_Y + 0.14 * H}
          rowH={50}
          color="#237AA9"
          stroke="#E8F5FE"
          speed={11000}
          amp={10}
        />
      </Animated.View>
    </View>
  );
}

/* ----- Elementos del fondo ----- */
function GlowDisc({
  x,
  y,
  r,
  color,
  op = 0.18,
}: {
  x: number;
  y: number;
  r: number;
  color: string;
  op?: number;
}) {
  return (
    <View
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: r * 2,
        backgroundColor: color,
        opacity: op,
      }}
    />
  );
}

function PaperGrain({ light = false }: { light?: boolean }) {
  const dots = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => ({
        key: i,
        x: Math.random() * W,
        y: Math.random() * H * 0.55,
        s: 1 + Math.random() * 2,
        op: (light ? 0.06 : 0.05) + Math.random() * 0.05,
      })),
    [light]
  );
  return (
    <View style={StyleSheet.absoluteFill}>
      {dots.map((d) => (
        <View
          key={d.key}
          style={{
            position: "absolute",
            left: d.x,
            top: d.y,
            width: d.s,
            height: d.s,
            borderRadius: 12,
            backgroundColor: light ? "#0B1520" : "#ffffff",
            opacity: d.op,
          }}
        />
      ))}
    </View>
  );
}

function Fuji({ y, palette = "day" }: { y: number; palette?: "day" | "night" }) {
  const base = palette === "day" ? "#2C4E7A" : "#1D3557";
  return (
    <View style={{ position: "absolute", top: y, left: W * 0.12 }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: W * 0.3,
          borderRightWidth: W * 0.3,
          borderBottomWidth: W * 0.2,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: base,
          opacity: 0.97,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 6,
          left: W * 0.3 - W * 0.11,
          width: 0,
          height: 0,
          borderLeftWidth: W * 0.11,
          borderRightWidth: W * 0.11,
          borderBottomWidth: W * 0.07,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: "#F1F5F9",
        }}
      />
    </View>
  );
}

function Torii({ x, y }: { x: number; y: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(t, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t]);
  const ty = t.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-2, 2, -2],
  });
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: [{ translateY: ty }],
      }}
    >
      <View
        style={{
          width: 86,
          height: 8,
          backgroundColor: "#C81E1E",
          borderRadius: 2,
        }}
      />
      <View
        style={{
          width: 72,
          height: 6,
          backgroundColor: "#991B1B",
          marginTop: 2,
          alignSelf: "center",
          borderRadius: 2,
        }}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: 68,
          marginTop: 4,
          alignSelf: "center",
        }}
      >
        <View
          style={{
            width: 8,
            height: 36,
            backgroundColor: "#7F1D1D",
            borderRadius: 2,
          }}
        />
        <View
          style={{
            width: 8,
            height: 36,
            backgroundColor: "#7F1D1D",
            borderRadius: 2,
          }}
        />
      </View>
    </Animated.View>
  );
}

function Cloud({
  xStart,
  y,
  size = 44,
  speed = 16000,
  delay = 0,
  opacity = 0.9,
}: {
  xStart: number;
  y: number;
  size?: number;
  speed?: number;
  delay?: number;
  opacity?: number;
}) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let alive = true;
    const fly = () => {
      if (!alive) return;
      t.setValue(0);
      Animated.timing(t, {
        toValue: 1,
        duration: speed,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(fly, 300);
      });
    };
    const s = setTimeout(fly, delay);
    return () => {
      alive = false;
      clearTimeout(s);
      t.stopAnimation();
    };
  }, [delay, speed, t]);
  const tx = t.interpolate({
    inputRange: [0, 1],
    outputRange: [xStart, -120],
  });
  return (
    <Animated.View
      style={{
        position: "absolute",
        top: y,
        transform: [{ translateX: tx }],
        opacity,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pill w={size * 1.2} h={size * 0.55} />
        <Pill w={size * 0.8} h={size * 0.45} />
        <Pill w={size} h={size * 0.55} />
      </View>
    </Animated.View>
  );
}
function Pill({ w, h }: { w: number; h: number }) {
  return (
    <View
      style={{
        width: w,
        height: h,
        borderRadius: h,
        backgroundColor: "#E6EEF7",
        marginRight: 6,
        opacity: 0.95,
      }}
    />
  );
}

function StarField({ count = 50 }: { count?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * W,
        y: Math.random() * H * 0.45,
        s: 1 + Math.random() * 2.2,
      })),
    [count]
  );
  return (
    <View style={StyleSheet.absoluteFill}>
      {stars.map((s) => (
        <Twinkle key={s.id} x={s.x} y={s.y} size={s.s} />
      ))}
    </View>
  );
}

function Twinkle({ x, y, size }: { x: number; y: number; size: number }) {
  const t = useRef(new Animated.Value(Math.random())).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, {
          toValue: 1,
          duration: 1200 + Math.random() * 900,
          useNativeDriver: true,
        }),
        Animated.timing(t, {
          toValue: 0.2,
          duration: 1000 + Math.random() * 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t]);
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size,
        backgroundColor: "#F8FAFC",
        opacity: t,
      }}
    />
  );
}

function SunArc({ p }: { p: any }) {
  const tx = p.interpolate({
    inputRange: [0, 1],
    outputRange: [W * 0.1, W * 0.8],
  });
  const ty = p.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [H * 0.26, H * 0.14, H * 0.26],
  });
  return (
    <Animated.View
      style={{
        position: "absolute",
        transform: [{ translateX: tx }, { translateY: ty }],
      }}
    >
      <View
        style={{
          width: 84,
          height: 84,
          borderRadius: 84,
          backgroundColor: "#FCD34D",
          shadowColor: "#F59E0B",
          shadowOpacity: 0.6,
          shadowRadius: 16,
        }}
      />
    </Animated.View>
  );
}
function MoonArc({ p }: { p: any }) {
  const tx = p.interpolate({
    inputRange: [0, 1],
    outputRange: [W * 0.85, W * 0.15],
  });
  const ty = p.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [H * 0.22, H * 0.12, H * 0.22],
  });
  return (
    <Animated.View
      style={{
        position: "absolute",
        transform: [{ translateX: tx }, { translateY: ty }],
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 64,
          backgroundColor: "#E5E7EB",
        }}
      />
      <View
        style={{
          position: "absolute",
          left: 18,
          top: 0,
          width: 64,
          height: 64,
          borderRadius: 64,
          backgroundColor: "#0C1A2A",
        }}
      />
    </Animated.View>
  );
}

function Seigaiha({
  y,
  rowH,
  color,
  stroke,
  speed = 16000,
  amp = 8,
}: {
  y: number;
  rowH: number;
  color: string;
  stroke: string;
  speed?: number;
  amp?: number;
}) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = () => {
      t.setValue(0);
      Animated.timing(t, {
        toValue: 1,
        duration: speed,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(loop);
    };
    loop();
    return () => t.stopAnimation();
  }, [speed, t]);
  const offset = t.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -W],
  });
  const bob = t.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-amp, amp, -amp],
  });
  const rows = 3;
  const r = rowH;
  const step = r;
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        transform: [{ translateY: bob }],
      }}
    >
      <View style={{ backgroundColor: color, height: rowH * rows + 22 }} />
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: W * 2,
          height: rowH * rows + 22,
          transform: [{ translateX: offset }],
        }}
      >
        {[0, 1].map((k) => (
          <View
            key={k}
            style={{
              position: "absolute",
              left: k * W,
              width: W,
              height: rowH * rows + 22,
            }}
          >
            {Array.from({ length: rows }).map((_, ry) => {
              const top = ry * rowH + 6;
              const yOffset = ry % 2 === 0 ? 0 : step / 2;
              return (
                <View
                  key={ry}
                  style={{
                    position: "absolute",
                    top,
                    left: -step,
                    right: 0,
                    height: rowH,
                    overflow: "hidden",
                  }}
                >
                  {Array.from({
                    length: Math.ceil(W / step) + 3,
                  }).map((__, cx) => {
                    const left = cx * step + yOffset;
                    return (
                      <View
                        key={cx}
                        style={{
                          position: "absolute",
                          left,
                          width: r * 2,
                          height: r * 2,
                          borderRadius: r * 2,
                          borderWidth: 2,
                          borderColor: stroke,
                          backgroundColor: "transparent",
                          top: -r,
                        }}
                      />
                    );
                  })}
                </View>
              );
            })}
          </View>
        ))}
      </Animated.View>
    </Animated.View>
  );
}

/* ======================= Fuegos artificiales (夜) ======================= */
function FireworksOverlay() {
  const bursts = useMemo(
    () =>
      Array.from({ length: 5 }).map((_, i) => ({
        id: i,
        x: W * (0.15 + Math.random() * 0.7),
        y: H * (0.12 + Math.random() * 0.2),
        colors:
          i % 2
            ? ["#F472B6", "#FCD34D", "#60A5FA"]
            : ["#F87171", "#34D399", "#A78BFA"],
        delay: 600 * i,
      })),
    []
  );
  return (
    <View style={StyleSheet.absoluteFill}>
      {bursts.map((b) => (
        <FireworkBurst
          key={b.id}
          x={b.x}
          y={b.y}
          colors={b.colors}
          delay={b.delay}
        />
      ))}
    </View>
  );
}

function FireworkBurst({
  x,
  y,
  colors,
  delay = 0,
  duration = 1200,
  radius = 90,
}: {
  x: number;
  y: number;
  colors: string[];
  delay?: number;
  duration?: number;
  radius?: number;
}) {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let alive = true;
    const loop = () => {
      if (!alive) return;
      p.setValue(0);
      Animated.timing(p, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setTimeout(loop, 600 + Math.random() * 800);
      });
    };
    const s = setTimeout(loop, delay);
    return () => {
      alive = false;
      clearTimeout(s);
      p.stopAnimation();
    };
  }, [p, delay, duration]);

  const dirs = useMemo(
    () => [
      [1, 0],
      [0.866, 0.5],
      [0.5, 0.866],
      [0, 1],
      [-0.5, 0.866],
      [-0.866, 0.5],
      [-1, 0],
      [-0.866, -0.5],
      [-0.5, -0.866],
      [0, -1],
      [0.5, -0.866],
      [0.866, -0.5],
    ],
    []
  );

  const coreScale = p.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0.2, 1, 0.5],
  });
  const coreOp = p.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0, 1, 0],
  });

  return (
    <View style={{ position: "absolute", left: x, top: y }}>
      <Animated.View
        style={{
          position: "absolute",
          left: -6,
          top: -6,
          width: 12,
          height: 12,
          borderRadius: 12,
          backgroundColor: colors[0],
          transform: [{ scale: coreScale }],
          opacity: coreOp,
        }}
      />
      {dirs.map(([dx, dy], i) => {
        const px = p.interpolate({
          inputRange: [0, 1],
          outputRange: [0, dx * radius],
        });
        const py = p.interpolate({
          inputRange: [0, 1],
          outputRange: [0, dy * radius],
        });
        const fade = p.interpolate({
          inputRange: [0, 0.7, 1],
          outputRange: [0.9, 0.9, 0],
        });
        const col = colors[i % colors.length];
        return (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 6,
              height: 6,
              borderRadius: 6,
              backgroundColor: col,
              transform: [{ translateX: px }, { translateY: py }],
              opacity: fade,
            }}
          />
        );
      })}
    </View>
  );
}

/* ======================= Grullas volando (昼) ======================= */
function TsuruFlight() {
  const flock = useMemo(
    () => [
      {
        id: 1,
        dir: "ltr" as const,
        delay: 200,
        size: 28,
        yBase: H * 0.22,
        arc: H * 0.08,
        speed: 9000,
      },
      {
        id: 2,
        dir: "rtl" as const,
        delay: 1400,
        size: 32,
        yBase: H * 0.18,
        arc: H * 0.06,
        speed: 10000,
      },
      {
        id: 3,
        dir: "ltr" as const,
        delay: 2400,
        size: 26,
        yBase: H * 0.26,
        arc: H * 0.07,
        speed: 9500,
      },
      {
        id: 4,
        dir: "rtl" as const,
        delay: 3200,
        size: 30,
        yBase: H * 0.2,
        arc: H * 0.09,
        speed: 11000,
      },
      {
        id: 5,
        dir: "ltr" as const,
        delay: 4200,
        size: 24,
        yBase: H * 0.24,
        arc: H * 0.07,
        speed: 10500,
      },
    ],
    []
  );
  return (
    <View style={StyleSheet.absoluteFill}>
      {flock.map((c) => (
        <Tsuru
          key={c.id}
          dir={c.dir}
          delay={c.delay}
          size={c.size}
          yBase={c.yBase}
          arc={c.arc}
          speed={c.speed}
        />
      ))}
    </View>
  );
}

function Tsuru({
  dir = "ltr",
  delay = 0,
  size = 28,
  yBase = H * 0.2,
  arc = H * 0.07,
  speed = 10000,
}: {
  dir?: "ltr" | "rtl";
  delay?: number;
  size?: number;
  yBase?: number;
  arc?: number;
  speed?: number;
}) {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let alive = true;
    const loop = () => {
      if (!alive) return;
      p.setValue(0);
      Animated.timing(p, {
        toValue: 1,
        duration: speed,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(loop, 600 + Math.random() * 1600);
      });
    };
    const s = setTimeout(loop, delay);
    return () => {
      alive = false;
      clearTimeout(s);
      p.stopAnimation();
    };
  }, [p, delay, speed]);
  const from = dir === "ltr" ? -80 : W + 80;
  const to = dir === "ltr" ? W + 80 : -80;
  const tx = p.interpolate({
    inputRange: [0, 1],
    outputRange: [from, to],
  });
  const ty = p.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [yBase + arc, yBase - arc, yBase + arc],
  });
  const tilt = p.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange:
      dir === "ltr"
        ? ["-6deg", "-14deg", "8deg"]
        : ["6deg", "14deg", "-8deg"],
  });
  return (
    <Animated.View
      style={{
        position: "absolute",
        transform: [
          { translateX: tx },
          { translateY: ty },
          { rotate: tilt },
          { scaleX: dir === "rtl" ? -1 : 1 },
        ],
      }}
    >
      <Text style={{ fontSize: size }}>🕊️</Text>
    </Animated.View>
  );
}

/* =========================================================
   PANTALLA: Hiragana — Grupo W–N (REORDENADA)
   ========================================================= */
export default function HiraganaWNMenu() {
  const navigation = useNavigation<Nav>();
  const { plan, planStatus } = useUserPlan(); // ✅ leemos plan del contexto
  const isPremiumActive = plan === "premium" && planStatus === "active";

  const handlePremiumLockedPress = () => {
    if (isPremiumActive) {
      // Si por alguna razón cae aquí siendo premium, lo mandamos al bloque 4
      navigation.navigate("B4GramaticaIMenu");
      return;
    }

    Alert.alert(
      "Contenido Premium",
      "Los bloques 4 al 8 se desbloquearán cuando actives NICHI·BOKU Premium.\nMuy pronto podrás hacerlo desde esta app. 💛"
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0C1A2A" }}>
      <DayNightFujiBackground />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>Hiragana — Grupo W–N</Text>
          <Text style={styles.title}>わ・を・ん / contracciones</Text>
          <Text style={styles.subtitle}>
            Noche con fuegos artificiales, día con grullas sobre olas ukiyo-e. El
            ciclo inicia en la noche.
          </Text>
        </View>

        {/* 1) Contenido base (libre) */}
        <NichiBtn
          title="📖 Lectura de frases cortas"
          desc="Lee y entiende con soporte visual."
          palette={PALETTES.light}
          onPress={() => navigation.navigate("WN_LecturaFrases")}
        />
        <NichiBtn
          title="🎯 Examen final — lecturas"
          desc="Cierre con ん y comprobación general."
          palette={PALETTES.light}
          onPress={() => navigation.navigate("WN_PracticaNFinal")}
        />

        {/* 2) NAV: subir estos dos antes del CTA Premium */}
        <View style={styles.navBlock}>
          <NichiBtn
            title="← Volver a Y–R (やゆよ・らりるれろ)"
            palette={PALETTES.dark}
            centerText
            onPress={() => navigation.navigate("HiraganaYRMenu")}
          />
          <NichiBtn
            title="Ir a UNIDAD 2 — Katakana"
            palette={PALETTES.red}
            centerText
            onPress={() => navigation.navigate("KatakanaMenu")}
          />
        </View>

        {/* Separador visual */}
        <View style={styles.sep} />

        {/* Bloque 3: Vocabulario esencial — NO bloqueado */}
        <NichiBtn
          title="Bloque 3: Vocabulario esencial (10 temas)"
          desc="Vocabulario base de uso diario con audio y mini juegos."
          palette={PALETTES.light}
          onPress={() => navigation.navigate("B3VocabularioMenu")}
        />

        {/* CTA Premium dorado: cambia según si ya es premium */}
        <NichiBtn
          title={isPremiumActive ? "Premium activado" : "Incluido en Premium"}
          desc={
            isPremiumActive
              ? "Ya tienes acceso a los bloques 4 al 8. Empieza por Gramática I."
              : "Desbloquea los bloques 4 a 8 para seguir aprendiendo con más temas."
          }
          palette={PALETTES.gold}
          centerText
          style={styles.ctaBorder}
          rightAdornment={!isPremiumActive ? <PremiumTag /> : undefined}
          onPress={() => {
            if (isPremiumActive) {
              navigation.navigate("B4GramaticaIMenu");
            } else {
              handlePremiumLockedPress();
            }
          }}
        />

        {/* 4) Bloques Premium (4–8): bloqueados o no según plan */}
        <NichiBtn
          title="Bloque 4: Gramática I"
          palette={isPremiumActive ? PALETTES.light : PALETTES.premium}
          rightAdornment={!isPremiumActive ? <PremiumTag /> : undefined}
          onPress={() => {
            if (isPremiumActive) {
              navigation.navigate("B4GramaticaIMenu");
            } else {
              handlePremiumLockedPress();
            }
          }}
        />
        <NichiBtn
          title="Bloque 5: Gramática II"
          palette={isPremiumActive ? PALETTES.light : PALETTES.premium}
          rightAdornment={!isPremiumActive ? <PremiumTag /> : undefined}
          onPress={() => {
            if (isPremiumActive) {
              navigation.navigate("B5GramaticaIIMenu");
            } else {
              handlePremiumLockedPress();
            }
          }}
        />
        <NichiBtn
          title="Bloque 6: Vida cotidiana"
          palette={isPremiumActive ? PALETTES.light : PALETTES.premium}
          rightAdornment={!isPremiumActive ? <PremiumTag /> : undefined}
          onPress={() => {
            if (isPremiumActive) {
              navigation.navigate("B6VidaCotidianaMenu");
            } else {
              handlePremiumLockedPress();
            }
          }}
        />
        <NichiBtn
          title="Bloque 7: Lectura y práctica"
          palette={isPremiumActive ? PALETTES.light : PALETTES.premium}
          rightAdornment={!isPremiumActive ? <PremiumTag /> : undefined}
          onPress={() => {
            if (isPremiumActive) {
              navigation.navigate("B7LecturaPracticaMenu");
            } else {
              handlePremiumLockedPress();
            }
          }}
        />
        <NichiBtn
          title="Bloque 8: Evaluaciones y logros"
          palette={isPremiumActive ? PALETTES.light : PALETTES.premium}
          rightAdornment={!isPremiumActive ? <PremiumTag /> : undefined}
          onPress={() => {
            if (isPremiumActive) {
              navigation.navigate("B8EvaluacionesLogrosMenu");
            } else {
              handlePremiumLockedPress();
            }
          }}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* ========================================================= ESTILOS ========================================================= */
const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 98, gap: 12 },
  header: {
    backgroundColor: "rgba(12,26,42,0.78)",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.18)",
    padding: 12,
  },
  kicker: { color: "#93C5FD", fontWeight: "900", letterSpacing: 1 },
  title: { color: "#E6EDF7", fontWeight: "900", fontSize: 18, marginTop: 2 },
  subtitle: {
    color: "rgba(230,237,247,0.92)",
    marginTop: 2,
    fontWeight: "700",
  },

  /* Botón base reutilizable */
  btnBase: {
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: "hidden",
    marginBottom: 12,
  },
  btnPressable: { paddingVertical: 14, paddingHorizontal: 14 },
  btnContent: { flexDirection: "row", alignItems: "center" },
  btnTitle: { fontSize: 16, fontWeight: "900", letterSpacing: 0.3 },
  btnDesc: { fontSize: 13, fontWeight: "700", marginTop: 4 },

  /* Ink-swipe overlay */
  shine: {
    position: "absolute",
    width: 170,
    height: "220%",
    top: -40,
    left: -170,
  },

  /* barra acento */
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },

  sectionTitle: {
    marginTop: 16,
    marginBottom: 2,
    fontSize: 16,
    fontWeight: "900",
    color: "#DCE1F0",
  },

  /* Premium tag */
  lockTag: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5b8bf",
    backgroundColor: "#fde8ec",
  },
  lockTxt: { fontSize: 12, fontWeight: "900", color: CRIMSON },

  /* CTA borde marcado para gold */
  ctaBorder: { borderWidth: 2, borderColor: "#6B4E00", borderRadius: 18 },

  /* decor */
  decor: {
    position: "absolute",
    right: -26,
    bottom: -26,
    width: 150,
    height: 150,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
  },

  /* NAV block y separador */
  navBlock: { marginTop: 4, gap: 8 },
  sep: { height: 8 },

  /* ripple circle */
  ripple: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: "#ffffff",
  },
});
