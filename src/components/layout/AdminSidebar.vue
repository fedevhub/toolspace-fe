<script setup>
import {
    LayoutDashboard,
    Package,
    ClipboardList,
    RotateCcw,
    Users,
    LogOut,
    Clock,
    User,
    Layers,
    ArrowRight,
    X,
} from 'lucide-vue-next'

import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const router = useRouter()
const showLogoutDialog = ref(false)

const handleLogout = async () => {
    try {
        showLogoutDialog.value = false
        await router.push('/login')
    } catch (error) {
        console.error('Gagal logout:', error)
    }
}
</script>

<template>
    <aside class="fixed inset-y-0 left-0 z-50 flex h-screen w-58 flex-col overflow-y-auto bg-black text-white">
        <!-- Logo -->
        <div class="border-b border-white/10 px-5 py-6">
            <div class="text-xl font-bold tracking-wide">
                TOOLSPACE
            </div>
        </div>

        <!-- Navigasi -->
        <nav class="flex-1 px-3 py-5">
            <div class="space-y-1">
                <RouterLink to="/admin/dashboard" exact-active-class="!bg-white !text-black"
                    class="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-white/70 transition hover:bg-white hover:text-black">
                    <LayoutDashboard :size="18" />
                    <span>Dashboard</span>
                </RouterLink>

                <RouterLink to="/admin/pengguna" exact-active-class="!bg-white !text-black"
                    class="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-white/70 transition hover:bg-white hover:text-black">
                    <Users :size="18" />
                    <span>Pengguna</span>
                </RouterLink>

                <RouterLink to="/admin/alat" exact-active-class="!bg-white !text-black"
                    class="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-white/70 transition hover:bg-white hover:text-black">
                    <Package :size="18" />
                    <span>Alat</span>
                </RouterLink>

                <RouterLink to="/admin/kategori" exact-active-class="!bg-white !text-black"
                    class="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-white/70 transition hover:bg-white hover:text-black">
                    <Layers :size="18" />
                    <span>Kategori</span>
                </RouterLink>

                <RouterLink to="/admin/peminjaman" exact-active-class="!bg-white !text-black"
                    class="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-white/70 transition hover:bg-white hover:text-black">
                    <ClipboardList :size="18" />
                    <span>Peminjaman</span>
                </RouterLink>

                <RouterLink to="/admin/pengembalian" exact-active-class="!bg-white !text-black"
                    class="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-white/70 transition hover:bg-white hover:text-black">
                    <RotateCcw :size="18" />
                    <span>Pengembalian</span>
                </RouterLink>

                <RouterLink to="/admin/log-aktivitas" exact-active-class="!bg-white !text-black"
                    class="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-white/70 transition hover:bg-white hover:text-black">
                    <Clock :size="18" />
                    <span>Log Aktivitas</span>
                </RouterLink>
            </div>
        </nav>

        <!-- Profil Admin dan Logout -->
        <div class="border-t border-white/10 p-4">
            <div class="flex items-center gap-3 rounded-md bg-white px-3 py-3">
                <div class="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
                    <User :size="18" />
                </div>

                <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium text-black">
                        Admin
                    </p>

                    <p class="truncate text-xs text-black/50">
                        Administrator
                    </p>
                </div>

                <AlertDialog v-model:open="showLogoutDialog">
                    <AlertDialogTrigger as-child>
                        <button type="button" class="text-[#E20000] transition hover:text-[#E20000]/70" title="Logout"
                            aria-label="Keluar dari akun">
                            <LogOut :size="17" />
                        </button>
                    </AlertDialogTrigger>

                    <AlertDialogContent
                        class="!w-[390px] !max-w-[calc(100%-2rem)] gap-0 rounded-2xl border border-slate-200 bg-white p-5 text-slate-900">
                        <!-- Tombol tutup -->
                        <AlertDialogCancel
                            class="absolute right-3 top-3 h-8 w-8 rounded-full border-0 bg-transparent p-0 text-slate-500 shadow-none hover:bg-slate-100"
                            aria-label="Tutup dialog">
                            <X :size="20" />
                        </AlertDialogCancel>

                        <!-- Ikon -->
                        <div class="mb-4 flex justify-center">
                            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                                <ArrowRight :size="34" :stroke-width="2.5" class="text-slate-600" />
                            </div>
                        </div>

                        <!-- Judul dan deskripsi -->
                        <AlertDialogHeader class="w-full gap-0 space-y-0 text-center">
                            <AlertDialogTitle class="w-full text-center text-xl font-bold leading-tight text-[#14294B]">
                                Keluar dari Akun?
                            </AlertDialogTitle>

                            <AlertDialogDescription
                                class="mt-2 w-full text-center text-sm leading-normal text-slate-500">
                                Apakah kamu yakin ingin keluar dari sistem?
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <!-- Tombol aksi -->
                        <AlertDialogFooter class="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-row">
                            <AlertDialogCancel
                                class="mt-0 h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                                Batal
                            </AlertDialogCancel>

                            <AlertDialogAction
                                class="h-10 flex-1 rounded-lg bg-[#111111] px-3 text-sm font-semibold text-white hover:bg-black/80"
                                @click="handleLogout">
                                Ya, Keluar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    </aside>
</template>
