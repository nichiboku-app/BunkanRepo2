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

// Importamos el servicio de logros. Asumo que el archivo se ha copiado correctamente
// y que 'auth', 'db' y 'pushUserEvent' están disponibles en su contexto.
import { awardAchievement } from '../services/achievements'; // Usaremos esta función

// 👉 Importa el banco de preguntas desde otro archivo
// Ajusta la ruta según donde guardes el archivo con las 230 preguntas.
import { questions } from '../data/RetoN5Questions';

const { width, height } = Dimensions.get('window');

// 🦝 Imágenes del mapache
const tanukiNormal = require('../../assets/tanuki.png');
const tanukiFail = require('../../assets/mapachemalo.png');
const tanukiHappy = require('../../assets/mapachefeliz.png');

// 📝 Tipo de pregunta
export type Section = 'goi' | 'bunpou' | 'moji' | 'dokkai' | 'gengochishiki';

export type Question = {
  question: string;
  options: string[];
  correct: string;
  hint: string;
  section: Section;
};

// ---------- NIVELES Y FASES ----------

type PhaseConfig = {
  id: number;
  name: string;
};

type LevelConfig = {
  id: number;
  name: string;
  phases: PhaseConfig[];
};

export const QUESTIONS_PER_PHASE = 10;
export const PHASES_PER_LEVEL = 5;
export const TOTAL_LEVELS = 4;
export const TOTAL_PHASES = TOTAL_LEVELS * PHASES_PER_LEVEL;

// 4 niveles * 5 fases * 10 preguntas = 200 preguntas
export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Nivel 1 · Sendero del Bosque',
    phases: [
      { id: 1, name: 'Fase 1 · Vocabulario A' },
      { id: 2, name: 'Fase 2 · Gramática A' },
      { id: 3, name: 'Fase 3 · Kanji A' },
      { id: 4, name: 'Fase 4 · Lectura A' },
      { id: 5, name: 'Fase 5 · Expresiones A' },
    ],
  },
  {
    id: 2,
    name: 'Nivel 2 · Aldea Tanuki',
    phases: [
      { id: 1, name: 'Fase 1 · Vocabulario B' },
      { id: 2, name: 'Fase 2 · Gramática B' },
      { id: 3, name: 'Fase 3 · Kanji B' },
      { id: 4, name: 'Fase 4 · Lectura B' },
      { id: 5, name: 'Fase 5 · Expresiones B' },
    ],
  },
  {
    id: 3,
    name: 'Nivel 3 · Templo del Kanji',
    phases: [
      { id: 1, name: 'Fase 1 · Vocabulario C' },
      { id: 2, name: 'Fase 2 · Gramática C' },
      { id: 3, name: 'Fase 3 · Kanji C' },
      { id: 4, name: 'Fase 4 · Lectura C' },
      { id: 5, name: 'Fase 5 · Expresiones C' },
    ],
  },
  {
    id: 4,
    name: 'Nivel 4 · Monte JLPT N5',
    phases: [
      { id: 1, name: 'Fase 1 · Vocabulario D' },
      { id: 2, name: 'Fase 2 · Gramática D' },
      { id: 3, name: 'Fase 3 · Kanji D' },
      { id: 4, name: 'Fase 4 · Lectura D' },
      { id: 5, name: 'Fase 5 · Expresiones D' },
    ],
  },
];


// ===================== COMPONENTE =====================

