// redux/api/api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, API_ENDPOINTS, SUPABASE_ANON_KEY } from '../../config';
import type { RootState } from '../store';
import { ClassSection, ParentInput, Student } from '../../types';
import { supabase } from '../../services/apiClient';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        prepareHeaders: async (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            } else {
                headers.set('authorization', `Bearer ${SUPABASE_ANON_KEY}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials: { credential: string; password: string }) => ({
                url: API_ENDPOINTS.LOGIN,
                method: 'POST',
                body: credentials,
            }),
        }),
        registerAcademy: builder.mutation({
            query: (data) => ({
                url: API_ENDPOINTS.REGISTER_ACADEMY,
                method: 'POST',
                body: data,
            }),
        }),
        createUser: builder.mutation({
            query: (data) => ({
                url: API_ENDPOINTS.CREATE_USER,
                method: 'POST',
                body: data,
            }),
        }),
        createClasses: builder.mutation({
            query: (data) => ({
                url: API_ENDPOINTS.CREATE_CLASSES,
                method: 'POST',
                body: data,
            }),
        }),
        fetchClasses: builder.query<ClassSection[], void>({
            query: () => ({
                url: API_ENDPOINTS.FETCH_CLASSES,
                method: 'GET',
            }),
            transformResponse: (response: { classes: ClassSection[] }) => response.classes,
        }),
        createStudents: builder.mutation({
            query: (data) => ({
                url: API_ENDPOINTS.CREATE_STUDENTS,
                method: 'POST',
                body: data,
            }),
        }),
        fetchTeacherStudents: builder.query<Student[],{ class_name?: string; class_section?: string; academic_year?: string } | undefined>({
            query: (params) => ({
                url: API_ENDPOINTS.TEACHER_STUDENTS,
                method: 'GET',
                ...(params ? { params } : {}),
            }),
            transformResponse: (res: { students: Student[] }) => res.students,
        }),
        markAttendance: builder.mutation<
            { success: boolean; message: string },
            {
                class_name: string
                class_section?: string
                attendance_type: 'ARRIVAL' | 'DEPARTURE'
                students: { student_id: string; status: 'PRESENT' | 'ABSENT' }[]
            }
        >({
            query: (body) => ({
                url: API_ENDPOINTS.MARK_ATTENDANCE,
                method: 'POST',
                body,
            }),
        }),
        fetchAttendanceHistory: builder.query<
            any[],
            { class_name: string; class_section?: string; date?: string }
        >({
            query: (params) => ({
                url: API_ENDPOINTS.ATTENDANCE_HISTORY,
                method: 'GET',
                params,
            }),
        }),
        fetchNotifications: builder.query<any[], void>({
            query: () => ({
                url: API_ENDPOINTS.NOTIFICATIONS,
                method: 'GET',
            }),
        }),
          
        searchParents: builder.query<ParentInput[], string>({
            query: (phone: string) => ({
                url: `${API_ENDPOINTS.SEARCH_PARENTS}?phone=${encodeURIComponent(phone)}`,
                method: 'GET',
            }),
        }),
        fetchParents: builder.query<ParentInput[], void>({
            query: () => ({
              url: `${API_ENDPOINTS.FETCH_PARENTS}`,
              method: 'GET',
            }),
            transformResponse: (response: { success: boolean; parents: ParentInput[] }) => response.parents,
        }),
    }),
});

export const { 
    useLoginMutation, 
    useRegisterAcademyMutation, 
    useCreateUserMutation, 
    useCreateClassesMutation, 
    useFetchClassesQuery, 
    useCreateStudentsMutation, 
    useFetchTeacherStudentsQuery,
    useMarkAttendanceMutation,
    useFetchAttendanceHistoryQuery,
    useFetchNotificationsQuery,
    useSearchParentsQuery, 
    useFetchParentsQuery 
} = authApi;
