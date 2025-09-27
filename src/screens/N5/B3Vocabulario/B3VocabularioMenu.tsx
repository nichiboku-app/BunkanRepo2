import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { RootStackParamList } from "../../../../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
const { width: W, height: H } = Dimensions.get("window");

/* ============ DATA ============ */
type Topic = {
  key: string;
  title: string;
  jp: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: keyof RootStackParamList | string;
  tags: string[];
};

const TOPICS: Topic[] = [
  { key:"numeros", title:"Números y edad", jp:"数字と年齢（すうじ・ねんれい）", subtitle:"contar objetos, decir años", icon:"calculator-outline", route:"B3_NumerosEdad", tags:["カード","クイズ"] },
  { key:"familia", title:"Familia", jp:"家族（かぞく）", subtitle:"ちち・はは・おとうさん…", icon:"people-outline", route:"B3_Familia", tags:["ボキャブ","ロールプレイ"] },
  { key:"profesiones", title:"Profesiones", jp:"職業（しょくぎょう）", subtitle:"roleplay: ¿qué haces?", icon:"briefcase-outline", route:"B3_Profesiones", tags:["ロールプレイ","アバター"] },
  { key:"objClase", title:"Objetos de clase", jp:"教室の物（きょうしつのもの）", subtitle:"memoria con imágenes", icon:"cube-outline", route:"B3_ObjetosClase", tags:["カード","メモリー"] },
  { key:"lugares", title:"Lugares de la ciudad", jp:"町の場所（まちのばしょ）", subtitle:"mapa interactivo", icon:"map-outline", route:"B3_LugaresCiudad", tags:["マップ","ロールプレイ"] },
  { key:"comida", title:"Comida y bebidas", jp:"食べ物・飲み物（たべもの／のみもの）", subtitle:"roleplay restaurante", icon:"restaurant-outline", route:"B3_ComidaBebidas", tags:["ロールプレイ","カード"] },
  { key:"colores", title:"Colores y adjetivos básicos", jp:"色・基本の形容詞（いろ／けいようし）", subtitle:"matching + quiz visual", icon:"color-palette-outline", route:"B3_ColoresAdjetivos", tags:["マッチング","クイズ"] },
  { key:"cortesia", title:"Expresiones de cortesía", jp:"ていねい表現（お願いします／ありがとうございます）", subtitle:"おねがいします・ありがとうございます", icon:"heart-outline", route:"B3_Cortesia", tags:["ロールプレイ","ボイス"] },
  { key:"preguntas", title:"Preguntas básicas", jp:"基本の質問（なに・だれ・どこ）", subtitle:"qué, quién, dónde", icon:"help-circle-outline", route:"B3_PreguntasBasicas", tags:["ロールプレイ","クイズ"] },
];

/* ============ AUDIO ============ */
function speakJA(t: string) {
  if (!t) return;
  Speech.speak(t, { language: "ja-JP", rate: 0.95 });
}

