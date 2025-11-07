<template>
  <template v-if="isMobile">
    <!-- 需要放在下面这些模态框之前才不会被覆盖 -->
    <USlideover
      :class="isMobile ? 'max-w-none' : ''"
      v-model:open="isUserInfoSlideoverOpen"
      title="个人资料"
      description=" "
      :ui="{ body: 'flex flex-col gap-4 sm:gap-6', description: 'hidden' }"
    >
      <template #body>
        <UPageCard
          title="注册资料"
          description="这些信息仅你可见"
          variant="naked"
          orientation="horizontal"
        >
        </UPageCard>
        <UPageCard variant="subtle">
          <UFormField
            label="邮箱"
            class="flex items-center gap-2 not-last:pb-4"
            :ui="{ container: 'flex-1 flex items-center gap-2 justify-end' }"
          >
            <div class="text-dimmed w-50 truncate">
              {{ userInfo.email }}
            </div>
          </UFormField>
        </UPageCard>

        <UPageCard
          title="编辑个人资料"
          description="这些信息将公开展示"
          variant="naked"
          orientation="horizontal"
        ></UPageCard>
        <UPageCard
          variant="subtle"
          :ui="{ container: 'divide-y divide-default' }"
        >
          <UFormField
            label="头像"
            class="flex items-center gap-2 pb-4"
            @click="avatarRef.click()"
            :ui="{ container: 'flex-1 flex items-center gap-2 justify-end' }"
          >
            <UAvatar
              size="2xs"
              :src="avatarURL"
              :alt="userInfo.profile.nickname[0]"
            ></UAvatar>
            <UIcon name="lucide:chevron-right" class="text-dimmed size-5" />
          </UFormField>
          <UFormField
            v-for="{ label, click, key } in profileItems"
            :key="key"
            :label="label"
            class="flex items-center gap-2 not-last:pb-4"
            @click="click"
            :ui="{
              container: 'flex items-center justify-end gap-2 flex-1 '
            }"
          >
            <span class="text-dimmed w-50 truncate text-end">
              {{
                key === 'gender'
                  ? useTransformGender(profileForm[key])
                  : key === 'birthday'
                    ? date
                      ? date.toString()
                      : ''
                    : key === 'region'
                      ? profileForm.province +
                        `${profileForm.city ? ` - ${profileForm.city}` : ''}`
                      : key === 'nickname'
                        ? userInfo.profile.nickname
                        : profileForm[key]
              }}
            </span>
            <UIcon name="lucide:chevron-right" class="text-dimmed size-5" />
          </UFormField>
          <UButton
            label="修改资料"
            class="flex justify-center"
            @click="onUpdateProfile"
            loading-auto
          ></UButton>
        </UPageCard>
      </template>
    </USlideover>

    <UDrawer
      v-model:open="isOpenGenderDrawer"
      title="修改性别"
      description=" "
      :ui="{
        description: 'hidden'
      }"
    >
      <template #body>
        <USelect
          class="w-full"
          v-model="profileForm.gender"
          :items="genderOptions"
        />
      </template>
    </UDrawer>

    <UDrawer
      v-model:open="isOpenBirthdayDrawer"
      title="修改生日"
      description=" "
      :ui="{
        description: 'hidden'
      }"
    >
      <template #body>
        <DatePicker v-model="date"></DatePicker>
      </template>
    </UDrawer>

    <UDrawer
      v-model:open="isOpenCollegeDrawer"
      title="修改学校"
      description=" "
      :ui="{
        description: 'hidden'
      }"
    >
      <template #body>
        <USelectMenu
          virtualize
          v-model="profileForm.college"
          :items="colleges"
          class="w-full"
        />
      </template>
    </UDrawer>

    <UDrawer
      v-model:open="isOpenRegionDrawer"
      title="修改地区"
      description=" "
      :ui="{
        description: 'hidden'
      }"
    >
      <template #body>
        <div class="flex gap-2">
          <USelect
            class="flex-1"
            v-model="profileForm.province"
            :items="provinceOptions"
          />
          <USelect
            :disabled="!profileForm.province"
            class="flex-1"
            v-model="profileForm.city"
            :items="cityOptions"
          />
        </div>
      </template>
    </UDrawer>
  </template>
  <template v-else>
    <UForm>
      <UPageCard
        title="注册资料"
        description="这些信息仅你可见"
        variant="naked"
        orientation="horizontal"
        class="mb-4"
      >
      </UPageCard>
      <UPageCard variant="subtle">
        <UFormField
          label="邮箱"
          description="注册时的邮箱"
          class="flex items-start justify-between gap-4"
          :ui="{ container: 'w-3/5' }"
        >
          <UInput disabled class="w-full" v-model="userInfo.email"></UInput>
        </UFormField>
      </UPageCard>
    </UForm>

    <UForm :state="profileForm">
      <UPageCard
        title="个人资料"
        description="这些信息将公开展示"
        variant="naked"
        orientation="horizontal"
        class="mb-4"
      >
        <UButton
          form="settings"
          label="保存"
          type="submit"
          class="w-fit lg:ms-auto"
          @click="onUpdateProfile"
        />
      </UPageCard>
      <UPageCard variant="subtle">
        <UFormField
          name="name"
          label="角色"
          description="选择你的角色"
          class="flex items-start justify-between gap-4"
          :ui="{ container: 'w-3/5' }"
        >
          <div class="flex items-center gap-3">
            <UInput
              class="flex-1"
              disabled
              v-model="userInfo.profile.nickname"
            />
            <UButton label="选择" @click="avatarOverlay.open()"></UButton>
          </div>
        </UFormField>
        <USeparator />
        <UFormField
          name="email"
          label="性别"
          description="填写你的性别"
          class="flex items-start justify-between gap-4"
          :ui="{ container: 'w-3/5' }"
        >
          <USelect
            class="w-full"
            v-model="profileForm.gender"
            :items="genderOptions"
          />
        </UFormField>
        <USeparator />
        <UFormField
          name="username"
          label="生日"
          description="填写你的生日"
          class="flex items-start justify-between gap-4"
          :ui="{ container: 'w-3/5' }"
        >
          <DatePicker v-model="date"></DatePicker>
        </UFormField>
        <USeparator />
        <UFormField
          name="college"
          label="大学"
          description="填写你的大学"
          class="flex items-start justify-between gap-4"
          :ui="{ container: 'w-3/5' }"
        >
          <USelectMenu
            virtualize
            v-model="profileForm.college"
            :items="colleges"
            class="w-full"
          />
        </UFormField>
        <USeparator />
        <UFormField
          name="username"
          label="地区"
          description="填写你的地区"
          class="flex items-start justify-between gap-4"
          :ui="{ container: 'w-3/5' }"
        >
          <div class="flex gap-4">
            <USelect
              class="flex-1"
              v-model="profileForm.province"
              :items="provinceOptions"
            />
            <USelect
              :disabled="!profileForm.province"
              class="flex-1"
              v-model="profileForm.city"
              :items="cityOptions"
            />
          </div>
        </UFormField>
        <USeparator />
        <UFormField
          name="avatar"
          label="头像"
          description="修改头像，图片最大尺寸为 10 MB"
          class="flex items-start justify-between gap-4"
        >
          <div class="flex items-center gap-3">
            <UAvatar
              @click="viewerOverlay.open({ urls: [{ url: avatarURL }] })"
              class="cursor-pointer"
              :src="avatarURL"
              :alt="userInfo.profile.nickname[0]"
              size="lg"
            />
            <UButton label="选择" @click="avatarRef.click()" />
          </div>
        </UFormField>
        <USeparator />
        <UFormField
          name="bio"
          label="签名"
          description="用一句话表达自己的想法"
          class="flex items-start justify-between gap-4"
          :ui="{ container: 'w-3/5' }"
        >
          <UTextarea
            v-model="profileForm.bio"
            :rows="5"
            autoresize
            class="w-full"
            maxlength="30"
            :ui="{ trailing: 'flex items-end' }"
          >
            <template v-if="profileForm.bio" #trailing>
              <div class="text-muted py-1.5 text-xs tabular-nums">
                {{ profileForm.bio.length }}/30
              </div>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="lucide:circle-x"
                @click="profileForm.bio = ''"
              />
            </template>
          </UTextarea>
        </UFormField>
      </UPageCard>
    </UForm>
  </template>

  <!-- 选择头像 -->
  <input
    @change="onFileChange"
    ref="avatarRef"
    hidden
    type="file"
    accept="image/png, image/jpeg, image/gif"
  />
