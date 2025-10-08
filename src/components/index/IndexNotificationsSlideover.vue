<template>
  <USlideover
    v-model:open="isNotificationsSlideoverOpen"
    title="通知"
    description=" "
  >
    <template #body>
      <UBlogPost
        class="not-last:mb-2"
        variant="soft"
        image="https://nuxt.com/assets/blog/nuxt-icon/cover.png"
        date="2000-01-01 14:23"
        title="Lorem ipsum dolor sit amet."
        description="Lorem
        ipsum dolor sit amet consectetur adipisicing elit. Voluptas iste dolore
        at expedita sint delectus nisi pariatur blanditiis. Sint, eaque saepe
        harum doloribus iste eos nesciunt hic veritatis provident quos!"
      >
      </UBlogPost>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
const isNotificationsSlideoverOpen = defineModel<boolean>()
</script>
