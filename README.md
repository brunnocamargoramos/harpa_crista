<div align="center">
  <img src="src/assets/logo-icon.png" alt="Harpa Cristã" width="160" />

# Harpa Cristã

**Hinário completo da Harpa Cristã — rápido, bonito e funciona offline.**

[![Acessar Online](https://img.shields.io/badge/Acessar-Online-1f4f4a?style=for-the-badge&logo=googlechrome&logoColor=white)](https://brunnocamargoramos.github.io/harpa_crista/)
[![Baixar APK](https://img.shields.io/badge/Baixar-APK%20Android-5ba894?style=for-the-badge&logo=android&logoColor=white)](https://github.com/brunnocamargoramos/harpa_crista/releases/download/latest/harpa-crista.apk)

[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js&logoColor=white)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![Ionic](https://img.shields.io/badge/Ionic-8-3880ff?logo=ionic&logoColor=white)](https://ionicframework.com)
[![Capacitor](https://img.shields.io/badge/Capacitor-7-119eff?logo=capacitor&logoColor=white)](https://capacitorjs.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-5a0fc8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

</div>

---

## ✨ Funcionalidades

- 📖 **640 hinos** da Harpa Cristã com letras completas
- 🔍 **Busca inteligente** por número, título ou trecho — ignora acentos, pontuação e quebras de linha
- ⭐ **Favoritos** — salve seus hinos preferidos pra acesso rápido
- 🕘 **Recentes** — últimos hinos visitados sempre à mão
- 🌗 **Modo escuro** automático ou com toggle manual
- 🔤 **Tamanho da fonte ajustável** (80% a 240%, persistido entre sessões)
- 👆 **Gesto de deslizar** entre hinos consecutivos
- 📤 **Compartilhar** hino por WhatsApp, e-mail etc.
- 📴 **Funciona 100% offline** após primeira visita (PWA com service worker)
- 📱 **Instalável** como app no celular e desktop

## 🚀 Como usar

### Web (recomendado)

Acesse direto pelo navegador:

**👉 [brunnocamargoramos.github.io/harpa_crista](https://brunnocamargoramos.github.io/harpa_crista/)**

Pra instalar como app, abra no Chrome/Edge → menu **⋮** → **"Instalar app"**.

### Android (APK)

Baixe direto do celular:

**👉 [harpa-crista.apk](https://github.com/brunnocamargoramos/harpa_crista/releases/download/latest/harpa-crista.apk)** *(sempre a versão mais recente)*

1. Abra o link acima no navegador do celular
2. Libere "Instalar de fontes desconhecidas" pro seu navegador, se pedir
3. Abra o `.apk` baixado e toque em **Instalar**

> Releases anteriores e changelog: [github.com/brunnocamargoramos/harpa_crista/releases](https://github.com/brunnocamargoramos/harpa_crista/releases)

## 🛠️ Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | Vue 3 + Composition API + TypeScript |
| UI | Ionic 8 |
| Build | Vite 5 |
| Mobile | Capacitor 7 (Android) |
| PWA | vite-plugin-pwa + Workbox |
| Tipografia | Inter + Crimson Pro (self-hosted via @fontsource) |
| Storage | @capacitor/preferences (favoritos, recentes, tema) |

## 💻 Desenvolvimento

Requer **Node 22+**.

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento (http://localhost:8080)
npm run dev

# Build de produção
npm run build

# Build para GitHub Pages (base path /harpa_crista/)
npm run build:pages

# Sincronizar com Android e abrir no Android Studio
npm run android
```

### Scripts auxiliares

```bash
# Regenerar todos os ícones (PWA + Android launcher) a partir de src/assets/logo-icon.png
node scripts/gerar-icones.mjs

# Extrair hinos para public/hinos.json
node scripts/gerar-json-hinos.mjs
```

## 🤖 CI/CD

Cada push em `master` dispara dois workflows:

- **Build Android APK** → gera `app-debug.apk` como artefato
- **Deploy to GitHub Pages** → publica a versão web em `brunnocamargoramos.github.io/harpa_crista`

## 📂 Estrutura

```
src/
├── assets/         # Logo
├── components/     # Header reutilizável
├── composables/    # useHinos, useFavoritos, useRecentes, useTheme, useHaptics
├── router/         # Rotas (lazy-load do HinoView)
├── views/          # HomeView + HinoView
├── App.vue
├── main.ts         # Bootstrap (Ionic, fontes, plugins nativos)
└── theme.css       # Paleta + variáveis CSS + modo escuro

public/
├── hinos.json      # 640 hinos (fetched on demand)
└── pwa-*.png       # Ícones PWA

android/            # Projeto nativo (gerado pelo Capacitor)
.github/workflows/  # CI: Android APK + GitHub Pages
scripts/            # Geradores de ícones e JSON
```

---

<div align="center">

Feito com 💚 por **[Brunno Camargo](https://brunnocamargoramos.github.io)**

</div>
