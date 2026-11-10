<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Eye,
    LogOut,
    Plus,
    Search,
    X,
} from 'lucide-vue-next'
import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date'
import Button from '@/components/ui/button/Button.vue'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import Calendar from '@/components/ui/calendar/Calendar.vue'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { getPeminjaman } from '@/services/peminjamanService'

const router = useRouter()
const pengguna = computed(() => {
    try {
        return JSON.parse(localStorage.getItem('user') || 'null')
    } catch (error) {
        console.error('Data pengguna tersimpan tidak valid:', error)
        return null
    }
})

const daftarPeminjaman = ref([])
const loading = ref(true)
const errorMessage = ref('')
const pencarian = ref('')
const tanggalTerpilih = ref()
const statusTerpilih = ref('Semua Status')
const peminjamanTerpilih = ref(null)
const halaman = ref(1)
const perHalaman = 5
const placeholderTanggal = today(getLocalTimeZone())
const dateFormatter = new DateFormatter('id-ID', { dateStyle: 'medium' })

const peminjamanDitampilkan = computed(() => {
    const query = pencarian.value.trim().toLowerCase()

    return daftarPeminjaman.value.filter((peminjaman) => {
        const cocokPencarian = !query ||
            [peminjaman.alat, peminjaman.kategori_alat, peminjaman.kode_peminjaman]
                .some((value) => value?.toLowerCase().includes(query))
        const cocokTanggal = !tanggalTerpilih.value ||
            tanggalKeIso(peminjaman.tanggal_pinjam) === tanggalTerpilih.value.toString()
        const cocokStatus = statusTerpilih.value === 'Semua Status' ||
            peminjaman.status === statusTerpilih.value

        return cocokPencarian && cocokTanggal && cocokStatus
    })
})

const jumlahHalaman = computed(() => Math.max(1, Math.ceil(peminjamanDitampilkan.value.length / perHalaman)))
const peminjamanHalamanIni = computed(() => {
    const mulai = (halaman.value - 1) * perHalaman
    return peminjamanDitampilkan.value.slice(mulai, mulai + perHalaman)
})
const rentangAwal = computed(() => peminjamanDitampilkan.value.length ? (halaman.value - 1) * perHalaman + 1 : 0)
const rentangAkhir = computed(() => Math.min(halaman.value * perHalaman, peminjamanDitampilkan.value.length))

watch([pencarian, tanggalTerpilih, statusTerpilih], () => {
    halaman.value = 1
})

watch(jumlahHalaman, (jumlah) => {
    if (halaman.value > jumlah) halaman.value = jumlah
})

function tanggalKeIso(value) {
    if (!value) return ''
    const [day, month, year] = value.split('/')
    return year && month && day ? `${year}-${month}-${day}` : value
}

function tampilkanTanggal(value) {
    if (!value) return '-'
    const iso = tanggalKeIso(value)
    const [year, month, day] = iso.split('-')
    return year && month && day ? `${day}-${month}-${year}` : value
}

function warnaStatus(status) {
    return {
        Menunggu: 'text-[#BA3800]',
        Disetujui: 'text-[#03543F]',
        Ditolak: 'text-[#9B1C1C]',
        Dipinjam: 'text-[#1E429F]',
    }[status] ?? 'text-gray-700'
}

async function ambilPeminjaman() {
    loading.value = true
    errorMessage.value = ''
    try {
        const response = await getPeminjaman()
        if (!Array.isArray(response.data)) {
            throw new TypeError('Respons API peminjaman tidak berisi daftar peminjaman.')
        }
        daftarPeminjaman.value = response.data
    } catch (error) {
        console.error('Gagal mengambil riwayat peminjaman:', error)
        errorMessage.value = error.response?.data?.message ?? 'Gagal mengambil riwayat peminjaman.'
    } finally {
        loading.value = false
    }
}

function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('isLogin')
    localStorage.removeItem('user')
    router.push('/login')
}

onMounted(ambilPeminjaman)
</script>

