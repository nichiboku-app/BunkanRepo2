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

// Nota: Asumo que el archivo RetoN1Dragon.ts contiene el array questionsN1Dragon con 200 preguntas.
import type { Question } from '../data/RetoN1Dragon';
import { questionsN1Dragon } from '../data/RetoN1Dragon';
import { awardAchievement } from '../services/achievements';

const { width, height } = Dimensions.get('window');

// 🐲 DRAGÓN: estados básicos
const dragonIdle = require('../../assets/dragon/dragon_idle.png');
const dragonDamaged = require('../../assets/dragon/dragon_damage.png');
const dragonVictorious = require('../../assets/dragon/dragon_victorious.png');

// Frames para una animación sencilla (idle/roar/fly)
const dragonAnimFrames = [
    require('../../assets/dragon/dragon_idle.png'),
    require('../../assets/dragon/dragon_roar.png'),
    require('../../assets/dragon/dragon_fly.png'),
];

// Fondo y timer
const backgroundDragon = require('../../assets/dragon/dragoncasa.png');
const timerImage = require('../../assets/dragon/timerdragon.png');

// Sonidos del nivel Dragón
const dragonLaugh = require('../../assets/sounds/dragon1.mp3'); // risa inicial
const dragonLoop = require('../../assets/sounds/dragon2.mp3'); // loop infinito

// Sonidos genéricos del juego
const sfxCorrect = require('../../assets/sounds/correct.mp3');
const sfxWrong = require('../../assets/sounds/wrong.mp3');
const sfxHint = require('../../assets/sounds/hint.mp3');
const sfxNext = require('../../assets/sounds/next.mp3');
const sfxEnd = require('../../assets/sounds/end.mp3');
const sfxSuccess = require('../../assets/sounds/sucess.mp3');

// ---------- CONFIG NIVELES/FASES (N1 DRAGÓN) ----------

type PhaseConfig = {
    id: number;
    name: string;
};

type LevelConfig = {
    id: number;
    name: string;
    phases: PhaseConfig[];
};

export const LEVELS_N1_DRAGON: LevelConfig[] = [
    {
        id: 1,
        name: 'Nivel N1 · Guarida del Dragón',
        phases: [
            // Configurado para tomar 40 preguntas de cada sección (200 en total)
            { id: 1, name: 'Fase 1 · Vocabulario (Goi)' },
            { id: 2, name: 'Fase 2 · Gramática (Bunpou)' },
            { id: 3, name: 'Fase 3 · Kanji y Lectura (Moji)' },
            { id: 4, name: 'Fase 4 · Comprensión Lectora (Dokkai)' },
            { id: 5, name: 'Fase 5 · Expresiones Avanzadas' },
        ],
    },
];

// Ajustado a 40 preguntas por fase para consumir las 200 preguntas (40 x 5 = 200)
const QUESTIONS_PER_PHASE = 40; 

const TOTAL_PHASES_N1 = LEVELS_N1_DRAGON.reduce(
    (sum, level) => sum + level.phases.length,
    0
);

// ===================== COMPONENTE =====================

