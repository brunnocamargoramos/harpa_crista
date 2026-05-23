import { computed, ref, watch } from 'vue'

export type ModoTema = 'auto' | 'light' | 'dark' | 'sepia'
export type Tema = 'light' | 'dark' | 'sepia'

const STORAGE_KEY = 'tema'
const COR_HEADER: Record<Tema, string> = {
  light: '#1f4f4a',
  dark: '#102a27',
  sepia: '#6e5436',
}

function lerSistema(): Tema {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }
  return 'light'
}

function lerStorage(): ModoTema {
  if (typeof localStorage === 'undefined') return 'auto'
  const v = localStorage.getItem(STORAGE_KEY)
  if (v === 'light' || v === 'dark' || v === 'auto' || v === 'sepia') return v
  return 'auto'
}

const modo = ref<ModoTema>(lerStorage())
const sistemaTema = ref<Tema>(lerSistema())

if (typeof window !== 'undefined' && window.matchMedia) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = (e: MediaQueryListEvent) => {
    sistemaTema.value = e.matches ? 'dark' : 'light'
  }
  if ('addEventListener' in mq) mq.addEventListener('change', handler)
  else (mq as MediaQueryList).addListener(handler)
}

const tema = computed<Tema>(() =>
  modo.value === 'auto' ? sistemaTema.value : modo.value
)

function aplicar(t: Tema) {
  document.documentElement.classList.toggle('dark', t === 'dark')
  document.documentElement.classList.toggle('sepia', t === 'sepia')
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', COR_HEADER[t])
}

aplicar(tema.value)
watch(tema, (novo) => aplicar(novo))

function cicloTema() {
  const proximo: ModoTema =
    modo.value === 'auto'
      ? tema.value === 'dark'
        ? 'light'
        : 'dark'
      : modo.value === 'dark'
        ? 'light'
        : 'auto'
  setModo(proximo)
}

function setModo(novo: ModoTema) {
  modo.value = novo
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, novo)
  }
}

export function useTheme() {
  return { tema, modo, cicloTema, setModo }
}
