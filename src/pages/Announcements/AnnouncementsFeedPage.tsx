import React, { useMemo, useState } from 'react';
import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import {
    BadgeCheck,
    Clock3,
    Filter,
    Mail,
    Megaphone,
    MoreVertical,
    Plus,
    Search,
    Send,
    Users,
} from 'lucide-react';
import { useHistory } from 'react-router-dom';
import AppFooter from '../../components/layout/AppFooter';
import AppHeader from '../../components/layout/AppHeader';
import { useFetchAnnouncementsQuery } from '../../redux/api/api';
import { useAppSelector } from '../../redux/hooks';
import { Announcement, AnnouncementAudience } from '../../types';
import './AnnouncementsFeedPage.scss';

const statusTabs = [
    { key: 'all', label: 'All' },
    { key: 'published', label: 'Sent' },
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'draft', label: 'Drafts' },
];

const audienceLabels: Record<AnnouncementAudience, string> = {
    all: 'All Users',
    students: 'Students',
    teachers: 'Teachers',
    parents: 'Parents',
};

const getStatusTone = (status: Announcement['status']) => {
    if (status === 'published') return 'sent';
    if (status === 'scheduled') return 'scheduled';
    return 'draft';
};

const getStatusLabel = (status: Announcement['status']) => {
    if (status === 'published') return 'Sent';
    if (status === 'scheduled') return 'Scheduled';
    return 'Draft';
};

const formatDateLabel = (value?: string | null) => {
    if (!value) return '--';
    return new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const formatDateTimeLabel = (value?: string | null) => {
    if (!value) return '--';
    return new Date(value).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
    });
};

const getClassOptions = (announcements: Announcement[]) => {
    const labels = new Set<string>();
    announcements.forEach((announcement) => {
        announcement.target_classes.forEach((className) => labels.add(className));
        announcement.target_sections.forEach((sectionName) => labels.add(sectionName));
    });

    return Array.from(labels);
};

const getAudienceTag = (announcement: Announcement) => {
    if (announcement.audience.includes('all')) {
        return 'All Users';
    }
    return announcement.audience.map((audience) => audienceLabels[audience]).join(', ');
};

