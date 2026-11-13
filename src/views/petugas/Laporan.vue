<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { ArrowRight, ChevronDown, Printer, Search } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import Button from '@/components/ui/button/Button.vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Table from '@/components/Petugas/laporan/table.vue'
import { getMonitorPengembalian } from '@/services/pengembalianService'
import { formatRupiah, tanggalKeIso } from '@/lib/format'

const perHalaman = 10
const daftar = ref([])
const loading = ref(true)
const errorMessage = ref('')
const pencarian = ref('')
const tanggalDari = ref('')
const tanggalSampai = ref('')
const alatTerpilih = ref('semua')
const statusTerpilih = ref('semua')
const halaman = ref(1)

// Laporan hanya berisi peminjaman yang sudah dikembalikan
const sumber = computed(() => daftar.value.filter((item) => item.sudah_kembali))
const daftarAlat = computed(() => [...new Set(sumber.value.map((item) => item.alat))].sort())

const hasil = computed(() => {
    const q = pencarian.value.trim().toLowerCase()
    return sumber.value.filter((item) => {
        const pinjam = tanggalKeIso(item.tanggal_pinjam)
        if (tanggalDari.value && pinjam < tanggalDari.value) return false
        if (tanggalSampai.value && pinjam > tanggalSampai.value) return false
        if (alatTerpilih.value !== 'semua' && item.alat !== alatTerpilih.value) return false
        if (statusTerpilih.value !== 'semua' && item.status !== statusTerpilih.value) return false
        if (q && ![item.nama_peminjam, item.alat].some((nilai) => nilai?.toLowerCase().includes(q))) return false
        return true
    })
})
const halamanIni = computed(() => {
    const mulai = (halaman.value - 1) * perHalaman
    return hasil.value.slice(mulai, mulai + perHalaman)
})

watch([pencarian, tanggalDari, tanggalSampai, alatTerpilih, statusTerpilih], () => { halaman.value = 1 })

async function ambilData() {
    loading.value = true
    errorMessage.value = ''
    try {
        const response = await getMonitorPengembalian()
        if (!Array.isArray(response.data)) throw new TypeError('Respons API laporan tidak valid.')
        daftar.value = response.data
    } catch (error) {
        console.error('Gagal mengambil laporan:', error)
        errorMessage.value = error.response?.data?.message ?? 'Gagal mengambil data laporan.'
    } finally {
        loading.value = false
    }
}

function esc(teks) {
    return String(teks ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

function cetakLaporan() {
    const jendela = window.open('', '_blank')
    if (!jendela) {
        errorMessage.value = 'Pop-up diblokir browser. Izinkan pop-up untuk mencetak laporan.'
        return
    }
    const baris = hasil.value.map((item, i) => `
        <tr>
            <td>${i + 1}</td><td>${esc(item.nama_peminjam)}</td><td>${esc(item.alat)}</td>
            <td>${esc(item.tanggal_pinjam)}</td><td>${esc(item.batas_kembali)}</td>
            <td>${esc(item.tanggal_kembali)}</td><td>${esc(item.status)}</td>
            <td style="text-align:right">${esc(formatRupiah(item.denda))}</td>
        </tr>`).join('')
    const totalDenda = hasil.value.reduce((jumlah, item) => jumlah + (item.denda || 0), 0)

    jendela.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Laporan Toolspace</title>
        <style>
            body{font-family:Arial,sans-serif;padding:24px;color:#111}
            h1{margin:0 0 4px;font-size:20px}
            p{margin:0 0 16px;color:#555;font-size:12px}
            table{width:100%;border-collapse:collapse;font-size:12px}
            th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
            th{background:#000;color:#fff}
        </style></head><body>
        <h1>Laporan Peminjaman & Pengembalian</h1>
        <p>Dicetak: ${esc(new Date().toLocaleString('id-ID'))}</p>
        <table>
            <thead><tr><th>No</th><th>Peminjam</th><th>Alat</th><th>Tanggal Pinjam</th><th>Batas Kembali</th><th>Tanggal Kembali</th><th>Status</th><th>Denda</th></tr></thead>
            <tbody>${baris || '<tr><td colspan="8" style="text-align:center">Tidak ada data</td></tr>'}</tbody>
            <tfoot><tr><td colspan="7" style="text-align:right"><b>Total Denda</b></td><td style="text-align:right"><b>${esc(formatRupiah(totalDenda))}</b></td></tr></tfoot>
        </table></body></html>`)
    jendela.document.close()
    jendela.focus()
    jendela.print()
}

onMounted(ambilData)
</script>

<template>
    <div class="p-10">
        <h1 class="font-display text-[32px] uppercase leading-tight">Laporan</h1>
        <p class="mt-1 text-sm text-gray-500">Lihat laporan aktivitas peminjaman dan pengembalian alat.</p>

        <div class="mt-6 flex items-end justify-between gap-4">
            <div>
                <p class="mb-2 text-sm font-bold">Periode</p>
                <div class="flex items-center gap-3">
                    <input v-model="tanggalDari" type="date" aria-label="Tanggal awal"
                        class="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium" />
                    <ArrowRight :size="18" />
                    <input v-model="tanggalSampai" type="date" aria-label="Tanggal akhir"
                        class="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium" />
                </div>
            </div>

            <Button class="h-11 gap-2 rounded-xl px-6 font-bold" @click="cetakLaporan">
                <Printer :size="18" /> Cetak Laporan
            </Button>
        </div>

        <div class="mt-5 flex items-center gap-4">
            <div class="relative w-[430px] max-w-full">
                <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" :size="18" />
                <Input v-model="pencarian" type="text" placeholder="Cari nama peminjam atau alat..."
                    class="h-11 rounded-xl bg-white pl-11" />
            </div>

            <div class="ml-auto flex items-center gap-4">
                <Select v-model="alatTerpilih">
                    <SelectTrigger
                        class="!h-10 w-auto min-w-[150px] gap-2 border-0 bg-transparent font-bold shadow-none">
                        <SelectValue placeholder="Semua Alat" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="semua">Semua Alat</SelectItem>
                        <SelectItem v-for="alat in daftarAlat" :key="alat" :value="alat">{{ alat }}</SelectItem>
                    </SelectContent>
                </Select>

                <Select v-model="statusTerpilih">
                    <SelectTrigger
                        class="!h-10 w-auto min-w-[150px] gap-2 border-0 bg-transparent font-bold shadow-none">
                        <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="semua">Semua Status</SelectItem>
                        <SelectItem value="Selesai">Selesai</SelectItem>
                        <SelectItem value="Terlambat">Terlambat</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <p v-if="errorMessage" role="alert" class="mt-4 text-sm text-red-600">{{ errorMessage }}</p>

        <div class="mt-5">
            <Table :laporan="halamanIni" :loading="loading" :total="hasil.length"
                :nomor-awal="(halaman - 1) * perHalaman" v-model:page="halaman" :per-page="perHalaman" />
        </div>
    </div>
</template>