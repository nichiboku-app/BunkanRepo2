// 👇 Debe ir primero siempre
import "react-native-gesture-handler";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { B3ScoreProvider } from "./src/context/B3ScoreContext";
import type { RootStackParamList } from "./types";

// Screens raíz
import BienvenidaScreen from "./src/screens/BienvenidaScreen";
import LoginScreen from "./src/screens/LoginScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import SplashScreen from "./src/screens/SplashScreen";

// Drawer principal
import AppDrawerNavigator from "./src/navigation/AppDrawerNavigator";

// N5 (rutas fuera del Drawer)
import EntradaActividadesN5Screen from "./src/screens/EntradaActividadesN5Screen";
import IntroJaponesScreen from "./src/screens/IntroJaponesScreen";
import AtarjetasScreen from "./src/screens/N5/AtarjetasScreen";
import ATrazoAnimado from "./src/screens/N5/ATrazoAnimado";
import N5Bienvenida from "./src/screens/N5/Bienvenida";
import CulturaScreen from "./src/screens/N5/CulturaScreen";
import EjemplosGrupoA from "./src/screens/N5/EjemplosGrupoA";
import EscrituraScreen from "./src/screens/N5/EscrituraScreen";
import GifSaludo from "./src/screens/N5/GifSaludo";
import HiraganaScreen from "./src/screens/N5/HiraganaScreen";
import MatchingGrupoK from "./src/screens/N5/MatchingGrupoK";
import MemoriaGrupoK from "./src/screens/N5/MemoriaGrupoK";
import OrigenesDelIdiomaScreen from "./src/screens/N5/OrigenesDelIdiomaScreen";
import QuizCultural from "./src/screens/N5/QuizCultural";
import SubtemaScreen from "./src/screens/N5/SubtemaScreen";
import TemaN5 from "./src/screens/N5/TemaN5";
import TemasBasicosScreen from "./src/screens/N5/TemasBasicos/TemasBasicosScreen";
import VocabularioGrupoK from "./src/screens/N5/VocabularioGrupoK";
import VowelExercisesScreen from "./src/screens/VowelExercisesScreen";

// ✅ NUEVA RUTA (Dictado Visual con TTS)
import ADictadoVisual from "./src/screens/N5/ADictadoVisual";

// Modal de video N5
import TemaGramaticaFamiliaScreen from "./src/screens/N5/TemaGramatica/FamiliaScreen";
import VideoIntroModal from "./src/screens/N5/VideoIntroModal";


// ✅ Pantallas reales (Grupo A)
import PronunciacionGrupoA from "./src/screens/N5/PronunciacionGrupoA";
import TrazosGrupoA from "./src/screens/N5/TrazosGrupoA";

// ✅ Grupo K real
import TrazosGrupoK from "./src/screens/N5/TrazosGrupoK";

// ✅ Familias S/T: menú combinado + trazos S/Z
import FamiliaSScreen from "./src/screens/N5/FamiliaS/SEscrituraGrupoS";
import TrazosFamiliaSZ from "./src/screens/N5/FamiliaS/TrazosFamiliaSZ";

// ✅ Familia S: auxiliares
import SCaligrafiaDigital from "./src/screens/N5/FamiliaS/SCaligrafiaDigital";
import SEjemplosGrupoS from "./src/screens/N5/FamiliaS/SEjemplosGrupoS";
import SLecturaSilabas from "./src/screens/N5/FamiliaS/SLecturaSilabas";

// ✅ Familia T: auxiliares
import TQuizEscucha from "./src/screens/N5/FamiliaS/TQuizEscucha";
import TTrazoGif from "./src/screens/N5/FamiliaS/TTrazoGif";

// familia N
import FamiliaNHScreen from "./src/screens/N5/FamiliaN/FamiliaNHScreen";
import HRoleplaySaludoScreen from "./src/screens/N5/FamiliaN/HRoleplaySaludoScreen";
import NLecturaGuiadaScreen from "./src/screens/N5/FamiliaN/NLecturaGuiadaScreen";

// Grupo M / Y–R
import HiraganaMMenu from "./src/screens/N5/HiraganaM/HiraganaMMenu";
import HiraganaYRMenu from "./src/screens/N5/HiraganaYR/HiraganaYRMenu";
// (opcional) subpantallas
import M_Dictado from "./src/screens/N5/HiraganaM/M_Dictado";
import M_PracticaVoz from "./src/screens/N5/HiraganaM/M_PracticaVoz";
import YR_AudioInteractivo from "./src/screens/N5/HiraganaYR/YR_AudioInteractivo";
import YR_CompletarPalabras from "./src/screens/N5/HiraganaYR/YR_CompletarPalabras";

