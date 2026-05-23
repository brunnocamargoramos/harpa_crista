<template>
  <ion-header :translucent="true" class="hc-header">
    <ion-toolbar>
      <ion-buttons v-if="showBack" slot="start">
        <ion-back-button default-href="/" :icon="chevronBack" text="" />
      </ion-buttons>
      <ion-title>
        <div class="hc-title-wrap">
          <img
            src="@/assets/logo-icon.png"
            alt=""
            class="hc-logo"
            aria-hidden="true"
          />
          <div class="hc-title-text">
            <span class="hc-title">{{ title }}</span>
            <span v-if="subtitle" class="hc-subtitle">{{ subtitle }}</span>
          </div>
        </div>
      </ion-title>
      <ion-buttons slot="end">
        <ion-button
          id="hc-menu-trigger"
          class="hc-menu-btn"
          aria-label="Abrir menu"
        >
          <span class="hc-hamburguer" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>

    <ion-popover
      trigger="hc-menu-trigger"
      :dismiss-on-select="false"
      :show-backdrop="true"
      side="bottom"
      alignment="end"
      class="hc-menu-popover"
    >
      <ion-content class="hc-menu-content">
        <div class="hc-menu-header">
          <ion-icon :icon="colorPaletteOutline" />
          <span>Aparência</span>
        </div>
        <ion-list lines="none" class="hc-menu-lista">
          <ion-item
            button
            :detail="false"
            class="hc-menu-item"
            :class="{ 'hc-menu-item-ativo': modo === 'auto' }"
            @click="selecionar('auto')"
          >
            <ion-icon :icon="contrastOutline" slot="start" />
            <ion-label>
              <h3>Automático</h3>
              <p>Segue o sistema</p>
            </ion-label>
            <ion-icon
              v-if="modo === 'auto'"
              :icon="checkmark"
              slot="end"
              class="hc-menu-check"
            />
          </ion-item>
          <ion-item
            button
            :detail="false"
            class="hc-menu-item"
            :class="{ 'hc-menu-item-ativo': modo === 'light' }"
            @click="selecionar('light')"
          >
            <ion-icon :icon="sunnyOutline" slot="start" />
            <ion-label>
              <h3>Claro</h3>
            </ion-label>
            <ion-icon
              v-if="modo === 'light'"
              :icon="checkmark"
              slot="end"
              class="hc-menu-check"
            />
          </ion-item>
          <ion-item
            button
            :detail="false"
            class="hc-menu-item"
            :class="{ 'hc-menu-item-ativo': modo === 'sepia' }"
            @click="selecionar('sepia')"
          >
            <ion-icon :icon="bookOutline" slot="start" />
            <ion-label>
              <h3>Sépia</h3>
              <p>Tom bege pra leitura</p>
            </ion-label>
            <ion-icon
              v-if="modo === 'sepia'"
              :icon="checkmark"
              slot="end"
              class="hc-menu-check"
            />
          </ion-item>
          <ion-item
            button
            :detail="false"
            class="hc-menu-item"
            :class="{ 'hc-menu-item-ativo': modo === 'dark' }"
            @click="selecionar('dark')"
          >
            <ion-icon :icon="moonOutline" slot="start" />
            <ion-label>
              <h3>Escuro</h3>
            </ion-label>
            <ion-icon
              v-if="modo === 'dark'"
              :icon="checkmark"
              slot="end"
              class="hc-menu-check"
            />
          </ion-item>
        </ion-list>

        <div class="hc-menu-divisor"></div>

        <div class="hc-menu-header">
          <ion-icon :icon="appsOutline" />
          <span>Navegar</span>
        </div>
        <ion-list lines="none" class="hc-menu-lista">
          <ion-item
            button
            :detail="false"
            class="hc-menu-item"
            @click="navegar('listas')"
          >
            <ion-icon :icon="bookmarksOutline" slot="start" />
            <ion-label>
              <h3>Minhas listas</h3>
              <p>Coleções de hinos</p>
            </ion-label>
            <ion-icon :icon="chevronForward" slot="end" class="hc-menu-chevron" />
          </ion-item>
          <ion-item
            button
            :detail="false"
            class="hc-menu-item"
            @click="navegar('sobre')"
          >
            <ion-icon :icon="informationCircleOutline" slot="start" />
            <ion-label>
              <h3>Sobre o app</h3>
              <p>Versão, autor, licença</p>
            </ion-label>
            <ion-icon :icon="chevronForward" slot="end" class="hc-menu-chevron" />
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-popover>
  </ion-header>
