// src/screens/B6_Hotel.tsx

/**
 * Metadatos de la pantalla
 *
 * Nivel/etiqueta: N5
 * Tema: Hotel – reservar habitación, noches, días, pedir servicios
 * Ruta/Navegación (screenKey): B6_Hotel
 * Título visible (hero): Estancia en hotel
 * Logro al éxito (idempotente): hotel_basico_n5
 * Subtítulo/Nombre del logro: Hotel y estancia (N5)
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

const SCREEN_KEY = "B6_Hotel";
const LEVEL_LABEL = "N5";
const ACHIEVEMENT_ID = "hotel_basico_n5";
const ACHIEVEMENT_SUBTITLE = "Hotel y estancia (N5)";
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

/** 12 vocabularios clave sobre HOTEL (N5) */
const vocabList: VocabItem[] = [
  { jp: "ホテル", hint: "lugar", es: "hotel" },
  { jp: "へや", hint: "espacio", es: "habitación" },
  { jp: "シングルルーム", hint: "una cama", es: "habitación sencilla" },
  { jp: "ツインルーム", hint: "dos camas", es: "habitación doble (twin)" },
  { jp: "ひとり", hint: "cantidad", es: "una persona" },
  { jp: "ふたり", hint: "cantidad", es: "dos personas" },
  { jp: "よる", hint: "tiempo", es: "noche" },
  { jp: "なんにち", hint: "pregunta", es: "¿cuántos días?" },
  { jp: "なんぱく", hint: "pregunta", es: "¿cuántas noches?" },
  { jp: "チェックイン", hint: "acción", es: "check-in" },
  { jp: "チェックアウト", hint: "acción", es: "check-out" },
  { jp: "よやく", hint: "acción", es: "reserva" },
];

/** 14 ejemplos – frases de hotel muy simples */
const exampleList: ExampleItem[] = [
  { jp: "ホテルをよやくしたいです。", es: "Quiero reservar un hotel." },
  { jp: "シングルルームをよやくしたいです。", es: "Quiero reservar una habitación sencilla." },
  { jp: "ツインルームをよやくしたいです。", es: "Quiero reservar una habitación doble (twin)." },
  { jp: "ひとりです。", es: "Es para una persona." },
  { jp: "ふたりです。", es: "Es para dos personas." },
  { jp: "三ぱくおねがいします。", es: "Tres noches, por favor." },
  { jp: "なんぱくですか。", es: "¿Cuántas noches?" },
  { jp: "なんにちとまりますか。", es: "¿Cuántos días se queda?" },
  { jp: "きょうチェックインしたいです。", es: "Quiero hacer check-in hoy." },
  { jp: "あしたチェックアウトします。", es: "Hago check-out mañana." },
  { jp: "へやは八かいです。", es: "La habitación está en el octavo piso." },
  { jp: "へやにタオルはありますか。", es: "¿Hay toallas en la habitación?" },
  { jp: "ちょうしょくはなんじからですか。", es: "¿Desde qué hora es el desayuno?" },
  { jp: "エレベーターはどこですか。", es: "¿Dónde está el ascensor?" },
];

