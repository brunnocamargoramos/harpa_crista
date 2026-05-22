import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const src = readFileSync(join(root, 'src/assets/hinosHarpa.ts'), 'utf8')
const jsonText = src
  .replace(/^export\s+const\s+hinos\s*=\s*/, '')
  .replace(/;\s*$/, '')
  .trim()

const parsed = JSON.parse(jsonText)
writeFileSync(
  join(root, 'public/hinos.json'),
  JSON.stringify(parsed),
  'utf8'
)
console.log('public/hinos.json', parsed.length, 'hinos')
