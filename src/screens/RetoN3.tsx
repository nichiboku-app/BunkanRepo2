// src/screens/RetoN3.tsx
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { questionsN3 } from '../data/Reton3leon';
import { awardAchievement } from '../services/achievements';

const { width, height } = Dimensions.get('window');

// 🦁 León base y estados
const lionBase = require('../../assets/leon/leon_normal.png');
const lionFail = require('../../assets/leon/leon_fail.png');
const lionHappy = require('../../assets/leon/leon_exito.png');

// 🦁 Frames de caminata
const lionWalkFrames = [
  require('../../assets/leon/leon_move_1.png'),
  require('../../assets/leon/leon_move_2.png'),
  require('../../assets/leon/leon_move_3.png'),
  require('../../assets/leon/leon_move_4.png'),
  require('../../assets/leon/leon_move_5.png'),
  require('../../assets/leon/leon_move_6.png'),
  require('../../assets/leon/leon_move_7.png'),
  require('../../assets/leon/leon_move_8.png'),
  require('../../assets/leon/leon_move_9.png'),
];

// Fondo y timer
const backgroundLeon = require('../../assets/leon/backgroundleon.png');
const timerLeon = require('../../assets/leon/timerleon.png');

// Música del nivel
const bgmLeon = require('../../assets/sounds/musicaleon.mp3');

type PhaseConfig = {
  id: number;
  name: string;
};

type LevelConfig = {
  id: number;
  name: string;
  phases: PhaseConfig[];
};

// ---------- CONFIG NIVELES/FASES (N3) ----------

export const LEVELS_N3: LevelConfig[] = [
  {
    id: 1,
    name: 'Nivel N3 · Aldea del León',
    phases: [
      { id: 1, name: 'Fase 1 · Vocabulario N3' },
      { id: 2, name: 'Fase 2 · Gramática N3' },
      { id: 3, name: 'Fase 3 · Lectura N3' },
      { id: 4, name: 'Fase 4 · Expresiones N3' },
      { id: 5, name: 'Fase 5 · Repaso N3' },
    ],
  },
  {
    id: 2,
    name: 'Nivel N3 · Montaña del Rugido',
    phases: [
      { id: 1, name: 'Fase 1 · Goi B' },
      { id: 2, name: 'Fase 2 · Bunpou B' },
      { id: 3, name: 'Fase 3 · Dokkai B' },
      { id: 4, name: 'Fase 4 · Escenarios B' },
      { id: 5, name: 'Fase 5 · Mezcla B' },
    ],
  },
  {
    id: 3,
    name: 'Nivel N3 · Templo del Kanji',
    phases: [
      { id: 1, name: 'Fase 1 · Kanji A' },
      { id: 2, name: 'Fase 2 · Kanji B' },
      { id: 3, name: 'Fase 3 · Kanji C' },
      { id: 4, name: 'Fase 4 · Lecturas' },
      { id: 5, name: 'Fase 5 · Repaso' },
    ],
  },
  {
    id: 4,
    name: 'Nivel N3 · Camino del León Sabio',
    phases: [
      { id: 1, name: 'Fase 1 · Escucha' },
      { id: 2, name: 'Fase 2 · Diálogos' },
      { id: 3, name: 'Fase 3 · Situaciones' },
      { id: 4, name: 'Fase 4 · Revisión' },
      { id: 5, name: 'Fase 5 · Examen Final' },
    ],
  },
];

const QUESTIONS_PER_PHASE = 10;
const TOTAL_PHASES_N3 = LEVELS_N3.reduce(
  (sum, level) => sum + level.phases.length,
  0
);

// ===================== COMPONENTE =====================

