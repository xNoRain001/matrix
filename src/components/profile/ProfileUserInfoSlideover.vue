<template>
  <USlideover
    v-model:open="isAvatarSlideoverOpen"
    :class="isMobile ? 'max-w-none' : ''"
    title="修改头像"
    description=" "
    :ui="{ footer: 'flex-col', description: 'hidden' }"
  >
    <template #body>
      <div class="flex h-full items-center justify-center">
        <UAvatar
          class="size-64 text-9xl"
          :src="src"
          :alt="userInfo.profile.nickname[0]"
        />
      </div>
    </template>
    <template #footer>
      <UButton
        @click="onGenRandomAvatar"
        class="w-full justify-center"
        label="随机头像"
      />
      <UButton
        @click="avatarRef.click()"
        class="w-full justify-center"
        label="上传头像"
      />
      <UButton
        @click="onSaveAvatar"
        class="w-full justify-center"
        label="保存头像"
      />
    </template>
  </USlideover>

  <!-- 上传头像 -->
  <input
    @change="onFileChange"
    ref="avatarRef"
    hidden
    type="file"
    accept="image/png, image/jpeg, image/gif"
  />
</template>

<script lang="ts" setup>
import { useUpdateStaticNameFile } from '@/hooks'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref, useTemplateRef } from 'vue'

const isAvatarSlideoverOpen = defineModel<boolean>()
const avatarRef = useTemplateRef('avatarRef')
const { isMobile, userInfo, avatarURL } = storeToRefs(useUserStore())
const toast = useToast()
const src = ref(avatarURL.value)

const onFileChange = async e => {
  await useUpdateStaticNameFile(e, 'avatar', userInfo, toast, avatarURL)
  src.value = avatarURL.value
  isAvatarSlideoverOpen.value = false
}

const onSaveAvatar = () => {
  if (src.value.startsWith('data:image/')) {
    const file = base64ToFile()
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    const input = avatarRef.value
    input.files = dataTransfer.files
    const event = new Event('change')
    input.dispatchEvent(event)
  } else {
    isAvatarSlideoverOpen.value = false
  }
}

const base64ToFile = () => {
  // 移除 URL 前缀
  const byteString = atob(src.value.split(',')[1])
  const { length } = byteString
  const arrayBuffer = new ArrayBuffer(length)
  const ia = new Uint8Array(arrayBuffer)

  for (let i = 0; i < length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }

  const blob = new Blob([arrayBuffer], { type: 'image/png' })
  const file = new File([blob], 'avatar.png', { type: blob.type })

  return file
}

const onGenRandomAvatar = async () => {
  const { createAvatar } = await import('@dicebear/core')
  const { toPng } = await import('@dicebear/converter')
  const {
    adventurer,
    adventurerNeutral,
    avataaars,
    avataaarsNeutral,
    bigEars,
    bigEarsNeutral,
    bigSmile,
    bottts,
    botttsNeutral,
    croodles,
    croodlesNeutral,
    dylan,
    funEmoji,
    // glass,
    // icons,
    // identicon,
    // initials,
    lorelei,
    loreleiNeutral,
    micah,
    miniavs,
    notionists,
    notionistsNeutral,
    openPeeps,
    personas,
    pixelArt,
    pixelArtNeutral,
    // rings,
    // shapes,
    thumbs
  } = await import('@dicebear/collection')
  const styles = [
    adventurer,
    adventurerNeutral,
    avataaars,
    avataaarsNeutral,
    bigEars,
    bigEarsNeutral,
    bigSmile,
    bottts,
    botttsNeutral,
    croodles,
    croodlesNeutral,
    dylan,
    funEmoji,
    lorelei,
    loreleiNeutral,
    micah,
    thumbs,
    miniavs,
    notionists,
    notionistsNeutral,
    openPeeps,
    personas,
    pixelArt,
    pixelArtNeutral
  ]
  const avatar = createAvatar(
    styles[Math.floor(Math.random() * styles.length)] as any,
    {
      size: 256,
      seed: String(Math.random())
    }
  )
  const png = toPng(avatar)
  src.value = await png.toDataUri()
}
</script>
