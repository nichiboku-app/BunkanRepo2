// src/services/pushNotifications.ts
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const isExpoGo = Constants.appOwnership === "expo";

export async function registerForPushNotificationsAsync() {
  // En Expo Go (SDK 53) ya no hay push remoto
  if (isExpoGo) {
    console.log(
      "[notifications] Saltando registro de push en Expo Go (SDK 53+). Usa dev build o producción para probar push."
    );
    return null;
  }

  try {
    // Permisos
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("[notifications] Permiso NO otorgado");
      return null;
    }

    // projectId para EAS
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    const token = tokenData.data;

    console.log("[notifications] Push token:", token);

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    return token;
  } catch (e) {
    console.warn("[notifications] Error registrando push:", e);
    return null;
  }
}
