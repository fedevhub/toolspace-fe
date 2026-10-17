<script setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import api from '@/lib/api'

const router = useRouter()

const showPassword = ref(false)
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = 'Email dan password wajib diisi.'
    return
  }

  error.value = ''
  loading.value = true

  try {
    const response = await api.post('/login', {
      email: email.value,
      password: password.value,
    })

    const token = response.data.token

    if (!token) {
      error.value = 'Token tidak ditemukan pada respons login.'
      return
    }

    localStorage.setItem('token', token)
    localStorage.setItem('isLogin', 'true')

    router.push('/admin/dashboard')
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      'Login gagal. Periksa email dan password.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-6" @submit.prevent="handleLogin">
    <!-- Judul -->
    <div class="mb-4 flex flex-col gap-1 justify-center items-center">
      <h1 class="text-4xl font-bold text-black">LOGIN</h1>
      <p class="text-base text-gray-500">
        Login Untuk Masuk Ke Akun Anda
      </p>
    </div>

    <!-- Username -->
    <div class="flex flex-col gap-2">
      <label for="email" class="text-sm font-medium text-gray-800">
        Email
      </label>

      <Input id="email" v-model="email" type="text" placeholder="Masukkan email" autocomplete="email" required
        class="h-12" />
    </div>

    <!-- Password -->
    <div class="flex flex-col gap-2">
      <label for="password" class="text-sm font-medium text-gray-800">
        Password
      </label>

      <div class="relative">
        <Input id="password" v-model="password" :type="showPassword ? 'text' : 'password'"
          placeholder="Masukkan password" autocomplete="current-password" required class="h-12 pr-12" />

        <button type="submit" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
          :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
          @click="showPassword = !showPassword">
          <EyeOff v-if="showPassword" class="size-5" />
          <Eye v-else class="size-5" />
        </button>
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-600">
      {{ error }}
    </p>

    <div class="flex justify-end text-sm">
      <Button type="submit" :disabled="loading" class="h-12 w-full bg-black text-base text-white hover:bg-gray-800">
        {{ loading ? 'Memproses...' : 'Login' }}
      </Button>
    </div>

    <div class="flex justify-center items-center">
      <span class="text-black/60 text-sm">
        Masalah saat masuk?
      </span>
      <a href="#" class="text-sm text-black-600 underline-offset-4 hover:text-black/80 hover:underline px-1">
        Hubungi Admin
      </a>
    </div>


  </form>
</template>
