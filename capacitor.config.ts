import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.bochang.petitrecipe",
  appName: "Petit Recipe",
  webDir: "dist",
  plugins: {
    StatusBar: {
      style: "DARK",
      backgroundColor: "#2C3E50",
      overlaysWebView: false,
    },
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
