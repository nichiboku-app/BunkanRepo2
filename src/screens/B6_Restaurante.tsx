// src/screens/B6_Restaurante.tsx

/**
 * Metadatos de la pantalla
 *
 * Nivel/etiqueta: N5
 * Tema: Restaurante básico en Japón (pedir comida y bebida)
 * Ruta/Navegación (screenKey): B6_Restaurante
 * Título visible (hero): Restaurante en Kioto
 * Logro al éxito (idempotente): restaurante_basico_n5
 * Subtítulo/Nombre del logro: Restaurante en Japón (N5)
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

const SCREEN_KEY = "B6_Restaurante";
const LEVEL_LABEL = "N5";
const ACHIEVEMENT_ID = "restaurante_basico_n5";
const ACHIEVEMENT_SUBTITLE = "Restaurante en Japón (N5)";
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

/** Vocabulario N5 de restaurante */
const vocabList: VocabItem[] = [
  { jp: "レストラン", hint: "lugar para comer", es: "restaurante" },
  { jp: "メニュー", hint: "lista de comida", es: "menú" },
  { jp: "りょうり", hint: "platos", es: "comida, platillo" },
  { jp: "ごはん", hint: "arroz", es: "arroz (comida)" },
  { jp: "みず", hint: "bebida", es: "agua" },
  { jp: "さかな", hint: "mar", es: "pescado" },
  { jp: "にく", hint: "animal", es: "carne" },
  { jp: "おちゃ", hint: "bebida japonesa", es: "té (verde)" },
  { jp: "おいしい", hint: "sabroso", es: "rico, delicioso" },
  { jp: "まずい", hint: "opuesto de rico", es: "feo, de mal sabor" },
  { jp: "たべる", hint: "acción", es: "comer" },
  { jp: "のむ", hint: "acción", es: "beber" },
];

/** Ejemplos de frases en restaurante */
const exampleList: ExampleItem[] = [
  { jp: "すみません、メニューをください。", es: "Disculpe, el menú por favor." },
  { jp: "みずをください。", es: "Agua, por favor." },
  { jp: "さかなのりょうりをたべたいです。", es: "Quiero comer un plato de pescado." },
  { jp: "このりょうりはおいしいです。", es: "Este platillo está rico." },
  { jp: "ごはんをおねがいします。", es: "Arroz, por favor." },
  { jp: "おちゃをのみます。", es: "Bebo té." },
  { jp: "にくはちょっとたかいです。", es: "La carne es un poco cara." },
  { jp: "デザートはありますか。", es: "¿Hay postre?" },
  { jp: "レストランはとてもにぎやかです。", es: "El restaurante está muy animado." },
  { jp: "てんいんさんはやさしいです。", es: "La persona que atiende es amable." },
  { jp: "みずはむりょうですか。", es: "¿El agua es gratis?" },
  { jp: "このテーブルをつかってもいいですか。", es: "¿Puedo usar esta mesa?" },
  { jp: "すみません、ちゅうもんをおねがいします。", es: "Disculpe, quiero hacer el pedido." },
  { jp: "レジはどこですか。", es: "¿Dónde está la caja?" },
];

