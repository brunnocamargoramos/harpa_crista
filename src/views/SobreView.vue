<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" :icon="chevronBack" text="" />
        </ion-buttons>
        <ion-title>
          <span class="hc-title">Sobre</span>
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding hc-sobre">
      <div class="hc-sobre-hero">
        <img
          src="@/assets/logo-icon.png"
          alt="Harpa Cristã"
          class="hc-sobre-logo"
        />
        <h1 class="hc-sobre-titulo">Harpa Cristã</h1>
        <p class="hc-sobre-subtitulo">
          Hinário completo — rápido, bonito e funciona offline.
        </p>
        <span class="hc-sobre-versao">v{{ versao }}</span>
      </div>

      <div class="hc-sobre-secao">
        <div class="hc-sobre-linha">
          <ion-icon :icon="musicalNotesOutline" />
          <span>{{ totalHinos }} hinos catalogados</span>
        </div>
        <div class="hc-sobre-linha">
          <ion-icon :icon="cloudOfflineOutline" />
          <span>Funciona 100% offline após a primeira visita</span>
        </div>
        <div class="hc-sobre-linha">
          <ion-icon :icon="phonePortraitOutline" />
          <span>Web, Android (APK) e PWA instalável</span>
        </div>
      </div>

      <div class="hc-sobre-secao">
        <h3 class="hc-sobre-secao-titulo">Desenvolvido por</h3>
        <a
          href="https://brunnocamargoramos.github.io"
          target="_blank"
          rel="noopener noreferrer"
          class="hc-sobre-link-card"
        >
          <div class="hc-sobre-link-info">
            <strong>Brunno Camargo</strong>
            <span>brunnocamargoramos.github.io</span>
          </div>
          <ion-icon :icon="openOutline" />
        </a>
      </div>

      <div class="hc-sobre-secao">
        <h3 class="hc-sobre-secao-titulo">Código & Licença</h3>
        <a
          href="https://github.com/brunnocamargoramos/harpa_crista"
          target="_blank"
          rel="noopener noreferrer"
          class="hc-sobre-link-card"
        >
          <ion-icon :icon="logoGithub" class="hc-sobre-link-icone" />
          <div class="hc-sobre-link-info">
            <strong>Repositório no GitHub</strong>
            <span>brunnocamargoramos/harpa_crista</span>
          </div>
          <ion-icon :icon="openOutline" />
        </a>
        <a
          href="https://github.com/brunnocamargoramos/harpa_crista/blob/master/LICENSE"
          target="_blank"
          rel="noopener noreferrer"
          class="hc-sobre-link-card"
        >
          <ion-icon :icon="documentTextOutline" class="hc-sobre-link-icone" />
          <div class="hc-sobre-link-info">
            <strong>Licença MIT</strong>
            <span>Código aberto e livre</span>
          </div>
          <ion-icon :icon="openOutline" />
        </a>
      </div>

      <p class="hc-sobre-rodape">
        Feito com 💚 — a letra dos hinos é de domínio público.
      </p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonIcon,
} from '@ionic/vue'
import {
  chevronBack,
  cloudOfflineOutline,
  documentTextOutline,
  logoGithub,
  musicalNotesOutline,
  openOutline,
  phonePortraitOutline,
} from 'ionicons/icons'
import { useHinos } from '@/composables/useHinos'

const versao = __APP_VERSION__
const { hinos, buscarHinos } = useHinos()

const totalHinos = computed(() => hinos.value.length || 640)

onMounted(() => {
  buscarHinos()
})
</script>

<style scoped>
.hc-title {
  font-weight: 600;
  font-size: 1.05rem;
}

.hc-sobre {
  --padding-top: 8px;
}

.hc-sobre-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 16px 8px;
}
.hc-sobre-logo {
  width: 110px;
  height: 110px;
  border-radius: 24px;
  box-shadow: var(--hc-card-shadow-hover);
  margin-bottom: 16px;
}
.hc-sobre-titulo {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--ion-text-color);
}
.hc-sobre-subtitulo {
  margin: 6px 0 12px;
  color: var(--hc-muted);
  font-size: 0.95rem;
  max-width: 320px;
  line-height: 1.4;
}
.hc-sobre-versao {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.hc-sobre-secao {
  max-width: 520px;
  margin: 24px auto 0;
}
.hc-sobre-secao-titulo {
  margin: 0 0 8px;
  padding: 0 4px;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--hc-muted);
  font-weight: 600;
}

.hc-sobre-linha {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--ion-item-background);
  border-radius: 12px;
  margin-bottom: 8px;
  box-shadow: var(--hc-card-shadow);
  font-size: 0.92rem;
  color: var(--ion-text-color);
}
.hc-sobre-linha ion-icon {
  font-size: 1.15rem;
  color: var(--ion-color-primary);
  flex-shrink: 0;
}

.hc-sobre-link-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--ion-item-background);
  border-radius: 12px;
  margin-bottom: 8px;
  box-shadow: var(--hc-card-shadow);
  text-decoration: none;
  color: var(--ion-text-color);
  transition: transform 100ms, box-shadow 200ms;
}
.hc-sobre-link-card:active {
  transform: scale(0.99);
  box-shadow: var(--hc-card-shadow-hover);
}
.hc-sobre-link-icone {
  font-size: 1.4rem;
  color: var(--ion-color-primary);
  flex-shrink: 0;
}
.hc-sobre-link-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.hc-sobre-link-info strong {
  font-size: 0.95rem;
  font-weight: 600;
}
.hc-sobre-link-info span {
  font-size: 0.78rem;
  color: var(--hc-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hc-sobre-link-card > ion-icon:last-child {
  font-size: 1.05rem;
  color: var(--hc-muted);
}

.hc-sobre-rodape {
  text-align: center;
  color: var(--hc-muted);
  font-size: 0.82rem;
  margin: 28px 16px 12px;
}
</style>
