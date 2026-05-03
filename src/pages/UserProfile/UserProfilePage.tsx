import React, { useMemo, useState } from 'react';
import { IonButton, IonContent, IonIcon, IonPage, IonToast } from '@ionic/react';
import {
    briefcase,
    calendarClear,
    create,
    logOutOutline,
    mail,
    person,
    refreshCircle,
    school,
} from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import AppFooter from '../../components/layout/AppFooter';
import AppHeader from '../../components/layout/AppHeader';
import UserAvatar from '../../components/ui/UserAvatar';
import { useFetchAcademyUsersQuery } from '../../redux/api/api';
import { useAppSelector } from '../../redux/hooks';
import { logoutUser } from '../../redux/slices/authSlice';
import { useTypedDispatch } from '../../redux/store';
import { AcademyUserProfile } from '../../types';
import { User } from '../../types/User';
import './UserProfilePage.scss';

interface Params {
    userId?: string;
}

const formatDate = (date?: string | null) => {
    if (!date) return 'Not set';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString('en-GB');
};

const getTitle = (user: AcademyUserProfile) => {
    if (user.type === 'academy') return user.designation || 'Academy Owner';
    if (user.type === 'student') return user.designation || 'Student';
    if (user.type === 'parent') return user.relationship || 'Parent';
    return user.designation || (user.type === 'admin' ? 'Admin' : 'Teacher');
};

const getProfileIdLabel = (user: AcademyUserProfile) => {
    if (user.type === 'academy') return 'Academy ID';
    if (user.type === 'student') return 'Student ID';
    if (user.type === 'parent') return 'Parent ID';
    return 'Employee ID';
};

const getProfileId = (user: AcademyUserProfile) => user.employee_id || user.id.slice(0, 8).toUpperCase();

const getDateLabel = (user: AcademyUserProfile) => {
    if (user.type === 'student') return 'Admission Date';
    if (user.type === 'parent') return 'Connected Since';
    return 'Joining Date';
};

const getStatusLabel = (status?: string | null) => {
    if (!status) return 'Active';
    return status.charAt(0).toUpperCase() + status.slice(1);
};

const getFallbackProfile = (currentUser: User): AcademyUserProfile => ({
    id: currentUser.id,
    auth_user_id: currentUser.id,
    type: currentUser.role === 'academy'
        ? 'academy'
        : currentUser.role === 'parent'
            ? 'parent'
            : currentUser.role === 'teacher'
                ? 'teacher'
                : 'admin',
    display_name: currentUser.display_name || currentUser.email || 'User',
    email: currentUser.email,
    phone: currentUser.phone,
    department: currentUser.role === 'teacher'
        ? 'Faculty'
        : currentUser.role === 'parent'
            ? 'Parent Connect'
            : 'Administration',
    designation: currentUser.role === 'academy'
        ? 'Academy Owner'
        : currentUser.role === 'admin'
            ? 'Admin'
            : currentUser.role || 'User',
    employee_id: currentUser.external_id || currentUser.academy_id || currentUser.id.slice(0, 8).toUpperCase(),
    profile_picture_url: currentUser.profile_picture_url,
    assigned_classes: [],
    status: 'active',
});

