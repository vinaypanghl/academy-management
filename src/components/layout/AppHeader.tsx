import React from 'react';
import { IonButton, IonHeader, IonToolbar } from '@ionic/react';
import { menuController } from '@ionic/core/components';
import { ArrowLeft, Bell, ChevronDown, Menu } from 'lucide-react';
import { useHistory } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';
import UserAvatar from '../ui/UserAvatar';

interface HeaderAction {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

interface AppHeaderProps {
    title: string;
    showBack?: boolean;
    backHref?: string;
    onBack?: () => void;
    hideAvatar?: boolean;
    heroTitle?: string;
    heroSubtitle?: string;
    heroEyebrow?: string;
    heroAction?: HeaderAction;
    workspaceLabelOverride?: string;
    hideNotifications?: boolean;
}

const workspaceLabels: Record<string, string> = {
    academy: 'Academy Panel',
    admin: 'Academy Panel',
    teacher: 'Teacher Portal',
    parent: 'Parent Connect',
};

const AppHeader: React.FC<AppHeaderProps> = ({
    title,
    showBack = false,
    backHref,
    onBack,
    hideAvatar = false,
    heroTitle,
    heroSubtitle,
    heroEyebrow,
    heroAction,
    workspaceLabelOverride,
    hideNotifications = false,
}) => {
    const history = useHistory();
    const currentUser = useAppSelector((state) => state.auth.user);
    const availableRoles = currentUser?.roles?.length
        ? currentUser.roles
        : currentUser?.role
            ? [currentUser.role]
            : [];
    const hasMultiRoleAccess = availableRoles.length > 1;
    const roleLabel = currentUser?.role
        ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
        : 'Guest';
    const workspaceLabel = workspaceLabelOverride || (currentUser?.role ? workspaceLabels[currentUser.role] || 'Workspace' : 'Workspace');
    const brandName = currentUser?.role === 'academy' || currentUser?.role === 'admin' ? 'ACADEVIN' : 'EduCore';
    const ActionIcon = heroAction?.icon;

    const fallbackHref = (() => {
        switch (currentUser?.role) {
            case 'teacher':
                return '/teacher-dashboard';
            case 'parent':
                return '/parent-dashboard';
            case 'academy':
            case 'admin':
                return '/academy-dashboard';
            default:
                return '/';
        }
    })();

    const handleBack = () => {
        if (onBack) {
            onBack();
            return;
        }

        if (history.length > 1) {
            history.goBack();
            return;
        }

        history.push(backHref || fallbackHref);
    };

    return (
        <IonHeader className={`app-header${heroTitle ? ' app-header--hero' : ''}${showBack ? ' app-header--editor' : ''}`}>
            <IonToolbar className="app-header__toolbar">
                <div className="app-header__shell">
                    <div className="app-header__top">
                        <div className="app-header__leading">
                            {showBack ? (
                                <>
                                    <IonButton
                                        fill="clear"
                                        className="app-header__icon-button app-header__icon-button--solid"
                                        onClick={handleBack}
                                        aria-label="Go back"
                                    >
                                        <ArrowLeft size={22} strokeWidth={2.25} />
                                    </IonButton>
                                    <div className="app-header__editor-copy">
                                        <strong>{title}</strong>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <IonButton
                                        fill="clear"
                                        className="app-header__menu-button"
                                        aria-label="Open menu"
                                        onClick={() => menuController.open('app-menu')}
                                    >
                                        <Menu size={28} strokeWidth={2.4} />
                                    </IonButton>
                                    <button
                                        type="button"
                                        className="app-header__brand"
                                        onClick={() => history.push(fallbackHref)}
                                        aria-label="Go to home"
                                    >
                                        <span>
                                            <strong>{brandName}</strong>
                                            <small>{workspaceLabel}</small>
                                        </span>
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="app-header__actions">
                            {showBack && heroAction ? (
                                <button type="button" className="app-header__top-action" onClick={heroAction.onClick}>
                                    {heroAction.label}
                                </button>
                            ) : (
                                <>
                                    {hasMultiRoleAccess && (
                                        <button
                                            type="button"
                                            className="app-header__role"
                                            onClick={() => menuController.open('app-menu')}
                                            aria-label="Switch role"
                                        >
                                            <span>{roleLabel}</span>
                                            <ChevronDown size={14} strokeWidth={2.4} />
                                        </button>
                                    )}
                                    {!hideNotifications && (
                                        <button type="button" className="app-header__notification" aria-label="Notifications">
                                            <Bell size={20} strokeWidth={2.2} />
                                            <i aria-hidden="true" />
                                        </button>
                                    )}
                                    {!hideAvatar && (
                                        <button
                                            type="button"
                                            className="app-header__profile-button"
                                            aria-label="Open my profile"
                                            onClick={() => history.push('/profile')}
                                        >
                                            <UserAvatar
                                                className="app-header__avatar"
                                                name={currentUser?.display_name || currentUser?.email}
                                                src={currentUser?.profile_picture_url}
                                                alt="Profile"
                                            />
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {heroTitle && !showBack && (
                        <div className="app-header__hero-copy">
                            {heroEyebrow && <p className="app-header__hero-eyebrow">{heroEyebrow}</p>}
                            <div className={`app-header__hero-row${heroAction && !showBack ? ' has-action' : ''}`}>
                                <div>
                                    <h1>{heroTitle}</h1>
                                    {heroSubtitle && <p className="app-header__hero-subtitle">{heroSubtitle}</p>}
                                </div>
                                {!showBack && heroAction && (
                                    <button type="button" className="app-header__hero-action" onClick={heroAction.onClick}>
                                        {ActionIcon && <ActionIcon size={22} strokeWidth={2.2} />}
                                        <span>{heroAction.label}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </IonToolbar>
        </IonHeader>
    );
};

export default AppHeader;
