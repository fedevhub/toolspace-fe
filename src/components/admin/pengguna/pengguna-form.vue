<script setup>
    import { Eye, EyeOff, Save, ArrowLeft } from '@lucide/vue';
    import { ref, onMounted } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { Button } from '@/components/ui/button'
    import { Input } from '@/components/ui/input'
    import { Label } from '@/components/ui/label'
    import { Switch } from '@/components/ui/switch'
    import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
    import {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
    } from '@/components/ui/select'

    const isActive = ref(true)
    const showPassword = ref(false)
    const username = ref('')
    const password = ref('')

    const route = useRoute()
    const router = useRouter()
    const userId = route.params.di
    const isEditMode = !!userId

    const form = ref({
        nama_lengkap: '',
        username: '',
        email: '',
        password: '',
        role: '',
        status: '',
    })

    onMounted(async () => {
        if (isEditMode) {
            form.value = {
                nama_lengkap: 'Budi Santoso',
                username: 'Budi',
                email: 'budi@gmail.com',
                password: 'budi123',
                role: 'Petugas',
                status: 'Aktif'
            }
        }
    })

    const handleSubmit = async () => {
        if (isEditMode) {
            console.log('Kirim data update ke API:', form.value)
        } else {
            console.log('Kirim data create ke API:', form.value)
        }

        router.push('/views/admin/Pengguna')
    }
</script>


<template>
    <div class="p-8">
        <Button @click="router.push('/admin/pengguna')" variant="outline" class="gap-2">
            <ArrowLeft :size="16" />
            Kembali
        </Button>
        <h1 class="text-3xl font-bold pt-3">{{ isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru' }}</h1>
        <p class="font-medium text-gray-500">Kelola data hak akses, peran, dan status keaktifan pengguna sistem.</p>

        <Card class="shadow-sm mt-3">
            <CardContent>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 gap-x-8 pb-4">
                    <div>
                        <label for="nama_lengkap" class="text-sm font-medium text-gray-800">
                        Nama Lengkap <span class="text-[#DC2626]">*</span>
                        </label>

                        <Input
                            id="nama_lengkap"
                            v-model="nama_lengkap"
                            type="text"
                            placeholder="Masukkan nama lengkap"
                            autocomplete="nama_lengkap"
                            required
                            class="h-10"
                        />
                    </div>

                    <div>
                        <label for="username" class="text-sm font-medium text-gray-800">
                            Username <span class="text-[#DC2626]">*</span>
                        </label>

                        <Input
                            id="username"
                            v-model="username"
                            type="text"
                            placeholder="Masukkan username"
                            autocomplete="username"
                            required
                            class="h-10"
                        />
                    </div>

                    <div>
                        <label for="username" class="text-sm font-medium text-gray-800">
                            Email <span class="text-[#DC2626]">*</span>
                        </label>

                        <Input
                            id="username"
                            v-model="username"
                            type="text"
                            placeholder="Masukkan username"
                            autocomplete="username"
                            required
                            class="h-10"
                        />
                    </div>

                    <div>
                        <label for="password" class="text-sm font-medium text-gray-800">
                            Password <span class="text-[#DC2626]">*</span>
                        </label>

                        <div class="relative">
                            <Input
                            id="password"
                            v-model="password"
                            :type="showPassword ? 'text' : 'password'"
                            placeholder="Masukkan password"
                            autocomplete="current-password"
                            required
                            class="h-10 pr-10"
                            />

                            <button
                            type="button"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
                            :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                            @click="showPassword = !showPassword"
                            >
                            <EyeOff v-if="showPassword" class="size-5" />
                            <Eye v-else class="size-5" />
                            </button>
                        </div>
                    </div>

                    <div>
                        <label for="role" class="text-sm font-medium text-gray-800">
                            Role <span class="text-[#DC2626]">*</span>
                        </label>

                        <Select v-model="form.role">
                            <SelectTrigger id="role" class="!h-[40px] w-full">
                                <SelectValue placeholder="Pilih role pengguna" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Petugas">Petugas</SelectItem>
                                <SelectItem value="Peminjam">Peeminjam</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label
                            for="status"
                            class="text-sm font-medium text-gray-800 block mb-2"
                        >
                            Status <span class="text-[#DC2626]">*</span>
                        </label>

                        <div class="flex items-center gap-3">
                            <Switch
                                id="status"
                                v-model:checked="isActive"
                            />

                            <span class="text-sm text-gray-700">
                                {{ isActive ? 'Aktif' : 'Nonaktif' }}
                            </span>
                        </div>
                    </div>                 
                </div>
                
                <div class="flex justify-end items-center py-3">
                    <Button>
                        <Save :size="20" /> Tambah Pengguna
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
</template>