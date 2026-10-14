import { createRouter, createWebHistory } from 'vue-router'

import AdminLayout from '@/layouts/AdminLayout.vue'
import Dashboard from '@/views/admin/Dashboard.vue'
import Pengguna from '@/views/admin/Pengguna.vue'
import Alat from '@/views/admin/Alat.vue'
import Kategori from '@/views/admin/Kategori.vue'
import Peminjaman from '@/views/admin/Peminjaman.vue'
import Login from '@/views/auth/Login.vue'

const routes = [
    {
        path: '/',
        children: [
            {
                path: 'login',
                name: 'login',
                component: Login
            }
        ]
    },

    {
        path: '/admin',
        component: AdminLayout,
        children: [
            {
                path: 'dashboard',
                name: 'admin-dashboard',
                component: Dashboard
            }
        ]
    },

    {
        path: '/admin',
        component: AdminLayout,
        children: [
            {
                path: 'pengguna',
                name: 'admin-pengguna',
                component: Pengguna
            }
        ]
    },

    {
        path: '/admin',
        component: AdminLayout,
        children: [
            {
                path: 'alat',
                name: 'admin-alat',
                component: Alat
            }
        ]
    },

    {
        path: '/admin',
        component: AdminLayout,
        children: [
            {
                path: 'kategori',
                name: 'admin-kategori',
                component: Kategori
            }
        ]
    },

    {
        path: '/admin',
        component: AdminLayout,
        children: [
            {
                path: 'peminjaman',
                name: 'admin-peminjaman',
                component: Peminjaman
            }
        ]
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router