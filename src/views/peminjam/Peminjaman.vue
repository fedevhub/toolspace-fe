<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Eye,
    Package,
    RotateCcw,
    Search,
    X,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { getPeminjaman } from '@/services/peminjamanService'
import { getPengembalianSaya } from '@/services/pengembalianService'
import { getAlat } from '@/services/alatService'

const router = useRouter()

// State
const daftarPeminjaman = ref([])
const daftarPengembalian = ref([])
const daftarAlat = ref([])
const pencarian = ref('')
const filterStatus = ref('Semua')
const terpilih = ref(null)
const loading = ref(true)
const errorMessage = ref('')

// Pagination State
const halamanSaatIni = ref(1)
const itemPerHalaman = ref(8)

const opsiFilter = ['Semua', 'Menunggu', 'Disetujui', 'Ditolak']

// Reset halaman ke 1 saat filter atau pencarian berubah
watch([pencarian, filterStatus], () => {
    halamanSaatIni.value = 1
})

// Computed
const pengembalianPerPeminjaman = computed(
    () => new Map(daftarPengembalian.value.map((item) => [item.peminjaman_id, item]))
)

const daftarLengkap = computed(() => {
    const mapAlat = new Map(daftarAlat.value.map((a) => [a.id, a]))
    return daftarPeminjaman.value.map((item) => {
        const alatInfo = mapAlat.get(item.alat_id)
        return {
            ...item,
            gambar: item.gambar || item.gambar_alat || alatInfo?.gambar || null,
        }
    })
})

const hasil = computed(() => {
    const query = pencarian.value.toLowerCase().trim()

    return daftarLengkap.value.filter((item) => {
        const matchStatus =
            filterStatus.value === 'Semua' || item.status === filterStatus.value

        const matchQuery =
            !query ||
            [item.kode_peminjaman, item.alat, item.status].some((val) =>
                val?.toLowerCase().includes(query)
            )

        return matchStatus && matchQuery
    })
})

const totalHalaman = computed(() =>
    Math.max(1, Math.ceil(hasil.value.length / itemPerHalaman.value))
)

const dataPaginasi = computed(() => {
    const mulai = (halamanSaatIni.value - 1) * itemPerHalaman.value
    return hasil.value.slice(mulai, mulai + itemPerHalaman.value)
})

const infoRentangData = computed(() => {
    if (!hasil.value.length) return { mulai: 0, akhir: 0, total: 0 }
    const mulai = (halamanSaatIni.value - 1) * itemPerHalaman.value + 1
    const akhir = Math.min(halamanSaatIni.value * itemPerHalaman.value, hasil.value.length)
    return { mulai, akhir, total: hasil.value.length }
})

const detailRows = computed(() => {
    if (!terpilih.value) return []
    const item = terpilih.value

    return [
        { label: 'ID Peminjaman', value: item.kode_peminjaman || '-' },
        { label: 'Nama Alat', value: item.alat || '-' },
        { label: 'Jumlah', value: `${item.jumlah ?? 0} unit` },
        { label: 'Tanggal Pinjam', value: item.tanggal_pinjam || '-' },
        { label: 'Tanggal Kembali', value: item.tanggal_kembali || '-' },
        { label: 'Keperluan', value: item.keperluan || '-' },
        { label: 'Status', value: item.status || '-', isStatus: true },
        { label: 'Catatan', value: item.catatan || item.keterangan || '-' },
    ]
})

// Methods
function statusBadgeClass(status) {
    const map = {
        Menunggu: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
        Disetujui:
            'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
        Ditolak: 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-600/20',
    }

    return map[status] ?? 'bg-gray-100 text-gray-700'
}

function statusPengembalian(peminjaman) {
    return pengembalianPerPeminjaman.value.get(peminjaman.id)?.status
}

function ajukanKembali(item) {
    router.push({
        name: 'peminjam-ajukan-pengembalian',
        query: { peminjaman: item.id },
    })
}

async function ambilData() {
    loading.value = true
    errorMessage.value = ''

    try {
        const [resPeminjaman, resPengembalian, resAlat] = await Promise.all([
            getPeminjaman(),
            getPengembalianSaya(),
            getAlat().catch(() => ({ data: [] })),
        ])

        daftarPeminjaman.value = Array.isArray(resPeminjaman.data)
            ? resPeminjaman.data
            : []
        daftarPengembalian.value = Array.isArray(resPengembalian.data)
            ? resPengembalian.data
            : []
        daftarAlat.value = Array.isArray(resAlat.data) ? resAlat.data : []
    } catch (error) {
        errorMessage.value =
            error.response?.data?.message ?? 'Gagal mengambil riwayat peminjaman.'
    } finally {
        loading.value = false
    }
}

onMounted(ambilData)
</script>