export default function RetoN1() {
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

    // 🎵 dragonLoop se queda sonando en loop hasta salir de la pantalla
    const bgmRef = useRef<Audio.Sound | null>(null);

    const scaleHint = useRef(new Animated.Value(1)).current;
    const scaleNext = useRef(new Animated.Value(1)).current;
    const scaleEnd = useRef(new Animated.Value(1)).current;

    const [timeLeft, setTimeLeft] = useState(59 * 60);
    const [dragonState, setDragonState] = useState<
        'normal' | 'damaged' | 'victory'
    >('normal');
    const [animFrameIndex, setAnimFrameIndex] = useState(0);

    // ---------- DERIVADOS ----------

    const currentLevel = LEVELS_N1_DRAGON[currentLevelIndex];
    const currentPhase = currentLevel.phases[currentPhaseIndex];

    const globalPhaseIndex =
        LEVELS_N1_DRAGON.slice(0, currentLevelIndex).reduce(
            (sum, level) => sum + level.phases.length,
            0
        ) + currentPhaseIndex;

    const phaseStartIndex = globalPhaseIndex * QUESTIONS_PER_PHASE;
    const phaseQuestions = questionsN1Dragon.slice(
        phaseStartIndex,
        phaseStartIndex + QUESTIONS_PER_PHASE
    );

    const isGameOutOfQuestions = phaseStartIndex >= questionsN1Dragon.length;
    const currentQuestion: Question | null =
        !isGameOutOfQuestions && phaseQuestions.length > 0
            ? phaseQuestions[currentQuestionIndex]
            : null;

    const totalQuestionsInPhase = phaseQuestions.length;
    const totalAnswered = correctCount + wrongCount;
    const isLastQuestionInPhase =
        totalQuestionsInPhase > 0 &&
        currentQuestionIndex === totalQuestionsInPhase - 1;

    const isLastPhaseOfGame =
        globalPhaseIndex === TOTAL_PHASES_N1 - 1 ||
        phaseStartIndex + QUESTIONS_PER_PHASE >= questionsN1Dragon.length;

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

    // 🎧 Audio: risa -> luego loop infinito dragonLoop
    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const { sound: laughSound } = await Audio.Sound.createAsync(
                    dragonLaugh
                );
                if (!mounted) {
                    await laughSound.unloadAsync();
                    return;
                }
                await laughSound.playAsync();

                laughSound.setOnPlaybackStatusUpdate(async (status: any) => {
                    if (!status.isLoaded || !mounted) return;

                    if (status.didJustFinish) {
                        await laughSound.unloadAsync();

                        const { sound: loopSound } = await Audio.Sound.createAsync(
                            dragonLoop
                        );
                        if (!mounted) {
                            await loopSound.unloadAsync();
                            return;
                        }
                        bgmRef.current = loopSound;
                        await loopSound.setIsLoopingAsync(true);
                        await loopSound.playAsync();
                    }
                });
            } catch (e) {
                console.error('Error cargando sonidos del dragón', e);
            }
        })();

        return () => {
            mounted = false;
            if (bgmRef.current) {
                bgmRef.current.unloadAsync();
            }
        };
    }, []);

    const playSfx = async (file: any) => {
        const { sound } = await Audio.Sound.createAsync(file);
        await sound.playAsync();
    };

    // Si el tiempo llega a 0 → fin de fase
    useEffect(() => {
        if (timeLeft === 0 && !showSummaryModal && !showGameCompleteModal) {
            (async () => {
                setDragonState('damaged');
                await playSfx(sfxEnd);
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
        playSfx(sfxHint);
        setHintUses((prev) => prev + 1);
        setCurrentHint(currentQuestion.hint);
    };

    // ⏭ NEXT
    const handleNext = () => {
        if (!selectedOption || isLastQuestionInPhase || timeLeft === 0) return;

        animateButton(scaleNext);
        playSfx(sfxNext);

        if (currentQuestionIndex < totalQuestionsInPhase - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setSelectedOption(null);
            setCurrentHint(null);
            setDragonState('normal');
        }
    };

    // 🔚 END (forzar resumen)
    const handleEnd = async () => {
        animateButton(scaleEnd);

        const completed =
            totalAnswered >= totalQuestionsInPhase && totalQuestionsInPhase > 0;
        setIsPhaseCompleted(completed);

        if (completed) {
            setDragonState('victory');
            await playSfx(sfxSuccess);
        } else {
            setDragonState('damaged');
            await playSfx(sfxEnd);
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
                if (nextLevelIndex < LEVELS_N1_DRAGON.length) {
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
        setDragonState('normal');
    };

    // ✅ Selección de opción
    const handleOptionPress = (option: string) => {
        if (selectedOption || timeLeft === 0 || !currentQuestion) return;

        setSelectedOption(option);
        const isCorrect = option === currentQuestion.correct;

        if (isCorrect) {
            playSfx(sfxCorrect);

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

            setDragonState('normal');
        } else {
            playSfx(sfxWrong);
            setWrongCount((prevWrong) => prevWrong + 1);
            setStars((prevStars) => Math.max(prevStars - 1, 0));
            setDragonState('damaged');
            setCorrectStreak(0);
            setTimeLeft((prev) => Math.max(prev - 15, 0));
        }

        // Avance automático al final de la fase
        if (isLastQuestionInPhase) {
            if (isLastPhaseOfGame) {
                setTimeout(async () => {
                    setDragonState('victory');

                    if (!hasAwardedGameAchievement) {
                        awardAchievement('maestro-dragon', {
                            xp: 150,
                            sub: 'Venciste al Dragón del JLPT N1',
                            meta: { level: 'N1' },
                        }).catch((e) =>
                            console.error('Error otorgando logro Maestro Dragón', e)
                        );
                        setHasAwardedGameAchievement(true);
                    }

                    await playSfx(sfxSuccess);
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

    const getDragonSource = () => {
        if (dragonState === 'damaged') return dragonDamaged;
        if (dragonState === 'victory') return dragonVictorious;

        if (
            showIntroModal ||
            showSummaryModal ||
            showGameCompleteModal ||
            timeLeft === 0
        ) {
            return dragonIdle;
        }

        return dragonAnimFrames[animFrameIndex % dragonAnimFrames.length];
    };

    // 🐲 Animación sencilla del dragón
    const ANIM_INTERVAL_MS = 900;

    useEffect(() => {
        if (
            dragonState !== 'normal' ||
            showIntroModal ||
            showSummaryModal ||
            showGameCompleteModal ||
            timeLeft === 0
        ) {
            return;
        }

        const interval = setInterval(() => {
            setAnimFrameIndex((prev) => (prev + 1) % dragonAnimFrames.length);
        }, ANIM_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [
        dragonState,
        showIntroModal,
        showSummaryModal,
        showGameCompleteModal,
        timeLeft,
    ]);

    const isNextDisabled =
        !selectedOption || timeLeft === 0 || isLastQuestionInPhase;

    return (
        <View style={styles.screen}>
            <ImageBackground
                source={backgroundDragon}
                style={styles.container}
                resizeMode="cover"
            >
                {/* ⏱ Cronómetro */}
                <View style={styles.timerContainer}>
                    <Image source={timerImage} style={styles.timerImage} />
                    <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                </View>

                {/* 🐲 Dragón */}
                <View style={styles.dragonBubble}>
                    <Image
                        source={getDragonSource()}
                        style={styles.dragon}
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
                                    : 'No hay más preguntas por ahora. ¡Has derrotado todo lo disponible del Dragón N1!'}
                            </Text>
                        </View>

                        {currentHint && (
                            <View style={styles.hintContainer}>
                                <Text style={styles.hintTitle}>Pista del dragón:</Text>
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
                            <Text style={styles.introTitle}>Guarida del Dragón · JLPT N1</Text>
                            <Text style={styles.introSubtitle}>
                                Enfréntate al último guardián del templo
                            </Text>

                            <Text style={styles.introText}>
                                Este nivel representa el{' '}
                                <Text style={{ fontWeight: 'bold' }}>JLPT N1</Text>. El Dragón
                                prueba tu lectura avanzada, gramática y vocabulario de alto
                                nivel.
                            </Text>

                            <Text style={styles.introText}>
                                💠 <Text style={{ fontWeight: 'bold' }}>Reglas del juego:</Text>
                            </Text>
                            <Text style={styles.introListItem}>
                                • Cada 3 respuestas correctas → ganas una ⭐ (hasta 5).
                            </Text>
                            <Text style={styles.introListItem}>
                                • Cada error → pierdes una ⭐ y el reloj pierde 15 segundos.
                            </Text>
                            <Text style={styles.introListItem}>
                                • Cada 5 aciertos seguidos → el reloj suma +15 segundos.
                            </Text>
                            <Text style={styles.introListItem}>
                                • Solo puedes usar la pista 💡 10 veces.
                            </Text>
                            <Text style={styles.introListItem}>
                                • Si el tiempo llega a 0 → el Dragón te derrota.
                            </Text>

                            <Text style={styles.introPhrase}>
                                Supera el desafío para conseguir el logro{' '}
                                <Text style={{ fontWeight: 'bold' }}>“Maestro Dragón”</Text>.
                            </Text>

                            <TouchableOpacity
                                style={styles.introButton}
                                onPress={() => setShowIntroModal(false)}
                            >
                                <Text style={styles.introButtonText}>
                                    ¡Enfrentar al Dragón N1!
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* RESUMEN FASE */}
                <Modal visible={showSummaryModal} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.summaryModalContent}>
                            <Text style={styles.summaryTitle}>Resumen del combate</Text>
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
                                        : 'Reintentar combate'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.summaryButton,
                                    { marginTop: 8, backgroundColor: '#b23b3b' },
                                ]}
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={styles.summaryButtonText}>
                                    Salir de la guarida
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* LOGRO FINAL */}
                <Modal
                    visible={showGameCompleteModal}
                    transparent
                    animationType="fade"
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.gameCompleteModalContent}>
                            <Text style={styles.gameCompleteTitle}>
                                ¡Has vencido al Dragón del N1!
                            </Text>
                            <Text style={styles.gameCompleteText}>
                                Has completado todas las preguntas disponibles de este nivel y
                                domado al guardián final.
                            </Text>

                            <View style={styles.gameCompleteBadge}>
                                <Text style={styles.gameCompleteBadgeTitle}>
                                    Logro desbloqueado:
                                </Text>
                                <Text style={styles.gameCompleteBadgeName}>
                                    🐲 Maestro Dragón
                                </Text>
                                <Text style={styles.gameCompleteBadgeXP}>+150 XP</Text>
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
    dragonBubble: {
        position: 'absolute',
        top: 70,
        alignSelf: 'center',
        padding: 12,
        borderRadius: 999,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.8)',
    },
    dragon: {
        width: 150,
        height: 150,
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
        color: '#f5f5f5',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 6,
        borderRadius: 4,
    },
    phaseInfoText: {
        fontSize: 12,
        color: '#eee',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 6,
        borderRadius: 4,
        marginTop: 2,
    },
    questionProgressText: {
        fontSize: 12,
        color: '#eee',
        marginTop: 2,
        backgroundColor: 'rgba(0,0,0,0.6)',
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
        backgroundColor: 'rgba(40, 40, 40, 0.85)',
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 10,
    },
    questionText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f5f5f5',
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
        borderColor: '#8bc1ff',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        margin: 6,
        backgroundColor: '#ffffffdd',
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
        backgroundColor: 'rgba(15, 15, 20, 0.97)',
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
        color: '#f1c40f',
    },
    introSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 12,
        color: '#eee',
    },
    introText: {
        fontSize: 14,
        marginBottom: 6,
        color: '#f5f5f5',
    },
    introListItem: {
        fontSize: 14,
        marginLeft: 8,
        marginBottom: 2,
        color: '#f5f5f5',
    },
    introPhrase: {
        fontSize: 14,
        fontStyle: 'italic',
        marginTop: 10,
        textAlign: 'center',
        color: '#f5f5f5',
    },
    introButton: {
        marginTop: 16,
        backgroundColor: '#c0392b',
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
        backgroundColor: '#2c9d66',
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
        backgroundColor: '#dff5d8',
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: 'center',
        marginBottom: 18,
    },
    gameCompleteBadgeTitle: {
        fontSize: 14,
        color: '#25613b',
    },
    gameCompleteBadgeName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#25613b',
    },
    gameCompleteBadgeXP: {
        fontSize: 14,
        color: '#25613b',
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