<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" :icon="chevronBack" text="" />
        </ion-buttons>
        <ion-title>
          <span class="hc-title">{{ hino?.titulo ?? 'Hino' }}</span>
          <span v-if="hino" class="hc-subtitle">Hino nº {{ hino.id }}</span>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button
            v-if="hino"
            :aria-label="favoritado ? 'Remover dos favoritos' : 'Favoritar'"
            class="hc-fav-btn"
            @click="alternarFav"
          >
            <ion-icon
              slot="icon-only"
              :icon="favoritado ? star : starOutline"
            />
          </ion-button>
          <ion-button
            v-if="hino && podeCompartilhar"
            aria-label="Compartilhar hino"
            @click="compartilhar"
          >
            <ion-icon slot="icon-only" :icon="shareSocialOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content
      :fullscreen="true"
      class="ion-padding hc-hino-content"
      ref="contentRef"
    >
      <div v-if="!carregado" class="hc-loading">
        <ion-spinner name="dots" />
      </div>

      <article v-else-if="hino" class="hc-hino-card" ref="cardRef">
        <div
          class="hino-content"
          :style="{ fontSize: tamanhoFonte + 'em' }"
          v-html="conteudoFormatado"
        ></div>
      </article>

      <div v-else class="hc-empty">
        <ion-icon :icon="alertCircleOutline" class="hc-empty-icon" />
        <h3>Hino não encontrado</h3>
      </div>
    </ion-content>
    <ion-footer class="hc-footer">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button
            :disabled="!hinoAnterior"
            aria-label="Hino anterior"
            @click="irPara(hinoAnterior)"
          >
            <ion-icon slot="icon-only" :icon="chevronBackCircleOutline" />
          </ion-button>
        </ion-buttons>
        <div class="hc-font-controls">
          <ion-button
            fill="clear"
            @click="ajustarFonte(-1)"
            :disabled="tamanhoFonte <= MIN_FONTE"
            aria-label="Diminuir fonte"
          >
            <ion-icon slot="icon-only" :icon="removeCircleOutline" />
          </ion-button>
          <span class="hc-font-label">{{ Math.round(tamanhoFonte * 100) }}%</span>
          <ion-button
            fill="clear"
            @click="ajustarFonte(1)"
            :disabled="tamanhoFonte >= MAX_FONTE"
            aria-label="Aumentar fonte"
          >
            <ion-icon slot="icon-only" :icon="addCircleOutline" />
          </ion-button>
        </div>
        <ion-buttons slot="end">
          <ion-button
            :disabled="!hinoProximo"
            aria-label="Próximo hino"
            @click="irPara(hinoProximo)"
          >
            <ion-icon slot="icon-only" :icon="chevronForwardCircleOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFooter,
  IonButtons,
  IonButton,
  IonIcon,
  IonBackButton,
  IonSpinner,
  toastController,
} from '@ionic/vue'
import {
  addCircleOutline,
  alertCircleOutline,
  chevronBack,
  chevronBackCircleOutline,
  chevronForwardCircleOutline,
  removeCircleOutline,
  shareSocialOutline,
  star,
  starOutline,
} from 'ionicons/icons'
import { Preferences } from '@capacitor/preferences'
import { Share } from '@capacitor/share'
import { Capacitor } from '@capacitor/core'
import { useHinos, type Hino } from '@/composables/useHinos'
import { useFavoritos } from '@/composables/useFavoritos'
import { useRecentes } from '@/composables/useRecentes'
import { useHaptics } from '@/composables/useHaptics'

const MIN_FONTE = 0.8
const MAX_FONTE = 2.4
const STEP = 0.1

const route = useRoute()
const router = useRouter()
const { hinos, carregado, buscarHinos } = useHinos()
const { ehFavorito, alternar: alternarFavorito, carregar: carregarFavs } =
  useFavoritos()
const { registrarVisita, carregar: carregarRecentes } = useRecentes()
const haptics = useHaptics()

const tamanhoFonte = ref(1.1)
const cardRef = ref<HTMLElement | null>(null)

const hinoId = computed(() => Number.parseInt(route.params.id as string, 10))

const hino = computed<Hino | undefined>(() =>
  hinos.value.find((h) => h.id === hinoId.value)
)

const indiceAtual = computed(() =>
  hinos.value.findIndex((h) => h.id === hinoId.value)
)

const hinoAnterior = computed<Hino | undefined>(() => {
  const i = indiceAtual.value
  return i > 0 ? hinos.value[i - 1] : undefined
})

const hinoProximo = computed<Hino | undefined>(() => {
  const i = indiceAtual.value
  return i >= 0 && i < hinos.value.length - 1 ? hinos.value[i + 1] : undefined
})

const favoritado = computed(() => (hino.value ? ehFavorito(hino.value.id) : false))

const podeCompartilhar = computed(
  () => Capacitor.isNativePlatform() || typeof navigator.share === 'function'
)

