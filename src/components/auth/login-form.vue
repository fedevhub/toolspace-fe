<script setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-vue-next'

const showPassword = ref(false)
const username = ref('')
const password = ref('')
</script>

<template>
  <form class="flex flex-col gap-6" @submit.prevent>
    <!-- Judul -->
    <div class="mb-4 flex flex-col gap-1 justify-center items-center">
      <h1 class="text-4xl font-bold text-black">LOGIN</h1>
      <p class="text-base text-gray-500">
        Login Untuk Masuk Ke Akun Anda
      </p>
    </div>

    <!-- Username -->
    <div class="flex flex-col gap-2">
      <label for="username" class="text-sm font-medium text-gray-800">
        Username
      </label>

      <Input
        id="username"
        v-model="username"
        type="text"
        placeholder="Masukkan username"
        autocomplete="username"
        required
        class="h-12"
      />
    </div>

    <!-- Password -->
    <div class="flex flex-col gap-2">
      <label for="password" class="text-sm font-medium text-gray-800">
        Password
      </label>

      <div class="relative">
        <Input
          id="password"
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Masukkan password"
          autocomplete="current-password"
          required
          class="h-12 pr-12"
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

    <div class="flex justify-end text-sm">
        <Button
            type="submit"
            class="h-12 w-full bg-black text-base text-white hover:bg-gray-800">
            Login
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
