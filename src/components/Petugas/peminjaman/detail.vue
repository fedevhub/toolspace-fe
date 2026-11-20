<script setup>
import { computed, ref, watch } from 'vue'
import { AlertCircle, Check, ImageOff, X } from 'lucide-vue-next'
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
const loadingGambar = ref(false)

watch(
    () => [props.open, props.peminjaman],
    async ([buka, item]) => {
        if (!buka || !item) return
        gambar.value = ''
        loadingGambar.value = true
        try {
            const response = await detailPeminjaman(item.id)
            gambar.value = response.data?.gambar || ''
        } catch (error) {
            console.error('Gagal mengambil gambar alat:', error)
        } finally {
            loadingGambar.value = false
        }
    },
    { immediate: true }
)

const baris = computed(() => {
    const item = props.peminjaman
    if (!item) return []
    return [
        ['Kode Pengajuan', item.kode_peminjaman],
        ['Nama Peminjam', item.nama_peminjam],
        ['Alat', item.alat],
        ['Jumlah', `${item.jumlah} unit`],
        ['Tanggal Pinjam', item.tanggal_pinjam],
        ['Tanggal Kembali', item.tanggal_kembali],
        ['Keperluan', item.keperluan || '-'],
    ]
})

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
    <Dialog :open="open" @update:open="emit('update:open', $event)">
        <DialogContent :show-close-button="false"
            class="w-[95vw] gap-0 overflow-hidden rounded-2xl border border-gray-200 p-0 sm:max-w-[680px]"
            style="font-family: 'DM Sans', Arial, sans-serif">
            <!-- Header -->
            <DialogHeader class="flex flex-row items-center justify-between border-b border-gray-100 px-6 py-5 md:px-8">
                <div>
                    <DialogTitle class="font-display text-lg font-bold tracking-wide text-gray-900 md:text-xl">
                        DETAIL PENGAJUAN PEMINJAMAN
                    </DialogTitle>
                    <DialogDescription class="mt-0.5 text-xs text-[#697386]">
                        Periksa rincian pengajuan sebelum menyetujui atau menolak peminjaman.
                    </DialogDescription>
                </div>

                <button type="button" aria-label="Tutup"
                    class="flex size-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-black"
                    @click="emit('update:open', false)">
                    <X :size="20" />
                </button>
            </DialogHeader>

            <!-- Body -->
            <div v-if="peminjaman" class="px-6 py-6 md:px-8">
                <div class="flex flex-col-reverse items-start justify-between gap-6 sm:flex-row">
                    <!-- Detail List -->
                    <div class="w-full space-y-3 text-sm">
                        <div v-for="[label, nilai] in baris" :key="label"
                            class="grid grid-cols-[135px_12px_1fr] items-baseline">
                            <span class="text-gray-500">{{ label }}</span>
                            <span class="text-gray-400">:</span>
                            <span class="font-semibold text-gray-900">{{ nilai }}</span>
                        </div>

                        <div class="grid grid-cols-[135px_12px_1fr] items-center pt-0.5">
                            <span class="text-gray-500">Status</span>
                            <span class="text-gray-400">:</span>
                            <div>
                                <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold"
                                    :class="statusBadgeClass(peminjaman.status)">
                                    {{ peminjaman.status }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Preview Gambar Alat -->
                    <div
                        class="flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200/80 bg-[#F8F9FA] p-3 sm:h-44 sm:w-44">
                        <div v-if="loadingGambar" class="h-full w-full animate-pulse rounded-xl bg-gray-200/70" />
                        <img v-else-if="gambar" :src="gambar" :alt="peminjaman.alat"
                            class="h-full w-full object-contain" />
                        <div v-else class="flex flex-col items-center gap-1.5 text-center text-gray-400">
                            <ImageOff :size="24" stroke-width="1.5" />
                            <span class="text-[11px] font-medium">Gambar tidak tersedia</span>
                        </div>
                    </div>
                </div>

                <!-- Error Alert -->
                <div v-if="errorMessage" role="alert"
                    class="mt-5 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    <AlertCircle :size="18" class="shrink-0" />
                    <span>{{ errorMessage }}</span>
                </div>

                <!-- Action Footer -->
                <div
                    class="mt-7 flex flex-col-reverse items-center justify-end gap-3 border-t border-gray-100 pt-5 sm:flex-row">
                    <template v-if="peminjaman.status === 'Menunggu'">
                        <Button type="button" variant="outline"
                            class="h-11 w-full gap-2 rounded-xl border-red-200 bg-red-50/50 px-5 font-semibold text-red-600 hover:bg-red-100 hover:text-red-700 sm:w-auto"
                            :disabled="loading" @click="emit('ubah-status', 'Ditolak')">
                            <X :size="17" />
                            Tolak Pengajuan
                        </Button>
                        <Button type="button"
                            class="h-11 w-full gap-2 rounded-xl bg-black px-6 font-semibold text-white hover:bg-black/85 sm:w-auto"
                            :disabled="loading" @click="emit('ubah-status', 'Disetujui')">
                            <Check :size="17" />
                            {{ loading ? 'Memproses...' : 'Setujui Peminjaman' }}
                        </Button>
                    </template>

                    <p v-else class="text-sm text-gray-500">
                        Pengajuan ini sudah berstatus
                        <span class="font-bold text-gray-900">{{ peminjaman.status }}</span>.
                    </p>
                </div>
            </div>
        </DialogContent>
    </Dialog>
</template>