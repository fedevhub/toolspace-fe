<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CalendarDays, Plus, Search } from 'lucide-vue-next'
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
import Table from '@/components/admin/peminjaman/table.vue'
import { getPeminjaman, hapusPeminjaman } from '@/services/peminjamanService'

const router = useRouter()
const daftarPeminjaman = ref([])
const loading = ref(true)
const errorMessage = ref('')
const pencarian = ref('')
const tanggalTerpilih = ref()
const statusTerpilih = ref('Semua Status')
const placeholderTanggal = today(getLocalTimeZone())
const dateFormatter = new DateFormatter('id-ID', { dateStyle: 'medium' })

const peminjamanDitampilkan = computed(() => {
    const query = pencarian.value.trim().toLowerCase()
    return daftarPeminjaman.value.filter((peminjaman) => {
        const cocokPencarian = !query ||
            [
                peminjaman.nama_peminjam,
                peminjaman.alat,
                peminjaman.kategori_alat,
                peminjaman.kode_peminjaman,
            ]
                .some((value) => value?.toLowerCase().includes(query))
        const cocokTanggal = !tanggalTerpilih.value ||
            tanggalKeIso(peminjaman.tanggal_pinjam) === tanggalTerpilih.value.toString()
        const cocokStatus = statusTerpilih.value === 'Semua Status' ||
            peminjaman.status === statusTerpilih.value
        return cocokPencarian && cocokTanggal && cocokStatus
    })
})

function tanggalKeIso(value) {
    if (!value) return ''
    const [day, month, year] = value.split('/')
    return year && month && day ? `${year}-${month}-${day}` : value
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
        daftarPeminjaman.value = daftarPeminjaman.value.filter((peminjaman) => peminjaman.id !== item.id)
    } catch (error) {
        console.error('Gagal menghapus peminjaman:', error)
        errorMessage.value = error.response?.data?.message ?? 'Gagal menghapus peminjaman.'
    }
}

onMounted(ambilPeminjaman)
</script>

<template>
    <div class="p-8">
        <h1 class="text-3xl font-bold">Kelola Peminjaman</h1>
        <p class="font-medium text-gray-500">Kelola data dan pantau status peminjaman alat.</p>
        <div class="flex w-full flex-wrap items-center gap-3 py-5">
            <div class="relative w-full sm:w-72 lg:w-80 sm:flex-none">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
                <Input
                    v-model="pencarian"
                    type="search"
                    placeholder="Cari nama alat atau kategori..."
                    class="h-10 bg-white pl-10"
                />
            </div>

            

            <div class="ml-auto flex items-center gap-3">
                <Popover>
                    <PopoverTrigger as-child>
                        <Button variant="outline" class="h-10 gap-2 bg-white">
                            {{ tanggalTerpilih
                                ? dateFormatter.format(tanggalTerpilih.toDate(getLocalTimeZone()))
                                : 'Pilih Tanggal' }}
                            <CalendarDays :size="17" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" class="w-auto p-0">
                        <Calendar v-model="tanggalTerpilih" :default-placeholder="placeholderTanggal" locale="id-ID"
                            :initial-focus="true" />
                        <div v-if="tanggalTerpilih" class="border-t p-2">
                            <Button variant="ghost" class="w-full" @click="tanggalTerpilih = undefined">
                                Hapus tanggal
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>

                <Select v-model="statusTerpilih">
                    <SelectTrigger class="h-10 w-full bg-white sm:w-40">
                        <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Semua Status">Semua Status</SelectItem>
                        <SelectItem value="Menunggu">Menunggu</SelectItem>
                        <SelectItem value="Disetujui">Disetujui</SelectItem>
                        <SelectItem value="Ditolak">Ditolak</SelectItem>
                        <SelectItem value="Dipinjam">Dipinjam</SelectItem>
                    </SelectContent>
                </Select>

                <Button @click="router.push('/admin/peminjaman-form')" class="gap-2">
                    <Plus :size="20" />
                    Tambah Peminjaman
                </Button>
            </div>
        </div>

        <p v-if="errorMessage" role="alert" class="mb-4 text-sm text-red-600">
            {{ errorMessage }}
        </p>

        <Table
            :peminjaman="peminjamanDitampilkan"
            :loading="loading"
            @edit="editPeminjaman"
            @delete="hapusItemPeminjaman"
        />
    </div>
</template>
