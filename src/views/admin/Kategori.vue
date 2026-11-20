<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { AlertCircle, Plus, Search } from 'lucide-vue-next'
import Table from '@/components/admin/kategori/table.vue'
import KategoriForm from '@/components/admin/kategori/form.vue'
import { Input } from '@/components/ui/input'
import Button from '@/components/ui/button/Button.vue'
import { getKategori, hapusKategori } from '@/services/kategoriService'

const daftarKategori = ref([])
const loading = ref(true)
const errorMessage = ref('')
const pencarian = ref('')
const kategoriTerpilih = ref(null)
const dialogOpen = ref(false)

// Pagination State
const halamanSaatIni = ref(1)
const itemPerHalaman = ref(8)

watch(pencarian, () => {
    halamanSaatIni.value = 1
})

const kategoriDitampilkan = computed(() => {
    const query = pencarian.value.trim().toLowerCase()
    if (!query) return daftarKategori.value

    return daftarKategori.value.filter((kategori) =>
        [kategori.kode_kategori, kategori.nama_kategori, kategori.deskripsi]
            .some((value) => String(value ?? '').toLowerCase().includes(query))
    )
})

const totalHalaman = computed(() =>
    Math.max(1, Math.ceil(kategoriDitampilkan.value.length / itemPerHalaman.value))
)

const kategoriPaginasi = computed(() => {
    const mulai = (halamanSaatIni.value - 1) * itemPerHalaman.value
    return kategoriDitampilkan.value.slice(mulai, mulai + itemPerHalaman.value)
})

const infoRentangData = computed(() => {
    if (!kategoriDitampilkan.value.length) return { mulai: 0, akhir: 0, total: 0 }
    const mulai = (halamanSaatIni.value - 1) * itemPerHalaman.value + 1
    const akhir = Math.min(
        halamanSaatIni.value * itemPerHalaman.value,
        kategoriDitampilkan.value.length
    )
    return { mulai, akhir, total: kategoriDitampilkan.value.length }
})

async function ambilKategori() {
    loading.value = true
    errorMessage.value = ''
    try {
        const response = await getKategori()
        const kategori = response.data.data ?? response.data
        if (!Array.isArray(kategori)) {
            throw new TypeError('Respons API kategori tidak berisi daftar kategori.')
        }
        daftarKategori.value = kategori
    } catch (error) {
        console.error('Gagal mengambil data kategori:', error)
        errorMessage.value = error.response?.data?.message ?? 'Gagal mengambil data kategori.'
    } finally {
        loading.value = false
    }
}

function tambahKategori() {
    kategoriTerpilih.value = null
    dialogOpen.value = true
}

function editKategori(kategori) {
    kategoriTerpilih.value = kategori
    dialogOpen.value = true
}

async function hapusItemKategori(kategori) {
    if (!confirm(`Yakin ingin menghapus ${kategori.nama_kategori} (${kategori.kode_kategori})?`)) return

    try {
        await hapusKategori(kategori.id)
        daftarKategori.value = daftarKategori.value.filter((item) => item.id !== kategori.id)

        if (halamanSaatIni.value > totalHalaman.value) {
            halamanSaatIni.value = totalHalaman.value
        }
    } catch (error) {
        console.error('Gagal menghapus kategori:', error)
        alert(error.response?.data?.message ?? 'Gagal menghapus kategori.')
    }
}

onMounted(ambilKategori)
</script>

<template>
    <main class="min-h-full bg-[#F8F9FA] p-6 md:p-8" style="font-family: 'DM Sans', Arial, sans-serif">
        <!-- Header -->
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <h1 class="font-display text-2xl font-bold tracking-wide text-gray-900 md:text-3xl">
                    KELOLA KATEGORI
                </h1>
                <p class="mt-1.5 text-sm text-[#697386] md:text-base">
                    Kelola data kategori untuk mengelompokkan alat sesuai jenisnya.
                </p>
            </div>

            <Button
                class="h-11 gap-2 rounded-xl bg-black px-5 text-sm font-semibold text-white shadow-xs hover:bg-black/85"
                @click="tambahKategori">
                <Plus :size="18" />
                Tambah Kategori
            </Button>
        </div>

        <!-- Search Bar -->
        <div class="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div class="relative w-full sm:max-w-[380px]">
                <Search :size="18"
                    class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085]" />
                <Input v-model="pencarian" type="search" placeholder="Cari kode, nama, atau deskripsi kategori..."
                    class="h-11 rounded-xl border-[#dfe3e8] bg-white pl-10 text-sm shadow-xs focus-visible:border-black" />
            </div>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage" role="alert"
            class="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle :size="20" class="shrink-0" />
            <span>{{ errorMessage }}</span>
        </div>

        <!-- Tabel Kategori -->
        <div class="mt-6">
            <Table :kategori="kategoriPaginasi" :loading="loading" :halaman-saat-ini="halamanSaatIni"
                :total-halaman="totalHalaman" :info-rentang="infoRentangData" @edit="editKategori"
                @delete="hapusItemKategori" @ganti-halaman="halamanSaatIni = $event" />
        </div>

        <!-- Modal Form -->
        <KategoriForm v-model:open="dialogOpen" :kategori="kategoriTerpilih" @saved="ambilKategori" />
    </main>
</template>