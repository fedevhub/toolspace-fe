<script setup>
import { computed, ref, watch } from 'vue'
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import Button from '@/components/ui/button/Button.vue'
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-vue-next'

const props = defineProps({
    peminjaman: {
        type: Array,
        default: () => [],
    },
    loading: Boolean,
})

const emit = defineEmits(['edit', 'delete'])
const halaman = ref(1)
const perHalaman = 10
const jumlahHalaman = computed(() => Math.max(1, Math.ceil(props.peminjaman.length / perHalaman)))
const barisDitampilkan = computed(() => {
    const mulai = (halaman.value - 1) * perHalaman
    return props.peminjaman.slice(mulai, mulai + perHalaman)
})
const rentangAwal = computed(() => props.peminjaman.length ? (halaman.value - 1) * perHalaman + 1 : 0)
const rentangAkhir = computed(() => Math.min(halaman.value * perHalaman, props.peminjaman.length))

watch(() => props.peminjaman, () => {
    halaman.value = 1
})
</script>

<template>
    <div class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div class="overflow-x-auto">
            <Table class="w-full border-collapse">
                <TableHeader class="bg-black hover:bg-black">
                    <TableRow class="border-0 hover:bg-black">
                        <TableHead class="h-12 px-10 text-xs font-semibold text-white">ID</TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">Peminjam</TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">Alat</TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">Tanggal</TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">Jumlah</TableHead>
                        <TableHead class="h-12 text-xs font-semibold text-white">Status</TableHead>
                        <TableHead class="h-12 text-center text-xs font-semibold text-white">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow v-if="loading">
                        <TableCell colspan="7" class="py-8 text-center text-gray-500">Memuat data peminjaman...</TableCell>
                    </TableRow>
                    <TableRow v-else-if="!barisDitampilkan.length">
                        <TableCell colspan="7" class="py-8 text-center text-gray-500">
                            {{ peminjaman.length ? 'Tidak ada peminjaman yang cocok dengan filter.' : 'Belum ada data peminjaman.' }}
                        </TableCell>
                    </TableRow>
                    <template v-else>
                        <TableRow v-for="item in barisDitampilkan" :key="item.id">
                            <TableCell class="w-30 px-10">{{ item.kode_peminjaman }}</TableCell>
                            <TableCell class="w-40 font-medium">{{ item.nama_peminjam }}</TableCell>
                            <TableCell class="w-40">{{ item.alat }}</TableCell>
                            <TableCell class="whitespace-nowrap font-medium">
                                {{ item.tanggal_pinjam }}
                            </TableCell>
                            <TableCell>{{ item.jumlah }}</TableCell>
                            <TableCell>
                                <span :class="{
                                    'font-semibold text-[#BA3800]': item.status === 'Menunggu',
                                    'font-semibold text-[#03543F]': item.status === 'Disetujui',
                                    'font-semibold text-[#9B1C1C]': item.status === 'Ditolak',
                                    'font-semibold text-[#1E429F]': item.status === 'Dipinjam',
                                }">{{ item.status }}</span>
                            </TableCell>
                            <TableCell>
                                <div class="flex items-center justify-center gap-2">
                                    <Button
                                        size="icon"
                                        aria-label="Edit peminjaman"
                                        class="size-8 rounded-full bg-[#E1EFFE] hover:bg-[#d2e7fd]"
                                        @click="emit('edit', item)"
                                    >
                                        <Pencil class="h-4 w-4 text-[#0284C7]" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        aria-label="Hapus peminjaman"
                                        class="size-8 rounded-full bg-[#FEE2E2] hover:bg-[#fdd5d5]"
                                        @click="emit('delete', item)"
                                    >
                                        <Trash2 class="h-4 w-4 text-[#DC2626]" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    </template>
                </TableBody>
                <TableFooter>
                    <TableRow class="hover:bg-transparent">
                        <TableCell colspan="7" class="p-0">
                            <div class="flex w-full items-center px-6 py-3 sm:px-10">
                                <span class="whitespace-nowrap text-sm text-gray-500">
                                    Menampilkan
                                    <span class="font-bold text-gray-800">{{ rentangAwal }}–{{ rentangAkhir }}</span>
                                    dari <span class="font-bold text-gray-800">{{ peminjaman.length }}</span>
                                    data peminjaman
                                </span>
                                <div class="ml-auto flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        class="size-8"
                                        aria-label="Halaman sebelumnya"
                                        :disabled="halaman <= 1"
                                        @click="halaman -= 1"
                                    >
                                        <ChevronLeft :size="16" />
                                    </Button>
                                    <span class="flex size-8 items-center justify-center rounded-md bg-black text-sm font-semibold text-white">
                                        {{ halaman }}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        class="size-8"
                                        aria-label="Halaman berikutnya"
                                        :disabled="halaman >= jumlahHalaman"
                                        @click="halaman += 1"
                                    >
                                        <ChevronRight :size="16" />
                                    </Button>
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    </div>
</template>
