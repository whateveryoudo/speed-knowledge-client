<!--
 * @Author: ykx
 * @Date: 2023-04-14 09:30:59
 * @LastEditTime: 2023-06-05 11:41:11
 * @LastEditors: your name
 * @Description: 骨架屏列表加载
 * @FilePath: \easycube-apps\packages\components\src\globalComponents\Empty.vue
-->
<template>
    <div>
        <template v-if="loading">
            <template v-for="i in count" :key="i">
                <slot name="template">
                    <a-skeleton :avatar="avatar" :loading="loading" :active="true"
                        :paragraph="{ rows: perParagraphRows, width: '100%' }" />
                </slot>
            </template>
        </template>
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
        avatar?: boolean,
        perParagraphRows?: number,
    }>(),
    {
        loading: false,
        count: 1,
        avatar: false,
        perParagraphRows: 2,
    },
)
</script>

<style lang="less" scoped></style>