import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CheckoutAlumnoScreen() {
  const [credencial, setCredencial] = useState('');
  const [credencialValida, setCredencialValida] = useState(false);
  const [validando, setValidando] = useState(false);

  const handleValidarCredencial = async () => {
    if (!credencial) {
      Alert.alert('Falta credencial', 'Ingresa tu número de credencial Bunkan.');
      return;
    }

    setValidando(true);

    try {
      // EJEMPLO: aquí deberías llamar a tu backend real
      // const res = await fetch('https://tu-backend.com/api/validar-credencial', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ credencial }),
      // });
      // const data = await res.json();
      // if (data.valida) { ... }

      // Por ahora: simulamos que cualquier código que empiece con "BKN-" es válido
      const esValida = credencial.startsWith('BKN-');

      if (esValida) {
        setCredencialValida(true);
        Alert.alert('Credencial válida', 'Puedes continuar con el pago con precio de alumno.');
      } else {
        setCredencialValida(false);
        Alert.alert('Credencial inválida', 'Revisa tu número de credencial Bunkan.');
      }
    } catch (e) {
      Alert.alert('Error', 'Hubo un problema al validar tu credencial. Intenta de nuevo.');
    } finally {
      setValidando(false);
    }
  };

  const handlePay = () => {
    if (!credencialValida) {
      Alert.alert('No validado', 'Primero valida tu número de credencial Bunkan.');
      return;
    }
    // Aquí va el flujo real de pago (Stripe / backend)
    Alert.alert('Pago simulado', 'Aquí iría el flujo real de Stripe para $250 MXN.');
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Plan alumno presencial</Text>
      <Text style={styles.subtitle}>
        Ingresa tu número de credencial Bunkan para acceder al precio especial de{' '}
        <Text style={{ fontWeight: '700' }}>$250 MXN/mes.</Text>
      </Text>

      <Text style={styles.label}>Número de credencial Bunkan</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. BKN-2024-AB8F"
        autoCapitalize="characters"
        value={credencial}
        onChangeText={setCredencial}
      />

      <TouchableOpacity style={styles.validateButton} onPress={handleValidarCredencial}>
        <Text style={styles.validateButtonText}>
          {validando ? 'Validando...' : 'Validar credencial'}
        </Text>
      </TouchableOpacity>

      {credencialValida && (
        <View style={styles.validBox}>
          <Text style={styles.validText}>✅ Credencial verificada. Precio especial activado.</Text>
        </View>
      )}

      <View style={{ height: 20 }} />

      <Text style={styles.sectionTitle}>Pago con tarjeta</Text>
      <Text style={styles.smallText}>
        Una vez validada tu credencial, paga tu suscripción con tarjeta bancaria.
      </Text>

      {/* Aquí puedes reutilizar el mismo formulario de tarjeta de la pantalla premium
          o hacer uno simplificado. Para el ejemplo: solo un botón. */}

      <TouchableOpacity style={styles.payButton} onPress={handlePay}>
        <Text style={styles.payButtonText}>Pagar $250 MXN</Text>
      </TouchableOpacity>
    </View>
  );
}

const JAPAN_RED = '#e11d2f';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  validateButton: {
    marginTop: 12,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: JAPAN_RED,
  },
  validateButtonText: {
    color: JAPAN_RED,
    fontWeight: '700',
    fontSize: 14,
  },
  validBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#dcfce7',
  },
  validText: {
    color: '#166534',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  smallText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  payButton: {
    backgroundColor: JAPAN_RED,
    marginTop: 8,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
});
