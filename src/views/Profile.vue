<template>
  <div class="flex items-center justify-center">
    <q-list
      v-if="userInfo"
      class="w-full max-w-[var(--room-width)] rounded-[12px] bg-[#202127]"
      separator
    >
      <q-item clickable v-ripple>
        <q-item-section class="text-base">头像</q-item-section>
        <q-item-section side class="flex !flex-row !text-gray-500">
          <img class="w-[32px] rounded-full" :src="_userInfo.avatar" />
          <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
        </q-item-section>
      </q-item>
      <q-item @click="onEditNickname" clickable v-ripple>
        <q-item-section class="text-base">昵称</q-item-section>
        <q-item-section side class="flex !flex-row !text-gray-500">
          <div>{{ _userInfo.nickname }}</div>
          <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
        </q-item-section>
      </q-item>
      <q-item @click="onEditGender" clickable v-ripple>
        <q-item-section class="text-base">性别</q-item-section>
        <q-item-section side class="flex !flex-row !text-gray-500">
          <div>
            {{ _userInfo.gender === 'other' ? '未知' : _userInfo.gender }}
          </div>
          <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
        </q-item-section>
      </q-item>
      <q-item @click="onEditBirthday" clickable v-ripple>
        <q-item-section class="text-base">生日</q-item-section>
        <q-item-section side class="flex !flex-row !text-gray-500">
          <div>{{ !_userInfo.birthday ? '未知' : _userInfo.birthday }}</div>
          <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
        </q-item-section>
      </q-item>
      <q-item clickable v-ripple>
        <q-item-section class="text-base">地区</q-item-section>
        <q-item-section side class="flex !flex-row !text-gray-500">
          <div>{{ _userInfo.region }}</div>
          <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
        </q-item-section>
      </q-item>

      <q-item @click="onLogout" clickable v-ripple>
        <q-item-section class="text-base">退出登录</q-item-section>
        <q-item-section side class="!text-gray-500">
          <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
        </q-item-section>
      </q-item>
    </q-list>

    <q-dialog v-model="showBirthdayDialog" persistent>
      <q-date v-model="date" :locale="dateLocale">
        <div class="flex justify-end">
          <q-btn class="!mr-4" v-close-popup label="取消" color="primary" />
          <q-btn
            @click="updateBirthday"
            v-close-popup
            label="确认"
            color="primary"
          />
        </div>
      </q-date>
    </q-dialog>
  </div>
</template>

<script lang="ts" setup>
import { dateLocale } from '@/const'
import { useDialog } from '@/hooks'
import { useUserInfoStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const date = ref('')
const showBirthdayDialog = ref(false)
const { userInfo } = storeToRefs(useUserInfoStore())
const _userInfo = userInfo.value
const router = useRouter()

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
    router.push('/login')
  })
}

const updateBirthday = () => (_userInfo.birthday = date.value)

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
  }).onOk(data => (_userInfo.nickname = data))
}
</script>
