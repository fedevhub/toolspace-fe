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
    import { Textarea } from '@/components/ui/textarea'

    const isActive = ref(true)
    const username = ref('')

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

        router.push('/views/admin/Alat')
    }
</script>


<template>
    <div class="py-20 px-20 pt-8">
        <Button @click="router.push('/admin/alat')" variant="outline" class="gap-2">
            <ArrowLeft :size="16" />
            Kembali
        </Button>
        <h1 class="text-3xl font-bold pt-3">{{ isEditMode ? 'Edit Alat' : 'Tambah Alat Baru' }}</h1>

        <Card class="shadow-sm mt-3">
            <CardContent>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 gap-x-10 pb-4 p-2">
                    <div>
                        <label for="nama_lengkap" class="text-sm font-medium text-gray-800">
                        Nama Alat <span class="text-[#DC2626]">*</span>
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
                            Kode Alat <span class="text-[#DC2626]">*</span>
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
                        <label for="role" class="text-sm font-medium text-gray-800">
                            Kategori <span class="text-[#DC2626]">*</span>
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
                        <label for="username" class="text-sm font-medium text-gray-800">
                            Jumlah <span class="text-[#DC2626]">*</span>
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
                        <label for="role" class="text-sm font-medium text-gray-800">
                            Kondisi <span class="text-[#DC2626]">*</span>
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
                        <label for="username" class="text-sm font-medium text-gray-800">
                            Foto Alat <span class="text-[#DC2626]">*</span>
                        </label>

                        <Input
                            id="username"
                            v-model="username"
                            type="file"
                            autocomplete="username"
                            required
                            class="!h-[39.7px]"
                        />
                    </div>

                    <div>
                        <label for="username" class="text-sm font-medium text-gray-800">
                            Deskripsi 
                        </label>

                        <Textarea placeholder="Masukkan deskripsi." />
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
                        <Save :size="20" /> Tambah Alat
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
</template>