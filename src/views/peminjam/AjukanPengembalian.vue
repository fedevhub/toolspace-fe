<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    AlertCircle,
    ArrowLeft,
    ChevronDown,
    ClipboardCheck,
    Info,
    Send,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    ajukanPengembalian,
    getPengembalianSaya,
} from '@/services/pengembalianService'
import { getPeminjaman } from '@/services/peminjamanService'

const router = useRouter()
const route = useRoute()

// State
const pengguna = ref(null)
const daftarPeminjaman = ref([])
const daftarPengembalian = ref([])
const loading = ref(true)
const menyimpan = ref(false)
const errorMessage = ref('')

const hariIni = new Date().toISOString().split('T')[0]

const form = ref({
    peminjamanId: '',
    tanggal: hariIni,
    keterangan: '',
})

function formatTanggalUntukApi(value) {
    const [year, month, day] = String(value).split('-')
    return year && month && day ? `${day}/${month}/${year}` : value
}

// Computed
const peminjamanTersedia = computed(() => {
    const sudahDiajukan = new Set(
        daftarPengembalian.value.map((item) => item.peminjaman_id)
    )

    return daftarPeminjaman.value.filter(
        (item) => item.status === 'Disetujui' && !sudahDiajukan.has(item.id)
    )
})

const peminjamanTerpilih = computed(() => {
    return (
        peminjamanTersedia.value.find(
            (item) => String(item.id) === String(form.value.peminjamanId)
        ) ?? null
    )
})

const detailPeminjamanRows = computed(() => {
    const item = peminjamanTerpilih.value

    return [
        { label: 'Nama Alat', value: item?.alat || '-' },
        { label: 'Jumlah', value: item ? `${item.jumlah} unit` : '-' },
        { label: 'Tanggal Pinjam', value: item?.tanggal_pinjam || '-' },
        { label: 'Batas Kembali', value: item?.tanggal_kembali || '-' },
        { label: 'Status', value: item?.status || '-', isStatus: Boolean(item) },
    ]
})

// Methods
async function ambilData() {
    loading.value = true
    errorMessage.value = ''

    try {
        pengguna.value = JSON.parse(localStorage.getItem('user') || 'null')

        const [peminjaman, pengembalian] = await Promise.all([
            getPeminjaman(),
            getPengembalianSaya(),
        ])

        daftarPeminjaman.value = Array.isArray(peminjaman.data)
            ? peminjaman.data
            : []
        daftarPengembalian.value = Array.isArray(pengembalian.data)
            ? pengembalian.data
            : []

        if (route.query.peminjaman) {
            const ditemukan = peminjamanTersedia.value.find(
                (item) => String(item.id) === String(route.query.peminjaman)
            )
            if (ditemukan) {
                form.value.peminjamanId = ditemukan.id
            }
        }
    } catch (error) {
        errorMessage.value =
            error.response?.data?.message ?? 'Gagal memuat data peminjaman.'
    } finally {
        loading.value = false
    }
}

async function submit() {
    errorMessage.value = ''

    if (!form.value.peminjamanId || !form.value.tanggal) {
        errorMessage.value =
            'Pilih data peminjaman dan tanggal pengembalian terlebih dahulu.'
        return
    }

    menyimpan.value = true

    try {
        await ajukanPengembalian(form.value.peminjamanId, {
            tanggal_pengembalian: formatTanggalUntukApi(form.value.tanggal),
            keterangan: form.value.keterangan.trim(),
        })
        await router.push('/peminjam/pengembalian')
    } catch (error) {
        errorMessage.value =
            error.response?.data?.message ?? 'Gagal mengajukan pengembalian.'
    } finally {
        menyimpan.value = false
    }
}

function kembali() {
    router.push('/peminjam/pengembalian')
}

onMounted(ambilData)
</script>

