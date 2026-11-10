<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Table from '@/components/admin/pengembalian/table.vue'
import { Input } from '@/components/ui/input'
import Button from '@/components/ui/button/Button.vue'
import { Plus, Search } from 'lucide-vue-next'
import { getPengembalian, hapusPengembalian } from '@/services/pengembalianService'

const router = useRouter()
const data = ref([]), loading = ref(false), error = ref(''), query = ref('')
const filtered = computed(() => { const q = query.value.trim().toLowerCase(); return q ? data.value.filter((item) => [item.kode_pengembalian, item.nama_peminjam, item.alat, item.status].some((value) => value.toLowerCase().includes(q))) : data.value })
async function load() { loading.value = true; error.value = ''; try { data.value = (await getPengembalian()).data } catch (e) { error.value = e.response?.data?.message || 'Gagal mengambil data pengembalian.' } finally { loading.value = false } }
async function remove(item) { if (!window.confirm(`Hapus pengembalian ${item.kode_pengembalian}?`)) return; try { await hapusPengembalian(item.id); await load() } catch (e) { error.value = e.response?.data?.message || 'Gagal menghapus pengembalian.' } }
onMounted(load)
</script>

<template>
  <div class="p-8"><h1 class="text-3xl font-bold">Kelola Pengembalian</h1><p class="font-medium text-gray-500">Kelola data dan pantau status pengembalian alat.</p>
    <div class="flex w-full items-center py-5"><div class="relative w-75"><Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="18" /><Input v-model="query" placeholder="Cari pengembalian" class="bg-white pl-10" /></div><Button class="ml-auto gap-2" @click="router.push('/admin/pengembalian-form')"><Plus :size="20" />Tambah Pengembalian</Button></div>
    <p v-if="error" class="mb-3 text-sm text-red-600">{{ error }}</p><Table :pengembalian="filtered" :loading="loading" @delete="remove" />
  </div>
</template>
