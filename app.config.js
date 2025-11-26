// app.config.js
require("dotenv").config({ quiet: true });

/**
 * Config de Firebase
 * Se toma primero de variables de entorno y, si no existen,
 * se usan valores por defecto válidos para el proyecto "escuelanichiboku".
 *
 * IMPORTANTE:
 * - storageBucket debe ser exactamente "<project-id>.appspot.com"
 *   y coincidir con el que aparece en Firebase Console → Storage.
 */
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAbJi5h4-YnWZ5Nq0_QGf0W-IhLCdnKyHM",
  authDomain:
    process.env.FIREBASE_AUTH_DOMAIN || "escuelanichiboku.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "escuelanichiboku",
  storageBucket:
    process.env.FIREBASE_STORAGE_BUCKET || "escuelanichiboku.appspot.com", // 👈 muy importante
  messagingSenderId:
    process.env.FIREBASE_MESSAGING_SENDER_ID || "134897542862",
  appId:
    process.env.FIREBASE_APP_ID ||
    "1:134897542862:web:f779ed6c5b16bea386d29f",
};

module.exports = {
  expo: {
    name: "Escuela Nichiboku",
    slug: "escuela-nichiboku-app",
    scheme: "nichiboku", // para deep links
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/applogobunkan.webp",
    userInterfaceStyle: "automatic",

    ios: {
      bundleIdentifier: "com.nichiboku.app",
      supportsTablet: true,
      infoPlist: {
        // Permiso de micrófono para actividades de pronunciación
        NSMicrophoneUsageDescription:
          "Necesitamos acceso al micrófono para actividades de pronunciación y grabación de audio.",
      },
    },

    android: {
      package: "com.nichiboku.app",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      navigationBar: { visible: "leanback" },

      /**
       * Permisos para grabación con expo-audio / expo-av
       * RECORD_AUDIO es necesario para poder usar el micrófono.
       * Si en el futuro lees/escribes archivos fuera de cache,
       * podrías añadir también permisos de lectura de almacenamiento.
       */
      permissions: ["android.permission.RECORD_AUDIO"],
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    /**
     * extra.firebase es lo que lee tu firebaseConfig.ts
     * (Constants.expoConfig?.extra?.firebase)
     */
    extra: {
      firebase: firebaseConfig,
    },

    plugins: [
      // Navegación con expo-router
      "expo-router",

      // Fuentes personalizadas
      "expo-font",

      // Splash screen
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],

      /**
       * Reemplazo moderno de expo-av para audio (SDK 54+)
       * Ya aquí declaras el texto del permiso de micrófono.
       */
      [
        "expo-audio",
        {
          microphonePermission:
            "Permite que Nichiboku use el micrófono para prácticas de pronunciación.",
        },
      ],

      // Para video (si lo usas en la app)
      "expo-video",

      // Localización (ej: formatos de fecha/hora/lenguaje)
      "expo-localization",

      // Web browser (si abres webs dentro de la app)
      "expo-web-browser",
    ],

    experiments: {
      typedRoutes: true,
    },
  },
};
