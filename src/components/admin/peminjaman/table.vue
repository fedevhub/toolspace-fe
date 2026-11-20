<script setup>
import {
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Pencil,
    Trash2,
} from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'

defineProps({
    peminjaman: {
        type: Array,
        default: () => [],
    },
    loading: {
        type: Boolean,
        default: false,
    },
    halamanSaatIni: {
        type: Number,
        default: 1,
    },
    totalHalaman: {
        type: Number,
        default: 1,
    },
    infoRentang: {
        type: Object,
        default: () => ({ mulai: 0, akhir: 0, total: 0 }),
    },
})

const emit = defineEmits(['edit', 'delete', 'ganti-halaman'])

function statusBadgeClass(status) {
    const map = {
        menunggu: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
        disetujui: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
        dipinjam: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20',
        ditolak: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
    }
    return map[String(status ?? '').toLowerCase()] ?? 'bg-gray-100 text-gray-700'
}
</script>

<template>
    <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs">
        <div class="overflow-x-auto">
            <table class="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead>
                    <tr class="border-b border-gray-200 bg-black text-xs font-semibold tracking-wider text-white">
                        <th class="w-36 px-6 py-4">Kode</th>
                        <th class="px-6 py-4">Peminjam</th>
                        <th class="px-6 py-4">Alat</th>
                        <th class="px-6 py-4">Tanggal Pinjam</th>
                        <th class="px-6 py-4 text-center">Jumlah</th>
                        <th class="px-6 py-4">Status</th>
                        <th class="w-32 px-6 py-4 text-center">Aksi</th>
                    </tr>
                </thead>

                <tbody class="divide-y divide-gray-100">
                    <!-- Loading Skeleton -->
                    <template v-if="loading && peminjaman.length === 0">
                        <tr v-for="n in 5" :key="n" class="animate-pulse">
                            <td class="px-6 py-4">
                                <div class="h-5 w-20 rounded-md bg-gray-100" />
                            </td>
                            <td class="px-6 py-4">
                                <div class="h-4 w-36 rounded bg-gray-100" />
                            </td>
                            <td class="px-6 py-4">
                                <div class="h-4 w-36 rounded bg-gray-100" />
                            </td>
                            <td class="px-6 py-4">
                                <div class="h-4 w-24 rounded bg-gray-100" />
                            </td>
                            <td class="px-6 py-4">
                                <div class="mx-auto h-4 w-10 rounded bg-gray-100" />
                            </td>
                            <td class="px-6 py-4">
                                <div class="h-6 w-20 rounded-full bg-gray-100" />
                            </td>
                            <td class="px-6 py-4">
                                <div class="mx-auto h-8 w-20 rounded-lg bg-gray-100" />
                            </td>
                        </tr>
                    </template>

                    <!-- Empty State -->
                    <tr v-else-if="peminjaman.length === 0">
                        <td colspan="7" class="px-6 py-16 text-center">
                            <div class="flex flex-col items-center justify-center">
                                <ClipboardList :size="44" stroke-width="1.25" class="text-gray-400" />
                                <p class="mt-3 text-base font-semibold text-gray-900">
                                    Tidak ada data peminjaman
                                </p>
                                <p class="mt-1 text-sm text-gray-500">
                                    Belum ada pengajuan peminjaman atau hasil filter tidak ditemukan.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Data Rows -->
                    <tr v-for="item in peminjaman" v-else :key="item.id" class="transition-colors hover:bg-gray-50/80">
                        <td class="px-6 py-4">
                            <span
                                class="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 font-mono text-xs font-semibold text-gray-700">
                                {{ item.kode_peminjaman }}
                            </span>
                        </td>
                        <td class="px-6 py-4 font-semibold text-gray-900">
                            {{ item.nama_peminjam }}
                        </td>
                        <td class="px-6 py-4 text-gray-700">
                            {{ item.alat }}
                        </td>
                        <td class="whitespace-nowrap px-6 py-4 text-gray-600">
                            {{ item.tanggal_pinjam }}
                        </td>
                        <td class="px-6 py-4 text-center font-semibold text-gray-900">
                            {{ item.jumlah }}
                        </td>
                        <td class="px-6 py-4">
                            <span
                                class="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap"
                                :class="statusBadgeClass(item.status)">
                                {{ item.status }}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex items-center justify-center gap-2">
                                <Button type="button" size="icon" variant="outline" title="Edit peminjaman"
                                    aria-label="Edit peminjaman"
                                    class="size-8 rounded-lg border-[#dfe3e8] bg-blue-50/60 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                                    @click="emit('edit', item)">
                                    <Pencil :size="14" />
                                </Button>

                                <Button type="button" size="icon" variant="outline" title="Hapus peminjaman"
                                    aria-label="Hapus peminjaman"
                                    class="size-8 rounded-lg border-[#dfe3e8] bg-red-50/60 text-red-600 hover:bg-red-100 hover:text-red-700"
                                    @click="emit('delete', item)">
                                    <Trash2 :size="14" />
                                </Button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination Footer -->
        <div v-if="!loading && infoRentang.total > 0"
            class="flex flex-col items-center justify-between gap-4 border-t border-gray-100 bg-white px-6 py-4 sm:flex-row">
            <p class="text-xs text-gray-500">
                Menampilkan
                <span class="font-semibold text-gray-900">{{ infoRentang.mulai }}</span>
                –
                <span class="font-semibold text-gray-900">{{ infoRentang.akhir }}</span>
                dari
                <span class="font-semibold text-gray-900">{{ infoRentang.total }}</span>
                peminjaman
            </p>

            <div class="flex items-center gap-1.5">
                <Button type="button" variant="outline" size="sm"
                    class="h-8 rounded-lg border-[#dfe3e8] px-2.5 text-xs font-semibold text-gray-700 disabled:opacity-40"
                    :disabled="halamanSaatIni <= 1" @click="emit('ganti-halaman', halamanSaatIni - 1)">
                    <ChevronLeft :size="15" class="mr-0.5" />
                    Sebelumnya
                </Button>

                <button v-for="nomor in totalHalaman" :key="nomor" type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors"
                    :class="halamanSaatIni === nomor
                            ? 'bg-black text-white'
                            : 'border border-[#dfe3e8] bg-white text-gray-700 hover:bg-gray-50'
                        " @click="emit('ganti-halaman', nomor)">
                    {{ nomor }}
                </button>

                <Button type="button" variant="outline" size="sm"
                    class="h-8 rounded-lg border-[#dfe3e8] px-2.5 text-xs font-semibold text-gray-700 disabled:opacity-40"
                    :disabled="halamanSaatIni >= totalHalaman" @click="emit('ganti-halaman', halamanSaatIni + 1)">
                    Berikutnya
                    <ChevronRight :size="15" class="ml-0.5" />
                </Button>
            </div>
        </div>
    </section>
</template>