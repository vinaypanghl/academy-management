import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    IonButton,
    IonContent,
    IonFooter,
    IonIcon,
    IonPage,
    IonSpinner,
    IonToast,
} from '@ionic/react';
import {
    calendar,
    checkmarkCircle,
    closeOutline,
    people,
    person,
    school,
} from 'ionicons/icons';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useHistory } from 'react-router-dom';
import AppHeader from '../../components/layout/AppHeader';
import { DesignInput, DesignSelect, FormNotice } from '../../components/ui/DesignField';
import {
    useCreateStudentsMutation,
    useFetchClassesQuery,
    useFetchParentsQuery,
} from '../../redux/api/api';
import { CreateStudentInput, ParentInput } from '../../types';
import { RELATIONSHIP_OPTIONS } from '../../utils/helper';
import './CreateStudentPage.scss';

interface StudentValues {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    registration_no: string;
    aadhar_no: string;
    roll_no: string;
    class_value: string;
    class_section: string;
    academic_year: string;
    parent_phone: string;
    parent_name: string;
    parent_email: string;
    parent_address: string;
    relationship: string;
}

type StudentErrors = Partial<Record<keyof StudentValues | 'parent' | 'form', string>>;

type ParentSuggestion = ParentInput & {
    parent_student_map?: { relationship?: string }[];
};

const initialValues: StudentValues = {
    first_name: '',
    last_name: '',
    date_of_birth: '',
    registration_no: '',
    aadhar_no: '',
    roll_no: '',
    class_value: '',
    class_section: '',
    academic_year: new Date().getFullYear().toString(),
    parent_phone: '',
    parent_name: '',
    parent_email: '',
    parent_address: '',
    relationship: 'Father',
};

const fallbackClassOptions = Array.from({ length: 12 }, (_, index) => {
    const label = String(index + 1);
    return { value: label, label };
});

const getErrorMessage = (error: unknown) => {
    const queryError = error as FetchBaseQueryError & { data?: { error?: string; message?: string } };
    return queryError?.data?.error || queryError?.data?.message || 'Unable to create this student right now.';
};

