<script lang="ts" setup>
import AiTrigger from '#sk-web/assets/images/robot/ai-trigger.svg';
import { useDraggable, type Position, useToggle, useWindowSize } from '@vueuse/core';
import { ref, computed, watch } from 'vue';
import ChatDialog from './chat/index.vue';
import type { ChatConfig } from './composables/types';
const props = defineProps<{
    config: ChatConfig;
}>();
const BASE_RIGHT = 10;
const BASE_BOTTOM = 80;
const ENTRY_SIZE = 44;
const entryIconRef = ref<HTMLElement | null>(null);
// `style` will be a helper computed for `left: ?px; top: ?px;`
const { width, height } = useWindowSize();
const maxX = computed(() => Math.max(0, width.value - BASE_RIGHT - ENTRY_SIZE));
const maxY = computed(() => Math.max(0, height.value - BASE_BOTTOM - ENTRY_SIZE));
const lastMaxX = ref(maxX.value);
const lastMaxY = ref(maxY.value);
let startX = 0,
    startY = 0;

const { x, y, style } = useDraggable(entryIconRef, {
    initialValue: {
        x: maxX.value,
        y: maxY.value,
    },
    onStart: (position: Position, e: PointerEvent) => {
        startX = e.clientX;
        startY = e.clientY;
    },
    // 阀值范围 5 * 5，区域内则处理为点击方式，否则处理为拖拽
    onEnd: (position, e: PointerEvent) => {
        const endX = e.clientX;
        const endY = e.clientY;
        const distanceX = Math.abs(endX - startX);
        const distanceY = Math.abs(endY - startY);
        console.log(e.target);

        if (distanceX < 5 && distanceY < 5) {
            // 点击的关闭图标，走其自己的逻辑(注意这里触发的是在svg上面，没法加到class,故向上找一层)

            if (!(e.target as any).parentNode.classList.contains('hide-operator-icon')) {
                // 处理弹出弹框逻辑

                if (!isAiTriggerCollapsed.value) {
                    // 显示提示框
                    toggleAiDialogVisible(true);
                } else {
                    // 还原值
                    x.value = maxX.value;
                    y.value = maxY.value;
                    isAiTriggerCollapsed.value = false;
                    window.localStorage.setItem('isFlowAiTriggerCollapse', 'false');
                }
            }
        }
    },
    containerElement: document.body,
});

// 视口尺寸变化（例如打开 F12）时：
// 1) 保持与右下角的间距（右/下边距不变）
// 2) 再做一次夹紧，防止超出可视范围
watch([maxX, maxY], ([newMaxX, newMaxY]) => {
    const gapX = Math.max(0, lastMaxX.value - x.value);
    const gapY = Math.max(0, lastMaxY.value - y.value);

    x.value = newMaxX - gapX;
    y.value = newMaxY - gapY;

    x.value = Math.min(Math.max(0, x.value), newMaxX);
    y.value = Math.min(Math.max(0, y.value), newMaxY);

    lastMaxX.value = newMaxX;
    lastMaxY.value = newMaxY;
});

const isAiTriggerCollapsed = ref(
    window.localStorage.getItem('isFlowAiTriggerCollapse') !== undefined
        ? window.localStorage.getItem('isFlowAiTriggerCollapse') === 'true'
        : false,
);
const showTip = ref(false);
const handleOpenChange = (open: boolean) => {
    if (isAiTriggerCollapsed.value) {
        showTip.value = open;
    } else {
        showTip.value = false;
    }
};
const hideTrigger = () => {
    isAiTriggerCollapsed.value = true;
    window.localStorage.setItem('isFlowAiTriggerCollapse', 'true');
};
const [aiDialogVisible, toggleAiDialogVisible] = useToggle(false);
</script>
<template>
    <div class="ai-chat-wrapper">
        <!-- 触发器 -->
        <a-tooltip title="AI助手" :open="showTip" placement="left" @open-change="handleOpenChange">
            <div :class="[
                'entry-icon fixed cursor-pointer w-[44px]',
                isAiTriggerCollapsed ? 'hidden-trigger' : 'animate-head',
            ]" :style="style" title="ai助手" ref="entryIconRef">
                <!-- 防止吸附问题：https://github.com/vueuse/vueuse/issues/3736 -->
                <img class="pointer-events-none" :src="AiTrigger" alt="" />
                <span
                    class="hide-operator text-center right-0 top-[-6px] absolute w-[14px] flex items-center justify-center h-[14px] leading-[14px] bg-[#c3c7ca]  rounded-[12px]">
                    <s-icon-font class="hide-operator-icon" :size="10" type="icon-kl-close" style="color: #fff;"
                        @click.stop="hideTrigger"></s-icon-font>
                </span>
            </div>
        </a-tooltip>
        <!-- 对话框 -->
        <ChatDialog v-model:visible="aiDialogVisible" :config="config" />
    </div>
</template>
<style lang="less">
@keyframes head {
    0% {
        transform: rotate(0);
        transform: translateY(0);
    }

    50% {
        transform: rotate(0);
        transform: translateY(-10%);
    }

    100% {
        transform: rotate(0);
        transform: translateY(0);
    }
}
</style>
<style scoped lang="less">
.entry-icon {
    .hide-operator {
        display: none;
    }

    &:hover {
        .hide-operator {
            display: flex;
        }
    }

    img {
        width: 100%;
        height: auto;
    }

    &.animate-head {
        animation: head 2s linear infinite;
    }

    right: initial !important;
    bottom: initial !important;
    // 注意：这里不能使用all过渡，会和drag冲突，
    transition: transform 0.3s ease-in-out;

    &.hidden-trigger {
        transform: rotate(-90deg);
        left: initial !important;
        top: initial !important;
        right: -32px !important;
        bottom: 80px !important;

        .hide-operator {
            display: none;
        }
    }
}
</style>
