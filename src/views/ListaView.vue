<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/listas" :icon="chevronBack" text="" />
        </ion-buttons>
        <ion-title>
          <span class="hc-title">{{ lista?.nome ?? 'Lista' }}</span>
          <span v-if="lista" class="hc-subtitle">
            {{ lista.hinos.length }}
            {{ lista.hinos.length === 1 ? 'hino' : 'hinos' }}
          </span>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button aria-label="Opções da lista" @click="abrirAcoes">
            <ion-icon slot="icon-only" :icon="ellipsisVertical" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div v-if="!carregadoTudo" class="hc-skeleton">
        <ion-spinner name="dots" />
      </div>
      <template v-else-if="!lista">
        <div class="hc-empty">
          <ion-icon :icon="alertCircleOutline" class="hc-empty-icon" />
          <h3>Lista não encontrada</h3>
          <p>Talvez tenha sido excluída.</p>
        </div>
      </template>
      <template v-else>
        <div v-if="hinosDaLista.length === 0" class="hc-empty">
          <ion-icon :icon="albumsOutline" class="hc-empty-icon" />
          <h3>Lista vazia</h3>
          <p>
            Abra qualquer hino e toque no ícone de marcador
            <ion-icon :icon="bookmarksOutline" class="hc-empty-inline" />
            pra adicioná-lo aqui.
          </p>
        </div>
        <ion-list v-else lines="none" class="hc-list">
          <ion-item-sliding v-for="hino in hinosDaLista" :key="hino.id">
            <ion-item
              button
              :detail="false"
              class="hc-item"
              @click="abrirHino(hino.id)"
            >
              <div class="hc-numero">{{ hino.id }}</div>
              <ion-label class="hc-titulo">
                <h2>{{ hino.titulo }}</h2>
              </ion-label>
              <ion-icon
                slot="end"
                :icon="chevronForward"
                class="hc-chevron"
                aria-hidden="true"
              />
            </ion-item>
            <ion-item-options side="end">
              <ion-item-option color="danger" @click="removerHino(hino.id)">
                <ion-icon slot="icon-only" :icon="trashOutline" />
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonBackButton,
  IonIcon,
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonLabel,
  IonSpinner,
  actionSheetController,
  alertController,
} from '@ionic/vue'
import {
  albumsOutline,
  alertCircleOutline,
  bookmarksOutline,
  chevronBack,
  chevronForward,
  ellipsisVertical,
  pencilOutline,
  trashOutline,
} from 'ionicons/icons'
import { useHinos } from '@/composables/useHinos'
import { useListas } from '@/composables/useListas'
import { useHaptics } from '@/composables/useHaptics'

const route = useRoute()
const router = useRouter()
const { hinos, buscarHinos } = useHinos()
const {
  listas,
  carregar: carregarListas,
  porId,
  renomear,
  deletar,
  alternarHino,
} = useListas()
const haptics = useHaptics()

const carregadoTudo = ref(false)

const listaId = computed(() => route.params.id as string)
const lista = computed(() => porId(listaId.value))

const hinosDaLista = computed(() => {
  if (!lista.value) return []
  const map = new Map(hinos.value.map((h) => [h.id, h]))
  return lista.value.hinos
    .map((id) => map.get(id))
    .filter((h): h is NonNullable<typeof h> => Boolean(h))
})

onMounted(async () => {
  await Promise.all([buscarHinos(), carregarListas()])
  carregadoTudo.value = true
  // referência usada para reatividade de listas
  void listas.value
})

function abrirHino(id: number) {
  haptics.leve()
  router.push({ name: 'hino', params: { id: id.toString() } })
}

async function removerHino(hinoId: number) {
  if (!lista.value) return
  await alternarHino(lista.value.id, hinoId)
  haptics.leve()
}

async function abrirAcoes() {
  if (!lista.value) return
  const atual = lista.value
  const sheet = await actionSheetController.create({
    header: atual.nome,
    buttons: [
      {
        text: 'Renomear lista',
        icon: pencilOutline,
        handler: () => {
          abrirRenomear(atual.nome)
        },
      },
      {
        text: 'Excluir lista',
        icon: trashOutline,
        role: 'destructive',
        handler: () => {
          confirmarDeletar(atual.nome)
        },
      },
      { text: 'Cancelar', role: 'cancel' },
    ],
  })
  await sheet.present()
}

async function abrirRenomear(nomeAtual: string) {
  if (!lista.value) return
  const id = lista.value.id
  const alert = await alertController.create({
    header: 'Renomear lista',
    inputs: [
      {
        name: 'nome',
        type: 'text',
        value: nomeAtual,
        attributes: { maxlength: 60, autocapitalize: 'sentences' },
      },
    ],
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Salvar',
        handler: async (dados) => {
          await renomear(id, dados.nome)
          haptics.leve()
        },
      },
    ],
  })
  await alert.present()
}

async function confirmarDeletar(nome: string) {
  if (!lista.value) return
  const id = lista.value.id
  const alert = await alertController.create({
    header: 'Excluir lista',
    message: `Apagar "${nome}"? Os hinos não são afetados.`,
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Excluir',
        role: 'destructive',
        handler: async () => {
          await deletar(id)
          haptics.medio()
          router.replace({ name: 'listas' })
        },
      },
    ],
  })
  await alert.present()
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
}

.hc-skeleton {
  display: flex;
  justify-content: center;
  padding: 64px 0;
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
.hc-empty h3 {
  margin: 0 0 8px;
  color: var(--ion-text-color);
  font-weight: 600;
}
.hc-empty p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}
.hc-empty-inline {
  vertical-align: -3px;
  margin: 0 2px;
  color: var(--ion-color-primary);
}

.hc-list {
  background: transparent;
  padding: 8px 8px 80px;
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
}
.hc-titulo h2 {
  font-size: 0.98rem;
  font-weight: 500;
  color: var(--ion-text-color);
  margin: 0;
}
.hc-chevron {
  color: var(--hc-muted);
  font-size: 1.2rem;
}
</style>
