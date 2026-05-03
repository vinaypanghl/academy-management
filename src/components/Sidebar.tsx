import React, { useMemo, useState } from 'react';
import { IonContent, IonMenu, IonMenuToggle } from '@ionic/react';
import {
    BadgeCheck,
    BookOpen,
    CalendarClock,
    ChevronDown,
    ChevronRight,
    CircleHelp,
    ClipboardCheck,
    LayoutGrid,
    LogOut,
    Megaphone,
    Settings,
    UserRoundCog,
    Users,
    WalletCards,
    X,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { RootState, useTypedDispatch } from '../redux/store';
import { logoutUser } from '../redux/slices/authSlice';
import UserAvatar from './ui/UserAvatar';
import './Sidebar.scss';

interface MenuItem {
    label: string;
    path: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
    children?: { label: string; path: string }[];
}

const academyItems: MenuItem[] = [
    { label: 'Dashboard', path: '/academy-dashboard', icon: LayoutGrid },
    { label: 'Manage Users', path: '/manage/users', icon: UserRoundCog },
    {
        label: 'Classes',
        path: '/classes',
        icon: BookOpen,
        children: [
            { label: 'All Classes', path: '/classes' },
            { label: 'Create Class', path: '/create-class' },
            { label: 'Schedule', path: '/class-timetable' },
            { label: 'Create Schedule', path: '/schedule-meetings' },
        ],
    },
    { label: 'Attendance', path: '/attendance', icon: ClipboardCheck },
    { label: 'Marks', path: '/teacher/marks', icon: BadgeCheck },
    { label: 'Reports', path: '/reports', icon: CalendarClock },
    { label: 'Announcements', path: '/announcements', icon: Megaphone },
    { label: 'Fees (Optional)', path: '/fees', icon: WalletCards },
    { label: 'Settings', path: '/settings', icon: Settings },
];

const teacherItems: MenuItem[] = [
    { label: 'Dashboard', path: '/teacher-dashboard', icon: LayoutGrid },
    { label: 'Attendance', path: '/attendance', icon: ClipboardCheck },
    { label: 'Marks', path: '/teacher/marks', icon: BadgeCheck },
    { label: 'Students', path: '/teacher/students', icon: Users },
    { label: 'Homework', path: '/teacher/homework/add', icon: BookOpen },
    { label: 'Announcements', path: '/announcements', icon: Megaphone },
    { label: 'Settings', path: '/settings', icon: Settings },
];

const parentItems: MenuItem[] = [
    { label: 'Dashboard', path: '/parent-dashboard', icon: LayoutGrid },
    { label: 'Progress', path: '/parent/progress', icon: BadgeCheck },
    { label: 'Attendance', path: '/parent/attendance', icon: ClipboardCheck },
    { label: 'Homework', path: '/parent/homework', icon: BookOpen },
    { label: 'Teacher Feedback', path: '/parent/feedback', icon: Megaphone },
    { label: 'Documents', path: '/parent/documents', icon: WalletCards },
    { label: 'Meeting Request', path: '/parent/meeting-request', icon: CalendarClock },
    { label: 'Settings', path: '/settings', icon: Settings },
];

const getRoleMenu = (role: string | null) => {
    switch (role) {
        case 'academy':
        case 'admin':
            return {
                heading: 'ADMIN',
                items: academyItems,
            };
        case 'teacher':
            return {
                heading: 'TEACHER',
                items: teacherItems,
            };
        case 'parent':
            return {
                heading: 'PARENT',
                items: parentItems,
            };
        default:
            return {
                heading: 'WORKSPACE',
                items: [],
            };
    }
};

const Sidebar: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const history = useHistory();
    const location = useLocation();
    const dispatch = useTypedDispatch();
    const [expandedItem, setExpandedItem] = useState('/classes');

    if (!user) return null;

    const roleMenu = useMemo(() => getRoleMenu(user.role), [user.role]);

    const navigate = (path: string) => {
        history.push(path);
    };

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser());
            history.replace('/login');
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    const renderItem = (item: MenuItem) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path
            || (item.path !== '/' && location.pathname.startsWith(`${item.path}/`))
            || Boolean(item.children?.some((child) => location.pathname === child.path || location.pathname.startsWith(`${child.path}/`)));
        const isExpanded = expandedItem === item.path;

        return (
            <div key={item.path} className={`sidebar-menu__entry${isActive ? ' is-active' : ''}`}>
                {item.children?.length ? (
                    <button
                        type="button"
                        className={`sidebar-menu__item${isActive ? ' is-active' : ''}`}
                        onClick={() => setExpandedItem(isExpanded ? '' : item.path)}
                    >
                        <Icon size={28} strokeWidth={2.15} />
                        <span>{item.label}</span>
                        <ChevronDown
                            size={22}
                            strokeWidth={2.1}
                            className={`sidebar-menu__chevron${isExpanded ? ' is-expanded' : ''}`}
                        />
                    </button>
                ) : (
                    <IonMenuToggle autoHide={false}>
                        <button
                            type="button"
                            className={`sidebar-menu__item${isActive ? ' is-active' : ''}`}
                            onClick={() => navigate(item.path)}
                        >
                            <Icon size={28} strokeWidth={2.15} />
                            <span>{item.label}</span>
                            <ChevronRight size={22} strokeWidth={2.1} className="sidebar-menu__chevron sidebar-menu__chevron--plain" />
                        </button>
                    </IonMenuToggle>
                )}

                {item.children?.length && isExpanded && (
                    <div className="sidebar-menu__children">
                        {item.children.map((child) => {
                            const childActive = location.pathname === child.path || location.pathname.startsWith(`${child.path}/`);
                            return (
                                <IonMenuToggle key={child.path} autoHide={false}>
                                    <button
                                        type="button"
                                        className={`sidebar-menu__child${childActive ? ' is-active' : ''}`}
                                        onClick={() => navigate(child.path)}
                                    >
                                        {child.label}
                                    </button>
                                </IonMenuToggle>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <IonMenu id="app-menu" side="start" contentId="main-content" type="overlay" className="sidebar-menu">
            <IonContent className="sidebar-menu__content">
                <aside className="sidebar-menu__panel">
                    <header className="sidebar-menu__header">
                        <div className="sidebar-menu__hero">
                            <UserAvatar
                                className="sidebar-menu__avatar"
                                name={user.display_name || user.email}
                                src={user.profile_picture_url}
                                alt="Workspace profile"
                            />
                            <div>
                                <h2>ACADEVIN</h2>
                                <p>{roleMenu.heading}</p>
                            </div>
                        </div>
                        <IonMenuToggle autoHide={false}>
                            <button type="button" className="sidebar-menu__close" aria-label="Close menu">
                                <X size={24} strokeWidth={2.25} />
                            </button>
                        </IonMenuToggle>
                    </header>

                    <section className="sidebar-menu__section">
                        {roleMenu.items.map(renderItem)}
                    </section>

                    <footer className="sidebar-menu__footer">
                        <button type="button" className="sidebar-menu__utility">
                            <CircleHelp size={24} strokeWidth={2.1} />
                            <span>Help &amp; Support</span>
                        </button>
                        <button type="button" className="sidebar-menu__logout" onClick={handleLogout}>
                            <LogOut size={24} strokeWidth={2.1} />
                            <span>Logout</span>
                        </button>
                    </footer>
                </aside>
            </IonContent>
        </IonMenu>
    );
};

export default Sidebar;
