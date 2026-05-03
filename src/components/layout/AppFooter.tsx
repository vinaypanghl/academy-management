import React, { useState } from 'react';
import { IonFooter } from '@ionic/react';
import {
    CalendarDays,
    ChevronRight,
    Ellipsis,
    FolderPlus,
    House,
    Layers3,
    PieChart,
    Plus,
    Presentation,
    Shield,
    UserCheck,
    UserPlus,
    Users,
} from 'lucide-react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';
import BottomActionSheet from '../ui/BottomActionSheet';

interface FooterItem {
    label: string;
    path: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

interface AppFooterProps {
    onCenterClick?: () => void;
    centerAriaLabel?: string;
}

const AppFooter: React.FC<AppFooterProps> = ({ onCenterClick, centerAriaLabel }) => {
    const history = useHistory();
    const location = useLocation();
    const role = useAppSelector((state) => state.auth.role);
    const [isCreateSheetOpen, setCreateSheetOpen] = useState(false);
    const homePath = role === 'teacher'
        ? '/teacher-dashboard'
        : role === 'parent'
            ? '/parent-dashboard'
            : '/academy-dashboard';
    const isAcademyAdmin = role === 'academy' || role === 'admin';

    const footerConfig: Record<string, { left: FooterItem[]; center: FooterItem; right: FooterItem[] }> = {
        academy: {
            left: [
                { label: 'Dashboard', path: homePath, icon: House },
                { label: 'Manage', path: '/manage/users', icon: Layers3 },
            ],
            center: { label: 'Create', path: '/announcements/create', icon: Plus },
            right: [
                { label: 'Analytics', path: '/reports', icon: PieChart },
                { label: 'More', path: '/announcements', icon: Ellipsis },
            ],
        },
        admin: {
            left: [
                { label: 'Dashboard', path: homePath, icon: House },
                { label: 'Manage', path: '/manage/users', icon: Layers3 },
            ],
            center: { label: 'Create', path: '/announcements/create', icon: Plus },
            right: [
                { label: 'Analytics', path: '/reports', icon: PieChart },
                { label: 'More', path: '/announcements', icon: Ellipsis },
            ],
        },
        teacher: {
            left: [
                { label: 'Home', path: homePath, icon: House },
                { label: 'Classes', path: '/teacher/schedule', icon: Presentation },
            ],
            center: { label: 'Add', path: '/teacher/homework/add', icon: Plus },
            right: [
                { label: 'Students', path: '/teacher/students', icon: Users },
                { label: 'More', path: '/announcements', icon: Ellipsis },
            ],
        },
        parent: {
            left: [
                { label: 'Home', path: homePath, icon: House },
                { label: 'Progress', path: '/parent/progress', icon: PieChart },
            ],
            center: { label: 'Homework', path: '/parent/homework', icon: Plus },
            right: [
                { label: 'Meetings', path: '/parent/meeting-request', icon: CalendarDays },
                { label: 'More', path: '/parent/feedback', icon: Ellipsis },
            ],
        },
    };

    const config = footerConfig[role || 'academy'] || footerConfig.academy;
    const CenterIcon = config.center.icon;
    const createOptions = [
        { label: 'Create Class', icon: FolderPlus, path: '/create-class', tone: 'amber', visible: true },
        { label: 'Create Student', icon: UserPlus, path: '/create-student', tone: 'blue', visible: true },
        { label: 'Create Teacher', icon: UserCheck, path: '/create-teacher', tone: 'green', visible: isAcademyAdmin },
        { label: 'Create Admin', icon: Shield, path: '/create-admin', tone: 'purple', visible: role === 'academy' },
    ];

    const isActive = (path: string) => (
        location.pathname === path
        || (path === '/announcements' && location.pathname.startsWith('/announcements'))
        || (path !== '/' && location.pathname.startsWith(`${path}/`))
    );

    const handleCreateOption = (path: string) => {
        setCreateSheetOpen(false);
        history.push(path);
    };

    const handleCenterClick = () => {
        if (onCenterClick) {
            onCenterClick();
            return;
        }

        if (isAcademyAdmin) {
            setCreateSheetOpen(true);
            return;
        }

        history.push(config.center.path);
    };

    return (
        <>
            <IonFooter className="app-footer">
                <div className="app-footer__inner">
                    <nav className="app-footer__nav" aria-label="Primary">
                        {config.left.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.path}
                                    className={`app-footer__item${isActive(item.path) ? ' is-active' : ''}`}
                                    type="button"
                                    onClick={() => history.push(item.path)}
                                >
                                    <Icon size={24} strokeWidth={2.2} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}

                        <button
                            type="button"
                            className={`app-footer__center${!isAcademyAdmin && isActive(config.center.path) ? ' is-active' : ''}`}
                            onClick={handleCenterClick}
                            aria-label={centerAriaLabel || config.center.label}
                        >
                            <CenterIcon size={30} strokeWidth={2.4} />
                        </button>

                        {config.right.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.path}
                                    className={`app-footer__item${isActive(item.path) ? ' is-active' : ''}`}
                                    type="button"
                                    onClick={() => history.push(item.path)}
                                >
                                    <Icon size={24} strokeWidth={2.2} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </IonFooter>

            {isAcademyAdmin && (
                <BottomActionSheet
                    isOpen={isCreateSheetOpen}
                    onClose={() => setCreateSheetOpen(false)}
                    title="Create New"
                    className="app-create-modal"
                >
                    <div className="app-create-sheet__list">
                        {createOptions.filter((item) => item.visible).map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.path}
                                    type="button"
                                    className={`app-create-sheet__item app-create-sheet__item--${item.tone}`}
                                    onClick={() => handleCreateOption(item.path)}
                                >
                                    <span>
                                        <Icon size={22} strokeWidth={2.25} />
                                    </span>
                                    <strong>{item.label}</strong>
                                    <ChevronRight size={20} strokeWidth={2.25} />
                                </button>
                            );
                        })}
                    </div>
                </BottomActionSheet>
            )}
        </>
    );
};

export default AppFooter;
