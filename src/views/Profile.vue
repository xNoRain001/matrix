<template>
  <div class="flex flex-col items-center justify-center">
    <div class="w-full max-w-[var(--room-width)]">
      <div v-if="panel !== 'default'" class="flex items-center">
        <q-btn
          dense
          flat
          round
          @click="onBackFromProfile"
          icon="arrow_back_ios_new"
        ></q-btn>
        <div class="absolute left-1/2 -translate-x-1/2 text-base">返回</div>
      </div>

      <q-tab-panels
        class="mt-4 rounded-[12px] !bg-[#202127]"
        v-model="panel"
        animated
      >
        <q-tab-panel name="default">
          <q-list>
            <q-item
              class="rounded-[12px]"
              @click="panel = 'profile'"
              clickable
              v-ripple
            >
              <q-item-section class="text-base">个人资料</q-item-section>
              <q-item-section
                side
                class="flex !flex-row !items-center !text-gray-500"
              >
                <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item class="rounded-[12px]" @click="onLogout" clickable v-ripple>
              <q-item-section class="text-base">退出登录</q-item-section>
              <q-item-section side class="!text-gray-500">
                <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
              </q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>

        <q-tab-panel name="profile">
          <q-list>
            <q-item class="rounded-[12px]" clickable v-ripple>
              <q-item-section class="text-base">头像</q-item-section>
              <q-item-section
                side
                class="flex !flex-row !items-center !text-gray-500"
              >
                <img class="w-[32px] rounded-full" :src="userInfo.avatar" />
                <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item
              class="rounded-[12px]"
              @click="onEditNickname"
              clickable
              v-ripple
            >
              <q-item-section class="text-base">昵称</q-item-section>
              <q-item-section
                side
                class="flex !flex-row !items-center !text-gray-500"
              >
                <div>{{ userInfo.nickname }}</div>
                <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item
              class="rounded-[12px]"
              @click="onEditGender"
              clickable
              v-ripple
            >
              <q-item-section class="text-base">性别</q-item-section>
              <q-item-section
                side
                class="flex !flex-row !items-center !text-gray-500"
              >
                <div>
                  {{
                    userInfo.gender === 'other'
                      ? '未知'
                      : userInfo.gender === 'male'
                        ? '男'
                        : '女'
                  }}
                </div>
                <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item
              class="rounded-[12px]"
              @click="onEditBirthday"
              clickable
              v-ripple
            >
              <q-item-section class="text-base">生日</q-item-section>
              <q-item-section
                side
                class="flex !flex-row !items-center !text-gray-500"
              >
                <div>
                  {{ !userInfo.birthday ? '未知' : userInfo.birthday }}
                </div>
                <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item class="rounded-[12px]" clickable v-ripple>
              <q-item-section class="text-base">地区</q-item-section>
              <q-item-section
                side
                class="flex !flex-row !items-center !text-gray-500"
              >
                <div>{{ userInfo.region }}</div>
                <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
              </q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <q-dialog v-model="showBirthdayDialog" persistent>
      <q-date v-model="userInfo.birthday" :locale="dateLocale">
        <div class="flex justify-end">
          <q-btn class="!mr-4" v-close-popup label="取消" color="primary" />
          <q-btn v-close-popup label="确认" color="primary" />
        </div>
      </q-date>
    </q-dialog>
  </div>
</template>

<script lang="ts" setup>
import { updateProfile } from '@/apis/user'
import { dateLocale } from '@/const'
import { useDialog, useNotify } from '@/hooks'
import { useUserInfoStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const panel = ref('default')
const showBirthdayDialog = ref(false)
const { userInfo } = storeToRefs(useUserInfoStore())
const _userInfo = userInfo.value
let oldUserInfo = JSON.parse(JSON.stringify(_userInfo))
const router = useRouter()

const onBackFromProfile = async () => {
  panel.value = 'default'
  const keys = Object.keys(oldUserInfo)

  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]

    if (oldUserInfo[key] !== _userInfo[key]) {
      const s = JSON.stringify(_userInfo)
      const data = JSON.parse(s)
      delete data.id
      try {
        const {
          data: { token }
        } = await updateProfile(data)
        localStorage.setItem('token', token)
        oldUserInfo = JSON.parse(s)
        useNotify('修改资料成功')
      } catch (error) {
        useNotify(error, 'negative')
      }
      break
    }
  }
}

const onLogout = () => {
  useDialog({
    class: 'bg-[#0d1117]',
    title: '离开',
    message: '你确定要退出账号码？',
    persistent: true,
    ok: '确定',
    cancel: '取消',
    color: 'primary'
  }).onOk(() => {
    localStorage.removeItem('token')
    userInfo.value = null
    router.push('/login')
  })
}

const onEditBirthday = () => (showBirthdayDialog.value = true)

const onEditGender = () => {
  useDialog({
    title: '修改性别',
    options: {
      type: 'radio',
      model: _userInfo.gender,
      items: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' }
      ]
    },
    color: 'primary',
    persistent: true,
    cancel: '取消',
    ok: '确认'
  }).onOk(data => (_userInfo.gender = data))
}

const onEditNickname = () => {
  useDialog({
    title: '修改昵称',
    prompt: {
      model: _userInfo.nickname,
      type: 'text'
    },
    color: 'primary',
    persistent: true,
    cancel: '取消',
    ok: '确认'
  }).onOk(data => {
    if (!data.length) {
      _userInfo.nickname = oldUserInfo.value.nickname
      useNotify('昵称不能为空', 'warning')
    } else {
      _userInfo.nickname = data
    }
  })
}
</script>
