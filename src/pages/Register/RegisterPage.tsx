import React, { useEffect } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonText } from '@ionic/react';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { useRegisterAcademyMutation } from '../../redux/api/api';
import FormField from '../../components/fields/FormField';
import Button from '../../components/buttons/Button';
import Spinner from '../../components/loaders/Spinner';
import Toast from '../../components/alerts/Toast';
import { useHistory } from 'react-router';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const RegisterSchema = Yup.object({
    academy_name: Yup.string().required('Academy name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6).required('Password is required'),
    phone: Yup.string().min(10).required('Contact number is required'),
    address: Yup.string(),
    city: Yup.string(),
    state: Yup.string(),
    country: Yup.string(),
    pincode: Yup.string(),
    website: Yup.string().url('Must be a valid URL'),
    logo_url: Yup.string().url('Must be a valid URL'),
});

function isError(result: any): result is { error: { message: string } } {
    return 'error' in result && result.error !== undefined && typeof result.error.message === 'string';
}

const RegisterPage: React.FC = () => {
    const [registerAcademy, { isLoading }] = useRegisterAcademyMutation();
    const [toastMsg, setToastMsg] = React.useState<string | null>(null);
    const history = useHistory();

    return (
        <IonPage id='main-content'>
            <IonHeader><IonToolbar><IonTitle>Register Academy</IonTitle></IonToolbar></IonHeader>
            <IonContent className="ion-padding">
                <Formik
                    initialValues={{
                        academy_name: 'indubal niketan school',
                        email: 'vcvinay.choudhry@gmail.com',
                        password: '123456',
                        phone: '1234567890',
                        address: 'near new temple',
                        city: 'chirawa',
                        state: 'rajasthan',
                        country: 'india',
                        pincode: '123456',
                        website: '',
                        logo_url: '',
                    }}
                    validationSchema={RegisterSchema}
                    onSubmit={async (values, { resetForm, setStatus }) => {
                        setStatus(null);

                        const result = await registerAcademy(values);

                        if ("error" in result) {
                            const err = result.error as FetchBaseQueryError & { message?: string };
                            setStatus(err.message || "Registration failed");
                            return;
                        }

                        const response = result.data as { success: boolean; message?: string };

                        if (response.success) {
                            setToastMsg("Registration successful! You can now log in.");
                            resetForm();
                            setTimeout(() => {
                                setToastMsg(null);
                                history.push("/login");
                            }, 2000);
                        } else {
                            setStatus(response?.message || "Registration failed");
                            return;
                        }
                    }}
                >
                    {({ handleSubmit, status }) => (
                        <form onSubmit={handleSubmit} noValidate>
                            <FormField name="academy_name" label="Academy Name" placeholder="Academy Name" />
                            <FormField name="email" label="Email" type="email" placeholder="Email" />
                            <FormField name="password" label="Password" type="password" placeholder="Password" />
                            <FormField name="phone" label="Contact Number" placeholder="Contact Number" type="tel" />
                            <FormField name="address" label="Address" placeholder="Address" />
                            <FormField name="city" label="City" placeholder="City" />
                            <FormField name="state" label="State" placeholder="State" />
                            <FormField name="country" label="Country" placeholder="Country" />
                            <FormField name="pincode" label="Pincode" placeholder="Pincode" />
                            <FormField name="website" label="Website" placeholder="Website" type="url" />
                            <FormField name="logo_url" label="Logo URL" placeholder="Logo URL" type="url" />
                            {status && (
                                <IonText color="danger" className="ion-text-center">
                                    <p style={{ marginTop: '8px', marginBottom: '8px' }}>{status}</p>
                                </IonText>
                            )}
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Spinner /> : 'Register'}
                            </Button>
                        </form>
                    )}
                </Formik>
                {toastMsg && <Toast message={toastMsg} onDismiss={() => setToastMsg(null)} isOpen={!!toastMsg} />}
            </IonContent>
        </IonPage>
    );
};

export default RegisterPage;
