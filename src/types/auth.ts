import { User, Role } from './User';

export interface AuthState {
    user: User | null;
    token: string | null;
    role: Role | null;
    loading: boolean;
    error?: string | null;
}

export interface LoginPayload {
    emailOrPhone: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    token: string;
    role: Role;
}
