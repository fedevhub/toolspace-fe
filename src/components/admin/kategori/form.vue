<script setup>
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Button from '@/components/ui/button/Button.vue'
import { X, Save } from 'lucide-vue-next'

import { computed, ref, watch } from 'vue';
import {
    editKategori,
    reserveKodeKategori,
    tambahKategori,
} from '@/services/kategoriService'

const props = defineProps({
    open: Boolean,
    kategori: {
        type: Object,
        default: null,
    },
})

const emit = defineEmits(['update:open', 'saved'])

const kategoriId = computed(() => props.kategori?.id)
const isEditMode = computed(() => Boolean(kategoriId.value))
const loading = ref(false)
const errorMessage = ref('')
const form = ref({
    kode_kategori: '',
    reservation_token: '',
    nama_kategori: '',
    deskripsi: '',
});

async function ambilKodeBerikutnya() {
    const response = await reserveKodeKategori()
    form.value.kode_kategori = response.data.kode_kategori
    form.value.reservation_token = response.data.token
}

async function siapkanForm() {
    errorMessage.value = ''
    loading.value = true
    try {
        if (isEditMode.value) {
            form.value = {
                kode_kategori: props.kategori.kode_kategori ?? '',
                reservation_token: '',
                nama_kategori: props.kategori.nama_kategori ?? '',
                deskripsi: props.kategori.deskripsi ?? '',
            }
        } else {
            form.value = {
                kode_kategori: '',
                reservation_token: '',
                nama_kategori: '',
                deskripsi: '',
            }
            await ambilKodeBerikutnya()
        }
    } catch (error) {
        console.error('Gagal memuat form kategori:', error)
        errorMessage.value = error.response?.data?.message ?? 'Gagal memuat data kategori.'
    } finally {
        loading.value = false
    }
}

watch(
    () => [props.open, props.kategori],
    ([open]) => {
        if (open) siapkanForm()
    },
    { immediate: true },
)

async function handleSubmit() {
    errorMessage.value = ''
    if (!form.value.nama_kategori.trim()) {
        errorMessage.value = 'Nama kategori wajib diisi.'
        return
    }

    if (!isEditMode.value && (!form.value.kode_kategori || !form.value.reservation_token)) {
        errorMessage.value = 'ID kategori belum berhasil dicadangkan. Muat ulang halaman untuk mencoba lagi.'
        return
    }

    loading.value = true
    const data = {
        nama_kategori: form.value.nama_kategori.trim(),
        deskripsi: form.value.deskripsi.trim(),
        ...(!isEditMode.value
            ? {
                kode_kategori: form.value.kode_kategori,
                reservation_token: form.value.reservation_token,
            }
            : {}),
    }

    try {
        if (isEditMode.value) {
            await editKategori(kategoriId.value, data)
        } else {
            await tambahKategori(data)
        }
        emit('update:open', false)
        emit('saved')
    } catch (error) {
        console.error('Gagal menyimpan kategori:', error)
        errorMessage.value = error.response?.data?.message ?? 'Gagal menyimpan kategori.'
    } finally {
        loading.value = false
    }
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
                    {{ isEditMode ? 'Edit Kategori' : 'Tambah Kategori Baru' }}
                </DialogTitle>
                <DialogDescription class="sr-only">
                    {{ isEditMode ? 'Perbarui informasi kategori.' : 'Isi nama dan deskripsi untuk menambahkan kategori baru.' }}
                </DialogDescription>

                <button
                    type="button"
                    class="text-black hover:text-gray-500"
                    @click="emit('update:open', false)"
                >
                    <X :size="24" />
                </button>
            </DialogHeader>

            <form @submit.prevent="handleSubmit">
                <div v-if="loading" class="py-4 text-gray-500">Memuat data kategori...</div>
                <div v-else class="space-y-5 p-8">
                    <div>
                        <label
                            for="nama_kategori"
                            class="mb-2 block text-sm font-medium text-gray-800"
                        >
                            Nama Kategori <span class="text-red-600">*</span>
                        </label>

                        <Input
                            id="nama_kategori"
                            v-model="form.nama_kategori"
                            placeholder="Masukkan nama kategori"
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
                            v-model="form.deskripsi"
                            placeholder="Masukkan deskripsi kategori"
                        />
                    </div>
                </div>

                <p v-if="errorMessage" role="alert" class="mt-4 text-sm text-red-600">
                    {{ errorMessage }}
                </p>

                <DialogFooter class="border-t border-gray-200 px-8 py-4">
                    <Button type="submit" :disabled="loading || (!isEditMode && !form.reservation_token)">
                        <Save :size="18" />
                        {{ loading ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambah Kategori' }}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>