<template>
    <main class="min-h-full bg-[#F8F9FA] p-6 md:p-8" style="font-family: 'DM Sans', Arial, sans-serif">
        <div class="mx-auto max-w-[960px]">
            <!-- Tombol Kembali Atas -->
            <Button type="button" variant="outline"
                class="h-10 rounded-xl border-[#dfe3e8] bg-white px-4 font-semibold text-gray-700 shadow-xs hover:bg-gray-50"
                @click="kembali">
                <ArrowLeft :size="17" class="mr-1.5" />
                Kembali
            </Button>

            <!-- Header Halaman -->
            <div class="mt-5 mb-6">
                <h1 class="font-display text-2xl font-bold tracking-wide text-gray-900 md:text-3xl">
                    AJUKAN PENGEMBALIAN
                </h1>
                <p class="mt-1.5 text-sm text-[#697386] md:text-base">
                    Isi data pengembalian alat dengan lengkap dan benar.
                </p>
            </div>

            <!-- Loading Skeleton -->
            <div v-if="loading" class="animate-pulse rounded-3xl border border-gray-200/80 bg-white p-6 md:p-8">
                <div class="grid gap-8 md:grid-cols-2">
                    <div class="space-y-5">
                        <div class="h-16 rounded-2xl bg-gray-100" />
                        <div class="h-16 rounded-2xl bg-gray-100" />
                        <div class="h-32 rounded-2xl bg-gray-100" />
                    </div>
                    <div class="space-y-5">
                        <div class="h-16 rounded-2xl bg-gray-100" />
                        <div class="h-56 rounded-2xl bg-gray-100" />
                    </div>
                </div>
            </div>

            <!-- Form Utama -->
            <form v-else class="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs md:p-8"
                @submit.prevent="submit">
                <!-- Info Jika Tidak Ada Peminjaman Aktif -->
                <div v-if="!peminjamanTersedia.length && !errorMessage"
                    class="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-800">
                    <Info :size="19" class="mt-0.5 shrink-0 text-amber-600" />
                    <div>
                        <p class="font-semibold">Tidak ada peminjaman aktif</p>
                        <p class="mt-0.5 text-amber-700/90">
                            Saat ini tidak ada peminjaman berstatus <strong>Disetujui</strong> yang belum diajukan
                            pengembaliannya.
                        </p>
                    </div>
                </div>

                <div class="grid gap-8 md:grid-cols-2">
                    <!-- Kolom Kiri -->
                    <div class="space-y-5">
                        <!-- Nama Peminjam -->
                        <div>
                            <label class="mb-2 block text-sm font-semibold text-gray-800">
                                Nama Peminjam
                            </label>
                            <div
                                class="flex h-12 items-center rounded-xl border border-gray-200 bg-[#F3F4F6] px-4 text-sm font-medium text-gray-600">
                                {{ pengguna?.nama || pengguna?.username || '-' }}
                            </div>
                        </div>

                        <!-- Tanggal Pengembalian -->
                        <div>
                            <label for="tanggal" class="mb-2 block text-sm font-semibold text-gray-800">
                                Tanggal Pengembalian <span class="text-red-600">*</span>
                            </label>
                            <Input id="tanggal" v-model="form.tanggal" type="date"
                                class="h-12 rounded-xl border-[#dfe3e8] bg-white px-4 text-sm shadow-xs focus-visible:border-black"
                                required />
                        </div>

                        <!-- Catatan -->
                        <div>
                            <div class="mb-2 flex items-center justify-between">
                                <label for="catatan" class="text-sm font-semibold text-gray-800">
                                    Catatan <span class="font-normal text-[#697386]">(Opsional)</span>
                                </label>
                                <span class="text-xs text-gray-400">
                                    {{ form.keterangan.length }}/500
                                </span>
                            </div>
                            <Textarea id="catatan" v-model="form.keterangan" maxlength="500"
                                class="min-h-32 resize-none rounded-xl border-[#dfe3e8] p-4 text-sm shadow-xs focus-visible:border-black"
                                placeholder="Tambahkan catatan kondisi alat atau keterangan lainnya..." />
                        </div>
                    </div>

                    <!-- Kolom Kanan -->
                    <div class="space-y-5">
                        <!-- Pilih Peminjaman -->
                        <div>
                            <label for="peminjaman" class="mb-2 block text-sm font-semibold text-gray-800">
                                Pilih Peminjaman <span class="text-red-600">*</span>
                            </label>
                            <div class="relative">
                                <select id="peminjaman" v-model="form.peminjamanId"
                                    :disabled="!peminjamanTersedia.length"
                                    class="h-12 w-full appearance-none rounded-xl border border-[#dfe3e8] bg-white pl-4 pr-10 text-sm font-medium text-gray-900 shadow-xs outline-none transition-colors hover:border-gray-300 focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                                    required>
                                    <option value="" disabled>
                                        {{
                                            peminjamanTersedia.length
                                                ? 'Pilih kode atau nama alat...'
                                                : 'Tidak ada peminjaman tersedia'
                                        }}
                                    </option>
                                    <option v-for="item in peminjamanTersedia" :key="item.id" :value="item.id">
                                        {{ item.kode_peminjaman }} — {{ item.alat }}
                                    </option>
                                </select>
                                <ChevronDown :size="17"
                                    class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                            </div>
                        </div>

                        <!-- Card Detail Peminjaman -->
                        <div class="rounded-2xl border border-gray-200/80 bg-[#F8F9FA] p-6">
                            <div class="mb-4 flex items-center gap-2 text-gray-900">
                                <ClipboardCheck :size="18" class="text-gray-700" />
                                <h2 class="text-sm font-bold tracking-wide uppercase">
                                    Detail Peminjaman
                                </h2>
                            </div>

                            <dl class="grid grid-cols-[120px_12px_1fr] gap-y-3 text-sm">
                                <template v-for="row in detailPeminjamanRows" :key="row.label">
                                    <dt class="text-gray-500">{{ row.label }}</dt>
                                    <span class="text-gray-400">:</span>
                                    <dd class="font-semibold text-gray-900">
                                        <span v-if="row.isStatus"
                                            class="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                            {{ row.value }}
                                        </span>
                                        <span v-else>{{ row.value }}</span>
                                    </dd>
                                </template>
                            </dl>
                        </div>
                    </div>
                </div>

                <!-- Pesan Error -->
                <div v-if="errorMessage" role="alert"
                    class="mt-6 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle :size="18" class="shrink-0" />
                    <span>{{ errorMessage }}</span>
                </div>

                <!-- Tombol Aksi Bawah -->
                <div class="mt-8 flex flex-col-reverse justify-end gap-3 border-t border-gray-100 pt-6 sm:flex-row">
                    <Button type="button" variant="outline"
                        class="h-11 rounded-xl border-[#dfe3e8] px-5 font-semibold text-gray-700 hover:bg-gray-50"
                        @click="kembali">
                        Batal
                    </Button>
                    <Button type="submit"
                        class="h-11 rounded-xl bg-black px-6 text-sm font-semibold text-white hover:bg-black/85 disabled:opacity-40"
                        :disabled="menyimpan || !peminjamanTersedia.length">
                        <Send :size="16" class="mr-2" />
                        {{ menyimpan ? 'Mengajukan...' : 'Ajukan Pengembalian' }}
                    </Button>
                </div>
            </form>
        </div>
    </main>
</template>
