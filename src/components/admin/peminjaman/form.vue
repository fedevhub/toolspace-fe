<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, CalendarDays, Save } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { getAlat } from '@/services/alatService'
import { getPengguna } from '@/services/penggunaService'
import {
    detailPeminjaman,
    editPeminjaman,
    tambahPeminjaman,
} from '@/services/peminjamanService'

const router = useRouter()
const route = useRoute()
const penggunaLogin = JSON.parse(localStorage.getItem('user') || 'null')
const isPeminjam = penggunaLogin?.role === 'peminjam'
const isEditMode = Boolean(route.params.id) && !isPeminjam
const loading = ref(false)
const errorMessage = ref('')
const daftarPeminjam = ref([])
const daftarAlat = ref([])
const tanggalPinjamPicker = ref(null)
const tanggalKembaliPicker = ref(null)
const form = ref({
    pengguna_id: '',
    alat_id: '',
    jumlah: 1,
    tanggal_pinjam: '',
    tanggal_kembali: '',
    keperluan: '',
})

function validasiTanggal(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
    const date = new Date(`${value}T00:00:00.000Z`)
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function formatTanggal(value) {
    const [year, month, day] = value.split('-')
    return `${day}-${month}-${year}`
}

function tampilkanTanggal(value) {
    return value ? formatTanggal(value) : ''
}

function tanggalUntukInput(value) {
    if (!value) return ''
    const [day, month, year] = value.split('/')
    return year && month && day ? `${year}-${month}-${day}` : value
}

function bukaPemilihTanggal(jenis) {
    const picker = jenis === 'pinjam' ? tanggalPinjamPicker.value : tanggalKembaliPicker.value
    if (!picker) return

    if (typeof picker.showPicker === 'function') {
        picker.showPicker()
    } else {
        picker.focus()
        picker.click()
    }
}

onMounted(async () => {
    loading.value = true
    try {
        const [penggunaResponse, alatResponse] = await Promise.all([
            isPeminjam ? Promise.resolve(null) : getPengguna(),
            getAlat(),
        ])
        if (
            (!isPeminjam && !Array.isArray(penggunaResponse?.data)) ||
            !Array.isArray(alatResponse.data)
        ) {
            throw new TypeError('Respons API pengguna atau alat tidak berisi daftar yang valid.')
        }
        daftarPeminjam.value = isPeminjam
            ? [{ id: penggunaLogin.id, nama_lengkap: penggunaLogin.nama }]
            : penggunaResponse.data.filter(
                (pengguna) => pengguna.role?.toLowerCase() === 'peminjam' && pengguna.status_aktif !== false,
            )
        if (isPeminjam) form.value.pengguna_id = penggunaLogin.id
        daftarAlat.value = alatResponse.data.filter(
            (alat) => alat.status_aktif !== false && alat.tersedia > 0,
        )
        if (isPeminjam && route.query.alat && daftarAlat.value.some((alat) => alat.id === route.query.alat)) {
            form.value.alat_id = route.query.alat
        }
        if (isEditMode) {
            const response = await detailPeminjaman(route.params.id)
            form.value = {
                pengguna_id: response.data.pengguna_id,
                alat_id: response.data.alat_id,
                jumlah: response.data.jumlah,
                tanggal_pinjam: tanggalUntukInput(response.data.tanggal_pinjam),
                tanggal_kembali: tanggalUntukInput(response.data.tanggal_kembali),
                keperluan: response.data.keperluan,
            }
        }
    } catch (error) {
        console.error('Gagal memuat data form peminjaman:', error)
        errorMessage.value = error.response?.data?.message ?? 'Gagal memuat data pengguna dan alat.'
    } finally {
        loading.value = false
    }
})

async function handleSubmit() {
    errorMessage.value = ''
    if (!form.value.pengguna_id || !form.value.alat_id || !form.value.tanggal_pinjam ||
        !form.value.tanggal_kembali || !form.value.keperluan.trim()) {
        errorMessage.value = 'Peminjam, alat, tanggal, dan keperluan wajib diisi.'
        return
    }
    if (!validasiTanggal(form.value.tanggal_pinjam) || !validasiTanggal(form.value.tanggal_kembali)) {
        errorMessage.value = 'Pilih tanggal pinjam dan kembali yang valid.'
        return
    }
    if (form.value.tanggal_kembali < form.value.tanggal_pinjam) {
        errorMessage.value = 'Tanggal kembali tidak boleh sebelum tanggal pinjam.'
        return
    }
    if (!Number.isSafeInteger(Number(form.value.jumlah)) || Number(form.value.jumlah) < 1) {
        errorMessage.value = 'Jumlah harus berupa bilangan bulat minimal 1.'
        return
    }

    loading.value = true
    try {
        const data = {
            ...form.value,
            tanggal_pinjam: formatTanggal(form.value.tanggal_pinjam),
            tanggal_kembali: formatTanggal(form.value.tanggal_kembali),
            jumlah: Number(form.value.jumlah),
            keperluan: form.value.keperluan.trim(),
        }
        if (isEditMode) {
            await editPeminjaman(route.params.id, data)
        } else {
            await tambahPeminjaman(data)
        }
        await router.push(isPeminjam ? '/peminjam/dashboard' : '/admin/peminjaman')
    } catch (error) {
        console.error('Gagal menyimpan peminjaman:', error)
        errorMessage.value = error.response?.data?.message ?? 'Gagal menyimpan peminjaman.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="px-8 pb-16 pt-8 md:px-20">
        <Button
            type="button"
            variant="outline"
            class="gap-2"
            @click="router.push(isPeminjam ? '/peminjam/dashboard' : '/admin/peminjaman')"
        >
            <ArrowLeft :size="16" />
            Kembali
        </Button>

        <h1 class="pt-3 text-3xl font-bold">{{ isEditMode ? 'Edit Peminjaman' : 'Tambah Peminjaman' }}</h1>

        <form class="mt-4 rounded-xl border bg-white p-6 shadow-sm md:p-8" @submit.prevent="handleSubmit">
            <div v-if="loading && !daftarPeminjam.length && !daftarAlat.length" class="py-4 text-gray-500">
                Memuat data pengguna dan alat...
            </div>
            <div v-else class="grid grid-cols-1 items-start gap-x-7 gap-y-4 md:grid-cols-2">
                <div>
                    <label v-if="!isPeminjam" for="peminjam" class="mb-2 block text-sm font-medium text-gray-800">
                        Nama Peminjam <span class="text-red-600">*</span>
                    </label>
                    <div v-if="isPeminjam" class="flex h-10 items-center rounded-md border px-3 text-sm text-gray-700">
                        {{ penggunaLogin?.nama || penggunaLogin?.username }}
                    </div>
                    <Select v-else v-model="form.pengguna_id" required>
                        <SelectTrigger id="peminjam" class="w-full">
                            <SelectValue placeholder="Pilih pengguna peminjam" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem v-for="pengguna in daftarPeminjam" :key="pengguna.id" :value="pengguna.id">
                                {{ pengguna.nama_lengkap }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p v-if="!daftarPeminjam.length" class="mt-1 text-xs text-gray-500">
                        Belum ada pengguna aktif dengan role peminjam.
                    </p>
                </div>

                <div>
                    <label for="keperluan" class="mb-2 block text-sm font-medium text-gray-800">
                        Keperluan <span class="text-red-600">*</span>
                    </label>
                    <Select v-model="form.keperluan">
                        <SelectTrigger id="keperluan" class="w-full">
                            <SelectValue placeholder="Pilih keperluan" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="Tugas Sekolah">Tugas Sekolah</SelectItem>
                            <SelectItem value="Presentasi">Presentasi</SelectItem>
                            <SelectItem value="Praktek">Praktek</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label for="alat" class="mb-2 block text-sm font-medium text-gray-800">
                        Alat <span class="text-red-600">*</span>
                    </label>
                    <Select v-model="form.alat_id" required>
                        <SelectTrigger id="alat" class="w-full">
                            <SelectValue placeholder="Pilih alat yang tersedia" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem v-for="alat in daftarAlat" :key="alat.id" :value="alat.id">
                                {{ alat.nama_alat }} (tersedia {{ alat.tersedia }})
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p v-if="!daftarAlat.length" class="mt-1 text-xs text-gray-500">
                        Tidak ada alat aktif yang tersedia.
                    </p>
                </div>

                <div>
                    <label for="jumlah" class="mb-2 block text-sm font-medium text-gray-800">
                        Jumlah <span class="text-red-600">*</span>
                    </label>
                    <Input id="jumlah" v-model="form.jumlah" type="number" min="1" step="1" required />
                </div>

                <div>
                    <label for="tanggal_pinjam" class="mb-2 block text-sm font-medium text-gray-800">
                        Tanggal Pinjam <span class="text-red-600">*</span>
                    </label>
                    <div class="relative">
                        <Input
                            id="tanggal_pinjam"
                            :model-value="tampilkanTanggal(form.tanggal_pinjam)"
                            placeholder="DD/MM/YYYY"
                            readonly
                            required
                            class="pr-12"
                        />
                        <input
                            ref="tanggalPinjamPicker"
                            v-model="form.tanggal_pinjam"
                            type="date"
                            aria-label="Pilih tanggal pinjam"
                            class="pointer-events-none absolute left-0 top-0 size-px opacity-0"
                            tabindex="-1"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            aria-label="Buka kalender tanggal pinjam"
                            class="absolute right-0 top-0 rounded-l-none"
                            @click="bukaPemilihTanggal('pinjam')"
                        >
                            <CalendarDays :size="18" />
                        </Button>
                    </div>
                </div>

                <div>
                    <label for="tanggal_kembali" class="mb-2 block text-sm font-medium text-gray-800">
                        Tanggal Kembali <span class="text-red-600">*</span>
                    </label>
                    <div class="relative">
                        <Input
                            id="tanggal_kembali"
                            :model-value="tampilkanTanggal(form.tanggal_kembali)"
                            placeholder="DD/MM/YYYY"
                            readonly
                            required
                            class="pr-12"
                        />
                        <input
                            ref="tanggalKembaliPicker"
                            v-model="form.tanggal_kembali"
                            type="date"
                            aria-label="Pilih tanggal kembali"
                            class="pointer-events-none absolute left-0 top-0 size-px opacity-0"
                            tabindex="-1"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            aria-label="Buka kalender tanggal kembali"
                            class="absolute right-0 top-0 rounded-l-none"
                            @click="bukaPemilihTanggal('kembali')"
                        >
                            <CalendarDays :size="18" />
                        </Button>
                    </div>
                </div>
            </div>

            <p v-if="errorMessage" role="alert" class="mt-4 text-sm text-red-600">
                {{ errorMessage }}
            </p>

            <div class="mt-6 flex justify-end border-t pt-4">
                <Button type="submit" :disabled="loading || !daftarPeminjam.length || !daftarAlat.length">
                    <Save :size="18" />
                    {{ loading ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Ajukan Peminjaman' }}
                </Button>
            </div>
        </form>
    </div>
</template>
