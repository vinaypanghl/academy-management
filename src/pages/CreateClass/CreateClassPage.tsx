import React, { useState } from 'react';
import {
    IonButton,
    IonContent,
    IonFooter,
    IonIcon,
    IonPage,
    IonSpinner,
    IonToast,
} from '@ionic/react';
import { calendar, closeOutline, informationCircle, school } from 'ionicons/icons';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useHistory } from 'react-router-dom';
import AppHeader from '../../components/layout/AppHeader';
import { DesignInput, FormNotice } from '../../components/ui/DesignField';
import { useCreateClassesMutation } from '../../redux/api/api';
import './CreateClassPage.scss';

interface ClassValues {
    class_name: string;
    section: string;
    academic_year: string;
}

type ClassErrors = Partial<Record<keyof ClassValues | 'form', string>>;

const getErrorMessage = (error: unknown) => {
    const queryError = error as FetchBaseQueryError & { data?: { error?: string; message?: string } };
    return queryError?.data?.error || queryError?.data?.message || 'Unable to create this class right now.';
};

const CreateClassPage: React.FC = () => {
    const history = useHistory();
    const [createClass, { isLoading }] = useCreateClassesMutation();
    const [values, setValues] = useState<ClassValues>({
        class_name: '',
        section: '',
        academic_year: new Date().getFullYear().toString(),
    });
    const [errors, setErrors] = useState<ClassErrors>({});
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    const updateValue = (field: keyof ClassValues) => (value: string) => {
        setValues((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    };

    const validate = () => {
        const nextErrors: ClassErrors = {};

        if (!values.class_name.trim()) nextErrors.class_name = 'Class name is required';
        if (!values.academic_year.trim()) nextErrors.academic_year = 'Academic year is required';

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            const response = await createClass({
                class_name: values.class_name.trim(),
                section: values.section.trim() || undefined,
                academic_year: values.academic_year.trim(),
            }).unwrap();

            setToastMsg(response?.message || 'Class created successfully');
            setValues({
                class_name: '',
                section: '',
                academic_year: new Date().getFullYear().toString(),
            });
            window.setTimeout(() => history.push('/academy-dashboard'), 700);
        } catch (error) {
            const message = getErrorMessage(error);
            setErrors((current) => ({ ...current, form: message }));
            setToastMsg(message);
        }
    };

    return (
        <IonPage className="am-page class-create-page">
            <AppHeader title="Create New Class" showBack hideAvatar />
            <IonContent className="am-content class-create-content" fullscreen>
                <main className="class-create__scroll">
                    <form className="class-create__panel" onSubmit={(event) => event.preventDefault()} noValidate>
                        <DesignInput
                            name="class_name"
                            label="Class Name"
                            value={values.class_name}
                            onChange={updateValue('class_name')}
                            placeholder="e.g., Class 10"
                            error={errors.class_name}
                        />

                        <DesignInput
                            name="section"
                            label="Class Section"
                            value={values.section}
                            onChange={updateValue('section')}
                            placeholder="e.g., A"
                        />

                        <DesignInput
                            name="academic_year"
                            label="Academic Year"
                            value={values.academic_year}
                            onChange={updateValue('academic_year')}
                            suffixIcon={calendar}
                            placeholder="2026"
                            error={errors.academic_year}
                        />

                        {errors.form && (
                            <FormNotice tone="warning">{errors.form}</FormNotice>
                        )}

                        <FormNotice tone="info" title="Pro-tip" className="class-create__tip">
                            Creating a class will automatically generate a default timetable shell which you can customize later.
                        </FormNotice>
                    </form>

                    <section className="class-create__visual" aria-label="Class workspace preview">
                        <img src="/assets/welcome-image.png" alt="" />
                        <div>
                            <IonIcon icon={school} aria-hidden="true" />
                        </div>
                    </section>
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
                        {isLoading ? (
                            <>
                                <IonSpinner name="crescent" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <IonIcon icon={informationCircle} aria-hidden="true" />
                                Create Class
                            </>
                        )}
                    </IonButton>
                </div>
            </IonFooter>
        </IonPage>
    );
};

export default CreateClassPage;
