import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import type { RootStackParamList } from '../../types';
import OnigiriRain from '../components/OnigiriRain';

const { width, height } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OnboardingN5'>;
};

type Slide = {
  key: string;
  title: string;
  text: string;
  image: any;
};

const slides: Slide[] = [
  {
    key: 'slide1',
    title: 'Explora la cultura japonesa de forma divertida',
    text: 'Aprende mientras juegas con desafíos, minijuegos y actividades interactivas.',
    image: require('../../assets/onboarding/arcade.webp'),
  },
  {
    key: 'slide2',
    title: 'Aprende acompañado de nuevos amigos',
    text: 'Conoce personajes que te guiarán y motivarán en cada paso del nivel.',
    image: require('../../assets/onboarding/animals.webp'),
  },
  {
    key: 'slide3',
    title: 'Prepárate para el examen oficial JLPT',
    text: 'Completa este nivel y da tu primer gran paso en tu camino del idioma japonés.',
    image: require('../../assets/onboarding/mount_fuji.webp'),
  },
];

export default function OnboardingN5({ navigation }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    async function playSoundOnce() {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/onigiri.mp3')
      );
      soundRef.current = sound;
      await sound.playAsync();
    }

    playSoundOnce();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const renderItem = ({ item }: { item: Slide }) => (
    <View style={styles.slide}>
      <OnigiriRain count={12} />

      <Image source={item.image} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.text}>{item.text}</Text>

      {item.key === 'slide3' && (
        <TouchableOpacity
          onPress={() => navigation.replace('ActividadesN5')}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Comenzar</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <AppIntroSlider
      data={slides}
      renderItem={renderItem}
      onSlideChange={(i) => setCurrentSlide(i)}
      showNextButton={false}
      showSkipButton={false}
      showDoneButton={false}
      dotStyle={styles.dot}
      activeDotStyle={styles.activeDot}
    />
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    backgroundColor: '#ffeef5', // Fondo rosa tenue
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  image: {
    width: width * 0.7,
    height: height * 0.35,
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111',
    textAlign: 'center',
    marginBottom: 12,
  },
  text: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  dot: {
    backgroundColor: '#ddd',
  },
  activeDot: {
    backgroundColor: '#bf171c',
  },
  button: {
    backgroundColor: '#111',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 30,
    marginTop: 60,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
