/// <reference types="vite/client" />
/// <reference types="vue/jsx" />

/**
 * 静态资源类型定义
 * 支持导入图片、SVG、字体等静态资源
 */
declare module '*.png' {
    const src: string
    export default src
}

declare module '*.jpg' {
    const src: string
    export default src
}

declare module '*.jpeg' {
    const src: string
    export default src
}

declare module '*.gif' {
    const src: string
    export default src
}

declare module '*.svg' {
    const src: string
    export default src
}

declare module '*.webp' {
    const src: string
    export default src
}

declare module '*.ico' {
    const src: string
    export default src
}

declare module '*.bmp' {
    const src: string
    export default src
}

/**
 * 字体文件类型定义
 */
declare module '*.woff' {
    const src: string
    export default src
}

declare module '*.woff2' {
    const src: string
    export default src
}

declare module '*.ttf' {
    const src: string
    export default src
}

declare module '*.eot' {
    const src: string
    export default src
}
// Vue JSX 支持
declare module 'vue/jsx-runtime' {
    export * from '@vue/runtime-dom'
}
/**
 * 样式文件类型定义
 */
declare module '*.css' {
    const classes: { readonly [key: string]: string }
    export default classes
}

declare module '*.less' {
    const classes: { readonly [key: string]: string }
    export default classes
}

declare module '*.scss' {
    const classes: { readonly [key: string]: string }
    export default classes
}

/**
 * 环境变量类型定义
 * 根据项目实际使用的环境变量进行扩展
 */
interface ImportMetaEnv {
    /**
     * 系统标题
     */
    readonly VITE_SYS_TITLE: string

    /**
     * API 基础路径
     */
    readonly VITE_API_BASE_URL?: string

    /**
     * 应用运行模式
     */
    readonly VITE_APP_MODE?: 'development' | 'production' | 'test'

    /**
     * 其他环境变量...
     * 根据项目需要添加更多环境变量类型定义
     */
    readonly [key: string]: string | undefined
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
