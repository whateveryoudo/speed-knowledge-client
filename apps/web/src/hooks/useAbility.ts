import { computed, type Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useKnowledgeStore } from '#sk-web/store/useKnowledgeStore'
import type { Ability } from '@sk/types'

/**
 * 权限判断 composable
 *
 * 默认从 knowledgeStore.knowledgeInfo.ability 读取；
 * 也可传入独立的 ability Ref（适用于独立拉取 knowledgeInfo 的页面，如 manage）
 *
 * @example
 * ```html
 * <script setup>
 * const { ability, can } = useAbility()
 * const canEditDoc = can(DocumentAbility.DOC_EDIT)
 * </script>
 *
 * <template>
 *   <!-- 方式1：ability 自动 unwrap，字段名是枚举的 value（如 'doc_edit'） -->
 *   <a-button v-if="ability.doc_edit">编辑</a-button>
 *
 *   <!-- 方式2：can() 辅助函数 -->
 *   <a-button v-if="can(DocumentAbility.DOC_EDIT)">编辑</a-button>
 *
 *   <!-- 方式3：命名 computed（推荐用于多处引用） -->
 *   <a-button v-if="canEditDoc">编辑</a-button>
 * </template>
 * ```
 */
export function useAbility(source?: Ref<Record<Ability, boolean> | undefined>) {
  const store = useKnowledgeStore()
  const { knowledgeInfo } = storeToRefs(store)

  const ability = computed<Record<Ability, boolean>>(() => {
    if (source) return source.value ?? ({} as Record<Ability, boolean>)
    return knowledgeInfo.value.ability ?? ({} as Record<Ability, boolean>)
  })

  /** 模板中可直接调用，返回 boolean（非 ComputedRef），依赖组件重渲染的响应式 */
  const can = (key: Ability): boolean => Boolean(ability.value[key])

  /** 返回 ComputedRef，适合在 script 中组合其他 computed */
  const canRef = (key: Ability) => computed(() => Boolean(ability.value[key]))

  const canAny = (...keys: Ability[]) => keys.some((key) => Boolean(ability.value[key]))

  const canAnyRef = (...keys: Ability[]) => computed(() => keys.some((key) => Boolean(ability.value[key])))

  return { ability, can, canRef, canAny, canAnyRef }
}
