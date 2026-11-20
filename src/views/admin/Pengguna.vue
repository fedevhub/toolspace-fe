<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { AlertCircle, Plus, Search } from 'lucide-vue-next'
import Table from '@/components/admin/pengguna/table.vue'
import PenggunaForm from '@/components/admin/pengguna/form.vue'
import { Input } from '@/components/ui/input'
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
const pencarian = ref('')
const filterRole = ref('Semua')
const opsiRole = ['Semua', 'Admin', 'Petugas', 'Peminjam']

// Pagination State
const halamanSaatIni = ref(1)
const itemPerHalaman = ref(8)

watch([pencarian, filterRole], () => {
    halamanSaatIni.value = 1
})

const penggunaDitampilkan = computed(() => {
    const query = pencarian.value.trim().toLowerCase()

    return daftarPengguna.value.filter((pengguna) => {
        const matchRole =
            filterRole.value === 'Semua' ||
            pengguna.role?.toLowerCase() === filterRole.value.toLowerCase()

        const matchQuery =
            !query ||
            [pengguna.nama_lengkap, pengguna.username, pengguna.email, pengguna.role]
                .concat(pengguna.id_pengguna ?? [])
                .some((value) => String(value ?? '').toLowerCase().includes(query))

        return matchRole && matchQuery
    })
})

const totalHalaman = computed(() =>
    Math.max(1, Math.ceil(penggunaDitampilkan.value.length / itemPerHalaman.value))
)

const penggunaPaginasi = computed(() => {
    const mulai = (halamanSaatIni.value - 1) * itemPerHalaman.value
    return penggunaDitampilkan.value.slice(mulai, mulai + itemPerHalaman.value)
})

const infoRentangData = computed(() => {
    if (!penggunaDitampilkan.value.length) return { mulai: 0, akhir: 0, total: 0 }
    const mulai = (halamanSaatIni.value - 1) * itemPerHalaman.value + 1
    const akhir = Math.min(
        halamanSaatIni.value * itemPerHalaman.value,
        penggunaDitampilkan.value.length
    )
    return { mulai, akhir, total: penggunaDitampilkan.value.length }
})

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
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(daftarPengguna.value))
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
                : 'Pengguna berhasil ditambahkan.'
        )
    } catch (error) {
        console.error('Gagal menyimpan pengguna:', error.response?.data ?? error)

        const errors = error.response?.data?.errors
        const firstError = errors ? Object.values(errors).flat()[0] : null

        alert(
            firstError ??
            error.response?.data?.message ??
            'Gagal menyimpan pengguna.'
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
            (pengguna) => pengguna.id !== id
        )

        sessionStorage.setItem(CACHE_KEY, JSON.stringify(daftarPengguna.value))

        if (halamanSaatIni.value > totalHalaman.value) {
            halamanSaatIni.value = totalHalaman.value
        }
    } catch (error) {
        console.error('Gagal menghapus pengguna:', error)
        alert(
            error.response?.data?.message ??
            'Gagal menghapus pengguna.'
        )
    }
}

onMounted(ambilPengguna)
</script>

<template>
    <main class="min-h-full bg-[#F8F9FA] p-6 md:p-8" style="font-family: 'DM Sans', Arial, sans-serif">
        <!-- Header -->
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <h1 class="font-display text-2xl font-bold tracking-wide text-gray-900 md:text-3xl">
                    KELOLA PENGGUNA
                </h1>
                <p class="mt-1.5 text-sm text-[#697386] md:text-base">
                    Kelola data akun dan hak akses pengguna dalam sistem.
                </p>
            </div>

            <Button
                class="h-11 gap-2 rounded-xl bg-black px-5 text-sm font-semibold text-white shadow-xs hover:bg-black/85"
                @click="tambahPengguna">
                <Plus :size="18" />
                Tambah Pengguna
            </Button>
        </div>

        <!-- Search & Filter Role -->
        <div class="mt-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div class="relative w-full lg:max-w-[380px]">
                <Search :size="18"
                    class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085]" />
                <Input v-model="pencarian" type="search" placeholder="Cari nama, username, atau email..."
                    class="h-11 rounded-xl border-[#dfe3e8] bg-white pl-10 text-sm shadow-xs focus-visible:border-black" />
            </div>

            <!-- Filter Pills -->
            <div class="flex flex-wrap items-center gap-2">
                <button v-for="opsi in opsiRole" :key="opsi" type="button"
                    class="rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors" :class="filterRole === opsi
                            ? 'bg-black text-white shadow-xs'
                            : 'border border-[#dfe3e8] bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        " @click="filterRole = opsi">
                    {{ opsi }}
                </button>
            </div>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage" role="alert"
            class="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle :size="20" class="shrink-0" />
            <span>{{ errorMessage }}</span>
        </div>

        <!-- Tabel Pengguna -->
        <div class="mt-6">
            <Table :pengguna="penggunaPaginasi" :loading="loading" :halaman-saat-ini="halamanSaatIni"
                :total-halaman="totalHalaman" :info-rentang="infoRentangData" @edit="editPengguna"
                @delete="hapusPengguna" @ganti-halaman="halamanSaatIni = $event" />
        </div>

        <!-- Modal Form -->
        <PenggunaForm v-model:open="formTerbuka" :pengguna="penggunaDipilih" :loading="simpanLoading"
            @save="simpanFormPengguna" />
    </main>
</template>