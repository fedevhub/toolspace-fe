<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { Search } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import Table from '@/components/Petugas/pengembalian/table.vue'
import Detail from '@/components/Petugas/pengembalian/detail.vue'
import {
    getMonitorPengembalian,
    setujuiPengembalian,
    tolakPengembalian,
} from '@/services/pengembalianService'

const perHalaman = 10
const daftar = ref([])
const loading = ref(true)
const errorMessage = ref('')
const pencarian = ref('')
const halaman = ref(1)

const terpilih = ref(null)
const modalTerbuka = ref(false)
const menyimpan = ref(false)
const errorModal = ref('')

const hasil = computed(() => {
    const q = pencarian.value.trim().toLowerCase()
    if (!q) return daftar.value
    return daftar.value.filter((item) =>
        [item.kode_peminjaman, item.nama_peminjam, item.alat, item.status]
            .some((nilai) => nilai?.toLowerCase().includes(q))
    )
})
const halamanIni = computed(() => {
    const mulai = (halaman.value - 1) * perHalaman
    return hasil.value.slice(mulai, mulai + perHalaman)
})

watch(pencarian, () => { halaman.value = 1 })
watch(modalTerbuka, (buka) => { if (!buka) errorModal.value = '' })

async function ambilData() {
    loading.value = true
    errorMessage.value = ''
    try {
        const response = await getMonitorPengembalian()
        if (!Array.isArray(response.data)) {
            throw new TypeError('Respons API pengembalian tidak berisi daftar.')
        }
        daftar.value = response.data
    } catch (error) {
        console.error('Gagal mengambil data pengembalian:', error)
        errorMessage.value = error.response?.data?.message ?? 'Gagal mengambil data pengembalian.'
    } finally {
        loading.value = false
    }
}

function bukaDetail(item) {
    terpilih.value = item
    modalTerbuka.value = true
}

async function proses(aksi, payload) {
    if (!terpilih.value) return
    menyimpan.value = true
    errorModal.value = ''
    try {
        if (aksi === 'setujui') await setujuiPengembalian(terpilih.value.id, payload)
        else await tolakPengembalian(terpilih.value.id)
        modalTerbuka.value = false
        await ambilData()
    } catch (error) {
        console.error('Gagal memproses pengembalian:', error)
        errorModal.value = error.response?.data?.message ?? 'Gagal memproses pengembalian.'
    } finally {
        menyimpan.value = false
    }
}

onMounted(ambilData)
</script>

<template>
    <div class="p-10">
        <h1 class="font-display text-[32px] uppercase leading-tight">Data Pengembalian</h1>
        <p class="mt-1 text-sm text-gray-500">Kelola dan verifikasi pengembalian alat.</p>

        <div class="relative mt-5 w-[430px] max-w-full">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" :size="18" />
            <Input v-model="pencarian" type="text" placeholder="Cari nama peminjam atau alat..."
                class="h-11 rounded-xl bg-white pl-11" />
        </div>

        <p v-if="errorMessage" role="alert" class="mt-4 text-sm text-red-600">{{ errorMessage }}</p>

        <div class="mt-5">
            <Table :pengembalian="halamanIni" :loading="loading" :total="hasil.length" v-model:page="halaman"
                :per-page="perHalaman" @detail="bukaDetail" />
        </div>

        <Detail v-model:open="modalTerbuka" :pengembalian="terpilih" :loading="menyimpan" :error-message="errorModal"
            @setujui="proses('setujui', $event)" @tolak="proses('tolak')" />
    </div>
</template>