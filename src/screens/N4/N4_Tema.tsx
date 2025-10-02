// src/screens/N4/N4_Tema.tsx
import { AntDesign } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Fuji, Lantern, Sakura, Torii } from "../../../components/icons/JapaneseIcons";

const { width: W, height: H } = Dimensions.get("window");

/* ========= Fondo animado (mismo lenguaje visual N4) ========= */
function AnimatedBackground() {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 5000, useNativeDriver: false }),
        Animated.timing(t, { toValue: 0, duration: 5000, useNativeDriver: false }),
      ])
    ).start();
  }, [t]);

  const c1 = t.interpolate({ inputRange: [0, 1], outputRange: ["#F8D3D9", "#F4C0C8"] });
  const c2 = t.interpolate({ inputRange: [0, 1], outputRange: ["#FFE9F0", "#F9E7FF"] });
  const c3 = t.interpolate({ inputRange: [0, 1], outputRange: ["#FFFFFF", "#FFF7FB"] });

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={["#ffffff", "#fffafc"]} style={StyleSheet.absoluteFill} />
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: 0.9 }]}>
        <LinearGradient colors={["#ffffff00", "#ffffff00"]} style={StyleSheet.absoluteFill} />
      </Animated.View>
      <Animated.View style={[styles.wave, { top: -H * 0.25, backgroundColor: c1 }]} />
      <Animated.View style={[styles.wave, { bottom: -H * 0.25, backgroundColor: c2 }]} />
      <Animated.View style={[styles.wave, { right: -W * 0.2, top: H * 0.2, backgroundColor: c3 }]} />
      {/* pétalos */}
      {Array.from({ length: 10 }).map((_, i) => (
        <FloatingPetal key={i} delay={i * 600} left={(i * 73) % (W - 40)} />
      ))}
    </View>
  );
}
function FloatingPetal({ delay = 0, left = 0 }: { delay?: number; left?: number }) {
  const y = useRef(new Animated.Value(H + 40)).current;
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = () => {
      y.setValue(H + 40);
      rot.setValue(0);
      Animated.parallel([
        Animated.timing(y, { toValue: -60, duration: 12000, delay, useNativeDriver: true }),
        Animated.timing(rot, { toValue: 1, duration: 12000, delay, useNativeDriver: true }),
      ]).start(loop);
    };
    loop();
  }, [y, rot, delay]);

  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.petal,
        { transform: [{ translateY: y }, { rotate }], left, opacity: 0.55 },
      ]}
    />
  );
}

