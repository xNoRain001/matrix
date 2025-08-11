<template>
  <div class="flex flex-col items-center">
    <div class="w-full max-w-(--room-width)">
      <div class="ml-6 flex items-center">
        <UAvatar :text="userInfo?.nickname?.[0]" size="3xl" />
        <div class="ml-4 w-[calc(100%-5.5rem)]">
          <span class="text-xl font-semibold">您好</span>
          <div class="overflow-hidden text-ellipsis whitespace-nowrap">
            {{ userInfo?.nickname }}
          </div>
        </div>
      </div>

      <div v-for="items in cards" class="bg-elevated mt-4 rounded-xl p-4">
        <div
          v-for="{ click, label, icon } in items"
          @click="click"
          class="hover:bg-accented flex h-12 cursor-pointer items-center justify-between rounded-xl px-2"
        >
          <div class="flex items-center">
            <UIcon :name="icon" class="size-5" />
            <div class="ml-2">{{ label }}</div>
          </div>
          <UIcon name="lucide:chevron-right" class="size-5" />
        </div>
      </div>
    </div>

    <UDrawer
      :handle="false"
      v-model:open="openProfileDrawer"
      direction="right"
      :class="isDesktop ? 'w-[30vw]' : 'w-[80vw]'"
      title=" "
      description=" "
    >
      <template #header>
        <div class="flex items-center">
          <UButton
            variant="ghost"
            color="neutral"
            icon="lucide:chevron-left"
            class="cursor-pointer"
            @click="openProfileDrawer = false"
          />
          <div class="absolute left-1/2 -translate-x-1/2">个人资料</div>
        </div>
      </template>
      <template #content></template>
      <template #body>
        <div class="bg-elevated rounded-xl p-4">
          <div
            v-for="{ label, click, key } in profileItems"
            @click="click"
            class="hover:bg-accented flex h-12 cursor-pointer items-center justify-between rounded-xl px-2"
          >
            <div>{{ label }}</div>
            <div class="flex items-center">
              <div class="mr-2 text-(--ui-text-dimmed)">
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
          <UButton
            label="修改资料"
            class="mt-4"
            @click="onUpdateProfile"
          ></UButton>
        </div>
      </template>
    </UDrawer>

    <UDrawer
      :handle="false"
      v-model:open="openUpdatePasswordDrawer"
      direction="right"
      :class="isDesktop ? 'w-[30vw]' : 'w-[80vw]'"
      title=" "
      description=" "
    >
      <template #header>
        <div class="flex items-center">
          <UButton
            variant="ghost"
            color="neutral"
            icon="lucide:chevron-left"
            class="cursor-pointer"
            @click="openUpdatePasswordDrawer = false"
          />
          <div class="absolute left-1/2 -translate-x-1/2">修改密码</div>
        </div>
      </template>
      <template #content></template>
      <template #body>
        <div class="bg-elevated rounded-xl p-4">
          <UForm
            :schema="schema"
            :state="passwordForm"
            class="space-y-4"
            @submit="onUpdatePassword"
          >
            <UFormField name="oldPassword">
              <UInput
                class="w-full"
                v-model="passwordForm.oldPassword"
                placeholder=""
                :type="isPwd ? 'password' : 'text'"
                :ui="{ base: 'peer' }"
              >
                <label
                  class="text-highlighted peer-focus:text-highlighted peer-placeholder-shown:text-dimmed pointer-events-none absolute -top-2.5 left-0 px-1.5 text-xs font-medium transition-all peer-placeholder-shown:top-1.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-focus:-top-2.5 peer-focus:text-xs peer-focus:font-medium"
                >
                  <span class="bg-default inline-flex px-1">旧密码</span>
                </label>
                <template #trailing>
                  <UButton
                    color="neutral"
                    variant="link"
                    size="sm"
                    :icon="isPwd ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    :aria-label="isPwd ? 'Hide password' : 'Show password'"
                    :aria-pressed="isPwd"
                    aria-controls="password"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </UInput>
            </UFormField>
            <UFormField name="password">
              <UInput
                class="w-full"
                v-model="passwordForm.password"
                placeholder=""
                :type="isPwd ? 'password' : 'text'"
                :ui="{ base: ' peer' }"
              >
                <label
                  class="text-highlighted peer-focus:text-highlighted peer-placeholder-shown:text-dimmed pointer-events-none absolute -top-2.5 left-0 px-1.5 text-xs font-medium transition-all peer-placeholder-shown:top-1.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-focus:-top-2.5 peer-focus:text-xs peer-focus:font-medium"
                >
                  <span class="bg-default inline-flex px-1">新密码</span>
                </label>
                <template #trailing>
                  <UButton
                    color="neutral"
                    variant="link"
                    size="sm"
                    :icon="isPwd ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    :aria-label="isPwd ? 'Hide password' : 'Show password'"
                    :aria-pressed="isPwd"
                    aria-controls="password"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </UInput>
            </UFormField>
            <UFormField name="confirmPassword">
              <UInput
                class="w-full"
                v-model="passwordForm.confirmPassword"
                placeholder=""
                :type="isPwd ? 'password' : 'text'"
                :ui="{ base: 'peer' }"
              >
                <!-- class="text-highlighted peer-focus:text-highlighted peer-placeholder-shown:text-dimmed pointer-events-none absolute -top-1.5 left-0 px-1.5 text-xs font-medium transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-focus:-top-1.5 peer-focus:text-xs peer-focus:font-medium" -->
                <label
                  class="text-highlighted peer-focus:text-highlighted peer-placeholder-shown:text-dimmed pointer-events-none absolute -top-2.5 left-0 px-1.5 text-xs font-medium transition-all peer-placeholder-shown:top-1.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-focus:-top-2.5 peer-focus:text-xs peer-focus:font-medium"
                >
                  <span class="bg-default inline-flex px-1">确认新密码</span>
                </label>
                <template #trailing>
                  <UButton
                    color="neutral"
                    variant="link"
                    size="sm"
                    :icon="isPwd ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    :aria-label="isPwd ? 'Hide password' : 'Show password'"
                    :aria-pressed="isPwd"
                    aria-controls="password"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </UInput>
            </UFormField>
            <UButton type="submit">修改密码</UButton>
          </UForm>
        </div>
      </template>
    </UDrawer>

    <DefineLogoutFooterTemplate>
      <UButton
        label="取消"
        color="neutral"
        variant="outline"
        class="justify-center"
        @click="openLogoutDrawer = false"
      />
      <UButton label="确认" class="justify-center" @click="onLogout" />
    </DefineLogoutFooterTemplate>
    <UModal
      v-if="isDesktop"
      v-model:open="openLogoutDrawer"
      title="退出登录"
      description=" "
    >
      <template #footer>
        <ReuseLogoutFooterTemplate></ReuseLogoutFooterTemplate>
      </template>
    </UModal>
    <UDrawer
      v-else
      v-model:open="openLogoutDrawer"
      direction="bottom"
      title="退出登录"
      description=" "
    >
      <template #footer>
        <ReuseLogoutFooterTemplate></ReuseLogoutFooterTemplate>
      </template>
    </UDrawer>

    <DefineNicknameFormBodyTemplate>
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
    </DefineNicknameFormBodyTemplate>
    <UModal
      v-if="isDesktop"
      v-model:open="openNicknameDrawer"
      title="修改昵称"
      description=" "
    >
      <template #body>
        <ReuseNicknameFormBodyTemplate></ReuseNicknameFormBodyTemplate>
      </template>
    </UModal>
    <UDrawer
      v-else
      v-model:open="openNicknameDrawer"
      title="修改昵称"
      description=" "
    >
      <template #body>
        <ReuseNicknameFormBodyTemplate></ReuseNicknameFormBodyTemplate>
      </template>
    </UDrawer>

    <DefineGenderFormBodyTemplate>
      <USelect
        class="w-full"
        v-model="userInfoForm.gender"
        :items="genderOptions"
      />
    </DefineGenderFormBodyTemplate>
    <UModal
      v-if="isDesktop"
      v-model:open="openGenderDrawer"
      title="修改性别"
      description=" "
    >
      <template #body>
        <ReuseGenderFormBodyTemplate></ReuseGenderFormBodyTemplate>
      </template>
    </UModal>
    <UDrawer
      v-else
      v-model:open="openGenderDrawer"
      title="修改性别"
      description=" "
    >
      <template #body>
        <ReuseGenderFormBodyTemplate></ReuseGenderFormBodyTemplate>
      </template>
    </UDrawer>

    <DefineBirthdayFormBodyTemplate>
      <UInput
        class="w-full"
        v-model="userInfoForm.birthday"
        v-maska="'####/##/##'"
        placeholder="YYYY/MM/DD"
        icon="i-lucide-calendar"
      />
    </DefineBirthdayFormBodyTemplate>
    <UModal
      v-if="isDesktop"
      v-model:open="openBirthdayDrawer"
      title="修改生日"
      description=" "
    >
      <template #body>
        <ReuseBirthdayFormBodyTemplate></ReuseBirthdayFormBodyTemplate>
      </template>
    </UModal>
    <UDrawer
      v-else
      v-model:open="openBirthdayDrawer"
      title="修改生日"
      description=" "
    >
      <template #body>
        <ReuseBirthdayFormBodyTemplate></ReuseBirthdayFormBodyTemplate>
      </template>
    </UDrawer>

    <DefineRegionFormBodyTemplate>
      <div class="space-x-2">
        <USelectMenu
          class="w-1/3"
          v-model="province"
          :items="provinceOptions"
        />
        <USelectMenu class="w-1/3" v-model="city" :items="cityOptions" />
      </div>
    </DefineRegionFormBodyTemplate>
    <UModal
      v-if="isDesktop"
      v-model:open="openRegionDrawer"
      title="修改地区"
      description=" "
    >
      <template #body>
        <ReuseRegionFormBodyTemplate></ReuseRegionFormBodyTemplate>
      </template>
    </UModal>
    <UDrawer
      v-else
      v-model:open="openRegionDrawer"
      title="修改地区"
      description=" "
    >
      <template #body>
        <ReuseRegionFormBodyTemplate></ReuseRegionFormBodyTemplate>
      </template>
    </UDrawer>
  </div>
