import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { IonButton, IonContent, IonFooter, IonIcon, IonPage, IonSpinner, IonToast } from '@ionic/react';
import { briefcase, calendarClear, checkmarkCircle, person } from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import AppFooter from '../../components/layout/AppFooter';
import AppHeader from '../../components/layout/AppHeader';
import { DesignInput, DesignSelect, FormNotice } from '../../components/ui/DesignField';
import UserAvatar from '../../components/ui/UserAvatar';
import { useFetchAcademyUsersQuery, useUpdateAcademyUserMutation } from '../../redux/api/api';
import { useAppSelector } from '../../redux/hooks';
import { supabase } from '../../services/apiClient';
import { AcademyUserProfile } from '../../types';
import { User } from '../../types/User';
import './UserProfilePage.scss';

interface Params {
    userId?: string;
}

interface FormValues {
    display_name: string;
    email: string;
    phone: string;
    department: string;
    designation: string;
    joining_date: string;
    address: string;
    profile_picture_url: string;
}

const departmentOptions = [
    { value: 'Administration', label: 'Administration' },
    { value: 'Academy Office', label: 'Academy Office' },
    { value: 'Faculty', label: 'Faculty' },
    { value: 'Science', label: 'Science' },
    { value: 'Math', label: 'Math' },
    { value: 'Parent Connect', label: 'Parent Connect' },
    { value: 'Students', label: 'Students' },
];

const emptyValues: FormValues = {
    display_name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    joining_date: '',
    address: '',
    profile_picture_url: '',
};

const getProfileIdLabel = (user: AcademyUserProfile) => {
    if (user.type === 'academy') return 'Academy ID';
    if (user.type === 'student') return 'Student ID';
    if (user.type === 'parent') return 'Parent ID';
    return 'Employee ID';
};

const getProfileId = (user: AcademyUserProfile) => user.employee_id || user.id.slice(0, 8).toUpperCase();

const getNoticeCopy = (user: AcademyUserProfile) => {
    if (user.type === 'student') {
        return {
            title: 'Academic Records',
            body: 'Class, section, academic year, and student identifiers are managed from student records.',
        };
    }

    if (user.type === 'parent') {
        return {
            title: 'Linked Records',
            body: 'Guardian relationship and linked student records are managed from student registration.',
        };
    }

    if (user.type === 'academy') {
        return {
            title: 'Protected Account',
            body: 'Academy ownership and academy ID changes require support verification.',
        };
    }

    return {
        title: 'Limited Edits',
        body: 'Employee ID, assigned classes, and joining records require administrative approval.',
    };
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
});

