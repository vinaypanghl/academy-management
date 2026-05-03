import React from 'react';
import { IonContent, IonIcon, IonPage, IonSpinner } from '@ionic/react';
import { calendarClear, documentText, people, warning } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import AppFooter from '../../components/layout/AppFooter';
import AppHeader from '../../components/layout/AppHeader';
import UserAvatar from '../../components/ui/UserAvatar';
import { useFetchParentDashboardQuery, useFetchTeacherDashboardQuery } from '../../redux/api/api';
import { useAppSelector } from '../../redux/hooks';
import './LearningListPage.scss';

interface LearningListPageProps {
    kind: 'students' | 'homework' | 'schedule';
}

const titles = {
    students: 'Students',
    homework: 'Homework',
    schedule: 'Schedule',
};

const LearningListPage: React.FC<LearningListPageProps> = ({ kind }) => {
    const history = useHistory();
    const role = useAppSelector((state) => state.auth.role);
    const parentQuery = useFetchParentDashboardQuery(undefined, { skip: role !== 'parent' });
    const teacherQuery = useFetchTeacherDashboardQuery(undefined, { skip: role !== 'teacher' });
    const isParent = role === 'parent';
    const isFetching = isParent ? parentQuery.isFetching : teacherQuery.isFetching;
    const isError = isParent ? parentQuery.isError : teacherQuery.isError;
    const parentData = parentQuery.data;
    const teacherData = teacherQuery.data;

    const renderStudents = () => {
        if (isParent) {
            return (parentData?.children || []).map((child) => (
                <article key={child.id} className="learning-list__row" onClick={() => history.push(`/student-detail/${child.id}`)}>
                    <UserAvatar name={child.display_name} src={child.profile_picture_url} />
                    <div>
                        <strong>{child.display_name}</strong>
                        <span>Class {child.class_name}{child.class_section ? ` ${child.class_section}` : ''} · {child.attendance_status || 'pending'}</span>
                    </div>
                </article>
            ));
        }

        return (teacherData?.classes || []).map((classItem) => (
            <article key={classItem.id} className="learning-list__row">
                <span className="learning-list__icon"><IonIcon icon={people} aria-hidden="true" /></span>
                <div>
                    <strong>Class {classItem.class_name}{classItem.section ? ` ${classItem.section}` : ''}</strong>
                    <span>{classItem.student_count} students · Attendance {classItem.attendance_status}</span>
                </div>
            </article>
        ));
    };

    const assignments = isParent ? parentData?.assignments || [] : teacherData?.assignments || [];
    const meetings = isParent ? parentData?.meetings || [] : teacherData?.meetings || [];

    return (
        <IonPage className="am-page learning-list-page">
            <AppHeader title={titles[kind]} showBack backHref={isParent ? '/parent-dashboard' : '/teacher-dashboard'} />
            <IonContent className="am-content" fullscreen>
                <main className="learning-list__scroll">
                    {isFetching && (
                        <div className="learning-list__state">
                            <IonSpinner name="crescent" />
                            <span>Loading {titles[kind].toLowerCase()}...</span>
                        </div>
                    )}

                    {isError && (
                        <div className="learning-list__state">
                            <IonIcon icon={warning} aria-hidden="true" />
                            <span>Unable to load {titles[kind].toLowerCase()}.</span>
                        </div>
                    )}

                    {!isFetching && !isError && kind === 'students' && (
                        <section className="learning-list__stack">
                            {renderStudents()}
                        </section>
                    )}

                    {!isFetching && !isError && kind === 'homework' && (
                        <section className="learning-list__stack">
                            {assignments.length ? assignments.map((assignment) => (
                                <article key={assignment.id} className="learning-list__row">
                                    <span className="learning-list__icon"><IonIcon icon={documentText} aria-hidden="true" /></span>
                                    <div>
                                        <strong>{assignment.title}</strong>
                                        <span>{assignment.class_label || 'Class'} · Due {assignment.due_date || 'not set'} · {assignment.status || 'pending'}</span>
                                    </div>
                                </article>
                            )) : (
                                <div className="learning-list__empty">No homework right now.</div>
                            )}
                        </section>
                    )}

                    {!isFetching && !isError && kind === 'schedule' && (
                        <section className="learning-list__stack">
                            {meetings.length ? meetings.map((meeting) => (
                                <article key={meeting.id} className="learning-list__row">
                                    <span className="learning-list__icon"><IonIcon icon={calendarClear} aria-hidden="true" /></span>
                                    <div>
                                        <strong>{meeting.student_name || meeting.teacher_name || 'Meeting'}</strong>
                                        <span>{meeting.status} · {meeting.scheduled_time ? new Date(meeting.scheduled_time).toLocaleString('en-IN') : 'Time not set'}</span>
                                    </div>
                                </article>
                            )) : (
                                <div className="learning-list__empty">No scheduled meetings.</div>
                            )}
                        </section>
                    )}
                </main>
            </IonContent>
            <AppFooter />
        </IonPage>
    );
};

export default LearningListPage;
