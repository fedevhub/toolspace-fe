<script setup>
import { ClipboardList, Eye } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import PaginationBar from '@/components/Petugas/pagination-bar.vue'

defineProps({
    peminjaman: { type: Array, default: () => [] },
    loading: Boolean,
    total: { type: Number, default: 0 },
    page: { type: Number, default: 1 },
    perPage: { type: Number, default: 8 },
})

const emit = defineEmits(['detail', 'update:page'])

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
                        <th class="px-6 py-4">Tanggal</th>
                        <th class="px-6 py-4">Keperluan</th>
                        <th class="px-6 py-4">Status</th>
                        <th class="w-32 px-6 py-4 text-center">Aksi</th>
                    </tr>
                </thead>

                <tbody class="divide-y divide-gray-100">
                    <!-- Loading Skeleton -->
                    <template v-if="loading && !peminjaman.length">
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
                                <div class="h-4 w-32 rounded bg-gray-100" />
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
                    <tr v-else-if="!peminjaman.length">
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
                        <td class="max-w-[200px] truncate px-6 py-4 text-gray-600" :title="item.keperluan">
                            {{ item.keperluan || '-' }}
                        </td>
                        <td class="px-6 py-4">
                            <span
                                class="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap"
                                :class="statusBadgeClass(item.status)">
                                {{ item.status }}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex justify-center">
                                <Button type="button" size="sm"
                                    class="h-8 gap-1.5 rounded-lg bg-black px-3.5 text-xs font-semibold text-white hover:bg-black/85"
                                    @click="emit('detail', item)">
                                    <Eye :size="14" />
                                    Detail
                                </Button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <PaginationBar :total="total" :page="page" :per-page="perPage" label="peminjaman"
            @update:page="emit('update:page', $event)" />
    </section>
</template>