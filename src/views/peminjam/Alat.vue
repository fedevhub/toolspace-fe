<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Info,
    Package,
    Plus,
    Search,
} from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { detailAlat, getAlat } from '@/services/alatService'

const router = useRouter()

// State
const daftarAlat = ref([])
const pencarian = ref('')
const kategori = ref('Semua Kategori')
const loading = ref(true)
const errorMessage = ref('')
const alatTerpilih = ref(null)
const memuatDetail = ref(false)

// Pagination State (6 item agar pas dengan grid 3 kolom x 2 baris)
const halamanSaatIni = ref(1)
const itemPerHalaman = ref(6)

watch([pencarian, kategori], () => {
    halamanSaatIni.value = 1
})

// Computed
const kategoriTersedia = computed(() => {
    const unik = daftarAlat.value.map((alat) => alat.kategori).filter(Boolean)
    return [...new Set(unik)]
})

const alatDitampilkan = computed(() => {
    const query = pencarian.value.trim().toLowerCase()

    return daftarAlat.value.filter((alat) => {
        const isAktif = alat.status_aktif !== false
        const matchKategori =
            kategori.value === 'Semua Kategori' || alat.kategori === kategori.value
        const matchQuery =
            !query ||
            [alat.nama_alat, alat.kode_alat, alat.kategori].some((val) =>
                val?.toLowerCase().includes(query)
            )

        return isAktif && matchKategori && matchQuery
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

const detailRows = computed(() => {
    if (!alatTerpilih.value) return []
    const alat = alatTerpilih.value

    return [
        { label: 'Nama Alat', value: alat.nama_alat || '-' },
        { label: 'ID Alat', value: alat.kode_alat || '-' },
        { label: 'Kategori', value: alat.kategori || '-' },
        { label: 'Total Stok', value: `${alat.jumlah ?? 0} unit` },
        { label: 'Tersedia', value: `${alat.tersedia ?? 0} unit` },
        { label: 'Kondisi', value: alat.kondisi || '-' },
        { label: 'Status', value: statusAlat(alat).label, isStatus: true },
        { label: 'Deskripsi', value: alat.deskripsi || '-' },
    ]
})

// Methods
function statusAlat(alat) {
    if (alat.tersedia <= 0) {
        return {
            label: 'Dipinjam',
            class: 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-600/20',
        }
    }
    if (alat.tersedia < alat.jumlah) {
        return {
            label: 'Terbatas',
            class: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
        }
    }
    return {
        label: 'Tersedia',
        class: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
    }
}

function gantiHalaman(nomor) {
    halamanSaatIni.value = nomor
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function ambilAlat() {
    loading.value = true
    errorMessage.value = ''

    try {
        const response = await getAlat()
        const data = response.data?.data ?? response.data
        if (!Array.isArray(data)) {
            throw new TypeError('Format data alat tidak valid.')
        }
        daftarAlat.value = data
    } catch (error) {
        errorMessage.value =
            error.response?.data?.message ?? 'Gagal mengambil daftar alat.'
    } finally {
        loading.value = false
    }
}

async function bukaDetail(alat) {
    alatTerpilih.value = alat
    memuatDetail.value = true

    try {
        const response = await detailAlat(alat.id)
        alatTerpilih.value = response.data?.data ?? response.data
    } catch {
        // Tetap gunakan data dari daftar jika endpoint detail gagal
    } finally {
        memuatDetail.value = false
    }
}

function ajukanPeminjaman(alatId) {
    router.push({
        name: 'peminjam-peminjaman-form',
        query: { alat: alatId },
    })
}

onMounted(ambilAlat)
</script>

<template>
    <main class="min-h-full bg-[#F8F9FA] p-6 md:p-8" style="font-family: 'DM Sans', Arial, sans-serif">
        <!-- Header -->
        <div class="mb-6">
            <h1 class="font-display text-2xl font-bold tracking-wide text-gray-900 md:text-3xl">
                DAFTAR ALAT
            </h1>
            <p class="mt-1.5 text-sm text-[#697386] md:text-base">
                Pilih alat yang tersedia untuk diajukan peminjaman.
            </p>
        </div>

        <!-- Filter & Search Bar -->
        <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div class="relative w-full sm:max-w-[380px]">
                <Search :size="18"
                    class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085]" />
                <Input v-model="pencarian" type="search"
                    class="h-11 rounded-xl border-[#dfe3e8] bg-white pl-10 text-sm shadow-xs transition-colors focus-visible:border-black"
                    placeholder="Cari nama, kode, atau kategori alat..." />
            </div>

            <Select v-model="kategori">
                <SelectTrigger
                    class="!h-11 w-full rounded-xl border-[#dfe3e8] bg-white px-4 text-sm font-semibold text-gray-900 shadow-xs focus:border-black sm:w-[210px]">
                    <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent position="popper" :side-offset="6">
                    <SelectItem value="Semua Kategori">Semua Kategori</SelectItem>
                    <SelectItem v-for="item in kategoriTersedia" :key="item" :value="item">
                        {{ item }}
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>

        <!-- State: Error -->
        <div v-if="errorMessage" role="alert"
            class="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle :size="20" class="shrink-0" />
            <span>{{ errorMessage }}</span>
        </div>

        <!-- State: Loading Skeleton -->
        <div v-else-if="loading" class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div v-for="n in 6" :key="n" class="animate-pulse rounded-2xl border border-gray-100 bg-white p-5">
                <div class="h-44 rounded-xl bg-gray-100" />
                <div class="mt-4 h-6 w-3/4 rounded-md bg-gray-100" />
                <div class="mt-3 flex justify-between">
                    <div class="h-4 w-1/3 rounded bg-gray-100" />
                    <div class="h-5 w-1/4 rounded-full bg-gray-100" />
                </div>
                <div class="mt-6 grid grid-cols-2 gap-3">
                    <div class="h-10 rounded-xl bg-gray-100" />
                    <div class="h-10 rounded-xl bg-gray-100" />
                </div>
            </div>
        </div>

        <!-- State: Empty -->
        <div v-else-if="!alatPaginasi.length"
            class="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
            <Package :size="48" stroke-width="1.2" class="text-gray-400" />
            <p class="mt-3 text-base font-semibold text-gray-900">Alat tidak ditemukan</p>
            <p class="mt-1 text-sm text-gray-500">
                Coba ubah kata kunci pencarian atau filter kategori Anda.
            </p>
        </div>

        <!-- Grid Daftar Alat & Pagination -->
        <template v-else>
            <div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <article v-for="alat in alatPaginasi" :key="alat.id"
                    class="group flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md">
                    <div>
                        <!-- Thumbnail Gambar -->
                        <div
                            class="relative flex h-44 items-center justify-center overflow-hidden rounded-xl bg-[#F3F4F6]">
                            <img v-if="alat.gambar" :src="alat.gambar" :alt="alat.nama_alat"
                                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            <Package v-else :size="64" stroke-width="1.35" class="text-[#9aa1a9]" />
                            <span v-if="alat.kategori"
                                class="absolute left-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-700 backdrop-blur-xs">
                                {{ alat.kategori }}
                            </span>
                        </div>

                        <!-- Info Alat -->
                        <h2 class="mt-4 line-clamp-1 text-lg font-bold text-gray-900" :title="alat.nama_alat">
                            {{ alat.nama_alat }}
                        </h2>

                        <div class="mt-2.5 flex items-center justify-between gap-2 text-sm">
                            <span class="text-[#667085]">
                                Stok:
                                <strong class="font-semibold text-gray-900">{{ alat.tersedia }}</strong>
                                Unit
                            </span>
                            <span class="rounded-full px-3 py-0.5 text-xs font-bold" :class="statusAlat(alat).class">
                                {{ statusAlat(alat).label }}
                            </span>
                        </div>
                    </div>

                    <!-- Tombol Aksi -->
                    <div class="mt-6 grid grid-cols-2 gap-3 pt-2">
                        <Button type="button" variant="outline"
                            class="h-10 rounded-xl border-[#dfe3e8] font-semibold text-gray-700 hover:bg-gray-50"
                            @click="bukaDetail(alat)">
                            <Info :size="16" class="mr-1.5" />
                            Detail
                        </Button>
                        <Button type="button"
                            class="h-10 rounded-xl bg-black font-semibold text-white hover:bg-black/85 disabled:opacity-40"
                            :disabled="alat.tersedia <= 0" @click="ajukanPeminjaman(alat.id)">
                            <Plus :size="17" class="mr-1" />
                            Pinjam
                        </Button>
                    </div>
                </article>
            </div>

            <!-- Pagination Footer -->
            <div
                class="mt-6 flex flex-col items-center justify-between gap-4 px-6 py-4 sm:flex-row">
                <p class="text-xs text-gray-500">
                    Menampilkan
                    <span class="font-semibold text-gray-900">{{ infoRentangData.mulai }}</span>
                    –
                    <span class="font-semibold text-gray-900">{{ infoRentangData.akhir }}</span>
                    dari
                    <span class="font-semibold text-gray-900">{{ infoRentangData.total }}</span>
                    alat
                </p>

                <div class="flex items-center gap-1.5">
                    <Button type="button" variant="outline" size="sm"
                        class="h-8 rounded-lg border-[#dfe3e8] px-2.5 text-xs font-semibold text-gray-700 disabled:opacity-40"
                        :disabled="halamanSaatIni <= 1" @click="gantiHalaman(halamanSaatIni - 1)">
                        <ChevronLeft :size="15" class="mr-0.5" />
                        Sebelumnya
                    </Button>

                    <button v-for="nomor in totalHalaman" :key="nomor" type="button"
                        class="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors"
                        :class="halamanSaatIni === nomor
                                ? 'bg-black text-white'
                                : 'border border-[#dfe3e8] bg-white text-gray-700 hover:bg-gray-50'
                            " @click="gantiHalaman(nomor)">
                        {{ nomor }}
                    </button>

                    <Button type="button" variant="outline" size="sm"
                        class="h-8 rounded-lg border-[#dfe3e8] px-2.5 text-xs font-semibold text-gray-700 disabled:opacity-40"
                        :disabled="halamanSaatIni >= totalHalaman" @click="gantiHalaman(halamanSaatIni + 1)">
                        Berikutnya
                        <ChevronRight :size="15" class="ml-0.5" />
                    </Button>
                </div>
            </div>
        </template>

        <!-- Modal Detail Alat -->
        <Dialog :open="Boolean(alatTerpilih)" @update:open="(open) => { if (!open) alatTerpilih = null }">
            <DialogContent class="max-w-2xl overflow-hidden rounded-3xl p-0">
                <DialogHeader class="border-b border-gray-100 px-6 py-5 sm:px-8">
                    <DialogTitle class="font-display text-lg font-bold tracking-wide text-gray-900 sm:text-xl">
                        DETAIL ALAT
                    </DialogTitle>
                </DialogHeader>

                <div v-if="alatTerpilih" class="grid gap-6 px-6 py-6 sm:grid-cols-[200px_1fr] sm:px-8">
                    <!-- Gambar Modal -->
                    <div
                        class="flex h-48 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-[#F8F9FA] sm:h-52">
                        <img v-if="alatTerpilih.gambar" :src="alatTerpilih.gambar" :alt="alatTerpilih.nama_alat"
                            class="h-full w-full object-contain p-2" />
                        <Package v-else :size="68" stroke-width="1.35" class="text-gray-400" />
                    </div>

                    <!-- Spesifikasi -->
                    <div v-if="memuatDetail" class="flex items-center justify-center py-8 text-sm text-gray-500">
                        Memuat detail alat...
                    </div>

                    <dl v-else class="grid grid-cols-[110px_12px_1fr] gap-y-2.5 text-sm">
                        <template v-for="row in detailRows" :key="row.label">
                            <dt class="text-gray-500">{{ row.label }}</dt>
                            <span class="text-gray-400">:</span>
                            <dd class="font-semibold text-gray-900">
                                <span v-if="row.isStatus"
                                    class="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold"
                                    :class="statusAlat(alatTerpilih).class">
                                    {{ row.value }}
                                </span>
                                <span v-else>{{ row.value }}</span>
                            </dd>
                        </template>
                    </dl>
                </div>
            </DialogContent>
        </Dialog>
    </main>
</template>