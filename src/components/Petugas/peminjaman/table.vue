<script setup>
import { ref } from 'vue'
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'

import Button from '@/components/ui/button/Button.vue';
import { Pencil, Trash2 } from 'lucide-vue-next';
import DetailPeminjaman from '@/components/Petugas/peminjaman/detail.vue';

const peminjaman = [
    {
        id: 'PA-001',
        peminjam: 'Andi',
        alat: 'Laptop Asus',
        tanggal_pinjam: '10-09-2026',
        tanggal_kembali: '15-09-2026',
        keperluan: 'Praktek',
        status: 'Menunggu'
    },
    {
        id: 'PA-002',
        peminjam: 'Budi',
        alat: 'Proyektor',
        tanggal_pinjam: '11-09-2026',
        tanggal_kembali: '15-09-2026',
        keperluan: 'Presentasi',
        status: 'Disetujui'
    },
    {
        id: 'PA-003',
        peminjam: 'Siti',
        alat: 'Stop Kontak',
        tanggal_pinjam: '12-09-2026',
        tanggal_kembali: '15-09-2026',
        keperluan: 'Pembelajaran',
        status: 'Ditolak'
    },
    {
        id: 'PA-004',
        peminjam: 'Rina',
        alat: 'Printer',
        tanggal_pinjam: '13-09-2026',
        tanggal_kembali: '15-09-2026',
        keperluan: 'Tugas',
        status: 'Dipinjam'
    },
]

const modalTerbuka = ref(false)
const peminjamanTerpilih = ref(null)

const detailPeminjaman = (item) => {
    peminjamanTerpilih.value = item
    modalTerbuka.value = true
}
</script>

<template>
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <Table class="w-full border-collapse">
                <TableHeader class="bg-black hover:bg-black">
                    <TableRow class="border-0 hover:bg-black">
                        <TableHead class="h-12 px-10 text-xs font-semibold text-white">
                            ID
                        </TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">
                            Peminjam
                        </TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">
                            Alat
                        </TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">
                            Tanggal
                        </TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">
                            Keperluan
                        </TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">
                            Status
                        </TableHead>
                        <TableHead class="h-12 text-center text-xs font-semibold text-white">
                            Aksi
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow v-for="id in peminjaman" :key="id.id">
                        <TableCell class="px-10 w-30">{{ id.id }}</TableCell>
                        <TableCell class="w-40">{{ id.peminjam }}</TableCell>
                        <TableCell class="w-33">{{ id.alat }}</TableCell>
                        <TableCell class="w-33">{{ id.tanggal_pinjam }}</TableCell>
                        <TableCell class="w-45">{{ id.keperluan }}</TableCell>
                        <TableCell class="w-20">
                            <span :class="{
                                'text-[#BA3800]': id.status === 'Menunggu',
                                'text-[#03543F]': id.status === 'Disetujui',
                                'text-[#9B1C1C]': id.status === 'Ditolak',
                                'text-[#1E429F]': id.status === 'Dipinjam',
                            }">
                                {{ id.status }}
                            </span>
                        </TableCell>
                        <TableCell>
                            <div class="flex justify-center items-right gap-2">
                                <Button @click="detailPeminjaman(id)" class="gap-2">
                                    Detail
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                </TableBody>

                <TableFooter>
                    <TableRow class="hover:bg-transparent">
                        <TableCell colspan="7" class="p-0">
                            <div class="flex w-full items-center px-10 py-3">
                                <span class="text-sm text-gray-600 whitespace-nowrap">
                                    Menampilkan <span class="font-bold">{{ peminjaman.length }}</span> data peminjaman
                                </span>

                                <div class="ml-auto">
                                    <Pagination :items-per-page="10" :total="peminjaman.length" :default-page="1"
                                        class="w-fit">
                                        <PaginationContent class="flex items-center gap-1">
                                            <PaginationPrevious />
                                            <PaginationItem :value="1" :is-active="true">
                                                1
                                            </PaginationItem>
                                            <PaginationNext />
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    </div>
<DetailPeminjaman
    v-model:open="modalTerbuka"
    :peminjaman="peminjamanTerpilih"
/>
</template>