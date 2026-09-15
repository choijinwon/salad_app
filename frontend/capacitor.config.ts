import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.saladdelivery.app",
  appName: "Salad Delivery",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
