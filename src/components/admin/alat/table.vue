<script setup>
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import Button from '@/components/ui/button/Button.vue'
import { Eye, Pencil, Trash2 } from 'lucide-vue-next'
import DetailAlat from '@/components/admin/alat/detail.vue'
import { detailAlat as ambilDetailAlat } from '@/services/alatService'
import { ref } from 'vue'

defineProps({
    alat: {
        type: Array,
        default: () => [],
    },
    loading: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['edit', 'delete'])
const modalTerbuka = ref(false)
const alatTerpilih = ref(null)
const memuatDetail = ref(false)

async function detailAlat(item) {
    memuatDetail.value = true
    try {
        const response = await ambilDetailAlat(item.id)
        alatTerpilih.value = response.data
        modalTerbuka.value = true
    } catch (error) {
        console.error('Gagal mengambil detail alat:', error)
        alert(error.response?.data?.message ?? 'Gagal mengambil detail alat.')
    } finally {
        memuatDetail.value = false
    }
}
</script>

<template>
    <div class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div class="overflow-x-auto">
            <Table class="w-full border-collapse">
                <TableHeader class="bg-black hover:bg-black">
                    <TableRow class="border-0 hover:bg-black">
                        <TableHead class="h-12 px-10 text-xs font-semibold text-white">ID Alat</TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">Nama Alat</TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">Kategori</TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">Jumlah</TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">Tersedia</TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">Status</TableHead>
                        <TableHead class="h-12 text-center text-xs font-semibold text-white">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow v-for="item in alat" :key="item.id">
                        <TableCell class="w-30 px-10">{{ item.kode_alat }}</TableCell>
                        <TableCell class="w-45">{{ item.nama_alat }}</TableCell>
                        <TableCell class="w-40">{{ item.kategori }}</TableCell>
                        <TableCell>{{ item.jumlah }}</TableCell>
                        <TableCell>{{ item.tersedia }}</TableCell>
                        <TableCell>
                            <span :class="item.status === 'Tersedia' ? 'text-[#0284C7]' : 'text-[#DC2626]'">
                                {{ item.status }}
                            </span>
                        </TableCell>
                        <TableCell>
                            <div class="flex items-center justify-center gap-2">
                                <Button
                                    size="icon"
                                    aria-label="Lihat detail alat"
                                    class="rounded-full bg-[#DEF7EC] hover:bg-[#d2e7fd]"
                                    :disabled="memuatDetail"
                                    @click="detailAlat(item)"
                                >
                                    <Eye class="h-4 w-4 text-[#03543F]" />
                                </Button>
                                <Button
                                    size="icon"
                                    aria-label="Edit alat"
                                    class="rounded-full bg-[#E1EFFE] hover:bg-[#d2e7fd]"
                                    @click="emit('edit', item)"
                                >
                                    <Pencil class="h-4 w-4 text-[#0284C7]" />
                                </Button>
                                <Button
                                    size="icon"
                                    aria-label="Hapus alat"
                                    class="rounded-full bg-[#FEE2E2] hover:bg-[#fdd5d5]"
                                    @click="emit('delete', item)"
                                >
                                    <Trash2 class="h-4 w-4 text-[#DC2626]" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                    <TableRow v-if="loading && alat.length === 0">
                        <TableCell colspan="7" class="py-6 text-center text-gray-500">
                            Memuat data alat...
                        </TableCell>
                    </TableRow>
                    <TableRow v-else-if="alat.length === 0">
                        <TableCell colspan="7" class="py-6 text-center text-gray-500">
                            Belum ada data alat.
                        </TableCell>
                    </TableRow>
                </TableBody>
                <TableFooter>
                    <TableRow class="hover:bg-transparent">
                        <TableCell colspan="7" class="p-0">
                            <div class="flex w-full items-center px-10 py-3">
                                <span class="whitespace-nowrap text-sm text-gray-600">
                                    Menampilkan <span class="font-bold">{{ alat.length }}</span> data alat
                                </span>
                            </div>
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    </div>

    <DetailAlat v-model:open="modalTerbuka" :alat="alatTerpilih" />
</template>
