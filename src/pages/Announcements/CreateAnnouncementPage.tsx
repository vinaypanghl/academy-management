import React, { DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import { IonButton, IonContent, IonFooter, IonPage, IonSpinner, IonToast } from '@ionic/react';
import {
    CalendarDays,
    Check,
    Funnel,
    Mail,
    MessageSquare,
    Paperclip,
    Send,
    Smartphone,
    UploadCloud,
    Users,
} from 'lucide-react';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useHistory, useParams } from 'react-router-dom';
import AppHeader from '../../components/layout/AppHeader';
import { DesignInput, FormNotice } from '../../components/ui/DesignField';
import {
    useCreateAnnouncementMutation,
    useFetchAcademyUsersQuery,
    useFetchAnnouncementsQuery,
    useFetchClassesQuery,
} from '../../redux/api/api';
import { useAppSelector } from '../../redux/hooks';
import {
    AcademyUserProfile,
    AnnouncementAttachment,
    AnnouncementAudience,
    AnnouncementInput,
    AnnouncementStatus,
} from '../../types';
import './CreateAnnouncementPage.scss';

interface AnnouncementValues {
    id?: string;
    title: string;
    message: string;
    audience: AnnouncementAudience[];
    target_classes: string[];
    target_sections: string[];
    target_users: string[];
    send_push: boolean;
    send_sms: boolean;
    send_email: boolean;
    pin: boolean;
    schedule_for_later: boolean;
    publish_date: string;
    publish_time: string;
    attachments: AnnouncementAttachment[];
}

type AnnouncementErrors = Partial<Record<'title' | 'message' | 'target' | 'schedule' | 'form', string>>;

const initialValues: AnnouncementValues = {
    title: '',
    message: '',
    audience: ['all'],
    target_classes: [],
    target_sections: [],
    target_users: [],
    send_push: true,
    send_sms: false,
    send_email: false,
    pin: false,
    schedule_for_later: false,
    publish_date: '',
    publish_time: '10:00',
    attachments: [],
};

const audienceOptions: { value: AnnouncementAudience; label: string }[] = [
    { value: 'all', label: 'All Users' },
    { value: 'students', label: 'Students' },
    { value: 'teachers', label: 'Teachers' },
    { value: 'parents', label: 'Parents' },
];

const getErrorMessage = (error: unknown) => {
    const queryError = error as FetchBaseQueryError & { data?: { error?: string; message?: string } };
    return queryError?.data?.error || queryError?.data?.message || 'Unable to save this announcement right now.';
};

const combineDateTime = (date: string, timeValue: string) => {
    if (!date) return null;
    const parsed = new Date(`${date}T${timeValue || '10:00'}`);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString();
};

const formatSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const formatClassName = (className: string, section?: string | null) => {
    const base = className.toLowerCase().startsWith('class') ? className : `Class ${className}`;
    return `${base}${section ? ` ${section}` : ''}`;
};

const getUserLabel = (user: AcademyUserProfile) => {
    if (user.type === 'student') {
        return `${user.display_name} · ${user.class_name || 'Class'}${user.class_section ? ` ${user.class_section}` : ''}`;
    }
    if (user.type === 'parent') {
        return `${user.display_name} · Parent`;
    }
    return `${user.display_name} · ${user.designation || user.type}`;
};

