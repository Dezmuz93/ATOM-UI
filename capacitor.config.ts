import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.atom.app',
  appName: 'A.T.O.M',
  webDir: 'out',
  bundledWebRuntime: false,
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    CapacitorCookies: {
      enabled: true,
    },
  },
  server: {
    hostname: 'localhost',
    androidScheme: 'https',
    "cleartext": true,
    "allowNavigation": ["*"]
  },
};

export default config;
