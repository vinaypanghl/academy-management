import React, { useMemo, useState } from 'react';
import { IonContent, IonIcon, IonPage, IonSpinner } from '@ionic/react';
import {
    barChart,
    calendarClear,
    chatboxEllipses,
    documentText,
    megaphone,
    people,
    school,
    warning,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import AppFooter from '../../../components/layout/AppFooter';
import AppHeader from '../../../components/layout/AppHeader';
import UserAvatar from '../../../components/ui/UserAvatar';
import { useFetchParentDashboardQuery } from '../../../redux/api/api';
import { useAppSelector } from '../../../redux/hooks';
import './ParentDashboard.scss';

const ParentDashboard: React.FC = () => {
    const history = useHistory();
    const currentUser = useAppSelector((state) => state.auth.user);
    const { data, isFetching, isError } = useFetchParentDashboardQuery();
    const hasMultiRoleAccess = (currentUser?.roles?.length || 0) > 1;
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
    const children = data?.children || [];
    const selectedChild = useMemo(
        () => children.find((child) => child.id === selectedChildId) || children[0],
        [children, selectedChildId],
    );
    const firstAssignment = data?.assignments.find((assignment) => assignment.status !== 'submitted') || data?.assignments[0];
    const latestUpdates = [
        firstAssignment ? `${firstAssignment.title} due ${firstAssignment.due_date || 'soon'}` : 'No homework pending today',
        ...(data?.notifications || []).slice(0, 2).map((item) => item.message),
        data?.announcements[0]?.title ? `New school announcement: ${data.announcements[0].title}` : 'School updates will appear here',
    ].slice(0, 3);
    const upcoming = data?.upcoming?.length
        ? data.upcoming
        : [
            data?.meetings[0]?.scheduled_time ? `PTM on ${new Date(data.meetings[0].scheduled_time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}` : 'PTM on 22 Apr',
            'Science Quiz on 25 Apr',
        ];

    return (
        <IonPage className="am-page parent-home-page">
            <AppHeader title="Parent Home" />
            <IonContent className="am-content" fullscreen>
                <main className="parent-home__scroll">
                    <section className="parent-home__hero" aria-label="Parent role summary">
                        <span className="parent-home__watermark">EduCore</span>
                        <p>Hello, {data?.parent.display_name || 'Parent'}</p>
                        <div>
                            <span>Role: Parent</span>
                            {hasMultiRoleAccess && <button type="button">Switch Role</button>}
                        </div>
                    </section>

                    {isFetching && (
                        <div className="parent-home__state">
                            <IonSpinner name="crescent" />
                            <span>Loading dashboard...</span>
                        </div>
                    )}

                    {isError && (
                        <div className="parent-home__state">
                            <IonIcon icon={warning} aria-hidden="true" />
                            <span>Unable to load dashboard.</span>
                        </div>
                    )}

                    {!isFetching && !isError && (
                        <>
                            <section className="parent-home__section parent-home__section--tight">
                                <h2>Child Switcher</h2>
                                <div className="parent-home__switch-row">
                                    <button type="button" className="is-active">
                                        {selectedChild?.display_name || 'No child linked'}
                                    </button>
                                    {children.length > 1 && <span>+{children.length - 1} More Child</span>}
                                </div>
                                {children.length > 1 && (
                                    <div className="parent-home__child-switcher">
                                        {children.map((child) => (
                                            <button
                                                key={child.id}
                                                type="button"
                                                className={selectedChild?.id === child.id ? 'is-active' : ''}
                                                onClick={() => setSelectedChildId(child.id)}
                                            >
                                                {child.first_name || child.display_name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section className="parent-home__child-card">
                                <div>
                                    <UserAvatar
                                        size="lg"
                                        name={selectedChild?.display_name}
                                        src={selectedChild?.profile_picture_url}
                                    />
                                    <div>
                                        <strong>{selectedChild?.display_name || 'No child linked'}</strong>
                                        <span>
                                            {selectedChild
                                                ? `Class ${selectedChild.class_name}${selectedChild.class_section ? ` ${selectedChild.class_section}` : ''}`
                                                : 'Student details will appear here'}
                                        </span>
                                        <small>Today: {selectedChild?.attendance_status || 'Pending'}</small>
                                    </div>
                                </div>
                            </section>

                            <section className="parent-home__insight">
                                <strong>{data?.insights?.title || `${selectedChild?.first_name || 'Your child'} is doing well this week`}</strong>
                                <span>{data?.insights?.detail || 'Needs a little more focus in Mathematics'}</span>
                            </section>

                            <section className="parent-home__metrics" aria-label="Child insight cards">
                                <button type="button" onClick={() => history.push('/parent/attendance')}>
                                    <IonIcon icon={people} aria-hidden="true" />
                                    <strong>{selectedChild?.attendance_percentage ?? data?.metrics.attendance_percentage ?? 91}%</strong>
                                    <span>Attendance</span>
                                </button>
                                <button type="button" onClick={() => history.push('/parent/progress')}>
                                    <IonIcon icon={barChart} aria-hidden="true" />
                                    <strong>{selectedChild?.avg_marks ?? data?.metrics.average_marks ?? 78}%</strong>
                                    <span>Avg Marks</span>
                                </button>
                                <button type="button" className="is-warning" onClick={() => history.push('/parent/homework')}>
                                    <IonIcon icon={documentText} aria-hidden="true" />
                                    <strong>{data?.metrics.homework_pending ?? data?.metrics.assignments_due ?? 0}</strong>
                                    <span>Homework Pending</span>
                                </button>
                                <button type="button" onClick={() => history.push('/parent/feedback')}>
                                    <IonIcon icon={chatboxEllipses} aria-hidden="true" />
                                    <strong>{data?.feedback?.length ?? 0}</strong>
                                    <span>Teacher Feedback</span>
                                </button>
                            </section>

                            <section className="parent-home__section">
                                <h2>Latest Updates</h2>
                                <div className="parent-home__updates">
                                    {latestUpdates.map((update) => (
                                        <button key={update} type="button" onClick={() => history.push('/announcements')}>
                                            <IonIcon icon={megaphone} aria-hidden="true" />
                                            <span>{update}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section className="parent-home__section">
                                <h2>Upcoming</h2>
                                <div className="parent-home__upcoming">
                                    {upcoming.map((item) => (
                                        <button key={item} type="button" onClick={() => history.push('/parent/meeting-request')}>
                                            <IonIcon icon={calendarClear} aria-hidden="true" />
                                            <span>{item}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section className="parent-home__section">
                                <h2>Quick Actions</h2>
                                <div className="parent-home__actions">
                                    <button type="button" onClick={() => history.push('/parent/progress')}>
                                        <IonIcon icon={school} aria-hidden="true" />
                                        Progress
                                    </button>
                                    <button type="button" onClick={() => history.push('/parent/homework')}>
                                        <IonIcon icon={documentText} aria-hidden="true" />
                                        Homework
                                    </button>
                                    <button type="button" onClick={() => history.push('/parent/meeting-request')}>
                                        <IonIcon icon={calendarClear} aria-hidden="true" />
                                        Meetings
                                    </button>
                                    <button type="button" onClick={() => history.push('/parent/documents')}>
                                        <IonIcon icon={documentText} aria-hidden="true" />
                                        Documents
                                    </button>
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

export default ParentDashboard;
