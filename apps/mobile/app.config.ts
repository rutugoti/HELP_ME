import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "LastMinute",
  slug: "lastminute-mobile",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  plugins: [
    [
      "expo-splash-screen",
      {
        image: "./assets/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#0F172A",
      },
    ],
  ],
  ios: {
    ...config.ios,
    supportsTablet: true,
    bundleIdentifier: "com.lastminute.app",
  },
  android: {
    ...config.android,
    package: "com.lastminute.app",
  },
  web: {
    ...config.web,
    favicon: "./assets/favicon.png",
  },
  extra: {
    apiBaseUrl: process.env.API_BASE_URL || "http://localhost:3000",
    wsUrl: process.env.WS_URL || "ws://localhost:3000",
    eas: {
      owner: "ruuuu",
      projectId: "f9da230d-f81b-47ca-86f7-05872f4b3f79",
    },
  },
});
