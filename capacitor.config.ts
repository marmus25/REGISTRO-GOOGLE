import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.registromusical.app',
  appName: 'Registro Musical',
  webDir: 'dist',
  server: {
    url: 'https://marmus25.github.io/REGISTRO-GOOGLE/',
    cleartext: true
  }
};

export default config;