/* =================== Audio de bienvenida =================== */
function WelcomePlayer() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        // 👇 Ajusta la ruta si tu audio está en otro folder
        require("../../../assets/audio/sakurajapanese2.mp3"),
        { volume: 0.9, shouldPlay: false }
      );
      soundRef.current = sound;
      setReady(true);
    } catch (e) {
      console.warn("No se pudo cargar sakurajapanese2.mp3", e);
    }
  }, []);

  useEffect(() => {
    load();
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, [load]);

  const togglePlay = async () => {
    if (!soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();
    if ("isLoaded" in status && status.isLoaded) {
      if (status.isPlaying) {
        await soundRef.current.pauseAsync();
        setPlaying(false);
      } else {
        await soundRef.current.replayAsync();
        setPlaying(true);
      }
    }
  };

  return (
    <View style={styles.player}>
      <AntDesign name="sound" size={18} color="#5C0A14" />
      <Text style={styles.playerText}>Bienvenida – sakurajapanese2</Text>
      <Pressable
        onPress={togglePlay}
        disabled={!ready}
        style={({ pressed }) => [styles.playerBtn, pressed && { opacity: 0.8 }]}
        accessibilityRole="button"
        accessibilityLabel="Reproducir bienvenida"
      >
        <AntDesign name={isPlaying ? "pausecircleo" : "playcircleo"} size={22} color="#7E0D18" />
      </Pressable>
    </View>
  );
}

/* =================== Pantalla =================== */
type Params = { id: number; title?: string };

export default function N4_Tema() {
  const route = useRoute() as any;
  const navigation = useNavigation();
  const { id, title }: Params = route.params ?? {};

  // Título visible (si venimos con títulos enmascarados desde la lista, aquí puedes poner uno bonito)
  const prettyTitle = useMemo(
    () => (id === 1 ? "Tema 1 · Presentaciones avanzadas" : title ?? `Tema ${id}`),
    [id, title]
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="dark-content" />
      <AnimatedBackground />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header compacto */}
        <View style={styles.header}>
          <Pressable
            onPress={() => (navigation as any).goBack()}
            hitSlop={12}
            style={({ pressed }) => [{ padding: 6 }, pressed && { opacity: 0.8 }]}
            accessibilityLabel="Regresar"
          >
            <AntDesign name="arrowleft" size={22} color="#5C0A14" />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{prettyTitle}</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
          <WelcomePlayer />

          {id === 1 ? <TopicOneContent /> : <ComingSoon id={id} />}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/* =================== Contenido: Tema 1 =================== */
function TopicOneContent() {
  const [showRomaji, setShowRomaji] = useState(false);
  const [showTrans, setShowTrans] = useState(true);
  const [reveal1, setReveal1] = useState(false);
  const [reveal2, setReveal2] = useState(false);

  return (
    <>
      {/* Objetivos */}
      <SectionCard title="Objetivos de la unidad" icon={<Sakura size={18} color="#5C0A14" />}>
        <Bullet>Presentarte de forma natural en diferentes contextos.</Bullet>
        <Bullet>Mencionar origen, residencia, ocupación y aficiones.</Bullet>
        <Bullet>Hablar de experiencias pasadas y metas a futuro.</Bullet>
        <Bullet>Pedir/confirmar información básica en una conversación.</Bullet>
      </SectionCard>

      {/* Frases clave */}
      <SectionCard title="Frases clave" icon={<Torii size={18} color="#5C0A14" />}>
        <Phrase jp="はじめまして。田中（たなか）と申（もう）します。" ro="Hajimemashite. Tanaka to mōshimasu." es="Mucho gusto. Me llamo Tanaka." />
        <Phrase jp="メキシコのグアダラハラ出身（しゅっしん）で、今（いま）はCDMXに住（す）んでいます。" ro="Mekishiko no Guadarahara shusshin de, ima wa CDMX ni sunde imasu." es="Soy de Guadalajara (México) y ahora vivo en CDMX." />
        <Phrase jp="IT企業（きぎょう）で働（はたら）いていて、日本語（にほんご）を勉強（べんきょう）しています。" ro="IT kigyō de hataraite ite, nihongo o benkyō shite imasu." es="Trabajo en una empresa de TI y estudio japonés." />
        <Phrase jp="将来（しょうらい）、翻訳者（ほんやくしゃ）になりたいです。" ro="Shōrai, hon’yakusha ni naritai desu." es="En el futuro, quiero ser traductor(a)." />
        <Phrase jp="来年（らいねん）N4に合格（ごうかく）するつもりです。" ro="Rainen N-yon ni gōkaku suru tsumori desu." es="El próximo año pienso aprobar el N4." />
      </SectionCard>

      {/* Diálogo */}
      <SectionCard
        title="Diálogo modelo"
        icon={<Lantern size={18} color="#5C0A14" />}
        right={
          <View style={{ flexDirection: "row", columnGap: 12 }}>
            <ToggleSmall on={showRomaji} onPress={() => setShowRomaji((v) => !v)} label="Romaji" />
            <ToggleSmall on={showTrans} onPress={() => setShowTrans((v) => !v)} label="ES" />
          </View>
        }
      >
        <DialogLine who="A" jp="はじめまして。アンナと申します。" ro="Hajimemashite. Anna to mōshimasu." es="Mucho gusto. Me llamo Anna." showRomaji={showRomaji} showTrans={showTrans} />
        <DialogLine who="B" jp="はじめまして。カルロスです。どちらのご出身ですか。" ro="Hajimemashite. Karurosu desu. Dochira no go-shusshin desu ka?" es="Mucho gusto. Soy Carlos. ¿De dónde eres?" showRomaji={showRomaji} showTrans={showTrans} />
        <DialogLine who="A" jp="グアダラハラ出身で、今はメキシコシティに住んでいます。" ro="Guadarahara shusshin de, ima wa Mekishiko Shiti ni sunde imasu." es="Soy de Guadalajara y ahora vivo en Ciudad de México." showRomaji={showRomaji} showTrans={showTrans} />
        <DialogLine who="B" jp="お仕事は何をしていますか。" ro="O-shigoto wa nani o shite imasu ka?" es="¿A qué te dedicas?" showRomaji={showRomaji} showTrans={showTrans} />
        <DialogLine who="A" jp="IT企業で働いていて、日本語を勉強しています。" ro="IT kigyō de hataraite ite, nihongo o benkyō shite imasu." es="Trabajo en una empresa de TI y estudio japonés." showRomaji={showRomaji} showTrans={showTrans} />
        <DialogLine who="B" jp="将来の目標は何ですか。" ro="Shōrai no mokuhyō wa nan desu ka?" es="¿Cuál es tu meta a futuro?" showRomaji={showRomaji} showTrans={showTrans} />
        <DialogLine who="A" jp="来年N4に合格するつもりです。" ro="Rainen N-yon ni gōkaku suru tsumori desu." es="Pienso aprobar el N4 el próximo año." showRomaji={showRomaji} showTrans={showTrans} />
      </SectionCard>

      {/* Vocabulario */}
      <SectionCard title="Vocabulario útil" icon={<Torii size={18} color="#5C0A14" />}>
        <Bullet>申（もう）します – llamarse (humilde, formal).</Bullet>
        <Bullet>出身（しゅっしん） – lugar de origen.</Bullet>
        <Bullet>住（す）んでいます – vivir (estado actual).</Bullet>
        <Bullet>働（はたら）いています – trabajar (estado actual).</Bullet>
        <Bullet>将来（しょうらい） – futuro; 目標（もくひょう） – meta/objetivo.</Bullet>
        <Bullet>合格（ごうかく）する – aprobar (examen).</Bullet>
        <Bullet>つもりです – intención/plan.</Bullet>
      </SectionCard>

      {/* Práctica */}
      <SectionCard title="Práctica guiada" icon={<Fuji size={18} color="#5C0A14" />}>
        <Text style={styles.practiceQ}>
          1) Completa: 「はじめまして。＿＿＿と申します。________出身で、今は________に住んでいます。」
        </Text>
        {!reveal1 ? (
          <RevealBtn onPress={() => setReveal1(true)} label="Mostrar ejemplo" />
        ) : (
          <Example>
            はじめまして。カルロスと申します。グアダラハラ出身で、今はメキシコシティに住んでいます。
          </Example>
        )}

        <Text style={[styles.practiceQ, { marginTop: 14 }]}>
          2) Escribe 2 metas a futuro usando 「〜つもりです」.
        </Text>
        {!reveal2 ? (
          <RevealBtn onPress={() => setReveal2(true)} label="Mostrar ejemplo" />
        ) : (
          <Example>来年N4に合格するつもりです。将来、翻訳者になるつもりです。</Example>
        )}
      </SectionCard>

      {/* CTA siguiente (placeholder navegación) */}
      <View style={{ height: 8 }} />
      <Pressable
        onPress={() => {}}
        style={({ pressed }) => [styles.nextBtn, pressed && { opacity: 0.9 }]}
        accessibilityRole="button"
        accessibilityLabel="Siguiente unidad"
      >
        <LinearGradient colors={["#7E0D18", "#C05360"]} style={StyleSheet.absoluteFill} />
        <Text style={styles.nextBtnText}>Siguiente</Text>
        <AntDesign name="arrowright" size={18} color="#fff" style={{ marginLeft: 8 }} />
      </Pressable>
    </>
  );
}

