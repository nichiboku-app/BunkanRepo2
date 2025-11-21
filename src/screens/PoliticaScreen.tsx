import {
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const BG_POLITICA = require('../../assets/images/drawer_bgx.webp');

export default function PoliticaScreen({ navigation }: any) {
  const handleAccept = () => {
    navigation.goBack(); // Puedes cambiar esto si quieres registrar aceptación
  };

  return (
    <View style={styles.root}>
      <ImageBackground source={BG_POLITICA} style={styles.bg} resizeMode="cover">
        <View style={styles.overlay} />

        <View style={styles.paper}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Encabezado */}
            <View style={styles.header}>
              <Text style={styles.headerJp}>ご利用規約</Text>
              <Text style={styles.headerTitle}>Políticas de la escuela</Text>
              <Text style={styles.headerSubtitle}>
                Estas políticas nos ayudan a mantener un ambiente justo, organizado y respetuoso
                para todos los alumnos y profesores.
              </Text>
            </View>

            {/* ——— Secciones (las mismas que la versión anterior) ——— */}

            {/* Sección: Asistencia */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Asistencia y reposición de clases</Text>
              <View style={styles.ruleCard}>
                <Text style={styles.ruleBullet}>•</Text>
                <Text style={styles.ruleText}>
                  Puedes faltar a clase, pero para su reposición debes hablar con tu profesor y
                  agendarla dentro del mismo mes.
                </Text>
              </View>
              <View style={styles.ruleCard}>
                <Text style={styles.ruleBullet}>•</Text>
                <Text style={styles.ruleText}>
                  Si pasa el mes sin reponer la clase, ya no tendrá derecho a reposición.
                </Text>
              </View>
              <View style={styles.ruleCard}>
                <Text style={styles.ruleBullet}>•</Text>
                <Text style={styles.ruleText}>
                  Las reposiciones dependen de la disponibilidad del profesor.
                </Text>
              </View>
            </View>

            {/* Sección: Pagos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Pagos y mensualidades</Text>

              <View style={styles.ruleCard}>
                <Text style={styles.ruleBullet}>•</Text>
                <Text style={styles.ruleText}>
                  El alumno debe pagar entre el <Text style={styles.bold}>1 y 31 de cada mes</Text>.
                </Text>
              </View>

              <View style={styles.ruleCard}>
                <Text style={styles.ruleBullet}>•</Text>
                <Text style={styles.ruleText}>
                  Si pasas esa fecha, habla con tu profesor para evitar la multa.
                </Text>
              </View>

              <View style={styles.ruleCard}>
                <Text style={styles.ruleBullet}>•</Text>
                <Text style={styles.ruleText}>
                  Los pagos no tienen reembolso una vez iniciado el mes.
                </Text>
              </View>
            </View>

            {/* Sección: Conducta */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Conducta y respeto</Text>
              <View style={styles.ruleCard}>
                <Text style={styles.ruleBullet}>•</Text>
                <Text style={styles.ruleText}>
                  Se espera respeto hacia compañeros, profesores y personal administrativo.
                </Text>
              </View>
              <View style={styles.ruleCard}>
                <Text style={styles.ruleBullet}>•</Text>
                <Text style={styles.ruleText}>No se permite lenguaje ofensivo ni acoso.</Text>
              </View>
            </View>

            {/* Sección: Materiales */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Uso de materiales y plataforma</Text>
              <View style={styles.ruleCard}>
                <Text style={styles.ruleBullet}>•</Text>
                <Text style={styles.ruleText}>
                  No compartas materiales, PDFs o videos sin autorización.
                </Text>
              </View>
            </View>

            {/* Sección: Nota final */}
            <View style={styles.footerBox}>
              <Text style={styles.footerTitle}>Actualizaciones</Text>
              <Text style={styles.footerText}>
                Las políticas pueden actualizarse. Se notificará a los alumnos mediante la app
                y las redes oficiales.
              </Text>
            </View>

            <View style={{ height: 90 }} />
          </ScrollView>
        </View>

        {/* ——— BOTÓN ACEPTAR ——— */}
        <View style={styles.acceptContainer}>
          <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
            <Text style={styles.acceptText}>ACEPTAR</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  bg: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  paper: {
    flex: 1,
    margin: 10,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.97)',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'android' ? 10 : 16,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  header: {
    marginBottom: 14,
  },
  headerJp: {
    fontSize: 16,
    color: '#B80C1F',
    fontWeight: '800',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#222',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },

  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#222',
    marginBottom: 6,
  },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  ruleBullet: {
    fontSize: 18,
    lineHeight: 20,
    color: '#B80C1F',
    marginRight: 6,
  },
  ruleText: {
    flex: 1,
    fontSize: 12,
    color: '#333',
  },
  bold: {
    fontWeight: '700',
  },

  footerBox: {
    marginTop: 4,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F7E7E8',
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B80C1F',
    marginBottom: 4,
  },
  footerText: {
    fontSize: 11,
    color: '#444',
  },

  /* ——— BOTÓN ACEPTAR ——— */
  acceptContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 10,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: '#B80C1F',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  acceptText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1,
  },
});
