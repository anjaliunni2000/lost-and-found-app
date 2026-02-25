import { getMessaging, getToken } from "firebase/messaging";
import { app } from "@/lib/firebase";


const messaging = getMessaging(app);

export const getFCMToken = async () => {

  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey:  "BJvsgoykjkJHPShEwHpWhmFUk8eMIRKTWPFf_TVeHFBc-8cv8_ChRQTHR9tBJi-Nq6Kj5FA2xcN8R43KzfWWG-M"
    });

    console.log("FCM TOKEN:", token);
    return token;

  } catch (err) {
    console.error("FCM error:", err);
    return null;
  }
};
