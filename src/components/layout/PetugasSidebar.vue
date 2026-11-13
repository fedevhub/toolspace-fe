<script setup>
import { computed, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { ClipboardList, FileSearch, FileText, LogOut, User, ArrowRight, X } from 'lucide-vue-next'
import api from '@/lib/api'
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

const pengguna = computed(() => {
    try {
        return JSON.parse(localStorage.getItem('user') || 'null')
    } catch {
        return null
    }
})

const menu = [
    { to: '/petugas/peminjaman', label: 'Peminjaman', icon: ClipboardList },
    { to: '/petugas/pengembalian', label: 'Pengembalian', icon: FileSearch },
    { to: '/petugas/laporan', label: 'Laporan', icon: FileText },
]

const handleLogout = async () => {
    try {
        await api.post('/auth/logout')
    } catch (error) {
        console.error('Gagal logout di server:', error)
    } finally {
        localStorage.removeItem('token')
        localStorage.removeItem('isLogin')
        localStorage.removeItem('user')
        showLogoutDialog.value = false
        await router.push('/login')
    }
}
</script>

<template>
    <aside class="fixed inset-y-0 left-0 z-50 flex h-screen w-58 flex-col overflow-y-auto bg-black text-white"
        style="font-family: 'DM Sans', Arial, sans-serif">
        <div class="px-6 pt-10 pb-8">
            <div class="font-display text-xl tracking-wide">TOOLSPACE</div>
        </div>

        <nav class="flex-1 px-4">
            <div class="space-y-2">
                <RouterLink v-for="item in menu" :key="item.to" :to="item.to" active-class="!bg-white !text-black"
                    class="flex h-12 items-center gap-4 rounded-xl px-4 text-[15px] font-medium text-white/80 transition hover:bg-white hover:text-black">
                    <component :is="item.icon" :size="22" />
                    <span>{{ item.label }}</span>
                </RouterLink>
            </div>
        </nav>

        <div class="p-4">
            <div class="flex items-center gap-3 rounded-xl bg-white px-3 py-3">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white">
                    <User :size="20" />
                </div>

                <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-bold text-black">Petugas</p>
                    <p class="truncate text-xs text-black/70">{{ pengguna?.nama || pengguna?.username || '-' }}</p>
                </div>

                <AlertDialog v-model:open="showLogoutDialog">
                    <AlertDialogTrigger as-child>
                        <button type="button" class="text-[#E20000] transition hover:text-[#E20000]/70" title="Logout"
                            aria-label="Keluar dari akun">
                            <LogOut :size="20" />
                        </button>
                    </AlertDialogTrigger>

                    <AlertDialogContent
                        class="!w-[390px] !max-w-[calc(100%-2rem)] gap-0 rounded-2xl border border-slate-200 bg-white p-5 text-slate-900">
                        <AlertDialogCancel
                            class="absolute right-3 top-3 h-8 w-8 rounded-full border-0 bg-transparent p-0 text-slate-500 shadow-none hover:bg-slate-100"
                            aria-label="Tutup dialog">
                            <X :size="20" />
                        </AlertDialogCancel>

                        <div class="mb-4 flex justify-center">
                            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                                <ArrowRight :size="34" :stroke-width="2.5" class="text-slate-600" />
                            </div>
                        </div>

                        <AlertDialogHeader class="w-full gap-0 space-y-0 text-center">
                            <AlertDialogTitle class="w-full text-center text-xl font-bold leading-tight text-[#14294B]">
                                Keluar dari Akun?
                            </AlertDialogTitle>
                            <AlertDialogDescription
                                class="mt-2 w-full text-center text-sm leading-normal text-slate-500">
                                Apakah kamu yakin ingin keluar dari sistem?
                            </AlertDialogDescription>
                        </AlertDialogHeader>

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