/** 7 preguntas Juego A – selección de frase correcta */
const gameAQuestions: ChoiceQuestion[] = [
  {
    id: "qa1",
    prompt: "Quieres pedir el menú al mesero.",
    hint: "Usa メニュー + をください。",
    options: [
      "すみません、メニューをください。",
      "メニューはどこですか。",
      "メニューをたべます。",
    ],
    correctOption: "すみません、メニューをください。",
    explanation:
      "〜をください es la forma natural para pedir un objeto: “Por favor, deme el menú”.",
  },
  {
    id: "qa2",
    prompt: "Quieres decir: “Agua, por favor”.",
    hint: "Usa みず + をください。",
    options: [
      "みずをください。",
      "みずはください。",
      "くださいみず。",
    ],
    correctOption: "みずをください。",
    explanation:
      "みずをください es la forma cortés y simple para pedir agua en el restaurante.",
  },
  {
    id: "qa3",
    prompt: "Quieres decir: “Quiero comer pescado”.",
    hint: "さかなをたべたいです。",
    options: [
      "さかなをたべたいです。",
      "さかなをのみたいです。",
      "さかなをみたいです。",
    ],
    correctOption: "さかなをたべたいです。",
    explanation: "たべたいです = quiero comer. のみたいです = quiero beber.",
  },
  {
    id: "qa4",
    prompt: "Quieres preguntar: “¿Hay postre?”.",
    hint: "デザート + はありますか。",
    options: [
      "デザートはありますか。",
      "デザートはいくらですか。",
      "デザートをくださいましたか。",
    ],
    correctOption: "デザートはありますか。",
    explanation: "ありますか = “hay…?”. Es una pregunta muy común en restaurante.",
  },
  {
    id: "qa5",
    prompt: "Quieres decir: “Este platillo está rico”.",
    hint: "このりょうりはおいしいです。",
    options: [
      "このりょうりはおいしいです。",
      "このりょうりはまずいです。",
      "このりょうりはみずです。",
    ],
    correctOption: "このりょうりはおいしいです。",
    explanation: "おいしい = rico, sabroso. まずい = de mal sabor.",
  },
  {
    id: "qa6",
    prompt: "Quieres llamar al mesero para pedir.",
    hint: "Usa すみません、ちゅうもんをおねがいします。",
    options: [
      "すみません、ちゅうもんをおねがいします。",
      "すみません、みずをいくらですか。",
      "すみません、ごはんはどこですか。",
    ],
    correctOption: "すみません、ちゅうもんをおねがいします。",
    explanation:
      "ちゅうもんをおねがいします = quiero hacer el pedido, por favor.",
  },
  {
    id: "qa7",
    prompt: "Quieres decir: “Bebo té”.",
    hint: "おちゃをのみます。",
    options: [
      "おちゃをのみます。",
      "おちゃをたべます。",
      "おちゃはいくらです。",
    ],
    correctOption: "おちゃをのみます。",
    explanation: "のみます = beber, たべます = comer.",
  },
];

/** 7 preguntas Juego B – pareo de significado */
const gameBQuestions: MeaningQuestion[] = [
  {
    id: "qb1",
    jp: "ごはんをおねがいします。",
    esCorrect: "Arroz, por favor.",
    esOptions: [
      "Arroz, por favor.",
      "Pan, por favor.",
      "Postre, por favor.",
    ],
    hint: "ごはん = arroz (comida).",
  },
  {
    id: "qb2",
    jp: "このりょうりはまずいです。",
    esCorrect: "Este platillo sabe feo.",
    esOptions: [
      "Este platillo sabe feo.",
      "Este platillo está rico.",
      "Este platillo es barato.",
    ],
    hint: "まずい = de mal sabor, おいしい = rico.",
  },
  {
    id: "qb3",
    jp: "みずはむりょうですか。",
    esCorrect: "¿El agua es gratis?",
    esOptions: [
      "¿El agua es gratis?",
      "¿Dónde está el agua?",
      "¿Cuánto cuesta el agua?",
    ],
    hint: "むりょう = gratis.",
  },
  {
    id: "qb4",
    jp: "レストランはとてもにぎやかです。",
    esCorrect: "El restaurante está muy animado.",
    esOptions: [
      "El restaurante está muy animado.",
      "El restaurante está vacío.",
      "El restaurante es muy barato.",
    ],
    hint: "にぎやか = animado, con gente y ruido.",
  },
  {
    id: "qb5",
    jp: "さかなのりょうりをたべたいです。",
    esCorrect: "Quiero comer un plato de pescado.",
    esOptions: [
      "Quiero comer un plato de pescado.",
      "Quiero beber pescado.",
      "Quiero comprar pescado.",
    ],
    hint: "さかなのりょうり = platillo de pescado.",
  },
  {
    id: "qb6",
    jp: "にくはちょっとたかいです。",
    esCorrect: "La carne es un poco cara.",
    esOptions: [
      "La carne es un poco cara.",
      "La carne es muy barata.",
      "La carne es picante.",
    ],
    hint: "たかい = caro, やすい = barato.",
  },
  {
    id: "qb7",
    jp: "すみません、メニューをください。",
    esCorrect: "Disculpe, el menú por favor.",
    esOptions: [
      "Disculpe, el menú por favor.",
      "Disculpe, la cuenta por favor.",
      "Disculpe, agua por favor.",
    ],
    hint: "メニューをください = el menú, por favor.",
  },
];

