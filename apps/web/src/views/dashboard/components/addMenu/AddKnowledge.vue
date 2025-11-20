<template>
    <s-full-modal width="424px" :open="open" title="新建知识库" :footer="false" @cancel="handleCancel">
        <a-form ref="formRef">
            <!-- 基本信息 -->
            <div class="mb-6">
                <div class="mt-4 mb-2 text-[var(--ant-color-text)]">基本信息</div>

                <a-form-item name="name" label="" class="mb-3">
                    <a-flex :gap="6">
                        <KnowledgeIconSelect v-model:value="form.icon" />
                        <a-input ref="nameInputRef" v-model:value="form.name" placeholder="知识库名称" />
                    </a-flex>
                </a-form-item>
                <a-form-item name="description" label="">
                    <a-textarea v-model:value="form.description" placeholder="请输入知识库简介" :rows="4" :maxlength="200" />
                </a-form-item>
            </div>
            <div class="mb-6">
                <div class="mt-4 mb-2 text-[var(--ant-color-text)]">封面</div>

                <a-form-item name="cover" label="" class="mb-3">
                    <s-custom-upload type="picture" v-model:value="form.cover" :max-count="1" />
                </a-form-item>
            </div>

            <!-- 新建至,TODO:这里是空间选择，目前没有 -->
            <div class="mb-6">
                <div class="mb-2 text-[var(--ant-color-text)]">新建至</div>
                <a-form-item name="owner">
                    <a-input value="个人" disabled>
                        <template #prefix>
                            <img :src="avatarDef" class="w-[24px] h-[24px] rounded-full" />
                        </template>
                    </a-input>
                </a-form-item>
            </div>

            <!-- 分组 -->
            <div class="mb-6">
                <div class="mb-2 text-[var(--ant-color-text)]">分组</div>
                <a-form-item name="group">
                    <a-select v-model:value="form.group_id" :options="groupOptions" placeholder="请选择分组" />
                </a-form-item>
            </div>
        </a-form>
        <a-button block type="primary" :class="[!canSubmit && 'opacity-50 cursor-not-allowed']" :loading="loading"
            @click="handleOk">
            新建
        </a-button>
    </s-full-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { IconFont } from 'speed-components-ui/components'
import { UserOutlined } from '@ant-design/icons-vue'
import type { FormInstance, SelectProps } from 'ant-design-vue'
import avatarDef from '#sk-web/assets/images/avatar_def.png'
import KnowledgeIconSelect from './KnowledgeIconSelect.vue'

import to from 'await-to-js'

interface Props {
    open?: boolean
}

interface Emits {
    (e: 'update:open', value: boolean): void
    (e: 'ok', values: FormValues): void
}

interface FormValues {
    name: string
    description?: string
    group_id?: string
    icon: string
    cover?: any[]
}

const props = withDefaults(defineProps<Props>(), {
    open: false
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const nameInputRef = ref<HTMLInputElement>()
const loading = ref(false)

const form = ref<FormValues>({
    name: '',
    description: '',
    group_id: undefined,
    icon: 'icon-book-0',
})
const groupOptions = ref<SelectProps['options']>([])

const rules = {
    name: [
        { required: true, message: '请输入知识库名称', trigger: 'blur' }
    ],
    group: [
        { required: true, message: '请选择分组', trigger: 'change' }
    ]
}

// 通过 watch 字段判断按钮是否可用
const canSubmit = computed(() => {
    return !!form.value.name.trim() && !!form.value.group_id
})

// 监听 open 变化，重置表单
watch(() => props.open, (val) => {
    if (val) {
        // 打开时重置表单
        form.value = {
            name: '',
            description: '',
            group_id: undefined,
            icon: 'icon-book-0',
        }
        formRef.value?.clearValidate()
    }
})

const getKnowledgeGroupListData = async () => {
    const [error, res] = await to(getKnowledgeGroupList())
    if (error) {
        return
    }
    groupOptions.value = res.data.map((item: KnowledgeGroupItem) => ({
        label: item.group_name,
        value: item.id,
    }))
}





const handleOk = async () => {
    if (!canSubmit.value) return
    try {
        loading.value = true

        // 模拟提交
        setTimeout(() => {
            emit('ok', { ...form.value })
            emit('update:open', false)
            loading.value = false
        }, 500)
    } catch (error) {
        console.error('表单验证失败:', error)
    }
}

const handleCancel = () => {
    emit('update:open', false)
}

watch(() => props.open, async (val) => {
    if (val) {
        await nextTick()
        nameInputRef.value?.focus();
        getKnowledgeGroupListData();
    }
}, { immediate: true })
</script>

<style lang="less" scoped>
:deep(.ant-form-item-label) {
    font-weight: 500;
}
</style>