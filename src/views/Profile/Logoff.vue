<template>
  <DefineSlideoverBodyTemplate>
    <UPageCard
      title="注销账号"
      description="不再想使用我们的服务？您可以在此处删除您的帐户。此操作不可逆，与此帐户相关的所有信息都将被永久删除。"
      class="from-error/10 to-default bg-gradient-to-tl from-5%"
    >
      <template #footer>
        <UButton label="注销账号" color="error" />
      </template>
    </UPageCard>
  </DefineSlideoverBodyTemplate>
  <USlideover
    v-if="isMobile"
    v-model:open="isLogoffSlideoverOpen"
    title="注销账号"
    description=" "
  >
    <template #body>
      <ReuseSlideoverBodyTemplate></ReuseSlideoverBodyTemplate>
    </template>
  </USlideover>
  <template v-else>
    <ReuseSlideoverBodyTemplate></ReuseSlideoverBodyTemplate>
  </template>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store'
import { createReusableTemplate } from '@vueuse/core'
import { storeToRefs } from 'pinia'

const isLogoffSlideoverOpen = defineModel<boolean>({ required: false })
const [DefineSlideoverBodyTemplate, ReuseSlideoverBodyTemplate] =
  createReusableTemplate()
const { isMobile } = storeToRefs(useUserStore())
</script>
