"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    appId: "com.bochang.petitrecipe",
    appName: "Petit Recipe",
    webDir: "dist",
    plugins: {
        StatusBar: {
            style: "LIGHT",
            backgroundColor: "#3498db",
            overlaysWebView: false,
        },
        Filesystem: {
            ioTimeout: 10000,
        },
    },
    server: {
        androidScheme: "https",
    },
    android: {
        allowMixedContent: true,
        webContentsDebuggingEnabled: true,
        // ▼▼▼ Add contentInset setting for status bar handling ▼▼▼
        contentInset: "never",
    },
};
exports.default = config;