// ✅ NUEVO: Grupo W–N — menú y subpantallas
import HiraganaWNMenu from "./src/screens/N5/HiraganaWN/HiraganaWNMenu";
import WN_LecturaFrases from "./src/screens/N5/HiraganaWN/WN_LecturaFrases";
import WN_PracticaNFinal from "./src/screens/N5/HiraganaWN/WN_PracticaNFinal";

// Katakana
import KatakanaChallenge from "./src/screens/Katakana/KatakanaChallenge";
import KatakanaMenu from "./src/screens/Katakana/KatakanaMenu";
import KatakanaRow from "./src/screens/Katakana/KatakanaRow";

// Bloques premium / examen
import B3VocabularioMenu from "./src/screens/N5/B3Vocabulario/B3VocabularioMenu";
import B4GramaticaIMenu from "./src/screens/N5/B4Gramatica/B4GramaticaIMenu";
import B5GramaticaIIMenu from "./src/screens/N5/B5Gramatica/B5GramaticaIIMenu";
import B6VidaCotidianaMenu from "./src/screens/N5/B6Vida/B6VidaCotidianaMenu";
import B7LecturaPracticaMenu from "./src/screens/N5/B7Lectura/B7LecturaPracticaMenu";
import B8EvaluacionesLogrosMenu from "./src/screens/N5/B8Evaluaciones/B8EvaluacionesLogrosMenu";
import ExamenFinalMapacheN5 from "./src/screens/N5/ExamenFinal/ExamenFinalMapacheN5";
import N5_DiagnosticoScreen from "./src/screens/N5/N5_DiagnosticoScreen";

// ✅ Bloque 3 — Números y Edad (tres actividades)
// ✅ rutas correctas (carpeta B3_Familia)
import B3_Familia from "./src/screens/N5/B3_Familia/B3_Familia";
import B3_Familia_Arbol from "./src/screens/N5/B3_Familia/B3_Familia_Arbol";
import B3_Familia_Roleplay from "./src/screens/N5/B3_Familia/B3_Familia_Roleplay";
import B3_Familia_Tarjetas from "./src/screens/N5/B3_Familia/B3_Familia_Tarjetas";

import B3_NumerosEdad from "./src/screens/N5/B3Vocabulario/B3_NumerosEdad";
import B3_NumerosEdad_Contadores from "./src/screens/N5/B3Vocabulario/B3_NumerosEdad_Contadores";
import B3_NumerosEdad_Roleplay from "./src/screens/N5/B3Vocabulario/B3_NumerosEdad_Roleplay";
import B3_NumerosEdad_Tarjetas from "./src/screens/N5/B3Vocabulario/B3_NumerosEdad_Tarjetas";

// ✅ Bloque 3 — Profesiones (NUEVO)
import B3_Profesiones from "./src/screens/N5/B3Vocabulario/B3_Profesiones";
import B3_Profesiones_Dialogo from "./src/screens/N5/B3Vocabulario/B3_Profesiones_Dialogo";
import B3_Profesiones_Oraciones from "./src/screens/N5/B3Vocabulario/B3_Profesiones_Oraciones";
import B3_Profesiones_Roleplay from "./src/screens/N5/B3Vocabulario/B3_Profesiones_Roleplay";
import B3_Profesiones_Tarjetas from "./src/screens/N5/B3Vocabulario/B3_Profesiones_Tarjetas";

// B3 — nuevas pantallas
import B3_LugaresCiudad from "./src/screens/N5/B3Vocabulario/B3_LugaresCiudad";
import B3_ObjetosClase from "./src/screens/N5/B3Vocabulario/B3_ObjetosClase";
import B3_PreguntasBasicas from "./src/screens/N5/B3Vocabulario/B3_PreguntasBasicas";

// ✅ Bloque 3 — Comida y Bebidas (NUEVO)
import B3_ColoresAdjetivos from "./src/screens/N5/B3Vocabulario/B3_ColoresAdjetivos";
import B3_ComidaBebidas from "./src/screens/N5/B3Vocabulario/B3_ComidaBebidas";
import B3_Cortesia from "./src/screens/N5/B3Vocabulario/B3_Cortesia";

// === N4 ===
import CursoN4Screen from "./src/screens/N4/CursoN4Screen";
import N4TemaScreen from "./src/screens/N4/N4TemaScreen";
import N4IntroScreen from "./src/screens/N4IntroScreen";

