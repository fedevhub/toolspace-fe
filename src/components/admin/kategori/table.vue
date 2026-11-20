<script setup>
import {
    ChevronLeft,
    ChevronRight,
    Layers,
    Pencil,
    Trash2,
} from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'

defineProps({
    kategori: {
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
</script>

<template>
    <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs">
        <div class="overflow-x-auto">
            <table class="w-full min-w-[750px] border-collapse text-left text-sm">
                <thead>
                    <tr class="border-b border-gray-200 bg-black text-xs font-semibold tracking-wider text-white">
                        <th class="w-32 px-6 py-4">Kode</th>
                        <th class="w-60 px-6 py-4">Nama Kategori</th>
                        <th class="px-6 py-4">Deskripsi</th>
                        <th class="w-32 px-6 py-4 text-center">Aksi</th>
                    </tr>
                </thead>

                <tbody class="divide-y divide-gray-100">
                    <!-- Loading Skeleton -->
                    <template v-if="loading && kategori.length === 0">
                        <tr v-for="n in 5" :key="n" class="animate-pulse">
                            <td class="px-6 py-4">
                                <div class="h-5 w-16 rounded-md bg-gray-100" />
                            </td>
                            <td class="px-6 py-4">
                                <div class="h-4 w-40 rounded bg-gray-100" />
                            </td>
                            <td class="px-6 py-4">
                                <div class="h-4 w-64 rounded bg-gray-100" />
                            </td>
                            <td class="px-6 py-4">
                                <div class="mx-auto h-8 w-20 rounded-lg bg-gray-100" />
                            </td>
                        </tr>
                    </template>

                    <!-- Empty State -->
                    <tr v-else-if="kategori.length === 0">
                        <td colspan="4" class="px-6 py-16 text-center">
                            <div class="flex flex-col items-center justify-center">
                                <Layers :size="44" stroke-width="1.25" class="text-gray-400" />
                                <p class="mt-3 text-base font-semibold text-gray-900">
                                    Tidak ada data kategori
                                </p>
                                <p class="mt-1 text-sm text-gray-500">
                                    Belum ada kategori terdaftar atau hasil pencarian tidak ditemukan.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Data Rows -->
                    <tr v-for="item in kategori" v-else :key="item.id" class="transition-colors hover:bg-gray-50/80">
                        <td class="px-6 py-4">
                            <span
                                class="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 font-mono text-xs font-semibold text-gray-700">
                                {{ item.kode_kategori }}
                            </span>
                        </td>
                        <td class="px-6 py-4 font-semibold text-gray-900">
                            {{ item.nama_kategori }}
                        </td>
                        <td class="px-6 py-4 text-gray-600">
                            {{ item.deskripsi || '-' }}
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex items-center justify-center gap-2">
                                <Button type="button" size="icon" variant="outline" title="Edit kategori"
                                    class="size-8 rounded-lg border-[#dfe3e8] bg-blue-50/60 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                                    @click="emit('edit', item)">
                                    <Pencil :size="14" />
                                </Button>

                                <Button type="button" size="icon" variant="outline" title="Hapus kategori"
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
                kategori
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