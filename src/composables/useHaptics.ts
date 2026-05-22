import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { Capacitor } from '@capacitor/core'

const ativo = Capacitor.isNativePlatform()

async function leve() {
  if (!ativo) return
  try {
    await Haptics.impact({ style: ImpactStyle.Light })
  } catch {
    /* ignora */
  }
}

async function medio() {
  if (!ativo) return
  try {
    await Haptics.impact({ style: ImpactStyle.Medium })
  } catch {
    /* ignora */
  }
}

async function selecao() {
  if (!ativo) return
  try {
    await Haptics.selectionStart()
    await Haptics.selectionChanged()
    await Haptics.selectionEnd()
  } catch {
    /* ignora */
  }
}

export function useHaptics() {
  return { leve, medio, selecao }
}
