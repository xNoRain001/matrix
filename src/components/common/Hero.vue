<template>
  <div
    v-for="[cover, title, character] in cards"
    class="group relative mt-4 h-[300px] w-[200px] rounded-lg"
  >
    <img
      :src="cover"
      class="absolute left-0 z-10 h-full w-full duration-500 group-hover:transform-[perspective(500px)_rotateX(25deg)] group-hover:shadow-[0_35px_35px_-8px_rgba(0,0,0,0.75)]"
    />
    <img
      :src="title"
      class="absolute bottom-0 left-0 z-30 w-full duration-500 group-hover:transform-[perspective(500px)_translate3d(0,-25px,50px)]"
    />
    <img
      :src="character"
      class="absolute left-0 z-20 h-full w-full opacity-0 duration-500 group-hover:transform-[perspective(500px)_translate3d(0,-50px,50px)] group-hover:opacity-100"
    />
  </div>
</template>

<script lang="ts" setup>
const cards = [
  [
    'https://fecoder-pic-1302080640.cos.ap-nanjing.myqcloud.com/dark_rider-cover.jpg',
    'https://fecoder-pic-1302080640.cos.ap-nanjing.myqcloud.com/dark_rider-title.png',
    'https://fecoder-pic-1302080640.cos.ap-nanjing.myqcloud.com/dark_rider-character.webp'
  ],
  [
    'https://fecoder-pic-1302080640.cos.ap-nanjing.myqcloud.com/force_mage-cover.jpg',
    'https://fecoder-pic-1302080640.cos.ap-nanjing.myqcloud.com/force_mage-title.png',
    'https://fecoder-pic-1302080640.cos.ap-nanjing.myqcloud.com/force_mage-character.webp'
  ]
]
</script>
