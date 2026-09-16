const env = import.meta.env as Record<string, string | undefined>;

export const USE_MOCK = (env.VITE_USE_MOCK ?? env.EXPO_PUBLIC_USE_MOCK ?? "true") !== "false";
