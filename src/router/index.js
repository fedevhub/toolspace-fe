import { createRouter, createWebHistory } from 'vue-router'

import AdminLayout from '@/layouts/AdminLayout.vue'
import Dashboard from '@/views/admin/Dashboard.vue'
import Pengguna from '@/views/admin/Pengguna.vue'
import Alat from '@/views/admin/Alat.vue'
import Kategori from '@/views/admin/Kategori.vue'
import Peminjaman from '@/views/admin/Peminjaman.vue'
import Pengembalian from '@/views/admin/Pengembalian.vue'
import LogAktivitas from '@/views/admin/Log-Aktivitas.vue'
import PenggunaForm from '@/components/admin/pengguna/pengguna-form.vue'
import AlatForm from '@/components/admin/alat/alat-form.vue'
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

    {
        path: '/admin',
        component: AdminLayout,
        children: [
            {
                path: 'pengembalian',
                name: 'admin-pengembalian',
                component: Pengembalian
            }
        ]
    },

    {
        path: '/admin',
        component: AdminLayout,
        children: [
            {
                path: 'log-aktivitas',
                name: 'admin-log-aktivitas',
                component: LogAktivitas
            }
        ]
    },

    {
        path: '/admin',
        component: AdminLayout,
        children: [
            {
                path: 'pengguna-form',
                name: 'admin-pengguna-form',
                component: PenggunaForm
            }
        ]
    },

    {
        path: '/admin',
        component: AdminLayout,
        children: [
            {
                path: 'alat-form',
                name: 'admin-alat-form',
                component: AlatForm
            }
        ]
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
