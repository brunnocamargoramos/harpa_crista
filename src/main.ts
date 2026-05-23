import { createApp } from 'vue'
import { IonicVue } from '@ionic/vue'
import App from './App.vue'
import router from './router'

import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/crimson-pro/400.css'
import '@fontsource/crimson-pro/500.css'
import '@fontsource/crimson-pro/600.css'
import '@fontsource/crimson-pro/400-italic.css'

import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

import './theme.css'

import { Capacitor } from '@capacitor/core'

async function esconderSplash() {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide({ fadeOutDuration: 100 })
  } catch {
    /* ignora */
  }
}

async function configurarStatusBar() {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    const escuro = document.documentElement.classList.contains('dark')
    const sepia = document.documentElement.classList.contains('sepia')
    const cor = escuro ? '#102a27' : sepia ? '#6e5436' : '#1f4f4a'
    await StatusBar.setBackgroundColor({ color: cor })
    await StatusBar.setStyle({ style: Style.Dark })
  } catch {
    /* ignora */
  }
}

async function configurarDeepLinks() {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { App: CapApp } = await import('@capacitor/app')
    const tratarUrl = (url: string) => {
      const match = url.match(/hino\/(\d+)/i)
      if (match) {
        const id = match[1]
        router.replace({ name: 'hino', params: { id } })
      }
    }
    const inicial = await CapApp.getLaunchUrl()
    if (inicial?.url) tratarUrl(inicial.url)
    CapApp.addListener('appUrlOpen', (ev) => {
      if (ev.url) tratarUrl(ev.url)
    })
  } catch {
    /* ignora */
  }
}

const app = createApp(App).use(IonicVue).use(router)

router.isReady().then(() => {
  app.mount('#app')
  esconderSplash()
  configurarStatusBar()
  configurarDeepLinks()
})