</template>

<script setup lang="ts">
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonBackButton,
  IonPopover,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  popoverController,
} from '@ionic/vue'
import {
  appsOutline,
  bookOutline,
  bookmarksOutline,
  checkmark,
  chevronBack,
  chevronForward,
  colorPaletteOutline,
  contrastOutline,
  informationCircleOutline,
  moonOutline,
  sunnyOutline,
} from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { useTheme, type ModoTema } from '@/composables/useTheme'
import { useHaptics } from '@/composables/useHaptics'

withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    showBack?: boolean
  }>(),
  {
    title: 'Harpa Cristã',
    subtitle: '',
    showBack: false,
  },
)

const router = useRouter()
const { modo, setModo } = useTheme()
const haptics = useHaptics()

function selecionar(novo: ModoTema) {
  setModo(novo)
  haptics.leve()
}

async function navegar(nome: 'listas' | 'sobre') {
  haptics.leve()
  await popoverController.dismiss().catch(() => {})
  router.push({ name: nome })
}
</script>

<style scoped>
.hc-header ion-toolbar {
  --min-height: 56px;
}
.hc-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}
.hc-logo {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}
.hc-title-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
  min-width: 0;
}
.hc-title {
  font-weight: 600;
  font-size: 1.05rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hc-subtitle {
  font-weight: 400;
  font-size: 0.78rem;
  opacity: 0.85;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hc-menu-btn {
  --color: #ffffff;
  --background-hover: rgba(255, 255, 255, 0.12);
  --background-activated: rgba(255, 255, 255, 0.2);
  --border-radius: 10px;
  --padding-start: 10px;
  --padding-end: 10px;
  height: 40px;
  width: 40px;
  margin-right: 4px;
}

.hc-hamburguer {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 22px;
  height: 18px;
  gap: 4px;
}
.hc-hamburguer span {
  display: block;
  width: 22px;
  height: 2px;
  background: #ffffff;
  border-radius: 2px;
  transition: transform 200ms ease, opacity 200ms ease;
}
.hc-hamburguer span:nth-child(2) {
  width: 16px;
  align-self: flex-end;
}
.hc-menu-btn:hover .hc-hamburguer span:nth-child(2) {
  width: 22px;
}
</style>

<style>
.hc-menu-popover {
  --width: 240px;
  --max-width: 90vw;
  --border-radius: 14px;
  --box-shadow: 0 10px 32px rgba(0, 0, 0, 0.24);
  --backdrop-opacity: 0.25;
}
.hc-menu-content {
  --background: var(--ion-item-background);
}
.hc-menu-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px 6px;
  color: var(--hc-muted);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}
.hc-menu-header ion-icon {
  font-size: 0.95rem;
}
.hc-menu-lista {
  background: transparent;
  padding: 0 6px 8px;
}
.hc-menu-item {
  --background: transparent;
  --background-hover: var(--hc-divider);
  --background-activated: var(--hc-divider);
  --padding-start: 12px;
  --inner-padding-end: 12px;
  --min-height: 48px;
  --border-radius: 10px;
  border-radius: 10px;
  margin: 2px 0;
}
.hc-menu-item ion-icon[slot='start'] {
  font-size: 1.15rem;
  color: var(--hc-muted);
  margin-right: 14px;
}
.hc-menu-item h3 {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--ion-text-color);
  margin: 0;
}
.hc-menu-item p {
  font-size: 0.75rem;
  color: var(--hc-muted);
  margin: 2px 0 0;
}
.hc-menu-item-ativo {
  --background: rgba(31, 79, 74, 0.08);
}
.hc-menu-item-ativo ion-icon[slot='start'] {
  color: var(--ion-color-primary);
}
.hc-menu-item-ativo h3 {
  color: var(--ion-color-primary);
  font-weight: 600;
}
.hc-menu-check {
  color: var(--ion-color-primary);
  font-size: 1.2rem;
}
.hc-menu-chevron {
  color: var(--hc-muted);
  font-size: 1.05rem;
}
.hc-menu-divisor {
  height: 1px;
  background: var(--hc-divider);
  margin: 6px 14px;
}
:root.dark .hc-menu-item-ativo {
  --background: rgba(91, 168, 148, 0.16);
}
</style>