</template>

<script lang="ts" setup>
import { updatePassword, updateProfile } from '@/apis/user'
import { useEncryptUserInfo, useLogout, useTransformGender } from '@/hooks'
import { useUserInfoStore } from '@/store'
import { storeToRefs } from 'pinia'
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { vMaska } from 'maska/vue'
import * as z from 'zod'
import { createReusableTemplate, useMediaQuery } from '@vueuse/core'
import { provinceCityMap } from '@/const'

const [DefineNicknameFormBodyTemplate, ReuseNicknameFormBodyTemplate] =
  createReusableTemplate()
const [DefineGenderFormBodyTemplate, ReuseGenderFormBodyTemplate] =
  createReusableTemplate()
const [DefineBirthdayFormBodyTemplate, ReuseBirthdayFormBodyTemplate] =
  createReusableTemplate()
const [DefineRegionFormBodyTemplate, ReuseRegionFormBodyTemplate] =
  createReusableTemplate()
const [DefineLogoutFooterTemplate, ReuseLogoutFooterTemplate] =
  createReusableTemplate()
const isDesktop = useMediaQuery('(min-width: 768px)')
const openProfileDrawer = ref(false)
const openGenderDrawer = ref(false)
const openBirthdayDrawer = ref(false)
const openRegionDrawer = ref(false)
const openNicknameDrawer = ref(false)
const openUpdatePasswordDrawer = ref(false)
const openLogoutDrawer = ref(false)
const schema = z.object({
  oldPassword: z.string().min(8, '密码长度至少为 8 位'),
  password: z.string().min(8, '密码长度至少为 8 位'),
  confirmPassword: z
    .string()
    .refine(
      () => passwordForm.password === passwordForm.confirmPassword,
      '新密码不一致'
    )
})
const cards = [
  [
    {
      icon: 'lucide:user-round',
      label: '个人资料',
      click: () => (openProfileDrawer.value = true)
    },
    {
      icon: 'lucide:user-round',
      label: '意见反馈',
      click: () => (openProfileDrawer.value = true)
    }
  ],
  [
    {
      icon: 'lucide:key',
      label: '修改密码',
      click: () => (openUpdatePasswordDrawer.value = true)
    },
    {
      icon: 'lucide:log-out',
      label: '退出登录',
      click: () => (openLogoutDrawer.value = true)
    }
  ]
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
const { userInfo } = storeToRefs(useUserInfoStore())
const userInfoForm = ref({ ...userInfo.value })
const router = useRouter()
const passwordForm = reactive({
  oldPassword: '',
  password: '',
  confirmPassword: ''
})
const isPwd = ref(true)
const { region } = userInfo.value
const [_province, _city] = region === '未知' ? ['', ''] : region.split(' - ')
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
const toast = useToast()

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

const onUpdatePassword = async () => {
  const { oldPassword, password } = passwordForm

  try {
    const encryptedUserInfo = await useEncryptUserInfo({
      oldPassword,
      password
    })
    const { message } = await updatePassword(encryptedUserInfo)
    toast.add({
      title: message,
      color: 'success'
    })
    useLogout()
    router.replace('/login')
  } catch (error) {
    toast.add({
      title: error.essage,
      color: 'error'
    })
  }
}

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

const onLogout = () => {
  useLogout()
  router.replace('/login')
}
</script>
