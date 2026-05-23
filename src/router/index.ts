import { createRouter, createWebHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/hino/:id?',
    name: 'hino',
    component: () => import('@/views/HinoView.vue'),
  },
  {
    path: '/listas',
    name: 'listas',
    component: () => import('@/views/ListasView.vue'),
  },
  {
    path: '/listas/:id',
    name: 'lista',
    component: () => import('@/views/ListaView.vue'),
  },
  {
    path: '/sobre',
    name: 'sobre',
    component: () => import('@/views/SobreView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