// === N3 ===
import N3_B2_U10_PracticeScreen from "./src/screens/N3/B2/N3_B2_U10_PracticeScreen";
import N3_B2_U1_Screen from "./src/screens/N3/B2/N3_B2_U1_Screen";
import N3_B2_U2_PracticeScreen from "./src/screens/N3/B2/N3_B2_U2_PracticeScreen";
import N3_B2_U3_PracticeScreen from "./src/screens/N3/B2/N3_B2_U3_PracticeScreen";
import N3_B2_U4_PracticeScreen from "./src/screens/N3/B2/N3_B2_U4_PracticeScreen";
import N3_B3_U1_PracticeScreen from "./src/screens/N3/B3/N3_B3_U1_PracticeScreen";
import N3_B3_U2_PracticeScreen from "./src/screens/N3/B3/N3_B3_U2_PracticeScreen";
import N3_B3_U3_PracticeScreen from "./src/screens/N3/B3/N3_B3_U3_PracticeScreen";
import N3_B3_U4_PracticeScreen from "./src/screens/N3/B3/N3_B3_U4_PracticeScreen";
import N3_B3_U5_PracticeScreen from "./src/screens/N3/B3/N3_B3_U5_PracticeScreen";
import N3_B4_U1_PracticeScreen from "./src/screens/N3/B4/N3_B4_U1_PracticeScreen";
import N3_B4_U20_PracticeScreen from "./src/screens/N3/B4/N3_B4_U20_PracticeScreen";
import N3_B4_U2_PracticeScreen from "./src/screens/N3/B4/N3_B4_U2_PracticeScreen";
import N3_B4_U3_PracticeScreen from "./src/screens/N3/B4/N3_B4_U3_PracticeScreen";
import N3_B4_U4_PracticeScreen from "./src/screens/N3/B4/N3_B4_U4_PracticeScreen";

import CursoN3Screen from "./src/screens/N3/CursoN3Screen";
import N3_Block1_Unit2Screen from "./src/screens/N3/N3_Block1_Unit2Screen";
import N3_Block1_Unit3Screen from "./src/screens/N3/N3_Block1_Unit3Screen";
import N3_Block1_Unit4Screen from "./src/screens/N3/N3_Block1_Unit4Screen";
import N3_Block1_Unit5Screen from "./src/screens/N3/N3_Block1_Unit5Screen";
import N3_UnitScreen from "./src/screens/N3/N3_UnitScreen";
import N3IntroScreen from "./src/screens/N3IntroScreen";

import n3_B5_U1Screen from "./src/screens/N3/B5/N3_B5_U1";
import N3_B5_U2_PracticeScreen from "./src/screens/N3/B5/N3_B5_U2_PracticeScreen";
import N3_B5_U3_PracticeScreen from "./src/screens/N3/B5/N3_B5_U3_PracticeScreen";
import N3_B5_U4_PracticeScreen from "./src/screens/N3/B5/N3_B5_U4_PracticeScreen";
import N3_B5_U5_PracticeScreen from "./src/screens/N3/B5/N3_B5_U5_PracticeScreen";

import N3_B6_U2_PracticeScreen from "./src/screens/N3/B6/N3_B6_U2_PracticeScreen";
import N3_B6_U3_PracticeScreen from "./src/screens/N3/B6/N3_B6_U3_PracticeScreen";
import N3_B6_U4_PracticeScreen from "./src/screens/N3/B6/N3_B6_U4_PracticeScreen";
import N3_B6_U5_PracticeScreen from "./src/screens/N3/B6/N3_B6_U5_PracticeScreen";
import N3_B6_U6_PracticeScreen from "./src/screens/N3/B6/N3_B6_U6_PracticeScreen";
import N3_FinalExamScreen from "./src/screens/N3/N3_FinalExamScreen";

// === N2 ===
import CursoN2Screen from "./src/screens/N2/N2BrowseScreen";
import N2IntroScreen from "./src/screens/N2IntroScreen";
// 🆕 Netflix-style browse para N2
import N2_B1_U1 from "./src/screens/N2/N2_B1_U1";
import N2_B1_U2 from "./src/screens/N2/N2_B1_U2";
import N2_B1_U3 from "./src/screens/N2/N2_B1_U3";
import N2_B2_U1 from "./src/screens/N2/N2_B2_U1";
import N2_B2_U2 from "./src/screens/N2/N2_B2_U2";
import N2_B2_U3 from "./src/screens/N2/N2_B2_U3";
import N2_B3_U1 from "./src/screens/N2/N2_B3_U1";
import N2_B3_U2 from "./src/screens/N2/N2_B3_U2";
import N2_B3_U3 from "./src/screens/N2/N2_B3_U3";
import N2_B4_U1 from "./src/screens/N2/N2_B4_U1";
import N2_B4_U2 from "./src/screens/N2/N2_B4_U2";
import N2_B4_U3 from "./src/screens/N2/N2_B4_U3";
import N2_B5_U1 from "./src/screens/N2/N2_B5_U1";
import N2_B5_U2 from "./src/screens/N2/N2_B5_U2";
import N2_B5_U3 from "./src/screens/N2/N2_B5_U3";
import N2BrowseScreen from "./src/screens/N2/N2BrowseScreen";

