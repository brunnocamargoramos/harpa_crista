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
            class="hc-header-acao"
            :class="{ 'hc-header-acao-ativa': favoritado }"
            @click="alternarFav"
          >
            <ion-icon
              slot="icon-only"
              :icon="favoritado ? heart : heartOutline"
            />
          </ion-button>
          <ion-button
            v-if="hino"
            :aria-label="
              estaEmAlgumaLista ? 'Editar listas' : 'Adicionar a uma lista'
            "
            class="hc-header-acao"
            :class="{ 'hc-header-acao-ativa': estaEmAlgumaLista }"
            @click="abrirMinhasListas"
          >
            <ion-icon
              slot="icon-only"
              :icon="estaEmAlgumaLista ? bookmark : bookmarkOutline"
            />
          </ion-button>
          <ion-button
            v-if="hino && podeCompartilhar"
            aria-label="Compartilhar hino"
            class="hc-header-acao"
            @click="compartilhar"
          >
            <ion-icon slot="icon-only" :icon="paperPlaneOutline" />
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
          :class="{ 'hc-com-highlight': highlightAtivo }"
          :style="{ fontSize: tamanhoFonte + 'em' }"
          v-html="conteudoFormatado"
          @touchstart.passive="onPressStart"
          @touchmove.passive="onPressMove"
          @touchend="onPressEnd"
          @touchcancel="onPressEnd"
          @contextmenu.prevent="onContextMenu"
        ></div>
      </article>

      <div v-else-if="idValido" class="hc-empty">
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
  actionSheetController,
  alertController,
  toastController,
} from '@ionic/vue'
import {
  addCircleOutline,
  alertCircleOutline,
  bookmark,
  bookmarkOutline,
  bookmarks,
  bookmarksOutline,
  checkmark,
  chevronBack,
  chevronBackCircleOutline,
  chevronForwardCircleOutline,
  copyOutline,
  heart,
  heartOutline,
  paperPlaneOutline,
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
import { useListas } from '@/composables/useListas'

const MIN_FONTE = 0.8
const MAX_FONTE = 2.4
const STEP = 0.1

const route = useRoute()
const router = useRouter()
const { hinos, carregado, buscarHinos } = useHinos()
const { ehFavorito, alternar: alternarFavorito, carregar: carregarFavs } =
  useFavoritos()
const { registrarVisita, carregar: carregarRecentes } = useRecentes()
const {
  listas,
  carregar: carregarListas,
  criar: criarLista,
  alternarHino: alternarHinoLista,
  listasDoHino,
} = useListas()
const haptics = useHaptics()

const tamanhoFonte = ref(1.1)
const cardRef = ref<HTMLElement | null>(null)

const hinoId = computed(() => Number.parseInt(route.params.id as string, 10))

const idValido = computed(() => Number.isFinite(hinoId.value))

const hino = computed<Hino | undefined>(() =>
  idValido.value ? hinos.value.find((h) => h.id === hinoId.value) : undefined
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

const estaEmAlgumaLista = computed(() => {
  if (!hino.value) return false
  // referência usada para reatividade
  void listas.value
  return listasDoHino(hino.value.id).length > 0
})

const podeCompartilhar = computed(
  () => Capacitor.isNativePlatform() || typeof navigator.share === 'function'
)

const termoBusca = computed(() => {
  const q = route.query.q
  if (typeof q !== 'string') return ''
  return q.trim()
})

const highlightAtivo = ref(false)
let timerHighlight: ReturnType<typeof setTimeout> | null = null

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function htmlParaTexto(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?strong>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function aplicarHighlight(html: string, termo: string): string {
  const palavras = termo
    .split(/\s+/)
    .map((p) => p.trim())
    .filter((p) => p.length >= 2)
  if (palavras.length === 0) return html
  const pattern = palavras.map(escapeRegex).join('|')
  const regex = new RegExp(`(${pattern})(?![^<]*>)`, 'gi')
  return html.replace(regex, '<mark class="hc-busca-hit">$1</mark>')
}

const conteudoFormatado = computed(() => {
  if (!hino.value) return ''
  let html = hino.value.conteudo

  let blocoAutor = ''
  const autorMatch = html.match(/Autor ou Tradutor:[\s\S]*$/i)
  if (autorMatch && autorMatch.index !== undefined) {
    blocoAutor = `<div class="hino-autor">${autorMatch[0]}</div>`
    html = html.slice(0, autorMatch.index)
  }

  const partes = html.split(/(?:<br\s*\/?>\s*){2,}/gi)
  const blocos = partes
    .map((parte) => {
      const trecho = htmlParaTexto(parte)
      if (!trecho) return ''
      const interior = parte.replace(
        /(^|<br\s*\/?>)\s*(\d{1,2})\s*(<br\s*\/?>)/gi,
        '$1<span class="verso-num">$2</span>$3',
      )
      return `<div class="hc-estrofe" data-trecho="${escapeAttr(trecho)}">${interior}</div>`
    })
    .filter(Boolean)
    .join('')

  let saida = blocos + blocoAutor
  if (termoBusca.value) saida = aplicarHighlight(saida, termoBusca.value)
  return saida
})

async function carregar() {
  await Promise.all([
    buscarHinos(),
    carregarFavs(),
    carregarRecentes(),
    carregarListas(),
  ])
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

function ativarHighlight() {
  if (timerHighlight !== null) clearTimeout(timerHighlight)
  highlightAtivo.value = true
  timerHighlight = setTimeout(() => {
    highlightAtivo.value = false
    timerHighlight = null
  }, 5000)
}

watch(
  [hinoId, termoBusca, carregado],
  () => {
    if (!termoBusca.value) {
      highlightAtivo.value = false
      if (timerHighlight !== null) {
        clearTimeout(timerHighlight)
        timerHighlight = null
      }
      return
    }
    if (carregado.value && hino.value) ativarHighlight()
  },
  { immediate: true },
)

onUnmounted(() => {
  if (timerHighlight !== null) clearTimeout(timerHighlight)
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

async function abrirMinhasListas() {
  if (!hino.value) return
  haptics.leve()
  const hinoId = hino.value.id
  const todas = listas.value
  const buttons = todas.map((l) => {
    const dentro = l.hinos.includes(hinoId)
    return {
      text: l.nome,
      icon: dentro ? checkmark : bookmarksOutline,
      cssClass: dentro ? 'hc-acao-ativa' : '',
      handler: async () => {
        const adicionou = await alternarHinoLista(l.id, hinoId)
        haptics.leve()
        await mostrarToast(
          adicionou
            ? `Adicionado em "${l.nome}"`
            : `Removido de "${l.nome}"`,
        )
      },
    }
  })
  buttons.push({
    text: todas.length === 0 ? 'Criar primeira lista' : 'Criar nova lista...',
    icon: addCircleOutline,
    cssClass: '',
    handler: async () => {
      await abrirCriarLista()
    },
  })
  const sheet = await actionSheetController.create({
    header: todas.length === 0 ? 'Você ainda não tem listas' : 'Minhas listas',
    subHeader:
      todas.length === 0
        ? 'Crie uma coleção para organizar seus hinos.'
        : 'Toque para adicionar ou remover deste hino',
    buttons: [...buttons, { text: 'Cancelar', role: 'cancel' }],
  })
  await sheet.present()
}

async function abrirCriarLista() {
  if (!hino.value) return
  const hinoId = hino.value.id
  const alert = await alertController.create({
    header: 'Nova lista',
    inputs: [
      {
        name: 'nome',
        type: 'text',
        placeholder: 'Ex.: Culto de Domingo',
        attributes: { maxlength: 60, autocapitalize: 'sentences' },
      },
    ],
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Criar',
        handler: async (dados) => {
          const nova = await criarLista(dados.nome)
          if (nova) {
            await alternarHinoLista(nova.id, hinoId)
            haptics.medio()
            await mostrarToast(`Adicionado em "${nova.nome}"`)
          }
        },
      },
    ],
  })
  await alert.present()
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

const PRESS_DURATION = 500
const PRESS_MOVE_TOLERANCE = 12
let pressTimer: ReturnType<typeof setTimeout> | null = null
let pressTrecho: string | null = null
let pressStartX = 0
let pressStartY = 0

function cancelarPress() {
  if (pressTimer !== null) {
    clearTimeout(pressTimer)
    pressTimer = null
  }
  pressTrecho = null
}

function onPressStart(ev: TouchEvent) {
  const t = ev.touches[0]
  if (!t) return
  const alvo = (ev.target as HTMLElement | null)?.closest(
    '.hc-estrofe',
  ) as HTMLElement | null
  if (!alvo) return
  const trecho = alvo.dataset.trecho
  if (!trecho) return
  pressTrecho = trecho
  pressStartX = t.clientX
  pressStartY = t.clientY
  pressTimer = setTimeout(() => {
    if (pressTrecho) abrirAcoesEstrofe(pressTrecho)
    cancelarPress()
  }, PRESS_DURATION)
}

function onPressMove(ev: TouchEvent) {
  if (pressTimer === null) return
  const t = ev.touches[0]
  if (!t) return
  if (
    Math.abs(t.clientX - pressStartX) > PRESS_MOVE_TOLERANCE ||
    Math.abs(t.clientY - pressStartY) > PRESS_MOVE_TOLERANCE
  ) {
    cancelarPress()
  }
}

function onPressEnd() {
  cancelarPress()
}

function onContextMenu(ev: MouseEvent) {
  const alvo = (ev.target as HTMLElement | null)?.closest(
    '.hc-estrofe',
  ) as HTMLElement | null
  const trecho = alvo?.dataset.trecho
  if (trecho) abrirAcoesEstrofe(trecho)
}

async function abrirAcoesEstrofe(trecho: string) {
  haptics.medio()
  const previa = trecho.length > 80 ? trecho.slice(0, 77) + '...' : trecho
  const sheet = await actionSheetController.create({
    header: 'Trecho selecionado',
    subHeader: previa,
    buttons: [
      {
        text: 'Compartilhar trecho',
        icon: shareSocialOutline,
        handler: () => {
          compartilharTrecho(trecho)
        },
      },
      {
        text: 'Copiar texto',
        icon: copyOutline,
        handler: () => {
          copiarTrecho(trecho)
        },
      },
      { text: 'Cancelar', role: 'cancel' },
    ],
  })
  await sheet.present()
}

async function compartilharTrecho(trecho: string) {
  if (!hino.value) return
  const titulo = `Hino ${hino.value.id} — ${hino.value.titulo}`
  const corpo = `${trecho}\n\n— ${titulo}`
  try {
    if (Capacitor.isNativePlatform()) {
      await Share.share({ title: titulo, text: corpo })
    } else if (typeof navigator.share === 'function') {
      await navigator.share({ title: titulo, text: corpo })
    } else {
      await copiarTexto(corpo)
      await mostrarToast('Trecho copiado')
    }
  } catch {
    /* usuário cancelou */
  }
}

async function copiarTrecho(trecho: string) {
  if (!hino.value) return
  const titulo = `Hino ${hino.value.id} — ${hino.value.titulo}`
  const ok = await copiarTexto(`${trecho}\n\n— ${titulo}`)
  if (ok) await mostrarToast('Trecho copiado')
}

async function copiarTexto(texto: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(texto)
      return true
    }
  } catch {
    /* fallback abaixo */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = texto
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    return true
  } catch {
    return false
  }
}

async function mostrarToast(mensagem: string) {
  const toast = await toastController.create({
    message: mensagem,
    duration: 1500,
    position: 'bottom',
    color: 'dark',
  })
  await toast.present()
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

.hc-header-acao {
  --color: rgba(255, 255, 255, 0.78);
  --color-hover: #ffffff;
  --color-activated: #ffffff;
  --background-hover: rgba(255, 255, 255, 0.1);
  --background-activated: rgba(255, 255, 255, 0.18);
  --border-radius: 10px;
  --padding-start: 8px;
  --padding-end: 8px;
  font-size: 1.05rem;
  height: 38px;
  width: 38px;
  margin: 0 2px;
  transition: color 200ms;
}
.hc-header-acao-ativa {
  --color: #ffffff;
}
.hc-header-acao-ativa ion-icon {
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.35));
  animation: hc-pulso 360ms ease;
}
@keyframes hc-pulso {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.18);
  }
  100% {
    transform: scale(1);
  }
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

.hino-content :deep(.hc-estrofe) {
  padding: 4px 0;
  border-radius: 6px;
  transition: background-color 200ms;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}
.hino-content :deep(.hc-estrofe:active) {
  background: var(--hc-divider);
}

.hino-content :deep(.hc-busca-hit) {
  background: transparent;
  color: inherit;
  border-radius: 3px;
  padding: 0 2px;
  transition: background-color 700ms ease, color 700ms ease;
}
.hino-content.hc-com-highlight :deep(.hc-busca-hit) {
  background: rgba(255, 213, 79, 0.55);
  color: #1c1c1c;
}
:root.dark .hino-content.hc-com-highlight :deep(.hc-busca-hit) {
  background: rgba(255, 213, 79, 0.35);
  color: inherit;
}
</style>
