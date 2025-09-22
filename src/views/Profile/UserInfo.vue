<template>
  <template v-if="isMobile">
    <!-- 需要放在下面这些模态框之前才不会被覆盖 -->
    <USlideover
      v-model:open="isUserInfoSlideoverOpen"
      title="个人资料"
      description=" "
    >
      <template #body>
        <UPageCard
          title="编辑个人资料"
          description="这些信息将公开展示"
          variant="naked"
          orientation="horizontal"
          class="mb-4"
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
              :alt="userInfoForm.nickname[0]"
            ></UAvatar>
            <UIcon
              name="lucide:chevron-right"
              class="size-5 text-(--ui-text-dimmed)"
            />
          </UFormField>
          <UFormField
            v-for="{ label, click, key } in profileItems"
            :key="key"
            :label="label"
            class="flex items-center gap-2 not-last:pb-4"
            @click="click"
            :ui="{ container: 'flex-1 flex items-center gap-2 justify-end' }"
          >
            <div
              class="max-w-60 overflow-hidden text-ellipsis whitespace-nowrap text-(--ui-text-dimmed)"
            >
              {{
                key === 'gender'
                  ? useTransformGender(userInfoForm[key])
                  : key === 'birthday'
                    ? date.toString()
                    : userInfoForm[key]
              }}
            </div>
            <UIcon
              name="lucide:chevron-right"
              class="size-5 text-(--ui-text-dimmed)"
            />
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
      v-model:open="isOpenNicknameDrawer"
      title="修改昵称"
      description=" "
    >
      <template #body>
        <UFormField>
          <UInput v-model="userInfoForm.nickname" class="w-full" maxlength="30">
            <template v-if="userInfoForm.nickname" #trailing>
              <div class="text-muted text-xs tabular-nums">
                {{ userInfoForm.nickname.length }}/30
              </div>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="lucide:circle-x"
                @click="userInfoForm.nickname = ''"
              />
            </template>
          </UInput>
        </UFormField>
      </template>
    </UDrawer>

    <UDrawer v-model:open="isOpenGenderDrawer" title="修改性别" description=" ">
      <template #body>
        <USelect
          class="w-full"
          v-model="userInfoForm.gender"
          :items="genderOptions"
        />
      </template>
    </UDrawer>

    <UDrawer
      v-model:open="isOpenBirthdayDrawer"
      title="修改生日"
      description=" "
    >
      <template #body>
        <DatePicker v-model="date"></DatePicker>
      </template>
    </UDrawer>

    <UDrawer v-model:open="isOpenRegionDrawer" title="修改地区" description=" ">
      <template #body>
        <div class="flex gap-2">
          <USelect class="flex-1" v-model="province" :items="provinceOptions" />
          <USelect class="flex-1" v-model="city" :items="cityOptions" />
        </div>
      </template>
    </UDrawer>
  </template>
  <UForm v-else :state="userInfoForm">
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
        label="昵称"
        description="填写你的昵称"
        class="flex items-start justify-between gap-4"
        :ui="{ container: 'w-3/5' }"
      >
        <UInput class="w-full" v-model="userInfoForm.nickname" maxlength="30">
          <template v-if="userInfoForm.nickname" #trailing>
            <div class="text-muted text-xs tabular-nums">
              {{ userInfoForm.nickname.length }}/30
            </div>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="lucide:circle-x"
              @click="userInfoForm.nickname = ''"
            />
          </template>
        </UInput>
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
          v-model="userInfoForm.gender"
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
        name="username"
        label="地区"
        description="填写你的地区"
        class="flex items-start justify-between gap-4"
        :ui="{ container: 'w-3/5' }"
      >
        <div class="flex gap-4">
          <USelect class="flex-1" v-model="province" :items="provinceOptions" />
          <USelect class="flex-1" v-model="city" :items="cityOptions" />
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
            @click="viewerModal.open({ url: avatarURL })"
            class="cursor-pointer"
            :src="avatarURL"
            :alt="userInfoForm.nickname[0]"
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
          v-model="userInfoForm.bio"
          :rows="5"
          autoresize
          class="w-full"
          maxlength="30"
          :ui="{ trailing: 'flex items-end' }"
        >
          <template v-if="userInfoForm.bio" #trailing>
            <div class="text-muted py-1.5 text-xs tabular-nums">
              {{ userInfoForm.bio.length }}/30
            </div>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="lucide:circle-x"
              @click="userInfoForm.bio = ''"
            />
          </template>
        </UTextarea>
      </UFormField>
    </UPageCard>
  </UForm>

  <!-- 选择头像 -->
  <input
    @change="onFileChange"
    ref="avatarRef"
    hidden
    type="file"
    accept="image/*"
  />