</template>

<script lang="ts" setup>
import { updateProfile } from '@/apis/profile'
import { colleges, provinceCityMap } from '@/const'
import { useTransformGender, useUpdateStaticNameFile } from '@/hooks'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref, shallowRef, watch } from 'vue'
import { parseDate } from '@internationalized/date'
import OverlayViewer from '@/components/overlay/OverlayViewer.vue'
import OverlayAvatar from '@/components/overlay/OverlayAvatar.vue'

const isUserInfoSlideoverOpen = defineModel<boolean>({ required: false })
const toast = useToast()
const isOpenGenderDrawer = ref(false)
const isOpenBirthdayDrawer = ref(false)
const isOpenRegionDrawer = ref(false)
const isOpenCollegeDrawer = ref(false)
const { isMobile, userInfo, avatarURL, globalSocket } =
  storeToRefs(useUserStore())
const profileForm = ref({ ...userInfo.value.profile })
const sourceProvinceOptions = Object.keys(provinceCityMap)
const provinceOptions = ref(sourceProvinceOptions)
const cityOptions = ref(provinceCityMap[profileForm.value.province] || [])
const unknownGenderOption =
  userInfo.value.profile.gender === 'other'
    ? [{ label: '未知', value: 'other' }]
    : []
const genderOptions = [
  ...unknownGenderOption,
  {
    label: '男',
    value: 'male'
  },
  {
    label: '女',
    value: 'female'
  }
]
const profileItems = [
  {
    label: '角色',
    key: 'nickname',
    click: () => avatarOverlay.open()
  },
  {
    label: '性别',
    key: 'gender',
    click: () => (isOpenGenderDrawer.value = true)
  },
  {
    label: '生日',
    key: 'birthday',
    click: () => (isOpenBirthdayDrawer.value = true)
  },
  {
    label: '大学',
    key: 'college',
    click: () => (isOpenCollegeDrawer.value = true)
  },
  {
    label: '地区',
    key: 'region',
    click: () => (isOpenRegionDrawer.value = true)
  }
]
const date = shallowRef(
  profileForm.value.birthday ? parseDate(profileForm.value.birthday) : null
)
const overlay = useOverlay()
const viewerOverlay = overlay.create(OverlayViewer)
const avatarOverlay = overlay.create(OverlayAvatar)
const avatarRef = ref(null)

