<template>
  <USlideover
    :class="isMobile ? 'max-w-none' : ''"
    :title="title"
    description=" "
    :ui="{
      body: 'space-y-4 sm:space-y-6',
      description: 'hidden'
    }"
  >
    <template #body>
      <UPageCard
        title="文本"
        description="输入文本内容"
        variant="naked"
        orientation="horizontal"
        class="mb-4"
      />
      <UTextarea
        placeholder="描述一下商品的品牌类型、来源..."
        v-model="payload.text"
        class="w-full"
        autoresize
        :rows="5"
        :maxrows="5"
        maxlength="2000"
        :ui="{ trailing: 'flex items-end' }"
      >
        <template v-if="payload.text" #trailing>
          <div class="text-muted py-1.5 text-xs tabular-nums">
            {{ payload.text.length }}/2000
          </div>
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="lucide:circle-x"
            @click="payload.text = ''"
          />
        </template>
      </UTextarea>
      <UPageCard
        title="图片"
        description="选择图片（最多 9 张，单张 ≤ 10MB），支持拖拽排序"
        variant="naked"
        orientation="horizontal"
        class="mb-4"
        :ui="{
          container: 'lg:grid-cols-1'
        }"
      />
      <UFileUpload
        ref="fileUploadRef"
        @update:model-value="onUpdateFile"
        v-model="files"
        :dropzone="false"
        icon="lucide:plus"
        accept="image/png, image/jpeg, image/gif"
        multiple
        :ui="{
          files: 'grid-cols-3'
        }"
      />
      <UPageCard
        title="价格"
        variant="naked"
        orientation="horizontal"
        class="mb-4"
      />
      <UInput class="w-full" placeholder="0.00" v-model="price" maxlength="7" />
      <UPageCard
        title="发货方式"
        variant="naked"
        orientation="horizontal"
        class="mb-4"
      />
      <USelect
        class="w-full"
        v-model="expressDelivery"
        :items="expressDeliveryItems"
      />
      <template v-if="expressDelivery === '买家自提'">
        <UPageCard
          title="宿舍位置"
          variant="naked"
          orientation="horizontal"
          class="mb-4"
        />
        <UInput class="w-full" v-model="address" />
      </template>
    </template>
    <template #footer>
      <UButton
        class="flex-1 justify-center"
        :disabled="
          !(
            (payload.text || files.length) &&
            price &&
            (expressDelivery !== '买家自提' ||
              (expressDelivery === '买家自提' && address))
          )
        "
        :label="title"
        loading-auto
        @click="isPublishProduct ? onPublishProduct() : onUpdateProduct()"
      />
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { usePostStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { onMounted, reactive, ref, useTemplateRef, watch } from 'vue'
import { useSortable } from '@vueuse/integrations/useSortable'
import { useURLToBlob } from '@/hooks'
import useUploadFilesToOSS from '@/hooks/use-upload-files-to-oss'
import type { content } from '@/types'
import { publishProductAPI, updateProductAPI } from '@/apis/product'

let sortable = false
const props = defineProps<{
  action: 'publishProduct' | 'updateProduct'
  targetId?: string
}>()
const { VITE_OSS_BASE_URL } = import.meta.env
const { postMap } = storeToRefs(usePostStore())
const { action } = props
const isPublishProduct = action === 'publishProduct'
const isUpdateProduct = action === 'updateProduct'
const initFiles = async () => {
  const initCommentFiles = async images => {
    const files = []
    for (let i = 0, l = images.length; i < l; i++) {
      const { width, height, url } = images[i]
      const blob = await useURLToBlob(VITE_OSS_BASE_URL + url)
      ;(blob as any).ossURL = url
      ;(blob as any).width = width
      ;(blob as any).height = height
      files.push(blob)
    }

    return files
  }

  return isUpdateProduct
    ? await initCommentFiles(
        postMap.value[props.targetId].activeProduct.content.images
      )
    : []
}
const files = ref(await initFiles())
const oldFilesOrder = files.value.map(item => item.ossURL)
const oldFileLength = files.value.length
const payload: content = reactive({
  text: isPublishProduct
    ? ''
    : postMap.value[props.targetId].activeProduct.content.text,
  images: []
})
const oldText = payload.text
const oldPrice = isPublishProduct
  ? ''
  : postMap.value[props.targetId].activeProduct.price
const oldExpressDelivery = isPublishProduct
  ? ''
  : postMap.value[props.targetId].activeProduct.expressDelivery
const oldAddress = isPublishProduct
  ? ''
  : postMap.value[props.targetId].activeProduct.address
const { userInfo, isMobile } = storeToRefs(useUserStore())
const toast = useToast()
const emit = defineEmits<{ close: [boolean] }>()
const title = isPublishProduct ? '发布商品' : '更新商品'
const fileUploadRef = useTemplateRef('fileUploadRef')
const price = ref(isPublishProduct ? '' : oldPrice)
const expressDelivery = ref(isPublishProduct ? '买家自提' : oldExpressDelivery)
const expressDeliveryItems = ['买家自提', '送货上门']
const address = ref(isPublishProduct ? '' : oldAddress)

const initDraggable = () => {
  if (!sortable) {
    sortable = true

    // 选择图片，视图更新后的 children[0] 才是图片容器
    setTimeout(() => {
      useSortable(
        fileUploadRef.value.dropzoneRef.children[0] as HTMLElement,
        files,
        { animation: 150 }
      )
    })
  }
}

const onUpdateFile = files => {
  let t = false
  const { length } = files

  if (length > 9) {
    for (let i = 0, l = length - 9; i < l; i++) {
      files.pop()
      t = true
    }
  }

  if (t) {
    toast.add({
      title: '图片数量达到上限',
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }

  t = false

  for (let i = 0; i < files.length; i++) {
    if (files[i].size > 10 * 1024 * 1024) {
      t = true
      files.splice(i, 1)
      i--
    }
  }

  if (t) {
    toast.add({
      title: '已移除尺寸过大的图片',
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }

  if (files.length) {
    initDraggable()
  } else {
    // 数量为 0 时会销毁容器，下次发生变化时需要重新绑定
    sortable = false
  }
}

const onPublishProduct = async () => {
  try {
    payload.images = await useUploadFilesToOSS(userInfo, 'image', files.value)
    const formData = new FormData()
    formData.append('type', 'publishProduct')
    formData.append('content', JSON.stringify(payload))
    formData.append('price', price.value)
    formData.append('expressDelivery', expressDelivery.value)
    formData.append('address', address.value)
    formData.append('college', userInfo.value.profile.college)
    // 服务器只返回 _id 和 content
    const { data: product } = await publishProductAPI(formData)
    toast.add({ title: '发布成功', icon: 'lucide:smile' })
    // 补充其他属性
    product.visibility = 'public'
    product.createdAt = Date.now()
    product.price = Number(price.value)
    product.expressDelivery = expressDelivery.value
    product.address = address.value

    if (postMap.value[props.targetId]?.products) {
      postMap.value[props.targetId].products.unshift(product)
    }

    emit('close', true)
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

const isTextOrImageChange = () => {
  if (
    payload.text !== oldText ||
    oldPrice !== price.value ||
    oldExpressDelivery !== expressDelivery.value ||
    oldAddress !== address.value
  ) {
    return true
  }

  // 判断是否更新了图片顺序
  for (let i = 0, l = oldFilesOrder.length; i < l; i++) {
    // 可能删除了所有图片，此时 files 为空数组
    if (oldFilesOrder[i] !== files.value[i]?.ossURL) {
      return true
    }
  }

  // 图片顺序没更新，但是有可能在最后新增了图片
  if (files.value.length === oldFileLength) {
    emit('close', true)
    toast.add({ title: '更新成功', icon: 'lucide:smile' })
    return false
  }

  return true
}

const onUpdateProduct = async () => {
  if (!isTextOrImageChange()) {
    return
  }

  try {
    payload.images = await useUploadFilesToOSS(userInfo, 'image', files.value)
    const formData = new FormData()
    const activeProductId = postMap.value[props.targetId].activeProductId
    formData.append('type', 'updateProduct')
    formData.append('productId', activeProductId)
    const stringifyPayload = JSON.stringify(payload)
    formData.append('content', stringifyPayload)
    formData.append('price', price.value)
    formData.append('expressDelivery', expressDelivery.value)
    formData.append('address', address.value)
    formData.append('college', userInfo.value.profile.college)
    await updateProductAPI(formData)
    const { images } = payload
    toast.add({ title: '更新成功', icon: 'lucide:smile' })
    const _activeProduct = postMap.value[props.targetId].activeProduct
    for (let i = 0, l = images.length; i < l; i++) {
      const image = images[i]
      const { url } = image

      // 修改新增的图片的 url
      if (url.startsWith('tmp/')) {
        image.url = `posts/${activeProductId}/${url.split('/')[2]}`
      }
    }
    _activeProduct.updateAt = Date.now()
    _activeProduct.content = payload
    _activeProduct.price = price.value
    _activeProduct.expressDelivery = expressDelivery.value
    _activeProduct.address = address.value
    emit('close', true)
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

watch(expressDelivery, v => {
  if (v === '送货上门') {
    address.value = ''
  }
})

onMounted(() => {
  setTimeout(() => {
    if (files.value.length) {
      initDraggable()
    }
  })
})
</script>