/* ============ PANTALLA ============ */
export default function B3VocabularioMenu() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={{ flex: 1, backgroundColor: PAPER }}>
      <SumiEBackground />

      <ScrollView contentContainerStyle={s.c} showsVerticalScrollIndicator={false}>
        {/* Header con sello hanko */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.kicker}>語彙ブロック 3</Text>
            <Text style={s.title}>Vocabulario esencial</Text>
            <Text style={s.jpSub}>たのしく学ぼう！(¡Aprendamos con diversión!)</Text>
            <View style={s.tagsRow}>
              <Tag label="ロールプレイ" /><Tag label="アバター" /><Tag label="アニメカード" />
            </View>
          </View>
          <HankoSeal />
        </View>

        {/* Mini-guía */}
        <MiniGuideWaDesu />

        {/* Tarjetas */}
        {TOPICS.map((t) => (
          <TopicCard
            key={t.key}
            icon={t.icon}
            title={t.title}
            jp={t.jp}
            subtitle={t.subtitle}
            tags={t.tags}
            onPress={() => navigation.navigate(t.route as any)}
          />
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

/* ============ MINI-GUÍA は + です ============ */
function MiniGuideWaDesu() {
  const [showRomaji, setShowRomaji] = useState(true);
  const [showES, setShowES] = useState(true);

  const EXAMPLES = [
    { ja: "わたし は がくせい です。", ro: "watashi wa gakusei desu.", es: "Yo soy estudiante." },
    { ja: "これは ほん です。", ro: "kore wa hon desu.", es: "Esto es un libro." },
    { ja: "いもうと は じゅうごさい です。", ro: "imōto wa jūgo-sai desu.", es: "Mi hermana menor tiene 15 años." },
    { ja: "おとうと は がくせい では ありません。", ro: "otōto wa gakusei dewa arimasen.", es: "Mi hermano menor no es estudiante." },
    { ja: "おかあさん は なんさい ですか。", ro: "okāsan wa nansai desu ka?", es: "¿Cuántos años tiene tu mamá?" },
  ];

  return (
    <View style={s.cardBrush}>
      <Text style={s.h2}>Mini-guía: は (wa) + です</Text>

      <Text style={s.p}>
        <Text style={s.bold}>は</Text> es la <Text style={s.bold}>partícula de tema</Text> (se escribe は pero se pronuncia <Text style={s.kbd}>wa</Text>).
        {"\n"}Patrón base: <Text style={s.kbd}>A は B です</Text> → “en cuanto a A, B (es)”.
      </Text>

      <Text style={s.p}>
        <Text style={s.bold}>です</Text> es la forma cortés de “ser/estar”.
        {"\n"}Negativo: <Text style={s.kbd}>では ありません</Text> ／ <Text style={s.kbd}>じゃ ありません</Text>.
        {"\n"}Pregunta: <Text style={s.kbd}>ですか</Text>.
      </Text>

      <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
        <ToggleBtn icon="text-outline" label={showRomaji ? "Ocultar rōmaji" : "Mostrar rōmaji"} onPress={() => setShowRomaji(v => !v)} />
        <ToggleBtn icon="translate-outline" label={showES ? "Ocultar ES" : "Mostrar ES"} onPress={() => setShowES(v => !v)} />
      </View>

      <InkDivider />

      <View style={{ marginTop: 8, gap: 10 }}>
        {EXAMPLES.map((e, i) => (
          <View key={i}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={s.line}>{e.ja}</Text>
              <IconBtn onPress={() => speakJA(e.ja)} />
            </View>
            {showRomaji ? <Text style={s.romaji}>{e.ro}</Text> : null}
            {showES ? <Text style={s.es}>{e.es}</Text> : null}
          </View>
        ))}
      </View>

      <Text style={s.note}>
        Tip: en japonés se <Text style={s.bold}>omite</Text> mucho el sujeto si el contexto ya lo dice.{" "}
        <Text style={s.kbd}>は</Text> presenta el tema y <Text style={s.kbd}>です</Text> afirma con cortesía.
      </Text>
    </View>
  );
}

/* ============ COMPONENTES UI ============ */
function TopicCard({
  icon, title, jp, subtitle, tags, onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  jp: string;
  subtitle: string;
  tags: string[];
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const sweep = useRef(new Animated.Value(-140)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, { toValue: 220, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(sweep, { toValue: -140, duration: 0, useNativeDriver: true }),
        Animated.delay(600),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [sweep]);

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();

  return (
    <Animated.View style={[s.cardBrush, { transform: [{ scale }] }]}>
      <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} style={{ padding: 2, borderRadius: 18 }}>
        {/* “ink swipe” */}
        <Animated.View pointerEvents="none" style={[s.shineInk, { transform: [{ translateX: sweep }, { rotateZ: "-12deg" }] }]} />
        <View style={s.cardInner}>
          <View style={s.cardIconBox}><Ionicons name={icon} size={22} color={CRIMSON} /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle}>{title}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={s.cardJP}>{jp}</Text>
              <Pressable onPress={() => speakJA(jp)} style={btn.iconBtn}><Ionicons name="volume-high-outline" size={16} color={CRIMSON} /></Pressable>
            </View>
            <Text style={s.cardSub}>{subtitle}</Text>
            <View style={s.cardTags}>{tags.map((t, i) => (<Tag key={i} label={t} small />))}</View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </Pressable>
    </Animated.View>
  );
}

function Tag({ label, small }: { label: string; small?: boolean }) {
  return (
    <View style={[s.tag, small && s.tagSmall]}>
      <Text style={[s.tagTxt, small && s.tagTxtSmall]}>{label}</Text>
    </View>
  );
}

function ToggleBtn({
  icon, label, onPress,
}: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={btn.outline}>
      <Ionicons name={icon} size={18} color={CRIMSON} />
      <Text style={btn.outlineTxt}>{label}</Text>
    </Pressable>
  );
}

function IconBtn({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={btn.iconBtn}>
      <Ionicons name="volume-high-outline" size={16} color={CRIMSON} />
    </Pressable>
  );
}

function InkDivider() {
  return (
    <View style={{ marginTop: 12, marginBottom: 8 }}>
      <View style={s.brushLine} />
      <View style={[s.brushLine, { transform: [{ rotate: "-2deg" }], opacity: 0.55, marginTop: 3 }]} />
    </View>
  );
}

/* ============ FONDO SUMI-E ============ */
function SumiEBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Papel */}
      <View style={{ flex: 1, backgroundColor: PAPER }} />
      <PaperGrain />

      {/* Manchas de tinta (respiran) */}
      <InkBlot x={W*0.15} y={H*0.10} r={W*0.40} opacity={0.08} />
      <InkBlot x={W*0.65} y={H*0.18} r={W*0.35} opacity={0.06} />
      <InkBlot x={W*0.40} y={H*0.30} r={W*0.28} opacity={0.05} />

      {/* Monte estilo Fuji en tinta */}
      <FujiInk y={H*0.36} />

      {/* Bambú que se mece */}
      <Bamboo x={W*0.80} y={H*0.18} scale={1.0} delay={0} />
      <Bamboo x={W*0.10} y={H*0.22} scale={0.9} delay={600} />

      {/* Olas sumi-e (abajo) */}
      <InkWaves y={H*0.74} color="#2B2B2B" stroke="#000000" speed={16000} amp={6} opacity={0.06} />
      <InkWaves y={H*0.81} color="#1F1F1F" stroke="#000000" speed={12000} amp={8} opacity={0.08} />
    </View>
  );
}

