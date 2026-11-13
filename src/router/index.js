import { createRouter, createWebHistory } from 'vue-router'

import AdminLayout from '@/layouts/AdminLayout.vue'
import PetugasLayout from '@/layouts/PetugasLayout.vue'
import PeminjamLayout from '@/layouts/PeminjamLayout.vue'
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
import PengembalianPetugas from '@/views/petugas/Pengembalian.vue'
import LaporanPetugas from '@/views/petugas/Laporan.vue'
import Login from '@/views/auth/Login.vue'
import DashboardPeminjam from '@/views/peminjam/Dashboard.vue'
import AlatPeminjam from '@/views/peminjam/Alat.vue'
import PengembalianPeminjam from '@/views/peminjam/Pengembalian.vue'

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
        path: '/peminjam',
        component: PeminjamLayout,
        children: [
            {
                path: 'dashboard',
                name: 'peminjam-dashboard',
                component: DashboardPeminjam,
            },
            {
                path: 'peminjaman-form',
                name: 'peminjam-peminjaman-form',
                component: PeminjamanForm,
            },
            {
                path: 'alat',
                name: 'peminjam-alat',
                component: AlatPeminjam,
            },
            {
                path: 'pengembalian',
                name: 'peminjam-pengembalian',
                component: PengembalianPeminjam,
            },
        ],
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
                path: 'alat-form/:id?',
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
                path: 'peminjaman-form/:id?',
                name: 'admin-peminjaman-form',
                component: PeminjamanForm
            }
        ]
    },

    {
        path: '/admin',
        children: [
            {
                path: 'pengembalian-form/:id?',
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

    {
        path: '/petugas',
        component: PetugasLayout,
        children: [
            {
                path: 'pengembalian',
                name: 'petugas-pengembalian',
                component: PengembalianPetugas
            }
        ]
    },

    {
        path: '/petugas',
        component: PetugasLayout,
        children: [
            {
                path: 'laporan',
                name: 'petugas-laporan',
                component: LaporanPetugas
            }
        ]
    },



]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to) => {
  const token = localStorage.getItem("token");
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const beranda = {
    admin: "/admin/dashboard",
    petugas: "/petugas/peminjaman",
    peminjam: "/peminjam/dashboard",
  };

  if (to.path === "/login") {
    return token && user && beranda[user.role] ? beranda[user.role] : true;
  }

  const area = ["admin", "petugas", "peminjam"].find(
    (role) => to.path === `/${role}` || to.path.startsWith(`/${role}/`),
  );
  if (!area) return true;
  if (!token || !user) return "/login";
  if (user.role !== area) return beranda[user.role] ?? "/login";
  return true;
});

export default router