/** Kanji relevantes de comida/restaurante (N5-ish) */
const kanjiItems: KanjiItem[] = [
  { hex: "98df", char: "食", reading: "た・しょく", meaning: "comer, comida" },
  { hex: "98f2", char: "飲", reading: "の・いん", meaning: "beber" },
  { hex: "7c73", char: "米", reading: "こめ", meaning: "arroz (grano)" },
  { hex: "6c34", char: "水", reading: "みず", meaning: "agua" },
  { hex: "8089", char: "肉", reading: "にく", meaning: "carne" },
  { hex: "9b5a", char: "魚", reading: "さかな", meaning: "pez / pescado" },
  { hex: "4f11", char: "休", reading: "やす（む）", meaning: "descansar" },
  { hex: "5148", char: "先", reading: "さき / せん", meaning: "antes, punta" },
  { hex: "5348", char: "午", reading: "ご", meaning: "mediodía" },
  { hex: "534a", char: "半", reading: "はん", meaning: "mitad, media" },
];

/** Map de imágenes WebP generadas con KanjiVG */
const kanjiImages: Record<string, any> = {
  "98df": require("../../assets/kanjivg/n5/98df_nums.webp"),
  "98f2": require("../../assets/kanjivg/n5/98f2_nums.webp"),
  "7c73": require("../../assets/kanjivg/n5/7c73_nums.webp"),
  "6c34": require("../../assets/kanjivg/n5/6c34_nums.webp"),
  "8089": require("../../assets/kanjivg/n5/8089_nums.webp"),
  "9b5a": require("../../assets/kanjivg/n5/9b5a_nums.webp"),
  "4f11": require("../../assets/kanjivg/n5/4f11_nums.webp"),
  "5148": require("../../assets/kanjivg/n5/5148_nums.webp"),
  "5348": require("../../assets/kanjivg/n5/5348_nums.webp"),
  "534a": require("../../assets/kanjivg/n5/534a_nums.webp"),
};

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const B6_RestauranteScreen: React.FC = () => {
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

  const scrollY = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const heroGlow = useRef(new Animated.Value(0)).current;
  const heroFloat = useRef(new Animated.Value(0)).current;
  const hudSpring = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

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
    Animated.loop(
      Animated.sequence([
        Animated.timing(heroFloat, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(heroFloat, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [heroFloat]);

  useEffect(() => {
    Animated.spring(hudSpring, {
      toValue: 1,
      friction: 7,
      tension: 70,
      useNativeDriver: true,
    }).start();
  }, [hudSpring]);

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
        // manejo de error opcional
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

  const heroFloatStyle = {
    transform: [
      {
        translateY: heroFloat.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
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
    { translateY: hudTranslate },
    {
      scale: hudSpring.interpolate({
        inputRange: [0, 1],
        outputRange: [0.92, 1],
      }),
    },
  ];

  // Fondos animados
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
      { rotate: "16deg" },
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
      {/* Fondo animado tipo izakaya neón */}
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
                <Ionicons name="restaurant-outline" size={14} color="#e0f2fe" />
                <Text style={styles.heroPillText}>Kyoto 夜ごはん</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>Restaurante en Kioto</Text>
            <Text style={styles.heroSubtitle}>
              Aprende frases simples para pedir comida, bebida y decir si algo
              está rico o no en un restaurante japonés.
            </Text>

            <View style={styles.heroChipsRow}>
              <View style={styles.chip}>
                <Ionicons name="fast-food-outline" size={16} color="#fbbf24" />
                <Text style={styles.chipText}>Pedido fácil</Text>
              </View>
              <View style={styles.chip}>
                <Ionicons name="water-outline" size={16} color="#bae6fd" />
                <Text style={styles.chipText}>Bebidas & agua</Text>
              </View>
              <View style={styles.chip}>
                <Ionicons name="sparkles-outline" size={16} color="#f9a8d4" />
                <Text style={styles.chipText}>Kanji de comida</Text>
              </View>
            </View>

            <Animated.View style={[styles.heroFloatingBadge, heroFloatStyle]}>
              <Ionicons name="receipt-outline" size={18} color="#0f172a" />
              <Text style={styles.heroFloatingText}>注文（ちゅうもん） listo</Text>
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
            Estás en un restaurante en Kioto. Hay faroles rojos, olor a ramen y
            mucha gente. Vamos a usar frases muy cortas para pedir.
          </Text>

          <Text style={styles.sectionText}>
            {"• "}Para pedir algo usamos{" "}
            <Text style={styles.jpHighlight}>〜をください</Text> o{" "}
            <Text style={styles.jpHighlight}>〜をおねがいします</Text>.
          </Text>
          <View style={styles.inlineExampleRow}>
            <Text style={styles.inlineJp}>みずをください。</Text>
            <Pressable
              style={styles.iconButton}
              onPress={() => speakJapanese("みずをください。")}
            >
              <Ionicons name="volume-high-outline" size={18} color="#c4fff3" />
            </Pressable>
          </View>
          <Text style={styles.sectionHintText}>“Agua, por favor”.</Text>

          <Text style={styles.sectionText}>
            {"• "}Para decir que algo está rico usamos{" "}
            <Text style={styles.jpHighlight}>おいしい</Text>, y si sabe feo{" "}
            <Text style={styles.jpHighlight}>まずい</Text>.
          </Text>
          <View style={styles.inlineExampleRow}>
            <Text style={styles.inlineJp}>このりょうりはおいしいです。</Text>
            <Pressable
              style={styles.iconButton}
              onPress={() =>
                speakJapanese("このりょうりはおいしいです。")
              }
            >
              <Ionicons name="volume-high-outline" size={18} color="#c4fff3" />
            </Pressable>
          </View>
          <Text style={styles.sectionHintText}>
            “Este platillo está rico”.
          </Text>

          <Text style={styles.sectionText}>
            {"• "}Para decir que quieres comer algo usamos{" "}
            <Text style={styles.jpHighlight}>〜をたべたいです</Text>.
          </Text>
          <View style={styles.inlineExampleRow}>
            <Text style={styles.inlineJp}>さかなをたべたいです。</Text>
            <Pressable
              style={styles.iconButton}
              onPress={() => speakJapanese("さかなをたべたいです。")}
            >
              <Ionicons name="volume-high-outline" size={18} color="#c4fff3" />
            </Pressable>
          </View>
          <Text style={styles.sectionHintText}>
            “Quiero comer pescado”.
          </Text>

          <View style={styles.infoTagRow}>
            <View style={styles.infoTag}>
              <Text style={styles.infoTagLabel}>TIP</Text>
              <Text style={styles.infoTagText}>
                Di{" "}
                <Text style={styles.jpHighlight}>
                  すみません
                </Text>{" "}
                al inicio para llamar al mesero de forma muy cortés.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* 2. Vocabulario clave */}
        <Animated.View style={[styles.sectionCard, sectionAnimatedStyle]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>2. Vocabulario clave</Text>
            <View className="sectionPillSoft" style={styles.sectionPillSoft}>
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
            <Text style={styles.sectionTitle}>3. Escenas en el restaurante</Text>
            <View style={styles.sectionPill}>
              <Ionicons name="walk-outline" size={14} color="#bbf7d0" />
              <Text style={styles.sectionPillText}>Mini diálogos</Text>
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
          <Text style={styles.sectionTitle}>4. Juego A – Frase correcta</Text>
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
          <Text style={styles.sectionTitle}>5. Juego B – Significado</Text>
          <Text style={styles.sectionIntro}>
            Escucha la frase en japonés y elige la traducción correcta.
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

        {/* 6. Kanji de comida */}
        <Animated.View style={[styles.sectionCard, sectionAnimatedStyle]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>6. Kanji de comida – Trazos</Text>
            <View style={styles.sectionPillSoft}>
              <Ionicons name="pencil-outline" size={14} color="#bfdbfe" />
              <Text style={styles.sectionPillText}>Caligrafía</Text>
            </View>
          </View>

          <Text style={styles.sectionIntro}>
            Estos kanji aparecen en menús, letreros y horas de comida. Fondo
            blanco, trazos en blanco estilo cuaderno japonés.
          </Text>

          <Text style={styles.sectionText}>
            <Text style={styles.jpHighlight}>食（しょく・た）</Text> – comer,{" "}
            <Text style={styles.jpHighlight}>飲（いん・の）</Text> – beber,{" "}
            <Text style={styles.jpHighlight}>水（みず）</Text> – agua.
          </Text>

          <Text style={styles.sectionHintText}>
            Usaremos las lecturas fáciles: 食べる（たべる）, 飲む（のむ）, 水（みず）,
            肉（にく）, 魚（さかな）.
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

      {/* HUD XP */}
      <Animated.View style={[styles.bottomHud, { transform: hudCombinedTransform }]}>
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

export default B6_RestauranteScreen;

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
    borderColor: "rgba(244, 114, 182, 0.75)",
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
    backgroundColor: "rgba(251, 191, 36, 0.32)",
    top: -80,
    right: -40,
  },
  heroGlowBlobSecondary: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(56, 189, 248, 0.3)",
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
