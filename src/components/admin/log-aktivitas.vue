<script setup>
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


const aktivitas = [
    { 
        id: 'LA-001', 
        pengguna: 'Admin', 
        aktivitas: 'Menambahkan alat laptop asus', 
        waktu: '10-09-2026',
    },
    { 
        id: 'LA-002', 
        pengguna: 'Budi', 
        aktivitas: 'Mengajukan peminjaman proyektor', 
        waktu: '11-09-2026',
    },
    { 
        id: 'LA-003', 
        pengguna: 'Petugas', 
        aktivitas: 'Menyetujui peminjaman', 
        waktu: '12-09-2026',
    },
    { 
        id: 'LA-004', 
        pengguna: 'Rina', 
        aktivitas: 'Mengembalikan printer', 
        waktu: '13-09-2026',
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
                            Pengguna
                        </TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">
                            Aktivitas
                        </TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">
                            Waktu
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow v-for="id in aktivitas" :key="id.id">
                        <TableCell class="px-10 w-30 h-12">{{ id.id }}</TableCell>
                        <TableCell class="w-55">{{ id.pengguna }}</TableCell>
                        <TableCell class="w-115">{{ id.aktivitas }}</TableCell>
                        <TableCell>{{ id.waktu }}</TableCell>
                    </TableRow>
                </TableBody>

                <TableFooter>
                    <TableRow class="hover:bg-transparent">
                        <TableCell colspan="7" class="p-0">
                            <div class="flex w-full items-center px-10 py-3">
                                <span class="text-sm text-gray-600 whitespace-nowrap">
                                    Menampilkan <span class="font-bold">{{ aktivitas.length }}</span> data log-aktivitas
                                </span>

                                <div class="ml-auto">
                                    <Pagination
                                        :items-per-page="10"
                                        :total="aktivitas.length"
                                        :default-page="1"
                                        class="w-fit"
                                    >
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