<template>
    <div class="flex justify-center min-h-[400px] w-full h-full py-15 ">
        <div class="py-10 w-full not-found-wrapper">
            <a-flex vertical align="center" :gap="16" class="w-full mt-10">
                <!-- 标题区域：支持 slot 或 props -->
                <slot name="title">
                    <h2 v-if="title" class="text-[24px]">
                        {{ title }}
                    </h2>
                </slot>
                <!-- 副标题 -->
                <div v-if="subTitle" class="text-[var(--sd-text-caption)]">
                    {{ subTitle }}
                </div>
            </a-flex>
        </div>
    </div>
</template>

<script lang="ts" setup>

defineOptions({
    name: 'NotFound'
});

const props = withDefaults(
    defineProps<{
        title?: string;
        subTitle?: string;
    }>(),
    {
        title: '页面未找到',
        subTitle: undefined
    }
);

</script>
<style lang="less" scoped>
.not-found-wrapper {
    background: url('../../../assets/images/not_found.png') bottom / auto 80% no-repeat;
    background-origin: content-box;
}
</style>
