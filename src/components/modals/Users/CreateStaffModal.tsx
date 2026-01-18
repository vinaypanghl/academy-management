import React from 'react';
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonSpinner,
} from '@ionic/react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import InputField from '../../fields/FormField';
import { useCreateUserMutation } from '../../../redux/api/api';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    role: 'admin' | 'teacher';
}

interface FormValues {
    display_name: string;
    email?: string;
    phone?: string;
    password: string;
}

const COUNTRY_CODE = '+91';

const CreateStaffModal: React.FC<Props> = ({ isOpen, onClose, role }) => {
    const [createUser, { isLoading }] = useCreateUserMutation();

    const title = role === 'admin' ? 'Create Admin' : 'Create Teacher';

    const initialValues: FormValues = {
        display_name: '',
        email: '',
        phone: COUNTRY_CODE,
        password: '',
    };

    const validationSchema = Yup.object({
        display_name: Yup.string().optional(),

        email: Yup.string()
            .email('Invalid email format')
            .optional(),

        phone: Yup.string()
            .nullable()
            .test(
                'phone-format',
                'Enter valid phone with country code',
                (val) => !val || /^\+\d{10,15}$/.test(val)
            ),

        password: Yup.string()
            .min(6, 'Minimum 6 characters')
            .required('Password is required'),
    }).test(
        'email-or-phone',
        'Either email or phone is required',
        (values) => {
            return Boolean(values.email || values.phone);
        }
    );

    const handleSubmit = async (
        values: FormValues,
        { setSubmitting, setErrors, resetForm }: any
    ) => {
        try {
            await createUser({
                role,
                display_name: values.display_name || undefined,
                email: values.email || undefined,
                phone: values.phone || undefined,
                password: values.password,
            }).unwrap();

            resetForm();
            onClose();
        } catch (err: any) {
            const msg = err?.data?.error || 'Failed to create user';

            if (msg.toLowerCase().includes('phone')) {
                setErrors({ phone: msg });
            } else if (msg.toLowerCase().includes('email')) {
                setErrors({ email: msg });
            } else if (msg.toLowerCase().includes('password')) {
                setErrors({ password: msg });
            } else {
                setErrors({ display_name: msg });
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{title}</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding">
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, setFieldValue }) => (
                        <Form>
                            <IonGrid>
                                <IonRow>
                                    <IonCol size="12">
                                        <InputField
                                            name="display_name"
                                            label="Display Name (optional)"
                                            placeholder="Full name"
                                        />
                                    </IonCol>

                                    <IonCol size="12">
                                        <InputField
                                            name="email"
                                            label="Email (optional)"
                                            type="email"
                                            placeholder="user@email.com"
                                        />
                                    </IonCol>

                                    <IonCol size="12">
                                        <InputField
                                            name="phone"
                                            label="Phone (optional)"
                                            type="tel"
                                            placeholder="+91XXXXXXXXXX"
                                            value={values.phone}
                                            onIonChange={(e) => {
                                                let val = e.detail.value || '';
                                                if (val && !val.startsWith('+')) {
                                                    val = COUNTRY_CODE + val.replace(/\D/g, '');
                                                }
                                                setFieldValue('phone', val);
                                            }}
                                        />
                                    </IonCol>

                                    <IonCol size="12">
                                        <InputField
                                            name="password"
                                            label="Password"
                                            type="password"
                                            placeholder="Enter password"
                                        />
                                    </IonCol>
                                </IonRow>

                                <IonRow className="ion-margin-top">
                                    <IonCol size="6">
                                        <IonButton expand="block" color="medium" onClick={onClose}>
                                            Cancel
                                        </IonButton>
                                    </IonCol>
                                    <IonCol size="6">
                                        <IonButton
                                            expand="block"
                                            type="submit"
                                            color="primary"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? <IonSpinner name="dots" /> : 'Create'}
                                        </IonButton>
                                    </IonCol>
                                </IonRow>
                            </IonGrid>
                        </Form>
                    )}
                </Formik>
            </IonContent>
        </IonModal>
    );
};

export default CreateStaffModal;
