<script setup>
import { computed, watch, ref } from 'vue'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Button from '@/components/ui/button/Button.vue'
import { X, Save } from 'lucide-vue-next'

const props = defineProps({
    open: Boolean,
    kategori: {
        type: Object,
        default: null,
    },
})

const emit = defineEmits(['update:open', 'save'])

const nama_alat = ref('')
const deskripsi = ref('')

const isEditMode = computed(() => !!props.alat)

watch(
    () => props.alat,
    (alat) => {
        nama_alat.value = alat?.nama_alat ?? ''
        deskripsi.value = alat?.deskripsi ?? ''
    },
    { immediate: true }
)

function simpanAlat() {
    emit('save', {
        nama_alat: nama_alat.value,
        deskripsi: deskripsi.value,
    })

    emit('update:open', false)
}
</script>

<template>
    <Dialog
        :open="open"
        @update:open="emit('update:open', $event)"
    >
        <DialogContent
            class="w-[95vw] sm:max-w-[500px] gap-0 overflow-hidden rounded-[24px] border border-gray-300 p-0"
            :show-close-button="false"
        >
            <DialogHeader
                class="flex flex-row items-center justify-between border-b border-gray-300 px-8 py-6"
            >
                <DialogTitle class="text-2xl font-black">
                    {{ isEditMode ? 'Edit Alat' : 'Tambah Alat Baru' }}
                </DialogTitle>

                <button
                    type="button"
                    class="text-black hover:text-gray-500"
                    @click="emit('update:open', false)"
                >
                    <X :size="24" />
                </button>
            </DialogHeader>

            <form @submit.prevent="simpanAlat">
                <div class="space-y-5 p-8">
                    <div>
                        <label
                            for="nama_alat"
                            class="mb-2 block text-sm font-medium text-gray-800"
                        >
                            Nama Alat <span class="text-red-600">*</span>
                        </label>

                        <Input
                            id="nama_alat"
                            v-model="nama_alat"
                            placeholder="Masukkan nama alat"
                            required
                        />
                    </div>

                    <div>
                        <label
                            for="deskripsi"
                            class="mb-2 block text-sm font-medium text-gray-800"
                        >
                            Deskripsi
                        </label>

                        <Textarea
                            id="deskripsi"
                            v-model="deskripsi"
                            placeholder="Masukkan deskripsi alat"
                        />
                    </div>
                </div>

                <DialogFooter class="border-t border-gray-200 px-8 py-4">
                    <Button type="submit">
                        <Save :size="18" />
                        {{ isEditMode ? 'Simpan Perubahan' : 'Tambah Alat' }}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>