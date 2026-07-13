export interface RegisterParams {
  username: string
  email: string
  password: string
  email_code: string
  nickname?: string
}

export interface UserInfo {
  id: number
  username: string
  email: string
  avatar?: string
  nickname?: string
  created_at: string
  updated_at: string
}

export interface Collaborator {
  id: number
  name: string
  color: string
  avatar?: string
}
