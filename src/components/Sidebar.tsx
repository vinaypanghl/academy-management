import React from 'react';
import { IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonListHeader, IonPage, IonButtons, IonMenuButton } from '@ionic/react';
import { useSelector } from 'react-redux';
import { RootState, useTypedDispatch } from '../redux/store';
import { useHistory } from 'react-router-dom';
import { logoutUser } from '../redux/slices/authSlice';

const Sidebar: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const history = useHistory();
    const dispatch = useTypedDispatch();

    if (!user) return null;

    const navigate = (path: string) => {
        history.push(path);
    };

    const handleLogout = async () => {
        try {
          dispatch(logoutUser());
          history.replace('/login');
        } catch (err) {
          console.error("Logout failed", err);
        }
    };

    return (
        <IonMenu side="start" contentId="main-content">
            <IonHeader>
                <IonToolbar color="tertiary">
                    <IonTitle>Menu</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonList>
                    {user.role === 'academy' && (
                        <>
                            <IonItem button onClick={() => navigate('/academy-dashboard')}>
                                <IonLabel>Admin Dashboard</IonLabel>
                            </IonItem>
                            <IonItem button onClick={() => navigate('/manage/schools')}>
                                <IonLabel>Manage Schools</IonLabel>
                            </IonItem>
                            <IonItem button onClick={() => navigate('/manage/users')}>
                                <IonLabel>Manage Users</IonLabel>
                            </IonItem>
                        </>
                    )}
                    {user.role === 'admin' && (
                        <>
                            <IonItem button onClick={() => navigate('/academy-dashboard')}>
                                <IonLabel>Admin Dashboard</IonLabel>
                            </IonItem>
                            <IonItem button onClick={() => navigate('/manage/schools')}>
                                <IonLabel>Manage Schools</IonLabel>
                            </IonItem>
                            <IonItem button onClick={() => navigate('/manage/users')}>
                                <IonLabel>Manage Users</IonLabel>
                            </IonItem>
                        </>
                    )}
                    {user.role === 'teacher' && (
                        <>
                            <IonItem button onClick={() => navigate('/teacher-dashboard')}>
                                <IonLabel>Teacher Dashboard</IonLabel>
                            </IonItem>
                            <IonItem button onClick={() => navigate('/attendance')}>
                                <IonLabel>Attendance</IonLabel>
                            </IonItem>
                            <IonItem button onClick={() => navigate('/student-performance')}>
                                <IonLabel>Student Performance</IonLabel>
                            </IonItem>
                            <IonItem button onClick={() => navigate('/homework-assignments')}>
                                <IonLabel>Homework / Assignments</IonLabel>
                            </IonItem>
                            <IonItem button onClick={() => navigate('/announcements')}>
                                <IonLabel>Push Announcements</IonLabel>
                            </IonItem>
                            <IonItem button onClick={() => navigate('/class-timetable')}>
                                <IonLabel>Class Timetable</IonLabel>
                            </IonItem>
                        </>
                    )}
                    {user.role === 'parent' && (
                        <>
                            <IonItem button onClick={() => navigate('/peacher-dashboard')}>
                                <IonLabel>Parent Dashboard</IonLabel>
                            </IonItem>
                            <IonListHeader>For Parents</IonListHeader>
                            <IonItem button onClick={() => navigate('/student-performance')}>
                                <IonLabel>Student Performance</IonLabel>
                            </IonItem>
                            <IonItem button onClick={() => navigate('/feedback-reviews')}>
                                <IonLabel>Feedback / Reviews</IonLabel>
                            </IonItem>
                            <IonItem button onClick={() => navigate('/announcements')}>
                                <IonLabel>Announcements</IonLabel>
                            </IonItem>
                            <IonItem button onClick={() => navigate('/homework')}>
                                <IonLabel>Homework</IonLabel>
                            </IonItem>
                            <IonItem button onClick={() => navigate('/schedule-meetings')}>
                                <IonLabel>Schedule Meetings</IonLabel>
                            </IonItem>
                        </>
                    )}
                    <IonItem button onClick={handleLogout}>
                        <IonLabel color="danger">Logout</IonLabel>
                    </IonItem>
                </IonList>
            </IonContent>
        </IonMenu>
    );
};

export default Sidebar;
