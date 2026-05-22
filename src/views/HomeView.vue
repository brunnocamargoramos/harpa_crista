<template>
  <ion-page>
    <AppHeader
      title="Harpa Cristã"
      :subtitle="
        carregado ? `${itemsFiltrados.length} de ${hinos.length} hinos` : ''
      "
    />
    <ion-content
      :fullscreen="true"
      :scroll-events="true"
      ref="contentRef"
      @ionScroll="onScroll"
    >
      <div class="hc-search-wrapper">
        <ion-searchbar
          v-model="buscar"
          placeholder="Número, título ou trecho..."
          :debounce="200"
          show-clear-button="always"
          class="hc-searchbar"
          inputmode="search"
        />
        <div class="hc-chips">
          <ion-chip
            :color="filtroFav ? 'primary' : 'medium'"
            :outline="!filtroFav"
            @click="alternarFiltroFav"
          >
            <ion-icon :icon="filtroFav ? star : starOutline" />
            <ion-label>Favoritos{{ totalFav ? ` (${totalFav})` : '' }}</ion-label>
          </ion-chip>
        </div>
      </div>

      <div v-if="!carregado" class="hc-skeleton">
        <ion-spinner name="dots" />
      </div>

      <template v-else>
        <div v-if="quickJump" class="hc-quickjump" @click="abrirHino(quickJump.id)">
          <div class="hc-numero hc-numero-lg">{{ quickJump.id }}</div>
          <div class="hc-quickjump-info">
            <span class="hc-quickjump-label">Ir para o hino</span>
            <strong>{{ quickJump.titulo }}</strong>
          </div>
          <ion-icon :icon="chevronForward" class="hc-chevron" />
        </div>

        <section v-if="recentesItems.length && !buscar && !filtroFav" class="hc-secao">
          <div class="hc-secao-header">
            <h3>Recentes</h3>
            <ion-button
              fill="clear"
              size="small"
              @click="limparRecentes"
              class="hc-secao-acao"
            >
              Limpar
            </ion-button>
          </div>
          <div class="hc-recentes-row">
            <button
              v-for="item in recentesItems"
              :key="item.id"
              class="hc-recente-card"
              @click="abrirHino(item.id)"
            >
              <span class="hc-numero hc-numero-sm">{{ item.id }}</span>
              <span class="hc-recente-titulo">{{ item.titulo }}</span>
            </button>
          </div>
        </section>

        <section v-if="!buscar && !filtroFav" class="hc-secao-header hc-secao-todos">
          <h3>Todos os hinos</h3>
        </section>

        <div v-if="itemsFiltrados.length === 0" class="hc-empty">
          <ion-icon :icon="musicalNotesOutline" class="hc-empty-icon" />
          <h3>{{ filtroFav ? 'Sem favoritos ainda' : 'Nenhum hino encontrado' }}</h3>
          <p>
            {{
              filtroFav
                ? 'Toque na estrela em qualquer hino pra salvá-lo aqui.'
                : 'Tente outro termo de busca.'
            }}
          </p>
        </div>

        <ion-list v-else lines="none" class="hc-list">
          <ion-item
            v-for="item in itemsFiltrados"
            :key="item.id"
            button
            :detail="false"
            class="hc-item"
            @click="abrirHino(item.id)"
          >
            <div class="hc-numero">{{ item.id }}</div>
            <ion-label class="hc-titulo">
              <h2>{{ item.titulo }}</h2>
            </ion-label>
            <ion-icon
              v-if="ehFavorito(item.id)"
              :icon="star"
              slot="end"
              class="hc-fav-mark"
              aria-hidden="true"
            />
            <ion-icon
              slot="end"
              :icon="chevronForward"
              class="hc-chevron"
              aria-hidden="true"
            />
          </ion-item>
        </ion-list>

        <footer class="hc-powered">
          Powered by
          <a
            href="https://brunnocamargoramos.github.io"
            target="_blank"
            rel="noopener noreferrer"
            >BCR</a
          >
        </footer>
      </template>

      <ion-fab
        v-if="mostrarTopo"
        slot="fixed"
        vertical="bottom"
        horizontal="end"
      >
        <ion-fab-button size="small" @click="voltarTopo">
          <ion-icon :icon="chevronUp" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonChip,
  IonButton,
  IonFab,
  IonFabButton,
  IonSpinner,
} from '@ionic/vue'
import {
  chevronForward,
  chevronUp,
  musicalNotesOutline,
  star,
  starOutline,
} from 'ionicons/icons'
import { Preferences } from '@capacitor/preferences'
import { useHinos } from '@/composables/useHinos'
import { useRecentes } from '@/composables/useRecentes'
import { useFavoritos } from '@/composables/useFavoritos'
import { useHaptics } from '@/composables/useHaptics'
import AppHeader from '@/components/Header.vue'

