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
import Button from '@/components/ui/button/Button.vue'

defineProps({
    peminjaman: {
        type: Array,
        default: () => [],
    },
    loading: Boolean,
})

const emit = defineEmits(['status-change'])
</script>

<template>
    <div class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div class="overflow-x-auto">
            <Table class="w-full border-collapse">
                <TableHeader class="bg-black hover:bg-black">
                    <TableRow class="border-0 hover:bg-black">
                        <TableHead class="h-12 px-8 text-xs font-semibold text-white">ID</TableHead>
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
                    <TableRow v-else-if="!peminjaman.length">
                        <TableCell colspan="7" class="py-8 text-center text-gray-500">Belum ada data peminjaman.</TableCell>
                    </TableRow>
                    <template v-else>
                        <TableRow v-for="item in peminjaman" :key="item.id">
                            <TableCell class="px-8">{{ item.kode_peminjaman }}</TableCell>
                            <TableCell>{{ item.nama_peminjam }}</TableCell>
                            <TableCell>{{ item.alat }}</TableCell>
                            <TableCell>{{ item.tanggal_pinjam }} - {{ item.tanggal_kembali }}</TableCell>
                            <TableCell>{{ item.jumlah }}</TableCell>
                            <TableCell>
                                <span :class="{
                                    'text-[#BA3800]': item.status === 'Menunggu',
                                    'text-[#03543F]': item.status === 'Disetujui',
                                    'text-[#9B1C1C]': item.status === 'Ditolak',
                                }">{{ item.status }}</span>
                            </TableCell>
                            <TableCell>
                                <div v-if="item.status === 'Menunggu'" class="flex justify-center gap-2">
                                    <Button
                                        size="sm"
                                        :disabled="loading"
                                        @click="emit('status-change', { id: item.id, status: 'Disetujui' })"
                                    >
                                        Setujui
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        :disabled="loading"
                                        @click="emit('status-change', { id: item.id, status: 'Ditolak' })"
                                    >
                                        Tolak
                                    </Button>
                                </div>
                                <span v-else class="text-sm text-gray-500">Selesai</span>
                            </TableCell>
                        </TableRow>
                    </template>
                </TableBody>
                <TableFooter>
                    <TableRow class="hover:bg-transparent">
                        <TableCell colspan="7" class="px-8 py-3 text-sm text-gray-600">
                            Menampilkan <span class="font-bold">{{ peminjaman.length }}</span> data peminjaman
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    </div>
</template>
