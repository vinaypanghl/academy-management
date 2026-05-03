export interface ClassSection {
    id: string;
    academy_id: string;
    class_name: string;
    section?: string | null;
    academic_year: string;
    teacher_name?: string | null;
    student_count?: number;
}
