<script setup>
import { computed, onMounted, ref } from 'vue'
import Table from '@/components/admin/kategori/table.vue'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import KategoriForm from '@/components/admin/kategori/form.vue'
import { getKategori, hapusKategori } from '@/services/kategoriService'

const daftarKategori = ref([])
const loading = ref(true)
const errorMessage = ref('')
const pencarian = ref('')
const kategoriTerpilih = ref(null)
const dialogOpen = ref(false)

const kategoriDitampilkan = computed(() => {
    const query = pencarian.value.trim().toLowerCase()
    if (!query) return daftarKategori.value

    return daftarKategori.value.filter((kategori) =>
        [kategori.kode_kategori, kategori.nama_kategori, kategori.deskripsi]
            .some((value) => value?.toLowerCase().includes(query)),
    )
})

async function ambilKategori() {
    loading.value = true
    errorMessage.value = ''
    try {
        const response = await getKategori()
        if (!Array.isArray(response.data)) {
            throw new TypeError('Respons API kategori tidak berisi daftar kategori.')
        }
        daftarKategori.value = response.data
    } catch (error) {
        console.error('Gagal mengambil data kategori:', error)
        errorMessage.value = error.response?.data?.message ?? 'Gagal mengambil data kategori.'
    } finally {
        loading.value = false
    }
}

function tambahKategori() {
    kategoriTerpilih.value = null
    dialogOpen.value = true
}

function editKategori(kategori) {
    kategoriTerpilih.value = kategori
    dialogOpen.value = true
}

async function hapusItemKategori(kategori) {
    if (!confirm(`Yakin ingin menghapus ${kategori.nama_kategori} (${kategori.kode_kategori})?`)) return

    try {
        await hapusKategori(kategori.id)
        daftarKategori.value = daftarKategori.value.filter((item) => item.id !== kategori.id)
    } catch (error) {
        console.error('Gagal menghapus kategori:', error)
        alert(error.response?.data?.message ?? 'Gagal menghapus kategori.')
    }
}

onMounted(ambilKategori)
</script>

<template>
    <div class="p-8">
        <h1 class="text-3xl font-bold">Kelola Kategori</h1>
        <p class="font-medium text-gray-500">Kelola data kategori untuk mengelompokkan alat sesuai jenisnya.</p>
        <div class="flex w-full items-center py-5 ">
            <div class="relative w-75">
                <Search
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    :size="18"
                />

                <Input
                    v-model="pencarian"
                    type="text"
                    placeholder="Cari kategori"
                    class="bg-white pl-10"
                />
            </div>

            <div class="ml-auto">
                <Button @click="tambahKategori">
                    <Plus :size="20" />
                    Tambah Kategori
                </Button>
            </div>
        </div>
        <p v-if="errorMessage" role="alert" class="mb-4 text-sm text-red-600">
            {{ errorMessage }}
        </p>

        <Table
            :kategori="kategoriDitampilkan"
            :loading="loading"
            @edit="editKategori"
            @delete="hapusItemKategori"
        />
        <KategoriForm
            v-model:open="dialogOpen"
            :kategori="kategoriTerpilih"
            @saved="ambilKategori"
        />
    </div>
</template>