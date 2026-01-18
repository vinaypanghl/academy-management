import React from 'react';
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonText,
    IonFooter,
} from '@ionic/react';
import { FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import FormField from '../../fields/FormField';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (classData: Partial<any>) => void;
    isSubmitting?: boolean;
}

const ClassSchema = Yup.object({
    class_name: Yup.string().required('Class name is required'),
    section: Yup.string(),
    academic_year: Yup.string().required('Academic year is required'),
});

const CreateClassModal: React.FC<Props> = ({ isOpen, onClose, onCreate, isSubmitting }) => {
    const formik = useFormik({
        initialValues: {
            class_name: '',
            section: '',
            academic_year: new Date().getFullYear().toString(),
        },
        validationSchema: ClassSchema,
        onSubmit: async (values) => {
            await onCreate(values);
            formik.resetForm();
        },
    });

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Create New Class</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding">
                <FormikProvider value={formik}>
                    <form onSubmit={formik.handleSubmit} className="ion-padding">
                        {/* Class Name */}
                        <FormField
                            name="class_name"
                            label="Class Name"
                            placeholder="Class Name"
                            value={formik.values.class_name}
                            onIonChange={(e) => formik.setFieldValue('class_name', e.detail.value)}
                        />
                        <FormField
                            name="section"
                            label="Class Section"
                            placeholder="Class Section"
                            value={formik.values.section}
                            onIonChange={(e) => formik.setFieldValue('section', e.detail.value)}
                        />
                        <FormField
                            name="academic_year"
                            label="Academic Year"
                            placeholder="Academic Year"
                            value={formik.values.academic_year}
                            onIonChange={(e) => formik.setFieldValue('academic_year', e.detail.value)}
                        />
                    </form>
                </FormikProvider>
            </IonContent>

            <IonFooter className="ion-padding">
                <IonButton
                    type="submit"
                    expand="block"
                    onClick={() => formik.handleSubmit()}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Creating...' : 'Create Class'}
                </IonButton>
                <IonButton color="medium" expand="block" onClick={onClose}>
                    Cancel
                </IonButton>
            </IonFooter>
        </IonModal>
    );
};

export default CreateClassModal;
