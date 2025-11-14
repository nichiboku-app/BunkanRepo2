// src/screens/B6_Compras.tsx

/**
 * Metadatos de la pantalla
 *
 * Nivel/etiqueta: N5
 * Tema: Compras básicas en Japón (en Kioto)
 * Ruta/Navegación (screenKey): B6_Compras
 * Título visible (hero): Compras en Kioto
 * Logro al éxito (idempotente): compras_basicas_n5
 * Subtítulo/Nombre del logro: Compras en Japón (N5)
 * XP al entrar: 10
 * XP al éxito del logro: 10
 * ¿XP por repeticiones? no (0)
 */

import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Easing,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useFeedbackSounds } from "../../src/hooks/useFeedbackSounds";
import {
    awardAchievement,
    awardOnSuccess,
    useAwardOnEnter,
} from "../services/achievements";

const SCREEN_KEY = "B6_Compras";
const LEVEL_LABEL = "N5";
const ACHIEVEMENT_ID = "compras_basicas_n5";
const ACHIEVEMENT_SUBTITLE = "Compras en Japón (N5)";
const XP_ON_ENTER = 10;
const XP_ON_SUCCESS = 0;
const XP_ON_ACHIEVEMENT = 10;
const REPEAT_XP = 0;

type VocabItem = {
  jp: string;
  hint: string;
  es: string;
};

type ExampleItem = {
  jp: string;
  es: string;
};

type ChoiceQuestion = {
  id: string;
  prompt: string;
  hint: string;
  options: string[];
  correctOption: string;
  explanation: string;
};

type MeaningQuestion = {
  id: string;
  jp: string;
  esCorrect: string;
  esOptions: string[];
  hint: string;
};

type KanjiItem = {
  hex: string;
  char: string;
  reading: string;
  meaning: string;
};

const vocabList: VocabItem[] = [
  { jp: "かいもの", hint: "actividad", es: "compras" },
  { jp: "みせ", hint: "lugar", es: "tienda" },
  { jp: "スーパー", hint: "grande", es: "supermercado" },
  { jp: "デパート", hint: "muchas tiendas", es: "gran almacén" },
  { jp: "かう", hint: "verbo", es: "comprar" },
  { jp: "いくら", hint: "pregunta", es: "¿cuánto (dinero)?" },
  { jp: "やすい", hint: "precio bajo", es: "barato" },
  { jp: "たかい", hint: "precio alto", es: "caro" },
  { jp: "ふく", hint: "ropa", es: "ropa" },
  { jp: "くつ", hint: "para los pies", es: "zapatos" },
  { jp: "かばん", hint: "bolso", es: "bolsa, mochila, bolso" },
  { jp: "セール", hint: "evento", es: "rebaja, oferta" },
];

const exampleList: ExampleItem[] = [
  { jp: "すみません、これはいくらですか。", es: "Disculpe, ¿cuánto cuesta esto?" },
  { jp: "あのシャツはやすいです。", es: "Esa camisa es barata." },
  { jp: "このくつはたかいです。", es: "Estos zapatos son caros." },
  { jp: "スーパーでパンをかいます。", es: "Compro pan en el supermercado." },
  { jp: "デパートでふくをかいました。", es: "Compré ropa en el gran almacén." },
  { jp: "みせでみずをかいたいです。", es: "Quiero comprar agua en la tienda." },
  { jp: "あのかばんをみせてください。", es: "Por favor, muéstreme ese bolso." },
  { jp: "セールのシャツをかいます。", es: "Compro la camisa en oferta." },
  { jp: "このくつをください。", es: "Por favor, estos zapatos." },
  { jp: "カードでおねがいします。", es: "Con tarjeta, por favor." },
  { jp: "げんきんではらいます。", es: "Pago en efectivo." },
  { jp: "レジはどこですか。", es: "¿Dónde está la caja?" },
  {
    jp: "きょうはスーパーでおおきいセールがあります。",
    es: "Hoy hay una gran oferta en el supermercado.",
  },
  {
    jp: "みせのひとはとてもやさしいです。",
    es: "La persona de la tienda es muy amable.",
  },
];

/** 7 preguntas Juego A – selección de frase correcta */
const gameAQuestions: ChoiceQuestion[] = [
  {
    id: "qa1",
    prompt: "Disculpa, quieres preguntar el precio de esto.",
    hint: "Frase típica al señalar un producto.",
    options: ["これはいくらですか。", "これはどこですか。", "これはだれですか。"],
    correctOption: "これはいくらですか。",
    explanation: "Para preguntar el precio usamos いくら (¿cuánto dinero?).",
  },
  {
    id: "qa2",
    prompt: "Quieres decir: “Compro pan en el supermercado”.",
    hint: "Lugar + で + objeto + を + かいます。",
    options: [
      "スーパーでパンをかいます。",
      "スーパーをパンでかいます。",
      "パンでスーパーをかいます。",
    ],
    correctOption: "スーパーでパンをかいます。",
    explanation:
      "El lugar de la acción lleva で. El objeto directo lleva を antes de かいます.",
  },
  {
    id: "qa3",
    prompt: "Quieres decir: “Es barato”.",
    hint: "Usa やすいです.",
    options: ["やすいです。", "たかいです。", "きれいです. "],
    correctOption: "やすいです。",
    explanation: "やすい significa “barato”.",
  },
  {
    id: "qa4",
    prompt: "Quieres decir: “Por favor, muéstreme ese bolso”.",
    hint: "あの + objeto + をみせてください。",
    options: [
      "あのかばんをみせてください。",
      "あのかばんはいくらですか。",
      "あのかばんをください。",
    ],
    correctOption: "あのかばんをみせてください。",
    explanation:
      "みせてください es “por favor, muéstreme”. ください solo es “por favor, deme”.",
  },
  {
    id: "qa5",
    prompt: "Quieres decir: “Quiero comprar ropa en el gran almacén”.",
    hint: "Lugar + で + ふく + を + かいたいです。",
    options: [
      "デパートでふくをかいたいです。",
      "ふくでデパートをかいたいです。",
      "デパートをふくでかいたいです。",
    ],
    correctOption: "デパートでふくをかいたいです。",
    explanation:
      "デパートで marca el lugar (gran almacén). El objeto ふく lleva を antes de かいたいです.",
  },
  {
    id: "qa6",
    prompt: "Quieres pedir: “Por favor, estos zapatos”.",
    hint: "Usa このくつ + をください。",
    options: [
      "このくつをください。",
      "このくつはください。",
      "くださいこのくつ。",
    ],
    correctOption: "このくつをください。",
    explanation:
      "〜をください es la forma natural para pedir un producto en la tienda.",
  },
  {
    id: "qa7",
    prompt: "Quieres preguntar: “¿Dónde está la caja?”.",
    hint: "Usa レジ + はどこですか。",
    options: ["レジはどこですか。", "レジはいくらですか。", "レジをください。"],
    correctOption: "レジはどこですか。",
    explanation: "どこ significa “dónde”. Usamos は para el tema: レジはどこですか。",
  },
];

