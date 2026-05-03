const API_BASE_URL = import.meta.env.VITE_FUNCTION_URL;
const AUTH_TOKEN = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/login`,
    REGISTER_ACADEMY: `${API_BASE_URL}/registerAcademy`,
    CREATE_USER: `${API_BASE_URL}/createUser`,
    CREATE_CLASSES: `${API_BASE_URL}/createClass`,
    FETCH_CLASSES: `${API_BASE_URL}/fetchClasses`,
    FETCH_ACADEMY_OVERVIEW: `${API_BASE_URL}/fetchAcademyOverview`,
    FETCH_ACADEMY_USERS: `${API_BASE_URL}/fetchAcademyUsers`,
    UPDATE_ACADEMY_USER: `${API_BASE_URL}/updateAcademyUser`,
    FETCH_TEACHER_DASHBOARD: `${API_BASE_URL}/fetchTeacherDashboard`,
    FETCH_PARENT_DASHBOARD: `${API_BASE_URL}/fetchParentDashboard`,
    FETCH_ANNOUNCEMENTS: `${API_BASE_URL}/fetchAnnouncements`,
    CREATE_ANNOUNCEMENT: `${API_BASE_URL}/createAnnouncement`,
    ASSIGN_HOMEWORK: `${API_BASE_URL}/assignHomework`,
    CREATE_STUDENTS: `${API_BASE_URL}/createStudent`,
    SEARCH_PARENTS: `${API_BASE_URL}/search-parents`,
    FETCH_PARENTS: `${API_BASE_URL}/fetchParents`,
    TEACHER_STUDENTS: `${API_BASE_URL}/fetchTeacherStudents`,
    MARK_ATTENDANCE: `${API_BASE_URL}/markAttendance`,
    ATTENDANCE_HISTORY: `${API_BASE_URL}/attandanceHistory`,
    NOTIFICATIONS: `${API_BASE_URL}/sendAttendanceNotifications`,
};

export { AUTH_TOKEN, API_BASE_URL, API_ENDPOINTS, SUPABASE_ANON_KEY, SUPABASE_URL };
