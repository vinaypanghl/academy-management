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
    is_active: boolean;
    created_at?: string;
}
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
