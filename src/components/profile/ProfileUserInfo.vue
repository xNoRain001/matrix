<template>
  <UForm :state="userInfoForm">
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
        description="修改昵称"
        class="flex items-start justify-between gap-4"
      >
        <UInput class="w-60" v-model="userInfoForm.nickname" maxlength="30">
          <template v-if="userInfoForm.nickname" #trailing>
            {{ `${userInfoForm.nickname.length} / 30` }}
            <UButton
              color="neutral"
              variant="link"
              icon="i-lucide-circle-x"
              aria-label="Clear input"
              @click="userInfoForm.nickname = ''"
            />
          </template>
        </UInput>
      </UFormField>
      <USeparator />
      <UFormField
        name="email"
        label="性别"
        description="修改性别"
        class="flex items-start justify-between gap-4"
      >
        <USelect
          class="w-60"
          v-model="userInfoForm.gender"
          :items="genderOptions"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="username"
        label="生日"
        description="修改生日"
        class="flex items-start justify-between gap-4"
      >
        <UInput
          v-model="userInfoForm.birthday"
          v-maska="'####/##/##'"
          placeholder="YYYY/MM/DD"
          icon="i-lucide-calendar"
          class="w-60"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="username"
        label="地区"
        description="修改地区"
        class="flex items-start justify-between gap-4"
      >
        <div class="flex w-60 justify-between gap-4">
          <USelectMenu
            class="w-full"
            v-model="province"
            :items="provinceOptions"
          />
          <USelectMenu class="w-full" v-model="city" :items="cityOptions" />
        </div>
      </UFormField>
      <!-- <USeparator />
      <UFormField
        name="avatar"
        label="头像"
        description="修改头像，支持格式 JPG/PNG，最大尺寸为 1MB"
        class="flex items-start justify-between gap-4"
      >
        <div class="flex items-center gap-3">
          <UAvatar
            :src="userInfoForm.avatar"
            :alt="userInfoForm.name"
            size="lg"
          />
          <UButton label="选择" @click="onFileClick" />
          <input
            ref="fileRef"
            type="file"
            class="hidden"
            accept=".jpg, .jpeg, .png"
            @change="onFileChange"
          />
        </div>
      </UFormField>
      <USeparator />
      <UFormField
        name="bio"
        label="签名"
        description="修改签名"
        class="flex items-start justify-between gap-4"
      >
        <UTextarea
          v-model="userInfoForm.bio"
          :rows="5"
          autoresize
          class="w-60"
        />
      </UFormField> -->
    </UPageCard>
  </UForm>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserInfoStore } from '@/store'
import { watch } from 'vue'
import { provinceCityMap } from '@/const'
import { updateProfile } from '@/apis/user'
import { vMaska } from 'maska/vue'

const toast = useToast()
// const fileRef = ref<HTMLInputElement>()
const { userInfo } = storeToRefs(useUserInfoStore())
const userInfoForm = ref({ ...userInfo.value })
const { region } = userInfo.value
const [_province, _city] =
  region === '未知' ? [null, null] : region.split(' - ')
const province = ref(_province)
const city = ref(_city)
const sourceProvinceOptions = Object.keys(provinceCityMap)
const provinceOptions = ref(sourceProvinceOptions)
const cityOptions = ref(provinceCityMap[_province] || [])
const genderOptions = [
  {
    label: '男',
    value: 'male'
  },
  {
    label: '女',
    value: 'female'
  }
]

const onUpdateProfile = async () => {
  const _userInfoForm = userInfoForm.value
  const { nickname, gender, birthday, region } = _userInfoForm
  const {
    nickname: _nickname,
    gender: _gender,
    birthday: _birthday,
    region: _region
  } = userInfo.value

  if (
    nickname === _nickname &&
    gender === _gender &&
    birthday === _birthday &&
    region === _region
  ) {
    toast.add({
      title: '修改资料成功',
      color: 'success',
      icon: 'lucide:smile'
    })
    return
  }

  const __userInfoForm = JSON.parse(JSON.stringify(_userInfoForm))
  delete __userInfoForm.id
  delete __userInfoForm.tokenVersion

  try {
    const {
      data: { token, userInfo: _userInfo }
    } = await updateProfile(__userInfoForm)
    localStorage.setItem('token', token)
    userInfo.value = _userInfo
    toast.add({
      title: '修改资料成功',
      color: 'success',
      icon: 'lucide:smile'
    })
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

watch(province, v => {
  cityOptions.value = provinceCityMap[v]
  // 切换省份时清空市区
  city.value = null // 赋值为 '' 会引起样式问题
  userInfoForm.value.region = v
})

watch(city, v => {
  // 切换省份时清空市区，此时值是空字符串
  if (v) {
    userInfoForm.value.region = `${province.value} - ${v}`
  }
})

// const onFileClick = () => {
//   fileRef.value.click()
// }

// const onFileChange = (e: Event) => {
//   const input = e.target as HTMLInputElement

//   if (!input.files?.length) {
//     return
//   }

//   userInfoForm.value.avatar = URL.createObjectURL(input.files[0])
// }
</script>
