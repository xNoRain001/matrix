<template>
  <div class="flex justify-center">
    <div class="grid w-full max-w-[var(--room-width)] grid-cols-1 gap-4">
      <div class="flex-center flex">
        <img class="rounded-full" :src="avatar" />
      </div>
      <q-input dense outlined label="昵称" v-model="nickname" />
      <q-select
        dense
        outlined
        label="性别"
        :options="genderOptions"
        options-dense
        v-model="gender"
      />
      <q-input dense outlined label="地区" v-model="region" />
      <q-btn label="确认" color="primary" rounded></q-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const nickname = ref('昵称')
const avatar = ref('https://cdn.quasar.dev/img/avatar4.jpg')
const region = ref('')
const gender = ref('')
const genderOptions = ['男', '女']
</script>
