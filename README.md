# Speed Knowledge Client

一个类似语雀的知识库管理系统前端应用，支持知识库创建、文档编辑、协同编辑等功能。

## 📋 项目简介

Speed Knowledge Client 是一个现代化的知识管理平台前端应用，提供知识库管理、文档编辑、团队协作等功能。采用 Vue 3 + TypeScript 构建，提供流畅的用户体验和强大的编辑能力。

### 项目部分截图

#### 默认看板

![默认看板](./screenshots/看板.png)

#### 协同编辑

![协同编辑](./screenshots/文档编辑.png)

## 🛠️ 技术栈

### 核心框架
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 下一代前端构建工具
- **Vue Router** - 官方路由管理器
- **Pinia** - Vue 官方状态管理库

### UI 框架与组件
- **Ant Design Vue** - 企业级 UI 组件库
- **Speed Components UI** - 基于 Ant Design Vue 的二次封装组件库
- **UnoCSS** - 即时原子化 CSS 引擎

### 编辑器
- **Speed Tiptap Editor** - 基于 Tiptap 的富文本编辑器，支持协同编辑

### 工具库
- **@vueuse/core** - Vue Composition API 工具集合
- **axios** - HTTP 客户端
- **dayjs** - 日期处理库
- **lodash-es** - JavaScript 工具库

## 📁 项目结构

```
speed-knowledge-client/
├── apps/
│   └── web/                    # 主应用
│       ├── src/
│       │   ├── assets/         # 静态资源
│       │   ├── components/     # 全局组件
│       │   │   ├── global/     # 全局通用组件
│       │   │   └── ...         # 业务组件
│       │   ├── views/          # 页面视图
│       │   │   ├── dashboard/  # 首页/仪表盘
│       │   │   ├── knowledge/  # 知识库相关页面
│       │   │   └── login/      # 登录页面
│       │   ├── router/         # 路由配置
│       │   ├── store/          # Pinia 状态管理
│       │   ├── hooks/          # 组合式函数
│       │   └── utils/          # 工具函数
│       └── ...
├── packages/
│   ├── sk-api/                 # API 请求封装
│   ├── sk-types/               # TypeScript 类型定义和一些字典导出
│   └── sk-utils/               # 工具函数库
└── ...
```

## ✨ 已完成功能

### 📚 知识库管理
- ✅ 知识库创建与管理
- ✅ 知识库分组
- ✅ 知识库图标自定义
- ✅ 知识库分享与权限设置

### 👥 团队协作
- ✅ 人员邀请（链接方式）
- ✅ 协作者管理
- ✅ 协同权限设置（只读/编辑/管理员）

### 📝 文档编辑
- ✅ 文档创建（目前仅支持 Word 类型）
- ✅ 富文本编辑（基于 Tiptap）
- ✅ 文档目录树管理
- ✅ 文档搜索
- ✅ 文档浏览历史记录
- ✅ 文档编辑历史记录

### 🤝 实时协同编辑
- ✅ 多人实时协同编辑
- ✅ 协同人员状态显示

### 📄 文档查看
- ✅ OnlyOffice 文档预览
- ✅ 文档附件管理

## 🚧 TODO

### 🔐 权限系统
- ⏳ 细粒度权限校验
- ⏳ 文档级权限控制
- ⏳ 操作日志记录

### 📄 文档类型扩展
- ⏳ 支持更多文档类型（Excel等）
- ⏳ 文档模板功能
- ⏳ 文档导入导出(后端实现)
- ...
### 📊 文档细节优化
- ⏳ 文档版本管理
- ⏳ 文档评论功能
- ⏳ 文档标签系统
- ⏳ 文档关联关系
- ...

### 🎨 用户体验优化
- ⏳ 主题切换（亮色/暗色）
- ⏳ 多语言支持
- ⏳ 快捷键自定义
- ⏳ 移动端适配

## 🔗 相关项目

### 编辑器
- **[Speed Tiptap Editor](https://github.com/whateveryoudo/speed-tiptap-editor)**  
  基于 Tiptap 的富文本编辑器，提供丰富的编辑功能和扩展能力。

### 后端 API
- **[Speed Knowledge Server](https://github.com/whateveryoudo/speed-knowledge-server)**  
  后端服务，提供 RESTful API 接口。
  - **主接口**: Python FastAPI
  - **协同服务**: Node.js NestJS

### 业务组件库
- **[Speed Components UI](https://github.com/whateveryoudo/speed-components-ui)**  
  基于 Ant Design Vue 的二次封装组件库，提供业务场景下的常用组件。

### 文档预览
- **[OnlyOffice](https://github.com/whateveryoudo/onlyoffice)**  
  集成 OnlyOffice 实现文档在线预览和编辑功能。

## 🚀 快速开始

### 环境要求

- Node.js: `^20.19.0 || >=22.12.0`
- pnpm: `>=8.0.0`

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

应用将在 `http://localhost:5173` 启动（端口可能因配置而异）。

### 构建生产版本

```bash
pnpm build
```

### 类型检查

```bash
pnpm type-check
```

### 代码检查与格式化

```bash
# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

### 运行测试

```bash
pnpm test:unit
```

## 📖 使用说明

### 环境变量配置

在项目根目录创建 `.env` 文件，配置以下变量：

```env
# API 基础地址
VITE_APP_BASE_URL=http://localhost:8010

# 代理地址（用于开发环境）
VITE_APP_PROXY_URL=http://localhost:5173
```

### 开发模式切换

```bash
# 默认模式（连接 Python FastAPI）
pnpm dev

# Node.js 模式（连接 NestJS，目前node暂未开发模块）
pnpm dev:node
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