const convertToISODate = (dateValue: string) => {
    const trimmed = dateValue.trim();

    if (!trimmed.includes('/')) return trimmed;

    const [day, month, year] = trimmed.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const normalizePhone = (phone: string) => {
    const trimmed = phone.trim();

    if (!trimmed) return '';
    if (trimmed.startsWith('+')) return trimmed.replace(/[^\d+]/g, '');

    return trimmed.replace(/\D/g, '');
};

const CreateStudentPage: React.FC = () => {
    const history = useHistory();
    const [createStudent, { isLoading }] = useCreateStudentsMutation();
    const { data: classes = [] } = useFetchClassesQuery();
    const { data: parents = [], isFetching: fetchingParents } = useFetchParentsQuery();
    const [values, setValues] = useState<StudentValues>(initialValues);
    const [errors, setErrors] = useState<StudentErrors>({});
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedParent, setSelectedParent] = useState<ParentSuggestion | null>(null);
    const [originalParent, setOriginalParent] = useState<ParentSuggestion | null>(null);
    const parentSearchRef = useRef<HTMLDivElement>(null);

    const classOptions = useMemo(() => {
        if (!classes.length) return fallbackClassOptions;

        const classMap = new Map<string, { value: string; label: string }>();
        classes.forEach((classItem) => {
            if (!classMap.has(classItem.class_name)) {
                classMap.set(classItem.class_name, {
                    value: classItem.class_name,
                    label: classItem.class_name,
                });
            }
        });

        return Array.from(classMap.values()).sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
    }, [classes]);

    const selectedClassValue = values.class_value || classOptions[0]?.value || '';
    const classSectionOptions = useMemo(() => {
        const sectionMap = new Map<string, { value: string; label: string }>();

        classes
            .filter((classItem) => classItem.class_name === selectedClassValue)
            .forEach((classItem) => {
                const section = classItem.section?.trim();

                if (section && !sectionMap.has(section)) {
                    sectionMap.set(section, { value: section, label: section });
                }
            });

        return Array.from(sectionMap.values()).sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
    }, [classes, selectedClassValue]);
    const hasSectionOptions = classSectionOptions.length > 0;
    const parentSuggestions = useMemo(() => {
        const phone = normalizePhone(values.parent_phone);

        if (phone.length < 3) return [];

        return (parents as ParentSuggestion[])
            .filter((parent) => normalizePhone(parent.phone || '').includes(phone))
            .slice(0, 6);
    }, [parents, values.parent_phone]);
    const shouldShowSuggestions = showSuggestions && (fetchingParents || parentSuggestions.length > 0);

    const updateValue = (field: keyof StudentValues) => (value: string) => {
        setValues((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    };

    const handleParentPhoneChange = (phone: string) => {
        updateValue('parent_phone')(phone);
        setShowSuggestions(normalizePhone(phone).length >= 3);

        if (selectedParent && normalizePhone(selectedParent.phone || '') !== normalizePhone(phone)) {
            setSelectedParent(null);
            setOriginalParent(null);
        }
    };

    const handleClassChange = (classValue: string) => {
        setValues((current) => ({
            ...current,
            class_value: classValue,
            class_section: '',
        }));
        setErrors((current) => ({ ...current, class_value: undefined, class_section: undefined, form: undefined }));
    };

    const selectParent = (parent: ParentSuggestion) => {
        const relationship = parent.parent_student_map?.[0]?.relationship || parent.relationship || 'Guardian';

        setSelectedParent(parent);
        setOriginalParent(parent);
        setValues((current) => ({
            ...current,
            parent_phone: parent.phone || '',
            parent_name: parent.display_name || '',
            parent_email: parent.email || '',
            parent_address: parent.address || '',
            relationship,
        }));
        setShowSuggestions(false);
    };

    const validate = () => {
        const nextErrors: StudentErrors = {};

        if (!values.first_name.trim()) nextErrors.first_name = 'First name is required';
        if (!values.date_of_birth.trim()) nextErrors.date_of_birth = 'Date of birth is required';
        if (!values.registration_no.trim()) nextErrors.registration_no = 'Registration number is required';
        if (!selectedClassValue) nextErrors.class_value = 'Class is required';
        if (!values.academic_year.trim()) nextErrors.academic_year = 'Academic year is required';

        if ((values.parent_name || values.parent_phone) && !normalizePhone(values.parent_phone)) {
            nextErrors.parent_phone = 'Parent phone is required for a new parent.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const buildPayload = (): CreateStudentInput => {
        const sectionValue = hasSectionOptions ? values.class_section.trim() : '';
        const payload: CreateStudentInput = {
            first_name: values.first_name.trim(),
            last_name: values.last_name.trim() || null,
            date_of_birth: convertToISODate(values.date_of_birth),
            registration_no: values.registration_no.trim(),
            aadhar_no: values.aadhar_no.trim() || null,
            roll_no: values.roll_no.trim() || null,
            class_name: selectedClassValue,
            class_section: sectionValue || null,
            academic_year: values.academic_year.trim(),
            relationship: values.relationship || 'Guardian',
        };

        if (selectedParent?.id) {
            payload.parent_id = selectedParent.id;

            const updatedParent: Partial<ParentInput> = {};
            if (originalParent?.display_name !== values.parent_name) updatedParent.display_name = values.parent_name;
            if (originalParent?.phone !== values.parent_phone) updatedParent.phone = normalizePhone(values.parent_phone);
            if (originalParent?.email !== values.parent_email) updatedParent.email = values.parent_email;
            if (originalParent?.address !== values.parent_address) updatedParent.address = values.parent_address;
            if ((originalParent?.relationship || 'Guardian') !== values.relationship) updatedParent.relationship = values.relationship;

            if (Object.keys(updatedParent).length > 0) {
                payload.updated_parent = { ...updatedParent, id: selectedParent.id };
            }
        } else if (values.parent_name || values.parent_phone || values.parent_email || values.parent_address) {
            payload.new_parents = [{
                display_name: values.parent_name.trim() || 'Guardian',
                phone: normalizePhone(values.parent_phone),
                email: values.parent_email.trim(),
                address: values.parent_address.trim(),
                relationship: values.relationship || 'Guardian',
            }];
        }

        return payload;
    };

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (!parentSearchRef.current?.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            const response = await createStudent(buildPayload()).unwrap();
            setToastMsg(response?.message || 'Student created successfully');
            setValues(initialValues);
            setSelectedParent(null);
            setOriginalParent(null);
            window.setTimeout(() => history.push('/academy-dashboard'), 700);
        } catch (error) {
            const message = getErrorMessage(error);
            setToastMsg(message);

            if (message.toLowerCase().includes('registration')) {
                setErrors((current) => ({ ...current, registration_no: message }));
            } else if (message.toLowerCase().includes('aadhar')) {
                setErrors((current) => ({ ...current, aadhar_no: message }));
            } else {
                setErrors((current) => ({ ...current, form: message }));
            }
        }
    };

    return (
        <IonPage className="am-page student-create-page">
            <AppHeader title="Student Registration" showBack hideAvatar />
            <IonContent className="am-content student-create-content" fullscreen>
                <main className="student-create__scroll">
                    <form className="student-create__form" onSubmit={(event) => event.preventDefault()} noValidate>
                        <section className="student-create__section">
                            <h2>
                                <IonIcon icon={person} aria-hidden="true" />
                                Student Details
                            </h2>
                            <DesignInput name="first_name" label="First Name" value={values.first_name} onChange={updateValue('first_name')} placeholder="e.g. Aarav" error={errors.first_name} />
                            <DesignInput name="last_name" label="Last Name" value={values.last_name} onChange={updateValue('last_name')} placeholder="e.g. Singh" />
                            <DesignInput name="date_of_birth" label="Date of Birth" value={values.date_of_birth} onChange={updateValue('date_of_birth')} placeholder="DD/MM/YYYY" suffixIcon={calendar} error={errors.date_of_birth} />
                            <DesignInput name="registration_no" label="Registration Number" value={values.registration_no} onChange={updateValue('registration_no')} placeholder="REG2026001" error={errors.registration_no} />
                            <DesignInput name="aadhar_no" label="Aadhar Number" value={values.aadhar_no} onChange={updateValue('aadhar_no')} placeholder="4567 801 2345" error={errors.aadhar_no} />
                            <DesignInput name="roll_no" label="Roll Number" value={values.roll_no} onChange={updateValue('roll_no')} placeholder="e.g. 42" />
                        </section>

                        <section className="student-create__section">
                            <h2>
                                <IonIcon icon={school} aria-hidden="true" />
                                Class Details
                            </h2>
                            <DesignSelect
                                name="class_value"
                                label="Class"
                                value={selectedClassValue}
                                onChange={handleClassChange}
                                options={classOptions}
                                error={errors.class_value}
                            />
                            <DesignSelect
                                name="class_section"
                                label="Class Section"
                                value={values.class_section}
                                onChange={updateValue('class_section')}
                                options={classSectionOptions}
                                placeholder={hasSectionOptions ? 'Select section' : 'No sections available'}
                                disabled={!hasSectionOptions}
                            />
                            <DesignInput name="academic_year" label="Academic Year" value={values.academic_year} onChange={updateValue('academic_year')} placeholder="2026" error={errors.academic_year} />
                        </section>

                        <section className="student-create__section student-create__parent-section">
                            <h2>
                                <IonIcon icon={people} aria-hidden="true" />
                                Parent Information
                            </h2>

                            <div className="student-create__parent-search" ref={parentSearchRef}>
                                <DesignInput
                                    name="parent_phone"
                                    label="Phone Number"
                                    value={values.parent_phone}
                                    onChange={handleParentPhoneChange}
                                    placeholder="+91 98765 43210"
                                    type="tel"
                                    error={errors.parent_phone}
                                />

                                {shouldShowSuggestions && (
                                    <div className="student-create__suggestions">
                                        {fetchingParents && <span>Checking parents...</span>}
                                        {!fetchingParents && parentSuggestions.map((parent) => (
                                            <button
                                                key={parent.id || parent.phone}
                                                type="button"
                                                onClick={() => selectParent(parent)}
                                            >
                                                <strong>{parent.display_name || 'Parent'}</strong>
                                                <small>{parent.phone || 'No phone'}</small>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <DesignInput name="parent_name" label="Parent's Name" value={values.parent_name} onChange={updateValue('parent_name')} placeholder="e.g. Rakesh Sharma" />
                            <DesignInput name="parent_email" label="Email" optional type="email" value={values.parent_email} onChange={updateValue('parent_email')} placeholder="parent@email.com" />
                            <DesignSelect
                                name="relationship"
                                label="Relationship"
                                value={values.relationship}
                                onChange={updateValue('relationship')}
                                options={RELATIONSHIP_OPTIONS}
                            />
                            <DesignInput
                                name="parent_address"
                                label="Parent Address"
                                value={values.parent_address}
                                onChange={updateValue('parent_address')}
                                placeholder="Enter complete residential address..."
                                multiline
                                rows={3}
                            />

                            <div className="student-create__system-card">
                                <span>
                                    <IonIcon icon={checkmarkCircle} aria-hidden="true" />
                                </span>
                                <div>
                                    <strong>System Auto-Check</strong>
                                    <p>We automatically check for existing parent profiles by phone and connect siblings already registered in this academy.</p>
                                </div>
                            </div>

                            <div className="student-create__ay-card">
                                <small>Academic Year</small>
                                <strong>AY-{values.academic_year.slice(-2) || '26'}</strong>
                            </div>
                        </section>

                        {errors.form && <FormNotice tone="warning">{errors.form}</FormNotice>}
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
                        {isLoading ? (
                            <>
                                <IonSpinner name="crescent" />
                                Creating...
                            </>
                        ) : 'Create Student'}
                    </IonButton>
                </div>
            </IonFooter>
        </IonPage>
    );
};

export default CreateStudentPage;
