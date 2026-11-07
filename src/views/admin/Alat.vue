<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import { Input } from '@/components/ui/input'
import Table from '@/components/admin/alat/table.vue'
import { getAlat, hapusAlat } from '@/services/alatService'

const router = useRouter()
const daftarAlat = ref([])
const loading = ref(true)
const errorMessage = ref('')
const pencarian = ref('')

const alatDitampilkan = computed(() => {
    const query = pencarian.value.trim().toLowerCase()
    if (!query) return daftarAlat.value

    return daftarAlat.value.filter((alat) =>
        [alat.kode_alat, alat.nama_alat, alat.kategori, alat.kondisi, alat.status]
            .some((value) => value?.toLowerCase().includes(query)),
    )
})

async function ambilAlat() {
    loading.value = true
    errorMessage.value = ''

    try {
        const response = await getAlat()
        if (!Array.isArray(response.data)) {
            throw new TypeError('Respons API alat tidak berisi daftar alat.')
        }
        daftarAlat.value = response.data
    } catch (error) {
        console.error('Gagal mengambil data alat:', error)
        errorMessage.value = error.response?.data?.message ?? 'Gagal mengambil data alat.'
    } finally {
        loading.value = false
    }
}

async function hapusItemAlat(alat) {
    if (!confirm(`Yakin ingin menghapus ${alat.nama_alat} (${alat.kode_alat})?`)) return

    try {
        await hapusAlat(alat.id)
        daftarAlat.value = daftarAlat.value.filter((item) => item.id !== alat.id)
    } catch (error) {
        console.error('Gagal menghapus alat:', error)
        alert(error.response?.data?.message ?? 'Gagal menghapus alat.')
    }
}

onMounted(ambilAlat)
</script>

<template>
    <div class="p-8">
        <h1 class="text-3xl font-bold">Kelola Alat</h1>
        <p class="font-medium text-gray-500">
            Kelola informasi alat, kategori, dan ketersediaan alat dalam sistem.
        </p>
        <div class="flex w-full items-center py-5">
            <div class="relative w-75">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
                <Input v-model="pencarian" type="search" placeholder="Cari alat" class="bg-white pl-10" />
            </div>
            <div class="ml-auto">
                <Button @click="router.push('/admin/alat-form')">
                    <Plus :size="20" />
                    Tambah Alat
                </Button>
            </div>
        </div>

        <p v-if="errorMessage" role="alert" class="mb-4 text-sm text-red-600">
            {{ errorMessage }}
        </p>

        <Table
            :alat="alatDitampilkan"
            :loading="loading"
            @edit="router.push(`/admin/alat-form/${$event.id}`)"
            @delete="hapusItemAlat"
        />
    </div>
</template>