const UserProfilePage: React.FC = () => {
    const history = useHistory();
    const dispatch = useTypedDispatch();
    const { userId } = useParams<Params>();
    const currentUser = useAppSelector((state) => state.auth.user);
    const decodedUserId = userId ? decodeURIComponent(userId) : undefined;
    const routeTargetsCurrentUser = Boolean(decodedUserId && currentUser?.id === decodedUserId);
    const canFetchAcademyUsers = currentUser?.role === 'academy' || currentUser?.role === 'admin';
    const { data: users = [] } = useFetchAcademyUsersQuery(undefined, { skip: !canFetchAcademyUsers });
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    const profile = useMemo<AcademyUserProfile | null>(() => {
        if (decodedUserId) {
            return users.find((user) => user.id === decodedUserId) || null;
        }

        const matchingUser = users.find((user) => user.auth_user_id === currentUser?.id || user.id === currentUser?.id);
        if (matchingUser) return matchingUser;

        if (!currentUser) return null;

        return getFallbackProfile(currentUser);
    }, [currentUser, decodedUserId, users]);

    const isOwnProfile = Boolean(profile && currentUser && (profile.auth_user_id === currentUser.id || profile.id === currentUser.id || routeTargetsCurrentUser || !userId));
    const editPath = isOwnProfile ? '/profile/edit' : userId ? `/manage/users/${encodeURIComponent(userId)}/edit` : '/profile/edit';
    const headerTitle = isOwnProfile ? 'My Profile' : 'User Profile';
    const canResetPassword = profile?.type !== 'student';
    const shouldShowDate = profile?.type !== 'academy' || Boolean(profile?.joining_date);
    const canLogout = isOwnProfile && profile?.type !== 'student';

    const handleLogout = async () => {
        await dispatch(logoutUser());
        history.replace('/login');
    };

    if (!profile) {
        return (
            <IonPage className="am-page user-profile-page">
                <AppHeader title={routeTargetsCurrentUser || !userId ? 'My Profile' : 'User Profile'} showBack />
                <IonContent className="am-content" fullscreen>
                    <main className="user-profile__scroll">
                        <div className="user-profile__empty">User profile not found.</div>
                    </main>
                </IonContent>
                <AppFooter />
            </IonPage>
        );
    }

    return (
        <IonPage className="am-page user-profile-page">
            <AppHeader title={headerTitle} showBack />
            <IonContent className="am-content" fullscreen>
                <main className="user-profile__scroll">
                    <section className="user-profile__hero">
                        <div className="user-profile__photo-shell">
                            <UserAvatar
                                size="xl"
                                className="user-profile__photo"
                                name={profile.display_name}
                                src={profile.profile_picture_url}
                            />
                            <span>
                                <IonIcon icon={create} aria-hidden="true" />
                            </span>
                        </div>
                        <h1>{profile.display_name}</h1>
                        <p>{getTitle(profile)}</p>
                        <span className="user-profile__id">{getProfileIdLabel(profile)}: {getProfileId(profile)}</span>
                    </section>

                    <section className="user-profile__actions">
                        <IonButton fill="outline" className="user-profile__edit" onClick={() => history.push(editPath)}>
                            <IonIcon icon={create} slot="start" />
                            Edit Profile
                        </IonButton>
                        {canResetPassword && (
                            <IonButton className="user-profile__reset" onClick={() => setToastMsg('Password reset request noted.')}>
                                <IonIcon icon={refreshCircle} slot="start" />
                                Reset Password
                            </IonButton>
                        )}
                    </section>

                    <section className="user-profile__card">
                        <h2>
                            <IonIcon icon={person} aria-hidden="true" />
                            Personal Information
                        </h2>
                        <dl>
                            {profile.type !== 'student' && (
                                <>
                                    <div>
                                        <dt>Email</dt>
                                        <dd><IonIcon icon={mail} aria-hidden="true" />{profile.email || 'Not set'}</dd>
                                    </div>
                                    <div>
                                        <dt>Phone</dt>
                                        <dd>{profile.phone || 'Not set'}</dd>
                                    </div>
                                </>
                            )}
                            {profile.type === 'student' && (
                                <>
                                    <div>
                                        <dt>Student ID</dt>
                                        <dd>{getProfileId(profile)}</dd>
                                    </div>
                                    <div>
                                        <dt>Status</dt>
                                        <dd>{getStatusLabel(profile.status)}</dd>
                                    </div>
                                </>
                            )}
                            {shouldShowDate && (
                                <div>
                                    <dt>{getDateLabel(profile)}</dt>
                                    <dd><IonIcon icon={calendarClear} aria-hidden="true" />{formatDate(profile.joining_date)}</dd>
                                </div>
                            )}
                        </dl>
                    </section>

                    {(profile.type === 'academy' || profile.type === 'admin') && (
                        <section className="user-profile__card">
                            <h2>
                                <IonIcon icon={briefcase} aria-hidden="true" />
                                Account Details
                            </h2>
                            <dl>
                                <div>
                                    <dt>Role</dt>
                                    <dd><span className="user-profile__chip">{getTitle(profile)}</span></dd>
                                </div>
                                {profile.type === 'academy' && (
                                    <div>
                                        <dt>Academy ID</dt>
                                        <dd>{getProfileId(profile)}</dd>
                                    </div>
                                )}
                                <div>
                                    <dt>Department</dt>
                                    <dd><IonIcon icon={school} aria-hidden="true" />{profile.department || 'Administration'}</dd>
                                </div>
                                <div>
                                    <dt>Account Status</dt>
                                    <dd>{getStatusLabel(profile.status)}</dd>
                                </div>
                            </dl>
                        </section>
                    )}

                    {profile.type === 'teacher' && (
                        <section className="user-profile__card">
                            <h2>
                                <IonIcon icon={briefcase} aria-hidden="true" />
                                Professional Details
                            </h2>
                            <dl>
                                <div>
                                    <dt>Department</dt>
                                    <dd><IonIcon icon={school} aria-hidden="true" />{profile.department || 'Not set'}</dd>
                                </div>
                                <div>
                                    <dt>Designation</dt>
                                    <dd><span className="user-profile__chip">{profile.designation || getTitle(profile)}</span></dd>
                                </div>
                                <div>
                                    <dt>Assigned Classes</dt>
                                    <dd className="user-profile__chips">
                                        {(profile.assigned_classes?.length ? profile.assigned_classes : ['Not assigned']).map((item) => (
                                            <span key={item}>{item}</span>
                                        ))}
                                    </dd>
                                </div>
                            </dl>
                        </section>
                    )}

                    {profile.type === 'parent' && (
                        <section className="user-profile__card">
                            <h2>
                                <IonIcon icon={briefcase} aria-hidden="true" />
                                Parent Details
                            </h2>
                            <dl>
                                <div>
                                    <dt>Relationship</dt>
                                    <dd><span className="user-profile__chip">{profile.relationship || 'Guardian'}</span></dd>
                                </div>
                                <div>
                                    <dt>Address</dt>
                                    <dd>{profile.address || 'Not set'}</dd>
                                </div>
                            </dl>
                        </section>
                    )}

                    {profile.type === 'student' && (
                        <section className="user-profile__card">
                            <h2>
                                <IonIcon icon={briefcase} aria-hidden="true" />
                                Academic Details
                            </h2>
                            <dl>
                                <div>
                                    <dt>Class</dt>
                                    <dd><span className="user-profile__chip">Class {profile.class_name || '-'}</span></dd>
                                </div>
                                {profile.class_section && (
                                    <div>
                                        <dt>Section</dt>
                                        <dd>{profile.class_section}</dd>
                                    </div>
                                )}
                                <div>
                                    <dt>Academic Year</dt>
                                    <dd>{profile.academic_year || 'Not set'}</dd>
                                </div>
                            </dl>
                        </section>
                    )}

                    {canLogout && (
                        <section className="user-profile__logout-section">
                            <button type="button" className="user-profile__logout" onClick={handleLogout}>
                                <IonIcon icon={logOutOutline} aria-hidden="true" />
                                Logout
                            </button>
                        </section>
                    )}
                </main>

                <IonToast
                    isOpen={!!toastMsg}
                    message={toastMsg || ''}
                    duration={1800}
                    onDidDismiss={() => setToastMsg(null)}
                />
            </IonContent>
            <AppFooter />
        </IonPage>
    );
};

export default UserProfilePage;
