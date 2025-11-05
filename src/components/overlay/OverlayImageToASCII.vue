<template>
  <USlideover
    :class="isMobile ? 'max-w-none' : ''"
    :close="{ onClick: () => emit('close', false) }"
    title="ASCII"
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
      >
      </UPageCard>
      <UFileUpload
        v-model="file"
        :dropzone="false"
        accept="image/png, image/jpeg, image/gif"
        class="min-h-48"
      >
      </UFileUpload>
      <UPageCard
        title="参数"
        description="调整参数"
        variant="naked"
        orientation="horizontal"
        class="mb-4"
      >
      </UPageCard>
      <div class="flex gap-2">
        <USwitch label="彩色" v-model="isColorful"></USwitch>
        <USwitch label="反转" v-model="isReverse"></USwitch>
      </div>
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
      <UButton label="确认" @click="onDone"></UButton>
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
const asciiMap = {
  simple: [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'],
  'simple-reverse': ['@', '%', '#', '*', '+', '=', '-', ':', '.', ' ']
  // complex: [
  //   '$',
  //   '@',
  //   'B',
  //   '%',
  //   '8',
  //   '&',
  //   'W',
  //   'M',
  //   '#',
  //   '*',
  //   'o',
  //   'a',
  //   'h',
  //   'k',
  //   'b',
  //   'd',
  //   'p',
  //   'q',
  //   'w',
  //   'm',
  //   'Z',
  //   'O',
  //   '0',
  //   'Q',
  //   'L',
  //   'C',
  //   'J',
  //   'U',
  //   'Y',
  //   'X',
  //   'z',
  //   'c',
  //   'v',
  //   'u',
  //   'n',
  //   'x',
  //   'r',
  //   'j',
  //   'f',
  //   't',
  //   '/',
  //   '\\',
  //   '|',
  //   '(',
  //   ')',
  //   '1',
  //   '{',
  //   '}',
  //   '[',
  //   ']',
  //   '?',
  //   '-',
  //   '_',
  //   '+',
  //   '~',
  //   '\<',
  //   '\>',
  //   'i',
  //   '!',
  //   'l',
  //   'I',
  //   ';',
  //   ':',
  //   ',',
  //   '"',
  //   '^',
  //   '`',
  //   "'",
  //   '.',
  //   ' '
  // ],
  // 'complex-reverse': [
  //   ' ',
  //   '.',
  //   "'",
  //   '`',
  //   '^',
  //   '"',
  //   ',',
  //   ':',
  //   ';',
  //   'I',
  //   'l',
  //   '!',
  //   'i',
  //   '>',
  //   '<',
  //   '~',
  //   '+',
  //   '_',
  //   '-',
  //   '?',
  //   ']',
  //   '[',
  //   '}',
  //   '{',
  //   '1',
  //   ')',
  //   '(',
  //   '|',
  //   '\\',
  //   '/',
  //   't',
  //   'f',
  //   'j',
  //   'r',
  //   'x',
  //   'n',
  //   'u',
  //   'v',
  //   'c',
  //   'z',
  //   'X',
  //   'Y',
  //   'U',
  //   'J',
  //   'C',
  //   'L',
  //   'Q',
  //   '0',
  //   'O',
  //   'Z',
  //   'm',
  //   'w',
  //   'q',
  //   'p',
  //   'd',
  //   'b',
  //   'k',
  //   'h',
  //   'a',
  //   'o',
  //   '*',
  //   '#',
  //   'M',
  //   'W',
  //   '&',
  //   '8',
  //   '%',
  //   'B',
  //   '@',
  //   '$'
  // ]
}
const isReverse = ref(false)
const isColorful = ref(false)
const canvasRef = useTemplateRef('canvasRef')
const toast = useToast()

const onDone = () => {
  emit('close', true)
}

const drawCanvas = (
  ascii: string,
  context: CanvasRenderingContext2D,
  lineHeight: number,
  charWidth: number
) => {
  context.fillStyle = '#fff'
  const lines = ascii.split('\n')

  for (let y = 0, l = lines.length; y < l; y++) {
    // context.fillText(lines[y], 0, y * lineHeight)
    const line = lines[y]
    const _y = y * lineHeight

    for (let x = 0, l2 = line.length; x < l2; x++) {
      context.fillText(line[x], x * charWidth, _y)
    }
  }
}

const drawColorfulCanvas = (
  ascii: string,
  context: CanvasRenderingContext2D,
  lineHeight: number,
  charWidth: number
) => {
  const lines = ascii.split('<br>')

  for (let y = 0, l = lines.length; y < l; y++) {
    const regex =
      /<span style="color: rgb\((\d+),(\d+),(\d+)\);?">(.+?)<\/span>/g
    let match
    let x = 0
    while ((match = regex.exec(lines[y])) !== null) {
      const [_, r, g, b, char] = match
      context.fillStyle = `rgb(${r},${g},${b})`
      const text = char.replace('&nbsp;', ' ')
      context.fillText(text, x * charWidth, y * lineHeight)
      x += text.length
    }
  }
}

const asciiCanvasSetup = (
  asciiCanvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  image: HTMLImageElement
) => {
  // 减少细节
  // const fontSize = 20
  // const lineHeight = 10
  const fontSize = 12
  const lineHeight = 6
  const { width, height } = image
  // 动态测量字符宽度
  context.font = `${fontSize}px monospace`
  const charWidth = context.measureText('M').width
  const _width = width * charWidth
  const _height = height * lineHeight
  asciiCanvas.width = _width
  asciiCanvas.height = _height
  context.textBaseline = 'top'
  context.fillStyle = '#000'
  context.fillRect(0, 0, _width, _height)

  return { lineHeight, charWidth }
}

const asciiToCanvas = (image: HTMLImageElement, ascii: string) => {
  const canvas = canvasRef.value
  const context = canvas.getContext('2d')
  const { lineHeight, charWidth } = asciiCanvasSetup(canvas, context, image)
  isColorful.value
    ? drawColorfulCanvas(ascii, context, lineHeight, charWidth)
    : drawCanvas(ascii, context, lineHeight, charWidth)
}

const imageDataToASCII = (image: HTMLImageElement, imageData: ImageData) => {
  let ascii = ''
  const asciiList = asciiMap[isReverse.value ? 'simple-reverse' : 'simple']
  const { length } = asciiList
  const { width } = image
  let grayStep = Math.ceil(255 / length)
  const { data } = imageData

  for (let i = 0, l = data.length; i < l; i += 4) {
    for (let j = 0; j < length; j++) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // 从暗到亮分配字符
      if (r * 0.2126 + g * 0.7152 + b * 0.0722 < (j + 1) * grayStep) {
        const char = asciiList[j]
        ascii += isColorful.value
          ? `<span style="color: rgb(${r},${g},${b});">${char.replace(' ', '&nbsp;')}</span>`
          : char
        break
      }
    }

    if ((i / 4 + 1) % width === 0) {
      ascii += isColorful.value ? '<br>' : '\n'
    }
  }

  return ascii
}

const imageToASCII = async () => {
  if (!file.value) {
    return toast.add({
      title: '图片不存在',
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  const { width, height } = canvas
  ctx.clearRect(0, 0, width, height)
  const img = await useFileToImage(file.value)
  const imageData = useImageToImageData(img)
  const ascii = imageDataToASCII(img, imageData)
  asciiToCanvas(img, ascii)
}

watch(file, v => {
  if (v) {
    imageToASCII()
  }
})
watch(isColorful, imageToASCII)
watch(isReverse, imageToASCII)
</script>