// === N1 ===
import CursoN1Screen from "./src/screens/N1/CursoN1"; // ✅ IMPORTA EL COMPONENTE REAL
import N1ExamScreen from "./src/screens/N1/N1ExamScreen";
import N1HomeScreen from "./src/screens/N1/N1HomeScreen";
import N1KanjiHubScreen from "./src/screens/N1/N1KanjiHubScreen"; // placeholder abajo
import N1KanjiLessonScreen from "./src/screens/N1/N1KanjiLessonScreen";
import N1LessonScreen from "./src/screens/N1/N1LessonScreen"; // placeholder abajo
import N1IntroScreen from "./src/screens/N1IntroScreen";

import N1GameScreen from "./src/screens/N1/N1GameScreen";
import N1KanjiMockScreen from "./src/screens/N1/N1KanjiMockScreen";
import N1QuickExamScreen from "./src/screens/N1/N1QuickExamScreen";
import N1QuizScreen from "./src/screens/N1/N1QuizScreen";

// App.tsx (imports)
import N1_CultureScreen from "./src/screens/N1/lessons/N1_CultureScreen";
import N1_EnvironmentScreen from "./src/screens/N1/lessons/N1_EnvironmentScreen";
import N1_HealthScreen from "./src/screens/N1/lessons/N1_HealthScreen";
import N1_InternationalScreen from "./src/screens/N1/lessons/N1_InternationalScreen";
import N1_LawScreen from "./src/screens/N1/lessons/N1_LawScreen";
import N1_OpinionScreen from "./src/screens/N1/lessons/N1_OpinionScreen";
import N1_TechScreen from "./src/screens/N1/lessons/N1_TechScreen";
import N1_WorkScreen from "./src/screens/N1/lessons/N1_WorkScreen";
import N1_EconomyScreen from "./src/screens/N1/N1_EconomyScreen";
import PoliticsScreen from "./src/screens/N1/PoliticsScreen";


// import
// Stack
const Stack = createNativeStackNavigator<RootStackParamList>();

function Placeholder({ title }: { title: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: "900", marginBottom: 8 }}>{title}</Text>
      <Text style={{ opacity: 0.7, textAlign: "center" }}>
        Pantalla aún no implementada. Crea {title}.tsx en /src/screens/ y actualiza App.tsx.
      </Text>
    </View>
  );
}