const EditUserProfilePage: React.FC = () => {
    const history = useHistory();
    const { userId } = useParams<Params>();
    const currentUser = useAppSelector((state) => state.auth.user);
    const decodedUserId = userId ? decodeURIComponent(userId) : undefined;
    const routeTargetsCurrentUser = Boolean(decodedUserId && currentUser?.id === decodedUserId);
    const canFetchAcademyUsers = currentUser?.role === 'academy' || currentUser?.role === 'admin';
    const { data: users = [] } = useFetchAcademyUsersQuery(undefined, { skip: !canFetchAcademyUsers });
    const [updateUser, { isLoading }] = useUpdateAcademyUserMutation();
    const [values, setValues] = useState<FormValues>(emptyValues);
    const [profileFile, setProfileFile] = useState<File | null>(null);
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
    const headerTitle = isOwnProfile ? 'Edit My Profile' : 'Edit Profile';
    const returnPath = isOwnProfile ? '/profile' : userId ? `/manage/users/${encodeURIComponent(userId)}` : '/profile';
    const noticeCopy = profile ? getNoticeCopy(profile) : null;

    useEffect(() => {
        if (!profile) return;

        setValues({
            display_name: profile.display_name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            department: profile.department || '',
            designation: profile.designation || '',
            joining_date: profile.joining_date || '',
            address: profile.address || '',
            profile_picture_url: profile.profile_picture_url || '',
        });
        setProfileFile(null);
    }, [profile]);

    const updateValue = (field: keyof FormValues) => (value: string) => {
        setValues((current) => ({ ...current, [field]: value }));
    };

    const handleProfileFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setToastMsg('Please choose an image file.');
            return;
        }

        setProfileFile(file);
        setValues((current) => ({
            ...current,
            profile_picture_url: URL.createObjectURL(file),
        }));
    };

    const uploadProfilePicture = async () => {
        if (!profile || !profileFile) return values.profile_picture_url || profile?.profile_picture_url || null;

        const extension = profileFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const ownerId = profile.auth_user_id || currentUser?.id || profile.id;
        const storagePath = `${ownerId}/${profile.id}-${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage
            .from('profile-pictures')
            .upload(storagePath, profileFile, {
                cacheControl: '3600',
                upsert: true,
            });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('profile-pictures').getPublicUrl(storagePath);
        return data.publicUrl;
    };

    const handleSave = async () => {
        if (!profile) return;

        try {
            const profilePictureUrl = await uploadProfilePicture();

            await updateUser({
                id: profile.id,
                auth_user_id: profile.auth_user_id,
                type: profile.type,
                display_name: values.display_name,
                email: values.email,
                phone: values.phone,
                department: values.department,
                designation: values.designation,
                joining_date: values.joining_date,
                address: values.address,
                profile_picture_url: profilePictureUrl,
            }).unwrap();

            setToastMsg('Profile saved');
            window.setTimeout(() => {
                history.push(returnPath);
            }, 650);
        } catch (error: any) {
            setToastMsg(error?.data?.error || 'Failed to save profile');
        }
    };

    if (!profile) {
        return (
            <IonPage className="am-page edit-profile-page">
                <AppHeader title={routeTargetsCurrentUser || !userId ? 'Edit My Profile' : 'Edit Profile'} showBack />
                <IonContent className="am-content" fullscreen>
                    <main className="edit-profile__scroll">
                        <div className="user-profile__empty">User profile not found.</div>
                    </main>
                </IonContent>
                <AppFooter />
            </IonPage>
        );
    }

    return (
        <IonPage className="am-page edit-profile-page">
            <AppHeader title={headerTitle} showBack hideAvatar />
            <IonContent className="am-content" fullscreen>
                <main className="edit-profile__scroll">
                    <section className="edit-profile__hero">
                        <label className="edit-profile__photo-shell">
                            <input type="file" accept="image/*" onChange={handleProfileFileChange} />
                            <UserAvatar
                                size="xl"
                                className="edit-profile__photo"
                                name={values.display_name || profile.display_name}
                                src={values.profile_picture_url || profile.profile_picture_url}
                            />
                            <span>
                                <IonIcon icon={person} aria-hidden="true" />
                            </span>
                        </label>
                        <h1>{values.display_name || profile.display_name}</h1>
                        <p>{getProfileIdLabel(profile)}: {getProfileId(profile)}</p>
                    </section>

                    <section className="edit-profile__section">
                        <h2>
                            <IonIcon icon={person} aria-hidden="true" />
                            Personal Information
                        </h2>
                        <DesignInput name="display_name" label={profile.type === 'student' ? 'Student Name' : 'Full Name'} value={values.display_name} onChange={updateValue('display_name')} placeholder="Meera Singh" />
                        {profile.type !== 'student' && (
                            <>
                                <DesignInput name="email" label="Email" type="email" value={values.email} onChange={updateValue('email')} placeholder="meera.singh@school.in" />
                                <DesignInput name="phone" label="Phone" type="tel" value={values.phone} onChange={updateValue('phone')} placeholder="+91 98765 01234" />
                            </>
                        )}
                    </section>

                    {(profile.type === 'academy' || profile.type === 'admin') && (
                        <section className="edit-profile__section">
                            <h2>
                                <IonIcon icon={briefcase} aria-hidden="true" />
                                Account Details
                            </h2>
                            <DesignSelect name="department" label="Department" value={values.department} onChange={updateValue('department')} options={departmentOptions} />
                            <DesignInput name="designation" label="Role Title" value={values.designation} onChange={updateValue('designation')} placeholder="Academy Owner" />
                            {profile.type === 'admin' && (
                                <DesignInput name="joining_date" label="Joining Date" value={values.joining_date} onChange={updateValue('joining_date')} placeholder="15/06/2022" suffixIcon={calendarClear} />
                            )}
                        </section>
                    )}

                    {profile.type === 'teacher' && (
                        <section className="edit-profile__section">
                            <h2>
                                <IonIcon icon={briefcase} aria-hidden="true" />
                                Professional Details
                            </h2>
                            <DesignSelect name="department" label="Department" value={values.department} onChange={updateValue('department')} options={departmentOptions} />
                            <DesignInput name="designation" label="Designation" value={values.designation} onChange={updateValue('designation')} placeholder="HOD Science" />
                            <DesignInput name="joining_date" label="Joining Date" value={values.joining_date} onChange={updateValue('joining_date')} placeholder="15/06/2022" suffixIcon={calendarClear} />
                        </section>
                    )}

                    {profile.type === 'parent' && (
                        <section className="edit-profile__section">
                            <h2>
                                <IonIcon icon={briefcase} aria-hidden="true" />
                                Parent Details
                            </h2>
                            <DesignInput name="relationship" label="Relationship" value={profile.relationship || 'Guardian'} onChange={() => undefined} disabled />
                            <DesignInput name="address" label="Address" value={values.address} onChange={updateValue('address')} placeholder="Complete address" multiline rows={3} />
                        </section>
                    )}

                    {profile.type === 'student' && (
                        <section className="edit-profile__section">
                            <h2>
                                <IonIcon icon={briefcase} aria-hidden="true" />
                                Academic Details
                            </h2>
                            <DesignInput name="class_name" label="Class" value={profile.class_name ? `Class ${profile.class_name}` : 'Not assigned'} onChange={() => undefined} disabled />
                            <DesignInput name="class_section" label="Section" value={profile.class_section || 'Not assigned'} onChange={() => undefined} disabled />
                            <DesignInput name="academic_year" label="Academic Year" value={profile.academic_year || 'Not set'} onChange={() => undefined} disabled />
                            <DesignInput name="joining_date" label="Admission Date" value={values.joining_date} onChange={updateValue('joining_date')} placeholder="15/06/2022" suffixIcon={calendarClear} />
                        </section>
                    )}

                    {noticeCopy && (
                        <FormNotice tone="info" title={noticeCopy.title} className="edit-profile__notice">
                            {noticeCopy.body}
                        </FormNotice>
                    )}
                </main>

                <IonToast
                    isOpen={!!toastMsg}
                    message={toastMsg || ''}
                    duration={1800}
                    onDidDismiss={() => setToastMsg(null)}
                />
            </IonContent>

            <IonFooter className="app-action-footer">
                <div className="app-action-footer__bar edit-profile__footer">
                    <IonButton
                        className="am-primary-button app-action-footer__submit"
                        expand="block"
                        disabled={isLoading}
                        onClick={handleSave}
                    >
                        {isLoading ? (
                            <>
                                <IonSpinner name="crescent" />
                                Saving...
                            </>
                        ) : (
                            <>
                                Save Changes
                                <IonIcon icon={checkmarkCircle} aria-hidden="true" />
                            </>
                        )}
                    </IonButton>
                </div>
            </IonFooter>
        </IonPage>
    );
};

export default EditUserProfilePage;
