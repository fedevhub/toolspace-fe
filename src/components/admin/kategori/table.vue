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
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'

import Button from '@/components/ui/button/Button.vue';
import { Eye, Pencil, Trash2 } from 'lucide-vue-next';

defineProps({
    kategori: {
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
const kategoriTerpilih = ref(null)
const memuatDetail = ref(false)

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
                            Nama Kategori
                        </TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">
                            Deskripsi
                        </TableHead>
                        <TableHead class="h-12 text-center text-xs font-semibold text-white">
                            Aksi
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow v-for="item in kategori" :key="item.id">
                        <TableCell class="px-10 w-30">{{ item.kode_kategori }}</TableCell>
                        <TableCell class="w-55">{{ item.nama_kategori }}</TableCell>
                        <TableCell class="w-115">{{ item.deskripsi }}</TableCell>
                        <TableCell>
                            <div class="flex justify-center items-right gap-2">
                                <Button
                                    size="icon"
                                    class="bg-[#E1EFFE] rounded-full hover:bg-[#d2e7fd]"
                                    @click="emit('edit', item)"
                                >
                                    <Pencil class="h-4 w-4 text-[#0284C7]" />
                                </Button>

                                <Button
                                    size="icon"
                                    class="bg-[#FEE2E2] rounded-full hover:bg-[#fdd5d5]"
                                    @click="emit('delete', item)"
                                >
                                    <Trash2 class="h-4 w-4 text-[#DC2626]" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                    <TableRow v-if="loading && kategori.length === 0">
                        <TableCell colspan="7" class="py-6 text-center text-gray-500">
                            Memuat data kategori...
                        </TableCell>
                    </TableRow>
                    <TableRow v-else-if="kategori.length === 0">
                        <TableCell colspan="7" class="py-6 text-center text-gray-500">
                            Belum ada data kategori.
                        </TableCell>
                    </TableRow>
                </TableBody>

                <TableFooter>
                    <TableRow class="hover:bg-transparent">
                        <TableCell colspan="7" class="p-0">
                            <div class="flex w-full items-center px-10 py-3">
                                <span class="text-sm text-gray-600 whitespace-nowrap">
                                    Menampilkan <span class="font-bold">{{ kategori.length }}</span> data kategori
                                </span>

                                <div class="ml-auto">
                                    <Pagination
                                        :items-per-page="10"
                                        :total="kategori.length"
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