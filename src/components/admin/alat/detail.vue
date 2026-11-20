<script setup>
import { Package, X } from 'lucide-vue-next'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import Button from '@/components/ui/button/Button.vue'

defineProps({
    open: Boolean,
    alat: {
        type: Object,
        default: null,
    },
})

const emit = defineEmits(['update:open'])

function statusBadgeClass(status) {
    return String(status ?? '').toLowerCase() === 'tersedia'
        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
        : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
}
</script>

<template>
    <Dialog :open="open" @update:open="emit('update:open', $event)">
        <DialogContent class="w-[95vw] gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-3xl [&>button]:hidden">
            <!-- Header -->
            <DialogHeader class="flex flex-row items-center justify-between border-b border-gray-100 px-6 py-5 sm:px-8">
                <DialogTitle class="font-display text-lg font-bold tracking-wide text-gray-900 sm:text-xl">
                    DETAIL ALAT
                </DialogTitle>

                <button type="button"
                    class="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    aria-label="Tutup modal" @click="emit('update:open', false)">
                    <X :size="20" />
                </button>
            </DialogHeader>

            <div v-if="alat" class="px-6 py-7 sm:px-8">
                <div class="grid items-center gap-8 sm:grid-cols-[230px_1fr]">
                    <!-- Gambar Alat -->
                    <div
                        class="flex h-52 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-gray-100 bg-[#F8F9FA] p-4 sm:h-56">
                        <img v-if="alat.gambar" :src="alat.gambar" :alt="alat.nama_alat"
                            class="h-full w-full object-contain" />
                        <Package v-else :size="64" stroke-width="1.35" class="text-gray-400" />
                    </div>

                    <!-- Spesifikasi Detail -->
                    <dl class="grid grid-cols-[120px_14px_1fr] gap-y-3.5 text-sm">
                        <dt class="text-gray-500">Nama Alat</dt>
                        <span class="text-gray-400">:</span>
                        <dd class="font-semibold text-gray-900">{{ alat.nama_alat }}</dd>

                        <dt class="text-gray-500">Kode Alat</dt>
                        <span class="text-gray-400">:</span>
                        <dd class="font-mono font-semibold text-gray-900">{{ alat.kode_alat }}</dd>

                        <dt class="text-gray-500">Kategori</dt>
                        <span class="text-gray-400">:</span>
                        <dd class="font-semibold text-gray-900">{{ alat.kategori }}</dd>

                        <dt class="text-gray-500">Total Stok</dt>
                        <span class="text-gray-400">:</span>
                        <dd class="font-semibold text-gray-900">{{ alat.jumlah }} unit</dd>

                        <dt class="text-gray-500">Tersedia</dt>
                        <span class="text-gray-400">:</span>
                        <dd class="font-semibold text-gray-900">{{ alat.tersedia }} unit</dd>

                        <dt class="text-gray-500">Kondisi</dt>
                        <span class="text-gray-400">:</span>
                        <dd class="font-semibold text-gray-900">{{ alat.kondisi || '-' }}</dd>

                        <dt class="text-gray-500">Status</dt>
                        <span class="text-gray-400">:</span>
                        <dd>
                            <span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold"
                                :class="statusBadgeClass(alat.status)">
                                {{ alat.status }}
                            </span>
                        </dd>

                        <dt class="text-gray-500">Deskripsi</dt>
                        <span class="text-gray-400">:</span>
                        <dd class="font-medium leading-relaxed text-gray-800">
                            {{ alat.deskripsi || '-' }}
                        </dd>
                    </dl>
                </div>

                <!-- Footer Tombol Tutup -->
                <div class="mt-7 flex justify-end border-t border-gray-100 pt-5">
                    <Button type="button" variant="outline"
                        class="h-10 rounded-xl border-[#dfe3e8] px-4 font-semibold text-gray-700"
                        @click="emit('update:open', false)">
                        <X :size="16" class="mr-1.5" />
                        Tutup
                    </Button>
                </div>
            </div>
        </DialogContent>
    </Dialog>
</template>