<template>
    <main class="min-h-svh bg-[#f5f5f5] p-5 sm:p-8">
        <section class="mx-auto max-w-6xl">
            <header class="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">Peminjaman Saya</h1>
                    <p class="mt-1 text-sm text-gray-500">
                        {{ pengguna?.nama || pengguna?.username || 'Peminjam' }}
                    </p>
                </div>
                <Button variant="ghost" size="icon" aria-label="Keluar" @click="logout">
                    <LogOut :size="18" />
                </Button>
            </header>

            <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div class="relative min-w-0 flex-1">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" :size="16" />
                    <Input
                        v-model="pencarian"
                        type="search"
                        placeholder="Cari nama alat atau kategori..."
                        class="h-10 rounded-xl border-gray-200 bg-white pl-10 text-sm"
                    />
                </div>

                <Popover>
                    <PopoverTrigger as-child>
                        <Button variant="outline" class="h-10 justify-between gap-2 rounded-xl border-0 bg-white px-4">
                            <span>
                                {{ tanggalTerpilih
                                    ? dateFormatter.format(tanggalTerpilih.toDate(getLocalTimeZone()))
                                    : 'Pilih Tanggal' }}
                            </span>
                            <CalendarDays :size="17" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" class="w-auto p-0">
                        <Calendar
                            v-model="tanggalTerpilih"
                            :default-placeholder="placeholderTanggal"
                            locale="id-ID"
                            :initial-focus="true"
                        />
                        <div v-if="tanggalTerpilih" class="border-t p-2">
                            <Button variant="ghost" class="w-full" @click="tanggalTerpilih = undefined">
                                Hapus tanggal
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>

                <Select v-model="statusTerpilih">
                    <SelectTrigger class="h-10 w-full rounded-xl border-0 bg-white sm:w-40">
                        <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Semua Status">Semua Status</SelectItem>
                        <SelectItem value="Menunggu">Menunggu</SelectItem>
                        <SelectItem value="Disetujui">Disetujui</SelectItem>
                        <SelectItem value="Ditolak">Ditolak</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    class="h-10 shrink-0 gap-2 rounded-xl bg-black px-4 text-white hover:bg-gray-800"
                    @click="router.push('/peminjam/peminjaman-form')"
                >
                    <Plus :size="17" />
                    Tambah Peminjaman
                </Button>
            </div>

            <p v-if="errorMessage" role="alert" class="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                {{ errorMessage }}
            </p>

            <section class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div class="overflow-x-auto">
                    <table class="w-full min-w-[700px] border-collapse text-left text-sm">
                        <thead class="bg-black text-xs font-semibold text-white">
                            <tr>
                                <th class="h-10 px-4">ID</th>
                                <th class="h-10 px-4">Peminjam</th>
                                <th class="h-10 px-4">Alat</th>
                                <th class="h-10 px-4">Tanggal</th>
                                <th class="h-10 px-4">Jumlah</th>
                                <th class="h-10 px-4">Status</th>
                                <th class="h-10 px-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="loading">
                                <td colspan="7" class="p-8 text-center text-gray-500">Memuat data peminjaman...</td>
                            </tr>
                            <tr v-else-if="!peminjamanHalamanIni.length">
                                <td colspan="7" class="p-8 text-center text-gray-500">
                                    {{ daftarPeminjaman.length
                                        ? 'Tidak ada peminjaman yang cocok dengan filter.'
                                        : 'Kamu belum memiliki pengajuan peminjaman.' }}
                                </td>
                            </tr>
                            <template v-else>
                                <tr
                                    v-for="peminjaman in peminjamanHalamanIni"
                                    :key="peminjaman.id"
                                    class="border-b border-gray-100 last:border-0"
                                >
                                    <td class="px-4 py-4 text-gray-500">{{ peminjaman.kode_peminjaman }}</td>
                                    <td class="px-4 py-4 font-medium">{{ pengguna?.nama || pengguna?.username }}</td>
                                    <td class="px-4 py-4">{{ peminjaman.alat }}</td>
                                    <td class="px-4 py-4 font-medium">
                                        {{ tampilkanTanggal(peminjaman.tanggal_pinjam) }}
                                    </td>
                                    <td class="px-4 py-4 font-medium">{{ peminjaman.jumlah }}</td>
                                    <td class="px-4 py-4 font-semibold" :class="warnaStatus(peminjaman.status)">
                                        {{ peminjaman.status }}
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="flex justify-center">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                class="size-8 rounded-full bg-sky-100 text-sky-700 hover:bg-sky-200"
                                                aria-label="Lihat detail peminjaman"
                                                @click="peminjamanTerpilih = peminjaman"
                                            >
                                                <Eye :size="16" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>

                <footer class="flex items-center border-t border-gray-100 px-4 py-3 text-xs text-gray-500 sm:px-5">
                    <span>
                        Menampilkan <strong class="text-gray-800">{{ rentangAwal }}–{{ rentangAkhir }}</strong>
                        dari <strong class="text-gray-800">{{ peminjamanDitampilkan.length }}</strong>
                        data peminjaman
                    </span>
                    <div class="ml-auto flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            class="size-8"
                            aria-label="Halaman sebelumnya"
                            :disabled="halaman <= 1"
                            @click="halaman -= 1"
                        >
                            <ChevronLeft :size="16" />
                        </Button>
                        <span class="flex size-8 items-center justify-center rounded-md bg-black font-semibold text-white">
                            {{ halaman }}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            class="size-8"
                            aria-label="Halaman berikutnya"
                            :disabled="halaman >= jumlahHalaman"
                            @click="halaman += 1"
                        >
                            <ChevronRight :size="16" />
                        </Button>
                    </div>
                </footer>
            </section>
        </section>

        <Dialog :open="Boolean(peminjamanTerpilih)" @update:open="(open) => { if (!open) peminjamanTerpilih = null }">
            <DialogContent class="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Detail Peminjaman</DialogTitle>
                </DialogHeader>
                <div v-if="peminjamanTerpilih" class="space-y-3 text-sm">
                    <div class="flex justify-between gap-4"><span class="text-gray-500">ID</span><strong>{{ peminjamanTerpilih.kode_peminjaman }}</strong></div>
                    <div class="flex justify-between gap-4"><span class="text-gray-500">Alat</span><strong>{{ peminjamanTerpilih.alat }}</strong></div>
                    <div class="flex justify-between gap-4"><span class="text-gray-500">Jumlah</span><strong>{{ peminjamanTerpilih.jumlah }}</strong></div>
                    <div class="flex justify-between gap-4"><span class="text-gray-500">Tanggal pinjam</span><strong>{{ peminjamanTerpilih.tanggal_pinjam }}</strong></div>
                    <div class="flex justify-between gap-4"><span class="text-gray-500">Tanggal kembali</span><strong>{{ peminjamanTerpilih.tanggal_kembali }}</strong></div>
                    <div class="flex justify-between gap-4"><span class="text-gray-500">Keperluan</span><strong>{{ peminjamanTerpilih.keperluan }}</strong></div>
                    <div class="flex justify-between gap-4"><span class="text-gray-500">Status</span><strong>{{ peminjamanTerpilih.status }}</strong></div>
                </div>
                <Button variant="outline" class="w-full" @click="peminjamanTerpilih = null">
                    <X :size="16" />
                    Tutup
                </Button>
            </DialogContent>
        </Dialog>
    </main>
</template>
