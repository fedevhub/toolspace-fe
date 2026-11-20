<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { AlertCircle, Plus, Search } from 'lucide-vue-next'
import Table from '@/components/admin/pengembalian/table.vue'
import { Input } from '@/components/ui/input'
import Button from '@/components/ui/button/Button.vue'
import { getPengembalian, hapusPengembalian } from '@/services/pengembalianService'

const router = useRouter()
const daftarPengembalian = ref([])
const loading = ref(false)
const errorMessage = ref('')
const pencarian = ref('')
const statusTerpilih = ref('Semua')
const opsiStatus = ['Semua', 'Selesai', 'Denda']

// Pagination State
const halamanSaatIni = ref(1)
const itemPerHalaman = ref(8)

watch([pencarian, statusTerpilih], () => {
  halamanSaatIni.value = 1
})

const pengembalianDitampilkan = computed(() => {
  const query = pencarian.value.trim().toLowerCase()

  return daftarPengembalian.value.filter((item) => {
    const matchStatus =
      statusTerpilih.value === 'Semua' ||
      String(item.status ?? '').toLowerCase() === statusTerpilih.value.toLowerCase()

    const matchQuery =
      !query ||
      [item.kode_pengembalian, item.nama_peminjam, item.alat, item.kondisi, item.status]
        .some((value) => String(value ?? '').toLowerCase().includes(query))

    return matchStatus && matchQuery
  })
})

const totalHalaman = computed(() =>
  Math.max(1, Math.ceil(pengembalianDitampilkan.value.length / itemPerHalaman.value))
)

const pengembalianPaginasi = computed(() => {
  const mulai = (halamanSaatIni.value - 1) * itemPerHalaman.value
  return pengembalianDitampilkan.value.slice(mulai, mulai + itemPerHalaman.value)
})

const infoRentangData = computed(() => {
  if (!pengembalianDitampilkan.value.length) return { mulai: 0, akhir: 0, total: 0 }
  const mulai = (halamanSaatIni.value - 1) * itemPerHalaman.value + 1
  const akhir = Math.min(
    halamanSaatIni.value * itemPerHalaman.value,
    pengembalianDitampilkan.value.length
  )
  return { mulai, akhir, total: pengembalianDitampilkan.value.length }
})

async function ambilPengembalian() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await getPengembalian()
    const hasil = response.data.data ?? response.data
    daftarPengembalian.value = Array.isArray(hasil) ? hasil : []
  } catch (error) {
    console.error('Gagal mengambil data pengembalian:', error)
    errorMessage.value =
      error.response?.data?.message || 'Gagal mengambil data pengembalian.'
  } finally {
    loading.value = false
  }
}

async function hapusItemPengembalian(item) {
  if (!window.confirm(`Hapus pengembalian ${item.kode_pengembalian}?`)) return
  try {
    await hapusPengembalian(item.id)
    await ambilPengembalian()

    if (halamanSaatIni.value > totalHalaman.value) {
      halamanSaatIni.value = totalHalaman.value
    }
  } catch (error) {
    console.error('Gagal menghapus pengembalian:', error)
    errorMessage.value =
      error.response?.data?.message || 'Gagal menghapus pengembalian.'
  }
}

function editPengembalian(item) {
  router.push(`/admin/pengembalian-form/${item.id}`)
}

onMounted(ambilPengembalian)
</script>

<template>
  <main class="min-h-full bg-[#F8F9FA] p-6 md:p-8" style="font-family: 'DM Sans', Arial, sans-serif">
    <!-- Header -->
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="font-display text-2xl font-bold tracking-wide text-gray-900 md:text-3xl">
          KELOLA PENGEMBALIAN
        </h1>
        <p class="mt-1.5 text-sm text-[#697386] md:text-base">
          Kelola data pengembalian, kondisi alat, dan denda keterlambatan/kerusakan.
        </p>
      </div>

      <Button class="h-11 gap-2 rounded-xl bg-black px-5 text-sm font-semibold text-white shadow-xs hover:bg-black/85"
        @click="router.push('/admin/pengembalian-form')">
        <Plus :size="18" />
        Tambah Pengembalian
      </Button>
    </div>

    <!-- Search & Filter Status Pills -->
    <div class="mt-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
      <div class="relative w-full lg:max-w-[380px]">
        <Search :size="18" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085]" />
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

    <!-- Tabel Pengembalian -->
    <div class="mt-6">
      <Table :pengembalian="pengembalianPaginasi" :loading="loading" :halaman-saat-ini="halamanSaatIni"
        :total-halaman="totalHalaman" :info-rentang="infoRentangData" @edit="editPengembalian"
        @delete="hapusItemPengembalian" @ganti-halaman="halamanSaatIni = $event" />
    </div>
  </main>
</template>