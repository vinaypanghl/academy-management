import React, { useCallback, useEffect, useState } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/react';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { loginUser } from '../../redux/slices/authSlice';
import FormField from '../../components/fields/FormField';
import Spinner from '../../components/loaders/Spinner';
import Toast from '../../components/alerts/Toast';
import { useTypedDispatch, useTypedSelector } from '../../redux/store';
import Button from '../../components/buttons/Button';
import { useHistory } from 'react-router';

interface LoginValues {
    credential: string;
    password: string;
}

const LoginSchema = Yup.object({
    credential: Yup.string().required('Email or phone is required'),
    password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
});

const LoginPage: React.FC = () => {
    const { loading, error, role, user } = useTypedSelector((state) => state.auth);
    const dispatch = useTypedDispatch();
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const history = useHistory();
    const [shownError, setShownError] = useState<string | null>(null);

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

    console.log(user)

    const handleSubmit = useCallback(
        async (values: LoginValues) => {
          setToastMsg(null);
          await dispatch(loginUser(values));
        },
        [dispatch]
    );      

    return (
        <IonPage id='main-content'>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Login</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <Formik
                    initialValues={{ credential: '', password: '' }}
                    validationSchema={LoginSchema}
                    onSubmit={handleSubmit}
                >
                    {({ handleSubmit }) => (
                        <form onSubmit={handleSubmit} noValidate>
                            <FormField
                                name="credential"
                                label="Email (for academy) or Phone"
                                placeholder="Enter email (academy) or phone"
                            />
                            <FormField name="password" label="Password" type="password" placeholder="Enter password" />
                            <Button type="submit" disabled={loading}>
                                {loading ? <Spinner /> : 'Login'}
                            </Button>
                        </form>
                    )}
                </Formik>
                {toastMsg && <Toast message={toastMsg} onDismiss={() => setToastMsg(null)} isOpen={!!toastMsg} />}
            </IonContent>
        </IonPage>
    );
};

export default LoginPage;
