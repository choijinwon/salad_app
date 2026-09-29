import type { CapacitorConfig } from "@capacitor/cli";

const appVariant = process.env.VITE_APP_VARIANT ?? process.env.APP_VARIANT;
const isDriverApp = appVariant === "driver";

const config: CapacitorConfig = {
  appId: isDriverApp ? "com.saladdelivery.driver" : "com.saladdelivery.customer",
  appName: isDriverApp ? "Salad Driver" : "Salad Customer",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
