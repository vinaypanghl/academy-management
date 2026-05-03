import React, { useEffect } from 'react';
import { IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { Switch, Route, Redirect } from 'react-router-dom';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import './theme/app.scss';
import { useTypedDispatch } from './redux/store';

import WelcomePage from './pages/Welcome/WelcomePage';
import RegisterPage from './pages/Register/RegisterPage';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/Login/LoginPage';
import AcademyDashboard from './pages/Dashboard/Academy/AcademyDashboard';
import Sidebar from './components/Sidebar';
import { supabase } from './services/apiClient';
import { clearCredentials, rehydrateUser } from './redux/slices/authSlice';
import TeacherDashboard from './pages/Dashboard/Teacher/TeacherDashboard';
import MarkAttendance from './pages/Dashboard/Teacher/Attendance/MarkAttendance';
import ParentDashboard from './pages/Dashboard/Parent/ParentDashboard';
import CreateStaffPage from './pages/CreateStaff/CreateStaffPage';
import CreateStudentPage from './pages/CreateStudent/CreateStudentPage';
import CreateClassPage from './pages/CreateClass/CreateClassPage';
import FeaturePage from './pages/Feature/FeaturePage';
import ManageUsersPage from './pages/ManageUsers/ManageUsersPage';
import UserProfilePage from './pages/UserProfile/UserProfilePage';
import EditUserProfilePage from './pages/UserProfile/EditUserProfilePage';
import AnnouncementsFeedPage from './pages/Announcements/AnnouncementsFeedPage';
import CreateAnnouncementPage from './pages/Announcements/CreateAnnouncementPage';
import LearningListPage from './pages/Learning/LearningListPage';
import SchoolFlowPage from './pages/SchoolFlows/SchoolFlowPage';


setupIonicReact();

const featureRoutes = [
    { path: '/fees', title: 'Fees' },
    { path: '/meetings', title: 'Meetings' },
    { path: '/manage/users/parents', title: 'Parents' },
    { path: '/student-performance', title: 'Student Performance' },
    { path: '/homework-assignments', title: 'Homework / Assignments' },
    { path: '/push-announcements', title: 'Push Announcements' },
    { path: '/class-timetable', title: 'Class Timetable' },
    { path: '/schedule-meetings', title: 'Schedule Meetings' },
    { path: '/settings', title: 'Settings' },
];

const App = () => {
    const dispatch = useTypedDispatch();

    useEffect(() => {
        dispatch(rehydrateUser());

        const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                dispatch(clearCredentials());
            } else if (session?.user) {
                dispatch(rehydrateUser());
            }
        });

        return () => {
            subscription.subscription.unsubscribe();
        };
    }, [dispatch]);
    return (
        <>
            <Sidebar />
            <IonRouterOutlet id='main-content'>
                <Switch>
                    <Route exact path="/" component={WelcomePage} />
                    <Route exact path="/register" component={RegisterPage} />
                    <Route exact path="/login" component={LoginPage} />

                    <PrivateRoute
                        exact
                        path="/academy-dashboard"
                        component={AcademyDashboard}
                        allowedRoles={['academy', 'admin']}
                    />
                    <PrivateRoute
                        exact
                        path="/teacher-dashboard"
                        component={TeacherDashboard}
                        allowedRoles={['teacher']}
                    />
                    <PrivateRoute
                        exact
                        path="/attendance"
                        component={MarkAttendance}
                        allowedRoles={['teacher']}
                    />
                    <PrivateRoute
                        exact
                        path="/parent-dashboard"
                        component={ParentDashboard}
                        allowedRoles={['parent']}
                    />
                    <PrivateRoute
                        exact
                        path="/parent/students"
                        component={() => <LearningListPage kind="students" />}
                        allowedRoles={['parent']}
                    />
                    <PrivateRoute
                        exact
                        path="/parent/homework"
                        component={() => <SchoolFlowPage variant="parentHomework" />}
                        allowedRoles={['parent']}
                    />
                    <PrivateRoute
                        exact
                        path="/parent/schedule"
                        component={() => <LearningListPage kind="schedule" />}
                        allowedRoles={['parent']}
                    />
                    <PrivateRoute
                        exact
                        path="/parent/progress"
                        component={() => <SchoolFlowPage variant="parentProgress" />}
                        allowedRoles={['parent']}
                    />
                    <PrivateRoute
                        exact
                        path="/parent/attendance"
                        component={() => <SchoolFlowPage variant="parentAttendance" />}
                        allowedRoles={['parent']}
                    />
                    <PrivateRoute
                        exact
                        path="/parent/feedback"
                        component={() => <SchoolFlowPage variant="parentFeedback" />}
                        allowedRoles={['parent']}
                    />
                    <PrivateRoute
                        exact
                        path="/parent/documents"
                        component={() => <SchoolFlowPage variant="documents" />}
                        allowedRoles={['parent']}
                    />
                    <PrivateRoute
                        exact
                        path="/parent/meeting-request"
                        component={() => <SchoolFlowPage variant="meetingRequest" />}
                        allowedRoles={['parent']}
                    />
                    <PrivateRoute
                        exact
                        path="/teacher/students"
                        component={() => <LearningListPage kind="students" />}
                        allowedRoles={['teacher']}
                    />
                    <PrivateRoute
                        exact
                        path="/teacher/homework"
                        component={() => <LearningListPage kind="homework" />}
                        allowedRoles={['teacher']}
                    />
                    <PrivateRoute
                        exact
                        path="/teacher/homework/add"
                        component={() => <SchoolFlowPage variant="addHomework" />}
                        allowedRoles={['teacher']}
                    />
                    <PrivateRoute
                        exact
                        path="/teacher/marks"
                        component={() => <SchoolFlowPage variant="enterMarks" />}
                        allowedRoles={['teacher']}
                    />
                    <PrivateRoute
                        exact
                        path="/teacher/feedback"
                        component={() => <SchoolFlowPage variant="studentFeedback" />}
                        allowedRoles={['teacher']}
                    />
                    <PrivateRoute
                        exact
                        path="/teacher/schedule"
                        component={() => <LearningListPage kind="schedule" />}
                        allowedRoles={['teacher']}
                    />
                    <PrivateRoute
                        exact
                        path="/student-detail/:studentId?"
                        component={() => <SchoolFlowPage variant="studentDetail" />}
                        allowedRoles={['teacher', 'parent', 'academy', 'admin']}
                    />
                    <PrivateRoute
                        exact
                        path="/create-class"
                        component={CreateClassPage}
                        allowedRoles={['academy', 'admin']}
                    />
                    <PrivateRoute
                        exact
                        path="/create-student"
                        component={CreateStudentPage}
                        allowedRoles={['academy', 'admin']}
                    />
                    <PrivateRoute
                        exact
                        path="/create-admin"
                        component={() => <CreateStaffPage role="admin" />}
                        allowedRoles={['academy']}
                    />
                    <PrivateRoute
                        exact
                        path="/create-teacher"
                        component={() => <CreateStaffPage role="teacher" />}
                        allowedRoles={['academy', 'admin']}
                    />
                    <PrivateRoute
                        exact
                        path="/manage/users"
                        component={ManageUsersPage}
                        allowedRoles={['academy', 'admin']}
                    />
                    <PrivateRoute
                        exact
                        path="/classes"
                        component={() => <SchoolFlowPage variant="adminClasses" />}
                        allowedRoles={['academy', 'admin']}
                    />
                    <PrivateRoute
                        exact
                        path="/reports"
                        component={() => <SchoolFlowPage variant="reports" />}
                        allowedRoles={['academy', 'admin']}
                    />
                    <PrivateRoute
                        exact
                        path="/announcements/create/:announcementId?"
                        component={CreateAnnouncementPage}
                        allowedRoles={['academy', 'admin']}
                    />
                    <PrivateRoute
                        exact
                        path="/announcements"
                        component={AnnouncementsFeedPage}
                        allowedRoles={['academy', 'admin', 'teacher', 'parent']}
                    />
                    <PrivateRoute
                        exact
                        path="/manage/users/:userId/edit"
                        component={EditUserProfilePage}
                        allowedRoles={['academy', 'admin']}
                    />
                    <PrivateRoute
                        exact
                        path="/manage/users/:userId"
                        component={UserProfilePage}
                        allowedRoles={['academy', 'admin']}
                    />
                    <PrivateRoute
                        exact
                        path="/profile/edit"
                        component={EditUserProfilePage}
                        allowedRoles={['academy', 'admin', 'teacher', 'parent']}
                    />
                    <PrivateRoute
                        exact
                        path="/profile"
                        component={UserProfilePage}
                        allowedRoles={['academy', 'admin', 'teacher', 'parent']}
                    />
                    {featureRoutes.map((route) => (
                        <PrivateRoute
                            key={route.path}
                            exact
                            path={route.path}
                            component={() => <FeaturePage title={route.title} />}
                            allowedRoles={['academy', 'admin', 'teacher', 'parent']}
                        />
                    ))}
                    <Route render={() => <Redirect to="/" />} />
                </Switch>
            </IonRouterOutlet>
        </>
    );
};

export default App;
