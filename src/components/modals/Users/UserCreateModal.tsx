import React from 'react';
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonSelect,
    IonSelectOption,
    IonRow,
    IonCol,
    IonGrid,
    IonSpinner,
} from '@ionic/react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { CreateUserInput } from '../../../types';
import { useCreateUserMutation } from '../../../redux/api/api';
import { Role } from '../../../types/User';
import InputField from '../../fields/FormField';
import SelectField from '../../fields/SelectField';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUserRole?: Role | null;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, currentUserRole }) => {
    const [createUser, { isLoading }] = useCreateUserMutation();

    // Validation schema
    const validationSchema = Yup.object({
        display_name: Yup.string().optional(), // optional now
        phone: Yup.string().required('Phone number is required'),
        password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
        role: Yup.mixed<Role>().oneOf(['admin', 'teacher', 'parent']).required('Role is required'),
    });

    const initialValues: CreateUserInput = {
        display_name: '',
        phone: '',
        password: '',
        role: 'admin',
    };

    const handleSubmit = async (values: CreateUserInput, { resetForm }: any) => {
        try {
            const res = await createUser(values).unwrap();
            console.log('User created:', res);
            onClose();
            resetForm();
        } catch (err: any) {
            console.error('Failed to create user:', err);
            alert(err?.data?.error || 'Failed to create user');
        }
    };

    // Dynamic role options based on currentUserRole
    const roleOptions = React.useMemo(() => {
        if (currentUserRole === 'academy') {
            return [
                { value: 'admin', label: 'Admin' },
                { value: 'teacher', label: 'Teacher' },
            ];
        } else if (currentUserRole === 'admin') {
            return [
                { value: 'teacher', label: 'Teacher' },
            ];
        } else {
            return [];
        }
    }, [currentUserRole]);

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Create User</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding">
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, setFieldValue, handleSubmit }) => (
                        <Form onSubmit={handleSubmit}>
                            <IonGrid>
                                <IonRow>
                                    <IonCol size="12">
                                        <InputField
                                            name="display_name"
                                            label="Display Name (optional)"
                                            placeholder="Enter full name or leave blank"
                                        />
                                    </IonCol>

                                    <IonCol size="12">
                                        <SelectField
                                            name="role"
                                            label="Role"
                                            placeholder="Select Role"
                                            options={roleOptions}
                                            value={values.role}
                                            onIonChange={(e) => setFieldValue('role', e.detail.value)}
                                        />
                                    </IonCol>

                                    <IonCol size="12">
                                        <InputField
                                            name="phone"
                                            label="Phone"
                                            type="tel"
                                            placeholder="Enter phone number"
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

                                <IonRow className="ion-justify-content-end ion-margin-top">
                                    <IonCol size="6">
                                        <IonButton expand="block" color="medium" onClick={onClose}>
                                            Cancel
                                        </IonButton>
                                    </IonCol>
                                    <IonCol size="6">
                                        <IonButton expand="block" type="submit" color="primary" disabled={isLoading}>
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

export default CreateUserModal;
