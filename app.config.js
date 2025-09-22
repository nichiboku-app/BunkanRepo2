// app.config.js
require("dotenv").config();

/**
 * Nota Firebase:
 * - Corrige "authDoMain" -> "authDomain".
 * - El bucket de Storage normalmente es "<project-id>.appspot.com".
 *   Si tu consola muestra otro, cámbialo aquí.
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
    owner: "escuelanichiboku",
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
        // ⬅️ permiso necesario para STT
        NSMicrophoneUsageDescription:
          "Necesitamos el micrófono para practicar diálogos de profesiones.",
      },
    },

    android: {
      package: "com.nichiboku.app",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      navigationBar: { visible: "leanback" },
      // ⬅️ permiso necesario para STT
      permissions: ["RECORD_AUDIO"],
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    extra: {
      firebase: firebaseConfig,
      eas: {
        // vincula tu proyecto local al de EAS
        projectId: "5ae8e263-4a2d-4c96-9bda-13f36917a494",
      },
    },

    plugins: [
      "expo-dev-client",
      "expo-router",
      "expo-font",
      "expo-asset", // requerido por expo doctor
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
    },
  },
};
