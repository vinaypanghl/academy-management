import React from 'react';
import { IonContent, IonIcon, IonPage, IonSpinner } from '@ionic/react';
import {
    barChart,
    chatboxEllipses,
    checkmarkCircle,
    documentText,
    megaphone,
    people,
    school,
    time,
    warning,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import AppFooter from '../../../components/layout/AppFooter';
import AppHeader from '../../../components/layout/AppHeader';
import { useFetchTeacherDashboardQuery } from '../../../redux/api/api';
import { useAppSelector } from '../../../redux/hooks';
import './TeacherDashboard.scss';

const TeacherDashboard: React.FC = () => {
    const history = useHistory();
    const currentUser = useAppSelector((state) => state.auth.user);
    const { data, isFetching, isError } = useFetchTeacherDashboardQuery();
    const hasMultiRoleAccess = (currentUser?.roles?.length || 0) > 1;
    const teacherName = data?.teacher.display_name || 'Teacher';
    const nextClass = data?.classes.find((item) => item.attendance_status === 'pending') || data?.classes[0];
    const classTeacherLabel = nextClass
        ? `Class Teacher • Grade ${nextClass.class_name}${nextClass.section ? nextClass.section : ''}`
        : 'Class Teacher • Assign a class';
    const schedule = data?.schedule?.length
        ? data.schedule
        : [
            { id: 'maths', time: '08:00', subject: 'Maths', class_label: 'Grade 5A' },
            { id: 'science', time: '09:00', subject: 'Science', class_label: 'Grade 5A' },
            { id: 'english', time: '11:00', subject: 'English', class_label: 'Grade 6B' },
        ];
    const activity = data?.recent_activity?.length
        ? data.recent_activity
        : [
            'Aarav absent today',
            `${data?.metrics.homework_review ?? data?.metrics.assignments_due ?? 0} homework submissions pending review`,
            'New meeting request from Parent of Riya',
        ];

    const quickActions = [
        { label: 'Attendance', icon: checkmarkCircle, path: '/attendance' },
        { label: 'Homework', icon: documentText, path: '/teacher/homework/add' },
        { label: 'Enter Marks', icon: barChart, path: '/teacher/marks' },
        { label: 'Feedback', icon: chatboxEllipses, path: '/teacher/feedback' },
        { label: 'Announce', icon: megaphone, path: '/announcements' },
        { label: 'Students', icon: people, path: '/teacher/students' },
    ];

    return (
        <IonPage className="am-page teacher-home-page">
            <AppHeader title="Teacher Home" />
            <IonContent className="am-content" fullscreen>
                <main className="teacher-home__scroll">
                    <section className="teacher-home__hero" aria-label="Teacher role summary">
                        <span className="teacher-home__watermark">EduCore</span>
                        <p>Good Morning, {teacherName}</p>
                        <div>
                            <span>Role: Teacher</span>
                            {hasMultiRoleAccess && <button type="button">Switch Role</button>}
                        </div>
                        <strong>{classTeacherLabel}</strong>
                    </section>

                    {isFetching && (
                        <div className="teacher-home__state">
                            <IonSpinner name="crescent" />
                            <span>Loading dashboard...</span>
                        </div>
                    )}

                    {isError && (
                        <div className="teacher-home__state">
                            <IonIcon icon={warning} aria-hidden="true" />
                            <span>Unable to load dashboard.</span>
                        </div>
                    )}

                    {!isFetching && !isError && (
                        <>
                            <section className="teacher-home__metrics" aria-label="Teacher summary">
                                <article>
                                    <span>Total Students</span>
                                    <strong>{data?.metrics.total_students ?? nextClass?.student_count ?? 38}</strong>
                                </article>
                                <article className="is-warning">
                                    <span>Attendance Pending</span>
                                    <strong>{data?.metrics.attendance_pending ?? 0}</strong>
                                </article>
                                <article className="is-info">
                                    <span>HW Review</span>
                                    <strong>{data?.metrics.homework_review ?? data?.metrics.assignments_due ?? 0}</strong>
                                </article>
                            </section>

                            <section className="teacher-home__section">
                                <h2>Quick Actions</h2>
                                <div className="teacher-home__actions">
                                    {quickActions.map((action) => (
                                        <button key={action.label} type="button" onClick={() => history.push(action.path)}>
                                            <span><IonIcon icon={action.icon} aria-hidden="true" /></span>
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section className="teacher-home__section">
                                <h2>Today’s Schedule</h2>
                                <div className="teacher-home__schedule">
                                    {schedule.map((item) => (
                                        <button key={item.id} type="button" onClick={() => history.push('/teacher/schedule')}>
                                            <span>{item.time}</span>
                                            <strong>{item.subject}</strong>
                                            <em>{item.class_label}</em>
                                            <IonIcon icon={time} aria-hidden="true" />
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section className="teacher-home__section">
                                <h2>Recent Activity</h2>
                                <div className="teacher-home__activity">
                                    {activity.map((item) => (
                                        <article key={item}>
                                            <IonIcon icon={school} aria-hidden="true" />
                                            <span>{item}</span>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        </>
                    )}
                </main>
            </IonContent>
            <AppFooter />
        </IonPage>
    );
};

export default TeacherDashboard;
