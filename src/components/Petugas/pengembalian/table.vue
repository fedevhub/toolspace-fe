<script setup>
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Button from '@/components/ui/button/Button.vue'
import PaginationBar from '@/components/Petugas/pagination-bar.vue'

defineProps({
    pengembalian: { type: Array, default: () => [] },
    loading: Boolean,
    total: { type: Number, default: 0 },
    page: { type: Number, default: 1 },
    perPage: { type: Number, default: 10 },
})
const emit = defineEmits(['detail', 'update:page'])

const warnaStatus = {
    Selesai: 'text-[#03543F]',
    Dipinjam: 'text-[#1E429F]',
    Terlambat: 'text-[#9B1C1C]',
    Menunggu: 'text-[#BA3800]',
}
</script>

<template>
    <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
            <Table class="w-full border-collapse">
                <TableHeader class="bg-black hover:bg-black">
                    <TableRow class="border-0 hover:bg-black">
                        <TableHead class="h-12 px-6 text-sm font-bold text-white">ID</TableHead>
                        <TableHead class="h-12 text-sm font-bold text-white">Peminjam</TableHead>
                        <TableHead class="h-12 text-sm font-bold text-white">Alat</TableHead>
                        <TableHead class="h-12 text-sm font-bold text-white">Tanggal Pinjam</TableHead>
                        <TableHead class="h-12 text-sm font-bold text-white">Batas Kembali</TableHead>
                        <TableHead class="h-12 text-sm font-bold text-white">Tanggal Kembali</TableHead>
                        <TableHead class="h-12 text-sm font-bold text-white">Status</TableHead>
                        <TableHead class="h-12 text-center text-sm font-bold text-white">Aksi</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    <TableRow v-if="loading">
                        <TableCell colspan="8" class="py-10 text-center text-gray-500">Memuat data pengembalian...
                        </TableCell>
                    </TableRow>
                    <TableRow v-else-if="!pengembalian.length">
                        <TableCell colspan="8" class="py-10 text-center text-gray-500">Belum ada data pengembalian.
                        </TableCell>
                    </TableRow>
                    <template v-else>
                        <TableRow v-for="item in pengembalian" :key="item.id" class="h-[70px]">
                            <TableCell class="px-6 text-gray-400">{{ item.kode_peminjaman }}</TableCell>
                            <TableCell class="font-bold">{{ item.nama_peminjam }}</TableCell>
                            <TableCell>{{ item.alat }}</TableCell>
                            <TableCell class="font-medium">{{ item.tanggal_pinjam }}</TableCell>
                            <TableCell class="font-medium">{{ item.batas_kembali }}</TableCell>
                            <TableCell class="font-medium">{{ item.tanggal_kembali || '-' }}</TableCell>
                            <TableCell>
                                <span class="font-bold" :class="warnaStatus[item.status]">{{ item.status }}</span>
                            </TableCell>
                            <TableCell>
                                <div class="flex justify-center">
                                    <Button class="h-9 rounded-lg px-6 text-xs font-bold" @click="emit('detail', item)">
                                        Detail
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    </template>
                </TableBody>
            </Table>
        </div>

        <PaginationBar :total="total" :page="page" :per-page="perPage" label="pengembalian"
            @update:page="emit('update:page', $event)" />
    </div>
</template>