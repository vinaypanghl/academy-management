import React, { useMemo, useState } from 'react';
import {
    IonButton,
    IonContent,
    IonFooter,
    IonIcon,
    IonPage,
    IonSpinner,
    IonToast,
} from '@ionic/react';
import { closeOutline, personAdd, shieldCheckmark } from 'ionicons/icons';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useHistory } from 'react-router-dom';
import AppHeader from '../../components/layout/AppHeader';
import { DesignInput, FormNotice } from '../../components/ui/DesignField';
import { useCreateUserMutation } from '../../redux/api/api';
import './CreateStaffPage.scss';

interface CreateStaffPageProps {
    role: 'admin' | 'teacher';
}

interface StaffValues {
    display_name: string;
    email: string;
    phone: string;
}

type StaffErrors = Partial<Record<keyof StaffValues | 'contact', string>>;

const emptyValues: StaffValues = {
    display_name: '',
    email: '',
    phone: '',
};

const DEFAULT_TEMP_PASSWORD = '123456';

const getErrorMessage = (error: unknown) => {
    const queryError = error as FetchBaseQueryError & { data?: { error?: string; message?: string } };

    if (queryError?.data?.error) return queryError.data.error;
    if (queryError?.data?.message) return queryError.data.message;
    return 'Unable to create this account right now.';
};

const normalizePhone = (phone: string) => {
    const trimmed = phone.trim();

    if (!trimmed) return undefined;
    if (trimmed.startsWith('+')) return trimmed.replace(/[^\d+]/g, '');

    const digits = trimmed.replace(/\D/g, '');
    return digits ? `+91${digits}` : undefined;
};

const CreateStaffPage: React.FC<CreateStaffPageProps> = ({ role }) => {
    const history = useHistory();
    const [createUser, { isLoading }] = useCreateUserMutation();
    const [values, setValues] = useState<StaffValues>(emptyValues);
    const [errors, setErrors] = useState<StaffErrors>({});
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const title = role === 'admin' ? 'Create Admin' : 'Create Teacher';

    const pageCopy = useMemo(() => (
        role === 'teacher'
            ? {
                headline: 'Teacher Identity',
                body: 'Set up professional credentials for your staff.',
                emailPlaceholder: 'e.g. meera.singh@school.in',
                namePlaceholder: 'e.g. Meera Singh',
                phonePlaceholder: '98765 01234',
            }
            : {
                headline: 'Admin Identity',
                body: 'Create an operations account for your institution.',
                emailPlaceholder: 'aditya@indubal.edu.in',
                namePlaceholder: 'Aditya Sharma',
                phonePlaceholder: '+91 XXX XXX XXX',
            }
    ), [role]);

    const updateValue = (field: keyof StaffValues) => (value: string) => {
        setValues((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined, contact: undefined }));
    };

    const validate = () => {
        const nextErrors: StaffErrors = {};
        const phone = normalizePhone(values.phone);
        const email = values.email.trim();

        if (!email && !phone) {
            nextErrors.contact = 'Either email or phone is required to create an account.';
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            nextErrors.email = 'Enter a valid email address.';
        }

        if (phone && !/^\+\d{10,15}$/.test(phone)) {
            nextErrors.phone = 'Enter a valid phone number with country code.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            const result = await createUser({
                role,
                display_name: values.display_name.trim() || undefined,
                email: values.email.trim() || undefined,
                phone: normalizePhone(values.phone),
                password: DEFAULT_TEMP_PASSWORD,
            }).unwrap();

            setToastMsg(result?.message || `${role === 'admin' ? 'Admin' : 'Teacher'} created successfully`);
            setValues(emptyValues);
            window.setTimeout(() => history.push('/academy-dashboard'), 700);
        } catch (error) {
            const message = getErrorMessage(error);
            setToastMsg(message);

            if (message.toLowerCase().includes('phone')) {
                setErrors((current) => ({ ...current, phone: message }));
            } else if (message.toLowerCase().includes('email')) {
                setErrors((current) => ({ ...current, email: message }));
            } else {
                setErrors((current) => ({ ...current, contact: message }));
            }
        }
    };

    return (
        <IonPage className={`am-page staff-create-page staff-create-page--${role}`}>
            <AppHeader title={title} showBack hideAvatar />
            <IonContent className="am-content staff-create-content" fullscreen>
                <main className="staff-create__scroll">
                    {role === 'teacher' && (
                        <section className="staff-create__identity">
                            <span>
                                <IonIcon icon={personAdd} aria-hidden="true" />
                            </span>
                            <div>
                                <h1>{pageCopy.headline}</h1>
                                <p>{pageCopy.body}</p>
                            </div>
                        </section>
                    )}

                    <form className="staff-create__form" onSubmit={(event) => event.preventDefault()} noValidate>
                        <DesignInput
                            name="display_name"
                            label="Display Name"
                            optional
                            value={values.display_name}
                            onChange={updateValue('display_name')}
                            placeholder={pageCopy.namePlaceholder}
                        />

                        <DesignInput
                            name="email"
                            label="Email"
                            optional
                            type="email"
                            value={values.email}
                            onChange={updateValue('email')}
                            placeholder={pageCopy.emailPlaceholder}
                            error={errors.email}
                        />

                        <DesignInput
                            name="phone"
                            label="Phone"
                            optional
                            type="tel"
                            value={values.phone}
                            onChange={updateValue('phone')}
                            placeholder={pageCopy.phonePlaceholder}
                            prefix={role === 'teacher' ? '+91' : undefined}
                            error={errors.phone}
                        />

                        {errors.contact && (
                            <FormNotice tone="warning" className="staff-create__contact-alert">
                                {errors.contact}
                            </FormNotice>
                        )}

                        <FormNotice tone="info" title="Temporary Password" className="staff-create__password-note">
                            This account will be created with the default password 123456.
                        </FormNotice>

                        {role === 'admin' ? (
                            <div className="staff-create__portrait" aria-hidden="true">
                                <img src="/assets/academy-logo.png" alt="" />
                            </div>
                        ) : (
                            <FormNotice tone="info" title="Security Note" className="staff-create__security-note">
                                Once created, the teacher will receive an invitation to log in. Ensure the contact information is accurate to prevent access issues.
                            </FormNotice>
                        )}
                    </form>
                </main>

                <IonToast
                    isOpen={!!toastMsg}
                    message={toastMsg || ''}
                    duration={2200}
                    onDidDismiss={() => setToastMsg(null)}
                />
            </IonContent>

            <IonFooter className="app-action-footer">
                <div className="app-action-footer__bar">
                    <button
                        type="button"
                        className="app-action-footer__cancel"
                        onClick={() => history.push('/academy-dashboard')}
                    >
                        <IonIcon icon={closeOutline} aria-hidden="true" />
                        Cancel
                    </button>

                    <IonButton
                        className="am-primary-button app-action-footer__submit"
                        expand="block"
                        disabled={isLoading}
                        onClick={handleSubmit}
                    >
                        {isLoading && <IonSpinner name="crescent" />}
                        {isLoading ? 'Creating...' : (
                            <>
                                <IonIcon icon={shieldCheckmark} aria-hidden="true" />
                                Create {role === 'admin' ? 'Admin' : 'Teacher'}
                            </>
                        )}
                    </IonButton>
                </div>
            </IonFooter>
        </IonPage>
    );
};

export default CreateStaffPage;
