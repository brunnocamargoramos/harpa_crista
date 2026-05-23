<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" :icon="chevronBack" text="" />
        </ion-buttons>
        <ion-title>
          <span class="hc-title">Minhas listas</span>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button aria-label="Nova lista" @click="abrirCriarLista">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="hc-listas-content">
      <div v-if="listas.length === 0" class="hc-listas-empty">
        <ion-icon :icon="albumsOutline" class="hc-listas-empty-icon" />
        <h3>Nenhuma lista ainda</h3>
        <p>
          Crie coleções como "Culto de Domingo", "Santa Ceia" ou "Casamento" pra
          organizar seus hinos preferidos.
        </p>
        <ion-button shape="round" @click="abrirCriarLista">
          <ion-icon slot="start" :icon="addOutline" />
          Criar primeira lista
        </ion-button>
      </div>

      <ion-list v-else lines="none" class="hc-listas-list">
        <ion-item-sliding v-for="l in listas" :key="l.id">
          <ion-item button :detail="false" class="hc-lista-item" @click="abrir(l.id)">
            <div class="hc-lista-icone">
              <ion-icon :icon="bookmarksOutline" />
            </div>
            <ion-label>
              <h2>{{ l.nome }}</h2>
              <p>{{ l.hinos.length }} {{ l.hinos.length === 1 ? 'hino' : 'hinos' }}</p>
            </ion-label>
            <ion-icon
              slot="end"
              :icon="chevronForward"
              class="hc-chevron"
              aria-hidden="true"
            />
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option color="medium" @click="abrirRenomear(l)">
              <ion-icon slot="icon-only" :icon="pencilOutline" />
            </ion-item-option>
            <ion-item-option color="danger" @click="confirmarDeletar(l)">
              <ion-icon slot="icon-only" :icon="trashOutline" />
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
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
  alertController,
} from '@ionic/vue'
import {
  addOutline,
  albumsOutline,
  bookmarksOutline,
  chevronBack,
  chevronForward,
  pencilOutline,
  trashOutline,
} from 'ionicons/icons'
import { useListas, type Lista } from '@/composables/useListas'
import { useHaptics } from '@/composables/useHaptics'

const router = useRouter()
const { listas, carregar, criar, renomear, deletar } = useListas()
const haptics = useHaptics()

onMounted(() => {
  carregar()
})

function abrir(id: string) {
  haptics.leve()
  router.push({ name: 'lista', params: { id } })
}

async function abrirCriarLista() {
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
          const nova = await criar(dados.nome)
          if (nova) {
            haptics.medio()
            router.push({ name: 'lista', params: { id: nova.id } })
          }
        },
      },
    ],
  })
  await alert.present()
}

async function abrirRenomear(lista: Lista) {
  const alert = await alertController.create({
    header: 'Renomear lista',
    inputs: [
      {
        name: 'nome',
        type: 'text',
        value: lista.nome,
        attributes: { maxlength: 60, autocapitalize: 'sentences' },
      },
    ],
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Salvar',
        handler: async (dados) => {
          await renomear(lista.id, dados.nome)
          haptics.leve()
        },
      },
    ],
  })
  await alert.present()
}

async function confirmarDeletar(lista: Lista) {
  const alert = await alertController.create({
    header: 'Excluir lista',
    message: `Tem certeza que quer apagar "${lista.nome}"? Os hinos não são afetados.`,
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Excluir',
        role: 'destructive',
        handler: async () => {
          await deletar(lista.id)
          haptics.medio()
        },
      },
    ],
  })
  await alert.present()
}
</script>

<style scoped>
.hc-title {
  font-weight: 600;
  font-size: 1.05rem;
}

.hc-listas-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 64px 24px;
  color: var(--hc-muted);
}
.hc-listas-empty-icon {
  font-size: 3.5rem;
  color: var(--ion-color-primary);
  opacity: 0.5;
  margin-bottom: 16px;
}
.hc-listas-empty h3 {
  margin: 0 0 8px;
  color: var(--ion-text-color);
  font-size: 1.1rem;
  font-weight: 600;
}
.hc-listas-empty p {
  margin: 0 0 24px;
  font-size: 0.92rem;
  line-height: 1.45;
  max-width: 320px;
}

.hc-listas-list {
  background: transparent;
  padding: 8px;
}
.hc-lista-item {
  --background: var(--ion-item-background);
  --padding-start: 14px;
  --inner-padding-end: 14px;
  --min-height: 72px;
  --border-radius: 14px;
  margin-bottom: 8px;
  border-radius: 14px;
  box-shadow: var(--hc-card-shadow);
}
.hc-lista-icone {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    var(--ion-color-primary),
    var(--ion-color-primary-shade)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ion-color-primary-contrast);
  margin-right: 14px;
  flex-shrink: 0;
}
.hc-lista-icone ion-icon {
  font-size: 1.3rem;
}
.hc-lista-item h2 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ion-text-color);
  margin: 0;
}
.hc-lista-item p {
  font-size: 0.78rem;
  color: var(--hc-muted);
  margin: 2px 0 0;
}
.hc-chevron {
  color: var(--hc-muted);
  font-size: 1.2rem;
}
</style>
