import webpush from "web-push";
import { prisma } from "@/lib/prisma";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export async function sendPushNotifications(payload: PushPayload): Promise<void> {
  const subscriptions = await prisma.pushSubscription.findMany();

  if (subscriptions.length === 0) return;

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        // 410 Gone / 404 Not Found → subscription is stale, remove it
        if (status === 410 || status === 404) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          throw err;
        }
      }
    })
  );

  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`[push] Failed to send to subscription ${i}:`, result.reason);
    }
  });
}
