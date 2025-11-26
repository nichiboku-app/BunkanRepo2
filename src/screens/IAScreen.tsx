import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IAScreen() {
  const [message, setMessage] = useState('');

  // Por ahora no enviamos nada (prototipo)
  const handleSend = () => {
    // En el futuro aquí llamaremos a la IA real
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* HEADER */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitleJp}>AI 文館</Text>
              <Text style={styles.headerTitle}>Asistente IA de Bunkan</Text>
              <Text style={styles.headerSubtitle}>
                Próximamente: conversación real con voz y avatares anime.
              </Text>
            </View>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>PROTO</Text>
            </View>
          </View>

          {/* INFO BANNER */}
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>Transparencia ante todo 💬</Text>
            <Text style={styles.bannerText}>
              Estás viendo una vista previa del chat de IA. Aún no está conectado
              a un modelo real porque queremos implementarlo de forma responsable.
            </Text>
          </View>

          {/* “CHAT” / CONTENIDO */}
          <View style={styles.chatCard}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.chatContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Mensaje de la IA explicando la situación */}
              <View style={styles.aiRow}>
                <View style={styles.aiAvatar}>
                  <Text style={styles.aiAvatarText}>文</Text>
                </View>
                <View style={styles.aiBubble}>
                  <Text style={styles.aiName}>Bunkan IA (Próximamente)</Text>
                  <Text style={styles.aiText}>
                    Hola, estudiante de Bunkan 🌸{'\n\n'}
                    En este momento estás usando una versión prototipo de nuestra IA.
                    Aún no está conectada a un modelo real porque cada consulta a una
                    IA avanzada tiene un costo económico.{'\n\n'}
                    Somos un equipo pequeño y queremos asegurarnos de poder sostener
                    esta función sin afectar la experiencia de nadie. Antes de lanzar la
                    IA definitiva estamos evaluando:{'\n\n'}
                    • El crecimiento y la estabilidad económica de la app 📈{'\n'}
                    • Cuántos alumnos realmente usarán esta función 👩‍🎓👨‍🎓{'\n\n'}
                    Nuestro plan es ofrecer:{'\n'}
                    • Avatares de anime interactivos 🎎{'\n'}
                    • Voces naturales con conversación fluida 🎙️{'\n'}
                    • Correcciones personalizadas de japonés y guía de estudio 24/7 📚{'\n\n'}
                    Pero para lograrlo de manera responsable necesitamos tu apoyo y
                    comprensión. Si la app crece bien en este primer periodo, podremos
                    activar la IA real mucho antes de lo esperado.{'\n\n'}
                    Gracias por ser parte del proyecto Bunkan. Lo estamos construyendo juntos 🙌🇯🇵
                  </Text>
                </View>
              </View>

              {/* Mensaje de ejemplo del usuario */}
              <View style={styles.userRow}>
                <View style={styles.userBubble}>
                  <Text style={styles.userText}>
                    ¿Y cuándo podré hablar con la IA de verdad?
                  </Text>
                </View>
              </View>

              {/* Respuesta corta de la IA */}
              <View style={styles.aiRow}>
                <View style={styles.aiAvatarSmall}>
                  <Text style={styles.aiAvatarTextSmall}>文</Text>
                </View>
                <View style={styles.aiBubbleSmall}>
                  <Text style={styles.aiText}>
                    En cuanto Bunkan tenga suficiente estabilidad y apoyo de la comunidad,
                    activaremos la IA real y te avisaremos por aquí y por notificaciones. 💌
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>

          {/* BARRA DE MENSAJE (un poco más arriba, no pegada al borde) */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputCard}>
              <TextInput
                style={styles.input}
                value={message}
                onChangeText={setMessage}
                placeholder="Muy pronto podrás chatear con la IA aquí…"
                placeholderTextColor="#B3A6A6"
                editable={false} // desactivado por ahora
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSend}
                activeOpacity={0.7}
                disabled
              >
                <Text style={styles.sendButtonText}>➤</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.footerNote}>
              IA desactivada por ahora. La activaremos cuando el proyecto sea sostenible. 💡
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F3F1',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },

  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  headerTitleJp: {
    fontSize: 16,
    color: '#B80C1F',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2B1C1C',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7A5A5A',
    marginTop: 2,
  },
  headerBadge: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#2B1C1C',
  },
  headerBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // BANNER
  banner: {
    backgroundColor: '#2B1C1C',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  bannerText: {
    color: '#F7EAEA',
    fontSize: 12,
    lineHeight: 17,
  },

  // CHAT CARD
  chatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  chatContent: {
    paddingBottom: 24,
  },

  // FILA IA
  aiRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  aiAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#B80C1F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  aiAvatarText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
  },
  aiAvatarSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#B80C1F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginLeft: 2,
  },
  aiAvatarTextSmall: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  aiBubble: {
    flex: 1,
    backgroundColor: '#FDF2F4',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F2C5CE',
  },
  aiBubbleSmall: {
    flex: 1,
    backgroundColor: '#FDF2F4',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#F2C5CE',
  },
  aiName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B80C1F',
    marginBottom: 3,
  },
  aiText: {
    fontSize: 13,
    color: '#3B2626',
    lineHeight: 18,
  },

  // FILA USUARIO
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  userBubble: {
    maxWidth: '80%',
    backgroundColor: '#2B1C1C',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  userText: {
    fontSize: 13,
    color: '#FFF',
  },

  // INPUT
  inputWrapper: {
    marginTop: 10,
    // 👇 para que no quede pegado hasta abajo
    marginBottom: 6,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#2B1C1C',
    paddingVertical: 4,
    paddingRight: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
    marginTop: -2,
  },
  footerNote: {
    fontSize: 11,
    color: '#7A5A5A',
    marginTop: 4,
    textAlign: 'center',
  },
});
