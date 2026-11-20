<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { AlertCircle, ArrowRight, Printer, RotateCcw, Search } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import Button from '@/components/ui/button/Button.vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Table from '@/components/Petugas/laporan/table.vue'
import { getMonitorPengembalian } from '@/services/pengembalianService'
import { formatRupiah, tanggalKeIso } from '@/lib/format'

const perHalaman = 8
const daftar = ref([])
const loading = ref(true)
const errorMessage = ref('')
const pencarian = ref('')
const tanggalDari = ref('')
const tanggalSampai = ref('')
const statusTerpilih = ref('semua')
const halaman = ref(1)

// Laporan hanya berisi peminjaman yang sudah dikembalikan
const sumber = computed(() => daftar.value.filter((item) => item.sudah_kembali))

const adaFilterAktif = computed(() =>
    Boolean(
        pencarian.value.trim() ||
        tanggalDari.value ||
        tanggalSampai.value ||
        statusTerpilih.value !== 'semua'
    )
)

const hasil = computed(() => {
    const q = pencarian.value.trim().toLowerCase()
    return sumber.value.filter((item) => {
        const pinjam = tanggalKeIso(item.tanggal_pinjam)
        if (tanggalDari.value && pinjam < tanggalDari.value) return false
        if (tanggalSampai.value && pinjam > tanggalSampai.value) return false
        if (statusTerpilih.value !== 'semua' && item.status !== statusTerpilih.value) return false
        if (
            q &&
            ![item.kode_peminjaman, item.nama_peminjam, item.alat]
                .some((nilai) => String(nilai ?? '').toLowerCase().includes(q))
        ) {
            return false
        }
        return true
    })
})

const totalDendaHasil = computed(() =>
    hasil.value.reduce((jumlah, item) => jumlah + (Number(item.denda) || 0), 0)
)

const halamanIni = computed(() => {
    const mulai = (halaman.value - 1) * perHalaman
    return hasil.value.slice(mulai, mulai + perHalaman)
})

watch([pencarian, tanggalDari, tanggalSampai, statusTerpilih], () => {
    halaman.value = 1
})

function resetFilter() {
    pencarian.value = ''
    tanggalDari.value = ''
    tanggalSampai.value = ''
    statusTerpilih.value = 'semua'
}

async function ambilData() {
    loading.value = true
    errorMessage.value = ''
    try {
        const response = await getMonitorPengembalian()
        const data = response.data?.data ?? response.data
        if (!Array.isArray(data)) throw new TypeError('Respons API laporan tidak valid.')
        daftar.value = data
    } catch (error) {
        console.error('Gagal mengambil laporan:', error)
        errorMessage.value = error.response?.data?.message ?? 'Gagal mengambil data laporan.'
    } finally {
        loading.value = false
    }
}

function esc(teks) {
    return String(teks ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[c]))
}

function cetakLaporan() {
    const jendela = window.open('', '_blank')
    if (!jendela) {
        errorMessage.value = 'Pop-up diblokir browser. Izinkan pop-up untuk mencetak laporan.'
        return
    }

    const baris = hasil.value
        .map(
            (item, i) => `
        <tr>
            <td style="text-align:center">${i + 1}</td>
            <td>${esc(item.nama_peminjam)}</td>
            <td>${esc(item.alat)}</td>
            <td>${esc(item.tanggal_pinjam)}</td>
            <td>${esc(item.batas_kembali)}</td>
            <td>${esc(item.tanggal_kembali)}</td>
            <td>${esc(item.status)}</td>
            <td style="text-align:right">${esc(formatRupiah(item.denda))}</td>
        </tr>`
        )
        .join('')

    const teksPeriode =
        tanggalDari.value || tanggalSampai.value
            ? `${tanggalDari.value || 'Awal'} s/d ${tanggalSampai.value || 'Sekarang'}`
            : 'Semua Periode'

    jendela.document.write(`<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Peminjaman & Pengembalian - Toolspace</title>
    <style>
        body { font-family: 'DM Sans', Arial, sans-serif; padding: 28px; color: #111827; }
        .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #111827; padding-bottom: 12px; margin-bottom: 18px; }
        h1 { margin: 0; font-size: 20px; letter-spacing: 0.5px; }
        .sub { margin: 4px 0 0; color: #4b5563; font-size: 12px; }
        .meta { text-align: right; font-size: 12px; color: #4b5563; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: left; }
        th { background: #111827; color: #fff; font-weight: 600; }
        tr:nth-child(even) td { background: #f9fafb; }
        tfoot td { background: #f3f4f6 !important; font-weight: 700; }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>LAPORAN PEMINJAMAN & PENGEMBALIAN ALAT</h1>
            <p class="sub">TOOLSPACE &bull; Periode: ${esc(teksPeriode)}</p>
        </div>
        <div class="meta">
            Dicetak: ${esc(new Date().toLocaleString('id-ID'))}<br>
            Total Data: ${hasil.value.length} transaksi
        </div>
    </div>
    <table>
        <thead>
            <tr>
                <th style="width:40px;text-align:center">No</th>
                <th>Peminjam</th>
                <th>Alat</th>
                <th>Tgl Pinjam</th>
                <th>Batas Kembali</th>
                <th>Tgl Kembali</th>
                <th>Status</th>
                <th style="text-align:right">Denda</th>
            </tr>
        </thead>
        <tbody>
            ${baris || '<tr><td colspan="8" style="text-align:center;padding:20px">Tidak ada data laporan</td></tr>'}
        </tbody>
        <tfoot>
            <tr>
                <td colspan="7" style="text-align:right">Total Denda</td>
                <td style="text-align:right">${esc(formatRupiah(totalDendaHasil.value))}</td>
            </tr>
        </tfoot>
    </table>
</body>
</html>`)
    jendela.document.close()
    jendela.focus()
    jendela.print()
}

