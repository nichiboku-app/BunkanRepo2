// app.config.js
require("dotenv").config({ quiet: true });

/**
 * Config de Firebase
 * - authDomain corregido.
 * - storageBucket usualmente "<project-id>.appspot.com".
 * - Lee primero de variables de entorno y usa fallback válidos.
 */
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAbJi5h4-YnWZ5Nq0_QGf0W-IhLCdnKyHM",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "escuelanichiboku.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "escuelanichiboku",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "escuelanichiboku.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "134897542862",
  appId: process.env.FIREBASE_APP_ID || "1:134897542862:web:f779ed6c5b16bea386d29f",
};

module.exports = {
  expo: {
    name: "Escuela Nichiboku",
    slug: "escuela-nichiboku-app",
    scheme: "nichiboku", // deep links
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
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
      // Permisos para grabación con expo-audio
      permissions: ["android.permission.RECORD_AUDIO"],
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    extra: {
      firebase: firebaseConfig,
    },

    plugins: [
      // ✅ Requerido por tu proyecto
      "expo-router",
      "expo-font",

      // ✅ Splash
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],

      // ✅ Reemplazo de expo-av (SDK 54+)
      [
        "expo-audio",
        {
          microphonePermission:
            "Permite que Nichiboku use el micrófono para prácticas de pronunciación.",
        },
      ],
      "expo-video",

      // ✅ Necesario para el warning que te salió (localización regional)
      "expo-localization",

      // ✅ Mantengo tu web browser
      "expo-web-browser",
    ],

    experiments: {
      typedRoutes: true,
    },
  },
};