export default function App() {
  const newLocal = "N3_B3_U1_Practice";
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <B3ScoreProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Splash"
              screenOptions={{
                headerShown: false,
                animation: "simple_push",
                gestureEnabled: true,
                freezeOnBlur: true,
              }}
            >
              {/* === Arranque === */}
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Bienvenida" component={BienvenidaScreen} />

              {/* === Drawer principal === */}
              <Stack.Screen name="Home" component={AppDrawerNavigator} />

              {/* === N5 fuera del Drawer === */}
              <Stack.Screen name="N5Bienvenida" component={N5Bienvenida} />
              <Stack.Screen name="EntradaActividadesN5" component={EntradaActividadesN5Screen} />
              <Stack.Screen name="IntroJapones" component={IntroJaponesScreen} />

              <Stack.Screen
                name="OrigenesDelIdioma"
                component={OrigenesDelIdiomaScreen}
                options={{ headerShown: true, title: "Orígenes del idioma" }}
              />
              <Stack.Screen
  name="N5_Diagnostico"
  component={N5_DiagnosticoScreen}
  options={{ headerShown: true, title: "Examen diagnóstico N5" }}
/>

              <Stack.Screen
                name="EscrituraN5"
                component={EscrituraScreen}
                options={{ headerShown: true, title: "Sistemas de escritura" }}
              />
              <Stack.Screen
                name="CulturaN5"
                component={CulturaScreen}
                options={{ headerShown: true, title: "Cultura básica" }}
              />
              <Stack.Screen
  name="TemasBasicos"
  component={TemasBasicosScreen}
  options={{ headerShown: true, title: "Temas básicos (N5)" }}
/>

              <Stack.Screen name="Subtema" component={SubtemaScreen} options={{ headerShown: false }} />
              <Stack.Screen
                name="TemaN5"
                component={TemaN5}
                options={({ route }) => ({
                  headerShown: true,
                  title: (route?.params as any)?.title ?? "Hiragana",
                })}
              />
              <Stack.Screen name="Hiragana" component={HiraganaScreen} options={{ headerShown: false }} />

              <Stack.Screen
                name="EjemplosGrupoA"
                component={EjemplosGrupoA}
                options={{ headerShown: true, title: "Ejemplos — Grupo A" }}
              />
              <Stack.Screen
                name="VocabularioGrupoK"
                component={VocabularioGrupoK}
                options={{ headerShown: true, title: "Vocabulario — Grupo K" }}
              />
              <Stack.Screen name="ATarjetas" component={AtarjetasScreen} options={{ headerShown: false }} />
              <Stack.Screen
                name="MatchingGrupoK"
                component={MatchingGrupoK}
                options={{ headerShown: true, title: "Matching — Grupo K" }}
              />
              <Stack.Screen
                name="GifSaludo"
                component={GifSaludo}
                options={{ headerShown: true, title: "Saludos (GIF)" }}
              />
              <Stack.Screen
                name="VowelExercises"
                component={VowelExercisesScreen}
                options={{ headerShown: true, title: "Ejercicios vocales" }}
              />
              <Stack.Screen
                name="QuizCultural"
                component={QuizCultural}
                options={{ headerShown: true, title: "Quiz cultural" }}
              />
              <Stack.Screen
                name="VideoIntroModal"
                component={VideoIntroModal}
                options={{
                  headerShown: false,
                  presentation: "fullScreenModal",
                  animation: "fade",
                  contentStyle: { backgroundColor: "#000" },
                }}
              />

              {/* === HIRAGANA — GRUPO A === */}
              <Stack.Screen
                name="TrazosGrupoA"
                component={TrazosGrupoA}
                options={{ headerShown: true, title: "Trazos — Grupo A" }}
              />
              <Stack.Screen
                name="PronunciacionGrupoA"
                component={PronunciacionGrupoA}
                options={{ headerShown: true, title: "Pronunciación — Grupo A" }}
              />
              <Stack.Screen
                name="ATrazoAnimado"
                component={ATrazoAnimado}
                options={{ headerShown: true, title: "Trazo animado" }}
              />
              <Stack.Screen name="ADictadoVisual" component={ADictadoVisual} options={{ headerShown: false }} />

              {/* === Placeholders varios === */}
              <Stack.Screen
                name="TarjetasGrupoA"
                options={{ headerShown: true, title: "Tarjetas — Grupo A" }}
                children={() => <Placeholder title="TarjetasGrupoA" />}
              />
              <Stack.Screen
                name="TrazoAnimadoGrupoA"
                options={{ headerShown: true, title: "Trazo animado — Grupo A" }}
                children={() => <Placeholder title="TrazoAnimadoGrupoA" />}
              />
              <Stack.Screen
  name="TemaGramaticaFamiliaN5"
  component={TemaGramaticaFamiliaScreen} // tu componente
  options={{ title: "Tema y gramática: Familia (N5)" }}
/>

              {/* === Grupo K === */}
              <Stack.Screen
                name="TrazoGrupoK"
                component={TrazosGrupoK}
                options={{ headerShown: true, title: "Trazo — Grupo K" }}
              />
              <Stack.Screen name="MemoriaGrupoK" component={MemoriaGrupoK} options={{ headerShown: false }} />

              {/* === Familias S/T === */}
              <Stack.Screen name="FamiliaS" component={FamiliaSScreen} />
              <Stack.Screen
                name="SEscrituraGrupoS"
                component={TrazosFamiliaSZ}
                options={{ headerShown: true, title: "Escritura (S)" }}
              />
              <Stack.Screen
                name="SEjemplosGrupoS"
                component={SEjemplosGrupoS}
                options={{ headerShown: true, title: "Ejemplos (S)" }}
              />
              <Stack.Screen
                name="SCaligrafiaDigital"
                component={SCaligrafiaDigital}
                options={{ headerShown: true, title: "Caligrafía digital (S)" }}
              />
              <Stack.Screen
                name="SLecturaSilabas"
                component={SLecturaSilabas}
                options={{ headerShown: true, title: "Lectura de sílabas (S)" }}
              />
              <Stack.Screen
                name="TTrazoGif"
                component={TTrazoGif}
                options={{ headerShown: true, title: "Trazo (T)" }}
              />
              <Stack.Screen
                name="TQuizEscucha"
                component={TQuizEscucha}
                options={{ headerShown: true, title: "Quiz de escucha (T)" }}
              />

              <Stack.Screen name="FamiliaNH" component={FamiliaNHScreen} options={{ title: "Familias N y H" }} />
              <Stack.Screen name="NLecturaGuiada" component={NLecturaGuiadaScreen} options={{ title: "Lectura guiada (N)" }} />
              <Stack.Screen name="HRoleplaySaludo" component={HRoleplaySaludoScreen} options={{ title: "Roleplay: me llamo..." }} />

              {/* === Menús de unidades === */}
              <Stack.Screen name="HiraganaMMenu" component={HiraganaMMenu} options={{ title: "Hiragana M (まみむめも)" }} />
              <Stack.Screen
                name="HiraganaYRMenu"
                component={HiraganaYRMenu}
                options={{ title: "Hiragana Y–R (やゆよ・らりるれろ)" }}
              />
              <Stack.Screen
                name="HiraganaWNMenu"
                component={HiraganaWNMenu}
                options={{ title: "Hiragana W–N (わ・を・ん / contracciones)" }}
              />
              <Stack.Screen name="M_Dictado" component={M_Dictado} options={{ title: "Dictado (M)" }} />
              <Stack.Screen name="M_PracticaVoz" component={M_PracticaVoz} options={{ title: "Práctica con voz (M)" }} />
              <Stack.Screen
                name="YR_AudioInteractivo"
                component={YR_AudioInteractivo}
                options={{ title: "Audio interactivo (Y–R)" }}
              />
              <Stack.Screen
                name="YR_CompletarPalabras"
                component={YR_CompletarPalabras}
                options={{ title: "Completar palabras (Y–R)" }}
              />

              <Stack.Screen
                name="WN_LecturaFrases"
                component={WN_LecturaFrases}
                options={{ headerShown: true, title: "Lectura de frases (W–N)" }}
              />
              <Stack.Screen
                name="WN_PracticaNFinal"
                component={WN_PracticaNFinal}
                options={{ headerShown: true, title: "Cierre con ん (W–N)" }}
              />

              {/* === Katakana === */}
              <Stack.Screen name="KatakanaMenu" component={KatakanaMenu} options={{ title: "Katakana — Menú" }} />
              <Stack.Screen name="KatakanaRow" component={KatakanaRow} options={{ title: "Katakana — Práctica por fila" }} />
              <Stack.Screen name="KatakanaChallenge" component={KatakanaChallenge} options={{ title: "Katakana — Challenge" }} />

              {/* === Bloques premium / examen === */}
              <Stack.Screen name="B3VocabularioMenu" component={B3VocabularioMenu} options={{ title: "Bloque 3" }} />
              <Stack.Screen name="B4GramaticaIMenu" component={B4GramaticaIMenu} options={{ title: "Bloque 4" }} />
              <Stack.Screen name="B5GramaticaIIMenu" component={B5GramaticaIIMenu} options={{ title: "Bloque 5" }} />
              <Stack.Screen name="B6VidaCotidianaMenu" component={B6VidaCotidianaMenu} options={{ title: "Bloque 6" }} />
              <Stack.Screen name="B7LecturaPracticaMenu" component={B7LecturaPracticaMenu} options={{ title: "Bloque 7" }} />
              <Stack.Screen name="B8EvaluacionesLogrosMenu" component={B8EvaluacionesLogrosMenu} options={{ title: "Bloque 8" }} />
              <Stack.Screen name="ExamenFinalMapacheN5" component={ExamenFinalMapacheN5} options={{ title: "Examen final N5" }} />

              {/* ✅ Bloque 3: pantallas reales */}
              <Stack.Screen name="B3_NumerosEdad" component={B3_NumerosEdad} options={{ headerShown: true, title: "B3 — Números y edad" }} />
              <Stack.Screen name="B3_NumerosEdad_Roleplay" component={B3_NumerosEdad_Roleplay} options={{ headerShown: true, title: "Roleplay — Números y edad" }} />
              <Stack.Screen name="B3_NumerosEdad_Tarjetas" component={B3_NumerosEdad_Tarjetas} options={{ headerShown: true, title: "Tarjetas animadas — Números y edad" }} />
              <Stack.Screen name="B3_NumerosEdad_Contadores" component={B3_NumerosEdad_Contadores} options={{ headerShown: true, title: "Contadores — Números y edad" }} />

              <Stack.Screen name="B3_Familia" component={B3_Familia} />
              <Stack.Screen name="B3_Familia_Roleplay" component={B3_Familia_Roleplay} options={{ title: "Roleplay (Familia)" }} />
              <Stack.Screen name="B3_Familia_Tarjetas" component={B3_Familia_Tarjetas} options={{ title: "Tarjetas (Familia)" }} />
              <Stack.Screen name="B3_Familia_Arbol" component={B3_Familia_Arbol} options={{ title: "Árbol familiar" }} />

              <Stack.Screen name="B3_Profesiones" component={B3_Profesiones} options={{ headerShown: true, title: "B3 — Profesiones" }} />
              <Stack.Screen name="B3_Profesiones_Tarjetas" component={B3_Profesiones_Tarjetas} options={{ headerShown: true, title: "Tarjetas — Profesiones" }} />
              <Stack.Screen name="B3_Profesiones_Roleplay" component={B3_Profesiones_Roleplay} options={{ headerShown: true, title: "Roleplay — Profesiones" }} />
              <Stack.Screen name="B3_Profesiones_Oraciones" component={B3_Profesiones_Oraciones} options={{ headerShown: true, title: "Oraciones — Profesiones" }} />
              <Stack.Screen name="B3_Profesiones_Dialogo" component={B3_Profesiones_Dialogo} options={{ headerShown: true, title: "Diálogo y traducción" }} />

              <Stack.Screen name="B3_ObjetosClase" component={B3_ObjetosClase} options={{ headerShown: true, title: "B3 — Objetos de clase" }} />
              <Stack.Screen name="B3_LugaresCiudad" component={B3_LugaresCiudad} options={{ headerShown: true, title: "B3 — Lugares de la ciudad" }} />
              <Stack.Screen name="B3_PreguntasBasicas" component={B3_PreguntasBasicas} options={{ headerShown: true, title: "B3 — Preguntas básicas" }} />

              <Stack.Screen name="B3_ComidaBebidas" component={B3_ComidaBebidas} options={{ headerShown: true, title: "B3 — Comida y bebidas" }} />
              <Stack.Screen name="B3_ColoresAdjetivos" component={B3_ColoresAdjetivos} options={{ headerShown: true, title: "B3 — Colores y adjetivos" }} />
              <Stack.Screen name="B3_Cortesia" component={B3_Cortesia} options={{ headerShown: true, title: "B3 — Cortesía" }} />

              {/* === N4 === */}
              <Stack.Screen name="N4Intro" component={N4IntroScreen} options={{ headerShown: false }} />
              <Stack.Screen name="CursoN4" component={CursoN4Screen} options={{ headerShown: false }} />
              <Stack.Screen name="N4_Tema" component={N4TemaScreen} options={{ headerShown: false }} />

              {/* === N3 === */}
              <Stack.Screen name="N3Intro" component={N3IntroScreen} options={{ headerShown: false, contentStyle: { backgroundColor: "#000" } }} />
              <Stack.Screen name="CursoN3" component={CursoN3Screen} options={{ headerShown: false, contentStyle: { backgroundColor: "#f5f6f8" } }} />

              {/* ✅ N3 Bloque 1: rutas correctas */}
              <Stack.Screen name="N3_Unit" component={N3_UnitScreen} options={{ headerShown: false }} />
              <Stack.Screen name="N3_Block1_Unit2" component={N3_Block1_Unit2Screen} options={{ headerShown: false }} />
              <Stack.Screen name="N3_Block1_Unit3" component={N3_Block1_Unit3Screen} options={{ headerShown: false }} />
              <Stack.Screen name="N3_Block1_Unit4" component={N3_Block1_Unit4Screen} options={{ headerShown: false }} />
              <Stack.Screen name="N3_Block1_Unit5" component={N3_Block1_Unit5Screen} options={{ headerShown: false }} />

              {/* === N3 B2 === */}
              <Stack.Screen name="N3_B2_U1" component={N3_B2_U1_Screen} options={{ headerShown: false }} />
              <Stack.Screen name="N3_B2_U2_Practice" component={N3_B2_U2_PracticeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="N3_B2_U3_Practice" component={N3_B2_U3_PracticeScreen} options={{ title: "B2 — 03 Práctica" }} />
              <Stack.Screen name="N3_B2_U4_Practice" component={N3_B2_U4_PracticeScreen} options={{ title: "B2 — 04 Practice" }} />
              <Stack.Screen name="N3_B2_U10_Practice" component={N3_B2_U10_PracticeScreen} options={{ title: "B2 — 10 Práctica" }} />

              {/* === N3 B3 === */}
              <Stack.Screen name={newLocal} component={N3_B3_U1_PracticeScreen} options={{ title: "B3 — 01 Práctica" }} />
              <Stack.Screen name="N3_B3_U2_Practice" component={N3_B3_U2_PracticeScreen} options={{ headerShown: false, title: "B3 — 02 Práctica" }} />
              <Stack.Screen name="N3_B3_U3_Practice" component={N3_B3_U3_PracticeScreen} />
              <Stack.Screen name="N3_B3_U4_Practice" component={N3_B3_U4_PracticeScreen} />
              <Stack.Screen name="N3_B3_U5_Practice" component={N3_B3_U5_PracticeScreen} options={{ headerShown: false }} />

              {/* === N3 B4 === */}
              <Stack.Screen name="N3_B4_U1_Practice" component={N3_B4_U1_PracticeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="N3_B4_U2_Practice" component={N3_B4_U2_PracticeScreen} />
              <Stack.Screen name="N3_B4_U3_Practice" component={N3_B4_U3_PracticeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="N3_B4_U4_Practice" component={N3_B4_U4_PracticeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="N3_B4_U20_Practice" component={N3_B4_U20_PracticeScreen} options={{ headerShown: false }} />

              {/* === N3 B5 === */}
              <Stack.Screen name="N3_B5_U1_Practice" component={n3_B5_U1Screen} options={{ headerShown: false }} />
              <Stack.Screen name="N3_B5_U2_Practice" component={N3_B5_U2_PracticeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="N3_B5_U3_Practice" component={N3_B5_U3_PracticeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="N3_B5_U4_Practice" component={N3_B5_U4_PracticeScreen} />
              <Stack.Screen name="N3_B5_U5_Practice" component={N3_B5_U5_PracticeScreen} />

              {/* === N3 B6 === */}
              <Stack.Screen name="N3_B6_U2_Practice" component={N3_B6_U2_PracticeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="N3_B6_U3_Practice" component={N3_B6_U3_PracticeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="N3_B6_U4_Practice" component={N3_B6_U4_PracticeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="N3_B6_U5_Practice" component={N3_B6_U5_PracticeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="N3_B6_U6_Practice" component={N3_B6_U6_PracticeScreen} options={{ headerShown: false }} />

              {/* === EXAMEN FINAL N3 === */}
              <Stack.Screen name="N3_FinalExam" component={N3_FinalExamScreen} options={{ headerShown: false }} />

              {/* === N2 === */}
              <Stack.Screen name="N2Intro" component={N2IntroScreen} options={{ headerShown: false }} />
              <Stack.Screen name="CursoN2" component={CursoN2Screen} options={{ headerShown: false }} />
              {/* 🆕 Netflix-style browse */}
              <Stack.Screen name="N2Browse" component={N2BrowseScreen} options={{ headerShown: false }} />
              <Stack.Screen name="N2_B1_U1" component={N2_B1_U1} options={{ headerShown: false }} />
              <Stack.Screen name="N2_B1_U2" component={N2_B1_U2} options={{ headerShown: false }} />
              <Stack.Screen name="N2_B1_U3" component={N2_B1_U3} options={{ headerShown: false }} />
              <Stack.Screen name="N2_B2_U1" component={N2_B2_U1} options={{ headerShown: false }} />
              <Stack.Screen name="N2_B2_U2" component={N2_B2_U2} options={{ headerShown: false }} />
              <Stack.Screen name="N2_B2_U3" component={N2_B2_U3} options={{ headerShown: false }} />
              <Stack.Screen name="N2_B3_U1" component={N2_B3_U1} options={{ headerShown: false }} />
              <Stack.Screen name="N2_B3_U2" component={N2_B3_U2} options={{ headerShown: false }} />
              <Stack.Screen name="N2_B3_U3" component={N2_B3_U3} options={{ headerShown: false }} />
              <Stack.Screen name="N2_B4_U1" component={N2_B4_U1} options={{ headerShown: false }} />
              <Stack.Screen name="N2_B4_U2" component={N2_B4_U2} options={{ headerShown: false }} />
              <Stack.Screen name="N2_B4_U3" component={N2_B4_U3} options={{ headerShown: false }} />
              <Stack.Screen name="N2_B5_U1" component={N2_B5_U1} options={{ headerShown:false }} />
              <Stack.Screen name="N2_B5_U2" component={N2_B5_U2} options={{ headerShown:false }} />
              <Stack.Screen name="N2_B5_U3" component={N2_B5_U3} options={{ headerShown:false }} />

             <Stack.Screen name="N1Intro" component={N1IntroScreen} options={{ headerShown: false }} />
<Stack.Screen name="CursoN1" component={CursoN1Screen} options={{ headerShown: false }} />
<Stack.Screen name="N1Home" component={N1HomeScreen} options={{ headerShown: false }} />
<Stack.Screen name="N1Lesson" component={N1LessonScreen} options={{ headerShown: false }} />
<Stack.Screen name="N1KanjiHub" component={N1KanjiHubScreen} options={{ headerShown: false }} />
<Stack.Screen name="N1Exam" component={N1ExamScreen} options={{ headerShown: false }} />
<Stack.Screen name="N1KanjiLesson" component={N1KanjiLessonScreen} options={{ headerShown: false }} />

<Stack.Screen name="N1Quiz" component={N1QuizScreen} options={{ headerShown: false }} />
<Stack.Screen name="N1Game" component={N1GameScreen} options={{ headerShown: false }} />

<Stack.Screen name="N1KanjiMock" component={N1KanjiMockScreen} options={{ headerShown: false }} />
<Stack.Screen name="N1QuickExam" component={N1QuickExamScreen} options={{ headerShown: false }} />

<Stack.Screen name="Politics" component={PoliticsScreen} options={{ headerShown: false }} />
<Stack.Screen name="Economy"  component={N1_EconomyScreen}  options={{ headerShown: false }} />
<Stack.Screen name="N1_Tech" component={N1_TechScreen} options={{ headerShown: false }} />
<Stack.Screen name="N1_Culture" component={N1_CultureScreen} options={{ headerShown: false }} />
<Stack.Screen name="N1_Law" component={N1_LawScreen} options={{ headerShown: false }} />
<Stack.Screen name="N1_Environment" component={N1_EnvironmentScreen} options={{ headerShown: false }} />
<Stack.Screen name="N1_Health" component={N1_HealthScreen} options={{ headerShown: false }} />
<Stack.Screen name="N1_Work" component={N1_WorkScreen} options={{ headerShown: false }} />
<Stack.Screen name="N1_Opinion" component={N1_OpinionScreen} options={{ headerShown: false }} />
<Stack.Screen name="N1_International" component={N1_InternationalScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
          </NavigationContainer>
        </B3ScoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
