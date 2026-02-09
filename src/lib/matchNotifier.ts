
import { toast } from "@/components/ui/use-toast";

export function notifyMatch(itemName: string) {
  toast({
    title: "🎉 Item Matched!",
    description: `A match was found for: ${itemName}`,
  });
}
