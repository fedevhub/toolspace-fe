<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import {
    ChevronLeft,
    ChevronRight,
    Clock,
} from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import { getRiwayatAktivitas } from '@/services/dashboardService'

const props = defineProps({
    aktivitasProp: {
        type: Array,
        default: null,
    },
    loadingProp: {
        type: Boolean,
        default: false,
    },
})

const dataLokal = ref([])
const loadingLokal = ref(false)

const daftarAktivitas = computed(() =>
    props.aktivitasProp !== null ? props.aktivitasProp : dataLokal.value
)

const isLoading = computed(() =>
    props.aktivitasProp !== null ? props.loadingProp : loadingLokal.value
)

// Pagination State
const halamanSaatIni = ref(1)
const itemPerHalaman = ref(10)

watch(daftarAktivitas, () => {
    halamanSaatIni.value = 1
})

const totalHalaman = computed(() =>
    Math.max(1, Math.ceil(daftarAktivitas.value.length / itemPerHalaman.value))
)

const aktivitasPaginasi = computed(() => {
    const mulai = (halamanSaatIni.value - 1) * itemPerHalaman.value
    return daftarAktivitas.value.slice(mulai, mulai + itemPerHalaman.value)
})

const infoRentangData = computed(() => {
    if (!daftarAktivitas.value.length) return { mulai: 0, akhir: 0, total: 0 }
    const mulai = (halamanSaatIni.value - 1) * itemPerHalaman.value + 1
    const akhir = Math.min(
        halamanSaatIni.value * itemPerHalaman.value,
        daftarAktivitas.value.length
    )
    return { mulai, akhir, total: daftarAktivitas.value.length }
})

onMounted(async () => {
    if (props.aktivitasProp !== null) return

    loadingLokal.value = true
    try {
        const response = await getRiwayatAktivitas()
        const hasil = response.data?.data ?? response.data
        dataLokal.value = Array.isArray(hasil) ? hasil : []
    } catch (error) {
        console.error('Gagal mengambil riwayat aktivitas:', error)
    } finally {
        loadingLokal.value = false
    }
})
</script>

<template>
    <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs"
        style="font-family: 'DM Sans', Arial, sans-serif">
        <div class="overflow-x-auto">
            <table class="w-full min-w-[850px] border-collapse text-left text-sm">
                <thead>
                    <tr class="border-b border-gray-200 bg-black text-xs font-semibold tracking-wider text-white">
                        <th class="w-32 px-6 py-4">ID</th>
                        <th class="w-56 px-6 py-4">Pengguna</th>
                        <th class="px-6 py-4">Aktivitas</th>
                        <th class="w-48 px-6 py-4">Waktu</th>
                    </tr>
                </thead>

                <tbody class="divide-y divide-gray-100">
                    <!-- Loading Skeleton -->
                    <template v-if="isLoading && daftarAktivitas.length === 0">
                        <tr v-for="n in 5" :key="n" class="animate-pulse">
                            <td class="px-6 py-4">
                                <div class="h-5 w-16 rounded-md bg-gray-100" />
                            </td>
                            <td class="px-6 py-4">
                                <div class="h-4 w-36 rounded bg-gray-100" />
                            </td>
                            <td class="px-6 py-4">
                                <div class="h-4 w-64 rounded bg-gray-100" />
                            </td>
                            <td class="px-6 py-4">
                                <div class="h-4 w-32 rounded bg-gray-100" />
                            </td>
                        </tr>
                    </template>

                    <!-- Empty State -->
                    <tr v-else-if="daftarAktivitas.length === 0">
                        <td colspan="4" class="px-6 py-16 text-center">
                            <div class="flex flex-col items-center justify-center">
                                <Clock :size="44" stroke-width="1.25" class="text-gray-400" />
                                <p class="mt-3 text-base font-semibold text-gray-900">
                                    Belum ada aktivitas transaksi
                                </p>
                                <p class="mt-1 text-sm text-gray-500">
                                    Riwayat aktivitas pengguna akan tercatat otomatis di sini.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Data Rows -->
                    <tr v-for="item in aktivitasPaginasi" v-else :key="item.id"
                        class="transition-colors hover:bg-gray-50/80">
                        <td class="px-6 py-4">
                            <span
                                class="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 font-mono text-xs font-semibold text-gray-700">
                                #{{ String(item.id ?? '').slice(-6) }}
                            </span>
                        </td>
                        <td class="px-6 py-4 font-semibold text-gray-900">
                            {{ item.pengguna }}
                        </td>
                        <td class="px-6 py-4 text-gray-700">
                            {{ item.aktivitas }}
                        </td>
                        <td class="whitespace-nowrap px-6 py-4 text-xs font-medium text-gray-500">
                            {{ item.waktu }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination Footer -->
        <div v-if="!isLoading && infoRentangData.total > 0"
            class="flex flex-col items-center justify-between gap-4 border-t border-gray-100 bg-white px-6 py-4 sm:flex-row">
            <p class="text-xs text-gray-500">
                Menampilkan
                <span class="font-semibold text-gray-900">{{ infoRentangData.mulai }}</span>
                –
                <span class="font-semibold text-gray-900">{{ infoRentangData.akhir }}</span>
                dari
                <span class="font-semibold text-gray-900">{{ infoRentangData.total }}</span>
                log aktivitas
            </p>

            <div class="flex items-center gap-1.5">
                <Button type="button" variant="outline" size="sm"
                    class="h-8 rounded-lg border-[#dfe3e8] px-2.5 text-xs font-semibold text-gray-700 disabled:opacity-40"
                    :disabled="halamanSaatIni <= 1" @click="halamanSaatIni -= 1">
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
                    :disabled="halamanSaatIni >= totalHalaman" @click="halamanSaatIni += 1">
                    Berikutnya
                    <ChevronRight :size="15" class="ml-0.5" />
                </Button>
            </div>
        </div>
    </section>
</template>