export default function RetoN5() {
  // ⭐ Progreso / stars (ahora 5)
  const [stars, setStars] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  // 🔥 Racha de aciertos seguidos (para +15s cada 5 correctas seguidas)
  const [correctStreak, setCorrectStreak] = useState(0);

  // 🎯 Nivel y fase actuales
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0); // 0 = Nivel 1
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0); // 0 = Fase 1

  // ❓ Pregunta actual (dentro de la fase)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // 💡 Pistas (máx 10)
  const [hintUses, setHintUses] = useState(0);
  const [currentHint, setCurrentHint] = useState<string | null>(null);

  // 🧾 Modales
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isPhaseCompleted, setIsPhaseCompleted] = useState(false);

  // 🔁 Animaciones botones
  const bgmRef = useRef<Audio.Sound | null>(null);
  const scaleHint = useRef(new Animated.Value(1)).current;
  const scaleNext = useRef(new Animated.Value(1)).current;
  const scaleEnd = useRef(new Animated.Value(1)).current;

  // ⏱ Estado del temporizador (59:00 minutos)
  const [timeLeft, setTimeLeft] = useState(59 * 60); // 59 minutos en segundos

  // 🦝 Estado del mapache
  const [tanukiState, setTanukiState] = useState<'normal' | 'fail' | 'happy'>(
    'normal'
  );

  // ---------- DERIVAR PREGUNTAS DE LA FASE ACTUAL ----------

  const currentLevel = LEVELS[currentLevelIndex];
  const currentPhase = currentLevel.phases[currentPhaseIndex];

  // índice global de la fase
  const globalPhaseIndex =
    currentLevelIndex * PHASES_PER_LEVEL + currentPhaseIndex;

  const phaseStartIndex = globalPhaseIndex * QUESTIONS_PER_PHASE;
  const phaseQuestions = questions.slice(
    phaseStartIndex,
    phaseStartIndex + QUESTIONS_PER_PHASE
  );

  // Verificación para no acceder a preguntas fuera del array (maneja el caso de final de juego)
  const isGameComplete = phaseStartIndex >= questions.length;
  const currentQuestion = !isGameComplete ? phaseQuestions[currentQuestionIndex] : null;
  
  const totalQuestionsInPhase = phaseQuestions.length;
  const totalAnswered = correctCount + wrongCount;
  const isLastQuestionInPhase = currentQuestionIndex === totalQuestionsInPhase - 1;


  // ⏱ Cronómetro en marcha
  useEffect(() => {
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
  }, []);

  // 🎧 Música de fondo
  useEffect(() => {
    const loadBGM = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/retobgm.mp3')
      );
      bgmRef.current = sound;
      await sound.setIsLoopingAsync(true);
      await sound.playAsync();
    };

    if (!showSummaryModal && timeLeft > 0) {
      loadBGM();
    }

    return () => {
      if (bgmRef.current) {
        bgmRef.current.unloadAsync();
      }
    };
  }, [showSummaryModal]); // Controlamos la música solo si el modal de resumen no está abierto

  const playSound = async (file: any) => {
    const { sound } = await Audio.Sound.createAsync(file);
    await sound.playAsync();
  };

  // ⏱ Cuando el tiempo llega a 0 → game over automático
  useEffect(() => {
    if (timeLeft === 0 && !showSummaryModal) {
      (async () => {
        if (bgmRef.current) {
          try {
            await bgmRef.current.stopAsync();
          } catch (e) {}
        }
        setTanukiState('fail');
        await playSound(require('../../assets/sounds/end.mp3'));
        setIsPhaseCompleted(false); // No completada por tiempo
        setShowSummaryModal(true);
      })();
    }
  }, [timeLeft, showSummaryModal]);

  const animateButton = (scaleRef: Animated.Value) => {
    Animated.sequence([
      Animated.spring(scaleRef, {
        toValue: 1.15,
        useNativeDriver: true,
      } as any),
      Animated.spring(scaleRef, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      } as any),
    ]).start();
  };

  // 💡 Manejar pista (máx 10)
  const handleHint = () => {
    if (hintUses >= 10 || !currentQuestion) return;
    animateButton(scaleHint);
    playSound(require('../../assets/sounds/hint.mp3'));

    setHintUses((prev) => prev + 1);
    setCurrentHint(currentQuestion.hint);
  };

  // ⏭ Pasar a la siguiente pregunta (USANDO BOTÓN)
  const handleNext = () => {
    // Si no ha seleccionado una opción, o es la última pregunta, no hace nada (se desactiva visualmente)
    if (!selectedOption || isLastQuestionInPhase) return;

    animateButton(scaleNext);
    playSound(require('../../assets/sounds/next.mp3'));

    if (currentQuestionIndex < totalQuestionsInPhase - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setCurrentHint(null);
      setTanukiState('normal');
    }
  };

  // 🔚 Fin del nivel/fase actual: parar música + mostrar resumen (salida manual)
  const handleEnd = async () => {
    animateButton(scaleEnd);

    if (bgmRef.current) {
      try {
        await bgmRef.current.stopAsync();
      } catch (e) {}
    }

    // Usamos esta opción como salida manual, por lo que marcamos la fase como NO completada
    // a menos que ya se hayan respondido todas las preguntas (para que el resumen sea coherente)
    const completed = totalAnswered >= totalQuestionsInPhase && totalQuestionsInPhase > 0;
    setIsPhaseCompleted(completed);

    if (completed) {
      setTanukiState('happy');
      await playSound(require('../../assets/sounds/sucess.mp3'));
    } else {
      setTanukiState('fail');
      await playSound(require('../../assets/sounds/end.mp3'));
    }

    setShowSummaryModal(true);
  };

  // Lógica para avanzar a la siguiente fase o reintentar
  const handleNextPhase = async (success: boolean) => {
    
    // Si la fase fue completada con éxito, intentamos avanzar y otorgamos el logro
    if (success) {
        
      // OTORGAR LOGRO "REY TANUKI" (100 XP)
      awardAchievement('rey-tanuki', {
        xp: 100,
        sub: `Fase ${currentPhaseIndex + 1} del Nivel ${currentLevelIndex + 1}`,
        meta: { level: currentLevelIndex + 1, phase: currentPhaseIndex + 1 },
      }).catch(e => console.error("Error otorgando Rey Tanuki", e));
        
      const nextPhaseIndex = currentPhaseIndex + 1;
      const nextLevelIndex = currentLevelIndex + 1;

      // 1. ¿Hay más fases en el nivel actual?
      if (nextPhaseIndex < LEVELS[currentLevelIndex].phases.length) {
        setCurrentPhaseIndex(nextPhaseIndex);
      } 
      // 2. Si no, ¿hay más niveles?
      else if (nextLevelIndex < LEVELS.length) {
        setCurrentLevelIndex(nextLevelIndex);
        setCurrentPhaseIndex(0); // Reiniciar a la primera fase del nuevo nivel
      } 
      // 3. ¡Juego completado!
      else {
        // Marcamos como completado para el mensaje final
        setShowSummaryModal(false);
        setTanukiState('happy');
        return; 
      }
    }
    
    // Reiniciar contadores para la nueva fase/reintento
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setCurrentHint(null);
    setCorrectCount(0); // Reiniciar solo el contador de aciertos/fallos para la nueva fase
    setWrongCount(0);
    setCorrectStreak(0);
    // ⚠️ Las estrellas se mantienen durante todo el reto (no se reinician aquí)

    // Mantener el tiempo total para el desafío, pero reanudar
    setTimeLeft((prevTime) => (prevTime > 0 ? prevTime : 59 * 60)); // Si el tiempo llegó a cero, lo reiniciamos, si no, lo mantenemos.
    setShowSummaryModal(false);
    setTanukiState('normal');

    if (bgmRef.current) {
      try {
        await bgmRef.current.playAsync();
      } catch (e) {}
    }
  };


  // ✅ Manejo de selección de opción y avance automático de FASE
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

      setTanukiState('normal');
    } else {
      playSound(require('../../assets/sounds/wrong.mp3'));
      setWrongCount((prevWrong) => prevWrong + 1);
      setStars((prevStars) => Math.max(prevStars - 1, 0));
      setTanukiState('fail');
      setCorrectStreak(0);
      // ⏱ Penalización de -15 segundos por fallo
      setTimeLeft((prevTime) => Math.max(prevTime - 15, 0));
    }

    // --- LÓGICA de AVANCE AUTOMÁTICO de FASE ---
    if (isLastQuestionInPhase) {
      // Si fue la última pregunta, avanzamos de fase automáticamente
      setTimeout(() => {
        // No paramos la música aquí → que siga sonando al cambiar de fase
        handleNextPhase(true); 
      }, 1500); // 1.5 segundos de retraso para la transición
    }
  };

  const getOptionStyle = (option: string) => {
    if (!selectedOption) return styles.option;

    if (currentQuestion && option === selectedOption && option === currentQuestion.correct) {
      return [styles.option, { backgroundColor: '#b6e3b6' }];
    }

    if (option === selectedOption && (!currentQuestion || option !== currentQuestion.correct)) {
      return [styles.option, { backgroundColor: '#f4b5b5' }];
    }

    // Mostrar la respuesta correcta cuando el usuario ya falló
    if (currentQuestion && option === currentQuestion.correct) {
        return [styles.option, { backgroundColor: '#b6e3b6', borderColor: '#4CAF50' }];
    }

    return styles.option;
  };

  // 🕒 Formatear segundos a MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Elegir imagen según estado del mapache
  const getTanukiSource = () => {
    if (tanukiState === 'fail') return tanukiFail;
    if (tanukiState === 'happy') return tanukiHappy;
    return tanukiNormal;
  };

  // Si el juego está completo, evitamos errores al intentar acceder a currentQuestion
  if (isGameComplete && !showSummaryModal) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>¡Reto Finalizado!</Text>
        <Text>Todas las fases del JLPT N5 completadas. ¡Felicidades, Rey Tanuki!</Text>
      </View>
    );
  }
  
  // Determinamos si el botón Next debe estar desactivado o visible
  const isNextDisabled = !selectedOption || timeLeft === 0 || isLastQuestionInPhase;


  return (
    <View style={styles.screen}>
      <ImageBackground
        source={require('../../assets/background.png')}
        style={styles.container}
        resizeMode="cover"
      >
        {/* ⏱ Cronómetro */}
        <View style={styles.timerContainer}>
          <Image
            source={require('../../assets/timer.png')}
            style={styles.timerImage}
          />
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>

        {/* 🦝 Tanuki */}
        <Image
          source={getTanukiSource()}
          style={styles.tanuki}
          resizeMode="contain"
        />

        {/* Nivel / Fase y Progreso */}
        <View style={styles.starsInfoContainer}>
          <Text style={styles.levelInfoText}>{currentLevel.name}</Text>
          <Text style={styles.phaseInfoText}>{currentPhase.name}</Text>
          <Text style={styles.questionProgressText}>
            Pregunta {currentQuestionIndex + 1} / {totalQuestionsInPhase}
          </Text>
        </View>


        {/* ⭐ Estrellas (5) */}
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

        {/* ❓ Panel de pregunta */}
        <View style={styles.panelContainer}>
          <ImageBackground
            source={require('../../assets/panel_pregunta.png')}
            style={styles.panel}
            resizeMode="stretch"
          >
            <View style={styles.questionBackground}>
              <Text style={styles.questionText}>
                {currentQuestion ? currentQuestion.question : 'Fase completada. Presiona END para salir.'}
              </Text>
            </View>

            {/* 💡 Texto de pista */}
            {currentHint && (
              <View style={styles.hintContainer}>
                <Text style={styles.hintTitle}>Pista:</Text>
                <Text style={styles.hintText}>{currentHint}</Text>
              </View>
            )}

            <View style={styles.options}>
              {currentQuestion &&
                currentQuestion.options.map((option) => (
                  <TouchableOpacity
                    key={option}
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

        {/* 🔘 Botones */}
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

          {/* Botón NEXT para avanzar pregunta a pregunta */}
          <TouchableWithoutFeedback onPress={handleNext} disabled={isNextDisabled}>
            <Animated.Image
              source={require('../../assets/next.png')}
              style={[
                styles.controlIcon,
                { transform: [{ scale: scaleNext }] },
                isNextDisabled && { opacity: 0.4 }, // Desactivado si no ha respondido o es la última pregunta
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

        {/* 🧾 MODAL INTRODUCCIÓN */}
        <Modal visible={showIntroModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.introModalContent}>
              <Text style={styles.introTitle}>Aldea de los Tanuki</Text>
              <Text style={styles.introSubtitle}>
                Bienvenido al desafío JLPT N5 por niveles
              </Text>

              <Text style={styles.introText}>
                En lo profundo del bosque existe una pequeña aldea donde viven
                los tanuki, espíritus traviesos que adoran poner a prueba a los
                viajeros. El desafío consta de un total de <Text style={{ fontWeight: 'bold' }}>{TOTAL_PHASES} fases</Text> (4 niveles con 5 fases cada uno), cada una con 10 preguntas.
                Supera todas las fases para conquistar la aldea.
              </Text>

              <Text style={styles.introText}>
                💠 <Text style={{ fontWeight: 'bold' }}>Reglas del juego:</Text>
              </Text>
              <Text style={styles.introListItem}>
                • Cada 3 respuestas correctas → ganas una ⭐ (hasta 5, se acumulan durante todo el reto).
              </Text>
              <Text style={styles.introListItem}>
                • Cada respuesta incorrecta → pierdes una ⭐ y el reloj pierde 15 segundos.
              </Text>
              <Text style={styles.introListItem}>
                • Solo puedes usar la pista 💡 hasta 10 veces en todo el reto.
              </Text>
              <Text style={styles.introListItem}>
                • Si aciertas 5 preguntas seguidas → el reloj suma +15 segundos.
              </Text>
              <Text style={styles.introListItem}>
                • Si el tiempo llega a 0 → la partida termina automáticamente.
              </Text>

              <Text style={styles.introPhrase}>
                “Supera la aldea de los tanuki para obtener el logro <Text style={{ fontWeight: 'bold' }}>Rey Tanuki</Text>.”
              </Text>

              <TouchableOpacity
                style={styles.introButton}
                onPress={() => setShowIntroModal(false)}
              >
                <Text style={styles.introButtonText}>¡Comenzar reto!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 🧾 MODAL RESUMEN FINAL */}
        <Modal visible={showSummaryModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.summaryModalContent}>
              <Text style={styles.summaryTitle}>
                Resumen de la Fase
              </Text>
              <Text style={[styles.summaryText, { marginBottom: 8 }]}>
                {currentLevel.name} - {currentPhase.name}
              </Text>

              <Text style={styles.summaryText}>
                Preguntas respondidas: {totalAnswered} / {totalQuestionsInPhase}
              </Text>
              <Text style={styles.summaryText}>
                ✓ Correctas: {correctCount}
              </Text>
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
                style={[styles.summaryButton, isPhaseCompleted && {backgroundColor: '#4CAF50'}]} 
                onPress={() => handleNextPhase(isPhaseCompleted)}
              >
                <Text style={styles.summaryButtonText}>
                  {isPhaseCompleted ? 'Continuar a la siguiente fase' : 'Reintentar fase'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
}


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    width,
    height: height + 210,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  // 🕒 Estilos cronómetro
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
  // 🦝 Tanuki centrado
  tanuki: {
    width: 140,
    height: 140,
    position: 'absolute',
    top: 70,
    alignSelf: 'center',
    zIndex: 10,
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 10,
    marginTop: 180,
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
  // ❓ Fondo del texto de la pregunta
  questionBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    elevation: 3, // Android shadow
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
  // 💡 Pista
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

  // 🧾 Modales (intro y resumen)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  // Intro modal
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
    backgroundColor: '#5aa6f8',
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  introButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Summary modal
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
    backgroundColor: '#5aa6f8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  summaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // ============= ESTILOS AÑADIDOS/AJUSTADOS para la lógica de Nivel/Fase =============
  // Posiciona la información de nivel/fase en la esquina superior derecha.
  starsInfoContainer: {
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
    paddingHorizontal: 5,
    borderRadius: 3,
  },
  phaseInfoText: {
    fontSize: 12,
    color: '#445',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 5,
    borderRadius: 3,
  },
  questionProgressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 5,
    borderRadius: 3,
  },
});