/** 7 preguntas Juego B – pareo de significado */
const gameBQuestions: MeaningQuestion[] = [
  {
    id: "qb1",
    jp: "このくつはたかいです。",
    esCorrect: "Estos zapatos son caros.",
    esOptions: [
      "Estos zapatos son caros.",
      "Esos zapatos son baratos.",
      "Esta tienda es barata.",
    ],
    hint: "たかい = caro, このくつ = estos zapatos.",
  },
  {
    id: "qb2",
    jp: "スーパーでみずをかいます。",
    esCorrect: "Compro agua en el supermercado.",
    esOptions: [
      "Como agua en el supermercado.",
      "Compro agua en el supermercado.",
      "Bebo agua en la casa.",
    ],
    hint: "で marca el lugar de la acción, かいます = comprar.",
  },
  {
    id: "qb3",
    jp: "セールのシャツをかいます。",
    esCorrect: "Compro la camisa en oferta.",
    esOptions: [
      "Compro la camisa en oferta.",
      "Compro la camisa usada.",
      "Compro la camisa nueva de mi amigo.",
    ],
    hint: "セール = rebaja, oferta.",
  },
  {
    id: "qb4",
    jp: "レジはどこですか。",
    esCorrect: "¿Dónde está la caja?",
    esOptions: [
      "¿Dónde está la caja?",
      "¿Cuánto cuesta la caja?",
      "¿Quién está en la caja?",
    ],
    hint: "どこ = dónde.",
  },
  {
    id: "qb5",
    jp: "カードでおねがいします。",
    esCorrect: "Con tarjeta, por favor.",
    esOptions: [
      "Con tarjeta, por favor.",
      "Con efectivo, por favor.",
      "Sin bolsa, por favor.",
    ],
    hint: "カード = tarjeta. 〜でおねがいします = “así, por favor”.",
  },
  {
    id: "qb6",
    jp: "げんきんではらいます。",
    esCorrect: "Pago en efectivo.",
    esOptions: ["Pago en efectivo.", "Pago más tarde.", "Pago con tarjeta."],
    hint: "げんきん = efectivo, はらいます = pagar.",
  },
  {
    id: "qb7",
    jp: "あのかばんをみせてください。",
    esCorrect: "Por favor, muéstreme ese bolso.",
    esOptions: [
      "Por favor, muéstreme ese bolso.",
      "Por favor, regáleme ese bolso.",
      "Por favor, guarde ese bolso.",
    ],
    hint: "みせてください = “por favor, muéstreme”.",
  },
];

const kanjiItems: KanjiItem[] = [
  { hex: "8cb7", char: "買", reading: "か（う）", meaning: "comprar" },
  { hex: "5e97", char: "店", reading: "みせ", meaning: "tienda" },
  { hex: "5186", char: "円", reading: "えん", meaning: "yen" },
  { hex: "65e5", char: "日", reading: "ひ / にち", meaning: "día" },
  { hex: "6642", char: "時", reading: "じ", meaning: "hora" },
  { hex: "4eba", char: "人", reading: "ひと", meaning: "persona" },
  { hex: "5927", char: "大", reading: "おお（きい）", meaning: "grande" },
  { hex: "5c0f", char: "小", reading: "ちい（さい）", meaning: "pequeño" },
  { hex: "53e3", char: "口", reading: "くち", meaning: "boca / entrada" },
  { hex: "8857", char: "街", reading: "まち", meaning: "calle / ciudad" },
];

