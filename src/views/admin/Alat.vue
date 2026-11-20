<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { AlertCircle, Plus, Search } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import { Input } from '@/components/ui/input'
import Table from '@/components/admin/alat/table.vue'
import { getAlat, hapusAlat } from '@/services/alatService'

const router = useRouter()
const daftarAlat = ref([])
const loading = ref(true)
const errorMessage = ref('')
const pencarian = ref('')
const filterStatus = ref('Semua')
const opsiStatus = ['Semua', 'Tersedia', 'Tidak Tersedia']

// Pagination State
const halamanSaatIni = ref(1)
const itemPerHalaman = ref(8)

watch([pencarian, filterStatus], () => {
    halamanSaatIni.value = 1
})

const alatDitampilkan = computed(() => {
    const query = pencarian.value.trim().toLowerCase()

    return daftarAlat.value.filter((alat) => {
        const matchStatus =
            filterStatus.value === 'Semua' ||
            String(alat.status ?? '').toLowerCase() === filterStatus.value.toLowerCase()

        const matchQuery =
            !query ||
            [alat.kode_alat, alat.nama_alat, alat.kategori, alat.kondisi, alat.status]
                .some((value) => String(value ?? '').toLowerCase().includes(query))

        return matchStatus && matchQuery
    })
})

const totalHalaman = computed(() =>
    Math.max(1, Math.ceil(alatDitampilkan.value.length / itemPerHalaman.value))
)

const alatPaginasi = computed(() => {
    const mulai = (halamanSaatIni.value - 1) * itemPerHalaman.value
    return alatDitampilkan.value.slice(mulai, mulai + itemPerHalaman.value)
})

const infoRentangData = computed(() => {
    if (!alatDitampilkan.value.length) return { mulai: 0, akhir: 0, total: 0 }
    const mulai = (halamanSaatIni.value - 1) * itemPerHalaman.value + 1
    const akhir = Math.min(
        halamanSaatIni.value * itemPerHalaman.value,
        alatDitampilkan.value.length
    )
    return { mulai, akhir, total: alatDitampilkan.value.length }
})

async function ambilAlat() {
    loading.value = true
    errorMessage.value = ''

    try {
        const response = await getAlat()
        const alat = response.data.data ?? response.data
        if (!Array.isArray(alat)) {
            throw new TypeError('Respons API alat tidak berisi daftar alat.')
        }
        daftarAlat.value = alat
    } catch (error) {
        console.error('Gagal mengambil data alat:', error)
        errorMessage.value = error.response?.data?.message ?? 'Gagal mengambil data alat.'
    } finally {
        loading.value = false
    }
}

async function hapusItemAlat(alat) {
    if (!confirm(`Yakin ingin menghapus ${alat.nama_alat} (${alat.kode_alat})?`)) return

    try {
        await hapusAlat(alat.id)
        daftarAlat.value = daftarAlat.value.filter((item) => item.id !== alat.id)

        if (halamanSaatIni.value > totalHalaman.value) {
            halamanSaatIni.value = totalHalaman.value
        }
    } catch (error) {
        console.error('Gagal menghapus alat:', error)
        alert(error.response?.data?.message ?? 'Gagal menghapus alat.')
    }
}

onMounted(ambilAlat)
</script>

<template>
    <main class="min-h-full bg-[#F8F9FA] p-6 md:p-8" style="font-family: 'DM Sans', Arial, sans-serif">
        <!-- Header -->
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <h1 class="font-display text-2xl font-bold tracking-wide text-gray-900 md:text-3xl">
                    KELOLA ALAT
                </h1>
                <p class="mt-1.5 text-sm text-[#697386] md:text-base">
                    Kelola informasi alat, kategori, dan ketersediaan stok dalam sistem.
                </p>
            </div>

            <Button
                class="h-11 gap-2 rounded-xl bg-black px-5 text-sm font-semibold text-white shadow-xs hover:bg-black/85"
                @click="router.push('/admin/alat-form')">
                <Plus :size="18" />
                Tambah Alat
            </Button>
        </div>

        <!-- Search & Filter Status -->
        <div class="mt-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div class="relative w-full lg:max-w-[380px]">
                <Search :size="18"
                    class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085]" />
                <Input v-model="pencarian" type="search" placeholder="Cari kode, nama alat, atau kategori..."
                    class="h-11 rounded-xl border-[#dfe3e8] bg-white pl-10 text-sm shadow-xs focus-visible:border-black" />
            </div>

            <!-- Filter Pills -->
            <div class="flex flex-wrap items-center gap-2">
                <button v-for="opsi in opsiStatus" :key="opsi" type="button"
                    class="rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors" :class="filterStatus === opsi
                            ? 'bg-black text-white shadow-xs'
                            : 'border border-[#dfe3e8] bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        " @click="filterStatus = opsi">
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

        <!-- Tabel Alat -->
        <div class="mt-6">
            <Table :alat="alatPaginasi" :loading="loading" :halaman-saat-ini="halamanSaatIni"
                :total-halaman="totalHalaman" :info-rentang="infoRentangData"
                @edit="router.push(`/admin/alat-form/${$event.id}`)" @delete="hapusItemAlat"
                @ganti-halaman="halamanSaatIni = $event" />
        </div>
    </main>
</template>