function PaperGrain() {
  const dots = useMemo(
    () => Array.from({ length: 34 }).map((_, i) => ({
      id: i, x: Math.random()*W, y: Math.random()*H*0.55, s: 1 + Math.random()*2, op: 0.05 + Math.random()*0.05
    })), []
  );
  return (
    <View style={StyleSheet.absoluteFill}>
      {dots.map(d => (
        <View key={d.id} style={{
          position:"absolute", left:d.x, top:d.y,
          width:d.s, height:d.s, borderRadius: 8,
          backgroundColor:"#000", opacity:d.op
        }}/>
      ))}
    </View>
  );
}

function InkBlot({ x, y, r, opacity = 0.08 }: { x:number; y:number; r:number; opacity?: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t]);
  const scale = t.interpolate({ inputRange: [0,1], outputRange: [1, 1.06] });
  const op = t.interpolate({ inputRange: [0,1], outputRange: [opacity*0.9, opacity] });
  return (
    <Animated.View style={{
      position:"absolute", left:x-r, top:y-r, width:r*2, height:r*2, borderRadius:r*2,
      backgroundColor:"#000", opacity: op, transform:[{ scale }]
    }}/>
  );
}

function FujiInk({ y }: { y:number }) {
  return (
    <View style={{ position:"absolute", top:y, left: W*0.18, opacity:0.12 }}>
      <View style={{
        width: 0, height: 0,
        borderLeftWidth: W*0.28, borderRightWidth: W*0.28, borderBottomWidth: W*0.18,
        borderLeftColor:"transparent", borderRightColor:"transparent", borderBottomColor:"#000"
      }}/>
      <View style={{
        position:"absolute", top:6, left: W*0.28 - W*0.10,
        width: 0, height: 0,
        borderLeftWidth: W*0.10, borderRightWidth: W*0.10, borderBottomWidth: W*0.06,
        borderLeftColor:"transparent", borderRightColor:"transparent", borderBottomColor:"#fff"
      }}/>
    </View>
  );
}

function Bamboo({ x, y, scale = 1, delay = 0 }: { x:number; y:number; scale?: number; delay?: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t, delay]);
  const rot = t.interpolate({ inputRange: [0,1], outputRange: ["-2deg","2deg"] });

  return (
    <Animated.View style={{ position:"absolute", left:x, top:y, transform:[{ rotate: rot }, { scale }] }}>
      {/* tallo */}
      <View style={{ width: 6, height: 150, backgroundColor:"#000", opacity:0.18, borderRadius:3 }} />
      {/* nudos */}
      {[28, 68, 108].map((h) => (
        <View key={h} style={{
          position:"absolute", top:h, left:-2, width:10, height:4, backgroundColor:"#000", opacity:0.18, borderRadius:2
        }}/>
      ))}
      {/* hojas (triángulos) */}
      <Leaf dx={10} dy={20} />
      <Leaf dx={12} dy={54} flip />
      <Leaf dx={8}  dy={92} />
    </Animated.View>
  );
}
function Leaf({ dx, dy, flip }: { dx:number; dy:number; flip?: boolean }) {
  return (
    <View style={{ position:"absolute", left:dx, top:dy, transform:[{ rotate: flip ? "-36deg" : "36deg" }] }}>
      <View style={{
        width: 0, height: 0,
        borderLeftWidth: 18, borderRightWidth: 0, borderBottomWidth: 8,
        borderLeftColor:"#000", borderRightColor:"transparent", borderBottomColor:"transparent",
        opacity:0.18
      }}/>
    </View>
  );
}

