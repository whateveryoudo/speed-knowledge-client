<template>
  <div
    class="flex items-center justify-center w-full min-h-full box-border px-6 py-12 bg-[var(--sd-grey-2)]"
  >
    <div
      class="relative w-full max-w-[640px] min-h-[360px] box-border px-6 pt-5 pb-7 bg-[var(--ant-color-bg-base)] rounded-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
    >
      <a-flex align="center" :gap="8" class="min-w-0">
        <img
          v-if="spaceIcon"
          :src="spaceIcon"
          alt=""
          class="w-10 h-10 rounded-[4px] object-cover shrink-0"
        />
        <div
          v-else
          class="w-5 h-5 rounded-[4px] shrink-0 bg-[linear-gradient(135deg,#5b8ff9_0%,#3d6fe8_100%)]"
        />
        <span class="text-[16px] text-[var(--sd-text-primary)] truncate">
          {{ spaceName }}
        </span>
      </a-flex>

      <a-flex vertical class="px-4 pt-[72px] pb-14">
        <h2 class="m-0 text-[28px] font-normal leading-[1.4] text-[var(--sd-text-primary)]">
          {{ title }}
        </h2>
        <p
          v-if="description"
          class="m-0 mt-3 text-[18px] leading-[1.5] text-[var(--sd-text-caption)]"
        >
          {{ description }}
        </p>
      </a-flex>

      <div
        v-if="feedbackCode"
        class="absolute left-6 bottom-5 text-[12px] text-[var(--sd-grey-7)]"
      >
        反馈码: {{ feedbackCode }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'NoAuthPage',
})

withDefaults(
  defineProps<{
    /** 空间 / 团队名称 */
    spaceName?: string
    /** 空间 / 团队头像 URL */
    spaceIcon?: string
    /** 主标题 */
    title?: string
    /** 说明文案（如无权原因） */
    description?: string
    /** 反馈码，便于排查 */
    feedbackCode?: string
  }>(),
  {
    spaceName: '',
    spaceIcon: '',
    title: '无权访问当前空间内容',
    description: '',
    feedbackCode: '',
  },
)
</script>
