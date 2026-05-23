import { computed, ref } from 'vue'
import { Preferences } from '@capacitor/preferences'

const STORAGE_KEY = 'listas_v1'

export interface Lista {
  id: string
  nome: string
  hinos: number[]
  criadaEm: number
}

const listas = ref<Lista[]>([])
let carregado = false

function novoId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function ehLista(obj: unknown): obj is Lista {
  if (!obj || typeof obj !== 'object') return false
  const l = obj as Lista
  return (
    typeof l.id === 'string' &&
    typeof l.nome === 'string' &&
    Array.isArray(l.hinos) &&
    l.hinos.every((n) => typeof n === 'number') &&
    typeof l.criadaEm === 'number'
  )
}

async function carregar() {
  if (carregado) return
  carregado = true
  const { value } = await Preferences.get({ key: STORAGE_KEY })
  if (!value) return
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) {
      listas.value = parsed.filter(ehLista)
    }
  } catch {
    /* ignora */
  }
}

async function persistir() {
  await Preferences.set({
    key: STORAGE_KEY,
    value: JSON.stringify(listas.value),
  })
}

async function criar(nome: string): Promise<Lista | null> {
  const limpo = nome.trim()
  if (!limpo) return null
  await carregar()
  const lista: Lista = {
    id: novoId(),
    nome: limpo,
    hinos: [],
    criadaEm: Date.now(),
  }
  listas.value = [...listas.value, lista]
  await persistir()
  return lista
}

async function renomear(id: string, nome: string): Promise<void> {
  const limpo = nome.trim()
  if (!limpo) return
  await carregar()
  listas.value = listas.value.map((l) =>
    l.id === id ? { ...l, nome: limpo } : l,
  )
  await persistir()
}

async function deletar(id: string): Promise<void> {
  await carregar()
  listas.value = listas.value.filter((l) => l.id !== id)
  await persistir()
}

async function alternarHino(
  listaId: string,
  hinoId: number,
): Promise<boolean> {
  await carregar()
  let dentro = false
  listas.value = listas.value.map((l) => {
    if (l.id !== listaId) return l
    if (l.hinos.includes(hinoId)) {
      return { ...l, hinos: l.hinos.filter((h) => h !== hinoId) }
    }
    dentro = true
    return { ...l, hinos: [...l.hinos, hinoId] }
  })
  await persistir()
  return dentro
}

function porId(id: string): Lista | undefined {
  return listas.value.find((l) => l.id === id)
}

function ehMembro(listaId: string, hinoId: number): boolean {
  const l = porId(listaId)
  return l ? l.hinos.includes(hinoId) : false
}

function listasDoHino(hinoId: number): Lista[] {
  return listas.value.filter((l) => l.hinos.includes(hinoId))
}

const totalListas = computed(() => listas.value.length)

export function useListas() {
  return {
    listas,
    totalListas,
    carregar,
    criar,
    renomear,
    deletar,
    alternarHino,
    porId,
    ehMembro,
    listasDoHino,
  }
}