export default function RetoN3() {
  const navigation = useNavigation<any>();

  const [stars, setStars] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);

  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const [hintUses, setHintUses] = useState(0);
  const [currentHint, setCurrentHint] = useState<string | null>(null);

  const [showIntroModal, setShowIntroModal] = useState(true);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isPhaseCompleted, setIsPhaseCompleted] = useState(false);
  const [showGameCompleteModal, setShowGameCompleteModal] = useState(false);
  const [hasAwardedGameAchievement, setHasAwardedGameAchievement] =
    useState(false);

  const bgmRef = useRef<Audio.Sound | null>(null);
  const scaleHint = useRef(new Animated.Value(1)).current;
  const scaleNext = useRef(new Animated.Value(1)).current;
  const scaleEnd = useRef(new Animated.Value(1)).current;

  const [timeLeft, setTimeLeft] = useState(59 * 60);
  const [lionState, setLionState] = useState<'normal' | 'fail' | 'happy'>(
    'normal'
  );
  const [walkFrameIndex, setWalkFrameIndex] = useState(0);

  // ---------- DERIVADOS ----------

  const currentLevel = LEVELS_N3[currentLevelIndex];
  const currentPhase = currentLevel.phases[currentPhaseIndex];

  const globalPhaseIndex =
    LEVELS_N3.slice(0, currentLevelIndex).reduce(
      (sum, level) => sum + level.phases.length,
      0
    ) + currentPhaseIndex;

  const phaseStartIndex = globalPhaseIndex * QUESTIONS_PER_PHASE;
  const phaseQuestions = questionsN3.slice(
    phaseStartIndex,
    phaseStartIndex + QUESTIONS_PER_PHASE
  );

  const isGameOutOfQuestions = phaseStartIndex >= questionsN3.length;
  const currentQuestion =
    !isGameOutOfQuestions && phaseQuestions.length > 0
      ? phaseQuestions[currentQuestionIndex]
      : null;

  const totalQuestionsInPhase = phaseQuestions.length;
  const totalAnswered = correctCount + wrongCount;
  const isLastQuestionInPhase =
    totalQuestionsInPhase > 0 &&
    currentQuestionIndex === totalQuestionsInPhase - 1;

  const isLastPhaseOfGame =
    globalPhaseIndex === TOTAL_PHASES_N3 - 1 ||
    phaseStartIndex + QUESTIONS_PER_PHASE >= questionsN3.length;

  // ⏱ Cronómetro
  useEffect(() => {
    if (showGameCompleteModal) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showGameCompleteModal]);

  // 🎧 Carga BGM (una sola vez)
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { sound } = await Audio.Sound.createAsync(bgmLeon);
      if (!mounted) {
        await sound.unloadAsync();
        return;
      }
      bgmRef.current = sound;
      await sound.setIsLoopingAsync(true);
    })();

    return () => {
      mounted = false;
      if (bgmRef.current) {
        bgmRef.current.unloadAsync();
      }
    };
  }, []);

  // 🎧 Control play/pause sin recrear audio
  useEffect(() => {
    const sound = bgmRef.current;
    if (!sound) return;

    const control = async () => {
      const shouldPlay =
        !showIntroModal &&
        !showSummaryModal &&
        !showGameCompleteModal &&
        timeLeft > 0;

      const status = await sound.getStatusAsync();
      if (!status.isLoaded) return;

      if (shouldPlay) {
        if (!status.isPlaying) {
          await sound.playAsync();
        }
      } else {
        if (status.isPlaying) {
          await sound.pauseAsync();
        }
      }
    };

    control();
  }, [showIntroModal, showSummaryModal, showGameCompleteModal, timeLeft]);

  const playSound = async (file: any) => {
    const { sound } = await Audio.Sound.createAsync(file);
    await sound.playAsync();
  };

  // Si el tiempo llega a 0 → fin de fase
  useEffect(() => {
    if (timeLeft === 0 && !showSummaryModal && !showGameCompleteModal) {
      (async () => {
        setLionState('fail');
        await playSound(require('../../assets/sounds/end.mp3'));
        setIsPhaseCompleted(false);
        setShowSummaryModal(true);
      })();
    }
  }, [timeLeft, showSummaryModal, showGameCompleteModal]);

  const animateButton = (scaleRef: Animated.Value) => {
    Animated.sequence([
      Animated.spring(scaleRef, {
        toValue: 1.15,
        useNativeDriver: true,
      }),
      Animated.spring(scaleRef, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 💡 Pistas
  const handleHint = () => {
    if (hintUses >= 10 || !currentQuestion || timeLeft === 0) return;
    animateButton(scaleHint);
    playSound(require('../../assets/sounds/hint.mp3'));
    setHintUses((prev) => prev + 1);
    setCurrentHint(currentQuestion.hint);
  };

  // ⏭ NEXT
  const handleNext = () => {
    if (!selectedOption || isLastQuestionInPhase || timeLeft === 0) return;

    animateButton(scaleNext);
    playSound(require('../../assets/sounds/next.mp3'));

    if (currentQuestionIndex < totalQuestionsInPhase - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setCurrentHint(null);
      setLionState('normal');
    }
  };

  // 🔚 END
  const handleEnd = async () => {
    animateButton(scaleEnd);

    const completed =
      totalAnswered >= totalQuestionsInPhase && totalQuestionsInPhase > 0;
    setIsPhaseCompleted(completed);

    if (completed) {
      setLionState('happy');
      await playSound(require('../../assets/sounds/sucess.mp3'));
    } else {
      setLionState('fail');
      await playSound(require('../../assets/sounds/end.mp3'));
    }

    setShowSummaryModal(true);
  };

  // Avanzar de fase / reintentar
  const handleNextPhase = async (success: boolean) => {
    if (success) {
      const nextPhaseIndex = currentPhaseIndex + 1;

      if (nextPhaseIndex < currentLevel.phases.length) {
        setCurrentPhaseIndex(nextPhaseIndex);
      } else {
        const nextLevelIndex = currentLevelIndex + 1;
        if (nextLevelIndex < LEVELS_N3.length) {
          setCurrentLevelIndex(nextLevelIndex);
          setCurrentPhaseIndex(0);
        }
      }
    }

    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setCurrentHint(null);
    setCorrectCount(0);
    setWrongCount(0);
    setCorrectStreak(0);
    setStars(0);

    if (timeLeft === 0) {
      setTimeLeft(59 * 60);
    }

    setShowSummaryModal(false);
    setLionState('normal');
  };

  // ✅ Selección de opción
  const handleOptionPress = (option: string) => {
    if (selectedOption || timeLeft === 0 || !currentQuestion) return;

    setSelectedOption(option);
    const isCorrect = option === currentQuestion.correct;

    if (isCorrect) {
      playSound(require('../../assets/sounds/correct.mp3'));

      setCorrectCount((prevCorrect) => {
        const newCorrect = prevCorrect + 1;
        if (newCorrect % 3 === 0) {
          setStars((prevStars) => Math.min(prevStars + 1, 5));
        }
        return newCorrect;
      });

      setCorrectStreak((prevStreak) => {
        const updated = prevStreak + 1;
        if (updated === 5) {
          setTimeLeft((prevTime) => prevTime + 15);
          return 0;
        }
        return updated;
      });

      setLionState('normal');
    } else {
      playSound(require('../../assets/sounds/wrong.mp3'));
      setWrongCount((prevWrong) => prevWrong + 1);
      setStars((prevStars) => Math.max(prevStars - 1, 0));
      setLionState('fail');
      setCorrectStreak(0);
      setTimeLeft((prev) => Math.max(prev - 15, 0));
    }

    // Avance automático al final de la fase
    if (isLastQuestionInPhase) {
      if (isLastPhaseOfGame) {
        setTimeout(async () => {
          setLionState('happy');

          if (!hasAwardedGameAchievement) {
            awardAchievement('leon-sabio', {
              xp: 100,
              sub: 'Completaste la Aldea del León · JLPT N3',
              meta: { level: 'N3' },
            }).catch((e) =>
              console.error('Error otorgando logro León Sabio', e)
            );
            setHasAwardedGameAchievement(true);
          }

          await playSound(require('../../assets/sounds/sucess.mp3'));
          setShowGameCompleteModal(true);
        }, 1200);
      } else {
        setTimeout(() => {
          handleNextPhase(true);
        }, 1200);
      }
    }
  };

  const getOptionStyle = (option: string) => {
    if (!selectedOption) return styles.option;

    if (
      currentQuestion &&
      option === selectedOption &&
      option === currentQuestion.correct
    ) {
      return [styles.option, { backgroundColor: '#b6e3b6' }];
    }

    if (
      option === selectedOption &&
      (!currentQuestion || option !== currentQuestion.correct)
    ) {
      return [styles.option, { backgroundColor: '#f4b5b5' }];
    }

    if (currentQuestion && option === currentQuestion.correct) {
      return [
        styles.option,
        { backgroundColor: '#b6e3b6', borderColor: '#4CAF50' },
      ];
    }

    return styles.option;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getLionSource = () => {
    if (lionState === 'fail') return lionFail;
    if (lionState === 'happy') return lionHappy;

    if (
      showIntroModal ||
      showSummaryModal ||
      showGameCompleteModal ||
      timeLeft === 0
    ) {
      return lionBase;
    }

    return lionWalkFrames[walkFrameIndex % lionWalkFrames.length];
  };

  // 🦁 Animación de caminata lenta
  const WALK_INTERVAL_MS = 1000; // 1 segundo por frame

  useEffect(() => {
    if (
      lionState !== 'normal' ||
      showIntroModal ||
      showSummaryModal ||
      showGameCompleteModal ||
      timeLeft === 0
    ) {
      return;
    }

    const interval = setInterval(() => {
      setWalkFrameIndex((prev) => (prev + 1) % lionWalkFrames.length);
    }, WALK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [lionState, showIntroModal, showSummaryModal, showGameCompleteModal, timeLeft]);

  const isNextDisabled =
    !selectedOption || timeLeft === 0 || isLastQuestionInPhase;

  return (
    <View style={styles.screen}>
      <ImageBackground
        source={backgroundLeon}
        style={styles.container}
        resizeMode="cover"
      >
        {/* ⏱ Cronómetro */}
        <View style={styles.timerContainer}>
          <Image source={timerLeon} style={styles.timerImage} />
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>

        {/* 🦁 León con fondo suave */}
        <View style={styles.lionBubble}>
          <Image
            source={getLionSource()}
            style={styles.lion}
            resizeMode="contain"
          />
        </View>

        {/* Info nivel/fase */}
        <View style={styles.levelInfoContainer}>
          <Text style={styles.levelInfoText}>{currentLevel.name}</Text>
          <Text style={styles.phaseInfoText}>{currentPhase.name}</Text>
          <Text style={styles.questionProgressText}>
            Pregunta{' '}
            {totalQuestionsInPhase === 0 ? 0 : currentQuestionIndex + 1} /{' '}
            {totalQuestionsInPhase}
          </Text>
        </View>

        {/* ⭐ Estrellas */}
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Image
              key={i}
              source={
                i <= stars
                  ? require('../../assets/estrella_llena.png')
                  : require('../../assets/estrella_vacia.png')
              }
              style={styles.star}
            />
          ))}
        </View>

        {/* Panel de pregunta */}
        <View style={styles.panelContainer}>
          <ImageBackground
            source={require('../../assets/panel_pregunta.png')}
            style={styles.panel}
            resizeMode="stretch"
          >
            <View style={styles.questionBackground}>
              <Text style={styles.questionText}>
                {currentQuestion
                  ? currentQuestion.question
                  : 'No hay más preguntas por ahora. ¡Has completado el contenido disponible!'}
              </Text>
            </View>

            {currentHint && (
              <View style={styles.hintContainer}>
                <Text style={styles.hintTitle}>Pista:</Text>
                <Text style={styles.hintText}>{currentHint}</Text>
              </View>
            )}

            <View style={styles.options}>
              {currentQuestion &&
                currentQuestion.options.map((option, idx) => (
                  <TouchableOpacity
                    key={`${currentQuestionIndex}-${idx}`}  // 🔑 clave única
                    style={getOptionStyle(option)}
                    onPress={() => handleOptionPress(option)}
                    disabled={!!selectedOption || timeLeft === 0}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          </ImageBackground>
        </View>

        {/* Controles */}
        <View style={styles.controls}>
          <TouchableWithoutFeedback onPress={handleHint}>
            <Animated.Image
              source={require('../../assets/hint.png')}
              style={[
                styles.controlIcon,
                { transform: [{ scale: scaleHint }] },
                hintUses >= 10 && { opacity: 0.4 },
              ]}
            />
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback
            onPress={handleNext}
            disabled={isNextDisabled}
          >
            <Animated.Image
              source={require('../../assets/next.png')}
              style={[
                styles.controlIcon,
                { transform: [{ scale: scaleNext }] },
                isNextDisabled && { opacity: 0.4 },
              ]}
            />
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback onPress={handleEnd}>
            <Animated.Image
              source={require('../../assets/end.png')}
              style={[
                styles.controlIcon,
                { transform: [{ scale: scaleEnd }] },
              ]}
            />
          </TouchableWithoutFeedback>
        </View>

        {/* INTRO */}
        <Modal visible={showIntroModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.introModalContent}>
              <Text style={styles.introTitle}>Aldea del León · JLPT N3</Text>
              <Text style={styles.introSubtitle}>
                Bienvenido al territorio del León Fuerte
              </Text>

              <Text style={styles.introText}>
                En esta aldea, los guerreros del japonés se entrenan para
                dominar el{' '}
                <Text style={{ fontWeight: 'bold' }}>nivel JLPT N3</Text>. Cada
                fase representa un desafío distinto de vocabulario, gramática,
                lectura y situaciones reales.
              </Text>

              <Text style={styles.introText}>
                💠 <Text style={{ fontWeight: 'bold' }}>Reglas del juego:</Text>
              </Text>
              <Text style={styles.introListItem}>
                • Cada 3 respuestas correctas → ganas una ⭐ (hasta 5).
              </Text>
              <Text style={styles.introListItem}>
                • Cada respuesta incorrecta → pierdes una ⭐ y el reloj pierde
                15 segundos.
              </Text>
              <Text style={styles.introListItem}>
                • Cada 5 aciertos seguidos → el reloj suma +15 segundos.
              </Text>
              <Text style={styles.introListItem}>
                • Solo puedes usar la pista 💡 10 veces en todo el reto.
              </Text>
              <Text style={styles.introListItem}>
                • Si el tiempo llega a 0 → el nivel termina automáticamente.
              </Text>

              <Text style={styles.introPhrase}>
                Completa toda la Aldea del León para obtener el logro{' '}
                <Text style={{ fontWeight: 'bold' }}>“León Sabio” (100 XP)</Text>.
              </Text>

              <TouchableOpacity
                style={styles.introButton}
                onPress={() => setShowIntroModal(false)}
              >
                <Text style={styles.introButtonText}>¡Comenzar nivel N3!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* RESUMEN FASE */}
        <Modal visible={showSummaryModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.summaryModalContent}>
              <Text style={styles.summaryTitle}>Resumen de la fase</Text>
              <Text style={[styles.summaryText, { marginBottom: 8 }]}>
                {currentLevel.name} - {currentPhase.name}
              </Text>

              <Text style={styles.summaryText}>
                Preguntas respondidas: {totalAnswered} / {totalQuestionsInPhase}
              </Text>
              <Text style={styles.summaryText}>✓ Correctas: {correctCount}</Text>
              <Text style={styles.summaryText}>
                ✗ Incorrectas: {wrongCount}
              </Text>
              <Text style={styles.summaryText}>
                ⭐ Estrellas obtenidas: {stars} / 5
              </Text>
              <Text
                style={[styles.summaryText, { marginTop: 10, fontSize: 14 }]}
              >
                Pistas utilizadas: {hintUses} / 10
              </Text>

              <TouchableOpacity
                style={[
                  styles.summaryButton,
                  isPhaseCompleted && { backgroundColor: '#4CAF50' },
                ]}
                onPress={() => handleNextPhase(isPhaseCompleted)}
              >
                <Text style={styles.summaryButtonText}>
                  {isPhaseCompleted
                    ? 'Continuar a la siguiente fase'
                    : 'Reintentar fase'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.summaryButton,
                  { marginTop: 8, backgroundColor: '#b23b3b' },
                ]}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.summaryButtonText}>Salir del juego</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* LOGRO FINAL */}
        <Modal visible={showGameCompleteModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.gameCompleteModalContent}>
              <Text style={styles.gameCompleteTitle}>
                ¡Reto N3 completado!
              </Text>
              <Text style={styles.gameCompleteText}>
                Has llegado al final de la Aldea del León y completado todas las
                preguntas disponibles de este nivel.
              </Text>

              <View style={styles.gameCompleteBadge}>
                <Text style={styles.gameCompleteBadgeTitle}>
                  Logro desbloqueado:
                </Text>
                <Text style={styles.gameCompleteBadgeName}>🏅 León Sabio</Text>
                <Text style={styles.gameCompleteBadgeXP}>+100 XP</Text>
              </View>

              <TouchableOpacity
                style={styles.gameCompleteButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.gameCompleteButtonText}>
                  Salir del juego
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
}

// ===================== ESTILOS =====================

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    width,
    height: height + 210,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  timerContainer: {
    position: 'absolute',
    top: 45,
    left: 25,
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    position: 'absolute',
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    zIndex: 1,
  },
  lionBubble: {
    position: 'absolute',
    top: 70,
    alignSelf: 'center',
    padding: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  lion: {
    width: 140,
    height: 140,
  },
  levelInfoContainer: {
    position: 'absolute',
    top: 50,
    right: 25,
    alignItems: 'flex-end',
  },
  levelInfoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#233',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  phaseInfoText: {
    fontSize: 12,
    color: '#445',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 6,
    borderRadius: 4,
    marginTop: 2,
  },
  questionProgressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 10,
    marginTop: 180,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(250, 230, 180, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    width: 50,
    height: 42,
    marginHorizontal: 5,
  },
  panelContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  panel: {
    width: width * 0.9,
    paddingVertical: 50,
    paddingHorizontal: 16,
    alignItems: 'center',
    height: 330,
    paddingTop: 30,
  },
  questionBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  hintContainer: {
    backgroundColor: 'rgba(255, 255, 204, 0.9)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  hintTitle: {
    fontWeight: 'bold',
    marginBottom: 2,
    fontSize: 14,
  },
  hintText: {
    fontSize: 14,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  option: {
    width: '40%',
    borderWidth: 2,
    borderColor: '#5aa6f8',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    margin: 6,
    backgroundColor: '#ffffffaa',
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginTop: 5,
  },
  controlIcon: {
    width: 122,
    height: 110,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  introModalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    elevation: 10,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
    color: '#3b4a6b',
  },
  introSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    color: '#556',
  },
  introText: {
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
  },
  introListItem: {
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 2,
    color: '#333',
  },
  introPhrase: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 10,
    textAlign: 'center',
    color: '#444',
  },
  introButton: {
    marginTop: 16,
    backgroundColor: '#e19c3a',
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  introButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  summaryModalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    elevation: 10,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3b4a6b',
  },
  summaryText: {
    fontSize: 15,
    marginBottom: 4,
    color: '#333',
  },
  summaryButton: {
    marginTop: 14,
    backgroundColor: '#e19c3a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  summaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  gameCompleteModalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 22,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    elevation: 10,
    alignItems: 'center',
  },
  gameCompleteTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2f3b5c',
    textAlign: 'center',
  },
  gameCompleteText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  gameCompleteBadge: {
    backgroundColor: '#ffecc2',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 18,
  },
  gameCompleteBadgeTitle: {
    fontSize: 14,
    color: '#8a5a1f',
  },
  gameCompleteBadgeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c47a1c',
  },
  gameCompleteBadgeXP: {
    fontSize: 14,
    color: '#8a5a1f',
    marginTop: 4,
  },
  gameCompleteButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 18,
  },
  gameCompleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
