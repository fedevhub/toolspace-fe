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

    const tanggalPinjam = ref('')
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

        router.push('/views/admin/Alat')
    }
</script>


<template>
    <div class="py-20 px-20 pt-8">
        <Button @click="router.push('/admin/pengembalian')" variant="outline" class="gap-2">
            <ArrowLeft :size="16" />
            Kembali
        </Button>
        <h1 class="text-3xl font-bold pt-3">{{ isEditMode ? 'Edit Pengembalian' : 'Tambah Pengembalian Baru' }}</h1>

        <Card class="shadow-sm mt-3">
            <CardContent>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 gap-x-10 pb-4 p-2">
                    <div>
                        <label for="nama_lengkap" class="text-sm font-medium text-gray-800">
                        Nama Peminjam <span class="text-[#DC2626]">*</span>
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
                        <label for="role" class="text-sm font-medium text-gray-800">
                            Alat <span class="text-[#DC2626]">*</span>
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
                        <label for="tanggal_pinjam" class="text-sm font-medium text-gray-800">
                            Tanggal Pengembalian <span class="text-[#DC2626]">*</span>
                        </label>

                        <Input
                            id="tanggal_pinjam"
                            v-model="tanggalPinjam"
                            type="date"
                            required
                            class="h-10"
                        />
                    </div>

                    <div>
                        <label for="role" class="text-sm font-medium text-gray-800">
                            Status <span class="text-[#DC2626]">*</span>
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
                        <label for="nama_lengkap" class="text-sm font-medium text-gray-800">
                        Denda
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

                    
                </div>
                
                <div class="flex justify-end items-center py-3">
                    <Button>
                        <Save :size="20" /> Tambah Pengembalian
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
</template>