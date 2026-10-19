<script setup>
import { ref, computed, watch } from 'vue'
import { Eye, EyeOff, X, Save } from 'lucide-vue-next'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import Button from '@/components/ui/button/Button.vue'

const props = defineProps({
    open: Boolean,
    pengguna: {
        type: Object,
        default: null,
    },
    loading: Boolean,
})

const emit = defineEmits(['update:open', 'save'])

const showPassword = ref(false)

const form = ref({
    nama_lengkap: '',
    username: '',
    email: '',
    password: '',
    role: '',
})

const isEditMode = computed(() => !!props.pengguna?.id)

watch(
    () => [props.open, props.pengguna],
    () => {
        if (!props.open) return

        const user = props.pengguna

        form.value = {
            nama_lengkap: user?.nama_lengkap ?? '',
            username: user?.username ?? '',
            email: user?.email ?? '',
            password: '',
            role: String(user?.role ?? '').toLowerCase(),
        }

        showPassword.value = false
    },
    { immediate: true }
)

function simpanPengguna() {
    emit('save', {
        nama_lengkap: form.value.nama_lengkap,
        username: form.value.username,
        email: form.value.email,
        role: form.value.role,
        ...(!isEditMode.value || form.value.password
            ? { password: form.value.password }
            : {}
        ),
    })
}
</script>

<template>
    <Dialog :open="open" @update:open="emit('update:open', $event)">
        <DialogContent class="w-[95vw] sm:max-w-[650px] gap-0 overflow-hidden rounded-[24px] border border-gray-300 p-0"
            :show-close-button="false">
            <DialogHeader class="flex flex-row items-center justify-between border-b border-gray-300 px-8 py-6">
                <DialogTitle class="text-2xl font-black">
                    {{ isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru' }}
                </DialogTitle>

                <button type="button" class="text-black hover:text-gray-500" aria-label="Tutup modal"
                    @click="emit('update:open', false)">
                    <X :size="24" />
                </button>
            </DialogHeader>

            <form @submit.prevent="simpanPengguna">
                <div class="grid grid-cols-1 gap-5 p-8 sm:grid-cols-2">
                    <div>
                        <label for="nama_lengkap" class="mb-2 block text-sm font-medium text-gray-800">
                            Nama Lengkap <span class="text-red-600">*</span>
                        </label>
                        <Input id="nama_lengkap" v-model="form.nama_lengkap" placeholder="Masukkan nama lengkap"
                            required />
                    </div>

                    <div>
                        <label for="username" class="mb-2 block text-sm font-medium text-gray-800">
                            Username <span class="text-red-600">*</span>
                        </label>
                        <Input id="username" v-model="form.username" placeholder="Masukkan username" required />
                    </div>

                    <div>
                        <label for="email" class="mb-2 block text-sm font-medium text-gray-800">
                            Email <span class="text-red-600">*</span>
                        </label>
                        <Input id="email" v-model="form.email" type="email" placeholder="Masukkan email" required />
                    </div>

                    <div v-if="!isEditMode">
                        <label for="password" class="mb-2 block text-sm font-medium text-gray-800">
                            Password <span class="text-red-600">*</span>
                        </label>

                        <div class="relative">
                            <Input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'"
                                placeholder="Masukkan password" class="pr-10" autocomplete="new-password" required />
                            <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                                @click="showPassword = !showPassword">
                                <EyeOff v-if="showPassword" :size="18" />
                                <Eye v-else :size="18" />
                            </button>
                        </div>
                    </div>

                    <div>
                        <label for="role" class="mb-2 block text-sm font-medium text-gray-800">
                            Role <span class="text-red-600">*</span>
                        </label>
                        <Select v-model="form.role">
                            <SelectTrigger id="role" class="w-full">
                                <SelectValue placeholder="Pilih role pengguna" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="petugas">Petugas</SelectItem>
                                <SelectItem value="peminjam">Peminjam</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter class="border-t border-gray-200 px-8 py-4">
                    <Button type="submit" :disabled="loading">
                        <Save :size="18" />
                        {{
                            loading
                                ? 'Menyimpan...'
                                : isEditMode
                                    ? 'Simpan Perubahan'
                                    : 'Tambah Pengguna'
                        }}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>