const CreateAnnouncementPage: React.FC = () => {
    const history = useHistory();
    const { announcementId } = useParams<{ announcementId?: string }>();
    const role = useAppSelector((state) => state.auth.role);
    const canFetchUsers = role === 'academy' || role === 'admin';
    const { data: classes = [] } = useFetchClassesQuery();
    const { data: users = [] } = useFetchAcademyUsersQuery(undefined, { skip: !canFetchUsers });
    const { data: announcements = [] } = useFetchAnnouncementsQuery();
    const [createAnnouncement, { isLoading }] = useCreateAnnouncementMutation();

    const [values, setValues] = useState<AnnouncementValues>(initialValues);
    const [errors, setErrors] = useState<AnnouncementErrors>({});
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const [seeded, setSeeded] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editingAnnouncement = useMemo(
        () => announcements.find((announcement) => announcement.id === announcementId),
        [announcementId, announcements],
    );

    useEffect(() => {
        if (!announcementId || seeded || !editingAnnouncement) return;

        setValues({
            id: editingAnnouncement.id,
            title: editingAnnouncement.title,
            message: editingAnnouncement.message,
            audience: editingAnnouncement.audience.length ? editingAnnouncement.audience : ['all'],
            target_classes: editingAnnouncement.target_classes,
            target_sections: editingAnnouncement.target_sections,
            target_users: editingAnnouncement.target_users,
            send_push: editingAnnouncement.send_push,
            send_sms: editingAnnouncement.send_sms,
            send_email: editingAnnouncement.send_email,
            pin: editingAnnouncement.pin,
            schedule_for_later: editingAnnouncement.status === 'scheduled',
            publish_date: editingAnnouncement.scheduled_at ? editingAnnouncement.scheduled_at.slice(0, 10) : '',
            publish_time: editingAnnouncement.scheduled_at
                ? new Date(editingAnnouncement.scheduled_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
                : '10:00',
            attachments: editingAnnouncement.attachments || [],
        });
        setSeeded(true);
    }, [announcementId, editingAnnouncement, seeded]);

    const classOptions = useMemo(() => {
        const optionMap = new Map<string, { value: string; label: string }>();
        classes.forEach((classItem) => {
            const label = formatClassName(classItem.class_name, classItem.section);
            optionMap.set(label, { value: label, label });
        });
        return Array.from(optionMap.values());
    }, [classes]);

    const updateValue = <K extends keyof AnnouncementValues>(field: K, value: AnnouncementValues[K]) => {
        setValues((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field as string]: undefined, form: undefined }));
    };

    const toggleAudience = (audience: AnnouncementAudience) => {
        updateValue('audience', [audience]);
        if (audience === 'all') {
            updateValue('target_classes', []);
            updateValue('target_sections', []);
            updateValue('target_users', []);
        }
    };

    const addFiles = (fileList: FileList | File[]) => {
        const nextFiles = Array.from(fileList).map((file) => ({
            id: `${file.name}-${file.size}-${file.lastModified}`,
            name: file.name,
            size: file.size,
            type: file.type,
        }));

        setValues((current) => {
            const existingIds = new Set(current.attachments.map((file) => file.id));
            return {
                ...current,
                attachments: [
                    ...current.attachments,
                    ...nextFiles.filter((file) => !existingIds.has(file.id)),
                ],
            };
        });
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        addFiles(event.dataTransfer.files);
    };

    const removeAttachment = (id?: string) => {
        setValues((current) => ({
            ...current,
            attachments: current.attachments.filter((file) => file.id !== id),
        }));
    };

    const validate = (status: AnnouncementStatus) => {
        const nextErrors: AnnouncementErrors = {};

        if (!values.title.trim()) nextErrors.title = 'Title is required';
        if (!values.message.trim()) nextErrors.message = 'Message is required';

        const targetingEnabled = !values.audience.includes('all');
        if (targetingEnabled && values.target_classes.length === 0 && values.target_sections.length === 0 && values.target_users.length === 0) {
            nextErrors.target = 'Choose a class, section, or user for targeted delivery.';
        }

        if (status === 'scheduled' && !values.publish_date) {
            nextErrors.schedule = 'Choose a date for scheduled delivery.';
        }

        if (!values.send_push && !values.send_sms && !values.send_email) {
            nextErrors.form = 'Select at least one delivery option.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const buildPayload = (status: AnnouncementStatus): AnnouncementInput => ({
        id: values.id,
        title: values.title.trim(),
        message: values.message.trim(),
        priority: status === 'draft' ? 'normal' : values.pin ? 'high' : 'normal',
        category: 'general',
        audience: values.audience,
        target_scope: values.audience.includes('all')
            ? 'whole_academy'
            : values.target_users.length
                ? 'specific_users'
                : values.target_sections.length
                    ? 'specific_sections'
                    : 'specific_classes',
        target_classes: values.audience.includes('all') ? [] : values.target_classes,
        target_sections: values.audience.includes('all') ? [] : values.target_sections,
        target_users: values.audience.includes('all') ? [] : values.target_users,
        send_push: values.send_push,
        send_sms: values.send_sms,
        send_email: values.send_email,
        pin: values.pin,
        scheduled_at: status === 'scheduled' ? combineDateTime(values.publish_date, values.publish_time) : null,
        expires_at: null,
        attachments: values.attachments,
        status,
    });

    const handleSubmit = async (intent: 'draft' | 'send') => {
        const status: AnnouncementStatus = intent === 'draft'
            ? 'draft'
            : values.schedule_for_later
                ? 'scheduled'
                : 'published';

        if (!validate(status)) return;

        try {
            const response = await createAnnouncement(buildPayload(status)).unwrap();
            setToastMsg(response?.message || (status === 'draft' ? 'Draft saved' : 'Announcement sent'));
            window.setTimeout(() => history.push('/announcements'), 700);
        } catch (error) {
            const message = getErrorMessage(error);
            setErrors((current) => ({ ...current, form: message }));
            setToastMsg(message);
        }
    };

    const renderTargetUsers = useMemo(() => {
        const visibleUsers = users
            .filter((user) => values.audience.includes('all') || user.type === values.audience[0].slice(0, -1))
            .slice(0, 8);
        return visibleUsers;
    }, [users, values.audience]);

    return (
        <IonPage className="am-page announcement-create-page">
            <AppHeader
                title={announcementId ? 'Edit Announcement' : 'Create Announcement'}
                showBack
                hideAvatar
                hideNotifications
                heroTitle={announcementId ? 'Edit Announcement' : 'Create Announcement'}
                heroAction={{ label: 'Save Draft', onClick: () => handleSubmit('draft') }}
            />
            <IonContent className="am-content announcement-create-content" fullscreen>
                <main className="announcement-create__scroll">
                    <form className="announcement-create__form" onSubmit={(event) => event.preventDefault()} noValidate>
                        <section className="announcement-create__card">
                            <DesignInput
                                name="title"
                                label="Title"
                                value={values.title}
                                onChange={(value) => updateValue('title', value)}
                                placeholder="Unit Test Schedule Released"
                                error={errors.title}
                            />
                            <DesignInput
                                name="message"
                                label="Message"
                                value={values.message}
                                onChange={(value) => updateValue('message', value)}
                                placeholder="Write your announcement here..."
                                multiline
                                rows={6}
                                error={errors.message}
                            />
                        </section>

                        <section className="announcement-create__card">
                            <div className="announcement-create__section-title">
                                <Users size={22} strokeWidth={2.1} />
                                <span>Target Audience</span>
                            </div>
                            <p className="announcement-create__field-kicker">Send To:</p>
                            <div className="announcement-create__audience-grid">
                                {audienceOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={values.audience.includes(option.value) ? 'is-active' : ''}
                                        onClick={() => toggleAudience(option.value)}
                                    >
                                        <i />
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            {errors.target && <FormNotice tone="warning">{errors.target}</FormNotice>}
                        </section>

                        <section className="announcement-create__card">
                            <div className="announcement-create__section-title">
                                <Funnel size={22} strokeWidth={2.1} />
                                <span>Filter</span>
                                <small>(Optional)</small>
                            </div>
                            <div className={`announcement-create__select-grid${values.audience.includes('all') ? ' is-disabled' : ''}`}>
                                    <label>
                                        <span>Class</span>
                                        <select
                                            value=""
                                            disabled={values.audience.includes('all')}
                                            onChange={(event) => {
                                                if (!event.target.value) return;
                                                updateValue(
                                                    'target_classes',
                                                    values.target_classes.includes(event.target.value)
                                                        ? values.target_classes
                                                        : [...values.target_classes, event.target.value],
                                                );
                                            }}
                                        >
                                            <option value="">Select class</option>
                                            {classOptions.map((option) => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </label>

                                    <label>
                                        <span>Section</span>
                                        <select
                                            value=""
                                            disabled={values.audience.includes('all')}
                                            onChange={(event) => {
                                                if (!event.target.value) return;
                                                updateValue(
                                                    'target_sections',
                                                    values.target_sections.includes(event.target.value)
                                                        ? values.target_sections
                                                        : [...values.target_sections, event.target.value],
                                                );
                                            }}
                                        >
                                            <option value="">Select section</option>
                                            {classOptions.map((option) => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                            {!values.audience.includes('all') && (
                                <>
                                <div className="announcement-create__target-users">
                                    {renderTargetUsers.map((user) => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            className={values.target_users.includes(user.id) ? 'is-active' : ''}
                                            onClick={() => updateValue(
                                                'target_users',
                                                values.target_users.includes(user.id)
                                                    ? values.target_users.filter((id) => id !== user.id)
                                                    : [...values.target_users, user.id],
                                            )}
                                        >
                                            {getUserLabel(user)}
                                        </button>
                                    ))}
                                </div>

                                <div className="announcement-create__selected">
                                    {[...values.target_classes, ...values.target_sections].map((item) => (
                                        <span key={item}>{item}</span>
                                    ))}
                                    {values.target_users.map((userId) => (
                                        <span key={userId}>{users.find((user) => user.id === userId)?.display_name || userId}</span>
                                    ))}
                                </div>
                                </>
                            )}
                        </section>

                        <section className="announcement-create__card">
                            <div className="announcement-create__section-title">
                                <Send size={22} strokeWidth={2.1} />
                                <span>Delivery Options</span>
                            </div>
                            <div className="announcement-create__delivery-list">
                                <button
                                    type="button"
                                    className={values.send_push ? 'is-active' : ''}
                                    onClick={() => updateValue('send_push', !values.send_push)}
                                >
                                    <span><Check size={16} strokeWidth={2.3} /></span>
                                    <Smartphone size={18} strokeWidth={2.1} />
                                    <strong>App Notification</strong>
                                </button>
                                <button
                                    type="button"
                                    className={values.send_sms ? 'is-active' : ''}
                                    onClick={() => updateValue('send_sms', !values.send_sms)}
                                >
                                    <span><Check size={16} strokeWidth={2.3} /></span>
                                    <MessageSquare size={18} strokeWidth={2.1} />
                                    <strong>SMS</strong>
                                    <small>(optional)</small>
                                </button>
                                <button
                                    type="button"
                                    className={values.send_email ? 'is-active' : ''}
                                    onClick={() => updateValue('send_email', !values.send_email)}
                                >
                                    <span><Check size={16} strokeWidth={2.3} /></span>
                                    <Mail size={18} strokeWidth={2.1} />
                                    <strong>Email</strong>
                                    <small>(optional)</small>
                                </button>
                            </div>
                        </section>

                        <section className="announcement-create__card">
                            <div className="announcement-create__section-title">
                                <CalendarDays size={22} strokeWidth={2.1} />
                                <span>Schedule</span>
                            </div>
                            <div className="announcement-create__radio-list">
                                <button
                                    type="button"
                                    className={!values.schedule_for_later ? 'is-active' : ''}
                                    onClick={() => updateValue('schedule_for_later', false)}
                                >
                                    <i />
                                    Send Now
                                </button>
                                <button
                                    type="button"
                                    className={values.schedule_for_later ? 'is-active' : ''}
                                    onClick={() => updateValue('schedule_for_later', true)}
                                >
                                    <i />
                                    Schedule for Later
                                </button>
                            </div>
                            {values.schedule_for_later && (
                                <div className="announcement-create__select-grid">
                                    <DesignInput
                                        name="publish_date"
                                        label="Date"
                                        type="date"
                                        value={values.publish_date}
                                        onChange={(value) => updateValue('publish_date', value)}
                                    />
                                    <DesignInput
                                        name="publish_time"
                                        label="Time"
                                        type="time"
                                        value={values.publish_time}
                                        onChange={(value) => updateValue('publish_time', value)}
                                    />
                                </div>
                            )}
                            {errors.schedule && <FormNotice tone="warning">{errors.schedule}</FormNotice>}
                        </section>

                        <section className="announcement-create__card">
                            <div className="announcement-create__section-title">
                                <Paperclip size={22} strokeWidth={2.1} />
                                <span>Attachment</span>
                                <small>(Optional)</small>
                            </div>
                            <input
                                ref={fileInputRef}
                                className="announcement-create__file-input"
                                type="file"
                                multiple
                                onChange={(event) => {
                                    if (event.target.files) addFiles(event.target.files);
                                    event.target.value = '';
                                }}
                            />
                            <div
                                className="announcement-create__dropzone"
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                role="button"
                                tabIndex={0}
                            >
                                <UploadCloud size={34} strokeWidth={2.1} />
                                <strong>Upload File / Image</strong>
                                <span>Max file size: 5MB</span>
                            </div>

                            {values.attachments.length > 0 && (
                                <div className="announcement-create__files">
                                    {values.attachments.map((file) => (
                                        <article key={file.id || file.name}>
                                            <div>
                                                <strong>{file.name}</strong>
                                                <span>{formatSize(file.size)}</span>
                                            </div>
                                            <button type="button" onClick={() => removeAttachment(file.id)}>Remove</button>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>

                        {errors.form && <FormNotice tone="warning">{errors.form}</FormNotice>}
                    </form>

                    <IonToast
                        isOpen={!!toastMsg}
                        message={toastMsg || ''}
                        duration={2200}
                        onDidDismiss={() => setToastMsg(null)}
                    />
                </main>
            </IonContent>

            <IonFooter className="app-action-footer announcement-create__footer">
                <div className="announcement-create__actions">
                    <button type="button" className="announcement-create__ghost" onClick={() => history.push('/announcements')}>
                        Cancel
                    </button>
                    <button type="button" className="announcement-create__soft" onClick={() => handleSubmit('draft')} disabled={isLoading}>
                        Draft
                    </button>
                    <IonButton
                        className="am-primary-button announcement-create__publish"
                        expand="block"
                        disabled={isLoading}
                        onClick={() => handleSubmit('send')}
                    >
                        {isLoading ? (
                            <>
                                <IonSpinner name="crescent" />
                                Saving...
                            </>
                        ) : (
                            'Send'
                        )}
                    </IonButton>
                </div>
            </IonFooter>
        </IonPage>
    );
};

export default CreateAnnouncementPage;
