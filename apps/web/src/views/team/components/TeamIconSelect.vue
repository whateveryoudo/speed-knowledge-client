<template>
  <a-popover
    v-model:open="popoverOpen"
    trigger="click"
    placement="bottomLeft"
    :overlay-style="{ width: currentTab === 'custom' && rawImageSrc ? '370px' : '280px' }"
    overlay-class-name="team-icon-select-popover"
    :destroy-tooltip-on-hide="false"
  >
    <!-- 弹窗触发按钮 -->
    <div
      class="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-md border border-solid border-[var(--ant-color-border)] bg-[var(--ant-color-bg-container)] cursor-pointer hover:border-[var(--ant-color-primary)] transition-colors overflow-hidden"
    >
      <TeamAvatar :icon="value || 'icon-book-10'" :size="30" rounded="4px" />
    </div>

    <!-- 弹窗内容 -->
    <template #content>
      <div class="team-icon-popover-content">
        <!-- 标签头：图标 / 自定义 -->
        <div class="flex items-center gap-6 border-0 border-b border-solid border-[var(--ant-color-border-secondary)] pb-2 mb-3">
          <div
            class="text-[14px] cursor-pointer relative pb-1 transition-colors select-none"
            :class="currentTab === 'preset' ? 'font-semibold text-[var(--ant-color-text)]' : 'text-[var(--sd-text-caption)] hover:text-[var(--ant-color-text-secondary)]'"
            @click="switchTab('preset')"
          >
            图标
            <div
              v-if="currentTab === 'preset'"
              class="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-[var(--ant-color-text)] rounded-full"
            />
          </div>
          <div
            class="text-[14px] cursor-pointer relative pb-1 transition-colors select-none"
            :class="currentTab === 'custom' ? 'font-semibold text-[var(--ant-color-text)]' : 'text-[var(--sd-text-caption)] hover:text-[var(--ant-color-text-secondary)]'"
            @click="switchTab('custom')"
          >
            自定义
            <div
              v-if="currentTab === 'custom'"
              class="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-[var(--ant-color-text)] rounded-full"
            />
          </div>
        </div>

        <!-- Tab 1: 预设图标列表 (内部顺序已调换，团队图标 icon-book-10 居首) -->
        <div v-show="currentTab === 'preset'">
          <div class="grid grid-cols-5 gap-2 py-1">
            <div
              v-for="item in presetIcons"
              :key="item"
              class="flex h-[36px] w-[36px] items-center justify-center rounded-md cursor-pointer hover:bg-[var(--sd-bg-primary-hover)] transition-all"
              :class="{ 'bg-[var(--ant-color-primary-bg)] ring-1 ring-[var(--ant-color-primary)]': value === item }"
              @click="handleSelectPreset(item)"
            >
              <s-icon-font :type="item" svg-sprite style="width: 24px; height: 24px;" />
            </div>
          </div>
        </div>

        <!-- Tab 2: 自定义上传与裁剪 -->
        <div v-show="currentTab === 'custom'">
          <!-- 状态 A: 尚未选图，或已保存且无未提交裁剪图片 -->
          <div v-if="!rawImageSrc" class="py-2">
            <!-- 如果当前已有自定义头像，展示当前头像与重新上传按钮 -->
            <div v-if="isCustomValue" class="flex flex-col items-center justify-center p-3">
              <div class="h-[72px] w-[72px] rounded-lg overflow-hidden border border-solid border-[var(--ant-color-border)] shadow-sm mb-3">
                <img :src="value" class="w-full h-full object-cover" />
              </div>
              <a-button size="middle" @click="triggerFileInput">
                <template #icon><UploadOutlined /></template>
                更换头像
              </a-button>
            </div>

            <!-- 否则展示上传拖入框（与语雀样式一致） -->
            <div
              v-else
              class="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--ant-color-border)] bg-[var(--sd-bg-secondary)] py-8 px-4 hover:border-[var(--ant-color-success)] transition-colors cursor-pointer"
              @click="triggerFileInput"
              @dragover.prevent
              @drop.prevent="handleDrop"
            >
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded border border-solid border-[var(--ant-color-success)] bg-[var(--ant-color-bg-container)] px-4 py-1.5 text-[14px] text-[var(--ant-color-success)] hover:bg-[var(--ant-color-success-bg)] transition-colors pointer-events-none"
              >
                <UploadOutlined />
                <span>上传头像</span>
              </button>
              <div class="mt-3 text-[12px] text-[var(--sd-text-caption)] pointer-events-none select-none">
                在此上传或拖入头像
              </div>
            </div>
          </div>

          <!-- 状态 B: 已选图，进入裁剪视图（与语雀布局一致） -->
          <div v-else class="pt-1">
            <div class="flex gap-4">
              <!-- 左侧裁剪区 -->
              <div class="cropper-container-wrapper relative h-[210px] w-[210px] shrink-0 overflow-hidden rounded bg-[#1a1a1a]">
                <img
                  ref="imageElementRef"
                  :src="rawImageSrc"
                  class="max-w-full block"
                  alt="Avatar"
                />
              </div>

              <!-- 右侧预览区 -->
              <div class="flex flex-col items-center justify-center flex-1">
                <div class="team-avatar-preview h-[76px] w-[76px] overflow-hidden rounded-lg border border-solid border-[var(--ant-color-border)] bg-[var(--ant-color-bg-layout)] shadow-inner" />
                <div class="mt-2 text-[12px] text-[var(--sd-text-caption)]">预览</div>
              </div>
            </div>

            <!-- 底部操作按钮 -->
            <div class="mt-4 pt-3 flex items-center justify-between border-0 border-t border-solid border-[var(--ant-color-border-secondary)]">
              <a-button size="small" @click="triggerFileInput">
                <template #icon><UploadOutlined /></template>
                重新上传
              </a-button>
              <div class="flex items-center gap-2">
                <a-button size="small" @click="handleCancelCrop">取消</a-button>
                <a-button
                  size="small"
                  type="primary"
                  class="!bg-[var(--ant-color-success)] hover:!bg-[var(--ant-color-success-hover)] border-none"
                  :loading="uploading"
                  @click="handleConfirmCrop"
                >
                  确定
                </a-button>
              </div>
            </div>
          </div>

          <!-- 隐藏的文件选择 input -->
          <input
            ref="fileInputRef"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
            class="hidden"
            @change="handleFileChange"
          />
        </div>
      </div>
    </template>
  </a-popover>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onBeforeUnmount } from 'vue'
