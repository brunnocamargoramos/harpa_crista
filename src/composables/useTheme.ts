import { ref } from 'vue'

export type Tema = 'light' | 'dark'

const STORAGE_KEY = 'tema'
const COR_HEADER: Record<Tema, string> = {
  light: '#1f4f4a',
  dark: '#102a27',
}

const tema = ref<Tema>(
  document.documentElement.classList.contains('dark') ? 'dark' : 'light'
)

function aplicar(t: Tema) {
  document.documentElement.classList.toggle('dark', t === 'dark')
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', COR_HEADER[t])
}

export function useTheme() {
  function toggleTema() {
    tema.value = tema.value === 'dark' ? 'light' : 'dark'
    aplicar(tema.value)
    localStorage.setItem(STORAGE_KEY, tema.value)
  }
  return { tema, toggleTema }
}
