export type Role = 'academy' | 'admin' | 'teacher' | 'parent';

export interface User {
    id: string;
    academy_id: string;
    role: Role | null;
    roles?: Role[];
    external_id: string;
    display_name: string;
    email: string;
    phone: string;
    profile_picture_url?: string | null;
    is_active: boolean;
    created_at?: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    role: Role | null;
    loading: boolean;
    error: string | null;
}

export function isRole(role: any): role is Role {
    return ['academy', 'admin', 'teacher', 'parent'].includes(role);
}