import { message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import to from 'await-to-js'
import { attachment as attachmentApi } from '@sk/api'
import { getPublicAttachmentPreviewUrl } from '#sk-web/plugins/editorApis'
import TeamAvatar from './TeamAvatar.vue'

const props = withDefaults(
  defineProps<{
    value: string
  }>(),
  {
    value: 'icon-book-10',
  },
)

const emit = defineEmits<{
  'update:value': [value: string]
}>()

const popoverOpen = ref(false)
const currentTab = ref<'preset' | 'custom'>('preset')

// 预设图标顺序：把团队/多人协作的 icon-book-10, icon-book-11 置于首位
const presetIcons = [
  'icon-book-10', // 经典双人协作/团队图标
  'icon-book-11', // 多人/社群图标
  'icon-book-0',
  'icon-book-1',
  'icon-book-2',
  'icon-book-3',
  'icon-book-4',
  'icon-book-5',
  'icon-book-6',
  'icon-book-7',
  'icon-book-8',
  'icon-book-9',
  'icon-book-12',
  'icon-book-13',
  'icon-book-14',
]

/** 判断当前值是否为自定义上传的图片 */
const isCustomValue = computed(() => {
  if (!props.value) return false
  return (
    props.value.startsWith('http://') ||
    props.value.startsWith('https://') ||
    props.value.startsWith('/') ||
    props.value.startsWith('data:image/') ||
    props.value.startsWith('blob:')
  )
})

// ----------------- 自定义上传与 Cropper 裁剪状态与函数 -----------------
const fileInputRef = ref<HTMLInputElement | null>(null)
const imageElementRef = ref<HTMLImageElement | null>(null)
const rawImageSrc = ref('')
const uploading = ref(false)
let cropperInstance: Cropper | null = null

const destroyCropper = () => {
  if (cropperInstance) {
    cropperInstance.destroy()
    cropperInstance = null
  }
}

const handleCancelCrop = () => {
  destroyCropper()
  if (rawImageSrc.value && rawImageSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(rawImageSrc.value)
  }
  rawImageSrc.value = ''
}

// 初始化/打开时判断当前应该处于哪个 Tab
watch(
  popoverOpen,
  (open) => {
    if (open) {
      currentTab.value = isCustomValue.value ? 'custom' : 'preset'
    } else {
      handleCancelCrop()
    }
  },
)

const switchTab = (tab: 'preset' | 'custom') => {
  currentTab.value = tab
  if (tab === 'custom' && rawImageSrc.value) {
    nextTick(() => {
      initCropper()
    })
  }
}

const handleSelectPreset = (item: string) => {
  emit('update:value', item)
  popoverOpen.value = false
}

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
    fileInputRef.value.click()
  }
}