/** 7 preguntas – Juego A (frase correcta hotel) */
const gameAQuestions: ChoiceQuestion[] = [
  {
    id: "qa1",
    prompt: "Quieres decir: “Quiero reservar una habitación sencilla”.",
    hint: "シングルルーム + をよやくしたいです。",
    options: [
      "シングルルームをよやくしたいです。",
      "シングルルームでよやくしたいです。",
      "シングルルームはよやくしますか。",
    ],
    correctOption: "シングルルームをよやくしたいです。",
    explanation:
      "Usamos をよやくしたいです para “quiero reservar ~”. El objeto lleva を.",
  },
  {
    id: "qa2",
    prompt: "Quieres decir: “Es para dos personas”.",
    hint: "Número + です。",
    options: ["ふたりです。", "ふたつです。", "にんです。"],
    correctOption: "ふたりです。",
    explanation:
      "ふたり es la forma especial para “dos personas”. ふたつ es para cosas.",
  },
  {
    id: "qa3",
    prompt: "Quieres decir: “Tres noches, por favor”.",
    hint: "三ぱく + おねがいします。",
    options: [
      "三ぱくおねがいします。",
      "三にちおねがいします。",
      "三じかんおねがいします。",
    ],
    correctOption: "三ぱくおねがいします。",
    explanation:
      "ぱく (泊) se usa para contar noches de estancia en hotel.",
  },
  {
    id: "qa4",
    prompt: "Quieres decir: “Quiero hacer check-in hoy”.",
    hint: "きょう + チェックインしたいです。",
    options: [
      "きょうチェックインしたいです。",
      "あしたチェックインしたいです。",
      "きょうチェックアウトしたいです。",
    ],
    correctOption: "きょうチェックインしたいです。",
    explanation:
      "チェックイン = entrar al hotel. チェックアウト = salir del hotel.",
  },
  {
    id: "qa5",
    prompt: "Quieres decir: “¿Cuántas noches?”",
    hint: "Frase corta, solo la pregunta.",
    options: [
      "なんぱくですか。",
      "なんにちですか。",
      "なんじですか。",
    ],
    correctOption: "なんぱくですか。",
    explanation:
      "ぱく (泊) es para noches de hotel. にち es días, じ es hora.",
  },
  {
    id: "qa6",
    prompt: "Quieres decir: “¿Cuántos días se queda?”",
    hint: "なんにち + とまりますか。",
    options: [
      "なんにちとまりますか。",
      "なんぱくとまりますか。",
      "なんじとまりますか。",
    ],
    correctOption: "なんにちとまりますか。",
    explanation:
      "とまります se usa para “quedarse (hospedarse)”. にち cuenta días.",
  },
  {
    id: "qa7",
    prompt: "Quieres decir: “¿Dónde está el ascensor?”",
    hint: "エレベーターは + どこですか。",
    options: [
      "エレベーターはどこですか。",
      "エレベーターはいくらですか。",
      "エレベーターをください。",
    ],
    correctOption: "エレベーターはどこですか。",
    explanation:
      "どこですか es “¿dónde está?”. いくら es precio, ください es “deme, por favor”.",
  },
];

/** 7 preguntas – Juego B (significado de frases de hotel) */
const gameBQuestions: MeaningQuestion[] = [
  {
    id: "qb1",
    jp: "ホテルをよやくしたいです。",
    esCorrect: "Quiero reservar un hotel.",
    esOptions: [
      "Quiero reservar un hotel.",
      "Quiero salir del hotel.",
      "Quiero trabajar en el hotel.",
    ],
    hint: "よやくしたいです = quiero reservar.",
  },
  {
    id: "qb2",
    jp: "ふたりです。",
    esCorrect: "Es para dos personas.",
    esOptions: [
      "Es para dos personas.",
      "Son dos noches.",
      "Son dos horas.",
    ],
    hint: "〜たり se usa para contar personas especiales (ひとり, ふたり).",
  },
  {
    id: "qb3",
    jp: "なんぱくですか。",
    esCorrect: "¿Cuántas noches?",
    esOptions: [
      "¿Cuántas noches?",
      "¿Cuántos días?",
      "¿Qué hora es?",
    ],
    hint: "ぱく = noches de hotel.",
  },
  {
    id: "qb4",
    jp: "あしたチェックアウトします。",
    esCorrect: "Hago check-out mañana.",
    esOptions: [
      "Hago check-out mañana.",
      "Hago check-in mañana.",
      "Reservo mañana.",
    ],
    hint: "チェックアウト = salida, チェックイン = entrada.",
  },
  {
    id: "qb5",
    jp: "へやは八かいです。",
    esCorrect: "La habitación está en el octavo piso.",
    esOptions: [
      "La habitación está en el octavo piso.",
      "La habitación está en el octavo día.",
      "La habitación cuesta ocho yenes.",
    ],
    hint: "かい = piso (planta).",
  },
  {
    id: "qb6",
    jp: "へやにタオルはありますか。",
    esCorrect: "¿Hay toallas en la habitación?",
    esOptions: [
      "¿Hay toallas en la habitación?",
      "¿Hay habitaciones sin toallas?",
      "¿Puedo comprar toallas fuera del hotel?",
    ],
    hint: "ありますか = ¿hay ~?",
  },
  {
    id: "qb7",
    jp: "ちょうしょくはなんじからですか。",
    esCorrect: "¿Desde qué hora es el desayuno?",
    esOptions: [
      "¿Desde qué hora es el desayuno?",
      "¿Cuánto cuesta el desayuno?",
      "¿Dónde está el desayuno?",
    ],
    hint: "なんじ = qué hora, から = desde.",
  },
];