onMounted(ambilData)
</script>

<template>
    <main class="min-h-full bg-[#F8F9FA] p-6 md:p-8" style="font-family: 'DM Sans', Arial, sans-serif">
        <!-- Header & Cetak Button -->
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <h1 class="font-display text-2xl font-bold tracking-wide text-gray-900 md:text-3xl">
                    LAPORAN
                </h1>
                <p class="mt-1.5 text-sm text-[#697386] md:text-base">
                    Lihat laporan aktivitas peminjaman dan pengembalian alat.
                </p>
            </div>

            <Button type="button"
                class="h-11 gap-2 rounded-xl bg-black px-5 text-sm font-semibold text-white shadow-xs hover:bg-black/85"
                @click="cetakLaporan">
                <Printer :size="18" />
                Cetak Laporan
            </Button>
        </div>

        <!-- Toolbar Search & Filter -->
        <div class="mt-6 flex flex-wrap items-center justify-between gap-3">
            <!-- Search -->
            <div class="relative w-full sm:w-[280px]">
                <Search :size="18"
                    class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085]" />
                <Input v-model="pencarian" type="search" placeholder="Cari peminjam atau alat..."
                    class="h-11 rounded-xl border-[#dfe3e8] bg-white pl-10 text-sm shadow-xs focus-visible:border-black" />
            </div>

            <!-- Periode & Filter Status -->
            <div class="flex flex-wrap items-center gap-2.5">
                <div class="flex h-11 items-center gap-1.5 rounded-xl border border-[#dfe3e8] bg-white px-3 shadow-xs">
                    <input v-model="tanggalDari" type="date" aria-label="Tanggal awal"
                        class="w-[120px] bg-transparent text-xs font-medium text-gray-700 focus:outline-none" />
                    <ArrowRight :size="14" class="shrink-0 text-gray-400" />
                    <input v-model="tanggalSampai" type="date" aria-label="Tanggal akhir"
                        class="w-[120px] bg-transparent text-xs font-medium text-gray-700 focus:outline-none" />
                </div>

                <Select v-model="statusTerpilih">
                    <SelectTrigger
                        class="!h-11 w-[150px] rounded-xl border-[#dfe3e8] bg-white px-3.5 text-sm font-medium text-gray-700 shadow-xs focus:border-black">
                        <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent position="popper" :side-offset="6">
                        <SelectItem value="semua">Semua Status</SelectItem>
                        <SelectItem value="Selesai">Selesai</SelectItem>
                        <SelectItem value="Terlambat">Terlambat</SelectItem>
                    </SelectContent>
                </Select>

                <Button v-if="adaFilterAktif" type="button" variant="outline" title="Reset filter"
                    class="h-11 w-11 shrink-0 rounded-xl border-[#dfe3e8] bg-white p-0 text-gray-600 shadow-xs hover:bg-gray-50 hover:text-gray-900"
                    @click="resetFilter">
                    <RotateCcw :size="16" />
                </Button>
            </div>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage" role="alert"
            class="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle :size="20" class="shrink-0" />
            <span>{{ errorMessage }}</span>
        </div>

        <!-- Tabel Laporan -->
        <div class="mt-6">
            <Table v-model:page="halaman" :laporan="halamanIni" :loading="loading" :total="hasil.length"
                :nomor-awal="(halaman - 1) * perHalaman" :per-page="perHalaman" />
        </div>
    </main>
</template>