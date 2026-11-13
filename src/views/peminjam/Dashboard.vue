<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getPeminjaman } from '@/services/peminjamanService'
import { ajukanPengembalian, getPengembalianSaya } from '@/services/pengembalianService'

const router = useRouter()
const daftarPeminjaman = ref([])
const daftarPengembalian = ref([])
const loading = ref(true)
const errorMessage = ref('')
const pencarian = ref('')
const statusTerpilih = ref('Semua Status')
const peminjamanTerpilih = ref(null)
const halaman = ref(1)
const perHalaman = 5

const peminjamanDitampilkan = computed(() => {
    const query = pencarian.value.trim().toLowerCase()
    return daftarPeminjaman.value.filter((peminjaman) =>
        (!query || [peminjaman.alat, peminjaman.kode_peminjaman].some((value) => value?.toLowerCase().includes(query))) &&
        (statusTerpilih.value === 'Semua Status' || peminjaman.status === statusTerpilih.value),
    )
})
const pengembalianPerPeminjaman = computed(() => new Map(daftarPengembalian.value.map((item) => [item.peminjaman_id, item])))
const jumlahHalaman = computed(() => Math.max(1, Math.ceil(peminjamanDitampilkan.value.length / perHalaman)))
const peminjamanHalamanIni = computed(() => peminjamanDitampilkan.value.slice((halaman.value - 1) * perHalaman, halaman.value * perHalaman))
const rentangAwal = computed(() => peminjamanDitampilkan.value.length ? (halaman.value - 1) * perHalaman + 1 : 0)
const rentangAkhir = computed(() => Math.min(halaman.value * perHalaman, peminjamanDitampilkan.value.length))

watch([pencarian, statusTerpilih], () => { halaman.value = 1 })
watch(jumlahHalaman, (jumlah) => { if (halaman.value > jumlah) halaman.value = jumlah })

function tampilkanTanggal(value) { return value || '-' }
function warnaStatus(status) { return { Menunggu: 'text-[#d14400]', Disetujui: 'text-[#00705c]', Ditolak: 'text-[#e00000]' }[status] ?? 'text-black' }
function statusPengembalian(peminjaman) { return pengembalianPerPeminjaman.value.get(peminjaman.id)?.status }

async function ambilPeminjaman() {
    loading.value = true
    errorMessage.value = ''
    try {
        const [peminjamanResponse, pengembalianResponse] = await Promise.all([getPeminjaman(), getPengembalianSaya()])
        if (!Array.isArray(peminjamanResponse.data) || !Array.isArray(pengembalianResponse.data)) throw new TypeError('Respons API tidak valid.')
        daftarPeminjaman.value = peminjamanResponse.data
        daftarPengembalian.value = pengembalianResponse.data
    } catch (error) { errorMessage.value = error.response?.data?.message ?? 'Gagal mengambil riwayat peminjaman.' }
    finally { loading.value = false }
}

async function ajukanKembali(peminjaman) {
    if (!confirm(`Ajukan pengembalian untuk ${peminjaman.alat}?`)) return
    try { daftarPengembalian.value.unshift((await ajukanPengembalian(peminjaman.id)).data.data) }
    catch (error) { errorMessage.value = error.response?.data?.message ?? 'Gagal mengajukan pengembalian.' }
}

onMounted(ambilPeminjaman)
</script>

