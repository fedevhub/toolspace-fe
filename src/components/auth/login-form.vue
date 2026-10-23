<script setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import api from '@/lib/api'

const router = useRouter()
const showPassword = ref(false)
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!username.value.trim() || !password.value) {
    error.value = 'Username dan password wajib diisi.'
    return
  }

  error.value = ''
  loading.value = true

  try {
    const response = await api.post('/auth/login', {
      username: username.value.trim(),
      password: password.value,
    })

    const { token, user } = response.data
    if (!token || !user) {
      error.value = 'Respons login tidak lengkap.'
      return
    }

    const roleRoutes = {
      admin: '/admin/dashboard',
      petugas: '/petugas/peminjaman',
    }
    const destination = roleRoutes[user.role]

    if (!destination) {
      error.value = 'Login berhasil, tetapi halaman untuk role ini belum tersedia.'
      return
    }

    localStorage.setItem('token', token)
    localStorage.setItem('isLogin', 'true')
    localStorage.setItem('user', JSON.stringify(user))
    await router.push(destination)
  } catch (err) {
    error.value = err.response?.data?.message || 'Login gagal. Periksa username dan password.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-6" @submit.prevent="handleLogin">
    <div class="mb-4 flex flex-col items-center justify-center gap-1">
      <h1 class="text-4xl font-bold text-black">LOGIN</h1>
      <p class="text-base text-gray-500">Login Untuk Masuk Ke Akun Anda</p>
    </div>

    <div class="flex flex-col gap-2">
      <label for="username" class="text-sm font-medium text-gray-800">Username</label>
      <Input id="username" v-model="username" type="text" placeholder="Masukkan username" autocomplete="username"
        required class="h-12" />
    </div>

    <div class="flex flex-col gap-2">
      <label for="password" class="text-sm font-medium text-gray-800">Password</label>
      <div class="relative">
        <Input id="password" v-model="password" :type="showPassword ? 'text' : 'password'"
          placeholder="Masukkan password" autocomplete="current-password" required class="h-12 pr-12" />
        <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
          :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
          @click="showPassword = !showPassword">
          <EyeOff v-if="showPassword" class="size-5" />
          <Eye v-else class="size-5" />
        </button>
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <Button type="submit" :disabled="loading" class="h-12 w-full bg-black text-base text-white hover:bg-gray-800">
      {{ loading ? 'Memproses...' : 'Login' }}
    </Button>

    <div class="flex items-center justify-center">
      <span class="text-sm text-black/60">Masalah saat masuk?</span>
      <a href="#" class="px-1 text-sm underline-offset-4 hover:text-black/80 hover:underline">Hubungi Admin</a>
    </div>
  </form>
</template>
