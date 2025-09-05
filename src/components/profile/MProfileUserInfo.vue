<template>
  <!-- 需要放在下面这些模态框之前才不会被覆盖 -->
  <UDrawer
    :handle="false"
    v-model:open="openProfileDrawer"
    @animation-end="open => useBackToProfile(open, router)"
    direction="right"
    class="w-[80vw]"
    title=" "
    description=" "
  >
    <template #header>
      <div class="flex items-center">
        <UButton
          variant="ghost"
          color="neutral"
          icon="lucide:chevron-left"
          @click="openProfileDrawer = false"
        />
        <h2
          class="text-highlighted absolute left-1/2 -translate-x-1/2 font-semibold"
        >
          个人资料
        </h2>
      </div>
    </template>
    <template #content></template>
    <template #body>
      <UPageCard variant="subtle" :ui="{ body: 'w-full' }">
        <template #body>
          <div
            v-for="{ label, click, key } in profileItems"
            @click="click"
            class="flex h-12 items-center justify-between"
          >
            <div>{{ label }}</div>
            <div class="flex items-center gap-2">
              <div
                class="w-30 overflow-hidden text-right text-ellipsis whitespace-nowrap text-(--ui-text-dimmed)"
              >
                {{
                  key === 'gender'
                    ? useTransformGender(userInfoForm[key])
                    : userInfoForm[key]
                }}
              </div>
              <UIcon
                name="lucide:chevron-right"
                class="size-5 text-(--ui-text-dimmed)"
              />
            </div>
          </div>
        </template>
        <template #footer>
          <UButton
            label="修改资料"
            @click="onUpdateProfile"
            loading-auto
          ></UButton>
        </template>
      </UPageCard>
    </template>
  </UDrawer>

  <UDrawer v-model:open="openNicknameDrawer" title="修改昵称" description=" ">
    <template #body>
      <UFormField
        :ui="{ help: 'text-right pr-4' }"
        :help="`${userInfoForm.nickname.length} / 30`"
      >
        <UInput v-model="userInfoForm.nickname" class="w-full" maxlength="30">
          <template v-if="userInfoForm.nickname" #trailing>
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
    </template>
  </UDrawer>

  <UDrawer v-model:open="openGenderDrawer" title="修改性别" description=" ">
    <template #body>
      <USelect
        class="w-full"
        v-model="userInfoForm.gender"
        :items="genderOptions"
      />
    </template>
  </UDrawer>

  <UDrawer v-model:open="openBirthdayDrawer" title="修改生日" description=" ">
    <template #body>
      <UInput
        class="w-full"
        v-model="userInfoForm.birthday"
        v-maska="'####/##/##'"
        placeholder="YYYY/MM/DD"
        icon="i-lucide-calendar"
      />
    </template>
  </UDrawer>

  <UDrawer v-model:open="openRegionDrawer" title="修改地区" description=" ">
    <template #body>
      <div class="space-x-2">
        <USelectMenu
          class="w-1/3"
          v-model="province"
          :items="provinceOptions"
        />
        <USelectMenu class="w-1/3" v-model="city" :items="cityOptions" />
      </div>
    </template>
  </UDrawer>
</template>

<script lang="ts" setup>
import { updateProfile } from '@/apis/user'
import { provinceCityMap } from '@/const'
import { useBackToProfile, useTransformGender } from '@/hooks'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { vMaska } from 'maska/vue'
import { useRouter } from 'vue-router'

const toast = useToast()
const router = useRouter()
const openProfileDrawer = ref(true)
const openGenderDrawer = ref(false)
const openBirthdayDrawer = ref(false)
const openRegionDrawer = ref(false)
const openNicknameDrawer = ref(false)
const { userInfo } = storeToRefs(useUserStore())
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
const profileItems = [
  {
    label: '昵称',
    key: 'nickname',
    click: () => (openNicknameDrawer.value = true)
  },
  {
    label: '性别',
    key: 'gender',
    click: () => (openGenderDrawer.value = true)
  },
  {
    label: '生日',
    key: 'birthday',
    click: () => (openBirthdayDrawer.value = true)
  },
  {
    label: '地区',
    key: 'region',
    click: () => (openRegionDrawer.value = true)
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
    openProfileDrawer.value = false
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
    openProfileDrawer.value = false
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
</script>
