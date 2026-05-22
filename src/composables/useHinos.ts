import { ref, shallowRef } from 'vue'

export interface Hino {
  id: number
  titulo: string
  conteudo: string
}

const hinos = shallowRef<Hino[]>([])
const carregando = ref(false)
const carregado = ref(false)
let promessa: Promise<Hino[]> | null = null

async function buscarHinos(): Promise<Hino[]> {
  if (carregado.value) return hinos.value
  if (promessa) return promessa
  carregando.value = true
  promessa = fetch('/hinos.json')
    .then((r) => {
      if (!r.ok) throw new Error('Falha ao carregar hinos')
      return r.json() as Promise<Hino[]>
    })
    .then((dados) => {
      hinos.value = dados
      carregado.value = true
      return dados
    })
    .finally(() => {
      carregando.value = false
    })
  return promessa
}

export function useHinos() {
  return { hinos, carregando, carregado, buscarHinos }
}

export function hinoPorId(id: number): Hino | undefined {
  return hinos.value.find((h) => h.id === id)
}
