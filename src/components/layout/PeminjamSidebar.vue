<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ClipboardList, LogOut, Package, RotateCcw, User } from 'lucide-vue-next'
import api from '@/lib/api'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const router = useRouter()
const showLogoutDialog = ref(false)
const pengguna = computed(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
})

async function logout() {
    try { await api.post('/auth/logout') } catch (error) { console.error('Gagal logout di server:', error) }
    finally {
        localStorage.removeItem('token')
        localStorage.removeItem('isLogin')
        localStorage.removeItem('user')
        showLogoutDialog.value = false
        await router.push('/login')
    }
}
</script>

<template>
    <aside class="fixed inset-y-0 left-0 z-50 flex h-screen w-58 flex-col bg-black text-white" style="font-family: 'DM Sans', Arial, sans-serif">
        <div class="px-5 py-6 font-display text-xl tracking-wide">TOOLSPACE</div>
        <nav class="flex-1 px-3 py-5">
            <div class="space-y-2">
                <RouterLink to="/peminjam/alat" active-class="!bg-white !text-black" class="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-white/80 transition hover:bg-white hover:text-black"><Package :size="18" /> Daftar Alat</RouterLink>
                <RouterLink to="/peminjam/dashboard" active-class="!bg-white !text-black" class="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-white/80 transition hover:bg-white hover:text-black"><ClipboardList :size="18" /> Peminjaman</RouterLink>
                <RouterLink to="/peminjam/pengembalian" active-class="!bg-white !text-black" class="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-white/80 transition hover:bg-white hover:text-black"><RotateCcw :size="18" /> Pengembalian</RouterLink>
            </div>
        </nav>
        <div class="border-t border-white/10 p-4">
            <div class="flex items-center gap-3 rounded-md bg-white px-3 py-3 text-black">
                <span class="flex size-9 items-center justify-center rounded-full bg-black text-white"><User :size="18" /></span>
                <div class="min-w-0 flex-1"><p class="truncate text-sm font-bold">{{ pengguna?.nama || pengguna?.username || 'Peminjam' }}</p><p class="text-xs text-black/60">Peminjam</p></div>
                <AlertDialog v-model:open="showLogoutDialog">
                    <AlertDialogTrigger as-child><button aria-label="Keluar dari akun" class="text-red-600"><LogOut :size="19" /></button></AlertDialogTrigger>
                    <AlertDialogContent class="max-w-sm rounded-2xl">
                        <AlertDialogHeader><AlertDialogTitle>Keluar dari akun?</AlertDialogTitle><AlertDialogDescription>Apakah kamu yakin ingin keluar dari sistem?</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction class="bg-black text-white hover:bg-black/80" @click="logout">Ya, Keluar</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    </aside>
</template>
