<script setup>
import { computed, onMounted, ref } from 'vue'
import { CalendarDays, Package, RotateCcw } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { getPeminjaman } from '@/services/peminjamanService'
import { ajukanPengembalian, getPengembalianSaya } from '@/services/pengembalianService'

const daftarPeminjaman = ref([])
const daftarPengembalian = ref([])
const loading = ref(true)
const errorMessage = ref('')
const pengembalianPerPeminjaman = computed(() => new Map(daftarPengembalian.value.map((item) => [item.peminjaman_id, item])))
const peminjamanAktif = computed(() => daftarPeminjaman.value.filter((item) => item.status === 'Disetujui'))

async function ambilData() {
    loading.value = true
    errorMessage.value = ''
    try {
        const [peminjaman, pengembalian] = await Promise.all([getPeminjaman(), getPengembalianSaya()])
        daftarPeminjaman.value = peminjaman.data
        daftarPengembalian.value = pengembalian.data
    } catch (error) { errorMessage.value = error.response?.data?.message ?? 'Gagal memuat data pengembalian.' }
    finally { loading.value = false }
}

async function ajukan(item) {
    if (!confirm(`Ajukan pengembalian untuk ${item.alat}?`)) return
    try { daftarPengembalian.value.unshift((await ajukanPengembalian(item.id)).data.data) }
    catch (error) { errorMessage.value = error.response?.data?.message ?? 'Gagal mengajukan pengembalian.' }
}

onMounted(ambilData)
</script>

<template>
    <main class="min-h-full bg-white p-8" style="font-family: 'DM Sans', Arial, sans-serif">
        <h1 class="font-display text-3xl tracking-wide text-black">PENGEMBALIAN</h1>
        <p class="mt-2 text-base text-[#697386]">Ajukan pengembalian untuk alat yang sedang kamu pinjam.</p>

        <p v-if="errorMessage" role="alert" class="mt-6 text-sm text-red-600">{{ errorMessage }}</p>
        <p v-else-if="loading" class="mt-10 text-sm text-gray-500">Memuat data pengembalian...</p>
        <p v-else-if="!peminjamanAktif.length" class="mt-10 text-sm text-gray-500">Tidak ada alat yang sedang dipinjam.</p>

        <div v-else class="mt-10 grid gap-8 md:grid-cols-3">
            <article v-for="item in peminjamanAktif" :key="item.id" class="rounded-2xl border border-[#e1e4e8] p-5">
                <div class="flex h-36 items-center justify-center rounded-xl bg-[#f2f2f2]"><Package :size="56" stroke-width="1.3" class="text-gray-400" /></div>
                <h2 class="mt-4 text-xl font-bold">{{ item.alat }}</h2>
                <p class="mt-2 text-sm text-[#667085]">Jumlah: {{ item.jumlah }} unit</p>
                <p class="mt-1 flex items-center gap-2 text-sm text-[#667085]"><CalendarDays :size="16" /> Batas kembali: {{ item.tanggal_kembali }}</p>
                <p v-if="pengembalianPerPeminjaman.get(item.id)" class="mt-5 rounded-lg bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">{{ pengembalianPerPeminjaman.get(item.id).status === 'Menunggu' ? 'Menunggu verifikasi petugas' : 'Pengembalian selesai' }}</p>
                <Button v-else class="mt-5 h-11 w-full rounded-xl bg-black font-bold text-white hover:bg-black/80" @click="ajukan(item)"><RotateCcw :size="17" /> Ajukan Pengembalian</Button>
            </article>
        </div>
    </main>
</template>