const handleDrop = (e: DragEvent) => {
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const processFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    message.error('请选择有效的图片文件')
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    message.error('图片大小不能超过 10MB')
    return
  }

  // 释放之前的临时 URL
  if (rawImageSrc.value && rawImageSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(rawImageSrc.value)
  }

  // 在前端内存中生成临时本地地址供 Cropper 编辑
  rawImageSrc.value = URL.createObjectURL(file)

  nextTick(() => {
    initCropper()
  })
}

const initCropper = () => {
  destroyCropper()
  if (!imageElementRef.value) return

  cropperInstance = new Cropper(imageElementRef.value, {
    aspectRatio: 1, // 锁定正方形比例
    viewMode: 1, // 限制裁剪框不能超出图片边界
    dragMode: 'move',
    autoCropArea: 0.9,
    restore: false,
    guides: true,
    center: true,
    highlight: false,
    cropBoxMovable: true,
    cropBoxResizable: true,
    toggleDragModeOnDblclick: false,
    preview: '.team-avatar-preview', // 右侧预览选择器
  })
}


const handleConfirmCrop = () => {
  if (!cropperInstance) return

  // 获取裁剪后 canvas (规范导出为 256x256 尺寸，既清晰又极度节省存储)
  const canvas = cropperInstance.getCroppedCanvas({
    width: 256,
    height: 256,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  })

  if (!canvas) {
    message.error('图片裁剪失败，请重试')
    return
  }

  uploading.value = true
  canvas.toBlob(async (blob) => {
    if (!blob) {
      uploading.value = false
      message.error('导出图片失败')
      return
    }

    const file = new File([blob], 'team-avatar.png', { type: 'image/png' })
    const formData = new FormData()
    formData.append('file', file)

    // 调用通用附件上传接口
    const [err, res] = await to(attachmentApi.fileUploadSingle(formData))
    uploading.value = false

    if (err || !res?.data?.id) {
      message.error(err?.message || '上传头像失败，请稍后重试')
      return
    }

    // 拼接公开预览地址并更新
    const previewUrl = getPublicAttachmentPreviewUrl(res.data.id)
    emit('update:value', previewUrl)
    message.success('头像设置成功')

    // 清理状态并关闭 Popover
    handleCancelCrop()
    popoverOpen.value = false
  }, 'image/png')
}

onBeforeUnmount(() => {
  destroyCropper()
  if (rawImageSrc.value && rawImageSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(rawImageSrc.value)
  }
})
</script>

<style scoped>
.cropper-container-wrapper :deep(.cropper-view-box) {
  border-radius: 8px;
  outline: 2px solid var(--ant-color-success);
  outline-color: var(--ant-color-success);
}

.cropper-container-wrapper :deep(.cropper-line) {
  background-color: var(--ant-color-success);
}

.cropper-container-wrapper :deep(.cropper-point) {
  background-color: var(--ant-color-success);
}

.team-avatar-preview {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
