<template>
   <a-flex class="h-screen">
      <a-flex vertical :gap="2"
         class="basis-[256px] h-full overflow-y-auto p-[16px] border border-solid border-r-1 border-color-[var(--sd-grey-2)]">
         <div @click="goToKnowledge" class='menu-item-base px-[2px]! hover:bg-[var(--sd-bg-primary-hover)]'>
            <LeftOutlined class="text-[12px]" />
            <s-icon-font :type="knowledgeInfo.icon" svg-sprite style="width: 18px; height: 18px;" />
            <a-tooltip :title="knowledgeInfo.name">
               <span class="text-[var(--sd-text-caption)] truncate">{{ knowledgeInfo.name }}</span>
            </a-tooltip>
         </div>
         <h3 class="text-[16px] mt-6 mb-4 pl-[10px]">知识库管理</h3>
         <template v-for="item in manageMenus" :key="item?.key">
            <div class="flex mb-2 pl-[10px]" v-if="item.type === 'group'">
               <span class="text-[var(--sd-text-caption)] truncate">{{ item.label }}</span>
            </div>
            <div v-else
               :class="['menu-item-base', selectedKey === item.key ? 'bg-[var(--sd-bg-primary-hover)] text-[var(--sd-text-primary)]' : '']"
               @click="handleClick(item)">
               <s-icon-font :iconRender="item.icon" class="text-[12px]" />
               <span class="truncate">{{ item.label }}</span>
            </div>
         </template>

      </a-flex>
      <div class="flex-1 h-full px-[36px] pt-[48px] pb-[64px] overflow-y-auto">
         <div class="max-w-[1080px] mx-auto">
            <router-view></router-view>
         </div>
      </div>
   </a-flex>
</template>
<script lang="ts" setup>
import { ref, h, provide, computed, watch, type VNode } from 'vue';
import {
   type KnowledgeItem,
} from '@sk/types'
import { LockOutlined } from '@ant-design/icons-vue';
import { useRoute, useRouter } from 'vue-router';
import { to } from 'await-to-js'
import { knowledge as knowledgeApi } from '@sk/api'
import { KNOWLEDGE_ID_KEY } from '#sk-web/context/keys';
const route = useRoute();
const router = useRouter();
const knowledgeSlug = computed(() => route.params.slug as string);
// 当前知识库信息
const knowledgeInfo = ref<KnowledgeItem>({
   id: '',
   name: '',
   description: '',
   group_id: '',
   icon: '',
   user_id: 0,
   slug: '',
   cover_url: null,
   is_public: false,
   items_count: 0,
   content_updated_at: '',
   created_at: '',
   updated_at: '',
})
provide(KNOWLEDGE_ID_KEY, computed(() => knowledgeInfo.value.id));
type ItemType = {
   type?: 'group';
   label: string;
   key: string;
   icon?: () => VNode;
}
const manageMenus = ref<ItemType[]>([
   {
      type: 'group',
      label: '设置',
      key: 'setting',
   },
   {
      label: '权限',
      key: 'auth',
      icon: () => h(LockOutlined)
   }
]);
const selectedKey = ref<string>('');
const handleClick = (item: ItemType) => {
   if (item.key === 'auth') {
      router.push(`/knowledge/${knowledgeSlug.value}/manage/${item.key}`)
   }
};
const goToKnowledge = () => {
   router.push(`/knowledge/${knowledgeSlug.value}`)
}
const initKnowledge = async () => {
   const [error, res] = await to(
      knowledgeApi.getKnowledgeDetail(knowledgeSlug.value as string),
   )
   if (!error) {
      knowledgeInfo.value = res.data
   }
}
initKnowledge();
// 初始化,切换选中
watch(() => route, (newRoute) => {
   selectedKey.value = newRoute.meta.menuKey as string;
}, {
   immediate: true,
})
</script>