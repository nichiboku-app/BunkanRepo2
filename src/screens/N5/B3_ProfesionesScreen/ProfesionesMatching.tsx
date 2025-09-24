import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { View as RNView } from "react-native";
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

/* ======================= DATA (solo hira/kata, sin kanji) ======================= */
type Item = { id: string; es: string; jp: string; emoji: string };

const DATA: Item[] = [
  { id: "sensei", es: "Maestro/a", jp: "せんせい", emoji: "🎓" },
  { id: "isha", es: "Doctor/a", jp: "いしゃ", emoji: "🩺" },
  { id: "kangoshi", es: "Enfermero/a", jp: "かんごし", emoji: "🏥" },
  { id: "keisatsukan", es: "Policía", jp: "けいさつかん", emoji: "🚓" },
  { id: "shouboushi", es: "Bombero", jp: "しょうぼうし", emoji: "🚒" },
  { id: "shefu", es: "Chef", jp: "シェフ", emoji: "👩‍🍳" },
  { id: "puroguramaa", es: "Programador/a", jp: "プログラマー", emoji: "💻" },
  { id: "enjiniyaa", es: "Ingeniero/a", jp: "エンジニア", emoji: "🛠️" },
  { id: "bengoshi", es: "Abogado/a", jp: "べんごし", emoji: "⚖️" },
  { id: "kenchikuka", es: "Arquitecto/a", jp: "けんちくか", emoji: "🏗️" },
  { id: "ongakuka", es: "Músico/a", jp: "おんがくか", emoji: "🎼" },
  { id: "kaishain", es: "Empleado/a", jp: "かいしゃいん", emoji: "🏢" },
];

/* ====================== utils ====================== */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* =================== layout/medición =================== */
type Rect = { x: number; y: number; w: number; h: number };

const { height: WIN_H } = Dimensions.get("window");
const CARD_W = 160;
const CARD_H = 64;
const GUTTER_LEFT = CARD_W + 28; // espacio fijo para las fichas (izquierda)
const HIT_TOL = 30;              // tolerancia px extra para el drop

// Auto-scroll al acercarse al borde
const EDGE = 80;     // zona sensible en px
const MAX_STEP = 18; // px por frame de scroll programático

const ACHV_KEY = "achv:first_profession";
const PTS_KEY = "points";

