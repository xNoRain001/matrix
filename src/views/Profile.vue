<template>
  <div class="flex h-[var(--content-height)] items-center justify-center">
    <q-list
      v-if="userInfo"
      class="w-full max-w-[var(--room-width)] rounded-[12px] bg-[#202127]"
      separator
    >
      <q-item clickable v-ripple class="flex-center flex">
        <q-item-section class="text-base">头像</q-item-section>
        <q-item-section avatar class="flex !flex-row !text-gray-500">
          <img class="w-[32px] rounded-full" :src="avatar" />
          <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
        </q-item-section>
      </q-item>
      <q-item
        @click="onEditNickname"
        clickable
        v-ripple
        class="flex-center flex"
      >
        <q-item-section class="text-base">昵称</q-item-section>
        <q-item-section avatar class="flex !flex-row !text-gray-500">
          <div>{{ nickname }}</div>
          <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
        </q-item-section>
      </q-item>
      <q-item @click="onEditGender" clickable v-ripple class="flex-center flex">
        <q-item-section class="text-base">性别</q-item-section>
        <q-item-section avatar class="flex !flex-row !text-gray-500">
          <div>{{ gender }}</div>
          <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
        </q-item-section>
      </q-item>
      <q-item
        @click="onEditBirthday"
        clickable
        v-ripple
        class="flex-center flex"
      >
        <q-item-section class="text-base">生日</q-item-section>
        <q-item-section avatar class="flex !flex-row !text-gray-500">
          <div>{{ birthday }}</div>
          <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
        </q-item-section>
      </q-item>
      <q-item clickable v-ripple class="flex-center flex">
        <q-item-section class="text-base">地区</q-item-section>
        <q-item-section avatar class="flex !flex-row !text-gray-500">
          <div>{{ region }}</div>
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

const nickname = ref('昵称')
const avatar = ref('https://cdn.quasar.dev/img/avatar4.jpg')
const region = ref('未知')
const gender = ref('未知')
const birthday = ref('未知')
const date = ref('')
const showBirthdayDialog = ref(false)
const { userInfo } = storeToRefs(useUserInfoStore())

const updateBirthday = () => (birthday.value = date.value)

const onEditBirthday = () => (showBirthdayDialog.value = true)

const onEditGender = () => {
  useDialog({
    title: '修改性别',
    options: {
      type: 'radio',
      model: gender.value,
      items: [
        { label: '男', value: '男' },
        { label: '女', value: '女' }
      ]
    },
    color: 'primary',
    persistent: true,
    cancel: '取消',
    ok: '确认'
  }).onOk(data => (gender.value = data))
}

const onEditNickname = () => {
  useDialog({
    title: '修改昵称',
    prompt: {
      model: nickname.value,
      type: 'text'
    },
    color: 'primary',
    persistent: true,
    cancel: '取消',
    ok: '确认'
  }).onOk(data => (nickname.value = data))
}
</script>