/** 12 kanji relacionados con hotel / estancia */
const kanjiItems: KanjiItem[] = [
  { hex: "5bbf", char: "宿", reading: "やど", meaning: "alojamiento / posada" },
  { hex: "9928", char: "館", reading: "かん", meaning: "edificio / pabellón" },
  { hex: "5ba4", char: "室", reading: "しつ / へや", meaning: "habitación" },
  { hex: "90e8", char: "部", reading: "ぶ", meaning: "parte / sección" },
  { hex: "591c", char: "夜", reading: "よる", meaning: "noche" },
  { hex: "65e5", char: "日", reading: "ひ / にち", meaning: "día" },
  { hex: "4eba", char: "人", reading: "ひと", meaning: "persona" },
  { hex: "5165", char: "入", reading: "い(る)", meaning: "entrar" },
  { hex: "51fa", char: "出", reading: "で(る)", meaning: "salir" },
  { hex: "968e", char: "階", reading: "かい", meaning: "piso / planta" },
  { hex: "4e2d", char: "中", reading: "なか", meaning: "dentro / medio" },
  { hex: "53e3", char: "口", reading: "ぐち / くち", meaning: "entrada / boca" },
];

const kanjiImages: Record<string, any> = {
  "5bbf": require("../../assets/kanjivg/n5/5bbf_nums.webp"),
  "9928": require("../../assets/kanjivg/n5/9928_nums.webp"),
  "5ba4": require("../../assets/kanjivg/n5/5ba4_nums.webp"),
  "90e8": require("../../assets/kanjivg/n5/90e8_nums.webp"),
  "591c": require("../../assets/kanjivg/n5/591c_nums.webp"),
  "65e5": require("../../assets/kanjivg/n5/65e5_nums.webp"),
  "4eba": require("../../assets/kanjivg/n5/4eba_nums.webp"),
  "5165": require("../../assets/kanjivg/n5/5165_nums.webp"),
  "51fa": require("../../assets/kanjivg/n5/51fa_nums.webp"),
  "968e": require("../../assets/kanjivg/n5/968e_nums.webp"),
  "4e2d": require("../../assets/kanjivg/n5/4e2d_nums.webp"),
  "53e3": require("../../assets/kanjivg/n5/53e3_nums.webp"),
};

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const B6_HotelScreen: React.FC = () => {
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

  // NUEVOS contadores: noches (ぱく), habitaciones, personas
  const [nightCount, setNightCount] = useState(1);
  const [roomCount, setRoomCount] = useState(1);
  const [personCount, setPersonCount] = useState(1);

  const achievementGivenRef = useRef(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const heroGlow = useRef(new Animated.Value(0)).current;
  const heroFloat = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;
  const hudSpring = useRef(new Animated.Value(0)).current;

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
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(heroFloat, {
          toValue: 0,
          duration: 2000,
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

  // helpers para contadores
  const safeInc = (value: number, max: number = 10) =>
    value >= max ? max : value + 1;
  const safeDec = (value: number, min: number = 1) =>
    value <= min ? min : value - 1;

  const personLabelJp = useMemo(() => {
    if (personCount === 1) return "ひとり";
    if (personCount === 2) return "ふたり";
    return `${personCount}にん`;
  }, [personCount]);

  const nightLabelJp = useMemo(
    () => `${nightCount}ぱく`,
    [nightCount]
  );

  const sampleRequestPhrase = useMemo(
    () => `${personLabelJp}、${nightLabelJp}おねがいします。`,
    [personLabelJp, nightLabelJp]
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
        // manejar error si quieres
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
      outputRange: [0.35, 0.9],
    }),
    transform: [
      {
        scale: heroGlow.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.08],
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
          outputRange: [1, 0.95],
          extrapolate: "clamp",
        }),
      },
    ],
    opacity: scrollY.interpolate({
      inputRange: [0, 120],
      outputRange: [1, 0.78],
      extrapolate: "clamp",
    }),
  };

  const heroFloatStyle = {
    transform: [
      {
        translateY: heroFloat.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -6],
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

  // Fondo animado estilo lobby de hotel (bandas suaves)
  const bgStripTopStyle = {
    opacity: bgAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.15, 0.4],
    }),
    transform: [
      {
        translateX: bgAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-40, 30],
        }),
      },
    ],
  };

  const bgStripBottomStyle = {
    opacity: bgAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.15, 0.45],
    }),
    transform: [
      {
        translateX: bgAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [40, -30],
        }),
      },
    ],
  };

  const bgCircleStyle = {
    opacity: bgAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.12, 0.38],
    }),
    transform: [
      {
        translateY: bgAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, -20],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Fondo animado estilo lobby de hotel nocturno */}
      <View style={styles.backgroundLayer}>
        <Animated.View style={[styles.bgStripTop, bgStripTopStyle]} />
        <Animated.View style={[styles.bgStripBottom, bgStripBottomStyle]} />
        <Animated.View style={[styles.bgCircle, bgCircleStyle]} />
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
                <Ionicons name="bed-outline" size={14} color="#f9a8d4" />
                <Text style={styles.heroPillText}>Kyoto Hotel – Stay</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>Estancia en hotel</Text>
            <Text style={styles.heroSubtitle}>
              Aprende a reservar habitación, decir cuántas noches y hacer
              preguntas básicas para disfrutar tu hotel en Japón.
            </Text>

            <View style={styles.heroChipsRow}>
              <View style={styles.chip}>
                <Ionicons name="calendar-outline" size={16} color="#a5f3fc" />
                <Text style={styles.chipText}>Noches y días</Text>
              </View>
              <View style={styles.chip}>
                <Ionicons name="person-outline" size={16} color="#f9a8d4" />
                <Text style={styles.chipText}>ひとり・ふたり</Text>
              </View>
              <View style={styles.chip}>
                <Ionicons name="key-outline" size={16} color="#fde68a" />
                <Text style={styles.chipText}>へや・チェックイン</Text>
              </View>
            </View>

            <Animated.View style={[styles.heroFloatingBadge, heroFloatStyle]}>
              <Ionicons name="moon-outline" size={18} color="#0f172a" />
              <Text style={styles.heroFloatingText}>やさしいホテル日本語</Text>
            </Animated.View>
          </View>
        </Animated.View>

        {/* 1. Explicación básica */}
        <Animated.View style={[styles.sectionCard, sectionAnimatedStyle]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>1. Explicación básica</Text>
            <View style={styles.sectionPill}>
              <Ionicons name="sparkles-outline" size={14} color="#bae6fd" />
              <Text style={styles.sectionPillText}>Modo súper fácil</Text>
            </View>
          </View>

          <Text style={styles.sectionIntro}>
            En el hotel usamos frases cortas: primero dices qué quieres
            reservar, cuántas personas y cuántas noches.
          </Text>

          <Text style={styles.sectionText}>
            Para reservar usamos{" "}
            <Text style={styles.jpHighlight}>よやくしたいです</Text> (“quiero
            reservar”).
          </Text>

          <View style={styles.inlineExampleRow}>
            <Text style={styles.inlineJp}>
              シングルルームをよやくしたいです。
            </Text>
            <Pressable
              style={styles.iconButton}
              onPress={() =>
                speakJapanese("シングルルームをよやくしたいです。")
              }
            >
              <Ionicons name="volume-high-outline" size={18} color="#c4fff3" />
            </Pressable>
          </View>
          <Text style={styles.sectionHintText}>
            “Quiero reservar una habitación sencilla.”
          </Text>

          <Text style={styles.sectionText}>
            Para decir cuántas personas usamos{" "}
            <Text style={styles.jpHighlight}>ひとり</Text> (una persona) y{" "}
            <Text style={styles.jpHighlight}>ふたり</Text> (dos personas).
          </Text>

          <View style={styles.inlineExampleRow}>
            <Text style={styles.inlineJp}>ふたりです。</Text>
            <Pressable
              style={styles.iconButton}
              onPress={() => speakJapanese("ふたりです。")}
            >
              <Ionicons name="volume-high-outline" size={18} color="#c4fff3" />
            </Pressable>
          </View>
          <Text style={styles.sectionHintText}>
            “Es para dos personas.” Muy útil al hacer check-in.
          </Text>

          <Text style={styles.sectionText}>
            Para noches del hotel usamos{" "}
            <Text style={styles.jpHighlight}>〜ぱく</Text> (泊).
          </Text>
          <Text style={styles.sectionText}>
            <Text style={styles.jpHighlight}>なんぱくですか。</Text> = “¿cuántas
            noches?”.
          </Text>

          <View style={styles.inlineExampleRow}>
            <Text style={styles.inlineJp}>三ぱくおねがいします。</Text>
            <Pressable
              style={styles.iconButton}
              onPress={() => speakJapanese("三ぱくおねがいします。")}
            >
              <Ionicons name="volume-high-outline" size={18} color="#c4fff3" />
            </Pressable>
          </View>
          <Text style={styles.sectionHintText}>
            “Tres noches, por favor.” Usa おねがいします para pedir amablemente.
          </Text>

          <View style={styles.infoTagRow}>
            <View style={styles.infoTag}>
              <Text style={styles.infoTagLabel}>TIP</Text>
              <Text style={styles.infoTagText}>
                Para la estancia completa piensa:{" "}
                <Text style={styles.jpHighlight}>
                  よやく → ひとり / ふたり → なんぱく
                </Text>{" "}
                y luego preguntas por{" "}
                <Text style={styles.jpHighlight}>チェックイン</Text> y{" "}
                <Text style={styles.jpHighlight}>チェックアウト</Text>.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* 2. Tu estancia – contadores */}
        <Animated.View style={[styles.sectionCard, sectionAnimatedStyle]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>2. Tu estancia – Contadores</Text>
            <View style={styles.sectionPillSoft}>
              <Ionicons name="stats-chart-outline" size={14} color="#a5f3fc" />
              <Text style={styles.sectionPillText}>Noches・personas・habitaciones</Text>
            </View>
          </View>

          <Text style={styles.sectionIntro}>
            Ajusta cuántas noches, cuántas personas y cuántas habitaciones.
            Luego escucha una frase modelo lista para decir en recepción.
          </Text>

          {/* Contador de personas */}
          <View style={styles.counterBlock}>
            <View style={styles.counterHeaderRow}>
              <Text style={styles.counterLabelJp}>人数（にんずう）</Text>
              <Text style={styles.counterLabelEs}>Personas</Text>
            </View>
            <View style={styles.counterRow}>
              <Pressable
                style={styles.counterButton}
                onPress={() => setPersonCount((v) => safeDec(v))}
              >
                <Ionicons name="remove" size={18} color="#e5e7eb" />
              </Pressable>
              <View style={styles.counterValueBox}>
                <Text style={styles.counterValueNumber}>{personCount}</Text>
                <Text style={styles.counterValueJp}>{personLabelJp}</Text>
              </View>
              <Pressable
                style={styles.counterButton}
                onPress={() => setPersonCount((v) => safeInc(v))}
              >
                <Ionicons name="add" size={18} color="#e5e7eb" />
              </Pressable>
            </View>
          </View>

          {/* Contador de noches */}
          <View style={styles.counterBlock}>
            <View style={styles.counterHeaderRow}>
              <Text style={styles.counterLabelJp}>泊（ぱく）</Text>
              <Text style={styles.counterLabelEs}>Noches de hotel</Text>
            </View>
            <View style={styles.counterRow}>
              <Pressable
                style={styles.counterButton}
                onPress={() => setNightCount((v) => safeDec(v))}
              >
                <Ionicons name="remove" size={18} color="#e5e7eb" />
              </Pressable>
              <View style={styles.counterValueBox}>
                <Text style={styles.counterValueNumber}>{nightCount}</Text>
                <Text style={styles.counterValueJp}>{nightLabelJp}</Text>
              </View>
              <Pressable
                style={styles.counterButton}
                onPress={() => setNightCount((v) => safeInc(v))}
              >
                <Ionicons name="add" size={18} color="#e5e7eb" />
              </Pressable>
            </View>
          </View>

          {/* Contador de habitaciones */}
          <View style={styles.counterBlock}>
            <View style={styles.counterHeaderRow}>
              <Text style={styles.counterLabelJp}>へや</Text>
              <Text style={styles.counterLabelEs}>Habitaciones</Text>
            </View>
            <View style={styles.counterRow}>
              <Pressable
                style={styles.counterButton}
                onPress={() => setRoomCount((v) => safeDec(v))}
              >
                <Ionicons name="remove" size={18} color="#e5e7eb" />
              </Pressable>
              <View style={styles.counterValueBox}>
                <Text style={styles.counterValueNumber}>{roomCount}</Text>
                <Text style={styles.counterValueJp}>へや</Text>
              </View>
              <Pressable
                style={styles.counterButton}
                onPress={() => setRoomCount((v) => safeInc(v))}
              >
                <Ionicons name="add" size={18} color="#e5e7eb" />
              </Pressable>
            </View>
          </View>

          {/* Frase modelo usando los contadores */}
          <View style={styles.counterPhraseBox}>
            <Text style={styles.counterPhraseLabel}>
              Frase modelo para recepción:
            </Text>
            <View style={styles.counterPhraseRow}>
              <Text style={styles.counterPhraseJp}>{sampleRequestPhrase}</Text>
              <Pressable
                style={styles.iconButton}
                onPress={() => speakJapanese(sampleRequestPhrase)}
              >
                <Ionicons
                  name="volume-high-outline"
                  size={18}
                  color="#c4fff3"
                />
              </Pressable>
            </View>
            <Text style={styles.counterPhraseEs}>
              “Es para {personCount} persona(s), {nightCount} noche(s), por
              favor.”
            </Text>
          </View>
        </Animated.View>

        {/* 3. Vocabulario clave */}
        <Animated.View style={[styles.sectionCard, sectionAnimatedStyle]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>3. Vocabulario clave</Text>
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

        {/* 4. Ejemplos */}
        <Animated.View style={[styles.sectionCard, sectionAnimatedStyle]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>4. Escenas en el hotel</Text>
            <View style={styles.sectionPill}>
              <Ionicons name="walk-outline" size={14} color="#bbf7d0" />
              <Text style={styles.sectionPillText}>Mini escenas</Text>
            </View>
          </View>
          <Text style={styles.sectionIntro}>
            Imagina que estás en el lobby. Usa estas frases para hablar con la
            recepción.
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

        {/* 5. Juego A */}
        <Animated.View style={[styles.sectionCard, sectionAnimatedStyle]}>
          <Text style={styles.sectionTitle}>5. Juego A – Frase correcta</Text>
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

        {/* 6. Juego B */}
        <Animated.View style={[styles.sectionCard, sectionAnimatedStyle]}>
          <Text style={styles.sectionTitle}>6. Juego B – Significado</Text>
          <Text style={styles.sectionIntro}>
            Escucha la frase y elige la traducción correcta en español.
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

        {/* 7. Kanji de hotel */}
        <Animated.View style={[styles.sectionCard, sectionAnimatedStyle]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>7. Kanji de hotel – Trazos</Text>
            <View style={styles.sectionPillSoft}>
              <Ionicons name="pencil-outline" size={14} color="#bfdbfe" />
              <Text style={styles.sectionPillText}>Caligrafía</Text>
            </View>
          </View>

          <Text style={styles.sectionIntro}>
            Estos kanji aparecen en nombres de hoteles, tipos de habitación,
            pisos y entradas.
          </Text>

          <Text style={styles.sectionText}>
            <Text style={styles.jpHighlight}>宿（やど）</Text> – alojamiento,{" "}
            <Text style={styles.jpHighlight}>館（かん）</Text> – edificio,{" "}
            <Text style={styles.jpHighlight}>室（しつ / へや）</Text> – cuarto.
          </Text>
          <Text style={styles.sectionHintText}>
            階（かい） se usa para los pisos del edificio. 口（ぐち） aparece en
            salidas como 北口 (salida norte).
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

      {/* HUD XP flotante */}
      <Animated.View
        style={[styles.bottomHud, { transform: hudCombinedTransform }]}
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

export default B6_HotelScreen;

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
  // Fondo tipo lobby de hotel con bandas suaves
  bgStripTop: {
    position: "absolute",
    top: -60,
    left: -80,
    width: 260,
    height: 220,
    borderRadius: 120,
    backgroundColor: "rgba(129, 140, 248, 0.4)",
  },
  bgStripBottom: {
    position: "absolute",
    bottom: -80,
    right: -60,
    width: 260,
    height: 220,
    borderRadius: 120,
    backgroundColor: "rgba(56, 189, 248, 0.4)",
  },
  bgCircle: {
    position: "absolute",
    top: 160,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(244, 114, 182, 0.36)",
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
    borderColor: "rgba(129, 140, 248, 0.9)",
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
    backgroundColor: "rgba(129, 140, 248, 0.38)",
    top: -80,
    right: -40,
  },
  heroGlowBlobSecondary: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(244, 114, 182, 0.4)",
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
    backgroundColor: "#ecfeff",
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
    borderColor: "rgba(79, 70, 229, 0.75)",
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
    backgroundColor: "rgba(30, 64, 175, 0.92)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  infoTagLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#bfdbfe",
    marginBottom: 2,
  },
  infoTagText: {
    fontSize: 12,
    color: "#e0f2fe",
  },

  /* ---- Contadores ---- */
  counterBlock: {
    marginTop: 8,
    marginBottom: 8,
    padding: 10,
    borderRadius: 18,
    backgroundColor: "rgba(15, 23, 42, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 255, 0.65)",
  },
  counterHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  counterLabelJp: {
    fontSize: 13,
    fontWeight: "700",
    color: "#bfdbfe",
  },
  counterLabelEs: {
    fontSize: 12,
    color: "rgba(209, 213, 219, 0.95)",
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(31, 41, 55, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 255, 0.7)",
  },
  counterValueBox: {
    flex: 1,
    marginHorizontal: 12,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(96, 165, 250, 0.7)",
  },
  counterValueNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#e5e7ff",
  },
  counterValueJp: {
    fontSize: 13,
    color: "#bfdbfe",
  },
  counterPhraseBox: {
    marginTop: 10,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(15, 23, 42, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(45, 212, 191, 0.6)",
  },
  counterPhraseLabel: {
    fontSize: 12,
    color: "rgba(209, 250, 229, 0.95)",
    marginBottom: 4,
  },
  counterPhraseRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  counterPhraseJp: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e7ff",
  },
  counterPhraseEs: {
    fontSize: 12,
    color: "rgba(191, 219, 254, 0.95)",
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
    borderBottomColor: "rgba(30, 64, 175, 0.45)",
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
    backgroundColor: "rgba(17, 24, 39, 0.98)",
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
    color: "#fee2e2",
    backgroundColor: "rgba(153, 27, 27, 0.9)",
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
