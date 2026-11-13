<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { Search } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import Table from '@/components/Petugas/peminjaman/table.vue'
import Detail from '@/components/Petugas/peminjaman/detail.vue'
import { getPeminjaman, ubahStatusPeminjaman } from '@/services/peminjamanService'

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
        [item.kode_peminjaman, item.nama_peminjam, item.alat, item.keperluan, item.status]
            .some((nilai) => nilai?.toLowerCase().includes(q))
    )
})
const halamanIni = computed(() => {
    const mulai = (halaman.value - 1) * perHalaman
    return hasil.value.slice(mulai, mulai + perHalaman)
})

watch(pencarian, () => { halaman.value = 1 })
watch(modalTerbuka, (buka) => { if (!buka) errorModal.value = '' })

async function ambilPeminjaman() {
    loading.value = true
    errorMessage.value = ''
    try {
        const response = await getPeminjaman()
        if (!Array.isArray(response.data)) {
            throw new TypeError('Respons API peminjaman tidak berisi daftar peminjaman.')
        }
        daftar.value = response.data
    } catch (error) {
        console.error('Gagal mengambil data peminjaman:', error)
        errorMessage.value = error.response?.data?.message ?? 'Gagal mengambil data peminjaman.'
    } finally {
        loading.value = false
    }
}

function bukaDetail(item) {
    terpilih.value = item
    modalTerbuka.value = true
}

async function ubahStatus(status) {
    if (!terpilih.value) return
    menyimpan.value = true
    errorModal.value = ''
    try {
        await ubahStatusPeminjaman(terpilih.value.id, status)
        modalTerbuka.value = false
        await ambilPeminjaman()
    } catch (error) {
        console.error('Gagal mengubah status peminjaman:', error)
        errorModal.value = error.response?.data?.message ?? 'Gagal mengubah status peminjaman.'
    } finally {
        menyimpan.value = false
    }
}

onMounted(ambilPeminjaman)
</script>

<template>
    <div class="p-10">
        <h1 class="font-display text-[32px] uppercase leading-tight">Persetujuan Peminjaman</h1>
        <p class="mt-1 text-sm text-gray-500">Kelola dan verifikasi pengajuan peminjaman alat.</p>

        <div class="relative mt-5 w-[430px] max-w-full">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" :size="18" />
            <Input v-model="pencarian" type="text" placeholder="Cari nama peminjam atau alat..."
                class="h-11 rounded-xl bg-white pl-11" />
        </div>

        <p v-if="errorMessage" role="alert" class="mt-4 text-sm text-red-600">{{ errorMessage }}</p>

        <div class="mt-5">
            <Table :peminjaman="halamanIni" :loading="loading" :total="hasil.length" v-model:page="halaman"
                :per-page="perHalaman" @detail="bukaDetail" />
        </div>

        <Detail v-model:open="modalTerbuka" :peminjaman="terpilih" :loading="menyimpan" :error-message="errorModal"
            @ubah-status="ubahStatus" />
    </div>
</template>