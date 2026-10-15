import { pathToFileURL } from "node:url";
import { loadEnv } from "vite";

export function validateNetlifyEnvironment(env) {
  if (!env.VITE_KAKAO_MAP_APP_KEY?.trim()) {
    throw new Error("VITE_KAKAO_MAP_APP_KEY is required for production maps. Set it in Netlify's production environment with the Builds scope, then rebuild.");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    validateNetlifyEnvironment(loadEnv("production", process.cwd(), "VITE_"));
    console.log("Production map configuration verified.");
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Production map configuration is missing.");
    process.exitCode = 1;
  }
}