const conteudoFormatado = computed(() => {
  if (!hino.value) return ''
  let html = hino.value.conteudo
  html = html.replace(
    /(<br\s*\/?>)\s*(\d{1,2})\s*(<br\s*\/?>)/gi,
    '$1<span class="verso-num">$2</span>$3'
  )
  html = html.replace(
    /(Autor ou Tradutor:[\s\S]*?)$/i,
    '<div class="hino-autor">$1</div>'
  )
  return html
})

async function carregar() {
  await Promise.all([buscarHinos(), carregarFavs(), carregarRecentes()])
  if (hino.value) registrarVisita(hino.value.id)
  const { value } = await Preferences.get({ key: 'tamanhoFonte' })
  if (value) {
    const num = Number.parseFloat(value)
    if (!Number.isNaN(num) && num >= MIN_FONTE && num <= MAX_FONTE) {
      tamanhoFonte.value = num
    }
  }
}

onMounted(() => {
  carregar()
  configurarSwipe()
})

onUnmounted(() => {
  removerSwipe()
})

watch(hinoId, (id) => {
  if (Number.isFinite(id)) registrarVisita(id)
})

watch(tamanhoFonte, async (novo) => {
  await Preferences.set({ key: 'tamanhoFonte', value: novo.toFixed(2) })
})

function ajustarFonte(delta: number) {
  const proximo = +(tamanhoFonte.value + delta * STEP).toFixed(2)
  if (proximo >= MIN_FONTE && proximo <= MAX_FONTE) {
    tamanhoFonte.value = proximo
    haptics.leve()
  }
}

async function alternarFav() {
  if (!hino.value) return
  const ativado = await alternarFavorito(hino.value.id)
  haptics.medio()
  const toast = await toastController.create({
    message: ativado ? 'Adicionado aos favoritos' : 'Removido dos favoritos',
    duration: 1500,
    position: 'bottom',
    color: 'dark',
  })
  await toast.present()
}

async function compartilhar() {
  if (!hino.value) return
  const texto = hino.value.conteudo
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?strong>/gi, '')
    .replace(/<[^>]*>/g, '')
  const titulo = `Hino ${hino.value.id} — ${hino.value.titulo}`
  try {
    if (Capacitor.isNativePlatform()) {
      await Share.share({ title: titulo, text: `${titulo}\n\n${texto}` })
    } else if (typeof navigator.share === 'function') {
      await navigator.share({ title: titulo, text: `${titulo}\n\n${texto}` })
    }
  } catch {
    /* usuário cancelou */
  }
}

function irPara(destino: Hino | undefined) {
  if (!destino) return
  haptics.leve()
  router.replace({ name: 'hino', params: { id: destino.id.toString() } })
}

let touchStartX = 0
let touchStartY = 0
let touchTime = 0

function onTouchStart(ev: TouchEvent) {
  const t = ev.touches[0]
  touchStartX = t.clientX
  touchStartY = t.clientY
  touchTime = Date.now()
}

function onTouchEnd(ev: TouchEvent) {
  const t = ev.changedTouches[0]
  const dx = t.clientX - touchStartX
  const dy = t.clientY - touchStartY
  const dt = Date.now() - touchTime
  if (dt > 500) return
  if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.8) return
  if (dx < 0) irPara(hinoProximo.value)
  else irPara(hinoAnterior.value)
}

function configurarSwipe() {
  document.addEventListener('touchstart', onTouchStart, { passive: true })
  document.addEventListener('touchend', onTouchEnd, { passive: true })
}

function removerSwipe() {
  document.removeEventListener('touchstart', onTouchStart)
  document.removeEventListener('touchend', onTouchEnd)
}
</script>

<style scoped>
.hc-title {
  display: block;
  font-weight: 600;
  font-size: 1.05rem;
  line-height: 1.1;
}
.hc-subtitle {
  display: block;
  font-weight: 400;
  font-size: 0.78rem;
  opacity: 0.85;
  letter-spacing: 0.02em;
}

.hc-hino-content {
  --padding-top: 16px;
  --padding-bottom: 80px;
}

.hc-loading {
  display: flex;
  justify-content: center;
  padding: 64px 0;
}

.hc-hino-card {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 20px;
  background: var(--ion-item-background);
  border-radius: 16px;
  box-shadow: var(--hc-card-shadow);
}

.hc-footer ion-toolbar {
  --background: var(--ion-item-background);
  --color: var(--ion-text-color);
  border-top: 1px solid var(--hc-divider);
}

.hc-font-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.hc-font-label {
  min-width: 3.5em;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--hc-muted);
  font-variant-numeric: tabular-nums;
}

.hc-fav-btn {
  --color: #ffffff;
  font-size: 1.25rem;
}

.hc-empty {
  padding: 64px 24px;
  text-align: center;
  color: var(--hc-muted);
}

.hc-empty-icon {
  font-size: 3rem;
  color: var(--ion-color-primary);
  opacity: 0.6;
  margin-bottom: 16px;
}
</style>
