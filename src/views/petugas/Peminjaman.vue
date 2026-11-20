<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { AlertCircle, Search } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import Table from '@/components/Petugas/peminjaman/table.vue'
import Detail from '@/components/Petugas/peminjaman/detail.vue'
import { getPeminjaman, ubahStatusPeminjaman } from '@/services/peminjamanService'

const perHalaman = 8
const daftar = ref([])
const loading = ref(true)
const errorMessage = ref('')
const pencarian = ref('')
const statusTerpilih = ref('Semua')
const opsiStatus = ['Semua', 'Menunggu', 'Disetujui', 'Dipinjam', 'Ditolak']
const halaman = ref(1)

const terpilih = ref(null)
const modalTerbuka = ref(false)
const menyimpan = ref(false)
const errorModal = ref('')

const hasil = computed(() => {
    const q = pencarian.value.trim().toLowerCase()

    return daftar.value.filter((item) => {
        const cocokStatus =
            statusTerpilih.value === 'Semua' ||
            String(item.status ?? '').toLowerCase() === statusTerpilih.value.toLowerCase()

        const cocokQuery =
            !q ||
            [item.kode_peminjaman, item.nama_peminjam, item.alat, item.keperluan, item.status]
                .some((nilai) => String(nilai ?? '').toLowerCase().includes(q))

        return cocokStatus && cocokQuery
    })
})

const halamanIni = computed(() => {
    const mulai = (halaman.value - 1) * perHalaman
    return hasil.value.slice(mulai, mulai + perHalaman)
})

watch([pencarian, statusTerpilih], () => {
    halaman.value = 1
})

watch(modalTerbuka, (buka) => {
    if (!buka) errorModal.value = ''
})

async function ambilPeminjaman() {
    loading.value = true
    errorMessage.value = ''
    try {
        const response = await getPeminjaman()
        const data = response.data?.data ?? response.data
        if (!Array.isArray(data)) {
            throw new TypeError('Respons API peminjaman tidak berisi daftar peminjaman.')
        }
        daftar.value = data
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
    <main class="min-h-full bg-[#F8F9FA] p-6 md:p-8" style="font-family: 'DM Sans', Arial, sans-serif">
        <!-- Header -->
        <div>
            <h1 class="font-display text-2xl font-bold tracking-wide text-gray-900 md:text-3xl">
                PERSETUJUAN PEMINJAMAN
            </h1>
            <p class="mt-1.5 text-sm text-[#697386] md:text-base">
                Kelola dan verifikasi pengajuan peminjaman alat dari pengguna.
            </p>
        </div>

        <!-- Search & Filter Status Pills -->
        <div class="mt-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div class="relative w-full lg:max-w-[380px]">
                <Search :size="18"
                    class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085]" />
                <Input v-model="pencarian" type="search" placeholder="Cari kode, peminjam, atau alat..."
                    class="h-11 rounded-xl border-[#dfe3e8] bg-white pl-10 text-sm shadow-xs focus-visible:border-black" />
            </div>

            <!-- Filter Pills -->
            <div class="flex flex-wrap items-center gap-2">
                <button v-for="opsi in opsiStatus" :key="opsi" type="button"
                    class="rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors" :class="statusTerpilih === opsi
                            ? 'bg-black text-white shadow-xs'
                            : 'border border-[#dfe3e8] bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        " @click="statusTerpilih = opsi">
                    {{ opsi }}
                </button>
            </div>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage" role="alert"
            class="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle :size="20" class="shrink-0" />
            <span>{{ errorMessage }}</span>
        </div>

        <!-- Tabel Peminjaman -->
        <div class="mt-6">
            <Table v-model:page="halaman" :peminjaman="halamanIni" :loading="loading" :total="hasil.length"
                :per-page="perHalaman" @detail="bukaDetail" />
        </div>

        <!-- Modal Detail Persetujuan -->
        <Detail v-model:open="modalTerbuka" :peminjaman="terpilih" :loading="menyimpan" :error-message="errorModal"
            @ubah-status="ubahStatus" />
    </main>
</template>