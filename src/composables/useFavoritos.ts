import { computed, ref } from 'vue'
import { Preferences } from '@capacitor/preferences'

const STORAGE_KEY = 'favoritos'

const favoritos = ref<Set<number>>(new Set())
let carregado = false

async function carregar() {
  if (carregado) return
  carregado = true
  const { value } = await Preferences.get({ key: STORAGE_KEY })
  if (value) {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        favoritos.value = new Set(parsed.filter((n) => typeof n === 'number'))
      }
    } catch {
      /* ignora */
    }
  }
}

async function persistir() {
  await Preferences.set({
    key: STORAGE_KEY,
    value: JSON.stringify([...favoritos.value]),
  })
}

async function alternar(id: number): Promise<boolean> {
  await carregar()
  const novo = new Set(favoritos.value)
  const ehFavorito = novo.has(id)
  if (ehFavorito) novo.delete(id)
  else novo.add(id)
  favoritos.value = novo
  await persistir()
  return !ehFavorito
}

function ehFavorito(id: number): boolean {
  return favoritos.value.has(id)
}

const total = computed(() => favoritos.value.size)

export function useFavoritos() {
  return { favoritos, total, carregar, alternar, ehFavorito }
}
