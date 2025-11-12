<template>
  <USlideover
    :class="isMobile ? 'max-w-none' : ''"
    :close="{ onClick: () => emit('close', false) }"
    title="混淆图片"
    description=" "
    :ui="{
      body: 'space-y-4 sm:space-y-6',
      description: 'hidden'
    }"
  >
    <template #body>
      <UPageCard
        title="图片"
        description="选择图片"
        variant="naked"
        orientation="horizontal"
        class="mb-4"
      />
      <UFileUpload
        v-model="file"
        :dropzone="false"
        accept="image/png, image/jpeg, image/gif"
        class="min-h-48"
      />
      <!-- <UPageCard
        title="参数"
        description="调整参数"
        variant="naked"
        orientation="horizontal"
        class="mb-4"
      >
      </UPageCard> -->
      <!-- <div class="flex gap-2">
        <USwitch label="彩色" v-model="isColorful"></USwitch>
        <USwitch label="反转" v-model="isReverse"></USwitch>
      </div> -->
      <UPageCard
        title="结果"
        description="渲染结果"
        variant="naked"
        orientation="horizontal"
        class="mb-4"
      />
      <canvas ref="canvasRef" class="w-full rounded-lg"></canvas>
    </template>
    <template #footer>
      <UButton class="w-full justify-center" label="确认" @click="onDone" />
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { useFileToImage, useImageToImageData } from '@/hooks'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref, useTemplateRef, watch } from 'vue'

const emit = defineEmits<{ close: [boolean] }>()
const { isMobile } = storeToRefs(useUserStore())
const file = ref(null)
const canvasRef = useTemplateRef('canvasRef')
const isEncrypt = ref(true)

const onDone = () => {
  emit('close', true)
}

const gilbert2d = (width, height) => {
  /**
   * Generalized Hilbert ('gilbert') space-filling curve for arbitrary-sized
   * 2D rectangular grids. Generates discrete 2D coordinates to fill a rectangle
   * of size (width x height).
   */
  const coordinates = []

  if (width >= height) {
    generate2d(0, 0, width, 0, 0, height, coordinates)
  } else {
    generate2d(0, 0, 0, height, width, 0, coordinates)
  }

  return coordinates
}

const generate2d = (x, y, ax, ay, bx, by, coordinates) => {
  const w = Math.abs(ax + ay)
  const h = Math.abs(bx + by)

  const dax = Math.sign(ax),
    day = Math.sign(ay) // unit major direction
  const dbx = Math.sign(bx),
    dby = Math.sign(by) // unit orthogonal direction

  if (h === 1) {
    // trivial row fill
    for (let i = 0; i < w; i++) {
      coordinates.push([x, y])
      x += dax
      y += day
    }
    return
  }

  if (w === 1) {
    // trivial column fill
    for (let i = 0; i < h; i++) {
      coordinates.push([x, y])
      x += dbx
      y += dby
    }
    return
  }

  let ax2 = Math.floor(ax / 2),
    ay2 = Math.floor(ay / 2)
  let bx2 = Math.floor(bx / 2),
    by2 = Math.floor(by / 2)

  const w2 = Math.abs(ax2 + ay2)
  const h2 = Math.abs(bx2 + by2)

  if (2 * w > 3 * h) {
    if (w2 % 2 && w > 2) {
      // prefer even steps
      ax2 += dax
      ay2 += day
    }

    // long case: split in two parts only
    generate2d(x, y, ax2, ay2, bx, by, coordinates)
    generate2d(x + ax2, y + ay2, ax - ax2, ay - ay2, bx, by, coordinates)
  } else {
    if (h2 % 2 && h > 2) {
      // prefer even steps
      bx2 += dbx
      by2 += dby
    }

    // standard case: one step up, one long horizontal, one step down
    generate2d(x, y, bx2, by2, ax2, ay2, coordinates)
    generate2d(x + bx2, y + by2, ax, ay, bx - bx2, by - by2, coordinates)
    generate2d(
      x + (ax - dax) + (bx2 - dbx),
      y + (ay - day) + (by2 - dby),
      -bx2,
      -by2,
      -(ax - ax2),
      -(ay - ay2),
      coordinates
    )
  }
}

const encryptImageData = (imageData, width, height) => {
  const coords = gilbert2d(width, height)
  const data = imageData.data
  const encrypted = new Uint8ClampedArray(data.length)

  for (let i = 0; i < coords.length; i++) {
    const [x, y] = coords[i]
    const srcIdx = (y * width + x) * 4
    const dstIdx = i * 4

    encrypted[dstIdx] = data[srcIdx]
    encrypted[dstIdx + 1] = data[srcIdx + 1]
    encrypted[dstIdx + 2] = data[srcIdx + 2]
    encrypted[dstIdx + 3] = data[srcIdx + 3]
  }

  return new ImageData(encrypted, width, height)
}

const decryptImageData = (encryptedData, width, height) => {
  const coords = gilbert2d(width, height)
  const data = encryptedData.data
  const decrypted = new Uint8ClampedArray(data.length)

  for (let i = 0; i < coords.length; i++) {
    const [x, y] = coords[i]
    const dstIdx = (y * width + x) * 4
    const srcIdx = i * 4

    decrypted[dstIdx] = data[srcIdx]
    decrypted[dstIdx + 1] = data[srcIdx + 1]
    decrypted[dstIdx + 2] = data[srcIdx + 2]
    decrypted[dstIdx + 3] = data[srcIdx + 3]
  }

  return new ImageData(decrypted, width, height)
}

const decryptImage = (width, height, imageData, ctx) => {
  const decrypted = decryptImageData(imageData, width, height)
  ctx.putImageData(decrypted, 0, 0)
}

const encryptImage = (width, height, imageData, ctx) => {
  const encryptedImageData = encryptImageData(imageData, width, height)
  ctx.putImageData(encryptedImageData, 0, 0)
}

watch(file, async v => {
  if (v) {
    const img = await useFileToImage(file.value)
    const imageData = useImageToImageData(img)
    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')
    const { width, height } = img
    const { width: canvasWidth, height: canvasHeight } = canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    canvas.width = width
    canvas.height = height
    isEncrypt.value
      ? encryptImage(width, height, imageData, ctx)
      : decryptImage(width, height, imageData, ctx)
  }
})
</script>
