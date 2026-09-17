import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pranayadesign.app',
  appName: 'Pranaya Design',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
