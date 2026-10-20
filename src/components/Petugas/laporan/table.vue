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

const laporan = [
    {
        id: 'LA-001',
        peminjam: 'Andi',
        alat: 'Laptop Asus',
        tanggal_pinjam: '10-09-2026',
        batas_kembali: '13-09-2026',
        tanggal_kembali: '15-09-2026',
        status: 'Terlambat',
        denda: '30.000'

    },
    {
        id: 'LA-002',
        peminjam: 'Budi',
        alat: 'Proyektor',
        tanggal_pinjam: '11-09-2026',
        batas_kembali: '13-09-2026',
        tanggal_kembali: '-',
        status: 'Selesai',
        denda: '0'
    },
    {
        id: 'LA-003',
        peminjam: 'Siti',
        alat: 'Stop Kontak',
        tanggal_pinjam: '12-09-2026',
        batas_kembali: '13-09-2026',
        tanggal_kembali: '15-09-2026',
        status: 'Selesai',
        denda: '0'
    },
    {
        id: 'LA-004',
        peminjam: 'Rina',
        alat: 'Printer',
        tanggal_pinjam: '13-09-2026',
        batas_kembali: '13-09-2026',
        tanggal_kembali: '-',
        status: 'Selesai',
        denda: '0'
    },
]
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
                            Tanggal Pinjam
                        </TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">
                            Batas Kembali
                        </TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">
                            Tanggal Kembali
                        </TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">
                            Status
                        </TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">
                            Denda
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow v-for="id in laporan" :key="id.id">
                        <TableCell class="px-10 w-30 h-12">{{ id.id }}</TableCell>
                        <TableCell class="w-35">{{ id.peminjam }}</TableCell>
                        <TableCell class="w-30">{{ id.alat }}</TableCell>
                        <TableCell class="w-30">{{ id.tanggal_pinjam }}</TableCell>
                        <TableCell class="w-30">{{ id.batas_kembali }}</TableCell>
                        <TableCell class="w-33">{{ id.tanggal_kembali }}</TableCell>
                        <TableCell class="w-30">
                            <span :class="{
                                'text-[#03543F]': id.status === 'Selesai',
                                'text-[#9B1C1C]': id.status === 'Terlambat',
                            }">
                                {{ id.status }}
                            </span>
                        </TableCell>
                        <TableCell>{{ id.denda }}</TableCell>
                    </TableRow>
                </TableBody>

                <TableFooter>
                    <TableRow class="hover:bg-transparent">
                        <TableCell colspan="9" class="p-0">
                            <div class="flex w-full items-center px-10 py-3">
                                <span class="text-sm text-gray-600 whitespace-nowrap">
                                    Menampilkan <span class="font-bold">{{ laporan.length }}</span> data laporan
                                </span>

                                <div class="ml-auto">
                                    <Pagination :items-per-page="10" :total="laporan.length" :default-page="1"
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
</template>