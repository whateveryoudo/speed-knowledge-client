export type EmailScene = 'register' | 'forgot_password' | 'reset_password' | 'change_email'

export interface LoginParams {
  username: string
  password: string
  verificateId?: string
  verificateCode?: string
}

export interface LoginResponse {
  access_token: string
}

export interface LoginErrorDetail {
  message: string
  captcha_required: boolean
}

export interface CaptchaResponse {
  captcha_id: string
  captcha_image: string
}

export interface SendEmailCodeRequest {
  email: string
  scene?: EmailScene
}

export interface SendEmailCodeResponse {
  message?: string
  expire_seconds?: number
}
