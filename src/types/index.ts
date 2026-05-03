import { Role } from './User';

export * from './auth';
export * from './class';
// export * from './student';
// export * from './parent';

export interface Student {
    id: string;
    academy_id: string;
    student_id: string;
    registration_no: string;
    aadhar_no?: string | null;
    first_name: string;
    last_name?: string | null;
    date_of_birth: string;
    roll_no?: string | null;
    class_name: string;
    class_section?: string | null;
    academic_year: string;
    joining_date?: string;
    profile_picture_url?: string | null;
    is_active: boolean;
    created_at?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave' | 'pending';
export interface ParentInput {
    id?: string;
    display_name: string;
    phone: string;
    email?: string;
    address?: string;
    relationship?: string;
}

export interface CreateParentStudent {
    student: Student;
    parent_id?: string;
    updated_parent?: ParentInput;
    new_parents?: ParentInput[];
};

export type CreateStudentInput = Partial<Student> & {
    relationship?: string;
    parent_id?: string;
    updated_parent?: Partial<ParentInput>;
    new_parents?: ParentInput[];
};

export interface CreateUserInput {
    display_name: string;
    phone?: string | null;
    password: string;
    role: Role;
}

export interface AcademyOverview {
    academy: {
        id: string;
        academy_id: string;
        academy_name: string;
    };
    academic_session: string;
    metrics: {
        classes: number;
        students: number;
        teachers: number;
        attendance_today: number;
        present_today: number;
        active_students: number;
        average_marks?: number;
    };
    teacher_previews: {
        id: string;
        display_name: string;
    }[];
}

export type AcademyUserType = 'academy' | 'admin' | 'teacher' | 'parent' | 'student';

export interface AcademyUserProfile {
    id: string;
    auth_user_id?: string;
    type: AcademyUserType;
    display_name: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
    department?: string | null;
    designation?: string | null;
    joining_date?: string | null;
    employee_id?: string | null;
    relationship?: string | null;
    address?: string | null;
    class_name?: string | null;
    class_section?: string | null;
    academic_year?: string | null;
    profile_picture_url?: string | null;
    status?: string | null;
    assigned_classes?: string[];
    roll_no?: string | null;
    linked_parent_id?: string | null;
    linked_parent_name?: string | null;
    linked_parent_status?: 'active' | 'pending' | 'inactive' | null;
}

export interface DashboardStudentSummary {
    id: string;
    student_id: string;
    display_name: string;
    first_name?: string | null;
    last_name?: string | null;
    class_name: string;
    class_section?: string | null;
    academic_year: string;
    roll_no?: string | null;
    profile_picture_url?: string | null;
    relationship?: string | null;
    attendance_status?: AttendanceStatus;
    attendance_percentage?: number;
    avg_marks?: number;
    homework_completion?: number;
    last_feedback_at?: string | null;
}

export interface DashboardAssignment {
    id: string;
    title: string;
    description?: string | null;
    due_date?: string | null;
    class_label?: string | null;
    status?: 'pending' | 'submitted' | 'review_due';
    subject?: string | null;
    student_id?: string | null;
    student_name?: string | null;
    teacher_remark?: string | null;
}

export interface DashboardMeeting {
    id: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    scheduled_time?: string | null;
    teacher_name?: string | null;
    student_name?: string | null;
}

export interface TeacherDashboardData {
    teacher: {
        id: string;
        display_name: string;
        profile_picture_url?: string | null;
    };
    metrics: {
        today_classes: number;
        attendance_pending: number;
        assignments_due: number;
        announcements: number;
        total_students?: number;
        homework_review?: number;
    };
    classes: {
        id: string;
        class_name: string;
        section?: string | null;
        academic_year: string;
        student_count: number;
        attendance_status: 'pending' | 'marked';
        subject?: string | null;
        start_time?: string | null;
    }[];
    assignments: DashboardAssignment[];
    meetings: DashboardMeeting[];
    announcements: Announcement[];
    recent_activity?: string[];
    schedule?: {
        id: string;
        time: string;
        subject: string;
        class_label: string;
    }[];
}

export interface ParentDashboardData {
    parent: {
        id: string;
        display_name: string;
        profile_picture_url?: string | null;
    };
    children: DashboardStudentSummary[];
    metrics: {
        children: number;
        attendance_alerts: number;
        assignments_due: number;
        meetings: number;
        attendance_percentage?: number;
        average_marks?: number;
        homework_pending?: number;
    };
    assignments: DashboardAssignment[];
    meetings: DashboardMeeting[];
    announcements: Announcement[];
    insights?: {
        title: string;
        detail: string;
    };
    upcoming?: string[];
    feedback?: {
        id: string;
        teacher_name: string;
        date: string;
        type?: string | null;
        strengths?: string | null;
        weaknesses?: string | null;
        suggestion?: string | null;
        rating?: string | null;
    }[];
    documents?: {
        id: string;
        title: string;
        type: string;
        uploaded_at: string;
        url?: string | null;
    }[];
    notifications: {
        id: string;
        type: string;
        message: string;
        student_id?: string | null;
        sent_at?: string | null;
    }[];
}

export type AnnouncementPriority = 'normal' | 'high' | 'urgent';
export type AnnouncementCategory = 'general' | 'exam' | 'holiday' | 'fees' | 'meeting' | 'event' | 'homework';
export type AnnouncementAudience = 'all' | 'parents' | 'students' | 'teachers';
export type AnnouncementScope = 'whole_academy' | 'specific_classes' | 'specific_sections' | 'specific_users';
export type AnnouncementStatus = 'draft' | 'published' | 'scheduled';

export interface AnnouncementAttachment {
    id?: string;
    name: string;
    size: number;
    type?: string;
    url?: string;
}

export interface AnnouncementInput {
    id?: string;
    title: string;
    message: string;
    priority: AnnouncementPriority;
    category: AnnouncementCategory;
    audience: AnnouncementAudience[];
    target_scope: AnnouncementScope;
    target_classes: string[];
    target_sections: string[];
    target_users: string[];
    send_push: boolean;
    send_sms: boolean;
    send_email: boolean;
    pin: boolean;
    scheduled_at?: string | null;
    expires_at?: string | null;
    attachments: AnnouncementAttachment[];
    status: AnnouncementStatus;
}

export interface Announcement extends AnnouncementInput {
    id: string;
    academy_id: string;
    target_role?: 'teacher' | 'parent' | 'student' | 'all' | null;
    created_by?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    published_at?: string | null;
    author_name?: string | null;
    author_role?: string | null;
    estimated_recipients?: number;
    primary_target_label?: string | null;
}