function InkWaves({
  y, color, stroke, speed = 16000, amp = 6, opacity = 0.06,
}: { y:number; color:string; stroke:string; speed?:number; amp?:number; opacity?:number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = () => {
      t.setValue(0);
      Animated.timing(t, { toValue: 1, duration: speed, easing: Easing.linear, useNativeDriver: true }).start(loop);
    };
    loop();
    return () => t.stopAnimation();
  }, [t, speed]);
  const offset = t.interpolate({ inputRange: [0,1], outputRange: [0, -W] });
  const bob = t.interpolate({ inputRange: [0,0.5,1], outputRange: [-amp, amp, -amp] });

  const rowH = 42;
  const rows = 2;
  const r = rowH;

  return (
    <Animated.View style={{ position:"absolute", left:0, right:0, top:y, transform:[{ translateY: bob }], opacity }}>
      <View style={{ backgroundColor: color, height: rowH*rows + 20 }} />
      <Animated.View style={{ position:"absolute", left:0, top:0, width: W*2, height: rowH*rows + 20, transform:[{ translateX: offset }] }}>
        {[0,1].map((k) => (
          <View key={k} style={{ position:"absolute", left:k*W, width:W, height: rowH*rows + 20 }}>
            {Array.from({ length: rows }).map((_, ry) => {
              const top = ry * rowH + 6;
              const step = r;
              const yOff = ry % 2 === 0 ? 0 : step/2;
              return (
                <View key={ry} style={{ position:"absolute", top, left:-step, right:0, height: rowH, overflow:"hidden" }}>
                  {Array.from({ length: Math.ceil(W/step)+3 }).map((__, cx) => {
                    const left = cx*step + yOff;
                    return (
                      <View
                        key={cx}
                        style={{
                          position:"absolute", left, width:r*2, height:r*2, borderRadius:r*2,
                          borderWidth:2, borderColor: stroke, backgroundColor:"transparent", top:-r
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

/* Sello hanko animado */
function HankoSeal() {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(400),
      Animated.spring(t, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 8 }),
    ]).start();
  }, [t]);
  const scale = t.interpolate({ inputRange: [0,1], outputRange: [1.6, 1] });
  const op = t.interpolate({ inputRange: [0,1], outputRange: [0, 1] });
  return (
    <Animated.View style={{ transform:[{ scale }], opacity: op }}>
      <View style={s.hanko}>
        <Text style={s.hankoTxt}>認</Text>
      </View>
    </Animated.View>
  );
}

/* ============ ESTILOS ============ */
const PAPER = "#F6F1E7";
const INK = "#1F2937";
const CRIMSON = "#B32133";

const s = StyleSheet.create({
  c: { padding: 16, gap: 12, paddingTop: 18 },

  header: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  kicker: { color: CRIMSON, fontWeight: "900", letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: "900", color: INK, marginTop: 2 },
  jpSub: { color: "#6B7280", marginTop: 4 },
  tagsRow: { flexDirection: "row", gap: 8, marginTop: 10 },

  hanko: {
    width: 54, height: 54, borderRadius: 8,
    borderWidth: 3, borderColor: "#a4121a",
    backgroundColor: "#e12b2b",
    alignItems: "center", justifyContent: "center",
    transform: [{ rotate: "-8deg" }],
  },
  hankoTxt: { color:"#fff", fontWeight:"900", fontSize:22, lineHeight:22 },

  /* Tarjeta estilo pincel */
  cardBrush: {
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  shineInk: {
    position: "absolute",
    width: 160,
    height: "220%",
    top: -40,
    left: -160,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  cardInner: { flexDirection: "row", gap: 12, alignItems: "center", padding: 16 },
  cardIconBox: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff5f6", borderWidth: 1, borderColor: "#f2c9cf",
  },
  cardTitle: { fontSize: 16, fontWeight: "900", color: INK },
  cardJP: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  cardSub: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  cardTags: { flexDirection: "row", gap: 6, marginTop: 8 },

  // texto base
  p: { color: "#374151", marginTop: 6, lineHeight: 20 },
  h2: { fontSize: 16, fontWeight: "900", color: INK },
  bold: { fontWeight: "900", color: INK },
  kbd: { fontWeight: "900", color: INK },
  line: { color: INK, marginLeft: 6 },
  romaji: { color: "#374151", marginLeft: 6, marginTop: 2 },
  es: { color: "#6B7280", marginLeft: 6, marginTop: 2 },
  note: { marginTop: 8, color: "#6B7280", fontSize: 12 },

  /* Tags */
  tag: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "#fff", borderRadius: 999, borderWidth: 1, borderColor: "#E5E7EB" },
  tagSmall: { paddingHorizontal: 8, paddingVertical: 3 },
  tagTxt: { fontSize: 12, fontWeight: "800", color: INK },
  tagTxtSmall: { fontSize: 11 },
});

const btn = StyleSheet.create({
  iconBtn: { padding: 6, borderRadius: 999, backgroundColor: "#fff5f6", borderWidth: 1, borderColor: "#f2c9cf" },
  outline: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff",
  },
  outlineTxt: { color: CRIMSON, fontWeight: "900" },
});
