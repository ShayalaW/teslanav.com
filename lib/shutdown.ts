const DISABLED_VALUES = new Set(["0", "false", "off", "no"]);

function parseShutdownFlag(value: string | undefined): boolean {
  if (!value) {
    return true;
  }

  return !DISABLED_VALUES.has(value.trim().toLowerCase());
}

export const PROJECT_SHUTDOWN_ENABLED = parseShutdownFlag(
  process.env.NEXT_PUBLIC_PROJECT_SHUTDOWN
);

export const PROJECT_SHUTDOWN_MESSAGE =
  "Radar is temporarily offline. Please check back soon.";
