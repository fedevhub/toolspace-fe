<script setup>
import { computed, onMounted, ref } from 'vue'
import { Info, Package, Plus, Search } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { detailAlat, getAlat } from '@/services/alatService'
import { useRouter } from 'vue-router'

const router = useRouter()
const daftarAlat = ref([])
const pencarian = ref('')
const kategori = ref('Semua Kategori')
const loading = ref(true)
const errorMessage = ref('')
const alatTerpilih = ref(null)
const memuatDetail = ref(false)

const kategoriTersedia = computed(() => [...new Set(daftarAlat.value.map((alat) => alat.kategori).filter(Boolean))])
const alatDitampilkan = computed(() => {
    const query = pencarian.value.trim().toLowerCase()
    return daftarAlat.value.filter((alat) =>
        alat.status_aktif !== false &&
        (kategori.value === 'Semua Kategori' || alat.kategori === kategori.value) &&
        (!query || [alat.nama_alat, alat.kode_alat, alat.kategori].some((value) => value?.toLowerCase().includes(query))),
    )
})

function statusAlat(alat) {
    if (alat.tersedia <= 0) return { label: 'Dipinjam', class: 'bg-red-100 text-red-600' }
    if (alat.tersedia < alat.jumlah) return { label: 'Terbatas', class: 'bg-orange-100 text-orange-700' }
    return { label: 'Tersedia', class: 'bg-emerald-100 text-emerald-700' }
}

async function ambilAlat() {
    loading.value = true
    try {
        const response = await getAlat()
        if (!Array.isArray(response.data)) throw new TypeError('Data alat tidak valid.')
        daftarAlat.value = response.data
    } catch (error) {
        errorMessage.value = error.response?.data?.message ?? 'Gagal mengambil daftar alat.'
    } finally { loading.value = false }
}

async function bukaDetail(alat) {
    alatTerpilih.value = alat
    memuatDetail.value = true
    try { alatTerpilih.value = (await detailAlat(alat.id)).data } catch { /* tampilkan data daftar jika detail gagal */ }
    finally { memuatDetail.value = false }
}

onMounted(ambilAlat)
</script>

<template>
    <div class="min-h-full bg-white p-8" style="font-family: 'DM Sans', Arial, sans-serif">
        <h1 class="font-display text-3xl tracking-wide text-black">DAFTAR ALAT</h1>
        <p class="mt-2 text-base text-[#697386]">Pilih alat yang tersedia untuk diajukan peminjaman.</p>

        <div class="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div class="relative w-full max-w-[430px]"><Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#667085]" /><Input v-model="pencarian" class="h-11 rounded-xl border-[#dfe3e8] bg-white pl-11" placeholder="Cari nama alat..." /></div>
            <select v-model="kategori" class="h-11 rounded-xl border-0 bg-white px-4 text-sm font-bold text-black outline-none"><option>Semua Kategori</option><option v-for="item in kategoriTersedia" :key="item">{{ item }}</option></select>
        </div>

        <p v-if="errorMessage" role="alert" class="mt-6 text-sm text-red-600">{{ errorMessage }}</p>
        <p v-else-if="loading" class="mt-10 text-sm text-gray-500">Memuat daftar alat...</p>
        <p v-else-if="!alatDitampilkan.length" class="mt-10 text-sm text-gray-500">Tidak ada alat yang sesuai.</p>

        <div v-else class="mt-10 grid gap-8 md:grid-cols-3">
            <article v-for="alat in alatDitampilkan" :key="alat.id" class="min-w-0">
                <div class="flex h-40 items-center justify-center overflow-hidden rounded-[20px] bg-[#f2f2f2]">
                    <img v-if="alat.gambar" :src="alat.gambar" :alt="alat.nama_alat" class="h-full w-full object-cover" />
                    <Package v-else :size="68" stroke-width="1.35" class="text-[#9aa1a9]" />
                </div>
                <h2 class="mt-4 text-xl font-bold text-black">{{ alat.nama_alat }}</h2>
                <div class="mt-2 flex items-center justify-between gap-3 text-sm"><span class="text-[#667085]">Stok: {{ alat.tersedia }} Unit</span><span class="rounded-full px-3 py-1 text-xs font-bold" :class="statusAlat(alat).class">{{ statusAlat(alat).label }}</span></div>
                <div class="mt-6 grid grid-cols-2 gap-3">
                    <Button variant="outline" class="h-11 rounded-xl border-[#dfe3e8] font-bold" @click="bukaDetail(alat)"><Info :size="17" /> Detail</Button>
                    <Button class="h-11 rounded-xl bg-black font-bold text-white hover:bg-black/80" :disabled="alat.tersedia <= 0" @click="router.push({ name: 'peminjam-peminjaman-form', query: { alat: alat.id } })"><Plus :size="18" /> Pinjam</Button>
                </div>
            </article>
        </div>

        <Dialog :open="Boolean(alatTerpilih)" @update:open="(open) => { if (!open) alatTerpilih = null }">
            <DialogContent class="max-w-3xl rounded-3xl p-0" :show-close-button="true">
                <DialogHeader class="border-b px-12 py-7"><DialogTitle class="font-display text-xl tracking-wide">DETAIL ALAT</DialogTitle></DialogHeader>
                <div v-if="alatTerpilih" class="grid gap-8 px-12 py-7 md:grid-cols-[220px_1fr]">
                    <div class="flex h-52 items-center justify-center overflow-hidden rounded-2xl bg-[#f2f2f2]"><img v-if="alatTerpilih.gambar" :src="alatTerpilih.gambar" :alt="alatTerpilih.nama_alat" class="h-full w-full object-contain" /><Package v-else :size="72" class="text-gray-400" /></div>
                    <p v-if="memuatDetail" class="text-sm text-gray-500">Memuat detail...</p>
                    <dl v-else class="grid grid-cols-[135px_16px_1fr] gap-y-3 text-sm"><template v-for="([label, value]) in [['Nama Alat', alatTerpilih.nama_alat], ['ID Alat', alatTerpilih.kode_alat], ['Kategori', alatTerpilih.kategori], ['Stok', `${alatTerpilih.jumlah} unit`], ['Tersedia', `${alatTerpilih.tersedia} unit`], ['Kondisi', alatTerpilih.kondisi], ['Status', statusAlat(alatTerpilih).label], ['Deskripsi', alatTerpilih.deskripsi || '-']]" :key="label"><dt class="text-gray-500">{{ label }}</dt><span>:</span><dd class="font-semibold">{{ value }}</dd></template></dl>
                </div>
            </DialogContent>
        </Dialog>
    </div>
</template>
