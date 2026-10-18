import { createRouter, createWebHistory } from 'vue-router'

import AdminLayout from '@/layouts/AdminLayout.vue'
import PetugasLayout from '@/layouts/PetugasLayout.vue'
import Dashboard from '@/views/admin/Dashboard.vue'
import Pengguna from '@/views/admin/Pengguna.vue'
import Alat from '@/views/admin/Alat.vue'
import Kategori from '@/views/admin/Kategori.vue'
import Peminjaman from '@/views/admin/Peminjaman.vue'
import Pengembalian from '@/views/admin/Pengembalian.vue'
import LogAktivitas from '@/views/admin/Log-Aktivitas.vue'
import PenggunaForm from '@/components/admin/pengguna/form.vue'
import AlatForm from '@/components/admin/alat/form.vue'
import KategoriForm from '@/components/admin/kategori/form.vue'
import PeminjamanForm from '@/components/admin/peminjaman/form.vue'
import PengembalianForm from '@/components/admin/pengembalian/form.vue'

import PeminjamanPetugas from '@/views/petugas/Peminjaman.vue'
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
        children: [
            {
                path: '/admin/pengguna-form/:id?',
                name: 'admin-pengguna-form',
                component: PenggunaForm,
            }
        ]
    },

    {
        path: '/admin',
        children: [
            {
                path: 'alat-form',
                name: 'admin-alat-form',
                component: AlatForm
            }
        ]
    },

    {
        path: '/admin',
        component: AdminLayout,
        children: [
            {
                path: 'kategori-form',
                name: 'admin-kategori-form',
                component: KategoriForm
            }
        ]
    },

    {
        path: '/admin',
        children: [
            {
                path: 'peminjaman-form',
                name: 'admin-peminjaman-form',
                component: PeminjamanForm
            }
        ]
    },

    {
        path: '/admin',
        children: [
            {
                path: 'pengembalian-form',
                name: 'admin-pengembalian-form',
                component: PengembalianForm
            }
        ]
    },

    //Petugas
    {
        path: '/petugas',
        component: PetugasLayout,
        children: [
            {
                path: 'peminjaman',
                name: 'petugas-peminjaman',
                component: PeminjamanPetugas
            }
        ]
    },



]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