export default function ProfesionesMatching() {
  const { playCorrect, playWrong, ready } = useFeedbackSounds();

  // 1:1 exacto
  const dropsOrder = useMemo(() => DATA, []);
  const [dragsOrder, setDragsOrder] = useState<Item[]>(() => shuffle(DATA));

  // refs y estado de scroll/medición
  const scrollRef = useRef<ScrollView | null>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const scrollY = useRef(0);
  const prevScrollY = useRef(0);
  const measuringPending = useRef(false);

  // Medidas en coords de ventana
  const stageWin = useRef<Rect | null>(null);
  const dropWin = useRef<Record<string, Rect>>({});

  // Drag state/posiciones animadas (coords locales al stage)
  const pos = useRef<Record<string, Animated.ValueXY>>({});
  const home = useRef<Record<string, { x: number; y: number }>>({});
  const [locked, setLocked] = useState<Record<string, boolean>>({});
  const [pairsDone, setPairsDone] = useState(0);
  const draggingId = useRef<string | null>(null);

  // feedback visual + puntos/logro
  const [flash, setFlash] = useState<Record<string, "green" | "red" | undefined>>({});
  const [achievementShown, setAchievementShown] = useState(false);
  const alreadyAwarded = useRef<boolean>(false);
  const [points, setPoints] = useState<number>(0);

  // refs UI
  const stageRef = useRef<RNView | null>(null);
  const dropRefs = useRef<Record<string, RNView | null>>({});

  /* ===== Evitar que arranquen encimadas antes de medir ===== */
  useEffect(() => {
    dragsOrder.forEach((it, i) => {
      if (!pos.current[it.id]) {
        pos.current[it.id] = new Animated.ValueXY({
          x: 10,
          y: 8 + i * (CARD_H + 12),
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ======= cargar logro/puntos ======= */
  useEffect(() => {
    (async () => {
      try {
        const [aw, pts] = await Promise.all([
          AsyncStorage.getItem(ACHV_KEY),
          AsyncStorage.getItem(PTS_KEY),
        ]);
        alreadyAwarded.current = aw === "1";
        setPoints(Number.isFinite(Number(pts)) ? Number(pts) : 0);
      } catch {}
    })();
  }, []);

  /* ======= distribuir drags usando alturas reales ======= */
  const distributeDrags = useCallback(() => {
    const st = stageWin.current;
    if (!st) return;
    // ordenar filas por Y
    const rects = dropsOrder
      .map((it) => ({ id: it.id, r: dropWin.current[it.id] }))
      .filter((x) => !!x.r)
      .sort((a, b) => a.r.y - b.r.y);

    if (rects.length !== DATA.length) return; // espera a tener todas medidas

    dragsOrder.forEach((it, i) => {
      const lane = rects[i];
      if (!lane) return;
      const r = lane.r;
      if (!pos.current[it.id]) pos.current[it.id] = new Animated.ValueXY();
      const yLocal = r.y - st.y + (r.h - CARD_H) / 2; // ventana → local
      const p = { x: 10, y: yLocal };
      home.current[it.id] = p;
      pos.current[it.id].setValue(p);
    });
  }, [dragsOrder, dropsOrder]);

  /* ======= medición del stage y drops + redistribución inmediata ======= */
  const refreshMeasurements = useCallback(() => {
    if (measuringPending.current) return;
    measuringPending.current = true;

    requestAnimationFrame(() => {
      stageRef.current?.measureInWindow((x, y, w, h) => {
        stageWin.current = { x, y, w, h };

        // medir todas las filas visibles
        Object.entries(dropRefs.current).forEach(([id, ref]) => {
          ref?.measureInWindow((dx, dy, dw, dh) => {
            dropWin.current[id] = { x: dx, y: dy, w: dw, h: dh };
          });
        });

        // distribuir justo después de medir
        requestAnimationFrame(() => {
          distributeDrags();
          measuringPending.current = false;
        });
      });
    });
  }, [distributeDrags]);

  const onStageLayout = useCallback((_e: LayoutChangeEvent) => {
    refreshMeasurements();
  }, [refreshMeasurements]);

  const setDropRef = useCallback(
    (id: string) => (r: RNView | null) => {
      dropRefs.current[id] = r; // no returns
      refreshMeasurements();
    },
    [refreshMeasurements]
  );

  const onDropLayout = useCallback((_id: string) => {
    refreshMeasurements();
  }, [refreshMeasurements]);

  /* ======= logro (+10, una sola vez) ======= */
  const awardAchievementIfNeeded = useCallback(async () => {
    if (alreadyAwarded.current) return;
    try {
      await AsyncStorage.setItem(ACHV_KEY, "1");
      alreadyAwarded.current = true;
      const newPts = points + 10;
      setPoints(newPts);
      await AsyncStorage.setItem(PTS_KEY, String(newPts));
      setAchievementShown(true);
      setTimeout(() => setAchievementShown(false), 2500);
    } catch {}
  }, [points]);

  /* ======= auto-scroll durante el drag ======= */
  const autoScrollIfNeeded = useCallback((moveY: number) => {
    const y = scrollY.current;
    let step = 0;
    if (moveY > WIN_H - EDGE) {
      step = Math.min(MAX_STEP, ((moveY - (WIN_H - EDGE)) / EDGE) * MAX_STEP);
    } else if (moveY < EDGE) {
      step = -Math.min(MAX_STEP, ((EDGE - moveY) / EDGE) * MAX_STEP);
    }
    if (step !== 0) {
      scrollRef.current?.scrollTo({ y: Math.max(0, y + step), animated: false });
    }
  }, []);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    prevScrollY.current = scrollY.current;
    scrollY.current = e.nativeEvent.contentOffset.y;

    // si estamos arrastrando, compensa el movimiento del contenido
    const active = draggingId.current;
    if (active) {
      const dy = scrollY.current - prevScrollY.current;
      const h = home.current[active];
      if (h) h.y += dy;
    }

    // re-medir para mantener hit-test preciso
    refreshMeasurements();
  }, [refreshMeasurements]);

  /* ======= PanResponder por drag ======= */
  const makeResponder = (id: string) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => !locked[id],
      onMoveShouldSetPanResponder: (_evt, g) =>
        !locked[id] && (Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3),
      onPanResponderGrant: () => {
        draggingId.current = id;
        setScrollEnabled(false);
      },
      onPanResponderMove: (evt, g) => {
        if (locked[id]) return;
        const base = home.current[id];
        pos.current[id].setValue({ x: base.x + g.dx, y: base.y + g.dy });

        // autoscroll si se acerca al borde
        const moveY = g.moveY || evt.nativeEvent.pageY;
        autoScrollIfNeeded(moveY);
      },
      onPanResponderTerminate: () => {
        draggingId.current = null;
        setScrollEnabled(true);
      },
      onPanResponderRelease: (evt, g) => {
        draggingId.current = null;
        setScrollEnabled(true);
        if (locked[id]) return;

        const moveX = g.moveX || evt.nativeEvent.pageX;
        const moveY = g.moveY || evt.nativeEvent.pageY;

        // buscar fila (con tolerancia y por cercanía vertical)
        let hit: string | null = null;
        let bestDist = Infinity;
        Object.entries(dropWin.current).forEach(([dropId, r]) => {
          const withinX = moveX >= r.x - HIT_TOL && moveX <= r.x + r.w + HIT_TOL;
          const withinY = moveY >= r.y - HIT_TOL && moveY <= r.y + r.h + HIT_TOL;
          if (withinX && withinY) {
            const cy = r.y + r.h / 2;
            const d = Math.abs(moveY - cy);
            if (d < bestDist) {
              bestDist = d;
              hit = dropId;
            }
          }
        });

        if (!hit) {
          Animated.spring(pos.current[id], {
            toValue: home.current[id],
            useNativeDriver: false,
            friction: 6,
          }).start();
          playWrong();
          return;
        }

        const ok = hit === id;
        setFlash((s) => ({ ...s, [hit!]: ok ? "green" : "red" }));
        setTimeout(() => setFlash((s) => ({ ...s, [hit!]: undefined })), 500);

        if (ok) {
          const dz = dropWin.current[hit!];
          const st = stageWin.current!;
          const snap = {
            x: dz.x - st.x + (dz.w - CARD_W) / 2,
            y: dz.y - st.y + (dz.h - CARD_H) / 2,
          };
          Animated.spring(pos.current[id], {
            toValue: snap,
            useNativeDriver: false,
            friction: 6,
          }).start(() => {
            home.current[id] = snap;
            setLocked((s) => ({ ...s, [id]: true }));
            setPairsDone((n) => {
              const nn = n + 1;
              if (nn === DATA.length) awardAchievementIfNeeded();
              return nn;
            });
          });
          playCorrect();
        } else {
          Animated.spring(pos.current[id], {
            toValue: home.current[id],
            useNativeDriver: false,
            friction: 6,
          }).start();
          playWrong();
        }
      },
    });

  // cache responders
  const responders = useRef<Record<string, ReturnType<typeof makeResponder>>>({});
  DATA.forEach((it) => {
    if (!responders.current[it.id]) responders.current[it.id] = makeResponder(it.id);
  });

  const reset = useCallback(() => {
    setLocked({});
    setPairsDone(0);
    const shuffled = shuffle(DATA);
    setDragsOrder(shuffled); // drops fijos → 1:1 garantizado
    requestAnimationFrame(() => {
      refreshMeasurements();
      distributeDrags();
    });
  }, [distributeDrags, refreshMeasurements]);

  return (
    <View style={styles.container}>
      {/* Header fijo */}
      <View style={styles.header}>
        <Text style={styles.title}>Emparejar · しょくぎょう</Text>
        <Text style={styles.note}>Arrastra la ficha hacia el nombre en japonés (ひらがな・カタカナ).</Text>
        <Text style={styles.progress}>Progreso: {pairsDone}/{DATA.length} · Puntos: {points}</Text>
        <Pressable onPress={reset} style={({ pressed }) => [styles.resetBtn, pressed && { opacity: 0.85 }]}>
          <Text style={styles.resetTxt}>↻ Reiniciar</Text>
        </Pressable>
        {!ready && <Text style={styles.smallNote}>Cargando sonidos…</Text>}
      </View>

      {/* Scroll REAL (auto-scroll programático durante drag) */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={scrollEnabled}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Contenedor relativo: a la derecha las filas (drop), a la izquierda las fichas en absoluto */}
        <View ref={stageRef} style={styles.stageInner} onLayout={onStageLayout}>
          {/* Fila por cada drop (crece => scroll) */}
          <View style={styles.dropFlow}>
            {dropsOrder.map((it) => (
              <View
                key={it.id}
                ref={setDropRef(it.id)}
                onLayout={() => onDropLayout(it.id)}
                style={[
                  styles.dropZone,
                  flash[it.id] === "green" && styles.dropGreen,
                  flash[it.id] === "red" && styles.dropRed,
                ]}
              >
                <Text style={styles.dropLabel}>{it.jp}</Text>
              </View>
            ))}
          </View>

          {/* Fichas (drags) en capa absoluta, posiciones basadas en medidas REALES */}
          {dragsOrder.map((it) => {
            const p = pos.current[it.id] ?? new Animated.ValueXY({ x: 0, y: 0 });
            return (
              <Animated.View
                key={it.id}
                style={[styles.dragCard, { transform: [{ translateX: p.x }, { translateY: p.y }] }]}
                {...responders.current[it.id].panHandlers}
              >
                <Text style={styles.emoji}>{it.emoji}</Text>
                <Text style={styles.dragText}>{it.es}</Text>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      {/* Banner logro */}
      {achievementShown && (
        <View style={styles.achvBanner}>
          <Text style={styles.achvTitle}>¡Logro desbloqueado!</Text>
          <Text style={styles.achvText}>@mi primera profesion  +10 puntos</Text>
        </View>
      )}
    </View>
  );
}

/* ===================== Estilos ===================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5dc" },

  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: "800", color: "#2f2a22" },
  note: { marginTop: 4, color: "#6c6556" },
  smallNote: { marginTop: 4, color: "#9a937f", fontSize: 12 },
  progress: { marginTop: 6, color: "#7b7464" },

  resetBtn: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e7dfc6",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resetTxt: { fontWeight: "700", color: "#2f2a22" },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 10, paddingBottom: 24 },

  // Contenedor de juego: deja “gutter” a la izquierda para las fichas
  stageInner: {
    position: "relative",
    paddingLeft: GUTTER_LEFT,
  },

  dropFlow: {},

  dropZone: {
    minHeight: 72,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e7dfc6",
    backgroundColor: "#fcfaf4",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 6,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  dropLabel: { fontSize: 20, color: "#2e2a23" },
  dropGreen: { backgroundColor: "#e7f6e9", borderColor: "#7fd38d" },
  dropRed: { backgroundColor: "#fde9ea", borderColor: "#f19aa2" },

  // Drags absolutos, posicionados sobre el mismo contenedor
  dragCard: {
    position: "absolute",
    width: CARD_W,
    height: CARD_H,
    left: 0,
    top: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e7dfc6",
    borderRadius: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    zIndex: 10,
  },
  emoji: { fontSize: 28 },
  dragText: { fontSize: 16, fontWeight: "700", color: "#2f2a22" },

  achvBanner: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e7dfc6",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  achvTitle: { fontWeight: "800", fontSize: 16, color: "#2f2a22" },
  achvText: { marginTop: 4, color: "#6c6556" },
});
