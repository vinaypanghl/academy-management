// redux/api/api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, API_ENDPOINTS, SUPABASE_ANON_KEY } from '../../config';
import type { RootState } from '../store';
import {
    AcademyOverview,
    AcademyUserProfile,
    Announcement,
    AnnouncementInput,
    ClassSection,
    DashboardAssignment,
    ParentDashboardData,
    ParentInput,
    Student,
    TeacherDashboardData,
} from '../../types';

export const authApi = createApi({
    reducerPath: 'authApi',
    tagTypes: ['AcademyOverview', 'AcademyUsers', 'Announcements', 'Classes', 'Parents', 'ParentDashboard', 'TeacherDashboard'],
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
            invalidatesTags: ['AcademyOverview', 'TeacherDashboard', 'ParentDashboard'],
        }),
        fetchAcademyUsers: builder.query<AcademyUserProfile[], void>({
            query: () => ({
                url: API_ENDPOINTS.FETCH_ACADEMY_USERS,
                method: 'GET',
            }),
            transformResponse: (response: { users: AcademyUserProfile[] }) => response.users,
            providesTags: ['AcademyUsers'],
        }),
        updateAcademyUser: builder.mutation<
            { success: boolean; message?: string; user?: AcademyUserProfile },
            Partial<AcademyUserProfile> & { id: string; type: AcademyUserProfile['type'] }
        >({
            query: (data) => ({
                url: API_ENDPOINTS.UPDATE_ACADEMY_USER,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['AcademyUsers', 'AcademyOverview', 'ParentDashboard', 'TeacherDashboard'],
        }),
        fetchTeacherDashboard: builder.query<TeacherDashboardData, void>({
            query: () => ({
                url: API_ENDPOINTS.FETCH_TEACHER_DASHBOARD,
                method: 'GET',
            }),
            providesTags: ['TeacherDashboard'],
        }),
        fetchParentDashboard: builder.query<ParentDashboardData, void>({
            query: () => ({
                url: API_ENDPOINTS.FETCH_PARENT_DASHBOARD,
                method: 'GET',
            }),
            providesTags: ['ParentDashboard'],
        }),
        fetchAnnouncements: builder.query<Announcement[], void>({
            query: () => ({
                url: API_ENDPOINTS.FETCH_ANNOUNCEMENTS,
                method: 'GET',
            }),
            transformResponse: (response: { announcements: Announcement[] }) => response.announcements,
            providesTags: ['Announcements'],
        }),
        createAnnouncement: builder.mutation<
            { success: boolean; message?: string; announcement?: Announcement },
            AnnouncementInput
        >({
            query: (data) => ({
                url: API_ENDPOINTS.CREATE_ANNOUNCEMENT,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Announcements'],
        }),
        assignHomework: builder.mutation<
            { success: boolean; message?: string; assignment?: DashboardAssignment },
            {
                class_section_id: string;
                subject?: string;
                title: string;
                description?: string;
                due_date?: string;
                attachment_url?: string;
                assign_to?: 'all' | 'selected';
                target_students?: string[];
            }
        >({
            query: (data) => ({
                url: API_ENDPOINTS.ASSIGN_HOMEWORK,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['TeacherDashboard', 'ParentDashboard'],
        }),
        createClasses: builder.mutation({
            query: (data) => ({
                url: API_ENDPOINTS.CREATE_CLASSES,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['AcademyOverview', 'Classes'],
        }),
        fetchClasses: builder.query<ClassSection[], void>({
            query: () => ({
                url: API_ENDPOINTS.FETCH_CLASSES,
                method: 'GET',
            }),
            transformResponse: (response: { classes: ClassSection[] }) => response.classes,
            providesTags: ['Classes'],
        }),
        fetchAcademyOverview: builder.query<AcademyOverview, void>({
            query: () => ({
                url: API_ENDPOINTS.FETCH_ACADEMY_OVERVIEW,
                method: 'GET',
            }),
            providesTags: ['AcademyOverview'],
        }),
        createStudents: builder.mutation({
            query: (data) => ({
                url: API_ENDPOINTS.CREATE_STUDENTS,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['AcademyOverview', 'Parents'],
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
                students: {
                    student_id: string;
                    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';
                    remark?: string;
                }[]
            }
        >({
            query: (body) => ({
                url: API_ENDPOINTS.MARK_ATTENDANCE,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['AcademyOverview'],
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
            providesTags: ['Parents'],
        }),
    }),
});

export const { 
    useLoginMutation, 
    useRegisterAcademyMutation, 
    useCreateUserMutation, 
    useFetchAcademyUsersQuery,
    useUpdateAcademyUserMutation,
    useFetchTeacherDashboardQuery,
    useFetchParentDashboardQuery,
    useFetchAnnouncementsQuery,
    useCreateAnnouncementMutation,
    useAssignHomeworkMutation,
    useCreateClassesMutation, 
    useFetchClassesQuery, 
    useFetchAcademyOverviewQuery,
    useCreateStudentsMutation, 
    useFetchTeacherStudentsQuery,
    useMarkAttendanceMutation,
    useFetchAttendanceHistoryQuery,
    useFetchNotificationsQuery,
    useSearchParentsQuery, 
    useFetchParentsQuery 
} = authApi;
