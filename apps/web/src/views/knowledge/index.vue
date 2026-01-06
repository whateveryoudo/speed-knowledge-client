<template>
    <a-flex class="h-full">
        <s-collapse-hz expandDir="right" triggerMode="hover" v-model:open="open" expandAttrBefore="flex: 0 0 10px"
            :expandAttrAfter="`flex: 0 0 ${width}px`" fixed-trigger-expand-after>
            <template #expand-render>
                <a-flex vertical gap="small" ref="expandWrapRef"
                    class="h-full relative pt-2 bg-[var(--sd-bg-secondary)]">
                    <a-flex class="px-2 w-full" justify="space-between" align="center">
                        <a-space>
                            <img @click="router.push('/dashboard')" :src="Logo" alt="logo"
                                class="w-[16px] cursor-pointer h-auto" />
                            <RightOutlined class="text-xs" />
                            <span
                                class="text-xs cursor-pointer text-[var(--sd-grey-7)] hover:text-[var(--sd-text-body)]"
                                @click="router.push('/dashboard')">个人知识库</span>
                        </a-space>
                    </a-flex>
                    <a-flex class="px-2 w-full" justify="space-between" align="center">
                        <a-space>
                            <s-icon-font :type="knowledgeInfo.icon" style="width: 22px;height: 22px"
                                svg-sprite></s-icon-font>
                            <span class="font-bold">{{ knowledgeInfo.name || '--' }}</span>
                            <a-tooltip>
                                <template #title>
                                    <span>{{ knowledgeInfo.is_public ? '公开知识库' : '私有知识库' }}</span>
                                    <a-button type="link" size="small" @click="handleTogglePublic">切换公开性</a-button>
                                </template>
                                <UnlockOutlined class="text-[var(--sd-grey-7)]" v-if="knowledgeInfo.is_public" />
                                <LockOutlined class="text-[var(--sd-grey-7)]" v-else />
                            </a-tooltip>
                        </a-space>
                        <!-- 更多操作 -->
                        <a-dropdown>
                            <EllipsisOutlined />
                            <template #overlay>
                                <a-menu @click="handleMoreOpt">
                                    <a-menu-item key="auth">
                                        <span>权限</span>
                                    </a-menu-item>
                                </a-menu>
                            </template>
                        </a-dropdown>

                    </a-flex>
                    <a-flex class="px-2" :gap="10">
                        <a-input disabled class="cursor-pointer max-w-[250px]">
                            <template #prefix>
                                <SearchOutlined class="mr-1" />
                                搜索
                            </template>
                        </a-input>
                        <AddMenu :knowledgeId="knowledgeInfo.id" @add-document-cb="handleAddDocumentCb" />
                    </a-flex>

                    <a-divider class="my-1" />
                    <div class="flex-1 overflow-y-auto">
                        <!-- 知识库下的文档树 -->
                        <DocumentMenus :loading="documentLoading" :tree="documentTree" />
                    </div>
                </a-flex>
                <div @mouseenter.stop="openTooltip = false"
                    class="w-6px absolute top-0 right-0 bottom-0 border border-r border-r-solid border-[var(--sd-border-light)] cursor-col-resize"
                    @pointerdown="startResize('right', $event)">
                </div>
            </template>
            <!-- 自定义触发器 -->
            <template #trigger-render>
                <a-tooltip v-model:open="openTooltip" placement="right" :title="open ? '收起' : '展开'">
                    <div @click="handleToggle"
                        class="absolute flex items-center justify-center cursor-pointer bg-[var(--ant-color-bg-base)] z-10 top-[50%] translate-y-[-50%] right-[-7px] w-[14px] h-[44px] border border-solid border-[var(--sd-border-grey-4)] rounded-[8px] shadow-[0_2px_8px_0_rgba(0,0,0,.06)]">
                        <CaretRightOutlined class="text-[12px]" v-if="!open" />
                        <CaretLeftOutlined class="text-[12px]" v-else />
                    </div>
                </a-tooltip>
            </template>
        </s-collapse-hz>
        <div class="flex-1 overflow-y-auto">
            <router-view></router-view>
        </div>
    </a-flex>

</template>

<script lang="tsx" setup>
import { ref, watch, computed } from 'vue';
import { useEdgeResize } from '#sk-web/hooks';
import Logo from '#sk-web/assets/logo.png';
import { useRouter, useRoute } from 'vue-router';
import { CaretRightOutlined, CaretLeftOutlined, RightOutlined } from '@ant-design/icons-vue';
import { useKnowledgeStore } from '#sk-web/store/useKnowledgeStore';
import { storeToRefs } from 'pinia'
import AddMenu from './components/addMenu';

import DocumentMenus from './components/documentMenus/index.vue';
const DEFAULT_EXPAND_WIDTH = 253;
const open = ref(!localStorage.getItem('sk_knowledge_expand') || localStorage.getItem('sk_knowledge_expand') === 'true');
const expandWrapRef = ref<HTMLElement | null>(null);
const router = useRouter();
const route = useRoute();
const knowledgeStore = useKnowledgeStore()
const { knowledgeInfo, documentTree, documentLoading } = storeToRefs(knowledgeStore)
const { width, startResize } = useEdgeResize(expandWrapRef, { width: Number(localStorage.getItem('sk_knowledge_expand_width')) || DEFAULT_EXPAND_WIDTH }, {
    minWidth: 200, maxWidth: 400,
    onResizeEnd: ({ width, height }: { width: number; height: number }) => {
        console.log('拖拽结束', width, height)
        // 这里存入到本地
        localStorage.setItem('sk_knowledge_expand_width', width.toString());
    }
})
const openTooltip = ref(false);
const documentMenusRef = ref<InstanceType<typeof DocumentMenus> | null>(null);
const slug = computed(() => route.params.slug)

const handleToggle = () => {
    open.value = !open.value;
    openTooltip.value = false;
}

const handleTogglePublic = () => {
    // TODO:
}
const handleAddDocumentCb = (newDocSlug: string) => {
    console.log('新增文档', newDocSlug)
    knowledgeStore.initDocumentTree();
    // 跳转对应链接
    router.push(`/knowledge/${slug.value}/document/${newDocSlug}`);
}
const handleMoreOpt = (e: any) => {
    switch (e.key) {
        case 'auth':
            router.push(`/knowledge/${slug.value}/manage/auth`);
            break;
    }
}
// 监听展开收起变化，同步本地存储
watch(open, (newVal: boolean) => {
    localStorage.setItem('sk_knowledge_expand', newVal ? 'true' : 'false');
})


knowledgeStore.initKnowledge();
</script>

<style lang="less" scoped></style>