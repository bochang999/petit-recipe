import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.bochang.petitrecipe",
  appName: "Petit Recipe",
  webDir: "dist",
  plugins: {
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#3498db",
      overlaysWebView: false,
    },
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