const AnnouncementsFeedPage: React.FC = () => {
    const history = useHistory();
    const role = useAppSelector((state) => state.auth.role);
    const academyLabel = role === 'academy' || role === 'admin' ? 'ABC International School' : 'School Updates';
    const canCreate = role === 'academy' || role === 'admin';
    const { data: announcements = [], isFetching, isError } = useFetchAnnouncementsQuery();

    const [activeTab, setActiveTab] = useState<'all' | 'published' | 'scheduled' | 'draft'>('all');
    const [query, setQuery] = useState('');
    const [classFilter, setClassFilter] = useState('all');
    const [audienceFilter, setAudienceFilter] = useState<'all' | AnnouncementAudience>('all');

    const classOptions = useMemo(() => getClassOptions(announcements), [announcements]);

    const visibleAnnouncements = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return announcements.filter((announcement) => {
            if (activeTab !== 'all' && announcement.status !== activeTab) return false;

            if (classFilter !== 'all') {
                const classValues = [...announcement.target_classes, ...announcement.target_sections];
                if (!classValues.includes(classFilter)) return false;
            }

            if (audienceFilter !== 'all' && !announcement.audience.includes(audienceFilter)) {
                return false;
            }

            if (!normalizedQuery) return true;

            return [announcement.title, announcement.message, announcement.primary_target_label, getAudienceTag(announcement)]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(normalizedQuery));
        });
    }, [activeTab, announcements, audienceFilter, classFilter, query]);

    return (
        <IonPage className="am-page announcements-page">
            <AppHeader
                title="Announcements"
                heroTitle="Announcements"
                heroSubtitle={academyLabel}
                heroAction={canCreate ? { label: 'Create', onClick: () => history.push('/announcements/create'), icon: Plus } : undefined}
            />
            <IonContent className="am-content announcements-content" fullscreen>
                <main className="announcements__scroll">
                    <nav className="announcements__tabs" aria-label="Announcement status filters">
                        {statusTabs.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                className={activeTab === tab.key ? 'is-active' : ''}
                                onClick={() => setActiveTab(tab.key as 'all' | 'published' | 'scheduled' | 'draft')}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    <div className="announcements__search-row">
                        <label className="announcements__search">
                            <Search size={26} strokeWidth={2.2} />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search..."
                            />
                        </label>
                        <button type="button" className="announcements__filter-button" aria-label="Filters">
                            <Filter size={26} strokeWidth={2.1} />
                        </button>
                    </div>

                    <div className="announcements__dropdowns">
                        <label>
                            <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
                                <option value="all">Class</option>
                                {classOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <select value={audienceFilter} onChange={(event) => setAudienceFilter(event.target.value as 'all' | AnnouncementAudience)}>
                                <option value="all">Audience</option>
                                <option value="students">Students</option>
                                <option value="teachers">Teachers</option>
                                <option value="parents">Parents</option>
                            </select>
                        </label>
                    </div>

                    {isFetching && (
                        <div className="announcements__state">
                            <IonSpinner name="crescent" />
                            <span>Loading announcements...</span>
                        </div>
                    )}

                    {isError && (
                        <div className="announcements__state">
                            <Megaphone size={28} strokeWidth={2.1} />
                            <span>Unable to load announcements.</span>
                        </div>
                    )}

                    {!isFetching && !isError && visibleAnnouncements.length === 0 && (
                        <section className="announcements__empty">
                            <Megaphone size={34} strokeWidth={2.1} />
                            <h2>No announcements yet</h2>
                            <p>EduCore keeps this space ready for your next update.</p>
                        </section>
                    )}

                    <section className="announcements__feed" aria-label="Announcements">
                        {!isFetching && !isError && visibleAnnouncements.map((announcement) => {
                            const tone = getStatusTone(announcement.status);
                            const showEditCta = announcement.status === 'draft' || announcement.status === 'scheduled';

                            return (
                                <article key={announcement.id} className={`announcement-card announcement-card--${tone}`}>
                                    <header className="announcement-card__header">
                                        <h2>{announcement.title}</h2>
                                        <button
                                            type="button"
                                            className="announcement-card__icon-button"
                                            aria-label="Announcement actions"
                                            onClick={() => {
                                                if (showEditCta) {
                                                    history.push(`/announcements/create/${announcement.id}`);
                                                }
                                            }}
                                        >
                                            <MoreVertical size={22} strokeWidth={2.2} />
                                        </button>
                                    </header>

                                    <div className="announcement-card__tags">
                                        <span className={`announcement-card__badge announcement-card__badge--${tone}`}>
                                            {getStatusLabel(announcement.status)}
                                        </span>
                                        <span className="announcement-card__audience">
                                            <Users size={16} strokeWidth={2.1} />
                                            {getAudienceTag(announcement)}
                                        </span>
                                    </div>

                                    <div className="announcement-card__metrics">
                                        {announcement.status === 'published' && (
                                            <>
                                                <div>
                                                    <small>Sent On</small>
                                                    <strong>{formatDateLabel(announcement.published_at || announcement.created_at)}</strong>
                                                </div>
                                                <div>
                                                    <small>Delivered</small>
                                                    <strong className="is-link">{announcement.estimated_recipients || 0} users</strong>
                                                </div>
                                            </>
                                        )}

                                        {announcement.status === 'scheduled' && (
                                            <>
                                                <div>
                                                    <small>Scheduled For</small>
                                                    <strong>{formatDateTimeLabel(announcement.scheduled_at)}</strong>
                                                </div>
                                                <div>
                                                    <small>Status</small>
                                                    <strong>Waiting</strong>
                                                </div>
                                            </>
                                        )}

                                        {announcement.status === 'draft' && (
                                            <>
                                                <div>
                                                    <small>Last Saved</small>
                                                    <strong>{formatDateLabel(announcement.updated_at || announcement.created_at)}</strong>
                                                </div>
                                                <div className="announcement-card__cta-slot">
                                                    <button
                                                        type="button"
                                                        className="announcement-card__cta"
                                                        onClick={() => history.push(`/announcements/create/${announcement.id}`)}
                                                    >
                                                        Continue Editing
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <footer className="announcement-card__footer">
                                        <span className="announcement-card__target">
                                            {announcement.primary_target_label || 'Whole academy'}
                                        </span>
                                        <div className="announcement-card__channels">
                                            {announcement.send_push && <Send size={18} strokeWidth={2.1} />}
                                            {announcement.send_email && <Mail size={18} strokeWidth={2.1} />}
                                            {announcement.status === 'scheduled' && <Clock3 size={18} strokeWidth={2.1} />}
                                            {announcement.pin && <BadgeCheck size={18} strokeWidth={2.1} />}
                                        </div>
                                    </footer>
                                </article>
                            );
                        })}
                    </section>
                </main>
            </IonContent>
            <AppFooter />
        </IonPage>
    );
};

export default AnnouncementsFeedPage;
