import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'org.harpacrista.app',
  appName: 'Harpa Cristã',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 400,
      launchAutoHide: false,
      backgroundColor: '#faf6ec',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: false,
      fadeOutDuration: 100,
    },
    StatusBar: {
      backgroundColor: '#1f4f4a',
      style: 'DARK',
    },
  },
}

export default config
