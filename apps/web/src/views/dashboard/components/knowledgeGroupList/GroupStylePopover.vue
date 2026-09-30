<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  AppstoreOutlined,
  BarsOutlined,
  BorderOutlined,
  FileImageOutlined,
  ProfileOutlined,
} from '@ant-design/icons-vue'
import {
  DEFAULT_GROUP_DISPLAY_CONFIG,
  KnowledgeGroupStyle,
  KnowledgeGroupType,
  type KnowledgeGroupDisplayConfig,
  type KnowledgeGroupItem,
} from '@sk/types'
import type { SelectValue } from 'ant-design-vue/es/select'
import ListCardActiveIcon from '#sk-web/assets/images/list_card_active.png'
import ListCardDefaultIcon from '#sk-web/assets/images/list_card_default.png'
import GroupCardActiveIcon from '#sk-web/assets/images/group_card_active.png'
import GroupCardDefaultIcon from '#sk-web/assets/images/group_card_default.png'

const props = defineProps<{
  group: KnowledgeGroupItem
}>()

const emit = defineEmits<{
  (e: 'update', value: KnowledgeGroupDisplayConfig): void
  (e: 'openChange', open: boolean): void
}>()

const open = ref(false)
const localConfig = ref<KnowledgeGroupDisplayConfig>({
  ...DEFAULT_GROUP_DISPLAY_CONFIG,
})

watch(
  () => props.group.display_config,
  (config) => {
    localConfig.value = {
      ...DEFAULT_GROUP_DISPLAY_CONFIG,
      ...config,
    }
  },
  { immediate: true, deep: true },
)

watch(open, (value) => {
  emit('openChange', value)
})

const layoutOptions = [
  { label: '卡片', value: KnowledgeGroupType.CARD, activeIcon: GroupCardActiveIcon, defaultIcon: GroupCardDefaultIcon },
  { label: '列表', value: KnowledgeGroupType.LIST, activeIcon: ListCardActiveIcon, defaultIcon: ListCardDefaultIcon },
]

const styleOptions = [
  { label: '简洁', value: KnowledgeGroupStyle.SIMPLE, icon: BorderOutlined },
  { label: '基础', value: KnowledgeGroupStyle.BASIC, icon: AppstoreOutlined },
  { label: '详情', value: KnowledgeGroupStyle.DETAIL, icon: ProfileOutlined },
  { label: '图片', value: KnowledgeGroupStyle.IMAGE, icon: FileImageOutlined },
]

const docOrderOptions = [
  { label: '更新时间', value: 1 },
  { label: '创建时间', value: 2 },
]

const emitUpdate = () => {
  emit('update', { ...localConfig.value })
}

const onLayoutChange = (type: KnowledgeGroupType) => {
  localConfig.value.type = type
  emitUpdate()
}

const onStyleChange = (style: KnowledgeGroupStyle) => {
  localConfig.value.style = style
  emitUpdate()
}

const onDocOrderChange = (value: SelectValue) => {
  localConfig.value.doc_order_type = Number(value)
  emitUpdate()
}
</script>

<template>
  <!-- 调整为click触发，避免内部select 的 浮层导致关闭（难得内部组件全部写append） -->
  <a-popover v-model:open="open" trigger="click" placement="bottomRight">
    <template #content>
      <div class="w-[280px]">
        <div class="mb-3 text-[14px] font-medium text-[var(--sd-text-grey-900)]">样式设置</div>

        <div class="mb-4">
          <div class="mb-2 text-[12px] text-[var(--sd-grey-7)]">布局</div>
          <div class="grid grid-cols-2 gap-6">
            <button v-for="item in layoutOptions" :key="item.value" type="button"
              class="flex cursor-pointer flex-col items-center bg-white gap-2 rounded-md border border-solid px-2 py-3 text-[12px] transition-colors"
              :class="localConfig.type === item.value
                ? 'border-[var(--ant-color-primary)] text-[var(--ant-color-primary)]'
                : 'border-[var(--sd-border-primary)] text-[var(--sd-grey-8)]'
                " @click="onLayoutChange(item.value)">
              <img class="w-[60px] h-auto" :src="localConfig.type === item.value ? item.activeIcon : item.defaultIcon"
                alt="layout" /> <span>{{ item.label }}</span>
            </button>
          </div>
        </div>

        <div v-if="localConfig.type === KnowledgeGroupType.CARD" class="mb-4">
          <div class="mb-2 text-[12px] text-[var(--sd-grey-7)]">卡片样式</div>
          <div class="grid grid-cols-4 gap-2">
            <button v-for="item in styleOptions" :key="item.value" type="button"
              class="flex cursor-pointer flex-col items-center bg-white gap-2 rounded-md border border-solid px-3 py-2 text-[12px] transition-colors"
              :class="localConfig.style === item.value
                ? 'border-[var(--ant-color-primary)] text-[var(--ant-color-primary)]'
                : 'border-[var(--sd-border-primary)] text-[var(--sd-grey-7)]'
                " @click="onStyleChange(item.value)">
              <component :is="item.icon" class="text-[14px]" />
              <span>{{ item.label }}</span>
            </button>
          </div>
        </div>

        <div class="mb-3 flex items-center justify-between text-[13px]">
          <span>显示知识库图标</span>
          <a-switch v-model:checked="localConfig.show_knowledge_icon" size="small" @change="emitUpdate" />
        </div>
        <div class="mb-3 flex items-center justify-between text-[13px]">
          <span>显示知识库描述</span>
          <a-switch v-model:checked="localConfig.show_knowledge_description" size="small" @change="emitUpdate" />
        </div>

        <div class="flex items-center justify-between text-[13px]">
          <span>文档列表排序</span>
          <a-select size="small" class="w-[110px]" :value="localConfig.doc_order_type" :options="docOrderOptions"
            @change="onDocOrderChange" />
        </div>
      </div>
    </template>
    <a-tooltip title="样式设置" @click.stop>
      <a-button type="text" class="shadow-btn-wrapper icon">
        <template #icon>
          <AppstoreOutlined />
        </template>
      </a-button>
    </a-tooltip>
  </a-popover>
</template>