function ComingSoon({ id }: { id: number }) {
  return (
    <SectionCard title={`Tema ${id}`} icon={<Lantern size={18} color="#5C0A14" />}>
      <Text style={styles.comingSoon}>Contenido en preparación. 🚧</Text>
    </SectionCard>
  );
}

/* =================== Subcomponentes UI =================== */
function SectionCard({
  title,
  icon,
  children,
  right,
}: {
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {icon}
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        {right}
      </View>
      <View style={{ marginTop: 8 }}>{children}</View>
    </View>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

function Phrase({
  jp,
  ro,
  es,
}: {
  jp: string;
  ro: string;
  es: string;
}) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={styles.jp}>{jp}</Text>
      <Text style={styles.ro}>{ro}</Text>
      <Text style={styles.es}>{es}</Text>
    </View>
  );
}

function DialogLine({
  who,
  jp,
  ro,
  es,
  showRomaji,
  showTrans,
}: {
  who: "A" | "B";
  jp: string;
  ro: string;
  es: string;
  showRomaji: boolean;
  showTrans: boolean;
}) {
  const isA = who === "A";
  return (
    <View style={[styles.dialogRow, isA ? styles.dialogA : styles.dialogB]}>
      <Text style={styles.dialogWho}>{who}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.jp}>{jp}</Text>
        {showRomaji && <Text style={styles.ro}>{ro}</Text>}
        {showTrans && <Text style={styles.es}>{es}</Text>}
      </View>
    </View>
  );
}

