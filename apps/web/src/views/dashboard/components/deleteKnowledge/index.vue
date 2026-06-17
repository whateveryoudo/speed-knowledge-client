<template>
    <s-full-modal width="500px" :footer="false" title="删除知识库" :visible="visible" @close="emit('update:visible', false)">
        <a-flex vertical :gap="20">
            <a-alert type="warning" :icon="false"
                :message="`正在删除知识库${name}用于测试协同权限的知识库，该操作不可逆，一旦操作成功，知识库下的所有内容将会删除。请输入下面内容再次确认操作。`" />
            <p class="text-sm text-gray-500">
                {{ `请在下方输入框中输入${slug}以确认操作` }}
            </p>
            <a-input v-model:value="inputValue" :placeholder="slug" :status="status" />
            <a-button block :loading="deleteLoading" type="primary" danger @click="toDelete">删除知识库</a-button>
        </a-flex>

    </s-full-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useKnowledgeList } from '../../composables/useKnowledgeListContext'
const props = withDefaults(defineProps<{
    visible: boolean,
    slug: string,
    name: string,
}>(), {
    visible: false,
    slug: '',
    name: '',
})
const { handleDelete, deleteLoading } = useKnowledgeList();
const emit = defineEmits<{
    'update:visible': [value: boolean]
    success: []
}>()
const status = computed(() => {
    return (!inputValue.value || inputValue.value.trim() === props.slug) ? '' : 'error'
})
const inputValue = ref('')

const toDelete = async () => {
    if (status.value === 'error' || !inputValue.value) {
        message.error('请按照提示输入正确的内容')
        return
    }
    handleDelete(props.slug, () => {
        message.success('删除成功')
        emit('update:visible', false)
        emit('success')
    })
}
watch(() => props.visible, (newVal) => {
    if (newVal) {
        inputValue.value = ''
    }
})
</script>