const router = useRouter()
const { hinos, carregado, buscarHinos } = useHinos()
const {
  recentes,
  carregar: carregarRecentes,
  limpar: limparRecentesPrefs,
} = useRecentes()
const {
  total: totalFav,
  carregar: carregarFavs,
  ehFavorito,
} = useFavoritos()
const haptics = useHaptics()

const buscar = ref('')
const filtroFav = ref(false)
const mostrarTopo = ref(false)
const contentRef = ref<{ $el: HTMLElement } | null>(null)

function normalizar(texto: string): string {
  return texto
    .replace(/<[^>]*>/g, ' ')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const indice = computed(() =>
  hinos.value.map((h) => ({
    hino: h,
    blob: normalizar(h.titulo + ' ' + h.conteudo),
  }))
)

const baseList = computed(() => {
  if (filtroFav.value) return hinos.value.filter((h) => ehFavorito(h.id))
  return hinos.value
})

const itemsFiltrados = computed(() => {
  const termo = normalizar(buscar.value ?? '')
  if (!termo) return baseList.value

  if (/^\d+$/.test(termo)) {
    const id = Number.parseInt(termo, 10)
    return baseList.value.filter((h) => h.id === id)
  }

  const palavras = termo.split(' ').filter(Boolean)
  return indice.value
    .filter(
      ({ hino, blob }) =>
        (!filtroFav.value || ehFavorito(hino.id)) &&
        palavras.every((p) => blob.includes(p))
    )
    .map(({ hino }) => hino)
})

const quickJump = computed(() => {
  const termo = buscar.value?.trim() ?? ''
  if (!/^\d+$/.test(termo)) return null
  const id = Number.parseInt(termo, 10)
  return hinos.value.find((h) => h.id === id) ?? null
})

const recentesItems = computed(() => {
  const map = new Map(hinos.value.map((h) => [h.id, h]))
  return recentes.value
    .map((id) => map.get(id))
    .filter((h): h is NonNullable<typeof h> => Boolean(h))
})

onMounted(async () => {
  await Promise.all([buscarHinos(), carregarRecentes(), carregarFavs()])
  const { value } = await Preferences.get({ key: 'busca' })
  if (value) buscar.value = value
})

watch(buscar, async (novo) => {
  await Preferences.set({ key: 'busca', value: novo ?? '' })
})

function abrirHino(id: number) {
  haptics.leve()
  router.push({ name: 'hino', params: { id: id.toString() } })
}

function alternarFiltroFav() {
  filtroFav.value = !filtroFav.value
  haptics.leve()
}

async function limparRecentes() {
  await limparRecentesPrefs()
  haptics.leve()
}

function onScroll(ev: CustomEvent<{ scrollTop: number }>) {
  mostrarTopo.value = ev.detail.scrollTop > 400
}

async function voltarTopo() {
  const el = contentRef.value?.$el as
    | (HTMLElement & { scrollToTop?: (d?: number) => Promise<void> })
    | undefined
  if (el?.scrollToTop) await el.scrollToTop(300)
}
</script>

<style scoped>
.hc-search-wrapper {
  position: sticky;
  top: 0;
  z-index: 5;
  background: var(--ion-background-color);
  padding: 8px 4px 4px;
  border-bottom: 1px solid var(--hc-divider);
}

.hc-searchbar {
  --background: var(--ion-item-background);
  --border-radius: 12px;
  --box-shadow: var(--hc-card-shadow);
  padding: 0 8px;
}

.hc-chips {
  padding: 6px 12px 0;
  display: flex;
  gap: 6px;
}

.hc-skeleton {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.hc-quickjump {
  margin: 12px;
  padding: 14px 16px;
  background: linear-gradient(
    135deg,
    var(--ion-color-primary),
    var(--ion-color-secondary)
  );
  color: #fff;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: var(--hc-card-shadow-hover);
  cursor: pointer;
}

.hc-quickjump-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.hc-quickjump-label {
  font-size: 0.78rem;
  opacity: 0.9;
}
.hc-quickjump strong {
  font-weight: 600;
  font-size: 1rem;
}
.hc-quickjump .hc-chevron {
  color: #fff;
}

.hc-secao {
  padding: 8px 8px 0;
}
.hc-secao-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px 4px;
}
.hc-secao-header h3 {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--hc-muted);
}
.hc-secao-acao {
  --color: var(--hc-muted);
  font-size: 0.75rem;
  margin: 0;
}
.hc-secao-todos {
  padding-top: 8px;
}

