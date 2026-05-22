import jimp from 'jimp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdirSync, existsSync, renameSync } from 'node:fs'

const Jimp = jimp.default ?? jimp

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const srcIcon = join(root, 'src/assets/logo-icon.png')
const publicDir = join(root, 'public')
const androidRes = join(root, 'android/app/src/main/res')

const COR_FUNDO_HEX = 0xfaf6ecff

const pwaIcons = [
  { size: 192, file: 'pwa-192.png', escala: 0.78 },
  { size: 512, file: 'pwa-512.png', escala: 0.78 },
  { size: 512, file: 'pwa-maskable-512.png', escala: 0.62 },
  { size: 180, file: 'apple-touch-icon.png', escala: 0.78 },
]

const androidMipmap = [
  { dpi: 'mdpi', size: 48 },
  { dpi: 'hdpi', size: 72 },
  { dpi: 'xhdpi', size: 96 },
  { dpi: 'xxhdpi', size: 144 },
  { dpi: 'xxxhdpi', size: 192 },
]

const androidForeground = [
  { dpi: 'mdpi', size: 108 },
  { dpi: 'hdpi', size: 162 },
  { dpi: 'xhdpi', size: 216 },
  { dpi: 'xxhdpi', size: 324 },
  { dpi: 'xxxhdpi', size: 432 },
]

function garantirDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true })
}

function fundoComLogo(tamanho, logo, escala, fundo = COR_FUNDO_HEX) {
  const canvas = new Jimp(tamanho, tamanho, fundo)
  const lado = Math.round(tamanho * escala)
  const copia = logo.clone().contain(lado, lado)
  const offset = Math.round((tamanho - lado) / 2)
  canvas.composite(copia, offset, offset)
  return canvas
}

function transparenteComLogo(tamanho, logo, escala) {
  const canvas = new Jimp(tamanho, tamanho, 0x00000000)
  const lado = Math.round(tamanho * escala)
  const copia = logo.clone().contain(lado, lado)
  const offset = Math.round((tamanho - lado) / 2)
  canvas.composite(copia, offset, offset)
  return canvas
}

async function gerarPwa(logo) {
  garantirDir(publicDir)
  for (const { size, file, escala } of pwaIcons) {
    const img = fundoComLogo(size, logo, escala)
    await img.writeAsync(join(publicDir, file))
    console.log('PWA', file, size + 'x' + size)
  }

  const fav = fundoComLogo(64, logo, 0.78)
  await fav.writeAsync(join(publicDir, 'favicon.png'))
  console.log('PWA favicon.png 64x64')
}

async function gerarAndroid(logo) {
  if (!existsSync(androidRes)) {
    console.log('android/ não encontrada, pulando')
    return
  }
  for (const { dpi, size } of androidMipmap) {
    const dir = join(androidRes, `mipmap-${dpi}`)
    garantirDir(dir)
    const img = fundoComLogo(size, logo, 0.74)
    await img.writeAsync(join(dir, 'ic_launcher.png'))
    const round = fundoComLogo(size, logo, 0.74).circle()
    await round.writeAsync(join(dir, 'ic_launcher_round.png'))
    console.log('android mipmap-' + dpi, size + 'x' + size)
  }
  for (const { dpi, size } of androidForeground) {
    const dir = join(androidRes, `mipmap-${dpi}`)
    garantirDir(dir)
    const img = transparenteComLogo(size, logo, 0.5)
    await img.writeAsync(join(dir, 'ic_launcher_foreground.png'))
    console.log('android foreground-' + dpi, size + 'x' + size)
  }
}

const logo = await Jimp.read(srcIcon)
await gerarPwa(logo)
await gerarAndroid(logo)
console.log('OK')
