<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { AlertCircle, ChevronLeft, ChevronRight, ClipboardCheck, RotateCcw, Search } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getPengembalianSaya } from '@/services/pengembalianService'

const perHalaman = 8
const daftar = ref([])
const loading = ref(true)
const errorMessage = ref('')
const pencarian = ref('')
const statusTerpilih = ref('Semua')
const halaman = ref(1)
const opsiStatus = ['Semua', 'Menunggu', 'Selesai', 'Denda']

const hasil = computed(() => {
    const q = pencarian.value.trim().toLowerCase()
    return daftar.value.filter((item) => {
        const cocokStatus = statusTerpilih.value === 'Semua' || item.status === statusTerpilih.value
        const cocokQuery =
            !q ||
            [item.kode_pengembalian, item.alat, item.status].some((nilai) =>
                String(nilai ?? '').toLowerCase().includes(q)
            )
        return cocokStatus && cocokQuery
    })
})

const totalHalaman = computed(() => Math.max(1, Math.ceil(hasil.value.length / perHalaman)))

const halamanIni = computed(() => {
    const mulai = (halaman.value - 1) * perHalaman
    return hasil.value.slice(mulai, mulai + perHalaman)
})

watch([pencarian, statusTerpilih], () => {
    halaman.value = 1
})

function badgeStatus(status) {
    return (
        {
            Menunggu: 'bg-amber-50 text-amber-700 ring-amber-600/20',
            Selesai: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
            Denda: 'bg-red-50 text-red-700 ring-red-600/20',
        }[status] ?? 'bg-gray-100 text-gray-700 ring-gray-600/20'
    )
}

async function ambilData() {
    loading.value = true
    errorMessage.value = ''
    try {
        const response = await getPengembalianSaya()
        const data = response.data?.data ?? response.data
        if (!Array.isArray(data)) throw new TypeError('Respons API pengembalian tidak berisi daftar.')
        daftar.value = data
    } catch (error) {
        console.error('Gagal mengambil data pengembalian:', error)
        errorMessage.value = error.response?.data?.message ?? 'Gagal mengambil data pengembalian.'
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
                PENGEMBALIAN SAYA
            </h1>
            <p class="mt-1.5 text-sm text-[#697386] md:text-base">
                Pantau pengajuan pengembalian barang yang Anda pinjam.
            </p>
        </div>

        <!-- Toolbar Search & Filter Status -->
        <div class="mt-6 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div class="relative w-full lg:max-w-[340px]">
                <Search :size="18"
                    class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085]" />
                <Input v-model="pencarian" type="search" placeholder="Cari kode atau nama alat..."
                    class="h-11 rounded-xl border-[#dfe3e8] bg-white pl-10 text-sm shadow-xs focus-visible:border-black" />
            </div>

            <div class="flex flex-wrap items-center gap-2">
                <button v-for="opsi in opsiStatus" :key="opsi" type="button"
                    class="h-10 rounded-xl px-4 text-xs font-semibold transition-colors" :class="statusTerpilih === opsi
                            ? 'bg-black text-white shadow-xs'
                            : 'border border-[#dfe3e8] bg-white text-gray-600 shadow-xs hover:bg-gray-50 hover:text-gray-900'
                        " @click="statusTerpilih = opsi">
                    {{ opsi }}
                </button>

                <Button type="button" variant="outline" title="Muat ulang data"
                    class="h-10 w-10 shrink-0 rounded-xl border-[#dfe3e8] bg-white p-0 text-gray-600 shadow-xs hover:bg-gray-50 hover:text-gray-900"
                    @click="ambilData">
                    <RotateCcw :size="16" :class="{ 'animate-spin': loading }" />
                </Button>
            </div>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage" role="alert"
            class="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle :size="20" class="shrink-0" />
            <span>{{ errorMessage }}</span>
        </div>

        <!-- Tabel Pengembalian -->
        <section class="mt-6 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs">
            <div class="overflow-x-auto">
                <table class="w-full min-w-[760px] border-collapse text-left text-sm">
                    <thead>
                        <tr
                            class="border-b border-gray-200 bg-black text-xs font-semibold tracking-wider text-white">
                            <th class="px-6 py-4">Kode</th>
                            <th class="px-6 py-4">Alat</th>
                            <th class="px-6 py-4">Jumlah</th>
                            <th class="px-6 py-4">Tgl Pengajuan</th>
                            <th class="px-6 py-4">Kondisi</th>
                            <th class="px-6 py-4">Status</th>
                        </tr>
                    </thead>

                    <tbody class="divide-y divide-gray-100">
                        <template v-if="loading">
                            <tr v-for="n in 4" :key="n" class="animate-pulse">
                                <td v-for="i in 6" :key="i" class="px-6 py-4">
                                    <div class="h-4 w-24 rounded bg-gray-100" />
                                </td>
                            </tr>
                        </template>

                        <tr v-else-if="!halamanIni.length">
                            <td colspan="6" class="px-6 py-16 text-center">
                                <ClipboardCheck :size="44" stroke-width="1.25" class="mx-auto text-gray-400" />
                                <p class="mt-3 font-semibold text-gray-900">
                                    Belum ada pengajuan pengembalian
                                </p>
                                <p class="mt-1 text-sm text-gray-500">
                                    Riwayat pengajuan pengembalian barang Anda akan muncul di sini.
                                </p>
                            </td>
                        </tr>

                        <tr v-for="item in halamanIni" v-else :key="item.id"
                            class="transition-colors hover:bg-gray-50/80">
                            <td class="px-6 py-4 font-mono text-xs font-semibold text-gray-600">
                                {{ item.kode_pengembalian }}
                            </td>
                            <td class="px-6 py-4 font-semibold text-gray-900">
                                {{ item.alat }}
                            </td>
                            <td class="px-6 py-4 text-gray-600">
                                {{ item.jumlah }} unit
                            </td>
                            <td class="px-6 py-4 text-gray-600">
                                {{ item.tanggal_pengembalian || '-' }}
                            </td>
                            <td class="px-6 py-4 text-gray-600">
                                {{ item.kondisi || '-' }}
                            </td>
                            <td class="px-6 py-4">
                                <span class="inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset"
                                    :class="badgeStatus(item.status)">
                                    {{ item.status }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="!loading && hasil.length > 0"
                class="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-6 py-4 text-xs text-gray-500 sm:flex-row">
                <span>
                    Menampilkan <strong class="text-gray-900">{{ halamanIni.length }}</strong> dari
                    <strong class="text-gray-900">{{ hasil.length }}</strong> pengajuan
                </span>

                <div class="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm"
                        class="h-8 gap-1 rounded-lg border-gray-200 px-2.5 text-xs font-medium"
                        :disabled="halaman === 1" @click="halaman--">
                        <ChevronLeft :size="14" />
                        Sebelumnya
                    </Button>
                    <span class="px-2 font-semibold text-gray-700">
                        {{ halaman }} / {{ totalHalaman }}
                    </span>
                    <Button type="button" variant="outline" size="sm"
                        class="h-8 gap-1 rounded-lg border-gray-200 px-2.5 text-xs font-medium"
                        :disabled="halaman >= totalHalaman" @click="halaman++">
                        Berikutnya
                        <ChevronRight :size="14" />
                    </Button>
                </div>
            </div>
        </section>
    </main>
</template>