.hc-recentes-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 12px 12px;
  scrollbar-width: none;
}
.hc-recentes-row::-webkit-scrollbar {
  display: none;
}
.hc-recente-card {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px 8px 8px;
  background: var(--ion-item-background);
  border: none;
  border-radius: 10px;
  box-shadow: var(--hc-card-shadow);
  cursor: pointer;
  max-width: 200px;
  font-family: inherit;
}
.hc-recente-titulo {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--ion-text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.hc-list {
  background: transparent;
  padding: 4px 8px 80px;
}

.hc-item {
  --background: var(--ion-item-background);
  --padding-start: 12px;
  --inner-padding-end: 12px;
  --min-height: 64px;
  --border-radius: 12px;
  margin-bottom: 8px;
  border-radius: 12px;
  box-shadow: var(--hc-card-shadow);
}

.hc-numero {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  margin-right: 14px;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    var(--ion-color-primary),
    var(--ion-color-primary-shade)
  );
  color: var(--ion-color-primary-contrast);
  font-weight: 700;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.02em;
}
.hc-numero-sm {
  width: 34px;
  height: 34px;
  font-size: 0.85rem;
  border-radius: 9px;
  margin-right: 0;
}
.hc-numero-lg {
  width: 56px;
  height: 56px;
  font-size: 1.2rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.2);
  margin-right: 0;
}

.hc-titulo h2 {
  font-size: 0.98rem;
  font-weight: 500;
  margin: 0;
  color: var(--ion-text-color);
}

.hc-fav-mark {
  color: var(--ion-color-secondary);
  font-size: 1rem;
  margin-right: 6px;
}

.hc-chevron {
  color: var(--hc-muted);
  font-size: 1.2rem;
}

.hc-empty {
  padding: 48px 24px;
  text-align: center;
  color: var(--hc-muted);
}
.hc-empty-icon {
  font-size: 3rem;
  color: var(--ion-color-primary);
  opacity: 0.6;
  margin-bottom: 16px;
}
.hc-empty h3 {
  margin: 0 0 4px;
  color: var(--ion-text-color);
  font-weight: 600;
}
.hc-empty p {
  margin: 0;
  font-size: 0.9rem;
}

.hc-powered {
  text-align: center;
  padding: 18px 16px 28px;
  font-size: 0.78rem;
  color: var(--hc-muted);
  letter-spacing: 0.02em;
}
.hc-powered a {
  color: var(--ion-color-primary);
  font-weight: 600;
  text-decoration: none;
}
.hc-powered a:hover {
  text-decoration: underline;
}
</style>
