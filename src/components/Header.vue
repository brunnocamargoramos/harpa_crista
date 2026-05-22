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
          class="hc-tema-btn"
          :aria-label="tema === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'"
          @click="toggleTema"
        >
          <ion-icon
            slot="icon-only"
            :icon="tema === 'dark' ? sunnyOutline : moonOutline"
          />
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
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
} from '@ionic/vue'
import { chevronBack, moonOutline, sunnyOutline } from 'ionicons/icons'
import { useTheme } from '@/composables/useTheme'

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
  }
)

const { tema, toggleTema } = useTheme()
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
.hc-tema-btn {
  --color: #ffffff;
  font-size: 1.25rem;
}
</style>
