<template>
    <div class="flex items-center gap-2 answer-toolbar">
        <el-tooltip content="复制" placement="top">
            <el-button size="small" circle :icon="CopyDocument" @click="copyAnswer(chatId)"></el-button>
        </el-tooltip>
        <el-dropdown placement="top" @command="(type: 'pdf' | 'excel' | 'word') => downloadAnswer(chatId, type)">
            <el-button size="small" circle :icon="Download"></el-button>
            <template #dropdown>
                <el-dropdown-item command="pdf">PDF</el-dropdown-item>
            </template>
        </el-dropdown>
        <!-- 暂不支持重新生成 -->
        <!-- <el-tooltip content="重新生成" placement="top">
            <el-button circle :icon="RefreshRight" @click="regenerateAnswer(chatId)"></el-button>
        </el-tooltip> -->
    </div>
</template>

<script setup lang="ts">
import { CopyDocument, Download, RefreshRight } from '@element-plus/icons-vue';
import { useChatSession } from '../composables/useChatMessageContext';
const props = defineProps<{
    chatId: string;
}>();
const { copyAnswer, downloadAnswer, regenerateAnswer } = useChatSession();
</script>

<style scoped lang="scss">
.answer-toolbar {
    // 去掉按钮聚焦时的边框
    :deep(.el-button:focus-visible) {
        outline: none
    }
}
</style>