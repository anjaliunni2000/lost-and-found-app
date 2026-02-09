
import { createNotification } from "@/lib/notificationService";

export async function handleItemMatch(
  userId: string,
  itemName: string,
  similarityScore: number
) {
  const confidence = Math.round(similarityScore * 100);

  if (confidence > 70) {
    await createNotification(
      userId,
      `Your item "${itemName}" has been matched`,
      confidence
    );
    // Email notification can be triggered via Firebase Functions (conceptual)
  }
}
