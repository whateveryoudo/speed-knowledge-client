export interface RegisterParams {
    username: string;
    password: string;
    nickname?: string;
    verificateCode: string;
    verificateId: string;
}

export interface UserInfo {
    id: number;
    username: string;
    email: string;
    avatar?: string;
    nickname?: string
    created_at: string
    updated_at: string
}