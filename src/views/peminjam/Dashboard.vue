<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@/components/ui/button/Button.vue'

const router = useRouter()
const pengguna = computed(() => {
    try {
        return JSON.parse(localStorage.getItem('user') || 'null')
    } catch (error) {
        console.error('Data pengguna tersimpan tidak valid:', error)
        return null
    }
})

function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('isLogin')
    localStorage.removeItem('user')
    router.push('/login')
}
</script>

<template>
    <main class="flex min-h-svh items-center justify-center bg-gray-50 p-6">
        <section class="w-full max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm">
            <h1 class="text-2xl font-bold">Login berhasil</h1>
            <p class="mt-3 text-gray-600">
                Selamat datang, {{ pengguna?.nama || pengguna?.username || 'Peminjam' }}.
            </p>
            <p class="mt-2 text-sm text-gray-500">
                Akun peminjam sudah terhubung. Fitur peminjaman untuk akun ini belum tersedia.
            </p>
            <Button class="mt-6" @click="logout">Keluar</Button>
        </section>
    </main>
</template>
