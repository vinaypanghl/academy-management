import React, { useEffect, useState } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonFooter, IonButton, IonLabel } from '@ionic/react';
import { FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import { ClassSection, CreateStudentInput, ParentInput, Student } from '../../../types';
import FormField from '../../fields/FormField';
import SelectField from '../../fields/SelectField';
import ParentFields from './ParentSection';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (studentData: CreateStudentInput) => Promise<void>;
    classes: ClassSection[];
    isSubmitting?: boolean;
}

const StudentSchema = Yup.object({
    first_name: Yup.string().required('Required'),
    last_name: Yup.string(),
    date_of_birth: Yup.string().required('Required'),
    registration_no: Yup.string().required('Required'),
    aadhar_no: Yup.string(),
    roll_no: Yup.string(),
    class_name: Yup.string().required('Required'),
    class_section: Yup.string(),
    academic_year: Yup.string().required('Required'),
});

function convertToISODate(dateStr: string): string {
    if (!dateStr.includes('/')) return dateStr;
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

const CreateStudentModal: React.FC<Props> = ({ isOpen, onClose, onCreate, classes, isSubmitting }) => {
    const [selectedParent, setSelectedParent] = useState<ParentInput | null>(null);
    const [originalParent, setOriginalParent] = useState<ParentInput | null>(null);

    const formik = useFormik({
        initialValues: {
            first_name: 'devin',
            last_name: 'panghal',
            date_of_birth: '13/10/1993',
            registration_no: '4643534',
            aadhar_no: '4645654645',
            roll_no: '01',
            class_name: '1',
            class_section: '',
            academic_year: new Date().getFullYear().toString(),
        },
        validationSchema: StudentSchema,
        onSubmit: async (values, { setFieldError, resetForm }) => {
            try {
                const [className, section] = values.class_name.split('__');
                const payload: CreateStudentInput = {
                    first_name: values.first_name,
                    last_name: values.last_name || null,
                    date_of_birth: convertToISODate(values.date_of_birth),
                    registration_no: values.registration_no,
                    aadhar_no: values.aadhar_no || null,
                    roll_no: values.roll_no || null,
                    class_name: className,
                    class_section: section !== 'NA' ? section : null,
                    academic_year: values.academic_year,
                };

                payload.relationship = selectedParent?.relationship || 'Guardian';

                if (selectedParent) {
                    if (selectedParent.id) {
                        // Existing parent selected
                        payload.parent_id = selectedParent.id;
                
                        // Only include updated fields if something changed
                        const updatedFields: Partial<ParentInput> = {};
                        ['display_name', 'phone', 'email', 'address'].forEach(key => {
                            if (
                                originalParent &&
                                selectedParent[key as keyof ParentInput] !== originalParent[key as keyof ParentInput]
                            ) {
                                updatedFields[key as keyof ParentInput] = selectedParent[key as keyof ParentInput];
                            }
                        });
                
                        if (Object.keys(updatedFields).length > 0) {
                            payload.updated_parent = { ...updatedFields, id: selectedParent.id };
                        }
                    } else {
                        // New parent
                        payload.new_parents = [
                            {
                                display_name: selectedParent.display_name || '',
                                phone: selectedParent.phone || '',
                                email: selectedParent.email || '',
                                address: selectedParent.address || '',
                                relationship: selectedParent.relationship || 'Guardian',
                            },
                        ];
                    }
                }

                await onCreate(payload);
                resetForm();
                setSelectedParent(null);
                setOriginalParent(null);
                onClose();
            } catch (err: any) {
                const errorMessage =
                    err?.data?.error || err?.message || 'Failed to create student';

                if (errorMessage.includes('registration number')) {
                    setFieldError(
                        'registration_no',
                        'Student with this registration number already exists'
                    );
                } else if (errorMessage.includes('Aadhar')) {
                    setFieldError(
                        'aadhar_no',
                        'A student with this Aadhar number already exists'
                    );
                } else {
                    setFieldError('first_name', errorMessage);
                }
            }
        },
    });

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Create Student</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding">
                <FormikProvider value={formik}>
                    <form onSubmit={formik.handleSubmit}>
                        <FormField
                            name="first_name"
                            label="First Name"
                            placeholder="Enter first name"
                            value={formik.values.first_name}
                            onIonChange={e => formik.setFieldValue('first_name', e.detail.value)}
                        />
                        <FormField
                            name="last_name"
                            label="Last Name"
                            placeholder="Enter last name"
                            value={formik.values.last_name}
                            onIonChange={e => formik.setFieldValue('last_name', e.detail.value)}
                        />
                        <FormField
                            name="date_of_birth"
                            label="Date of Birth"
                            placeholder="DD/MM/YYYY"
                            value={formik.values.date_of_birth}
                            onIonChange={e => formik.setFieldValue('date_of_birth', e.detail.value)}
                        />
                        <FormField
                            name="registration_no"
                            label="Registration Number"
                            placeholder="Enter registration number"
                            value={formik.values.registration_no}
                            onIonChange={e => formik.setFieldValue('registration_no', e.detail.value)}
                        />
                        <FormField
                            name="aadhar_no"
                            label="Aadhar Number"
                            placeholder="Enter aadhar number"
                            value={formik.values.aadhar_no}
                            onIonChange={e => formik.setFieldValue('aadhar_no', e.detail.value)}
                        />
                        <FormField
                            name="roll_no"
                            label="Roll Number"
                            placeholder="Enter class roll number"
                            value={formik.values.roll_no}
                            onIonChange={e => formik.setFieldValue('roll_no', e.detail.value)}
                        />
                        <SelectField
                            name="class_name"
                            label="Class"
                            placeholder="Select Class"
                            options={classes.map(c => ({
                                value: `${c.class_name}__${c.section ?? 'NA'}`,
                                label: `${c.class_name}${c.section ? ' ' + c.section : ''}`,
                            }))}
                        />
                        <FormField
                            name="class_section"
                            label="Class section"
                            placeholder="Enter class section"
                            value={formik.values.class_section}
                            onIonChange={e => formik.setFieldValue('class_section', e.detail.value)}
                        />
                        <FormField
                            name="academic_year"
                            label="Academic Year"
                            placeholder="Academic Year"
                            value={formik.values.academic_year}
                            onIonChange={e => formik.setFieldValue('academic_year', e.detail.value)}
                        />
                        <ParentFields
                            selectedParent={selectedParent}
                            setSelectedParent={setSelectedParent}
                            setOriginalParent={setOriginalParent}
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
                    {isSubmitting ? 'Creating...' : 'Create Student'}
                </IonButton>
                <IonButton color="medium" expand="block" onClick={onClose}>
                    Cancel
                </IonButton>
            </IonFooter>
        </IonModal>
    );
};

export default CreateStudentModal;