</template>

<script lang="ts" setup>
import { updateProfile } from '@/apis/profile'
import { provinceCityMap } from '@/const'
import { useTransformGender, useUpdateOSS } from '@/hooks'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref, shallowRef, watch } from 'vue'
import { parseDate } from '@internationalized/date'
import ModalViewer from '@/components/modal/ModalViewer.vue'

const isUserInfoSlideoverOpen = defineModel<boolean>({ required: false })
const toast = useToast()
const isOpenGenderDrawer = ref(false)
const isOpenBirthdayDrawer = ref(false)
const isOpenRegionDrawer = ref(false)
const isOpenNicknameDrawer = ref(false)
const { isMobile, userInfo, avatarURL } = storeToRefs(useUserStore())
const userInfoForm = ref({ ...userInfo.value })
const { region } = userInfo.value
const [_province, _city] = region === '' ? [null, null] : region.split(' - ')
const province = ref(_province)
const city = ref(_city)
const sourceProvinceOptions = Object.keys(provinceCityMap)
const provinceOptions = ref(sourceProvinceOptions)
const cityOptions = ref(provinceCityMap[_province] || [])
const unknownGenderOption =
  userInfo.value.gender === 'other' ? [{ label: '未知', value: 'other' }] : []
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
    label: '昵称',
    key: 'nickname',
    click: () => (isOpenNicknameDrawer.value = true)
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
    label: '地区',
    key: 'region',
    click: () => (isOpenRegionDrawer.value = true)
  }
]
// TODO: 删除正则
const date = shallowRef(
  userInfoForm.value.birthday
    ? parseDate(userInfoForm.value.birthday.replace(/\//g, '-'))
    : null
)
const overlay = useOverlay()
const viewerModal = overlay.create(ModalViewer)
const avatarRef = ref(null)

const onFileChange = e => useUpdateOSS(e, 'avatar', userInfo, toast, avatarURL)

const getUserInfoDiff = (userInfo, _userInfoForm) => {
  const _userInfo = userInfo.value
  const keys = Object.keys(_userInfoForm)
  const res = {}

  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    const value = _userInfoForm[key]

    if (value !== _userInfo[key]) {
      res[key] = value
    }
  }

  return res
}

const onUpdateProfile = async () => {
  const _userInfoForm = userInfoForm.value

  if (province.value && !city.value) {
    province.value = null
    _userInfoForm.region = ''
  }

  const _date = date.value

  if (_date) {
    const __date = _date.toString()

    if (__date !== _userInfoForm.birthday) {
      _userInfoForm.birthday = __date
    }
  } else if (_userInfoForm.birthday) {
    // 在原本有日期的情况下取消选择了当前日期，那就将日期值设为 ''
    _userInfoForm.birthday = ''
  }

  const diff = getUserInfoDiff(userInfo, _userInfoForm)

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
    const {
      data: { token, userInfo: _userInfo }
    } = await updateProfile(diff)
    localStorage.setItem('token', token)
    userInfo.value = _userInfo
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

watch(province, v => {
  if (v) {
    cityOptions.value = provinceCityMap[v]
    // 切换省份时清空市区，赋值为 '' 可能会导致样式问题
    city.value = null
  }
})

watch(city, v => {
  // 切换省份时清空市区，此时值是空字符串
  if (v) {
    userInfoForm.value.region = `${province.value} - ${v}`
  }
})
</script>
