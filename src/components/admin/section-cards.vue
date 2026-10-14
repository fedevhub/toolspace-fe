<script setup>
    import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
    import { Skeleton } from "@/components/ui/skeleton";

    import {
        User,
        Package,
        ClipboardList,
        RotateCcw
    } from 'lucide-vue-next'
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 py-3">
        <Card class="shadow-sm">
            <CardContent>
                <div class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div class="bg-[#F5F5F5] rounded-lg px-2 py-2 text-sm font-medium text-black dark:text-gray-400 flex items-center gap-1">
                        <User :size="26" />
                    </div>
                </div>
                
                <div class="flex flex-row items-center space-y-0 pt-2 gap-0 pb-0">
                    <p class="text-md font-bold text-5xl">
                        20
                    </p>

                    <span class="text-1xl px-3 pt-5 text-[#000000]/70 font-bold">
                        Total User
                    </span>
                </div>
            </CardContent>
        </Card>

        <Card class="shadow-sm">
            <CardContent>
                <div class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div class="bg-[#F5F5F5] rounded-lg px-2 py-2 text-sm font-medium text-black dark:text-gray-400 flex items-center gap-1">
                        <Package :size="26" />
                    </div>
                </div>
                
                <div class="flex flex-row items-center space-y-0 py-2 gap-0">
                    <p class="text-md font-bold text-5xl">
                        50
                    </p>

                    <span class="text-1xl px-3 pt-5 text-[#000000]/70 font-bold">
                        Total Alat
                    </span>
                </div>
            </CardContent>
        </Card>

        <Card class="shadow-sm">
            <CardContent>
                <div class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div class="bg-[#F5F5F5] rounded-lg px-2 py-2 text-sm font-medium text-black dark:text-gray-400 flex items-center gap-1">
                        <ClipboardList :size="26" />
                    </div>
                </div>
                
                <div class="flex flex-row items-center space-y-0 py-2 gap-0">
                    <p class="text-md font-bold text-5xl">
                        12
                    </p>

                    <span class="text-1xl px-3 pt-5 text-[#000000]/70 font-bold">
                        Peminjaman
                    </span>
                </div>
            </CardContent>
        </Card>

        <Card class="shadow-sm">
            <CardContent>
                <div class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div class="bg-[#F5F5F5] rounded-lg px-2 py-2 text-sm font-medium text-black dark:text-gray-400 flex items-center gap-1">
                        <RotateCcw :size="24" />
                    </div>
                </div>
                
                <div class="flex flex-row items-center space-y-0 py-2 gap-0">
                    <p class="text-md font-bold text-5xl">
                        08
                    </p>

                    <span class="text-1xl px-3 pt-5 text-[#000000]/70 font-bold">
                        Pengembalian
                    </span>
                </div>
            </CardContent>
        </Card>

    </div>
</template>