function ToggleSmall({
  on,
  onPress,
  label,
}: {
  on: boolean;
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.toggle,
        on && styles.toggleOn,
        pressed && { opacity: 0.9 },
      ]}
    >
      <Text style={[styles.toggleText, on && styles.toggleTextOn]}>{label}</Text>
    </Pressable>
  );
}

function RevealBtn({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.revealBtn, pressed && { opacity: 0.85 }]}
    >
      <AntDesign name="eyeo" size={16} color="#7E0D18" />
      <Text style={styles.revealText}>{label}</Text>
    </Pressable>
  );
}

function Example({ children }: { children: React.ReactNode }) {
  return <Text style={styles.example}>{children}</Text>;
}

/* =================== Estilos =================== */
const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
    color: "#5C0A14",
  },

  /* fondo */
  wave: {
    position: "absolute",
    width: W * 1.4,
    height: H * 0.7,
    borderRadius: W,
    transform: [{ rotate: "18deg" }],
  },
  petal: {
    position: "absolute",
    width: 22,
    height: 14,
    borderRadius: 11,
    backgroundColor: "#f2b8c6",
  },

  /* player */
  player: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(190,120,140,0.25)",
    marginBottom: 12,
  },
  playerText: { flex: 1, fontWeight: "800", color: "#5C0A14" },
  playerBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.8)",
  },

  /* tarjetas */
  card: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(190,120,140,0.25)",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "900", color: "#5C0A14" },

  bulletRow: { flexDirection: "row", gap: 8, marginBottom: 6, alignItems: "flex-start" },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#7E0D18", marginTop: 7 },
  bulletText: { flex: 1, color: "#3E0B12", fontWeight: "600" },

  jp: { color: "#3E0B12", fontWeight: "800", marginBottom: 2 },
  ro: { color: "#6a3b44", fontStyle: "italic", marginBottom: 2 },
  es: { color: "#5b1e27", opacity: 0.9 },

  dialogRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(190,120,140,0.2)",
    marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  dialogA: { backgroundColor: "rgba(250,240,245,0.9)" },
  dialogB: { backgroundColor: "rgba(248,246,255,0.9)" },
  dialogWho: { fontWeight: "900", color: "#7E0D18", marginTop: 2 },

  toggle: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(190,120,140,0.4)",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  toggleOn: {
    backgroundColor: "#FFE9F0",
    borderColor: "#F4C0C8",
  },
  toggleText: { fontWeight: "800", color: "#5C0A14", fontSize: 12 },
  toggleTextOn: { color: "#5C0A14" },

  practiceQ: {
    color: "#3E0B12",
    fontWeight: "700",
    lineHeight: 20,
  },
  revealBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(190,120,140,0.25)",
  },
  revealText: { fontWeight: "900", color: "#7E0D18" },
  example: {
    marginTop: 8,
    backgroundColor: "rgba(255,249,252,0.95)",
    borderRadius: 10,
    padding: 10,
    color: "#5C0A14",
    fontWeight: "700",
    borderWidth: 1,
    borderColor: "rgba(190,120,140,0.2)",
  },

  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    overflow: "hidden",
  },
  nextBtnText: { color: "#fff", fontWeight: "900" },
});