const onFileChange = e =>
  useUpdateStaticNameFile(e, 'avatar', userInfo, toast, avatarURL)

const getUserInfoDiff = (userInfo, _profileForm) => {
  const { profile } = userInfo.value
  const keys = Object.keys(_profileForm)
  const res: any = {}

  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]

    if (key === 'nickname') {
      continue
    }

    const value = _profileForm[key]

    if (value !== profile[key]) {
      res[key] = value
    }
  }

  // 如果修改市区，需要携带上省份
  if (res.city) {
    res.province = _profileForm.province
  }

  return res
}

const onUpdateProfile = async () => {
  const _profileForm = profileForm.value
  const _date = date.value

  if (_date) {
    const __date = _date.toString()

    if (__date !== _profileForm.birthday) {
      _profileForm.birthday = __date
    }
  } else if (_profileForm.birthday) {
    // 在原本有日期的情况下取消选择了当前日期，那就将日期值设为 ''
    _profileForm.birthday = ''
  }

  const diff = getUserInfoDiff(userInfo, _profileForm)

  if (!Object.keys(diff).length) {
    toast.add({
      title: '修改资料成功',
      icon: 'lucide:smile'
    })

    if (isMobile.value) {
      isUserInfoSlideoverOpen.value = false
    }

    return
  }

  try {
    const { data: token } = await updateProfile(diff)
    localStorage.setItem('token', token)
    globalSocket.value.emit('refresh-profile', token)
    userInfo.value.profile = {
      ...userInfo.value.profile,
      ...diff
    }
    toast.add({
      title: '修改资料成功',
      icon: 'lucide:smile'
    })

    if (isMobile.value) {
      isUserInfoSlideoverOpen.value = false
    }
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

watch(
  () => profileForm.value.province,
  v => {
    if (v) {
      cityOptions.value = provinceCityMap[v]
      profileForm.value.city = ''
    }
  }
)
</script>
