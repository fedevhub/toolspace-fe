<script setup>
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
    total: { type: Number, default: 0 },
    page: { type: Number, default: 1 },
    perPage: { type: Number, default: 10 },
    label: { type: String, default: 'data' },
})
const emit = defineEmits(['update:page'])

const jumlahHalaman = computed(() => Math.max(1, Math.ceil(props.total / props.perPage)))
const dari = computed(() => (props.total ? (props.page - 1) * props.perPage + 1 : 0))
const sampai = computed(() => Math.min(props.page * props.perPage, props.total))
const daftarHalaman = computed(() => {
    const awal = Math.max(1, Math.min(props.page - 2, jumlahHalaman.value - 4))
    const akhir = Math.min(jumlahHalaman.value, awal + 4)
    return Array.from({ length: akhir - awal + 1 }, (_, i) => awal + i)
})

function pindah(halaman) {
    if (halaman >= 1 && halaman <= jumlahHalaman.value) emit('update:page', halaman)
}
</script>

<template>
    <div class="flex items-center justify-between border-t border-gray-100 bg-[#fafafa] px-6 py-4">
        <p class="text-sm text-gray-500">
            Menampilkan <span class="font-bold text-black">{{ dari }} - {{ sampai }}</span> dari
            <span class="font-bold text-black">{{ total }}</span> data {{ label }}
        </p>

        <div class="flex items-center gap-2">
            <button type="button" :disabled="page <= 1" @click="pindah(page - 1)"
                class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 disabled:opacity-40"
                aria-label="Halaman sebelumnya">
                <ChevronLeft :size="16" />
            </button>

            <button v-for="nomor in daftarHalaman" :key="nomor" type="button" @click="pindah(nomor)"
                :class="nomor === page ? 'bg-black text-white' : 'border border-gray-200 bg-white text-gray-600'"
                class="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold">
                {{ nomor }}
            </button>

            <button type="button" :disabled="page >= jumlahHalaman" @click="pindah(page + 1)"
                class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 disabled:opacity-40"
                aria-label="Halaman berikutnya">
                <ChevronRight :size="16" />
            </button>
        </div>
    </div>
</template>