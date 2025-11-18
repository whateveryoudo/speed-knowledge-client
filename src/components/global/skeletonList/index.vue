<!--
 * @Author: ykx
 * @Date: 2023-04-14 09:30:59
 * @LastEditTime: 2023-06-05 11:41:11
 * @LastEditors: your name
 * @Description: 骨架屏列表加载
 * @FilePath: \easycube-apps\packages\components\src\globalComponents\Empty.vue
-->
<template>
    <div class="skeleton-list-wrapper">
        <a-flex vertical :gap="10" v-if="loading">
            <a-skeleton :loading="loading" :title="{ width: titleWidth }" v-for="i in count" :key="i" :active="true"
                :paragraph="{ rows: perParagraphRows, width: '100%' }" />
        </a-flex>
        <slot v-else />
    </div>
</template>

<script lang="ts" setup>
/*eslint no-undef: "off"*/
defineOptions({
    name: 'SkeletonList',
})
const props = withDefaults(
    defineProps<{
        loading: boolean,
        count?: number
        perParagraphRows?: number,
        titleWidth?: string
    }>(),
    {
        loading: false,
        count: 3,
        perParagraphRows: 2,
        titleWidth: '100%'
    },
)
</script>

<style lang="less" scoped>
.no-data-wrapper {
    min-height: 50px;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;

    &.has-top {
        &.ant-empty {
            margin-top: 30px;
        }
    }

    &.ant-empty {
        margin: 0;
    }

    :deep(.ant-empty-image) {
        height: auto;
    }

    :deep(.ant-empty-description) {
        color: var(--ant-color-text-secondary);
    }

    :deep(.ant-empty-image) {
        width: 116px;

        img {
            width: 100%;
            height: auto;
        }
    }

    &.editor {
        :deep(.ant-empty-image) {
            width: 285px;

            img {
                width: 100%;
                height: auto;
            }
        }
    }

    &.config-panel {
        :deep(.ant-empty-image) {
            width: 60px;

            img {
                width: 100%;
                height: auto;
            }
        }
    }
}
</style>