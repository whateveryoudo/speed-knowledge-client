<template>
    <a-flex class="h-full">
        <s-collapse-hz expandDir="right" :needTransition="false" :showTriggerWhenCollapse="false" triggerMode="hover"
            v-model:open="open" expandAttrBefore="flex: 0 0 64px" :expandAttrAfter="`flex: 0 0 ${width}px`">
            <template #expand-render>
                <a-flex vertical gap="middle" ref="expandWrapRef"
                    class="h-full relative pt-2 bg-[var(--sd-bg-secondary)]">
                    <a-flex class="px-2 w-full" justify="space-between" align="center">
                        <a-space>
                            <img :src="Logo" alt="logo" class="w-[30px] h-auto" />
                            <span class="text-16px font-bold">{{ title }}</span>
                        </a-space>

                        <a-space :size="0">
                            <a-badge :dot="unreadNotificationCount > 0" :offset="[-6, 7]"
                                :numberStyle="{backgroundColor: 'var(--sd-link-color)'}"
                                @click="toggleNotificationModalVisible()">
                                <a-button type="text" class="shadow-btn-wrapper">
                                    <BellOutlined />
                                </a-button>
                            </a-badge>
                            <UserSetting />
                        </a-space>
                    </a-flex>
                    <a-flex class="px-2" :gap="10">
                        <a-input disabled class="cursor-pointer max-w-[250px]">
                            <template #prefix>
                                <SearchOutlined class="mr-1" />
                                搜索
                            </template>
                        </a-input>
                        <AddMenu />
                    </a-flex>

                    <StartMenus />
                    <a-divider class="my-1" />
                    <div class="flex-1 overflow-y-auto">
                        <!-- 知识库菜单 -->
                        <BookMenus ref="bookMenusRef" expanded />
                    </div>
                </a-flex>
                <div @mouseenter.stop="openTooltip = false"
                    class="w-6px absolute top-0 right-0 bottom-0 border border-r border-r-solid border-[var(--sd-border-light)] cursor-col-resize"
                    @pointerdown="startResize('right', $event)">
                </div>
            </template>
            <template #collapse-render>
                <a-flex vertical :gap="10" align="center" class="pt-2" ref="collapseWrapRef">
                    <img :src="Logo" alt="logo" class="w-[30px] h-auto" />
                    <a-button type="text" class="shadow-btn-wrapper w-[32px] h-[32px]!">
                        <PlusOutlined class="text-18px" />
                    </a-button>
                    <a-tooltip title="消息" placement="right">
                        <a-badge :dot="unreadNotificationCount > 0" @click="toggleNotificationModalVisible()">
                            <a-button type="text" class="shadow-btn-wrapper w-[32px] h-[32px]!">
                                <BellOutlined class="text-18px" />
                            </a-button>
                        </a-badge>
                    </a-tooltip>
                    <a-tooltip title="搜索" placement="right">
                        <a-button type="text" class="shadow-btn-wrapper w-[32px] h-[32px]!">
                            <SearchOutlined class="text-18px" />
                        </a-button>
                    </a-tooltip>
                    <a-divider class="my-0 w-[30%]! min-w-auto mx-auto"></a-divider>
                    <StartMenus v-model:activeModuleKey="activeModuleKey" :expanded="false" />
                    <a-divider class="my-0 w-[30%]! min-w-auto mx-auto"></a-divider>
                    <BookMenus :expanded="false" />
                </a-flex>
                <div @mouseenter.stop="openTooltip = false"
                    class="w-6px absolute top-0 right-0 bottom-0 border border-r border-r-solid border-[var(--sd-border-light)] cursor-col-resize"
                    @pointerdown="collapseStartResize()">
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

        <NotificationModal v-model:visible="notificationModalVisible" />
    </a-flex>

</template>

<script lang="tsx" setup>
import { ref, watch, onMounted } from 'vue';
import { useEdgeResize } from '#sk-web/hooks';
import Logo from '#sk-web/assets/logo.png';
import { BellOutlined, CaretRightOutlined, CaretLeftOutlined, ClockCircleOutlined, ClockCircleFilled, PlusOutlined } from '@ant-design/icons-vue';
import BookMenus from './components/bookMenus/index.vue';
import StartMenus from './components/StartMenus';
import { type KnowledgeItem } from '@sk/types'
import AddMenu from './components/addMenu';
import UserSetting from './components/userSetting/index.vue';
import { useRouter } from 'vue-router';
import { useKnowledgeListProvider, useKnowledgeList } from './composables/useKnowledgeListContext'
import { useSystemStore } from '#sk-web/store/useSystemStore';
import { useToggle } from '@vueuse/core'
import NotificationModal from './components/notificationModal/index.vue';
import { storeToRefs } from 'pinia';
const DEFAULT_EXPAND_WIDTH = 253;
const open = ref(!localStorage.getItem('sk_dashboard_expand') || localStorage.getItem('sk_dashboard_expand') === 'true');
const expandWrapRef = ref<HTMLElement | null>(null);
const router = useRouter();
const { width, startResize } = useEdgeResize(expandWrapRef, { width: Number(localStorage.getItem('sk_dashboard_expand_width')) || DEFAULT_EXPAND_WIDTH }, {
    minWidth: 200, maxWidth: 400,
    onResizeEnd: ({ width, height }: { width: number; height: number }) => {
        console.log('拖拽结束', width, height)
        // 这里存入到本地
        localStorage.setItem('sk_dashboard_expand_width', width.toString());
    }
})
const { unreadNotificationCount } = storeToRefs(useSystemStore());
const openTooltip = ref(false);
const title = import.meta.env.VITE_SYS_TITLE;
const [notificationModalVisible, toggleNotificationModalVisible] = useToggle(false);
// 初始化知识库列表相关 context
useKnowledgeListProvider();

const { initKnowledgeList, initCommonPinList } = useKnowledgeList();

onMounted(() => {
  initKnowledgeList();
  initCommonPinList();
});

const activeModuleKey = ref('start');


const handleToggle = () => {
    open.value = !open.value;
    openTooltip.value = false;
}
// 如果收起状态执行了拖拽，则直接展开
const collapseStartResize = () => {
    open.value = true;
}

// 监听展开收起变化，同步本地存储
watch(open, (newVal: boolean) => {
    localStorage.setItem('sk_dashboard_expand', newVal ? 'true' : 'false');
})


</script>

<style lang="less" scoped></style>