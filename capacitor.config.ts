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
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
    // ▼▼▼ Add contentInset setting for status bar handling ▼▼▼
    contentInset: 'never'
  },
};

export default config;
