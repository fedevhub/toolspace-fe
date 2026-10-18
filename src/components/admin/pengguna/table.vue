<script setup>
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'

import Button from '@/components/ui/button/Button.vue'
import { Pencil, Trash2 } from 'lucide-vue-next'

defineProps({
    pengguna: {
        type: Array,
        default: () => [],
    },
})

const emit = defineEmits(['edit', 'delete'])

const editPengguna = (item) => {
    emit('edit', item)
}

const hapusPengguna = (item) => {
    emit('delete', item.id)
}
</script>

<template>
    <div
        class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
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

                        <TableHead class="h-12 text-center text-xs font-semibold text-white">
                            Aksi
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    <TableRow
                        v-for="item in pengguna"
                        :key="item.id"
                    >
                        <TableCell class="px-10 w-0">
                            {{ item.id }}
                        </TableCell>

                        <TableCell class="w-45">
                            {{ item.nama_lengkap }}
                        </TableCell>

                        <TableCell class="w-40">
                            {{ item.username }}
                        </TableCell>

                        <TableCell class="w-55">
                            {{ item.email }}
                        </TableCell>

                        <TableCell class="w-35">
                            <span
                                :class="{
                                    'inline-block rounded-lg bg-[#DEF7EC] px-3 py-1 text-[#03543F]':
                                        item.role?.toLowerCase() === 'admin',

                                    'inline-block rounded-lg bg-[#E1EFFE] px-3 py-1 text-[#1E429F]':
                                        item.role?.toLowerCase() === 'petugas',

                                    'inline-block rounded-lg bg-[#FDE8E8] px-3 py-1 text-[#9B1C1C]':
                                        item.role?.toLowerCase() === 'peminjam',
                                }"
                            >
                                {{ item.role }}
                            </span>
                        </TableCell>

                        <TableCell>
                            <div class="flex justify-center items-center gap-2">
                                <Button
                                    size="icon"
                                    class="bg-[#E1EFFE] rounded-full hover:bg-[#d2e7fd]"
                                    @click="editPengguna(item)"
                                >
                                    <Pencil
                                        class="h-4 w-4 text-[#0284C7]"
                                    />
                                </Button>

                                <Button
                                    size="icon"
                                    class="bg-[#FEE2E2] rounded-full hover:bg-[#fdd5d5]"
                                    @click="hapusPengguna(item)"
                                >
                                    <Trash2
                                        class="h-4 w-4 text-[#DC2626]"
                                    />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>

                    <TableRow v-if="pengguna.length === 0">
                        <TableCell
                            colspan="6"
                            class="py-6 text-center text-gray-500"
                        >
                            Belum ada data pengguna.
                        </TableCell>
                    </TableRow>
                </TableBody>

                <TableFooter>
                    <TableRow class="hover:bg-transparent">
                        <TableCell colspan="6" class="p-0">
                            <div class="flex w-full items-center px-10 py-3">
                                <span class="text-sm text-gray-600 whitespace-nowrap">
                                    Menampilkan
                                    <span class="font-bold">
                                        {{ pengguna.length }}
                                    </span>
                                    data pengguna
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

                                            <PaginationItem
                                                :value="1"
                                                :is-active="true"
                                            >
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