const kanjiImages: Record<string, any> = {
  "8cb7": require("../../assets/kanjivg/n5/8cb7_nums.webp"),
  "5e97": require("../../assets/kanjivg/n5/5e97_nums.webp"),
  "5186": require("../../assets/kanjivg/n5/5186_nums.webp"),
  "65e5": require("../../assets/kanjivg/n5/65e5_nums.webp"),
  "6642": require("../../assets/kanjivg/n5/6642_nums.webp"),
  "4eba": require("../../assets/kanjivg/n5/4eba_nums.webp"),
  "5927": require("../../assets/kanjivg/n5/5927_nums.webp"),
  "5c0f": require("../../assets/kanjivg/n5/5c0f_nums.webp"),
  "53e3": require("../../assets/kanjivg/n5/53e3_nums.webp"),
  "8857": require("../../assets/kanjivg/n5/8857_nums.webp"),
};

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const B6_ComprasScreen: React.FC = () => {
  const { playCorrect, playWrong } = useFeedbackSounds();
  useAwardOnEnter(SCREEN_KEY, { xpOnEnter: XP_ON_ENTER, repeatXp: REPEAT_XP });

  const [selectedVocab, setSelectedVocab] = useState<string | null>(null);
  const [mcIndex, setMcIndex] = useState(0);
  const [mcSelectedOption, setMcSelectedOption] = useState<string | null>(null);
  const [mcIsCorrect, setMcIsCorrect] = useState<boolean | null>(null);

  const [matchIndex, setMatchIndex] = useState(0);
  const [matchSelected, setMatchSelected] = useState<string | null>(null);
  const [matchIsCorrect, setMatchIsCorrect] = useState<boolean | null>(null);

  const [gameACompleted, setGameACompleted] = useState(false);
  const [gameBCompleted, setGameBCompleted] = useState(false);
  const [achievementModalVisible, setAchievementModalVisible] = useState(false);

  const achievementGivenRef = useRef(false);

  const heroGlow = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const shoppingFloat = useRef(new Animated.Value(0)).current;
  const hudSpring = useRef(new Animated.Value(0)).current;

  // NUEVO: animación de fondo tipo bandas de neón
  const bgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnim, {
          toValue: 1,
          duration: 9000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bgAnim, {
          toValue: 0,
          duration: 9000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bgAnim]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(heroGlow, {
          toValue: 1,
          duration: 2600,
          useNativeDriver: true,
        }),
        Animated.timing(heroGlow, {
          toValue: 0,
          duration: 2600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [heroGlow]);

  useEffect(() => {
    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 700,
      delay: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [contentAnim]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shoppingFloat, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shoppingFloat, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shoppingFloat]);

  useEffect(() => {
    Animated.spring(hudSpring, {
      toValue: 1,
      friction: 7,
      tension: 70,
      useNativeDriver: true,
    }).start();
  }, [hudSpring]);

  const speakJapanese = (text: string) => {
    if (!text) return;
    Speech.speak(text, { language: "ja-JP" });
  };

  const currentMcQuestion = useMemo(
    () => gameAQuestions[mcIndex],
    [mcIndex]
  );

  const currentMatchQuestion = useMemo(
    () => gameBQuestions[matchIndex],
    [matchIndex]
  );

  const handleMcOptionPress = (option: string) => {
    if (mcIsCorrect) {
      setMcSelectedOption(option);
      return;
    }

    setMcSelectedOption(option);
    const isCorrect = option === currentMcQuestion.correctOption;
    setMcIsCorrect(isCorrect);

    if (isCorrect) {
      playCorrect();
    } else {
      playWrong();
    }
  };

  const handleMatchOptionPress = (option: string) => {
    if (matchIsCorrect) {
      setMatchSelected(option);
      return;
    }

    setMatchSelected(option);
    const isCorrect = option === currentMatchQuestion.esCorrect;
    setMatchIsCorrect(isCorrect);

    if (isCorrect) {
      playCorrect();
    } else {
      playWrong();
    }
  };

  const handleGameCompleted = async (which: "A" | "B") => {
    if (which === "A") {
      if (!gameACompleted) setGameACompleted(true);
    } else {
      if (!gameBCompleted) setGameBCompleted(true);
    }

    const willA = which === "A" ? true : gameACompleted;
    const willB = which === "B" ? true : gameBCompleted;

    if (willA && willB && !achievementGivenRef.current) {
      achievementGivenRef.current = true;
      try {
        await awardOnSuccess(SCREEN_KEY, { xpOnSuccess: XP_ON_SUCCESS });
        await awardAchievement(ACHIEVEMENT_ID, {
          xp: XP_ON_ACHIEVEMENT,
          sub: ACHIEVEMENT_SUBTITLE,
          meta: { screenKey: SCREEN_KEY, level: LEVEL_LABEL },
        });
        setAchievementModalVisible(true);
      } catch {
        // manejar error si hace falta
      }
    }
  };

  const handleMcNext = async () => {
    const isLast = mcIndex === gameAQuestions.length - 1;
    if (isLast) {
      await handleGameCompleted("A");
    } else {
      setMcIndex((prev) => prev + 1);
      setMcSelectedOption(null);
      setMcIsCorrect(null);
    }
  };

  const handleMatchNext = async () => {
    const isLast = matchIndex === gameBQuestions.length - 1;
    if (isLast) {
      await handleGameCompleted("B");
    } else {
      setMatchIndex((prev) => prev + 1);
      setMatchSelected(null);
      setMatchIsCorrect(null);
    }
  };

  const heroGlowStyle = {
    opacity: heroGlow.interpolate({
      inputRange: [0, 1],
      outputRange: [0.25, 0.9],
    }),
    transform: [
      {
        scale: heroGlow.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.07],
        }),
      },
    ],
  };

  const heroParallaxStyle = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [0, 120],
          outputRange: [0, -40],
          extrapolate: "clamp",
        }),
      },
      {
        scale: scrollY.interpolate({
          inputRange: [0, 120],
          outputRange: [1, 0.96],
          extrapolate: "clamp",
        }),
      },
    ],
    opacity: scrollY.interpolate({
      inputRange: [0, 120],
      outputRange: [1, 0.8],
      extrapolate: "clamp",
    }),
  };

  const shoppingFloatStyle = {
    transform: [
      {
        translateY: shoppingFloat.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      },
      {
        rotate: shoppingFloat.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "-6deg"],
        }),
      },
    ],
  };

  const sectionAnimatedStyle = {
    opacity: contentAnim,
    transform: [
      {
        translateY: contentAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
    ],
  };

  const hudTranslate = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, 16],
    extrapolate: "clamp",
  });

  const hudCombinedTransform = [
    {
      translateY: hudTranslate,
    },
    {
      scale: hudSpring.interpolate({
        inputRange: [0, 1],
        outputRange: [0.92, 1],
      }),
    },
  ];

  // estilos animados del fondo
  const bgBandCyanStyle = {
    opacity: bgAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.25, 0.6],
    }),
    transform: [
      {
        translateY: bgAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [40, -40],
        }),
      },
      {
        translateX: bgAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-40, 40],
        }),
      },
      { rotate: "-18deg" },
    ],
  };

  const bgBandPinkStyle = {
    opacity: bgAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.18, 0.55],
    }),
    transform: [
      {
        translateY: bgAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-60, 60],
        }),
      },
      {
        translateX: bgAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, -20],
        }),
      },
      { rotate: "14deg" },
    ],
  };

  const bgBandPurpleStyle = {
    opacity: bgAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.18, 0.4],
    }),
    transform: [
      {
        translateY: bgAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [80, -80],
        }),
      },
      {
        translateX: bgAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -30],
        }),
      },
      { rotate: "-6deg" },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Fondo animado estilo bandas de neón sobre Kioto */}
      <View style={styles.backgroundLayer}>
        <Animated.View style={[styles.bgBandCyan, bgBandCyanStyle]} />
        <Animated.View style={[styles.bgBandPink, bgBandPinkStyle]} />
        <Animated.View style={[styles.bgBandPurple, bgBandPurpleStyle]} />
      </View>

      <AnimatedScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* HERO */}
        <Animated.View style={[styles.heroContainer, heroParallaxStyle]}>
          <Animated.View style={[styles.heroGlowBlob, heroGlowStyle]} />
          <Animated.View
            style={[styles.heroGlowBlobSecondary, heroGlowStyle]}
          />

          <View style={styles.heroContent}>
            <View style={styles.heroTopRow}>
              <Text style={styles.levelBadge}>{LEVEL_LABEL}</Text>

              <View style={styles.heroPill}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color="#e0f2fe"
                />
                <Text style={styles.heroPillText}>Kyoto 夜市 · Shopping</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>Compras en Kioto</Text>
            <Text style={styles.heroSubtitle}>
              Practica frases para preguntar precios, pedir productos y salir
              del konbini con bolsillo feliz.
            </Text>

            <View style={styles.heroChipsRow}>
              <View style={styles.chip}>
                <Ionicons name="bag-handle-outline" size={16} color="#c4fff3" />
                <Text style={styles.chipText}>Frases útiles</Text>
              </View>
              <View style={styles.chip}>
                <Ionicons name="cash-outline" size={16} color="#fed7aa" />
                <Text style={styles.chipText}>Precios & pagos</Text>
              </View>
              <View style={styles.chip}>
                <Ionicons name="sparkles-outline" size={16} color="#f9a8d4" />
                <Text style={styles.chipText}>Kanji kawaii</Text>
              </View>
            </View>

            <View style={styles.receiptRow}>
              <View style={styles.receiptTag}>
                <Ionicons name="pricetag-outline" size={14} color="#facc15" />
                <Text style={styles.receiptText}>“これ は いくら？”</Text>
              </View>
              <View style={styles.receiptTag}>
                <Ionicons name="card-outline" size={14} color="#bae6fd" />
                <Text style={styles.receiptText}>Efectivo o tarjeta</Text>
              </View>
            </View>

            <Animated.View style={[styles.heroFloatingBadge, shoppingFloatStyle]}>
              <Ionicons name="bag-check-outline" size={20} color="#0f172a" />
              <Text style={styles.heroFloatingText}>Noche de ofertas</Text>
            </Animated.View>
          </View>
        </Animated.View>

        {/* 1. Explicación básica */}
        <Animated.View style={[styles.sectionCard, sectionAnimatedStyle]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>1. Explicación básica</Text>
            <View style={styles.sectionPill}>
              <Ionicons name="moon-outline" size={14} color="#bae6fd" />
              <Text style={styles.sectionPillText}>Modo súper fácil</Text>
            </View>
          </View>
          <Text style={styles.sectionIntro}>
            Imagina una calle de Kioto de noche. Hay muchas luces. Hay muchas
            tiendas（みせ）. Vamos a usar frases muy cortas.
          </Text>
          <Text style={styles.sectionText}>
            {"• "}Para preguntar el precio usamos{" "}
            <Text style={styles.jpHighlight}>いくら</Text>.
          </Text>
          <View style={styles.inlineExampleRow}>
            <Text style={styles.inlineJp}>これはいくらですか。</Text>
            <Pressable
              style={styles.iconButton}
              onPress={() => speakJapanese("これはいくらですか。")}
            >
              <Ionicons name="volume-high-outline" size={18} color="#c4fff3" />
            </Pressable>
          </View>
          <Text style={styles.sectionHintText}>
            “¿Cuánto cuesta esto?” (これ = esto)
          </Text>

          <Text style={styles.sectionText}>
            {"• "}Para decir dónde compras usamos la partícula{" "}
            <Text style={styles.jpHighlight}>で</Text> después del lugar.
          </Text>
          <View style={styles.inlineExampleRow}>
            <Text style={styles.inlineJp}>スーパーでパンをかいます。</Text>
            <Pressable
              style={styles.iconButton}
              onPress={() => speakJapanese("スーパーでパンをかいます。")}
            >
              <Ionicons name="volume-high-outline" size={18} color="#c4fff3" />
            </Pressable>
          </View>
          <Text style={styles.sectionHintText}>
            “Compro pan en el supermercado.”
          </Text>

          <Text style={styles.sectionText}>
            {"• "}Para decir si algo es barato o caro usamos adjetivos:
          </Text>
          <Text style={styles.sectionText}>
            <Text style={styles.jpHighlight}>やすい</Text> = barato,{" "}
            <Text style={styles.jpHighlight}>たかい</Text> = caro.
          </Text>

          <View style={styles.infoTagRow}>
            <View style={styles.infoTag}>
              <Text style={styles.infoTagLabel}>TIP</Text>
              <Text style={styles.infoTagText}>
                Usa <Text style={styles.jpHighlight}>〜をください</Text> para
                pedir algo en la tienda: “Por favor, deme ~”.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* 2. Vocabulario clave */}
        <Animated.View style={[styles.sectionCard, sectionAnimatedStyle]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>2. Vocabulario clave</Text>
            <View style={styles.sectionPillSoft}>
              <Ionicons
                name="musical-notes-outline"
                size={14}
                color="#f9a8d4"
              />
              <Text style={styles.sectionPillText}>Pulsa y escucha</Text>
            </View>
          </View>
          <Text style={styles.sectionIntro}>
            Toca la bocina para escuchar cada palabra en japonés.
          </Text>

          {vocabList.map((item, index) => (
            <Animated.View
              key={item.jp}
              style={{
                transform: [
                  {
                    translateY: contentAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
                opacity: contentAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              }}
            >
              <Pressable
                style={[
                  styles.vocabRow,
                  selectedVocab === item.jp && styles.vocabRowActive,
                ]}
                onPress={() => {
                  setSelectedVocab(item.jp);
                  speakJapanese(item.jp);
                }}
              >
                <View style={styles.vocabIndexTag}>
                  <Text style={styles.vocabIndexText}>
                    {String(index + 1).padStart(2, "0")}
                  </Text>
                </View>
                <View style={styles.vocabTextBlock}>
                  <Text style={styles.vocabJp}>{item.jp}</Text>
                  <Text style={styles.vocabEs}>{item.es}</Text>
                  <Text style={styles.vocabHint}>Pista: {item.hint}</Text>
                </View>
                <View style={styles.vocabIconWrapper}>
                  <Ionicons
                    name="volume-high-outline"
                    size={20}
                    color={selectedVocab === item.jp ? "#020617" : "#c4fff3"}
                  />
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </Animated.View>

        {/* 3. Ejemplos */}
        <Animated.View style={[styles.sectionCard, sectionAnimatedStyle]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>3. Ejemplos en la calle</Text>
            <View style={styles.sectionPill}>
              <Ionicons name="walk-outline" size={14} color="#bbf7d0" />
              <Text style={styles.sectionPillText}>Mini escenas</Text>
            </View>
          </View>
          <Text style={styles.sectionIntro}>
            Lee las frases. Luego escucha y compara con el español.
          </Text>

          {exampleList.map((ex, index) => (
            <View key={`${ex.jp}-${index}`} style={styles.exampleRow}>
              <View style={styles.exampleTopRow}>
                <Text style={styles.exampleJp}>{ex.jp}</Text>
                <Pressable
                  style={styles.iconButton}
                  onPress={() => speakJapanese(ex.jp)}
                >
                  <Ionicons
                    name="volume-high-outline"
                    size={18}
                    color="#e5d3ff"
                  />
                </Pressable>
              </View>
              <Text style={styles.exampleEs}>{ex.es}</Text>
            </View>
          ))}
        </Animated.View>

        {/* 4. Juego A */}
        <Animated.View style={[styles.sectionCard, sectionAnimatedStyle]}>
          <Text style={styles.sectionTitle}>4. Juego A – Forma correcta</Text>
          <Text style={styles.sectionIntro}>
            Lee la situación y toca la oración correcta en japonés.
          </Text>

          <View style={styles.quizCard}>
            <View style={styles.quizHeaderRow}>
              <Text style={styles.quizBadge}>Juego A</Text>
              <Text style={styles.quizProgress}>
                {mcIndex + 1}/{gameAQuestions.length}
              </Text>
            </View>
            <Text style={styles.quizPrompt}>{currentMcQuestion.prompt}</Text>
            <Text style={styles.quizHint}>Pista: {currentMcQuestion.hint}</Text>

            {currentMcQuestion.options.map((opt) => {
              const isSelected = mcSelectedOption === opt;
              const isCorrectOption =
                mcIsCorrect != null &&
                opt === currentMcQuestion.correctOption &&
                isSelected;
              const isWrongSelected =
                mcIsCorrect === false && isSelected && !isCorrectOption;

              return (
                <Pressable
                  key={opt}
                  style={[
                    styles.quizOption,
                    isSelected && styles.quizOptionSelected,
                    isCorrectOption && styles.quizOptionCorrect,
                    isWrongSelected && styles.quizOptionWrong,
                  ]}
                  onPress={() => handleMcOptionPress(opt)}
                >
                  <Text style={styles.quizOptionText}>{opt}</Text>
                </Pressable>
              );
            })}

            {mcIsCorrect != null && (
              <View style={styles.feedbackRow}>
                <Ionicons
                  name={mcIsCorrect ? "checkmark-circle" : "close-circle"}
                  size={18}
                  color={mcIsCorrect ? "#8cfac3" : "#ffb3c6"}
                  style={styles.feedbackIcon}
                />
                <Text
                  style={[
                    styles.feedbackText,
                    mcIsCorrect
                      ? styles.feedbackTextCorrect
                      : styles.feedbackTextWrong,
                  ]}
                >
                  {mcIsCorrect ? "¡Correcto!" : "Casi, inténtalo de nuevo."}
                </Text>
              </View>
            )}
            {mcIsCorrect && (
              <View style={styles.quizExplanationBox}>
                <Text style={styles.quizExplanationTitle}>Explicación</Text>
                <Text style={styles.quizExplanationText}>
                  {currentMcQuestion.explanation}
                </Text>
              </View>
            )}

            {mcIsCorrect && (
              <Pressable style={styles.nextButton} onPress={handleMcNext}>
                <Text style={styles.nextButtonText}>
                  {mcIndex === gameAQuestions.length - 1
                    ? "Terminar Juego A"
                    : "Siguiente"}
                </Text>
              </Pressable>
            )}

            {gameACompleted && (
              <Text style={styles.gameCompletedTag}>
                Juego A completado ✓
              </Text>
            )}
          </View>
        </Animated.View>

        {/* 5. Juego B */}
        <Animated.View style={[styles.sectionCard, sectionAnimatedStyle]}>
          <Text style={styles.sectionTitle}>5. Juego B – Pareo de significado</Text>
          <Text style={styles.sectionIntro}>
            Escucha la frase en japonés y elige la traducción correcta en
            español.
          </Text>

          <View style={styles.quizCardAlt}>
            <View style={styles.quizHeaderRow}>
              <Text style={styles.quizBadgeAlt}>Juego B</Text>
              <Text style={styles.quizProgress}>
                {matchIndex + 1}/{gameBQuestions.length}
              </Text>
            </View>
            <View style={styles.exampleTopRow}>
              <Text style={styles.exampleJp}>{currentMatchQuestion.jp}</Text>
              <Pressable
                style={styles.iconButton}
                onPress={() => speakJapanese(currentMatchQuestion.jp)}
              >
                <Ionicons
                  name="volume-high-outline"
                  size={18}
                  color="#c4fff3"
                />
              </Pressable>
            </View>
            <Text style={styles.quizHint}>
              Pista: {currentMatchQuestion.hint}
            </Text>

            {currentMatchQuestion.esOptions.map((opt) => {
              const isSelected = matchSelected === opt;
              const isCorrectOption =
                matchIsCorrect != null &&
                opt === currentMatchQuestion.esCorrect &&
                isSelected;
              const isWrongSelected =
                matchIsCorrect === false && isSelected && !isCorrectOption;

              return (
                <Pressable
                  key={opt}
                  style={[
                    styles.quizOption,
                    isSelected && styles.quizOptionSelectedAlt,
                    isCorrectOption && styles.quizOptionCorrect,
                    isWrongSelected && styles.quizOptionWrong,
                  ]}
                  onPress={() => handleMatchOptionPress(opt)}
                >
                  <Text style={styles.quizOptionText}>{opt}</Text>
                </Pressable>
              );
            })}

            {matchIsCorrect != null && (
              <View style={styles.feedbackRow}>
                <Ionicons
                  name={matchIsCorrect ? "checkmark-circle" : "close-circle"}
                  size={18}
                  color={matchIsCorrect ? "#8cfac3" : "#ffb3c6"}
                  style={styles.feedbackIcon}
                />
                <Text
                  style={[
                    styles.feedbackText,
                    matchIsCorrect
                      ? styles.feedbackTextCorrect
                      : styles.feedbackTextWrong,
                  ]}
                >
                  {matchIsCorrect
                    ? "¡Muy bien! Entiendes la frase."
                    : "No pasa nada, prueba otra vez."}
                </Text>
              </View>
            )}

            {matchIsCorrect && (
              <Pressable style={styles.nextButtonAlt} onPress={handleMatchNext}>
                <Text style={styles.nextButtonText}>
                  {matchIndex === gameBQuestions.length - 1
                    ? "Terminar Juego B"
                    : "Siguiente"}
                </Text>
              </Pressable>
            )}

            {gameBCompleted && (
              <Text style={styles.gameCompletedTagAlt}>
                Juego B completado ✓
              </Text>
            )}
          </View>
        </Animated.View>

        {/* 6. Trazos de Kanji */}
        <Animated.View style={[styles.sectionCard, sectionAnimatedStyle]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              6. Kanji de compras – Trazos
            </Text>
            <View style={styles.sectionPillSoft}>
              <Ionicons name="pencil-outline" size={14} color="#bfdbfe" />
              <Text style={styles.sectionPillText}>Caligrafía</Text>
            </View>
          </View>

          <Text style={styles.sectionIntro}>
            Estos kanji aparecen mucho cuando compras en Japón. Fondo blanco,
            trazos en blanco estilo cuaderno japonés.
          </Text>

          <Text style={styles.sectionText}>
            <Text style={styles.jpHighlight}>買（か・う）</Text> – “comprar”.{" "}
            <Text style={styles.jpHighlight}>店（みせ）</Text> – “tienda”.{" "}
            <Text style={styles.jpHighlight}>円（えん）</Text> – “yen”.
          </Text>
          <Text style={styles.sectionText}>
            Usamos lecturas sencillas de nivel N5:
          </Text>
          <Text style={styles.sectionHintText}>
            買（か）como en かいます, 店（みせ）como “tienda”, 円（えん）como “yen”.
          </Text>

          <View style={styles.kanjiGrid}>
            {kanjiItems.map((k) => (
              <View key={k.hex} style={styles.kanjiCard}>
                <View style={styles.kanjiImageWrapper}>
                  <Image
                    source={kanjiImages[k.hex]}
                    style={styles.kanjiImage}
                    resizeMode="contain"
                  />
                  <View style={styles.kanjiOverlay}>
                    <Text style={styles.kanjiChar}>{k.char}</Text>
                  </View>
                </View>
                <View style={styles.kanjiMetaRow}>
                  <Text style={styles.kanjiReading}>{k.reading}</Text>
                  <Text style={styles.kanjiMeaning}>{k.meaning}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={{ height: 88 }} />
      </AnimatedScrollView>

      {/* HUD flotante tipo iOS con XP */}
      <Animated.View
        style={[
          styles.bottomHud,
          {
            transform: hudCombinedTransform,
          },
        ]}
      >
        <View style={styles.bottomHudRow}>
          <View style={styles.bottomHudLeft}>
            <Ionicons name="flame-outline" size={18} color="#fde68a" />
            <Text style={styles.bottomHudText}>
              Sesión de hoy: +{XP_ON_ENTER} XP al entrar
            </Text>
          </View>
          <View style={styles.bottomHudChip}>
            <Ionicons name="trophy-outline" size={14} color="#020617" />
            <Text style={styles.bottomHudChipText}>
              +{XP_ON_ACHIEVEMENT} XP logro
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Modal de logro */}
      <Modal
        transparent
        animationType="fade"
        visible={achievementModalVisible}
        onRequestClose={() => setAchievementModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Animated.View style={styles.modalCard}>
            <View style={styles.modalTrophyCircle}>
              <Ionicons name="trophy" size={42} color="#ffe8c4" />
            </View>
            <Text style={styles.modalTitle}>{ACHIEVEMENT_SUBTITLE}</Text>
            <Text style={styles.modalSubtitle}>
              Logro desbloqueado en {LEVEL_LABEL}
            </Text>
            <View style={styles.modalXpPill}>
              <Text style={styles.modalXpText}>+{XP_ON_ACHIEVEMENT} XP</Text>
            </View>
            <Pressable
              style={styles.modalButton}
              onPress={() => setAchievementModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Seguir practicando</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default B6_ComprasScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#020617",
    overflow: "hidden",
  },

  // NUEVOS fondos de bandas
  bgBandCyan: {
    position: "absolute",
    width: 520,
    height: 260,
    borderRadius: 260,
    backgroundColor: "rgba(34, 211, 238, 0.45)",
    top: -120,
    left: -160,
  },
  bgBandPink: {
    position: "absolute",
    width: 520,
    height: 260,
    borderRadius: 260,
    backgroundColor: "rgba(244, 114, 182, 0.4)",
    bottom: -140,
    right: -200,
  },
  bgBandPurple: {
    position: "absolute",
    width: 420,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(129, 140, 248, 0.46)",
    top: 220,
    right: -160,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  heroContainer: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: "rgba(15, 23, 42, 0.96)",
    overflow: "hidden",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(94, 234, 212, 0.85)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 10,
  },
  heroGlowBlob: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: "rgba(56, 189, 248, 0.32)",
    top: -80,
    right: -40,
  },
  heroGlowBlobSecondary: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(244, 114, 182, 0.3)",
    bottom: -70,
    left: -40,
  },
  heroContent: {
    position: "relative",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(5, 150, 105, 0.9)",
    color: "#ecfdf5",
    fontSize: 12,
    fontWeight: "700",
  },
  heroPill: {
    marginLeft: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(30, 64, 175, 0.9)",
  },
  heroPillText: {
    marginLeft: 4,
    fontSize: 11,
    color: "#e5e7ff",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#f9fafb",
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(226, 232, 255, 0.95)",
    marginBottom: 14,
  },
  heroChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  } as any,
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 255, 0.65)",
    marginRight: 8,
    marginTop: 4,
  },
  chipText: {
    color: "#e5e7ff",
    fontSize: 12,
    marginLeft: 6,
  },
  receiptRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 8,
  } as any,
  receiptTag: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.5)",
  },
  receiptText: {
    marginLeft: 4,
    fontSize: 11,
    color: "#fffbeb",
  },
  heroFloatingBadge: {
    position: "absolute",
    right: 4,
    top: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: "#f9fafb",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  heroFloatingText: {
    marginLeft: 6,
    fontSize: 11,
    fontWeight: "700",
    color: "#0f172a",
  },

  sectionCard: {
    backgroundColor: "rgba(15, 23, 42, 0.98)",
    borderRadius: 22,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.7)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 6,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f9fafb",
  },
  sectionPill: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(96, 165, 250, 0.7)",
  },
  sectionPillSoft: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(248, 250, 252, 0.35)",
  },
  sectionPillText: {
    marginLeft: 4,
    fontSize: 11,
    color: "#e5e7ff",
  },
  sectionIntro: {
    fontSize: 13,
    color: "rgba(203, 213, 255, 0.92)",
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 13,
    color: "rgba(226, 232, 255, 0.95)",
    lineHeight: 20,
    marginBottom: 4,
  },
  sectionHintText: {
    fontSize: 12,
    color: "rgba(191, 219, 254, 0.95)",
    marginBottom: 6,
  },
  jpHighlight: {
    color: "#a5f3fc",
    fontWeight: "700",
  },
  inlineExampleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 4,
  },
  inlineJp: {
    flex: 1,
    fontSize: 14,
    color: "#e5e7ff",
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(165, 243, 252, 0.6)",
    marginLeft: 8,
  },
  infoTagRow: {
    marginTop: 8,
    flexDirection: "row",
  },
  infoTag: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "rgba(49, 46, 129, 0.92)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  infoTagLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#c4b5fd",
    marginBottom: 2,
  },
  infoTagText: {
    fontSize: 12,
    color: "#ede9fe",
  },
  vocabRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: "rgba(15, 23, 42, 0.97)",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(55, 65, 194, 0.85)",
  },
  vocabRowActive: {
    backgroundColor: "rgba(8, 47, 73, 0.98)",
    borderColor: "rgba(34, 211, 238, 0.95)",
  },
  vocabIndexTag: {
    marginRight: 8,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 255, 0.7)",
  },
  vocabIndexText: {
    fontSize: 10,
    color: "#a5b4fc",
    fontWeight: "600",
  },
  vocabTextBlock: {
    flex: 1,
  },
  vocabJp: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e0f2fe",
  },
  vocabEs: {
    fontSize: 13,
    color: "rgba(191, 219, 254, 0.95)",
  },
  vocabHint: {
    fontSize: 11,
    color: "rgba(148, 163, 255, 0.9)",
    marginTop: 2,
  },
  vocabIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "rgba(248, 250, 252, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  exampleRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(30, 64, 175, 0.4)",
  },
  exampleTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  exampleJp: {
    flex: 1,
    fontSize: 14,
    color: "#e5e7ff",
  },
  exampleEs: {
    marginTop: 4,
    fontSize: 12,
    color: "rgba(191, 219, 254, 0.95)",
  },
  quizCard: {
    marginTop: 8,
    borderRadius: 20,
    backgroundColor: "rgba(15, 23, 42, 0.97)",
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(76, 81, 191, 0.9)",
  },
  quizCardAlt: {
    marginTop: 8,
    borderRadius: 20,
    backgroundColor: "rgba(24, 24, 58, 0.98)",
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.7)",
  },
  quizHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  quizBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#bbf7d0",
    backgroundColor: "rgba(22, 101, 52, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  quizBadgeAlt: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffe4e6",
    backgroundColor: "rgba(159, 18, 57, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  quizProgress: {
    marginLeft: "auto",
    fontSize: 12,
    color: "rgba(191, 219, 254, 0.95)",
  },
  quizPrompt: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e7ff",
    marginBottom: 6,
  },
  quizHint: {
    fontSize: 12,
    color: "rgba(165, 180, 252, 0.95)",
    marginBottom: 8,
  },
  quizOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(55, 65, 194, 0.8)",
    marginBottom: 6,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
  },
  quizOptionSelected: {
    borderColor: "rgba(96, 165, 250, 1)",
    backgroundColor: "rgba(30, 64, 175, 0.9)",
  },
  quizOptionSelectedAlt: {
    borderColor: "rgba(244, 114, 182, 0.9)",
    backgroundColor: "rgba(131, 24, 67, 0.9)",
  },
  quizOptionCorrect: {
    borderColor: "#22c55e",
    backgroundColor: "rgba(22, 163, 74, 0.95)",
  },
  quizOptionWrong: {
    borderColor: "#fb7185",
    backgroundColor: "rgba(127, 29, 29, 0.95)",
  },
  quizOptionText: {
    fontSize: 13,
    color: "#e5e7ff",
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  feedbackIcon: {
    marginRight: 6,
  },
  feedbackText: {
    fontSize: 12,
  },
  feedbackTextCorrect: {
    color: "#bbf7d0",
  },
  feedbackTextWrong: {
    color: "#fecaca",
  },
  quizExplanationBox: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.6)",
  },
  quizExplanationTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#bbf7d0",
    marginBottom: 2,
  },
  quizExplanationText: {
    fontSize: 12,
    color: "rgba(220, 252, 231, 0.95)",
  },
  nextButton: {
    marginTop: 10,
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#22c55e",
  },
  nextButtonAlt: {
    marginTop: 10,
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#f97316",
  },
  nextButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#020617",
  },
  gameCompletedTag: {
    marginTop: 6,
    fontSize: 12,
    color: "#bbf7d0",
  },
  gameCompletedTagAlt: {
    marginTop: 6,
    fontSize: 12,
    color: "#fed7aa",
  },
  gamesSummaryRow: {
    marginTop: 10,
    flexDirection: "row",
  },
  gamesSummaryPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(15, 23, 42, 0.97)",
    borderWidth: 1,
    borderColor: "rgba(129, 230, 217, 0.6)",
  },
  gamesSummaryText: {
    marginLeft: 6,
    fontSize: 12,
    color: "rgba(226, 232, 255, 0.95)",
  },
  kanjiGrid: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  kanjiCard: {
    width: "48%",
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: "rgba(15, 23, 42, 0.98)",
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 255, 0.75)",
  },
  kanjiImageWrapper: {
    height: 90,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  kanjiImage: {
    width: "100%",
    height: "100%",
  },
  kanjiOverlay: {
    position: "absolute",
    bottom: 6,
    right: 8,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  kanjiChar: {
    fontSize: 16,
    fontWeight: "800",
    color: "#f9f9ff",
  },
  kanjiMetaRow: {
    marginTop: 6,
  },
  kanjiReading: {
    fontSize: 12,
    color: "#bfdbfe",
  },
  kanjiMeaning: {
    fontSize: 11,
    color: "rgba(209, 213, 219, 0.95)",
  },
  bottomHud: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    borderRadius: 999,
    backgroundColor: "rgba(15, 23, 42, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 255, 0.7)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  bottomHudRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bottomHudLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  bottomHudText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#e5e7ff",
  },
  bottomHudChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: "#facc15",
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  bottomHudChipText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#020617",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    borderRadius: 24,
    backgroundColor: "rgba(15, 23, 42, 0.98)",
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "rgba(250, 204, 21, 0.6)",
    alignItems: "center",
  },
  modalTrophyCircle: {
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: "rgba(120, 53, 15, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fef9c3",
    textAlign: "center",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "rgba(254, 243, 199, 0.9)",
    marginBottom: 10,
    textAlign: "center",
  },
  modalXpPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#facc15",
    marginBottom: 14,
  },
  modalXpText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0b1020",
  },
  modalButton: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: "#22c55e",
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0b1020",
  },
});
