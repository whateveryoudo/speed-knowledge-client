<template>
    <a-avatar-group maxPopoverPlacement="bottom" :max-count="4" :size="24"
        :max-style="{ color: '#f56a00', backgroundColor: '#fde3cf' }">
        <a-tooltip v-for="collaborator in collaborators" :key="collaborator.id"
            :title="collaborators.length === 1 ? '协同编辑的人员会显示在这里' : collaborator.name" placement="top">
            <a-avatar :src="collaborator.avatar || avatarDef">
            </a-avatar>
        </a-tooltip>
    </a-avatar-group>
</template>

<script setup lang="ts">
import { type Collaborator } from '@sk/types';
import avatarDef from '#sk-web/assets/images/avatar_def.png'
const props = withDefaults(defineProps<{
    collaborators: Collaborator[]
}>(), {
    collaborators: () => []
})

</script>

<style scoped lang="less"></style>