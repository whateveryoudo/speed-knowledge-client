<template>
    <div class="h-100vh px-[32px] pt-[64px] bg-[#fafafa]">
        <div class="max-w-[1024px] mx-auto bg-[#fff] rounded-[12px] p-[32px]">
            <a-flex justify="space-between" align="center" class="mb-4">
                <a-space>
                    <s-icon-font style="width: 38px; height: 38px;" svg-sprite type="icon-book-0"></s-icon-font>
                    <span class="text-[28px] font-700">{{ knowledgeInfo.name }}</span>
                </a-space>
                <a-space>
                    <a-button type="primary">
                        <template #icon>
                            <StarOutlined />
                        </template>
                        {{ '已收藏' }}
                    </a-button>
                    <knowledge-share />
                </a-space>
            </a-flex>
            <a-flex class="ml-[40px] mb-8" :gap="24">
                <a-space>
                    <span>
                        <span class="text-[var(--sd-grey-8)] font-bold text-[18px]">1</span> <span
                            class="text-[var(--sd-grey-7)]">文档</span>
                    </span>
                </a-space>
                <a-space>
                    <span>
                        <span class="text-[var(--sd-grey-8)] font-bold text-[18px]">1</span> <span
                            class="text-[var(--sd-grey-7)]">字数</span>
                    </span>
                </a-space>
            </a-flex>
            <SpeedTiptapEditor hide-border  :editorStyle="{ minHeight: 'auto' }" :content="welcomeContent" :editable="false"
                :menubar="false" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from '#sk-web/store/useUserStore';
import { StarOutlined } from '@ant-design/icons-vue';
import { useKnowledgeStore } from '#sk-web/store/useKnowledgeStore';
import KnowledgeShare from './components/knowledgeShare/index.vue';
import { SpeedTiptapEditor } from 'speed-tiptap-editor-dev/debug'

const { knowledgeInfo } = storeToRefs(useKnowledgeStore());
const welcomeContent = ref('<p><span data-name="wave" data-type="emoji">👋</span> <strong>欢迎来到知识库</strong></p><p style="padding-left: 1em;"> 知识库就像书一样，让多篇文档结构化，方便知识的创作与沉淀</p>');


const handleStore = () => {
    // if (value === 1) {
    //     knowledgeInfo.value.has_stored = true;
    // } else {
    //     knowledgeInfo.value.has_stored = false;
    // }
};
</script>