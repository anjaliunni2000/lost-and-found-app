
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { auth } from "@/lib/firebase";

export default function NotificationBell() {
  const user = auth.currentUser;
  const notifications = useNotifications(user?.uid || null);

  return (
    <div className="relative">
      <Bell className="w-5 h-5" />
      {notifications.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
          {notifications.length}
        </span>
      )}

      <div className="absolute right-0 mt-2 w-72 bg-background border rounded shadow">
        {notifications.length === 0 && (
          <p className="p-2 text-sm">No notifications</p>
        )}
        {notifications.map(n => (
          <div key={n.id} className="p-2 border-b text-sm">
            <p>{n.message}</p>
            <p className="text-xs text-muted-foreground">
              Match confidence: {n.confidence}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
