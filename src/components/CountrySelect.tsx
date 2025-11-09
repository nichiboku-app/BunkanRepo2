// src/components/CountrySelect.tsx
import { useMemo } from 'react';
import CountryPicker, {
    Country,
    CountryCode,
} from 'react-native-country-picker-modal';

// Códigos alpha-2 válidos A–Z, si no, usamos 'MX'
function sanitizeCCA2(input?: any, fallback: CountryCode = 'MX'): CountryCode {
  if (typeof input !== 'string') return fallback;
  const s = input.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(s) ? (s as CountryCode) : fallback;
}

type Props = {
  visible: boolean;
  initialCountryCode?: CountryCode | string; // aceptamos string por si viene 'XX'
  onSelect: (code: CountryCode) => void;
  onClose: () => void;
};

export default function CountrySelect({
  visible,
  initialCountryCode = 'MX',
  onSelect,
  onClose,
}: Props) {
  // garantizamos siempre un código válido (evita name/indexOf undefined)
  const safeCode = useMemo(
    () => sanitizeCCA2(initialCountryCode || 'MX', 'MX'),
    [initialCountryCode]
  );

  // Si no está visible, no renderizamos nada (evita montar el modal innecesario)
  if (!visible) return null;

  return (
    <CountryPicker
      // ✅ Modal interno del lib (no uses Modal externo)
      visible={visible}
      countryCode={safeCode}
      translation="spa"          // ✅ fuerza nombres en español (evita name undefined)
      withFilter
      withFlag
      withAlphaFilter
      withCountryNameButton={false}
      withCallingCode={false}
      withEmoji
      onSelect={(c: Country) => {
        const code = sanitizeCCA2(c?.cca2, 'MX');
        onSelect(code);
        onClose();
      }}
      onClose={onClose}
      modalProps={{
        animationType: 'slide',
        presentationStyle: 'overFullScreen',
        transparent: false,
      }}
      theme={{
        // evita warnings por fuentes no resueltas
        fontFamily: undefined,
      }}
    />
  );
}
