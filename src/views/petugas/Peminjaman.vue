<script setup>
import { onMounted, ref } from 'vue'
import Table from '@/components/Petugas/peminjaman/table.vue'
import { getPeminjaman, ubahStatusPeminjaman } from '@/services/peminjamanService'

const daftarPeminjaman = ref([])
const loading = ref(true)
const errorMessage = ref('')

async function ambilPeminjaman() {
    loading.value = true
    errorMessage.value = ''
    try {
        const response = await getPeminjaman()
        if (!Array.isArray(response.data)) {
            throw new TypeError('Respons API peminjaman tidak berisi daftar peminjaman.')
        }
        daftarPeminjaman.value = response.data
    } catch (error) {
        console.error('Gagal mengambil data peminjaman:', error)
        errorMessage.value = error.response?.data?.message ?? 'Gagal mengambil data peminjaman.'
    } finally {
        loading.value = false
    }
}

async function ubahStatus({ id, status }) {
    errorMessage.value = ''
    try {
        await ubahStatusPeminjaman(id, status)
        await ambilPeminjaman()
    } catch (error) {
        console.error('Gagal mengubah status peminjaman:', error)
        errorMessage.value = error.response?.data?.message ?? 'Gagal mengubah status peminjaman.'
    }
}

onMounted(ambilPeminjaman)
</script>

<template>
    <div class="p-8">
        <h1 class="text-3xl font-bold">Persetujuan Peminjaman</h1>
        <p class="font-medium text-gray-500">Kelola dan verifikasi pengajuan peminjaman alat.</p>
        <p v-if="errorMessage" role="alert" class="my-4 text-sm text-red-600">
            {{ errorMessage }}
        </p>
        <Table
            :peminjaman="daftarPeminjaman"
            :loading="loading"
            @status-change="ubahStatus"
        />
    </div>
</template>
