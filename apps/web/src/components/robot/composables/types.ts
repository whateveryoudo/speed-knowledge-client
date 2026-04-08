export interface PaginationResponse<T> {
  data?: {
    items: T[];
    page: number;
    has_more: boolean;
    page_size: number;
    total: number;
  },
  success: boolean;
  errCode?: number;
  errMessage?: string;
}
/**
 * 文本转语音配置
 */
export interface TextToSpeechConfig {
  enabled: boolean; // 是否开启
  voice?: string; // 语音类型
  language?: string; // 语言
  autoPlay?: 'enabled' | 'disabled'; // 自动播放：开启/关闭
}

/**
 * 用户输入表单控件类型
 */
export type UserInputFormType = 'text-input' | 'paragraph' | 'select';

/**
 * 文本输入控件基础配置
 */
interface BaseInputControl {
  label: string; // 控件展示标签名
  variable: string; // 控件 ID
  required: boolean; // 是否必填
  default?: string; // 默认值
}

/**
 * 文本输入控件
 */
export interface TextInputControl extends BaseInputControl {
  type: 'text-input';
}

/**
 * 段落文本输入控件
 */
export interface ParagraphInputControl extends BaseInputControl {
  type: 'paragraph';
}

/**
 * 下拉控件
 */
export interface SelectInputControl extends BaseInputControl {
  type: 'select';
  options: string[]; // 选项值
}

/**
 * 用户输入表单控件（联合类型）
 */
export type UserInputFormControl = TextInputControl | ParagraphInputControl | SelectInputControl;

/**
 * 图片上传配置
 */
export interface ImageUploadConfig {
  enabled: boolean; // 是否开启
  number_limits?: number; // 图片数量限制，默认 3
  transfer_methods: ('remote_url' | 'local_file')[]; // 传递方式列表，remote_url, local_file，必选一个
}

/**
 * 文件上传配置
 */
export interface FileUploadConfig {
  image?: ImageUploadConfig; // 图片设置 当前仅支持图片类型：png, jpg, jpeg, webp, gif
}




// 会话历史
export interface ConversationItem {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  last_message_preview: string;
}





/**
 * 聊天消息
 */
export interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  message: string;
  status?: 'ready' | 'pending' | 'doing' | 'fail' | 'cancel' | 'over';
  linkQuestion?: string; // 关联的问题
  // 额外信息（目前支持传入link映射，前端做回显）
  context?: {
    session_id?: string;
    citations?: {
      ref?: string;
      single_ref?: string;
      document_link?: string;
    }[];
  };
}
// 后端响应结构
export interface ChatMessageResponse {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  type: 'text' | 'tool_call' | 'tool_result' | 'error';
  created_at: string;
  updated_at: string;
}
export type RobotEndpoints = {
  stream: string;
  history: string;
  message: string;
};
/**
 * Chat 配置
 */
export interface ChatConfig {
  token: string;
  // 注入接口端点
  endPoints: RobotEndpoints;

}

