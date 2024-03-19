import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import("@/views/HomeView.vue")
        },
        {
            path: '/help',
            name: 'help',
            component: () => import('@/views/HelpView.vue')
        },
        {
            path: '/about',
            name: 'about',
            component: () => import('@/views/AboutView.vue')
        },
        {
            path: '/game/list',
            name: 'gamelist',
            component: () => import('@/views/LevelsView.vue')
        },
        {
            path: '/game/design',
            name: 'gamedesign',
            component: () => import('@/views/DesignView.vue')
        },
        {
            path: '/game/:id',
            name: 'game',
            component: () => import('@/views/GameView.vue')
        },
        {
            path: '/settings',
            name: 'settings',
            component: () => import('@/views/SettingsView.vue')
        }
    ]
})

export default router
