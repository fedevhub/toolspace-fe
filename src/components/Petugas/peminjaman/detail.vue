<script setup>
import { computed, ref, watch } from 'vue'
import { Check, X } from 'lucide-vue-next'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import Button from '@/components/ui/button/Button.vue'
import { detailPeminjaman } from '@/services/peminjamanService'

const props = defineProps({
    open: Boolean,
    peminjaman: { type: Object, default: null },
    loading: Boolean,
    errorMessage: { type: String, default: '' },
})
const emit = defineEmits(['update:open', 'ubah-status'])

const gambar = ref('')

watch(
    () => [props.open, props.peminjaman],
    async ([buka, item]) => {
        if (!buka || !item) return
        gambar.value = ''
        try {
            const response = await detailPeminjaman(item.id)
            gambar.value = response.data.gambar || ''
        } catch (error) {
            console.error('Gagal mengambil gambar alat:', error)
        }
    },
    { immediate: true }
)

const baris = computed(() => {
    const item = props.peminjaman
    if (!item) return []
    return [
        ['Nama peminjam', item.nama_peminjam],
        ['Alat', item.alat],
        ['Jumlah', item.jumlah],
        ['Tanggal Pinjam', item.tanggal_pinjam],
        ['Tanggal Kembali', item.tanggal_kembali],
        ['Keperluan', item.keperluan || '-'],
    ]
})
</script>

<template>
    <Dialog :open="open" @update:open="emit('update:open', $event)">
        <DialogContent :show-close-button="false"
            class="w-[95vw] gap-0 overflow-hidden rounded-[22px] border border-gray-200 p-0 sm:max-w-[790px]"
            style="font-family: 'DM Sans', Arial, sans-serif">
            <DialogHeader class="flex flex-row items-center justify-between border-b border-gray-300 px-12 py-6">
                <DialogTitle class="font-display text-xl uppercase">Detail Pengajuan Peminjaman</DialogTitle>
                <DialogDescription class="sr-only">Detail pengajuan peminjaman alat</DialogDescription>
                <button type="button" class="text-black hover:text-gray-500" aria-label="Tutup"
                    @click="emit('update:open', false)">
                    <X :size="28" :stroke-width="3" />
                </button>
            </DialogHeader>

            <div v-if="peminjaman" class="px-12 pt-7 pb-8">
                <div class="flex items-start justify-between gap-8">
                    <div class="space-y-3 text-[15px]">
                        <div v-for="[label, nilai] in baris" :key="label" class="grid grid-cols-[130px_16px_1fr]">
                            <span class="text-gray-500">{{ label }}</span>
                            <span>:</span>
                            <span class="font-medium">{{ nilai }}</span>
                        </div>
                    </div>

                    <div
                        class="flex h-[206px] w-[206px] shrink-0 items-center justify-center overflow-hidden rounded-[22px] border-[8px] border-gray-100 bg-white">
                        <img v-if="gambar" :src="gambar" :alt="peminjaman.alat" class="h-full w-full object-contain" />
                        <span v-else class="px-2 text-center text-xs text-gray-400">Gambar tidak tersedia</span>
                    </div>
                </div>

                <p v-if="errorMessage" role="alert" class="mt-4 text-sm text-red-600">{{ errorMessage }}</p>

                <div v-if="peminjaman.status === 'Menunggu'" class="mt-6 flex justify-end gap-3">
                    <Button variant="outline" class="h-11 gap-2 border-black px-6 text-black hover:bg-gray-100"
                        :disabled="loading" @click="emit('ubah-status', 'Ditolak')">
                        <X :size="18" /> Tolak
                    </Button>
                    <Button class="h-11 gap-2 px-6" :disabled="loading" @click="emit('ubah-status', 'Disetujui')">
                        <Check :size="18" /> Setujui
                    </Button>
                </div>
                <p v-else class="mt-6 text-right text-sm text-gray-500">
                    Pengajuan ini sudah <span class="font-bold">{{ peminjaman.status }}</span>.
                </p>
            </div>
        </DialogContent>
    </Dialog>
</template>