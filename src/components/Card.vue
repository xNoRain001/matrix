<template>
  <div class="grid grid-cols-2 gap-4">
    <router-link
      v-for="({ icon, title, desc, to }, index) in list"
      :key="index"
      :to="to"
    >
      <div
        class="rounded-[12px] border border-[#202127] bg-[#202127] p-[24px] hover:border-[#a8b1ff]"
      >
        <div
          class="flex-center mb-[20px] flex h-[48px] w-[48px] rounded-[6px] bg-[rgba(101,117,133,.16)] text-[24px]"
        >
          {{ icon }}
        </div>
        <h2 class="!text-base leading-[24px] !font-semibold text-[#dfdfd6]">
          {{ title }}
        </h2>
        <p
          class="!mb-0 pt-[8px] text-[14px] leading-[24px] font-medium text-[#98989f]"
        >
          {{ desc }}
        </p>
      </div>
    </router-link>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  list: { icon: string; title: string; desc: string; to: string }[]
}>()
</script>
