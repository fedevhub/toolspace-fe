<script setup>
import { onMounted, ref } from 'vue'
import Table from '@/components/admin/pengguna/table.vue'
import PenggunaForm from '@/components/admin/pengguna/form.vue'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import {
    getPengguna,
    tambahPengguna as tambahPenggunaAPI,
    editPengguna as editPenggunaAPI,
    hapusPengguna as deletePenggunaAPI,
} from '@/services/penggunaService'

const CACHE_KEY = 'daftar_pengguna'

function bacaCachePengguna() {
    const cachedPengguna = sessionStorage.getItem(CACHE_KEY)

    if (cachedPengguna === null) return []

    try {
        const pengguna = JSON.parse(cachedPengguna)

        if (!Array.isArray(pengguna)) {
            throw new TypeError('Cache pengguna harus berupa array.')
        }

        return pengguna
    } catch (error) {
        console.error('Cache pengguna tidak valid:', error)
        sessionStorage.removeItem(CACHE_KEY)
        return []
    }
}

const daftarPengguna = ref(bacaCachePengguna())
const loading = ref(daftarPengguna.value.length === 0)
const errorMessage = ref('')

const formTerbuka = ref(false)
const penggunaDipilih = ref(null)
const simpanLoading = ref(false)

async function ambilPengguna() {
    loading.value = true
    errorMessage.value = ''

    try {
        const response = await getPengguna()
        const pengguna = response.data.data ?? response.data

        if (!Array.isArray(pengguna)) {
            throw new TypeError('Respons API pengguna tidak berisi daftar pengguna.')
        }

        daftarPengguna.value = pengguna

        sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify(daftarPengguna.value),
        )
    } catch (error) {
        console.error('Gagal mengambil pengguna:', error)
        errorMessage.value =
            error.response?.data?.message ??
            'Gagal memperbarui data pengguna. Data tersimpan tetap ditampilkan.'
    } finally {
        loading.value = false
    }
}

function tambahPengguna() {
    penggunaDipilih.value = null
    formTerbuka.value = true
}

function editPengguna(pengguna) {
    penggunaDipilih.value = pengguna
    formTerbuka.value = true
}

async function simpanFormPengguna(data) {
    if (simpanLoading.value) return

    simpanLoading.value = true

    // Simpan jenis operasi sebelum data diproses.
    const modeEdit = Boolean(penggunaDipilih.value)

    try {
        if (modeEdit) {
            await editPenggunaAPI(penggunaDipilih.value.id, data)
        } else {
            await tambahPenggunaAPI(data)
        }

        formTerbuka.value = false
        await ambilPengguna()

        alert(
            modeEdit
                ? 'Pengguna berhasil diperbarui.'
                : 'Pengguna berhasil ditambahkan.',
        )
    } catch (error) {
        console.error('Gagal menyimpan pengguna:', error.response?.data ?? error)

        const errors = error.response?.data?.errors
        const firstError = errors
            ? Object.values(errors).flat()[0]
            : null

        alert(
            firstError ??
            error.response?.data?.message ??
            'Gagal menyimpan pengguna.',
        )
    } finally {
        simpanLoading.value = false
    }
}

async function hapusPengguna(id) {
    if (!confirm('Yakin ingin menghapus pengguna ini?')) return

    try {
        await deletePenggunaAPI(id)

        daftarPengguna.value = daftarPengguna.value.filter(
            (pengguna) => pengguna.id !== id,
        )

        sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify(daftarPengguna.value),
        )
    } catch (error) {
        console.error('Gagal menghapus pengguna:', error)
        alert(
            error.response?.data?.message ??
            'Gagal menghapus pengguna.',
        )
    }
}

onMounted(ambilPengguna)
</script>

<template>
    <div class="p-8">
        <h1 class="text-3xl font-bold">Kelola Pengguna</h1>

        <div class="flex w-full items-center py-5">
            <div class="relative w-75">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />

                <Input type="text" placeholder="Cari" class="bg-white pl-10" />
            </div>

            <div class="ml-auto">
                <Button @click="tambahPengguna">
                    <Plus :size="20" />
                    Tambah Pengguna
                </Button>
            </div>
        </div>

        <p v-if="errorMessage" role="alert" class="mb-4 text-sm text-red-600">
            {{ errorMessage }}
        </p>

        <Table :pengguna="daftarPengguna" :loading="loading" @edit="editPengguna" @delete="hapusPengguna" />

        <PenggunaForm v-model:open="formTerbuka" :pengguna="penggunaDipilih" :loading="simpanLoading"
            @save="simpanFormPengguna" />
    </div>
</template>