<template>
    <main class="min-h-full bg-white p-8" style="font-family: 'DM Sans', Arial, sans-serif">
        <h1 class="font-display text-3xl tracking-wide text-black">STATUS PEMINJAMAN</h1>
        <p class="mt-2 text-base text-[#697386]">Pantau status pengajuan peminjaman alat anda secara berkala</p>

        <div class="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div class="relative w-full max-w-[430px]"><Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#667085]" /><Input v-model="pencarian" type="search" placeholder="Cari peminjaman..." class="h-11 rounded-xl border-[#dfe3e8] bg-white pl-11" /></div>
            <select v-model="statusTerpilih" class="h-11 rounded-xl border-0 bg-white px-4 text-sm font-bold outline-none"><option>Semua Status</option><option>Menunggu</option><option>Disetujui</option><option>Ditolak</option></select>
        </div>

        <p v-if="errorMessage" role="alert" class="mt-5 text-sm text-red-600">{{ errorMessage }}</p>
        <section id="pengembalian" class="mt-7 overflow-hidden rounded-[20px] border border-[#e1e4e8] bg-white">
            <div class="overflow-x-auto">
                <table class="w-full min-w-[850px] border-collapse text-left text-sm">
                    <thead class="bg-black text-sm font-bold text-white"><tr><th class="h-13 px-6">ID</th><th class="h-13 px-6">Alat</th><th class="h-13 px-6">Jumlah</th><th class="h-13 px-6">Tanggal Pinjam</th><th class="h-13 px-6">Tanggal Kembali</th><th class="h-13 px-6">Status</th><th class="h-13 px-6 text-center">Aksi</th></tr></thead>
                    <tbody>
                        <tr v-if="loading"><td colspan="7" class="p-10 text-center text-gray-500">Memuat data peminjaman...</td></tr>
                        <tr v-else-if="!peminjamanHalamanIni.length"><td colspan="7" class="p-10 text-center text-gray-500">Tidak ada data peminjaman yang sesuai.</td></tr>
                        <tr v-for="peminjaman in peminjamanHalamanIni" v-else :key="peminjaman.id" class="border-b border-[#e5e7eb] last:border-0">
                            <td class="px-6 py-5 text-[#697386]">{{ peminjaman.kode_peminjaman }}</td><td class="px-6 py-5 font-medium">{{ peminjaman.alat }}</td><td class="px-6 py-5">{{ peminjaman.jumlah }}</td><td class="px-6 py-5 font-medium">{{ tampilkanTanggal(peminjaman.tanggal_pinjam) }}</td><td class="px-6 py-5 font-medium">{{ tampilkanTanggal(peminjaman.tanggal_kembali) }}</td><td class="px-6 py-5 font-bold" :class="warnaStatus(peminjaman.status)">{{ peminjaman.status }}</td>
                            <td class="px-6 py-4"><div class="flex justify-center gap-2"><Button size="sm" class="min-w-24 rounded-xl bg-black text-xs font-bold text-white hover:bg-black/80" @click="peminjamanTerpilih = peminjaman">Detail</Button><Button v-if="peminjaman.status === 'Disetujui' && !statusPengembalian(peminjaman)" size="sm" class="rounded-xl bg-black text-xs font-bold text-white hover:bg-black/80" @click="ajukanKembali(peminjaman)">Kembalikan</Button><span v-else-if="statusPengembalian(peminjaman)" class="self-center text-xs font-bold text-amber-700">{{ statusPengembalian(peminjaman) === 'Menunggu' ? 'Menunggu verifikasi' : 'Dikembalikan' }}</span></div></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <footer class="flex items-center border-t border-[#e5e7eb] px-6 py-5 text-sm text-[#697386]"><span>Menampilkan <strong class="text-black">{{ rentangAwal }}–{{ rentangAkhir }}</strong> dari <strong class="text-black">{{ peminjamanDitampilkan.length }}</strong> data peminjaman</span><div class="ml-auto flex gap-2"><Button variant="outline" size="icon" class="size-9 rounded-lg" :disabled="halaman <= 1" @click="halaman -= 1"><ChevronLeft :size="18" /></Button><span class="flex size-9 items-center justify-center rounded-lg bg-black font-bold text-white">{{ halaman }}</span><Button variant="outline" size="icon" class="size-9 rounded-lg" :disabled="halaman >= jumlahHalaman" @click="halaman += 1"><ChevronRight :size="18" /></Button></div></footer>
        </section>

        <Dialog :open="Boolean(peminjamanTerpilih)" @update:open="(open) => { if (!open) peminjamanTerpilih = null }"><DialogContent class="max-w-xl rounded-3xl"><DialogHeader><DialogTitle class="font-display text-lg">DETAIL PEMINJAMAN</DialogTitle></DialogHeader><div v-if="peminjamanTerpilih" class="grid grid-cols-[150px_1fr] gap-y-3 text-sm"><template v-for="([label, value]) in [['ID', peminjamanTerpilih.kode_peminjaman], ['Alat', peminjamanTerpilih.alat], ['Jumlah', peminjamanTerpilih.jumlah], ['Tanggal Pinjam', peminjamanTerpilih.tanggal_pinjam], ['Tanggal Kembali', peminjamanTerpilih.tanggal_kembali], ['Keperluan', peminjamanTerpilih.keperluan], ['Status', peminjamanTerpilih.status]]" :key="label"><span class="text-gray-500">{{ label }}</span><strong>{{ value }}</strong></template></div><Button variant="outline" class="w-full" @click="peminjamanTerpilih = null"><X :size="16" /> Tutup</Button></DialogContent></Dialog>
    </main>
</template>
