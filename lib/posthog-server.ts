import { PostHog } from "posthog-node";

let posthogClient: PostHog | null = null;

// Analytics are optional: when NEXT_PUBLIC_POSTHOG_KEY is not configured,
// return a no-op client so API routes can run without PostHog.
const noopClient = {
  capture: () => {},
  shutdown: async () => {},
} as unknown as PostHog;

export function getPostHogClient() {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return noopClient;
  }
  if (!posthogClient) {
    posthogClient = new PostHog(
      process.env.NEXT_PUBLIC_POSTHOG_KEY,
      {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        flushAt: 1,
        flushInterval: 0,
      }
    );
  }
  return posthogClient;
}

export async function shutdownPostHog() {
  if (posthogClient) {
    await posthogClient.shutdown();
  }
}
