import { type VNode } from "vue";

export type ModuleMenuItem = {
    title: string;
    key: string;
    icon: () => VNode;
    filledIcon: () => VNode;
}
