<script setup>
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import PaginationBar from '@/components/Petugas/pagination-bar.vue'
import { formatRupiah } from '@/lib/format'

defineProps({
    laporan: { type: Array, default: () => [] },
    loading: Boolean,
    total: { type: Number, default: 0 },
    page: { type: Number, default: 1 },
    perPage: { type: Number, default: 10 },
    nomorAwal: { type: Number, default: 0 },
})
const emit = defineEmits(['update:page'])

const warnaStatus = {
    Selesai: 'text-[#03543F]',
    Terlambat: 'text-[#9B1C1C]',
}
</script>

<template>
    <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
            <Table class="w-full border-collapse">
                <TableHeader class="bg-black hover:bg-black">
                    <TableRow class="border-0 hover:bg-black">
                        <TableHead class="h-12 px-6 text-sm font-bold text-white">NO</TableHead>
                        <TableHead class="h-12 text-sm font-bold text-white">Peminjam</TableHead>
                        <TableHead class="h-12 text-sm font-bold text-white">Alat</TableHead>
                        <TableHead class="h-12 text-sm font-bold text-white">Tanggal Pinjam</TableHead>
                        <TableHead class="h-12 text-sm font-bold text-white">Batas Kembali</TableHead>
                        <TableHead class="h-12 text-sm font-bold text-white">Tanggal Kembali</TableHead>
                        <TableHead class="h-12 text-sm font-bold text-white">Status</TableHead>
                        <TableHead class="h-12 text-sm font-bold text-white">Denda</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    <TableRow v-if="loading">
                        <TableCell colspan="8" class="py-10 text-center text-gray-500">Memuat data laporan...
                        </TableCell>
                    </TableRow>
                    <TableRow v-else-if="!laporan.length">
                        <TableCell colspan="8" class="py-10 text-center text-gray-500">Belum ada data laporan.
                        </TableCell>
                    </TableRow>
                    <template v-else>
                        <TableRow v-for="(item, index) in laporan" :key="item.id" class="h-[52px]">
                            <TableCell class="px-6 text-gray-400">{{ String(nomorAwal + index + 1).padStart(2, '0') }}
                            </TableCell>
                            <TableCell class="font-bold">{{ item.nama_peminjam }}</TableCell>
                            <TableCell>{{ item.alat }}</TableCell>
                            <TableCell class="font-medium">{{ item.tanggal_pinjam }}</TableCell>
                            <TableCell class="font-medium">{{ item.batas_kembali }}</TableCell>
                            <TableCell class="font-medium">{{ item.tanggal_kembali }}</TableCell>
                            <TableCell>
                                <span class="font-bold" :class="warnaStatus[item.status]">{{ item.status }}</span>
                            </TableCell>
                            <TableCell class="font-bold">{{ formatRupiah(item.denda) }}</TableCell>
                        </TableRow>
                    </template>
                </TableBody>
            </Table>
        </div>

        <PaginationBar :total="total" :page="page" :per-page="perPage" label="laporan"
            @update:page="emit('update:page', $event)" />
    </div>
</template>