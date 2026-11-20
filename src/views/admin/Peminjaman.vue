<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { AlertCircle, CalendarDays, Plus, Search } from 'lucide-vue-next'
import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date'
import Button from '@/components/ui/button/Button.vue'
import { Input } from '@/components/ui/input'
import Calendar from '@/components/ui/calendar/Calendar.vue'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import Table from '@/components/admin/peminjaman/table.vue'
import { getPeminjaman, hapusPeminjaman } from '@/services/peminjamanService'

const router = useRouter()
const daftarPeminjaman = ref([])
const loading = ref(true)
const errorMessage = ref('')
const pencarian = ref('')
const tanggalTerpilih = ref()
const statusTerpilih = ref('Semua')
const opsiStatus = ['Semua', 'Menunggu', 'Disetujui', 'Ditolak']

const placeholderTanggal = today(getLocalTimeZone())
const dateFormatter = new DateFormatter('id-ID', { dateStyle: 'medium' })

// Pagination State
const halamanSaatIni = ref(1)
const itemPerHalaman = ref(8)

watch([pencarian, tanggalTerpilih, statusTerpilih], () => {
    halamanSaatIni.value = 1
})

function tanggalKeIso(value) {
    if (!value) return ''
    const [day, month, year] = value.split('/')
    return year && month && day ? `${year}-${month}-${day}` : value
}

const peminjamanDitampilkan = computed(() => {
    const query = pencarian.value.trim().toLowerCase()

    return daftarPeminjaman.value.filter((peminjaman) => {
        const cocokPencarian =
            !query ||
            [
                peminjaman.nama_peminjam,
                peminjaman.alat,
                peminjaman.kategori_alat,
                peminjaman.kode_peminjaman,
            ].some((value) => String(value ?? '').toLowerCase().includes(query))

        const cocokTanggal =
            !tanggalTerpilih.value ||
            tanggalKeIso(peminjaman.tanggal_pinjam) === tanggalTerpilih.value.toString()

        const cocokStatus =
            statusTerpilih.value === 'Semua' ||
            String(peminjaman.status ?? '').toLowerCase() === statusTerpilih.value.toLowerCase()

        return cocokPencarian && cocokTanggal && cocokStatus
    })
})

const totalHalaman = computed(() =>
    Math.max(1, Math.ceil(peminjamanDitampilkan.value.length / itemPerHalaman.value))
)

const peminjamanPaginasi = computed(() => {
    const mulai = (halamanSaatIni.value - 1) * itemPerHalaman.value
    return peminjamanDitampilkan.value.slice(mulai, mulai + itemPerHalaman.value)
})

const infoRentangData = computed(() => {
    if (!peminjamanDitampilkan.value.length) return { mulai: 0, akhir: 0, total: 0 }
    const mulai = (halamanSaatIni.value - 1) * itemPerHalaman.value + 1
    const akhir = Math.min(
        halamanSaatIni.value * itemPerHalaman.value,
        peminjamanDitampilkan.value.length
    )
    return { mulai, akhir, total: peminjamanDitampilkan.value.length }
})

async function ambilPeminjaman() {
    loading.value = true
    errorMessage.value = ''
    try {
        const response = await getPeminjaman()
        const peminjaman = response.data.data ?? response.data
        if (!Array.isArray(peminjaman)) {
            throw new TypeError('Respons API peminjaman tidak berisi daftar peminjaman.')
        }
        daftarPeminjaman.value = peminjaman
    } catch (error) {
        console.error('Gagal mengambil data peminjaman:', error)
        errorMessage.value = error.response?.data?.message ?? 'Gagal mengambil data peminjaman.'
    } finally {
        loading.value = false
    }
}

function editPeminjaman(item) {
    router.push(`/admin/peminjaman-form/${item.id}`)
}

async function hapusItemPeminjaman(item) {
    if (!confirm(`Yakin ingin menghapus pengajuan ${item.kode_peminjaman}?`)) return

    try {
        await hapusPeminjaman(item.id)
        daftarPeminjaman.value = daftarPeminjaman.value.filter(
            (peminjaman) => peminjaman.id !== item.id
        )

        if (halamanSaatIni.value > totalHalaman.value) {
            halamanSaatIni.value = totalHalaman.value
        }
    } catch (error) {
        console.error('Gagal menghapus peminjaman:', error)
        errorMessage.value = error.response?.data?.message ?? 'Gagal menghapus peminjaman.'
    }
}

onMounted(ambilPeminjaman)
</script>

<template>
    <main class="min-h-full bg-[#F8F9FA] p-6 md:p-8" style="font-family: 'DM Sans', Arial, sans-serif">
        <!-- Header -->
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <h1 class="font-display text-2xl font-bold tracking-wide text-gray-900 md:text-3xl">
                    KELOLA PEMINJAMAN
                </h1>
                <p class="mt-1.5 text-sm text-[#697386] md:text-base">
                    Kelola pengajuan dan pantau status peminjaman alat dalam sistem.
                </p>
            </div>

            <Button
                class="h-11 gap-2 rounded-xl bg-black px-5 text-sm font-semibold text-white shadow-xs hover:bg-black/85"
                @click="router.push('/admin/peminjaman-form')">
                <Plus :size="18" />
                Tambah Peminjaman
            </Button>
        </div>

        <!-- Search, Date Filter & Status Pills -->
        <div class="mt-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                <!-- Search Input -->
                <div class="relative w-full sm:w-[320px]">
                    <Search :size="18"
                        class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085]" />
                    <Input v-model="pencarian" type="search" placeholder="Cari kode, peminjam, atau alat..."
                        class="h-11 rounded-xl border-[#dfe3e8] bg-white pl-10 text-sm shadow-xs focus-visible:border-black" />
                </div>

                <!-- Date Picker Popover -->
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
                    <PopoverContent align="start" class="w-auto rounded-2xl p-0">
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

            <!-- Filter Status Pills -->
            <div class="flex flex-wrap items-center gap-2">
                <button v-for="opsi in opsiStatus" :key="opsi" type="button"
                    class="rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors" :class="statusTerpilih === opsi
                            ? 'bg-black text-white shadow-xs'
                            : 'border border-[#dfe3e8] bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        " @click="statusTerpilih = opsi">
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

        <!-- Tabel Peminjaman -->
        <div class="mt-6">
            <Table :peminjaman="peminjamanPaginasi" :loading="loading" :halaman-saat-ini="halamanSaatIni"
                :total-halaman="totalHalaman" :info-rentang="infoRentangData" @edit="editPeminjaman"
                @delete="hapusItemPeminjaman" @ganti-halaman="halamanSaatIni = $event" />
        </div>
    </main>
</template>