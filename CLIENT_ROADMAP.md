# Speed Knowledge Client 跨端架构与后续开发规划

本文档记录了关于 `speed-knowledge-client` 在**桌面端（Electron）**、**移动端（H5 / 独立 App）**以及**无 UI 业务 Hook 层（Headless Composables）**的架构演进方案与实施路径。

---

## 一、当前架构现状与资产盘点

当前仓库采用标准现代的 Monorepo（pnpm workspace + Turborepo）架构，已具备优秀的分层基础：
- **`@sk/api`**：纯粹的业务请求客户端（与 UI 彻底解耦）；
- **`@sk/types`**：全链路统一的 TypeScript 类型定义；
- **`@sk/utils`**：通用业务工具库；
- **`apps/web`**：当前 PC 端知识库 Web 平台（Vue 3 + Ant Design Vue + UnoCSS）；
- **`apps/desktop`**：刚搭建完成的 Electron 桌面端外壳（基于 `electron-vite` + `electron 34`，零侵入加载 `apps/web`）；
- **编辑器与表格核心**：`@speed-tiptap-editor` 与 `@speed-sheet` 作为独立重型引擎驱动。

---

## 二、桌面端（Desktop / Electron）方案

### 1. 方案选型结论
- 选型：**Electron**（对齐语雀、Notion、Obsidian、飞书）。
- 核心优势：
  - 富文本（Tiptap/ProseMirror）和 Canvas 电子表格（SpeedSheet）对 Chromium 渲染、DPR 缩放和字体测量一致性要求极高；
  - 保证 Mac / Windows / Linux 跨平台渲染与导出效果 100% 相同。

### 2. 现有落地情况
- 目录位置：`apps/desktop/`
- 核心机制：
  - **开发模式**：`pnpm dev:desktop`，直接热加载前端 Vite 开发服务器（`http://localhost:5173`），享受极速 HMR；
  - **生产打包**：`apps/web/dist/index.html` 离线加载；
  - **预加载桥接**：`src/preload/index.ts` 通过 `contextBridge` 向渲染层注入安全沙箱 API `window.electronAPI`（提供窗口最小化、最大化、关闭、平台判断等）。
- 待完善能力（后续排期）：
  - 顶部拖拽支持：在主界面顶部特定空白区域配置 `-webkit-app-region: drag;`（交互按钮设为 `no-drag`）；
  - 系统托盘（Tray）、全局快捷键唤起速记、多窗口并排预览。

---

## 三、移动端（Mobile / H5 / App）演进路线

基于对语雀多端形态（PC Web、H5 移动自适应、安卓官方 App）的深入分析，确定**分两阶段实施**：

### 阶段一：PC Web（`apps/web`）低成本移动端兜底适配
- **定位**：解决**应急查阅与外部链接分享**（如微信中点开文档、手机浏览器临时访问）。
- **参考**：语雀 H5 模式（URL 保持不变，如 `yuque.com/dashboard`，同源加载精简单列流，沿用部分 AntD 组件）。
- **落地方式**：
  - 在 `apps/web` 路由或关键页面外壳上，通过 `@vueuse/core` 的 `useBreakpoints` 识别小屏幕（`< 768px`）；
  - 做单列流自适应，收起复杂的 PC 大屏三栏侧边栏，改为单列卡片或轻量抽屉；
  - 成本极低，优先保证手机浏览器打开时不破损、无横向滚动条。

### 阶段二：独立移动端工程（`apps/mobile`）打造极致 App 体验
- **定位**：解决**重度移动端使用与移动应用发布**（对齐语雀官方安卓 App 体验）。
- **技术栈**：**Vite 6 + Vue 3.5 + Vant + TypeScript + Capacitor**
- **拒绝使用 uni-app 的原因**：
  - 避免 HBuilderX 强绑定和开发体验割裂；
  - 避免 DCloud 魔改黑盒编译器对现代 npm 生态和标准 Monorepo 的侵入；
  - 保持 100% 现代标准前端工具链（VS Code、pnpm、ESLint、UnoCSS）。
- **工程形态**：
  ```text
  apps/
    web/          # PC 网页端
    desktop/      # 桌面端外壳
    mobile/       # 专门的移动端工程 (全新手机交互设计)
  ```
- **核心体验特征**：
  - 手机专属交互：底部悬浮操作岛（搜索、新建、AI）、手势下拉刷新、触控卡片流；
  - 100% 复用下沉的 `@sk/api`、`@sk/types` 及业务 Hook；
  - 打包双通道：既可作为独立的手机 H5 站部署，也可通过 `@capacitor/core` 一键生成 iOS Xcode 与 Android 原生工程，打包发布 App 安装包（APK/IPA）。

---

## 四、无 UI 业务 Hook 层（`@sk/composables`）抽离设计

为了让 `apps/web` 与未来的 `apps/mobile` 共享 100% 相同的业务数据流与状态机，避免重复编写模板状态代码，计划在业务功能稳定后抽离 **`packages/sk-composables`**。

### 1. 职责边界与“度”的划分
- **通用组件库层（`speed-components` 的 `useTable` 等）**：
  - 纯粹的通用调度器与状态机协议，**绝不引入任何具体的业务接口名和业务字段**。
- **业务 Hook 层（`@sk/composables`）**：
  - 负责把具体业务接口（`@sk/api`）与通用状态机缝合；
  - 维护具体业务的数据状态、搜索防抖、分页、操作（增删改查、排序、收藏）并触发自动刷新；
  - **绝不引入任何 DOM、Ant Design 或 Vant 组件**，100% 纯 Vue 响应式逻辑。
- **视图层（UI Views）**：
  - `apps/web` 和 `apps/mobile` 只负责组件拼装、排版和样式，代码缩减 60% 以上。

### 2. 计划沉淀的 6 大核心业务 Hook

1. **`useKnowledgeList`（知识库列表与分组管理）**
   - 负责个人/团队知识库、常用置顶（CommonPin）、分组列表的拉取与排序；
   - 暴露新建知识库、删除、调整分组顺序、置顶切换等动作。
2. **`useDocumentHistory`（工作台最近文档）**
   - 封装工作台编辑过/浏览过文档流；
   - 支持常规翻页以及移动端专属的触底加载追加（`loadMore`）和下拉刷新（`refresh`）。
3. **`useCollect`（全局收藏管理）**
   - 针对文档与知识库维护收藏状态布尔值及乐观切换操作。
4. **`useDocumentCatalog`（文档大纲树与目录操作）**
   - 获取知识库完整文档树节点；
   - 维护选中项、展开节点、拖拽换层级、新建子文档。
5. **`useTeam`（团队与空间准入）**
   - 团队列表、团队详情、成员与空间权限校验。
6. **`useNotification`（消息中心）**
   - 未读红点计数、分类消息拉取、一键已读。

---

## 五、推进节奏与优先级

1. **当前阶段（当前会话主线）**：
   - 保持现有架构专注度，**继续推进并完善当前 Web 核心功能与 `speed-sheet` 表格功能**；
   - 暂不提前做大规模架构抽取，避免在业务模型高频变动期增加抽象包袱。
2. **下一阶段（新会话开启时）**：
   - 当前 Web 功能闭环后，按本文档规划在 `packages/sk-composables` 提炼成熟的业务 Hook；
   - 验证 `apps/web` 接入新 Hook；
   - 启动 `apps/mobile`（Vue 3 + Vant + Capacitor）或做 PC 端大屏移动端单列自适应。
