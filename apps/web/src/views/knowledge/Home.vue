<template>
    <div class="h-100vh px-[32px] pt-[64px] bg-[#fafafa]">
        <div class="max-w-[1024px] mx-auto bg-[#fff] rounded-[12px] p-[32px]">
            <a-flex justify="space-between" align="center" class="mb-4">
                <a-space>
                    <s-icon-font style="width: 38px; height: 38px;" svg-sprite type="icon-book-0"></s-icon-font>
                    <span class="text-[28px] font-700">{{ knowledgeInfo.name }}</span>
                </a-space>
                <a-space>
                    <a-button @click="handleCollect">
                        <template #icon>
                            <StarFilled v-if="knowledgeIndexPage.has_collected" style="color: var(--sd-yellow-6);" />
                            <StarOutlined v-else />
                        </template>
                        {{ knowledgeIndexPage.has_collected ? '已收藏' : '收藏' }}
                    </a-button>
                    <knowledge-share />
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
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, watch, h } from 'vue';
import { storeToRefs } from 'pinia';
import { StarOutlined, StarFilled } from '@ant-design/icons-vue';
import { useKnowledgeStore } from '#sk-web/store/useKnowledgeStore';
import KnowledgeShare from './components/knowledgeShare/index.vue';
import { message } from 'ant-design-vue';
import { SpeedTiptapEditor } from 'speed-tiptap-editor-dev/debug'
import { to } from 'await-to-js';
import { knowledge as knowledgeApi, common as commonApi } from '@sk/api';
import { type KnowledgeIndexPageResponse, CollectResourceType, KnowledgeIndexPageLayout, KnowledgeIndexPageSort } from '@sk/types';
import { useRouter } from 'vue-router';
const { knowledgeInfo } = storeToRefs(useKnowledgeStore());
const router = useRouter();
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
const handleCollect = async () => {
    const hasCollect = knowledgeIndexPage.value.has_collected;
    if (hasCollect) {
        const [error] = await to(commonApi.removeCollect({ identifier: knowledgeInfo.value.id, resource_type: CollectResourceType.KNOWLEDGE }));
        if (!error) {
            message.success('取消收藏成功');
            knowledgeIndexPage.value.has_collected = false;
        }
    } else {
        const [error] = await to(commonApi.addCollect({ identifier: knowledgeInfo.value.id, resource_type: CollectResourceType.KNOWLEDGE }));
        if (!error) {
            message.success(h('span', {
            }, [
                '收藏成功,请前往',
                h('a', {
                    href: '#',
                    class: 'text-blue-500 cursor-pointer',
                    onClick: (e: Event) => {
                        e.preventDefault();
                        router.push('/collect');
                    }
                }, '收藏夹'),
                '查看'
            ]));
            knowledgeIndexPage.value.has_collected = true;
        }
    }
};
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