<template>
  <a-flex vertical class="px-2 h-full">
    <div
      class="text-[var(--sd-text-body)] cursor-pointer flex items-center h-[32px] my-[4px] px-[8px] rounded-[6px] hover:bg-[var(--sd-bg-primary-hover)]"
      :class="{
        'bg-[var(--sd-bg-primary-hover)]': activeKey === '',
      }" @click="handleHomeClick()">
      <HomeOutlined class="mr-2" /> 首页
    </div>
    <!-- 目录 -->
    <div class="text-[var(--sd-text-body)] cursor-pointer flex items-center h-[32px] my-[4px] px-[2px] rounded-[6px]">
      <a-dropdown>
        <a-button type="text" class="shadow-btn-wrapper">
          <template #icon>
            <UnorderedListOutlined />
          </template>
          目录
        </a-button>
        <template #overlay>
          <a-menu>
            <a-menu-item key="1">
              1st menu item
            </a-menu-item>
            <a-menu-item key="2">
              2nd menu item
            </a-menu-item>
            <a-menu-item key="3">
              3rd item
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>

    <div class="flex-1 overflow-y-auto">
      <CatelogTree :loading="loading" :tree="tree" />
    </div>
  </a-flex>

</template>
<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { type DocumentNodeTreeItem } from '@sk/types';
import { CatelogTree } from '../documentTree';
const props = withDefaults(defineProps<{
  loading: boolean;
  tree: DocumentNodeTreeItem[];
}>(), {
  loading: false,
  tree: () => [],
})
const route = useRoute();
const router = useRouter();

const handleHomeClick = () => {
  router.push(`/knowledge/${route.params.slug}`);
}

const activeKey = computed(() => {
  return route.params.document_slug as string || '';
})

</script>

<style lang="less" scoped></style>
