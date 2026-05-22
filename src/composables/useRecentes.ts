import { ref } from 'vue'
import { Preferences } from '@capacitor/preferences'

const STORAGE_KEY = 'recentes'
const MAX = 8

const recentes = ref<number[]>([])
let carregado = false

async function carregar() {
  if (carregado) return
  carregado = true
  const { value } = await Preferences.get({ key: STORAGE_KEY })
  if (value) {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        recentes.value = parsed.filter((n) => typeof n === 'number').slice(0, MAX)
      }
    } catch {
      /* ignora */
    }
  }
}

async function registrarVisita(id: number) {
  await carregar()
  const lista = [id, ...recentes.value.filter((n) => n !== id)].slice(0, MAX)
  recentes.value = lista
  await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(lista) })
}

async function limpar() {
  recentes.value = []
  await Preferences.remove({ key: STORAGE_KEY })
}

export function useRecentes() {
  return { recentes, carregar, registrarVisita, limpar }
}
