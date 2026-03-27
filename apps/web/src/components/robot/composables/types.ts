// 获取应用参数 用于进入页面一开始，获取功能开关、输入参数名称、类型及默认值等使用。
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

/**
 * 系统参数配置
 */
export interface SystemParameters {
  file_size_limit?: number; // Document upload size limit (MB)
  image_file_size_limit?: number; // Image file upload size limit (MB)
  audio_file_size_limit?: number; // Audio file upload size limit (MB)
  video_file_size_limit?: number; // Video file upload size limit (MB)
}

/**
 * Agent 参数配置
 */
export interface AgentParameters {
  opening_statement?: string; // 开场白
  suggested_questions?: string[]; // 开场推荐问题列表
  suggested_questions_after_answer?: {
    enabled: boolean; // 是否开启
  };
  speech_to_text?: {
    enabled: boolean; // 是否开启
  };
  text_to_speech?: TextToSpeechConfig; // 文本转语音
  retriever_resource?: {
    enabled: boolean; // 是否开启
  };
  annotation_reply?: {
    enabled: boolean; // 是否开启
  };
  user_input_form?: UserInputFormControl[]; // 用户输入表单配置
  file_upload?: FileUploadConfig; // 文件上传配置
  system_parameters?: SystemParameters; // 系统参数
}

// 会话历史
export interface ConversationItem {
  created_at: string;
  id: string;
  inputs: Record<string, any>;
  introduction: string;
  name: string;
  status: string;
  updated_at: string;
}

/**
 * 工作流步骤状态
 */
export type WorkflowStepStatus = 'loading' | 'success' | 'error';

/**
 * 工作流步骤
 */
export interface WorkflowStep {
  type: string;
  timestamp: number;
  eventId?: string;
  data?: {
    id?: string;
    node_id?: string;
    node_type?: string;
    title?: string;
    elapsed_time?: number;
    outputs?: {
      text?: string;
    };
  };
  elapsed_time?: number | null;
  status: WorkflowStepStatus;
  open?: boolean;
  content?: string;
}

/**
 * 数据资源项
 */
export interface ResourceItem {
  id: string;
  name: string;
  [key: string]: any;
}

/**
 * 回答项（用于报告生成）
 */
export interface AnswerItem {
  name: string;
  answer: string;
  finished: WorkflowStep[];
  finishedloading: boolean;
}

/**
 * 聊天消息
 */
export interface MessageItem {
  id?: string;
  role: 'user' | 'assistant';
  message: string;
  status?: 'ready' | 'pending' | 'fail' | 'cancel' | 'over';
}


/**
 * Chat 配置
 */
export interface ChatConfig {
  token: string;
  baseUrl: string;
  // userName: string;
  // appType: '1' | '2' | '4'; // 1: 智能找数, 4: 智能问数 2: 报告（这里只对报告进行特殊处理，其他不处理）
  // agentInfo?: {
  //   id: number;
  //   title: string;
  //   description: string;
  //   icon: any;
  //   color: string;
  //   apiKey: string;
  // };
}

/**
 * SSE 事件类型
 */
export type SSEEventType =
  | 'workflow_started'
  | 'node_started'
  | 'node_finished'
  | 'message'
  | 'message_end'
  | 'workflow_finished'
  | 'error';

/**
 * SSE 事件数据
 */
export interface SSEEvent {
  event: SSEEventType;
  task_id?: string;
  message_id?: string;
  answer?: string;
  message?: string;
  data?: {
    id?: string;
    node_id?: string;
    node_type?: string;
    title?: string;
    elapsed_time?: number;
    outputs?: {
      text?: string;
    };
  };
}

