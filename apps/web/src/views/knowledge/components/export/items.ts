import WordIcon from '#sk-web/assets/images/menus/word.svg'
import MarkdownIcon from '#sk-web/assets/images/menus/markdown.svg'
import SpeedIcon from '#sk-web/assets/images/menus/speed.svg'
import ImageIcon from '#sk-web/assets/images/menus/image.svg'
import PdfIcon from '#sk-web/assets/images/menus/pdf.svg'
import { DocumentExportFormat, DocumentType } from '@sk/types'

/** 服务端导出 | 前端可视化导出 */
export type ExportChannel = 'server' | 'client'

export type ClientVisualFormat = 'pdf' | 'image'

export interface DocumentExportItem {
  key: string
  label: string
  desc: string
  ext: string
  icon: string
  channel: ExportChannel
  /** 服务端 DocumentExportFormat */
  serverFormat?: DocumentExportFormat
  /** 前端 pdf / image */
  visualFormat?: ClientVisualFormat
  /**
   * 适用的文档类型；空数组表示不限制（一般不这样用）
   * 后续 sheet 可挂 excel / .speedsheet 等
   */
  documentTypes: DocumentType[]
}

/** 全量导出项（按 documentType 过滤） */
export const ALL_DOCUMENT_EXPORT_ITEMS: DocumentExportItem[] = [
  {
    key: 'word',
    label: 'Word',
    desc: '.docx',
    ext: '.docx',
    icon: WordIcon,
    channel: 'server',
    serverFormat: DocumentExportFormat.WORD,
    documentTypes: [DocumentType.WORD],
  },
  {
    key: 'markdown',
    label: 'Markdown',
    desc: '.md',
    ext: '.md',
    icon: MarkdownIcon,
    channel: 'server',
    serverFormat: DocumentExportFormat.MARKDOWN,
    documentTypes: [DocumentType.WORD],
  },
  {
    key: 'speed',
    label: 'Speed 文档',
    desc: '.speed',
    ext: '.speed',
    icon: SpeedIcon,
    channel: 'server',
    serverFormat: DocumentExportFormat.SPEED,
    documentTypes: [DocumentType.WORD],
  },
  {
    key: 'pdf',
    label: 'PDF',
    desc: '.pdf',
    ext: '.pdf',
    icon: PdfIcon,
    channel: 'client',
    visualFormat: 'pdf',
    documentTypes: [DocumentType.WORD],
  },
  {
    key: 'image',
    label: '图片',
    desc: '.jpg',
    ext: '.jpg',
    icon: ImageIcon,
    channel: 'client',
    visualFormat: 'image',
    documentTypes: [DocumentType.WORD],
  },
  // 后续示例：
  // {
  //   key: 'excel',
  //   label: 'Excel',
  //   desc: '.xlsx',
  //   ext: '.xlsx',
  //   icon: ...,
  //   channel: 'server',
  //   documentTypes: [DocumentType.SHEET],
  // },
]

export function getExportItemsForDocumentType(
  documentType: DocumentType,
): DocumentExportItem[] {
  return ALL_DOCUMENT_EXPORT_ITEMS.filter((item) =>
    item.documentTypes.includes(documentType),
  )
}
