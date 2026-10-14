<script setup>
import {
    LayoutDashboard,
    Package,
    ClipboardList,
    RotateCcw,
    Users,
    LogOut,
    Clock,
    User,
    Layers
} from 'lucide-vue-next'

import { RouterLink } from 'vue-router'
</script>

<template>
    <aside class= "fixed inset-y-0 left-0 z-50 flex h-screen w-58 flex-col overflow-y-auto bg-black text-white">

        <div class="border-b border-white/10 px-5 py-6">
            <div class="text-xl font-bold tracking-wide">
                TOOLSPACE
            </div>
        </div>

        <nav class="flex-1 px-3 py-5">

            <div class="space-y-1">
                <RouterLink
                    to="/admin/dashboard"
                    exact-active-class="!bg-white !text-black"
                    class="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-white/70 transition hover:bg-white hover:text-black"
                    >
                    <LayoutDashboard :size="18" />
                    <span>Dashboard</span>
                </RouterLink>

                <RouterLink to="/admin/pengguna" exact-active-class="!bg-white !text-black" class="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-white/70 transition hover:bg-white hover:text-black">
                    <Users :size="18" />
                    <span>Pengguna</span>
                </RouterLink>

                <RouterLink to="/admin/alat" exact-active-class="!bg-white !text-black" class="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-white/70 transition hover:bg-white hover:text-black">
                    <Package :size="18" />
                    <span>Alat</span>
                </RouterLink>

                <RouterLink to="/admin/kategori" exact-active-class="!bg-white !text-black" class="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-white/70 transition hover:bg-white hover:text-black">
                    <Layers :size="18" />
                    <span>Kategori</span>
                </RouterLink>

                <RouterLink to="/admin/peminjaman" exact-active-class="!bg-white !text-black" class="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-white/70 transition hover:bg-white hover:text-black">
                    <ClipboardList :size="18" />
                    <span>Peminjaman</span>
                </RouterLink>

                <RouterLink to="/admin/pengembalian" exact-active-class="!bg-white !text-black" class="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-white/70 transition hover:bg-white hover:text-black">
                    <RotateCcw :size="18" />
                    <span>Pengembalian</span>
                </RouterLink>

                <RouterLink to="/admin/log-aktivitas" exact-active-class="!bg-white !text-black" class="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-white/70 transition hover:bg-white hover:text-black">
                    <Clock :size="18" />
                    <span>Log Aktivitas</span>
                </RouterLink>
            </div>
        </nav>


        <div class="border-t border-white/10 p-4">
            <div class="flex items-center gap-3 px-3 py-3 bg-white rounded-md">
                <div class="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
                    <User :size="18" />
                </div>

                <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium text-black">
                        Admin
                    </p>

                    <p class="truncate text-xs text-black/50">
                        Administrator
                    </p>
                </div>

                <button type="button" class="text-[#E20000] hover:text-[#E20000]/70" title="Logout">
                    <LogOut :size="17" />
                </button>
            </div>
        </div>
    </aside>
</template>