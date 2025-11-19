// src/screens/ChatOnboarding.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// 🖼 Tus imágenes
const rulesImage = require('../../assets/chat/chat_rules.png');     // burbuja de texto
const samuraiImage = require('../../assets/chat/chat_samurai.png'); // samurái sentado
const logoImage = require('../../assets/logo.png');

type Props = {
  navigation: any;
};

export default function ChatOnboarding({ navigation }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [checkingFlag, setCheckingFlag] = useState(true);

  // Si ya vio el onboarding antes, lo mandamos directo al Chat
  useEffect(() => {
    (async () => {
      try {
        // 💡 Usa esta línea solo cuando quieras forzar que se muestre de nuevo:
        // await AsyncStorage.removeItem('chatOnboardingSeen');

        const seen = await AsyncStorage.getItem('chatOnboardingSeen');
        if (seen === 'true') {
          navigation.replace('Chat');
        } else {
          setCheckingFlag(false);
        }
      } catch (e) {
        console.warn('Error leyendo flag de onboarding del chat', e);
        setCheckingFlag(false);
      }
    })();
  }, [navigation]);

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else {
      try {
        await AsyncStorage.setItem('chatOnboardingSeen', 'true');
      } catch (e) {
        console.warn('Error guardando flag de onboarding del chat', e);
      }
      navigation.replace('Chat');
    }
  };

  if (checkingFlag) {
    return (
      <View
        style={[
          styles.screen,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Text style={{ color: '#333' }}>Cargando…</Text>
      </View>
    );
  }

  const isFirst = step === 1;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <Image source={logoImage} style={styles.logo} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>ChatBunkan</Text>
            <Text style={styles.headerSubtitle}>
              Espacio de conversación de la escuela
            </Text>
          </View>
        </View>

        {/* CONTENIDO PRINCIPAL */}
        <View style={styles.content}>
          <View style={styles.card}>
            {/* Imagen grande */}
            <Image
              source={isFirst ? rulesImage : samuraiImage}
              style={styles.image}
              resizeMode="contain"
            />

            {/* Bloque de texto */}
            <View style={styles.textBox}>
              {isFirst ? (
                <>
                  <Text style={styles.title}>Respeto en el chat</Text>
                  <Text style={styles.subtitle}>
                    Un samurái fuerte cuida sus palabras como cuida su espada.
                  </Text>
                  <Text style={styles.body}>
                    • Saluda y habla con respeto a todos tus compañeros.{'\n'}
                    • Nada de ataques personales, burlas o discriminación.{'\n'}
                    • Si estás molesto, respira hondo antes de responder.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.title}>Un espacio profesional</Text>
                  <Text style={styles.subtitle}>
                    Escribe como si estuvieras frente a tu sensei.
                  </Text>
                  <Text style={styles.body}>
                    • Usa el chat para practicar japonés y resolver dudas.{'\n'}
                    • Comparte recursos útiles, no spam ni cadenas.{'\n'}
                    • Recuerda: este espacio es para aprender y apoyarnos.
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* BOTONES INFERIORES */}
        <View style={styles.bottom}>
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>
              {isFirst ? 'Siguiente regla' : 'Entrar al chat'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skip}
            onPress={async () => {
              try {
                await AsyncStorage.setItem('chatOnboardingSeen', 'true');
              } catch {}
              navigation.replace('Chat');
            }}
          >
            <Text style={styles.skipText}>Saltar e ir directo al chat</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF', // fondo blanco
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 28, // un poco más abajo del status bar
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 80,  // logo más grande
    height: 80,
    marginRight: 14,
  },
  headerTitle: {
    color: '#B30000',
    fontSize: 22,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#555555',
    fontSize: 13,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 26,
    padding: 16,
    backgroundColor: '#FFFFFF', // fondo blanco de la tarjeta
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 2,
    borderColor: '#B80C1F', // marco rojo
  },
  image: {
    width: width * 0.7,
    height: height * 0.28,
    marginBottom: 16,
  },
  textBox: {
    width: '100%',
    backgroundColor: '#FDF2F3', // muy suave rosado/blanco
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111', // letras negras
    textAlign: 'left',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: '#111111',
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 70, // sube los botones ~50px
    paddingTop: 4,
  },
  button: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  skip: {
    marginTop: 8,
    alignItems: 'center',
  },
  skipText: {
    color: '#666666',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
