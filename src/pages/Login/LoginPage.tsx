import React, { useCallback, useEffect, useState } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonAvatar, IonIcon, IonText } from '@ionic/react';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { loginUser } from '../../redux/slices/authSlice';
import FormField from '../../components/fields/FormField';
import Spinner from '../../components/loaders/Spinner';
import Toast from '../../components/alerts/Toast';
import { useTypedDispatch, useTypedSelector } from '../../redux/store';
import Button from '../../components/buttons/Button';
import { useHistory } from 'react-router';
import { arrowBackOutline, atOutline, closeOutline, lockClosed, warning } from 'ionicons/icons';
import './Login.scss';

interface LoginValues {
    credential: string;
    password: string;
}

const LoginSchema = Yup.object({
    credential: Yup.string().required('Email or phone is required'),
    password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
});

const invalidCredentialText = 'Please check your email and password and try again.';

const LoginPage: React.FC = () => {
    const { loading, error, role, user } = useTypedSelector((state) => state.auth);
    const dispatch = useTypedDispatch();
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const [dismissedError, setDismissedError] = useState<string | null>(null);
    const history = useHistory();
    const [shownError, setShownError] = useState<string | null>(null);

    const showLoginError = Boolean(error && dismissedError !== error);
    const loginErrorText = error?.toLowerCase().includes('invalid') ? invalidCredentialText : error || invalidCredentialText;

    const handleBack = () => {
        if (history.length > 1) {
            history.goBack();
            return;
        }

        history.push('/');
    };

    useEffect(() => {
        if (error && error !== shownError) {
          setToastMsg(error);
          setShownError(error);
        }
    }, [error, shownError]);

    useEffect(() => {
        if (loading) return;
        if (user && role) {
            switch (role) {
                case 'academy':
                    history.push('/academy-dashboard');
                    break;
                case 'admin':
                    history.push('/academy-dashboard');
                    break;
                case 'teacher':
                    history.push('/teacher-dashboard');
                    break;
                case 'parent':
                    history.push('/parent-dashboard');
                    break;
                default:
                    history.push('/');
            }
        }
    }, [user, role, loading, history]);

    const handleSubmit = useCallback(
        async (values: LoginValues) => {
            setToastMsg(null);
            setDismissedError(null);
            await dispatch(loginUser(values));
        },
        [dispatch]
    );      

    return (
        <IonPage id="main-content" className="login-page">
            <IonHeader className="register-header">
                <IonToolbar className="register-toolbar">
                    <IonButtons slot="start">
                        <IonButton fill="clear" className="register-back-button" onClick={handleBack} aria-label="Go back">
                            <IonIcon icon={arrowBackOutline} />
                        </IonButton>
                    </IonButtons>
                    <IonTitle>EduCore Login</IonTitle>
                    <IonAvatar slot="end" className="register-avatar">
                        <img src="/assets/academy-logo.png" alt="Academy" />
                    </IonAvatar>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className="login-content">
                <main className="login-shell">
                    <header className="login-hero">
                        <h1>Welcome Back</h1>
                        <p>Smart School. Smart Parents.</p>
                    </header>
                    <Formik
                        initialValues={{ credential: '', password: '' }}
                        validationSchema={LoginSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ handleSubmit }) => (
                            <form className="login-card" onSubmit={handleSubmit} noValidate>
                                <FormField
                                    name="credential"
                                    label="Email (for academy) or Phone"
                                    labelPlacement="outside"
                                    placeholder="principal@stxavier.edu"
                                    suffix={<IonIcon icon={atOutline} aria-hidden="true" />}
                                    className="login-field"
                                />
                                <FormField
                                    name="password"
                                    label="Password"
                                    labelPlacement="outside"
                                    type="password"
                                    placeholder="••••••••"
                                    suffix={<IonIcon icon={lockClosed} aria-hidden="true" />}
                                    showPasswordToggle={false}
                                    className="login-field"
                                    labelAction={
                                        <button
                                            type="button"
                                            className="login-label-link"
                                            onClick={() => setToastMsg('Please contact your academy admin to reset your password.')}
                                        >
                                            Forgot?
                                        </button>
                                    }
                                />
                                <Button type="submit" disabled={loading} className="login-submit">
                                    <span className="login-submit-content">
                                        {loading && <Spinner color="light" name="crescent" size="small" />}
                                        <span>Login</span>
                                    </span>
                                </Button>

                                {showLoginError && (
                                    <IonText color="danger" className="login-alert" aria-live="polite">
                                        <span className="login-alert-bar" aria-hidden="true"></span>
                                        <IonIcon icon={warning} aria-hidden="true" />
                                        <span className="login-alert-copy">
                                            <strong>Invalid Credentials</strong>
                                            <span>{loginErrorText}</span>
                                        </span>
                                        <button
                                            type="button"
                                            className="login-alert-close"
                                            onClick={() => setDismissedError(error)}
                                            aria-label="Dismiss login error"
                                        >
                                            <IonIcon icon={closeOutline} aria-hidden="true" />
                                        </button>
                                    </IonText>
                                )}
                            </form>
                        )}
                    </Formik>

                    <p className="login-contact">
                        Don't have an account?{' '}
                        <button type="button" onClick={() => setToastMsg('Please contact your academy administrator for an account.')}>
                            Contact Admin
                        </button>
                    </p>
                    {toastMsg && <Toast message={toastMsg} onDismiss={() => setToastMsg(null)} isOpen={!!toastMsg} />}
                </main>
            </IonContent>
        </IonPage>
    );
};

export default LoginPage;
