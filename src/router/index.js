import { createRouter, createWebHistory } from "vue-router";

import AdminLayout from "@/layouts/AdminLayout.vue";
import PetugasLayout from "@/layouts/PetugasLayout.vue";
import PeminjamLayout from "@/layouts/PeminjamLayout.vue";

// Auth
import Login from "@/views/auth/Login.vue";

// Admin Views & Forms
import Dashboard from "@/views/admin/Dashboard.vue";
import Pengguna from "@/views/admin/Pengguna.vue";
import Alat from "@/views/admin/Alat.vue";
import Kategori from "@/views/admin/Kategori.vue";
import Peminjaman from "@/views/admin/Peminjaman.vue";
import Pengembalian from "@/views/admin/Pengembalian.vue";
import LogAktivitas from "@/views/admin/Log-Aktivitas.vue";
import PenggunaForm from "@/components/admin/pengguna/form.vue";
import AlatForm from "@/components/admin/alat/form.vue";
import KategoriForm from "@/components/admin/kategori/form.vue";
import PeminjamanForm from "@/components/admin/peminjaman/form.vue";
import PengembalianForm from "@/components/admin/pengembalian/form.vue";

// Petugas Views
import PeminjamanPetugas from "@/views/petugas/Peminjaman.vue";
import PengembalianPetugas from "@/views/petugas/Pengembalian.vue";
import LaporanPetugas from "@/views/petugas/Laporan.vue";

// Peminjam Views
import AlatPeminjam from "@/views/peminjam/Alat.vue";
import PeminjamanPeminjam from "@/views/peminjam/Peminjaman.vue"; // <-- Sesuaikan jika nama filenya beda
import PengembalianPeminjam from "@/views/peminjam/Pengembalian.vue";
import AjukanPengembalianPeminjam from "@/views/peminjam/AjukanPengembalian.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  },

  // Area Peminjam (Awal masuk langsung ke Alat)
  {
    path: "/peminjam",
    component: PeminjamLayout,
    redirect: "/peminjam/alat",
    children: [
      {
        path: "alat",
        name: "peminjam-alat",
        component: AlatPeminjam,
      },
      {
        path: "peminjaman",
        name: "peminjam-peminjaman",
        component: PeminjamanPeminjam,
      },
      {
        path: "peminjaman-form",
        name: "peminjam-peminjaman-form",
        component: PeminjamanForm,
      },
      {
        path: "pengembalian",
        name: "peminjam-pengembalian",
        component: PengembalianPeminjam,
      },
      {
        path: "pengembalian/ajukan",
        name: "peminjam-ajukan-pengembalian",
        component: AjukanPengembalianPeminjam,
      },
    ],
  },

  // Area Admin (Dengan Layout)
  {
    path: "/admin",
    component: AdminLayout,
    redirect: "/admin/dashboard",
    children: [
      {
        path: "dashboard",
        name: "admin-dashboard",
        component: Dashboard,
      },
      {
        path: "pengguna",
        name: "admin-pengguna",
        component: Pengguna,
      },
      {
        path: "alat",
        name: "admin-alat",
        component: Alat,
      },
      {
        path: "kategori",
        name: "admin-kategori",
        component: Kategori,
      },
      {
        path: "kategori-form",
        name: "admin-kategori-form",
        component: KategoriForm,
      },
      {
        path: "peminjaman",
        name: "admin-peminjaman",
        component: Peminjaman,
      },
      {
        path: "pengembalian",
        name: "admin-pengembalian",
        component: Pengembalian,
      },
      {
        path: "log-aktivitas",
        name: "admin-log-aktivitas",
        component: LogAktivitas,
      },
    ],
  },

  // Area Admin (Form Fullscreen)
  {
    path: "/admin/pengguna-form/:id?",
    name: "admin-pengguna-form",
    component: PenggunaForm,
  },
  {
    path: "/admin/alat-form/:id?",
    name: "admin-alat-form",
    component: AlatForm,
  },
  {
    path: "/admin/peminjaman-form/:id?",
    name: "admin-peminjaman-form",
    component: PeminjamanForm,
  },
  {
    path: "/admin/pengembalian-form/:id?",
    name: "admin-pengembalian-form",
    component: PengembalianForm,
  },

  // Area Petugas
  {
    path: "/petugas",
    component: PetugasLayout,
    redirect: "/petugas/peminjaman",
    children: [
      {
        path: "peminjaman",
        name: "petugas-peminjaman",
        component: PeminjamanPetugas,
      },
      {
        path: "pengembalian",
        name: "petugas-pengembalian",
        component: PengembalianPetugas,
      },
      {
        path: "laporan",
        name: "petugas-laporan",
        component: LaporanPetugas,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

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
    peminjam: "/peminjam/alat", // <-- Diubah langsung ke halaman Alat
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

export default router;
