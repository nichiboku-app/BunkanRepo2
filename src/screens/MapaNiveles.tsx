import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { RootStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MapaNiveles'>;
};

type Zona = {
  key: string;
  label: string;
  topPercent: number;
  leftPercent: number;
  screen: keyof RootStackParamList;
};

const { width, height } = Dimensions.get('window');
const mapaHeight = 500;

const zonas: Zona[] = [
  { key: 'n5', label: 'N5', topPercent: 0.13, leftPercent: 0.12, screen: 'RetoN5' },
  { key: 'n4', label: 'N4', topPercent: 0.42, leftPercent: 0.45, screen: 'ActividadesN4' },
  { key: 'n3', label: 'N3', topPercent: 0.52, leftPercent: 0.15, screen: 'ActividadesN3' },
  { key: 'n2', label: 'N2', topPercent: 0.71, leftPercent: 0.52, screen: 'ActividadesN2' },
  { key: 'n1', label: 'N1', topPercent: 0.33, leftPercent: 0.68, screen: 'ActividadesN1' },
];

export default function MapaNiveles({ navigation }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <ImageBackground
          source={require('../../assets/mapa.webp')}
          style={[styles.mapa, { height: mapaHeight }]}
          resizeMode="cover"
        >
          {zonas.map((zona) => (
            <TouchableOpacity
              key={zona.key}
              style={[
                styles.zona,
                {
                  top: zona.topPercent * mapaHeight,
                  left: zona.leftPercent * width,
                },
              ]}
              onPress={() => navigation.navigate(zona.screen)}
            >
              <Text style={styles.zonaText}>{zona.label}</Text>
            </TouchableOpacity>
          ))}
        </ImageBackground>

        <View style={styles.instrucciones}>
          <Text style={styles.instruccionesTitulo}>🌸 ¿Cómo funciona este mapa? 🌸</Text>

          <View style={styles.tip}>
            <Text style={styles.tipIcon}>🗺️</Text>
            <Text style={styles.tipText}>
              Toca cualquier zona del mapa para ingresar al nivel correspondiente.
            </Text>
          </View>

          <View style={styles.tip}>
            <Text style={styles.tipIcon}>🎯</Text>
            <Text style={styles.tipText}>
              Cada etapa (N5 a N1) representa un nivel del examen oficial JLPT.
            </Text>
          </View>

          <View style={styles.tip}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>
              Explora minijuegos, retos y personajes en cada etapa.
            </Text>
          </View>

          <View style={styles.tip}>
            <Text style={styles.tipIcon}>🏆</Text>
            <Text style={styles.tipText}>
              ¡Completa todos los niveles y conviértete en un maestro del japonés!
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  mapa: {
    width: width,
    position: 'relative',
  },
  zona: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zonaText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  instrucciones: {
    backgroundColor: '#ffeef5',
    paddingVertical: 32,
    paddingHorizontal: 24,
    width: '100%',
    minHeight: height * 0.45,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -10,
    elevation: 6,
  },
  instruccionesTitulo: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    color: '#bf1650',
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  tipText: {
    fontSize: 15,
    color: '#444',
    flex: 1,
  },
});
