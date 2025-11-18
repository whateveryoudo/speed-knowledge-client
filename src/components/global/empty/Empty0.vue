<!--
 * @Author: ykx
 * @Date: 2023-04-14 09:30:59
 * @LastEditTime: 2023-06-05 11:41:11
 * @LastEditors: your name
 * @Description: 空占位显示(image  slot无效？？)
 * @FilePath: \easycube-apps\packages\components\src\globalComponents\Empty.vue
-->
<template>
  <a-empty :description="description" :class="[
    'no-data-wrapper',
    theme === 'default' ? '' : theme,
    hasTop && 'has-top',
    size,
  ]" :image="EmptyBase">
    <template #description>
      <slot name="description" />
    </template>
  </a-empty>
</template>

<script lang="ts" setup>
import EmptyBase from './image/empty-base.png'
/*eslint no-undef: "off"*/
defineOptions({
  name: 'Empty0',
})
const props = withDefaults(
  defineProps<{
    description?: string;
    theme?: 'default' | 'editor' | 'config-panel';
    size?: 'default' | 'small'
    hasTop?: boolean;
  }>(),
  {
    description: '暂无数据',
    size: 'default',
    theme: 'default',
    hasTop: false
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

  :deep(.ant-empty-description) {
    color: var(--ant-color-text-secondary);
  }

  :deep(.ant-empty-image) {
    width: 100px;
    height: 64px;

    img {
      width: 100%;
      height: 100%;
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