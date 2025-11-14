<!--
 * @Author: ykx
 * @Date: 2023-05-11 10:49:46
 * @LastEditTime: 2023-06-14 18:40:54
 * @LastEditors: your name
 * @Description: 展开收起-水平，垂直请使用vue-collapsed, 目前支持flex方式,不支持过多方式,支持受控
 * @FilePath: \easycube-apps\packages\components\src\globalComponents\QuestionTip.vue
-->

<script setup lang="ts">
import { ref, watch } from "vue";
import { DoubleRightOutlined, DoubleLeftOutlined } from "@ant-design/icons-vue";
import { Tooltip } from "ant-design-vue";
// eslint-disable-next-line no-undef
defineOptions({
  name: "SCollapseHz",
});
const props = withDefaults(
  defineProps<{
    open?: boolean;
    expandAttrBefore: string;
    expandAttrAfter: string;
    transitionAttr?: string;
    triggerMode?: "default" | "hover";
    expandDir: "left" | "right";
    needTransition?: boolean;
    showTriggerWhenCollapse?: boolean
  }>(),
  {
    open: false,
    triggerMode: "default",
    expandAttrBefore: "flex: 0",
    expandAttrAfter: "flex: 0 0 320px",
    transitionAttr: "flex",
    expandDir: "left", // 展开方向，默认向左
    needTransition: true,
    showTriggerWhenCollapse: true
  }
);
const iconFlag = ref(true);
const toggleFlag = ref(props.open);
const controlPanel = ref(props.open); // 展开时内容延迟显示（否则会有一个宽度挤压）
const emits = defineEmits(["update:open"]);
const toggleIcon = (type: "enter" | "leave") => {
  if (props.triggerMode === "hover") {
    iconFlag.value = type === "enter";
  }
};
// 展开时候添加下延迟
const handleSetToggle = () => {
  if (!toggleFlag.value) {
    toggleFlag.value = true;
    emits("update:open", true);
    if (props.needTransition) {
      setTimeout(() => {
        controlPanel.value = true;
      }, 100);
    } else {
      controlPanel.value = true;
    }
  } else {
    toggleFlag.value = false;
    controlPanel.value = false;
    if (props.showTriggerWhenCollapse) {
      setTimeout(() => {
        iconFlag.value = true; // 收起得时候显示
      }, 100);
    }
    emits("update:open", false);
  }
};

watch(
  () => props.open,
  (val: boolean) => {
    toggleFlag.value = true;
    if (val) {
      // 如果带有过渡效果，则需要延迟显示
      if (props.needTransition) {
        setTimeout(() => {
          controlPanel.value = true;
        }, 200);
      } else {
        controlPanel.value = true;
      }
    } else {
      toggleFlag.value = false;
      controlPanel.value = false;
    }
  },
);
watch(
  () => props.triggerMode,
  (val?: "default" | "hover") => {
    iconFlag.value = val === "default";
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <div class="collapse-horizontal-wrapper" :style="[
    toggleFlag ? expandAttrAfter : expandAttrBefore,
    needTransition ? `transition: ${transitionAttr} 0.2s` : '',
    'min-width: 0',
  ]" @mouseenter="toggleIcon('enter')" @mouseleave="toggleIcon('leave')">
    <template v-if="iconFlag">
      <slot name="trigger-render" :toggle-flag="toggleFlag">
        <Tooltip :placement="expandDir">
          <template #title>{{ toggleFlag ? "收起" : "展开" }}</template>
          <span :class="['toggle-icon', expandDir]" @click="handleSetToggle">
            <DoubleRightOutlined v-if="toggleFlag" />
            <DoubleLeftOutlined v-else />
          </span>
        </Tooltip>
      </slot>
    </template>
    <slot v-if="controlPanel" name="expand-render" />

    <slot v-else name="collapse-render" />
  </div>
</template>

<style scoped lang="less">
.collapse-horizontal-wrapper {
  position: relative;
  height: 100%;

  .toggle-icon {
    position: absolute;
    top: 50%;
    height: 48px;
    transform: translateY(-50%);
    border: 1px solid #ebecee;
    width: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    cursor: pointer;
    background-color: #fff;
    color: #666 !important;
    left: -11px;
    z-index: 10;

    &:hover {
      background-color: #e8e8e8;
    }

    &.right {
      left: auto;
      right: -11px;
      transform: translateY(-50%) rotateZ(180deg);

      &.expand {
        right: -11px;
        transform: translateY(-50%) rotateZ(0);
      }
    }

    &.expand {
      transform: translateY(-50%) rotateZ(180deg);
    }
  }
}
</style>
