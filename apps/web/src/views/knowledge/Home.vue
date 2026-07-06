<template>
    <div class="h-100vh px-[32px] pt-[64px] bg-[#fafafa]">
        <div class="max-w-[1024px] mx-auto bg-[#fff] rounded-[12px] p-[32px]">
            <a-flex justify="space-between" align="center" class="mb-4">
                <a-space>
                    <s-icon-font style="width: 38px; height: 38px;" svg-sprite type="icon-book-0"></s-icon-font>
                    <span class="text-[28px] font-700">{{ knowledgeInfo.name }}</span>
                </a-space>
                <a-space>
                    <a-button
                        v-if="canCollect"
                        @click="handleCollect(knowledgeIndexPage.has_collected, { identifier: knowledgeInfo.id, resource_type: CollectResourceType.KNOWLEDGE, onSuccess: () => { knowledgeIndexPage.has_collected = !knowledgeIndexPage.has_collected; } })">
                        <template #icon>
                            <StarFilled v-if="knowledgeIndexPage.has_collected" style="color: var(--sd-yellow-6);" />
                            <StarOutlined v-else />
                        </template>
                        {{ knowledgeIndexPage.has_collected ? '已收藏' : '收藏' }}
                    </a-button>
                    <knowledge-share v-if="canShare" />
                </a-space>
            </a-flex>
            <a-flex class="ml-[40px] mb-8" :gap="24">
                <a-space>
                    <span>
                        <span class="text-[var(--sd-grey-8)] font-bold text-[18px]">{{ knowledgeIndexPage.items_count
                        }}</span> <span class="text-[var(--sd-grey-7)]">文档</span>
                    </span>
                </a-space>
                <a-space>
                    <span>
                        <span class="text-[var(--sd-grey-8)] font-bold text-[18px]">{{ knowledgeIndexPage.word_count
                            }}</span> <span class="text-[var(--sd-grey-7)]">字</span>
                    </span>
                </a-space>
            </a-flex>
            <SpeedTiptapEditor hide-border :editorStyle="{ minHeight: 'auto' }" :content="welcomeContent"
                :editable="false" :menubar="false" />
            <!-- 大纲树显示 -->
            <OutlineTree :loading="documentLoading" :tree="documentTree" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { StarOutlined, StarFilled } from '@ant-design/icons-vue';
import { useKnowledgeStore } from '#sk-web/store/useKnowledgeStore';
import KnowledgeShare from './components/knowledgeCollaborator/KnowledgeShare.vue';
import { SpeedTiptapEditor } from 'speed-tiptap-editor'
import { to } from 'await-to-js';
import { knowledge as knowledgeApi, common as commonApi } from '@sk/api';
import { type KnowledgeIndexPageResponse, CollectResourceType, KnowledgeIndexPageLayout, KnowledgeIndexPageSort, KnowledgeAbility } from '@sk/types';
import { useRouter } from 'vue-router';
import { OutlineTree } from './components/documentTree';
import { useCollect } from './hooks/useCollect';
import { useAbility } from '#sk-web/hooks/useAbility';
import { isLoggedIn } from '@sk/utils';
const { handleCollect } = useCollect();
const { canRef } = useAbility();
const canShare = canRef(KnowledgeAbility.SHARE_BOOK);
const canCollect = computed(() => isLoggedIn() && canRef(KnowledgeAbility.COLLECT_BOOK).value);
const { knowledgeInfo, documentLoading, documentTree } = storeToRefs(useKnowledgeStore());
const welcomeContent = ref('<p><span data-name="wave" data-type="emoji">👋</span> <strong>欢迎来到知识库</strong></p><p style="padding-left: 1em;"> 知识库就像书一样，让多篇文档结构化，方便知识的创作与沉淀</p>');
const knowledgeIndexPage = ref<KnowledgeIndexPageResponse>({
    word_count: 0,
    enable_catalog: false,
    enable_custom_body: false,
    enable_user_feed: false,
    has_collected: false,
    layout: KnowledgeIndexPageLayout.CATALOG,
    sort: KnowledgeIndexPageSort.CATALOG,
    ...knowledgeInfo.value,
});

// 获取知识库首页信息
watch(() => knowledgeInfo.value.id, async (knowledgeId: string) => {
    if (knowledgeId) {
        const [error, res] = await to(knowledgeApi.getKnowledgeIndexPage(knowledgeId));
        if (!error) {
            knowledgeIndexPage.value = res.data;
        } else {
            console.error(error);
        }
    }
}, { immediate: true });

</script>