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

import Button from '@/components/ui/button/Button.vue';
import { Pencil, Trash2 } from 'lucide-vue-next'

const peminjaman = [
    { 
        id: 'PA-001', 
        peminjaman: 'Andi', 
        alat: 'Laptop Asus', 
        tanggal: '10-09-2026', 
        jumlah: '1', 
        status: 'Menunggu'
    },
        { 
        id: 'PA-002', 
        peminjaman: 'Budi', 
        alat: 'Proyektor', 
        tanggal: '11-09-2026', 
        jumlah: '1', 
        status: 'Disetujui'
    },
    { 
        id: 'PA-003', 
        peminjaman: 'Siti', 
        alat: 'Stop Kontak', 
        tanggal: '12-09-2026', 
        jumlah: '3', 
        status: 'Ditolak'
    },
    { 
        id: 'PA-004', 
        peminjaman: 'Rina', 
        alat: 'Printer', 
        tanggal: '13-09-2026', 
        jumlah: '1', 
        status: 'Dipinjam'
    },
]

const editPeminjaman = (item) => {
    console.log('Edit:', item.nama)
}

const hapusPeminjaman = (item) => {
    console.log('Hapus:', item.nama)
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
                            Jumlah
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
                        <TableCell class="w-45">{{ id.peminjaman }}</TableCell>
                        <TableCell class="w-40">{{ id.alat }}</TableCell>
                        <TableCell class="">{{ id.tanggal }}</TableCell>
                        <TableCell>{{ id.jumlah }}</TableCell>
                        <TableCell>
                            <span :class="{
                                'text-[#0284C7]': id.status === 'Tersedia',
                                'text-[#DC2626]': id.status === 'Habis',
                            }">
                                {{ id.status }}
                            </span>
                        </TableCell>
                        <TableCell>
                            <div class="flex justify-center items-right gap-2">
                                <Button
                                    size="icon"
                                    class="bg-[#E1EFFE] rounded-full hover:bg-[#d2e7fd]"
                                    @click="editPeminjaman(item)"
                                >
                                    <Pencil class="h-4 w-4 text-[#0284C7]" />
                                </Button>

                                <Button
                                    size="icon"
                                    class="bg-[#FEE2E2] rounded-full hover:bg-[#fdd5d5]"
                                    @click="hapusPeminjaman(item)"
                                >
                                    <Trash2 class="h-4 w-4 text-[#DC2626]" />
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
                                    <Pagination
                                        :items-per-page="10"
                                        :total="peminjaman.length"
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