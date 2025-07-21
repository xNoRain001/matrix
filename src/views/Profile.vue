<template>
  <q-input label="昵称" autofocus v-model="nickname" />
  <q-input label="头像" v-model="avatar" />
  <q-input label="性别" v-model="gender" />
  <q-input label="地区" v-model="region" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const nickname = ref('')
const avatar = ref('')
const region = ref('')
const gender = ref('')
</script>
