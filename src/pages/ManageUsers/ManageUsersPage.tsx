import React, { useMemo, useState } from 'react';
import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import {
    Check,
    ChevronDown,
    Link as LinkIcon,
    MoreVertical,
    Search,
} from 'lucide-react';
import { useHistory } from 'react-router-dom';
import AppFooter from '../../components/layout/AppFooter';
import AppHeader from '../../components/layout/AppHeader';
import UserAvatar from '../../components/ui/UserAvatar';
import { useFetchAcademyUsersQuery } from '../../redux/api/api';
import { AcademyUserProfile, AcademyUserType } from '../../types';
import './ManageUsersPage.scss';

type ManageUsersTab = Extract<AcademyUserType, 'student' | 'teacher' | 'parent'>;

const tabs: { key: ManageUsersTab; label: string }[] = [
    { key: 'student', label: 'Students' },
    { key: 'teacher', label: 'Teachers' },
    { key: 'parent', label: 'Parents' },
];

const getSubtitle = (user: AcademyUserProfile) => {
    if (user.type === 'student') {
        return `${user.class_name ? `Class ${user.class_name}` : 'Class'}${user.class_section ? ` ${user.class_section}` : ''}${user.roll_no ? ` • Roll ${user.roll_no}` : ''}`;
    }

    if (user.type === 'parent') {
        return user.relationship || 'Guardian';
    }

    return [user.designation, user.department].filter(Boolean).join(' • ') || 'Faculty';
};

const getLinkedLabel = (user: AcademyUserProfile, statusTone: string) => {
    if (user.type === 'student') {
        return user.linked_parent_name || (statusTone === 'pending' ? 'Pending Invite' : 'No Parent Linked');
    }

    if (user.type === 'teacher') {
        return user.assigned_classes?.length ? `${user.assigned_classes.length} Classes` : 'No class assigned';
    }

    if (user.type === 'parent') {
        return user.relationship || 'Children linked';
    }

    return user.email || user.phone || 'Profile ready';
};

const getStatusTone = (status?: string | null) => {
    if (status === 'pending') return 'pending';
    if (status === 'inactive') return 'inactive';
    return 'active';
};

const ManageUsersPage: React.FC = () => {
    const history = useHistory();
    const { data: users = [], isFetching, isError } = useFetchAcademyUsersQuery();
    const [activeTab, setActiveTab] = useState<ManageUsersTab>('student');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const filteredUsers = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return users
            .filter((user) => user.type === activeTab)
            .filter((user) => {
                if (!normalizedSearch) return true;
                return [
                    user.display_name,
                    user.email,
                    user.phone,
                    user.employee_id,
                    user.class_name,
                    user.class_section,
                    user.roll_no,
                    user.linked_parent_name,
                    user.department,
                    user.designation,
                    user.relationship,
                ]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(normalizedSearch));
            });
    }, [activeTab, searchTerm, users]);

    const allSelected = filteredUsers.length > 0 && filteredUsers.every((user) => selectedIds.includes(user.id));

    const toggleSelection = (userId: string) => {
        setSelectedIds((current) => (
            current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]
        ));
    };

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds((current) => current.filter((id) => !filteredUsers.some((user) => user.id === id)));
            return;
        }

        setSelectedIds((current) => Array.from(new Set([...current, ...filteredUsers.map((user) => user.id)])));
    };

    const openProfile = (user: AcademyUserProfile) => {
        history.push(`/manage/users/${encodeURIComponent(user.id)}`);
    };

    return (
        <IonPage className="am-page manage-users-page">
            <AppHeader
                title="User Management"
                heroTitle="User Management"
                heroSubtitle="ABC International School"
            />
            <IonContent className="am-content manage-users__content" fullscreen>
                <main className="manage-users__scroll">
                    <nav className="manage-users__tabs" aria-label="User categories">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                className={activeTab === tab.key ? 'is-active' : ''}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    <label className="manage-users__search">
                        <Search size={18} strokeWidth={2.25} />
                        <input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search by name or ID..."
                        />
                    </label>

                    <section className="manage-users__toolbar">
                        <button type="button" className={`manage-users__checkbox${allSelected ? ' is-active' : ''}`} onClick={toggleSelectAll}>
                            <span>{allSelected && <Check size={14} strokeWidth={2.8} />}</span>
                            Select All
                        </button>
                        <button type="button" className="manage-users__bulk">
                            Bulk Actions
                            <ChevronDown size={14} strokeWidth={2.3} />
                        </button>
                    </section>

                    <section className="manage-users__list">
                        {isFetching && (
                            <div className="manage-users__state">
                                <IonSpinner name="crescent" />
                                <span>Loading users...</span>
                            </div>
                        )}

                        {isError && (
                            <div className="manage-users__state">
                                <span>Unable to load users.</span>
                            </div>
                        )}

                        {!isFetching && !isError && filteredUsers.map((user) => {
                            const statusTone = getStatusTone(user.type === 'student' ? user.linked_parent_status || user.status : user.status);
                            const statusLabel = statusTone === 'active'
                                ? 'Active'
                                : statusTone === 'pending'
                                    ? 'Pending'
                                    : 'Inactive';
                            const linkedLabel = getLinkedLabel(user, statusTone);

                            return (
                                <article key={`${user.type}-${user.id}`} className={`manage-users__card manage-users__card--${statusTone}`}>
                                    <div className="manage-users__card-top">
                                        <button
                                            type="button"
                                            className={`manage-users__selector${selectedIds.includes(user.id) ? ' is-active' : ''}`}
                                            onClick={() => toggleSelection(user.id)}
                                            aria-label={`Select ${user.display_name}`}
                                        >
                                            {selectedIds.includes(user.id) && <Check size={14} strokeWidth={2.8} />}
                                        </button>

                                        <button type="button" className="manage-users__identity" onClick={() => openProfile(user)}>
                                            <UserAvatar
                                                className="manage-users__avatar"
                                                name={user.display_name}
                                                src={user.profile_picture_url}
                                                alt={user.display_name}
                                            />
                                            <span>
                                                <strong>{user.display_name}</strong>
                                                <small>{getSubtitle(user)}</small>
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            className="manage-users__menu"
                                            aria-label="More actions"
                                            onClick={() => openProfile(user)}
                                        >
                                            <MoreVertical size={18} strokeWidth={2.2} />
                                        </button>
                                    </div>

                                    <div className="manage-users__linked-row">
                                        <div>
                                            <small>{user.type === 'student' ? 'Linked Parent' : 'Linked Info'}</small>
                                            <button type="button" onClick={() => openProfile(user)}>
                                                <LinkIcon size={14} strokeWidth={2.2} />
                                                {linkedLabel}
                                            </button>
                                        </div>

                                        <div className="manage-users__card-actions">
                                            <span className={`manage-users__status manage-users__status--${statusTone}`}>
                                                {statusLabel}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}

                        {!isFetching && !isError && filteredUsers.length === 0 && (
                            <div className="manage-users__state">
                                <span>No users found.</span>
                            </div>
                        )}
                    </section>
                </main>
            </IonContent>

            <AppFooter centerAriaLabel="Create user or class" />
        </IonPage>
    );
};

export default ManageUsersPage;
