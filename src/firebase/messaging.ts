import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { app } from "@/lib/firebase";

export const getFCMToken = async () => {

  try {

    // Check if browser supports Firebase Messaging
    const supported = await isSupported();

    if (!supported) {
      console.log("Firebase messaging not supported in this browser");
      return null;
    }

    const messaging = getMessaging(app);

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: "BJvsgoykjkJHPShEwHpWhmFUk8eMIRKTWPFf_TVeHFBc-8cv8_ChRQTHR9tBJi-Nq6Kj5FA2xcN8R43KzfWWG-M"
    });

    console.log("FCM TOKEN:", token);

    return token;

  } catch (err) {

    console.error("FCM error:", err);
    return null;

  }

};