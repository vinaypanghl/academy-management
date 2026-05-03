import React, { useRef, useState } from 'react';
import {
    IonAvatar,
    IonButton,
    IonButtons,
    IonCheckbox,
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonPage,
    IonText,
    IonTitle,
    IonToolbar,
} from '@ionic/react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
    arrowBackOutline,
    arrowForwardOutline,
    barChartOutline,
    calendarOutline,
    globeOutline,
    homeOutline,
    imageOutline,
    locationOutline,
    mailOutline,
    personOutline,
    schoolOutline,
} from 'ionicons/icons';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useHistory } from 'react-router';

import { useRegisterAcademyMutation } from '../../redux/api/api';
import FormField from '../../components/fields/FormField';
import SelectField from '../../components/fields/SelectField';
import SubmitButton from '../../components/buttons/Button';
import Spinner from '../../components/loaders/Spinner';
import Toast from '../../components/alerts/Toast';
import './Register.scss';

interface RegisterValues {
    academy_name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    website: string;
    logo_url: string;
    termsAccepted: boolean;
}

const countries = [
    { value: 'India', label: 'India' },
    { value: 'United States', label: 'United States' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Australia', label: 'Australia' },
];

const initialValues: RegisterValues = {
    academy_name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    website: '',
    logo_url: '',
    termsAccepted: false,
};

const normalizeWebsite = (value?: string) => {
    const trimmedValue = value?.trim() || '';

    if (!trimmedValue) {
        return '';
    }

    return /^https?:\/\//i.test(trimmedValue) ? trimmedValue : `https://${trimmedValue}`;
};

const isOptionalUrl = (value?: string) => {
    const normalizedValue = normalizeWebsite(value);

    if (!normalizedValue) {
        return true;
    }

    try {
        new URL(normalizedValue);
        return true;
    } catch {
        return false;
    }
};

const RegisterSchema = Yup.object({
    academy_name: Yup.string().required('Academy name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[0-9]/, 'Password must include a number')
        .matches(/[^A-Za-z0-9]/, 'Password must include a symbol')
        .required('Password is required'),
    phone: Yup.string()
        .matches(/^[0-9+\-\s()]+$/, 'Enter a valid contact number')
        .min(10, 'Contact number must be at least 10 digits')
        .required('Contact number is required'),
    address: Yup.string(),
    city: Yup.string(),
    state: Yup.string(),
    country: Yup.string().required('Country is required'),
    pincode: Yup.string().matches(/^[0-9\s-]*$/, 'Enter a valid pincode'),
    website: Yup.string().test('is-url', 'Must be a valid URL', isOptionalUrl),
    logo_url: Yup.string(),
    termsAccepted: Yup.boolean().oneOf([true], 'Please accept Terms of Service and Privacy Policy'),
});

const SectionTitle: React.FC<{ icon: string; children: React.ReactNode }> = ({ icon, children }) => (
    <div className="register-section-title">
        <IonIcon icon={icon} aria-hidden="true" />
        <h2>{children}</h2>
    </div>
);

const RegisterPage: React.FC = () => {
    const [registerAcademy, { isLoading }] = useRegisterAcademyMutation();
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const [logoFileName, setLogoFileName] = useState('');
    const logoInputRef = useRef<HTMLInputElement>(null);
    const history = useHistory();

    const handleBack = () => {
        if (history.length > 1) {
            history.goBack();
            return;
        }

        history.push('/');
    };

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setLogoFileName(file?.name || '');
    };

    const clearLogoSelection = () => {
        setLogoFileName('');

        if (logoInputRef.current) {
            logoInputRef.current.value = '';
        }
    };

    return (
        <IonPage id="main-content" className="register-page">
            <IonHeader className="register-header">
                <IonToolbar className="register-toolbar">
                    <IonButtons slot="start">
                        <IonButton fill="clear" className="register-back-button" onClick={handleBack} aria-label="Go back">
                            <IonIcon icon={arrowBackOutline} />
                        </IonButton>
                    </IonButtons>
                    <IonTitle>Register Academy</IonTitle>
                    <IonAvatar slot="end" className="register-avatar">
                        <img src="/assets/academy-logo.png" alt="Academy" />
                    </IonAvatar>
                </IonToolbar>
            </IonHeader>

            <IonContent className="register-content" fullscreen>
                <div className="register-scroll">
                    <p className="register-intro">Empowering academy staff to build the future of education with structural precision.</p>

                    <Formik<RegisterValues>
                        initialValues={initialValues}
                        validationSchema={RegisterSchema}
                        onSubmit={async (values, { resetForm, setStatus }) => {
                            setStatus(null);

                            const payload = {
                                academy_name: values.academy_name.trim(),
                                email: values.email.trim(),
                                password: values.password,
                                phone: values.phone.trim(),
                                address: values.address.trim(),
                                city: values.city.trim(),
                                state: values.state.trim(),
                                country: values.country,
                                pincode: values.pincode.trim(),
                                website: normalizeWebsite(values.website),
                                logo_url: values.logo_url.trim(),
                            };

                            const result = await registerAcademy(payload);

                            if ('error' in result) {
                                const err = result.error as FetchBaseQueryError & { message?: string };
                                setStatus(err.message || 'Registration failed');
                                return;
                            }

                            const response = result.data as { success: boolean; message?: string };

                            if (response.success) {
                                setToastMsg('Registration successful! You can now log in.');
                                resetForm();
                                clearLogoSelection();
                                setTimeout(() => {
                                    setToastMsg(null);
                                    history.push('/login');
                                }, 2000);
                            } else {
                                setStatus(response?.message || 'Registration failed');
                            }
                        }}
                    >
                        {({ errors, handleSubmit, setFieldValue, status, touched, values }) => (
                            <form className="register-form" onSubmit={handleSubmit} noValidate>
                                <section className="register-section">
                                    <SectionTitle icon={schoolOutline}>Academy Details</SectionTitle>
                                    <FormField
                                        name="academy_name"
                                        label="Academy Name"
                                        labelPlacement="outside"
                                        placeholder="e.g. St. Xavier Academy"
                                        required
                                    />

                                    <div className="register-logo-field">
                                        <label className="register-logo-label" htmlFor="academy-logo-upload">
                                            Academy Logo
                                        </label>
                                        <input
                                            ref={logoInputRef}
                                            id="academy-logo-upload"
                                            className="register-logo-input"
                                            type="file"
                                            accept="image/png,image/jpeg"
                                            onChange={handleLogoChange}
                                        />
                                        <label className="register-logo-upload" htmlFor="academy-logo-upload">
                                            <span className="register-logo-icon">
                                                <IonIcon icon={imageOutline} aria-hidden="true" />
                                            </span>
                                            <span className="register-logo-copy">
                                                <span>{logoFileName || 'Upload your high-res logo (PNG, JPG, max 5MB).'}</span>
                                                <strong>Select File</strong>
                                            </span>
                                        </label>
                                    </div>
                                </section>

                                <section className="register-section register-card">
                                    <SectionTitle icon={mailOutline}>Contact Details</SectionTitle>
                                    <FormField
                                        name="email"
                                        label="Official Email"
                                        labelPlacement="outside"
                                        type="email"
                                        placeholder="admin@academy.com"
                                    />
                                    <FormField
                                        name="phone"
                                        label="Contact Number"
                                        labelPlacement="outside"
                                        placeholder="+91 00000 00000"
                                        type="tel"
                                    />
                                    <FormField
                                        name="password"
                                        label="Password"
                                        labelPlacement="outside"
                                        type="password"
                                        placeholder="••••••••"
                                        helperText="Must be at least 8 characters with numbers and symbols."
                                    />
                                </section>

                                <section className="register-section">
                                    <SectionTitle icon={locationOutline}>Address</SectionTitle>
                                    <FormField
                                        name="address"
                                        label="Street Address"
                                        labelPlacement="outside"
                                        placeholder="Building name, Street, Area..."
                                    />
                                    <FormField name="city" label="City" labelPlacement="outside" placeholder="City" />
                                    <FormField name="state" label="State" labelPlacement="outside" placeholder="State" />
                                    <SelectField
                                        name="country"
                                        label="Country"
                                        labelPlacement="outside"
                                        options={countries}
                                    />
                                    <FormField name="pincode" label="Pincode" labelPlacement="outside" placeholder="000 000" />
                                </section>

                                <section className="register-section register-card">
                                    <SectionTitle icon={globeOutline}>Optional Online Presence</SectionTitle>
                                    <FormField
                                        name="website"
                                        label="Website URL"
                                        labelPlacement="outside"
                                        type="url"
                                        placeholder="www.youracademy.com"
                                        prefix="https://"
                                        className="form-field--prefixed"
                                        onIonChange={(event) => {
                                            const websiteValue = event.detail.value || '';
                                            setFieldValue('website', websiteValue.replace(/^https?:\/\//i, ''));
                                        }}
                                    />
                                </section>

                                <div className="register-terms">
                                    <IonCheckbox
                                        checked={values.termsAccepted}
                                        onIonChange={(event) => setFieldValue('termsAccepted', event.detail.checked)}
                                        aria-label="Accept Terms of Service and Privacy Policy"
                                    />
                                    <p>
                                        By clicking Register, you agree to our <span>Terms of Service</span> and{' '}
                                        <span>Privacy Policy</span>. We will use your data to manage your account and institution.
                                    </p>
                                </div>
                                {touched.termsAccepted && errors.termsAccepted && (
                                    <IonText color="danger" className="register-terms-error">
                                        <span>{errors.termsAccepted}</span>
                                    </IonText>
                                )}

                                {status && (
                                    <IonText color="danger" className="register-status" aria-live="polite">
                                        <span>{status}</span>
                                    </IonText>
                                )}

                                <SubmitButton type="submit" disabled={isLoading} className="register-submit primary-btn">
                                    {isLoading ? (
                                        <Spinner />
                                    ) : (
                                        <>
                                            Register
                                            <IonIcon icon={arrowForwardOutline} aria-hidden="true" />
                                        </>
                                    )}
                                </SubmitButton>

                                <p className="register-login-text">
                                    Already have an account?{' '}
                                    <button type="button" onClick={() => history.push('/login')}>
                                        Log in
                                    </button>
                                </p>
                            </form>
                        )}
                    </Formik>
                </div>

                {toastMsg && <Toast message={toastMsg} onDismiss={() => setToastMsg(null)} isOpen={!!toastMsg} />}
            </IonContent>
        </IonPage>
    );
};

export default RegisterPage;
