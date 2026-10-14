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
import { Eye, Pencil, Trash2 } from 'lucide-vue-next'

const pengguna = [
    { 
        id: 'US-001', 
        nama: 'Budi', 
        username: 'budi01', 
        email: 'budi@gmail.com', 
        role: 'Admin', 
        status: 'Aktif'
    },
    { 
        id: 'US-002', 
        nama: 'Siti', 
        username: 'siti02', 
        email: 'siti@gmail.com', 
        role: 'Petugas', 
        status: 'Aktif'},
    { 
        id: 'US-003', 
        nama: 'Andi', 
        username: 'andi03', 
        email: 'andi@gmail.com', 
        role: 'Peminjam', 
        status: 'Aktif'},
    { 
        id: 'US-004', 
        nama: 'Rina', 
        username: 'rina04', 
        email: 'rina@gmail.com', 
        role: 'Peminjam', 
        status: 'Nonaktif'
    },
]

const editPengguna = (item) => {
    console.log('Edit:', item.nama)
}

const hapusPengguna = (item) => {
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
                            Id
                        </TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">
                            Nama Lengkap
                        </TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">
                            Username
                        </TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">
                            Email
                        </TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">
                            Role
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
                    <TableRow v-for="id in pengguna" :key="id.id">
                        <TableCell class="px-10 w-30">{{ id.id }}</TableCell>
                        <TableCell class="w-40">{{ id.nama }}</TableCell>
                        <TableCell class="w-30">{{ id.username }}</TableCell>
                        <TableCell class="w-40">{{ id.email }}</TableCell>
                        <TableCell>
                            <span :class="{
                                'text-[#03543F] bg-[#DEF7EC] py-1 px-3 rounded-lg font-medium': id.role === 'Admin',
                                'text-[#1E429F] bg-[#E1EFFE] py-1 px-3 rounded-lg font-medium': id.role === 'Petugas',
                                'text-[#9B1C1C] bg-[#FDE8E8] py-1 px-3 rounded-lg font-medium': id.role === 'Peminjam',
                            }">
                                {{ id.role }}
                            </span>
                        </TableCell>
                        <TableCell>
                            <span :class="{
                                'text-[#0284C7]': id.status === 'Aktif',
                                'text-[#DC2626]': id.status === 'Nonaktif',
                            }">
                                {{ id.status }}
                            </span>
                        </TableCell>
                        <TableCell>
                            <div class="flex justify-center items-right gap-2">
                                <Button
                                    size="icon"
                                    class="bg-[#E1EFFE] rounded-full hover:bg-[#d2e7fd]"
                                    @click="editPengguna(item)"
                                >
                                    <Pencil class="h-4 w-4 text-[#0284C7]" />
                                </Button>

                                <Button
                                    size="icon"
                                    class="bg-[#FEE2E2] rounded-full hover:bg-[#fdd5d5]"
                                    @click="hapusPengguna(item)"
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
                                    Menampilkan <span class="font-bold">{{ pengguna.length }}</span> data pengguna
                                </span>

                                <div class="ml-auto">
                                    <Pagination
                                        :items-per-page="10"
                                        :total="pengguna.length"
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