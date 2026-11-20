<script setup>
import { computed, onMounted, ref } from 'vue'
import { AlertCircle, CalendarDays, Search } from 'lucide-vue-next'
import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date'
import Table from '@/components/admin/log-aktivitas.vue'
import { Input } from '@/components/ui/input'
import Calendar from '@/components/ui/calendar/Calendar.vue'
import Button from '@/components/ui/button/Button.vue'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { getRiwayatAktivitas } from '@/services/dashboardService'

const daftarAktivitas = ref([])
const loading = ref(true)
const errorMessage = ref('')
const pencarian = ref('')
const tanggalTerpilih = ref()

const placeholderTanggal = today(getLocalTimeZone())
const dateFormatter = new DateFormatter('id-ID', { dateStyle: 'medium' })

function tanggalWaktuKeIso(value) {
    if (!value) return ''
    const str = String(value).trim()

    // Format DD/MM/YYYY atau DD-MM-YYYY (dengan/tanpa jam)
    const dmyMatch = str.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/)
    if (dmyMatch) {
        const [, day, month, year] = dmyMatch
        return `${year}-${month}-${day}`
    }

    // Format ISO YYYY-MM-DD
    const ymdMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (ymdMatch) {
        return `${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}`
    }

    const parsed = new Date(str)
    if (Number.isNaN(parsed.getTime())) return ''
    const y = parsed.getFullYear()
    const m = String(parsed.getMonth() + 1).padStart(2, '0')
    const d = String(parsed.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

const aktivitasDitampilkan = computed(() => {
    const query = pencarian.value.trim().toLowerCase()

    return daftarAktivitas.value.filter((item) => {
        const cocokPencarian =
            !query ||
            [item.id, item.pengguna, item.aktivitas, item.waktu]
                .some((val) => String(val ?? '').toLowerCase().includes(query))

        const cocokTanggal =
            !tanggalTerpilih.value ||
            tanggalWaktuKeIso(item.waktu) === tanggalTerpilih.value.toString()

        return cocokPencarian && cocokTanggal
    })
})

async function ambilAktivitas() {
    loading.value = true
    errorMessage.value = ''
    try {
        const response = await getRiwayatAktivitas()
        const hasil = response.data?.data ?? response.data
        daftarAktivitas.value = Array.isArray(hasil) ? hasil : []
    } catch (error) {
        console.error('Gagal mengambil riwayat aktivitas:', error)
        errorMessage.value =
            error.response?.data?.message ?? 'Gagal mengambil riwayat aktivitas.'
    } finally {
        loading.value = false
    }
}

onMounted(ambilAktivitas)
</script>

<template>
    <main class="min-h-full bg-[#F8F9FA] p-6 md:p-8" style="font-family: 'DM Sans', Arial, sans-serif">
        <!-- Header -->
        <div>
            <h1 class="font-display text-2xl font-bold tracking-wide text-gray-900 md:text-3xl">
                LOG AKTIVITAS
            </h1>
            <p class="mt-1.5 text-sm text-[#697386] md:text-base">
                Pantau dan telusuri riwayat aktivitas pengguna dalam sistem.
            </p>
        </div>

        <!-- Search & Date Filter -->
        <div class="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div class="relative w-full sm:max-w-[380px]">
                <Search :size="18"
                    class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085]" />
                <Input v-model="pencarian" type="search" placeholder="Cari ID, pengguna, atau aktivitas..."
                    class="h-11 rounded-xl border-[#dfe3e8] bg-white pl-10 text-sm shadow-xs focus-visible:border-black" />
            </div>

            <div class="flex items-center gap-3">
                <Popover>
                    <PopoverTrigger as-child>
                        <Button variant="outline"
                            class="h-11 justify-between gap-2.5 rounded-xl border-[#dfe3e8] bg-white px-4 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50">
                            <span>
                                {{
                                    tanggalTerpilih
                                        ? dateFormatter.format(tanggalTerpilih.toDate(getLocalTimeZone()))
                                        : 'Filter Tanggal'
                                }}
                            </span>
                            <CalendarDays :size="17" class="text-gray-500" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" class="w-auto rounded-2xl p-0">
                        <Calendar v-model="tanggalTerpilih" :default-placeholder="placeholderTanggal" locale="id-ID"
                            :initial-focus="true" />
                        <div v-if="tanggalTerpilih" class="border-t border-gray-100 p-2">
                            <Button variant="ghost" size="sm"
                                class="w-full rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
                                @click="tanggalTerpilih = undefined">
                                Hapus filter tanggal
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage" role="alert"
            class="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle :size="20" class="shrink-0" />
            <span>{{ errorMessage }}</span>
        </div>

        <!-- Tabel Log Aktivitas -->
        <div class="mt-6">
            <Table :aktivitas-prop="aktivitasDitampilkan" :loading-prop="loading" />
        </div>
    </main>
</template>