<template>
    <main class="min-h-full bg-[#F8F9FA] p-6 md:p-8" style="font-family: 'DM Sans', Arial, sans-serif">
        <!-- Header -->
        <div>
            <h1 class="font-display text-2xl font-bold tracking-wide text-gray-900 md:text-3xl">
                STATUS PEMINJAMAN
            </h1>
            <p class="mt-1.5 text-sm text-[#697386] md:text-base">
                Pantau status pengajuan peminjaman alat Anda secara berkala.
            </p>
        </div>

        <!-- Search & Filter Tabs -->
        <div class="mt-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div class="relative w-full lg:max-w-[380px]">
                <Search :size="18"
                    class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085]" />
                <Input v-model="pencarian" placeholder="Cari kode peminjaman atau nama alat..."
                    class="h-11 rounded-xl border-[#dfe3e8] bg-white pl-10 text-sm shadow-xs focus-visible:border-black" />
            </div>

            <!-- Filter Pills -->
            <div class="flex flex-wrap items-center gap-2">
                <button v-for="opsi in opsiFilter" :key="opsi" type="button"
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

        <!-- Tabel Data -->
        <section class="mt-6 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs">
            <div class="overflow-x-auto">
                <table class="w-full min-w-[900px] border-collapse text-left text-sm">
                    <thead>
                        <tr
                            class="border-b border-gray-200 bg-black text-xs font-semibold tracking-wider text-white">
                            <th class="px-6 py-4">ID</th>
                            <th class="px-6 py-4">Alat</th>
                            <th class="px-6 py-4">Jumlah</th>
                            <th class="px-6 py-4">Tgl Pinjam</th>
                            <th class="px-6 py-4">Tgl Kembali</th>
                            <th class="px-6 py-4">Status</th>
                            <th class="px-6 py-4 text-center">Aksi</th>
                        </tr>
                    </thead>

                    <tbody class="divide-y divide-gray-100">
                        <!-- Loading Skeleton Rows -->
                        <template v-if="loading">
                            <tr v-for="n in 4" :key="n" class="animate-pulse">
                                <td class="px-6 py-4">
                                    <div class="h-4 w-20 rounded bg-gray-100" />
                                </td>
                                <td class="px-6 py-4">
                                    <div class="h-4 w-36 rounded bg-gray-100" />
                                </td>
                                <td class="px-6 py-4">
                                    <div class="h-4 w-12 rounded bg-gray-100" />
                                </td>
                                <td class="px-6 py-4">
                                    <div class="h-4 w-24 rounded bg-gray-100" />
                                </td>
                                <td class="px-6 py-4">
                                    <div class="h-4 w-24 rounded bg-gray-100" />
                                </td>
                                <td class="px-6 py-4">
                                    <div class="h-6 w-24 rounded-full bg-gray-100" />
                                </td>
                                <td class="px-6 py-4">
                                    <div class="mx-auto h-8 w-28 rounded-xl bg-gray-100" />
                                </td>
                            </tr>
                        </template>

                        <!-- Empty State -->
                        <tr v-else-if="!dataPaginasi.length">
                            <td colspan="7" class="px-6 py-16 text-center">
                                <div class="flex flex-col items-center justify-center">
                                    <ClipboardList :size="44" stroke-width="1.25" class="text-gray-400" />
                                    <p class="mt-3 text-base font-semibold text-gray-900">
                                        Tidak ada data peminjaman
                                    </p>
                                    <p class="mt-1 text-sm text-gray-500">
                                        Belum ada riwayat pengajuan peminjaman atau hasil tidak cocok dengan pencarian.
                                    </p>
                                </div>
                            </td>
                        </tr>

                        <!-- Data Rows -->
                        <tr v-for="item in dataPaginasi" v-else :key="item.id"
                            class="transition-colors hover:bg-gray-50/80">
                            <td class="px-6 py-4 font-mono text-xs font-medium text-gray-500">
                                {{ item.kode_peminjaman }}
                            </td>
                            <td class="px-6 py-4 font-semibold text-gray-900">
                                {{ item.alat }}
                            </td>
                            <td class="px-6 py-4 text-gray-600">
                                {{ item.jumlah }} unit
                            </td>
                            <td class="px-6 py-4 text-gray-600">
                                {{ item.tanggal_pinjam || '-' }}
                            </td>
                            <td class="px-6 py-4 text-gray-600">
                                {{ item.tanggal_kembali || '-' }}
                            </td>
                            <td class="px-6 py-4">
                                <span
                                    class="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap"
                                    :class="statusBadgeClass(item.status)">
                                    {{ item.status }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center justify-center gap-2">
                                    <Button size="sm" variant="outline"
                                        class="h-8 rounded-lg border-[#dfe3e8] px-3 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                        @click="terpilih = item">
                                        <Eye :size="14" class="mr-1" />
                                        Detail
                                    </Button>
                                    <Button v-if="item.status === 'Disetujui' && !statusPengembalian(item)" size="sm"
                                        class="h-8 rounded-lg bg-black px-3 text-xs font-semibold text-white hover:bg-black/85"
                                        @click="ajukanKembali(item)">
                                        <RotateCcw :size="13" class="mr-1" />
                                        Kembalikan
                                    </Button>
                                    <span v-else-if="statusPengembalian(item)"
                                        class="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                        {{
                                            statusPengembalian(item) === 'Menunggu'
                                                ? 'Menunggu Verifikasi'
                                                : 'Dikembalikan'
                                        }}
                                    </span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination Footer -->
            <div v-if="!loading && hasil.length > 0"
                class="flex flex-col items-center justify-between gap-4 border-t border-gray-100 bg-white px-6 py-4 sm:flex-row">
                <p class="text-xs text-gray-500">
                    Menampilkan
                    <span class="font-semibold text-gray-900">{{ infoRentangData.mulai }}</span>
                    –
                    <span class="font-semibold text-gray-900">{{ infoRentangData.akhir }}</span>
                    dari
                    <span class="font-semibold text-gray-900">{{ infoRentangData.total }}</span>
                    data
                </p>

                <div class="flex items-center gap-1.5">
                    <Button type="button" variant="outline" size="sm"
                        class="h-8 rounded-lg border-[#dfe3e8] px-2.5 text-xs font-semibold text-gray-700 disabled:opacity-40"
                        :disabled="halamanSaatIni <= 1" @click="halamanSaatIni--">
                        <ChevronLeft :size="15" class="mr-0.5" />
                        Sebelumnya
                    </Button>

                    <button v-for="nomor in totalHalaman" :key="nomor" type="button"
                        class="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors"
                        :class="halamanSaatIni === nomor
                            ? 'bg-black text-white'
                            : 'border border-[#dfe3e8] bg-white text-gray-700 hover:bg-gray-50'
                            " @click="halamanSaatIni = nomor">
                        {{ nomor }}
                    </button>

                    <Button type="button" variant="outline" size="sm"
                        class="h-8 rounded-lg border-[#dfe3e8] px-2.5 text-xs font-semibold text-gray-700 disabled:opacity-40"
                        :disabled="halamanSaatIni >= totalHalaman" @click="halamanSaatIni++">
                        Berikutnya
                        <ChevronRight :size="15" class="ml-0.5" />
                    </Button>
                </div>
            </div>
        </section>

        <!-- Modal Detail Peminjaman -->
        <Dialog :open="Boolean(terpilih)" @update:open="(open) => { if (!open) terpilih = null }">
            <DialogContent class="w-[65vw] sm:max-w-xl overflow-hidden rounded-3xl p-0 [&>button]:hidden">
                <DialogHeader class="border-b border-gray-100 px-6 py-5 sm:px-8">
                    <DialogTitle class="font-display text-lg font-bold tracking-wide text-gray-900 sm:text-xl">
                        DETAIL PENGAJUAN PEMINJAMAN
                    </DialogTitle>
                </DialogHeader>

                <div v-if="terpilih" class="px-6 py-6 sm:px-8">
                    <div class="grid items-center gap-6 sm:grid-cols-[1fr_200px]">
                        <dl class="grid grid-cols-[135px_12px_1fr] gap-y-3 text-sm">
                            <template v-for="row in detailRows" :key="row.label">
                                <dt class="text-gray-500">{{ row.label }}</dt>
                                <span class="text-gray-400">:</span>
                                <dd class="font-semibold text-gray-900">
                                    <span v-if="row.isStatus"
                                        class="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold"
                                        :class="statusBadgeClass(row.value)">
                                        {{ row.value }}
                                    </span>
                                    <span v-else>{{ row.value }}</span>
                                </dd>
                            </template>
                        </dl>

                        <!-- Box Gambar Alat -->
                        <div
                            class="flex h-55 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-gray-100 bg-[#F8F9FA] p-3 sm:h-48">
                            <img v-if="terpilih.gambar" :src="terpilih.gambar" :alt="terpilih.alat"
                                class="h-full w-full object-contain" />
                            <Package v-else :size="60" stroke-width="1.35" class="text-gray-400" />
                        </div>
                    </div>

                    <div class="mt-7 flex justify-end gap-2.5 border-t border-gray-100 pt-5">
                        <Button variant="outline"
                            class="h-10 rounded-xl border-[#dfe3e8] px-4 font-semibold text-gray-700"
                            @click="terpilih = null">
                            <X :size="16" class="mr-1.5" />
                            Tutup
                        </Button>
                        <Button v-if="terpilih.status === 'Disetujui' && !statusPengembalian(terpilih)"
                            class="h-10 rounded-xl bg-black px-5 font-semibold text-white hover:bg-black/85"
                            @click="ajukanKembali(terpilih)">
                            <RotateCcw :size="15" class="mr-1.5" />
                            Ajukan Pengembalian
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    </main>
</template>