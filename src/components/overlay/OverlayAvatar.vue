<template>
  <USlideover
    :class="isMobile ? 'max-w-none' : ''"
    :close="{ onClick: () => emit('close', false) }"
    title="创建角色"
    description=" "
    :ui="{ body: 'space-y-4 sm:space-y-6', description: 'hidden' }"
  >
    <template #body>
      <UPageCard
        :description="tip || '输入你的角色名'"
        variant="naked"
        orientation="horizontal"
        class="mb-4"
        :ui="{
          container: 'lg:grid-cols-none',
          title: 'items-center flex gap-2'
        }"
      >
        <template #title>
          <span>角色</span>
          <UButton
            icon="lucide:dices"
            variant="ghost"
            @click="onGetRandomAvatar"
          />
        </template>
      </UPageCard>
      <UInput class="w-full" v-model="ocName" maxlength="16">
        <template v-if="ocName" #trailing>
          <div class="text-muted text-xs tabular-nums">
            {{ ocName.length }}/16
          </div>
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="lucide:circle-x"
            @click="ocName = ''"
          />
        </template>
      </UInput>
      <UPageCard
        title="性别"
        description="填写角色的性别"
        variant="naked"
        orientation="horizontal"
        class="mb-4"
        :ui="{
          container: 'lg:grid-cols-none'
        }"
      >
        <UInput
          placeholder="例如: 男，女，神，狐妖"
          class="w-full"
          v-model="ocGender"
          maxlength="5"
        >
          <template v-if="ocGender" #trailing>
            <div class="text-muted text-xs tabular-nums">
              {{ ocGender.length }}/5
            </div>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="lucide:circle-x"
              @click="ocGender = ''"
            />
          </template>
        </UInput>
      </UPageCard>
      <UPageCard
        title="年龄"
        description="填写角色的年龄"
        variant="naked"
        orientation="horizontal"
        class="mb-4"
        :ui="{
          container: 'lg:grid-cols-none'
        }"
      >
        <UInput
          placeholder="例如: 18"
          class="w-full"
          v-model="ocAge"
          maxlength="5"
        >
          <template v-if="ocAge" #trailing>
            <div class="text-muted text-xs tabular-nums">
              {{ ocAge.length }}/5
            </div>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="lucide:circle-x"
              @click="ocAge = ''"
            />
          </template>
        </UInput>
      </UPageCard>
      <UPageCard
        title="身高"
        description="填写角色的身高"
        variant="naked"
        orientation="horizontal"
        class="mb-4"
        :ui="{
          container: 'lg:grid-cols-none'
        }"
      >
        <UInput
          placeholder="例如: 160cm, 1.6m"
          class="w-full"
          v-model="ocHeight"
          maxlength="5"
        >
          <template v-if="ocHeight" #trailing>
            <div class="text-muted text-xs tabular-nums">
              {{ ocHeight.length }}/5
            </div>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="lucide:circle-x"
              @click="ocHeight = ''"
            />
          </template>
        </UInput>
      </UPageCard>
      <UPageCard
        title="MBTI"
        description="选择角色的 MBTI"
        variant="naked"
        orientation="horizontal"
        class="mb-4"
        :ui="{
          container: 'lg:grid-cols-none'
        }"
      >
        <USelect class="w-full" v-model="ocMBTI" :items="mbtiItems" />
      </UPageCard>
      <UPageCard
        title="背景故事 / 台词"
        description="填写角色的背景故事 / 台词"
        variant="naked"
        orientation="horizontal"
        class="mb-4"
        :ui="{
          container: 'lg:grid-cols-none'
        }"
      >
        <UTextarea
          v-model="bio"
          :rows="5"
          autoresize
          class="w-full"
          maxlength="30"
          :ui="{ trailing: 'flex items-end' }"
        >
          <template v-if="bio" #trailing>
            <div class="text-muted py-1.5 text-xs tabular-nums">
              {{ bio.length }}/30
            </div>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="lucide:circle-x"
              @click="bio = ''"
            />
          </template>
        </UTextarea>
      </UPageCard>
    </template>
    <template #footer>
      <UButton
        class="w-full justify-center"
        :disabled="!ocName"
        label="确认"
        @click="onUpdateAvatar"
      />
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { updateProfile } from '@/apis/profile'
import { mbtiItems } from '@/const'

const emit = defineEmits<{ close: [boolean] }>()
const props = defineProps<{ profileForm: any }>()
const { isMobile, globalSocket, userInfo } = storeToRefs(useUserStore())
const toast = useToast()
const isSlideoverOpen = ref(false)
const tip = ref('')
const ocName = ref('')
const ocGender = ref('')
const ocAge = ref('')
const ocHeight = ref('')
const ocMBTI = ref('')
const bio = ref('')
const avatarMap = ref(null)

const onUpdateAvatar = async () => {
  const _nickname = ocName.value
  const _ocGender = ocGender.value
  const _ocAge = ocAge.value
  const _ocHeight = ocHeight.value
  const _ocMBTI = ocMBTI.value as any
  const _bio = bio.value
  const { profile } = userInfo.value
  const { profileForm } = props

  try {
    // 不需要 diff，因为需要完全覆盖之前的角色
    const { data: token } = await updateProfile({
      nickname: _nickname,
      ocGender: _ocGender,
      ocAge: _ocAge,
      ocHeight: _ocHeight,
      ocMBTI: _ocMBTI,
      bio: _bio
    })
    localStorage.setItem('token', token)
    globalSocket.value.emit('refresh-profile', token)
    profile.nickname = profileForm.nickname = _nickname
    profile.ocGender = profileForm.ocGender = _ocGender
    profile.ocAge = profileForm.ocAge = _ocAge
    profile.ocHeight = profileForm.ocHeight = _ocHeight
    profile.ocMBTI = profileForm.ocMBTI = _ocMBTI
    profile.bio = profileForm.bio = _bio
    toast.add({
      title: '修改资料成功',
      icon: 'lucide:smile'
    })
    emit('close', true)
    isSlideoverOpen.value = false
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

const onGetRandomAvatar = async () => {
  if (!avatarMap.value) {
    avatarMap.value = await (await fetch('/json/avatar/avatar-map.json')).json()
  }

  const _avatarMap = avatarMap.value
  const keys = Object.keys(_avatarMap)
  const from = keys[Math.floor(Math.random() * keys.length)]
  const avatars = _avatarMap[from]
  const avatar = avatars[Math.floor(Math.random() * avatars.length)]
  tip.value = `该角色来自于「${from}」-「${avatar}」`
  ocName.value = avatar
}
</script>
