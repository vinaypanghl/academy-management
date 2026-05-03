import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import {
    ArrowDownCircle,
    ArrowRight,
    ArrowUpCircle,
    CalendarCheck,
    ChartColumn,
    CheckCircle,
    CreditCard,
    FileText,
    FolderPlus,
    Gift,
    Hourglass,
    Megaphone,
    PieChart,
    Rocket,
    ShieldCheck,
    TrendingUp,
    TriangleAlert,
    UserPlus,
    UserRoundCheck,
    Users,
    Zap,
} from 'lucide-react';
import { useHistory } from 'react-router-dom';
import AppFooter from '../../../components/layout/AppFooter';
import AppHeader from '../../../components/layout/AppHeader';
import { useFetchAcademyOverviewQuery } from '../../../redux/api/api';
import { useAppSelector } from '../../../redux/hooks';
import './AcademyDashboard.scss';

const AcademyDashboard: React.FC = () => {
    const history = useHistory();
    const currentUser = useAppSelector((state) => state.auth.user);
    const role = currentUser?.role;
    const { data: overview, isFetching } = useFetchAcademyOverviewQuery();

    const academyName = overview?.academy.academy_name || 'EduCore Academy';
    const classCount = overview?.metrics.classes || 0;
    const studentCount = overview?.metrics.students || 0;
    const teacherCount = overview?.metrics.teachers || 0;
    const averageAttendance = overview?.metrics.attendance_today || 84;
    const averageMarks = overview?.metrics.average_marks || 68;
    const seatsUsed = overview?.metrics.active_students || studentCount || 120;
    const seatsTotal = 500;
    const planUtilization = Math.min(Math.round((seatsUsed / seatsTotal) * 100), 100);

    const quickActions = [
        { label: 'Add Student', icon: UserPlus, path: '/create-student', visible: true, tone: 'blue' },
        { label: 'Add Teacher', icon: UserRoundCheck, path: '/create-teacher', visible: role === 'academy' || role === 'admin', tone: 'green' },
        { label: 'Create Class', icon: FolderPlus, path: '/create-class', visible: true, tone: 'amber' },
        { label: 'Announcements', icon: Megaphone, path: '/announcements', visible: true, tone: 'rose' },
        { label: 'Assign Roles', icon: ShieldCheck, path: '/manage/users', visible: true, tone: 'purple' },
        { label: 'Reports', icon: FileText, path: '/reports', visible: true, tone: 'cyan' },
    ];

    const attendanceBars = [58, 70, 50, 78, 64];

    return (
        <IonPage className="am-page academy-dashboard">
            <AppHeader
                title="Dashboard"
                heroTitle="Dashboard"
                heroSubtitle={academyName}
            />
            <IonContent className="am-content academy-dashboard__content" fullscreen>
                <main className="academy-dashboard__scroll">
                    <section className="academy-section academy-section--overview">
                        <h2>
                            <PieChart size={18} strokeWidth={2.3} />
                            <span>Overview</span>
                        </h2>
                        <div className="academy-dashboard__stats">
                            <article className="academy-metric-card">
                                <span className="academy-metric-card__icon is-blue"><Users size={18} strokeWidth={2.25} /></span>
                                <strong>{isFetching ? '--' : studentCount}</strong>
                                <small>Students</small>
                            </article>
                            <article className="academy-metric-card">
                                <span className="academy-metric-card__icon is-green"><UserRoundCheck size={18} strokeWidth={2.25} /></span>
                                <strong>{isFetching ? '--' : teacherCount}</strong>
                                <small>Teachers</small>
                            </article>
                            <article className="academy-metric-card">
                                <span className="academy-metric-card__icon is-amber"><CreditCard size={18} strokeWidth={2.25} /></span>
                                <strong>{isFetching ? '--' : classCount}</strong>
                                <small>Classes</small>
                            </article>
                            <article className="academy-metric-card academy-metric-card--wide">
                                <div>
                                    <small>Avg Attendance</small>
                                    <strong className="is-green">{averageAttendance}%</strong>
                                </div>
                                <span className="academy-metric-card__icon is-green-soft"><CalendarCheck size={22} strokeWidth={2.25} /></span>
                            </article>
                            <article className="academy-metric-card academy-metric-card--wide">
                                <div>
                                    <small>Avg Marks</small>
                                    <strong className="is-blue">{averageMarks}%</strong>
                                </div>
                                <span className="academy-metric-card__icon is-blue-soft"><ChartColumn size={22} strokeWidth={2.25} /></span>
                            </article>
                        </div>
                    </section>

                    <section className="academy-section academy-section--actions">
                        <h2>
                            <Zap size={18} strokeWidth={2.3} />
                            <span>Quick Actions</span>
                        </h2>
                        <div className="academy-dashboard__actions">
                            {quickActions.filter((action) => action.visible).map((action) => {
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={action.path}
                                        type="button"
                                        className={`academy-action-card academy-action-card--${action.tone}`}
                                        onClick={() => history.push(action.path)}
                                    >
                                        <span><Icon size={22} strokeWidth={2.2} /></span>
                                        <strong>{action.label}</strong>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <article className="academy-card academy-card--subscription" aria-label="Subscription">
                        <span className="academy-card__wash" aria-hidden="true" />
                        <header className="academy-card__heading">
                            <h3>
                                <CreditCard size={18} strokeWidth={2.25} />
                                <span>Subscription</span>
                            </h3>
                        </header>
                        <div className="academy-dashboard__current-plan">
                            <span />
                            <strong>Current Plan: PRO</strong>
                        </div>
                        <div className="academy-dashboard__plan-meta">
                            <span>Seats Used</span>
                            <b>{seatsUsed} / {seatsTotal}</b>
                        </div>
                        <div className="academy-dashboard__progress-row">
                            <div className="academy-dashboard__progress" aria-label={`${planUtilization}% seats used`}>
                                <i style={{ width: `${planUtilization}%` }} />
                            </div>
                            <strong>{planUtilization}%</strong>
                        </div>
                        <p>Valid Till: 30 Sep 2026</p>
                        <button type="button" className="academy-primary-button" onClick={() => history.push('/settings')}>
                            <span>Upgrade Plan</span>
                            <ArrowRight size={18} strokeWidth={2.4} />
                        </button>
                    </article>

                    <article className="academy-card academy-card--trial" aria-label="Starter plan">
                        <header className="academy-dashboard__trial-top">
                            <span>Starter Plan</span>
                            <b><Gift size={20} strokeWidth={2.15} /></b>
                        </header>
                        <h3>Free Trial (7 Days)</h3>
                        <div className="academy-dashboard__trial-box">
                            <p>Features: Limited access</p>
                            <p>Students Limit: 50</p>
                        </div>
                        <strong>
                            <Hourglass size={17} strokeWidth={2.1} />
                            <span>Days Left: 3</span>
                        </strong>
                        <button type="button" className="academy-dark-button" onClick={() => history.push('/settings')}>
                            <Rocket size={18} strokeWidth={2.25} />
                            <span>Activate Now</span>
                        </button>
                    </article>

                    <article className="academy-card academy-chart-card" aria-label="Attendance trend">
                        <div className="academy-card__heading academy-card__heading--split">
                            <h3>Attendance Trend</h3>
                            <span>Weekly</span>
                        </div>
                        <div className="academy-dashboard__chart" aria-hidden="true">
                            <div className="academy-dashboard__chart-grid" />
                            <div className="academy-dashboard__chart-bars">
                                {attendanceBars.map((height, index) => (
                                    <i key={index} style={{ height: `${height}%` }} />
                                ))}
                            </div>
                            <footer>
                                <span>Mon</span>
                                <span>Tue</span>
                                <span>Wed</span>
                                <span>Thu</span>
                                <span>Fri</span>
                            </footer>
                        </div>
                    </article>

                    <article className="academy-card academy-performance-card">
                        <div className="academy-card__heading">
                            <h3>
                                <TrendingUp size={18} strokeWidth={2.25} />
                                <span>Marks Performance</span>
                            </h3>
                        </div>
                        <div className="academy-dashboard__performance-grid">
                            <button type="button" className="is-green" onClick={() => history.push('/reports?filter=top')}>
                                <ArrowUpCircle size={20} strokeWidth={2.2} />
                                <span>Top Performers</span>
                            </button>
                            <button type="button" className="is-red" onClick={() => history.push('/reports?filter=low')}>
                                <ArrowDownCircle size={20} strokeWidth={2.2} />
                                <span>Low Performers</span>
                            </button>
                        </div>
                    </article>

                    <section className="academy-card academy-dashboard__alerts">
                        <h3>
                            <TriangleAlert size={18} strokeWidth={2.25} />
                            <span>Alerts</span>
                        </h3>
                        <ul>
                            <li>
                                <CheckCircle size={12} strokeWidth={3} />
                                <span>12 students low attendance</span>
                            </li>
                            <li>
                                <CheckCircle size={12} strokeWidth={3} />
                                <span>8 students low marks</span>
                            </li>
                        </ul>
                    </section>
                </main>
            </IonContent>
            <AppFooter />
        </IonPage>
    );
};

export default AcademyDashboard;
