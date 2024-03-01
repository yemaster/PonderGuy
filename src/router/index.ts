import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('@/views/HomeView.vue')
        },
        {
            path: '/game/list',
            name: 'gamelist',
            component: () => import('@/views/LevelsView.vue')
        },
        {
            path: '/game/:id',
            name: 'game',
            component: () => import('@/views/GameView.vue')
        },
        {
            path: '/test',
            name: 'test',
            component: () => import('@/views/AboutView.vue')
        }
    ]
})

export default router
