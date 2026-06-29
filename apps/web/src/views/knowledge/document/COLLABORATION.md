# Word 文档协同编辑 — 记忆点

> 改标题闪屏、协同重建等问题，优先查本文。相关代码：`WordEditor.vue`、`useWordEditorProps.ts`、`useKnowledgeStore.handleUpdateDocumentName`、`speed-tiptap-editor/useCollaboration.ts`。

## 架构（refactor 后）

```text
index.vue
  v-if="showEditor"                    ← 文档 A→B 切换时序（拉详情前卸编辑器）
  WordEditor
    useCollaboration(config)           ← config 变化 → destroy → ydoc=null → 再 new
    v-if="ready" (= !!ydoc)            ← ydoc 为空时卸载 SpeedTiptapEditor
    SpeedTiptapEditor(:ydoc, :provider)
      editor.vue watch ydoc/provider   ← 组件已挂载时热更新 extensions（setOptions）
```

**与最初版本的区别**：早期 `collaboration` 在 `editor.vue` 内部一次性创建，不 watch config 引用；refactor 后协同提到 `useCollaboration`，且 WordEditor 用 `v-if="ready"` 等 sync，config 误触发会导致整编辑器卸载重挂。

## 闪屏根因链

```text
handleUpdateDocumentName
  documentInfo.value = res.data          ← 错误：整对象替换
    → useWordEditorProps computed 重算
    → return { collaboration: {...} }  ← 每次都是新对象（documentId 可不变）
    → useCollaboration watch (deep) 触发
    → setup() 开头 destroy() → ydoc = null
    → WordEditor ready = false → v-if 卸载编辑器
    → onSynced → ydoc 恢复 → 重新挂载 → 闪一下
```

## documentInfo 如何更新

### 改文档标题（必遵）

```ts
// ✅ 只 patch 需要的字段
documentInfo.value.name = res.data.name

// ❌ 不要整对象替换（会触发 editorProps 重算 → 协同 config 新引用 → 重建）
documentInfo.value = res.data
```

`useWordEditorProps` 的 computed **只依赖** `documentInfo.id`、`documentInfo.knowledge_id`、`userInfo`，**不依赖** `name`。因此只改 `name` 时 collaboration 对象引用不变，不会触发协同重建。

### 拉文档详情（换文档）

`initDocumentDetail` 里 `documentInfo.value = res.data` **可以**，因为此时配合：

- `showEditor = false → true`（预期卸载再挂）
- `editorKey` 含 `documentId`（预期整组件重建）

这是 **A→B 切换**，需要全新协同，与「同文档改标题」不同。

### 树节点标题

同文档重命名时优先 `Object.assign` / `updateNode` patch 单节点，避免不必要的 `rebuildDocumentTree` 全树重刷（若已 patch 单节点且 UI 正常，可评估是否还需 rebuild）。

## useWordEditorProps 注意点

当前实现每次 computed 重算都会 `return { collaboration: { ... } }` **新对象**。

只要 computed 因 `documentInfo` 整对象替换而重算，即使 `documentId` 相同，也会触发 `useCollaboration` 全量 destroy。

**加固（可选）**：用 `shallowRef` 持有稳定的 `collaboration` 对象，仅在 `documentId` / `knowledge_id` 变化时更新字段，而不是每次 computed 新建。

## useCollaboration 行为

`speed-tiptap-editor/src/hooks/useCollaboration.ts`：

- watch `[config, enabled]`，`deep: true`
- 任何 config 变化 → `setup()` → **先 `destroy()`** → 再 `new Y.Doc()` + `HocuspocusProvider`
- `ydoc` 仅在 `onSynced` 后赋值，中间为 `null`

| 场景 | 是否应 rebuild |
|------|----------------|
| documentId 变化（换文档） | 是 |
| enabled false / config null | destroy，不新建 |
| 同 documentId，config 仅新引用、字段相同 | **否**（当前会误重建） |
| 同 documentId，只改 user 头像等 |  ideally patch，当前也会全量重建 |

库侧可选优化：同 `documentId` skip destroy；watch 只盯 `documentId` + `enabled`。

## WordEditor `ready` 与 editor.vue watch

- **`v-if="ready"`**：首次等 ydoc sync 再 mount；`ydoc` 变 null 时会 **卸载** 整个编辑器（放大闪屏）。
- **editor.vue 307 行 watch**：编辑器 **已挂载** 后，`ydoc` / `provider` / `collaborationUser` 变化时 `setOptions` 热换 extensions，**不会**重新 `useEditor()`。

有 `v-if="ready"` 时，reconnect 走 remount 路径而非热更新；同文档误 destroy 时闪屏主要来自 v-if，而非 editor watch。

**加固（可选）**：`hasSyncedOnce` — 首次 sync 前用 v-if，之后 ydoc 短暂 null 也不卸载。

## 排查清单

1. 改标题是否用了 `documentInfo.value = res.data`？
2. 是否有别处整对象替换 `documentInfo` 且未切文档？
3. `useWordEditorProps` 是否每次返回新 `collaboration` 对象？
4. 控制台看 `ydoc` 是否出现 `有 → null → 有`？
5. 换文档应用 `showEditor` + `editorKey`，不应与同文档改标题混为一谈。

## 相关文件

| 文件 | 职责 |
|------|------|
| `store/useKnowledgeStore.ts` | `handleUpdateDocumentName`、`initDocumentDetail`、`showEditor` |
| `composables/useWordEditorProps.ts` | 传给 WordEditor 的 `editorProps.collaboration` |
| `editors/WordEditor.vue` | `useCollaboration` + `v-if="ready"` |
| `document/index.vue` | `showEditor`、`editorKey`、标题双向绑定 |
| `speed-tiptap-editor/.../useCollaboration.ts` | Y.Doc / Provider 生命周期 |
| `speed-tiptap-editor/.../editor.vue` | 接收外部 ydoc，extensions 热更新 |
