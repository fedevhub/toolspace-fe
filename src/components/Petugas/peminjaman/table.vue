<script setup>
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Button from '@/components/ui/button/Button.vue'
import PaginationBar from '@/components/Petugas/pagination-bar.vue'

defineProps({
    peminjaman: { type: Array, default: () => [] },
    loading: Boolean,
    total: { type: Number, default: 0 },
    page: { type: Number, default: 1 },
    perPage: { type: Number, default: 10 },
})
const emit = defineEmits(['detail', 'update:page'])

const warnaStatus = {
    Menunggu: 'text-[#BA3800]',
    Disetujui: 'text-[#03543F]',
    Ditolak: 'text-[#9B1C1C]',
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
                        <TableHead class="h-12 text-sm font-bold text-white">Tanggal</TableHead>
                        <TableHead class="h-12 text-sm font-bold text-white">Keperluan</TableHead>
                        <TableHead class="h-12 text-sm font-bold text-white">Status</TableHead>
                        <TableHead class="h-12 text-center text-sm font-bold text-white">Aksi</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    <TableRow v-if="loading">
                        <TableCell colspan="7" class="py-10 text-center text-gray-500">Memuat data peminjaman...
                        </TableCell>
                    </TableRow>
                    <TableRow v-else-if="!peminjaman.length">
                        <TableCell colspan="7" class="py-10 text-center text-gray-500">Belum ada data peminjaman.
                        </TableCell>
                    </TableRow>
                    <template v-else>
                        <TableRow v-for="item in peminjaman" :key="item.id" class="h-[70px]">
                            <TableCell class="px-6 text-gray-400">{{ item.kode_peminjaman }}</TableCell>
                            <TableCell class="font-bold">{{ item.nama_peminjam }}</TableCell>
                            <TableCell>{{ item.alat }}</TableCell>
                            <TableCell class="font-medium">{{ item.tanggal_pinjam }}</TableCell>
                            <TableCell class="max-w-[180px] truncate font-medium">{{ item.keperluan }}</TableCell>
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

        <PaginationBar :total="total" :page="page" :per-page="perPage" label="peminjaman"
            @update:page="emit('update:page', $event)" />
    </div>
</template>