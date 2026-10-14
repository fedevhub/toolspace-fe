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
import DetailAlat from '@/components/admin/alat/alat-detail.vue'
import { ref } from 'vue'

const modalTerbuka = ref(false)
const alatTerpilih = ref(null)

const alat = [
    { 
        kode_alat: 'KA-001', 
        nama_alat: 'Laptop Asus', 
        kategori: 'Elektronik', 
        jumlah: '10', 
        tersedia: '8', 
        status: 'Tersedia'
    },
    { 
        kode_alat: 'KA-002', 
        nama_alat: 'Proyektor', 
        kategori: 'Elektronik', 
        jumlah: '5', 
        tersedia: '4', 
        status: 'Tersedia'
    },
    { 
        kode_alat: 'KA-003', 
        nama_alat: 'Stop Kontak', 
        kategori: 'Peralatan', 
        jumlah: '8', 
        tersedia: '8', 
        status: 'Tersedia'
    },
    { 
        kode_alat: 'KA-004', 
        nama_alat: 'Printer', 
        kategori: 'Peralatan Kantor', 
        jumlah: '4', 
        tersedia: '0', 
        status: 'Habis'
    },
]

const detailAlat = (item) => {
    alatTerpilih.value = item
    modalTerbuka.value = true
}

const editAlat = (item) => {
    console.log('Edit:', item.nama_alat)
}

const hapusAlat = (item) => {
    console.log('Hapus:', item.nama_alat)
}
</script>

<template>
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <Table class="w-full border-collapse">
                <TableHeader class="bg-black hover:bg-black">
                    <TableRow class="border-0 hover:bg-black">
                        <TableHead class="h-12 px-10 text-xs font-semibold text-white">
                            Kode Alat
                        </TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">
                            Nama Alat
                        </TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">
                            Kategori
                        </TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">
                            Jumlah
                        </TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">
                            Tersedia
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
                    <TableRow v-for="kode_alat in alat" :key="kode_alat.kode_alat">
                        <TableCell class="px-10 w-30">{{ kode_alat.kode_alat }}</TableCell>
                        <TableCell class="w-45">{{ kode_alat.nama_alat }}</TableCell>
                        <TableCell class="w-40">{{ kode_alat.kategori }}</TableCell>
                        <TableCell class="">{{ kode_alat.jumlah }}</TableCell>
                        <TableCell>{{ kode_alat.tersedia }}</TableCell>
                        <TableCell>
                            <span :class="{
                                'text-[#0284C7]': kode_alat.status === 'Tersedia',
                                'text-[#DC2626]': kode_alat.status === 'Habis',
                            }">
                                {{ kode_alat.status }}
                            </span>
                        </TableCell>
                        <TableCell>
                            <div class="flex justify-center items-right gap-2">
                                <Button
                                    size="icon"
                                    class="rounded-full bg-[#DEF7EC] hover:bg-[#d2e7fd]"
                                    @click="detailAlat(kode_alat)"
                                >
                                    <Eye class="h-4 w-4 text-[#03543F]" />
                                </Button>

                                <Button
                                    size="icon"
                                    class="bg-[#E1EFFE] rounded-full hover:bg-[#d2e7fd]"
                                    @click="editAlat(kode_alat)"
                                >
                                    <Pencil class="h-4 w-4 text-[#0284C7]" />
                                </Button>

                                <Button
                                    size="icon"
                                    class="bg-[#FEE2E2] rounded-full hover:bg-[#fdd5d5]"
                                    @click="hapusAlat(kode_alat)"
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
                                    Menampilkan <span class="font-bold">{{ alat.length }}</span> data alat
                                </span>

                                <div class="ml-auto">
                                    <Pagination
                                        :items-per-page="10"
                                        :total="alat.length"
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

<DetailAlat
    v-model:open="modalTerbuka"
    :alat="alatTerpilih"
/>
</template>