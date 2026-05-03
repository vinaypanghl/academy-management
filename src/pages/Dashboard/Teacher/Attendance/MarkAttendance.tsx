import React, { useEffect, useMemo, useState } from 'react';
import {
    IonButton,
    IonContent,
    IonIcon,
    IonPage,
    IonSpinner,
    IonToast,
} from '@ionic/react';
import { chatboxEllipses, checkmarkCircle, closeOutline, grid, people, search, warning } from 'ionicons/icons';
import AppFooter from '../../../../components/layout/AppFooter';
import AppHeader from '../../../../components/layout/AppHeader';
import UserAvatar from '../../../../components/ui/UserAvatar';
import {
    useFetchTeacherDashboardQuery,
    useFetchTeacherStudentsQuery,
    useMarkAttendanceMutation,
} from '../../../../redux/api/api';
import { Student } from '../../../../types';
import './MarkAttendance.scss';

type AttendanceSlot = 'ARRIVAL' | 'DEPARTURE';
type AttendanceMark = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';

const attendanceOptions: { value: AttendanceMark; label: string }[] = [
    { value: 'PRESENT', label: 'P' },
    { value: 'ABSENT', label: 'A' },
    { value: 'LATE', label: 'L' },
    { value: 'LEAVE', label: 'LV' },
];

const getStudentName = (student: Student) => `${student.first_name || ''} ${student.last_name || ''}`.trim() || student.student_id;

const MarkAttendance: React.FC = () => {
    const [attendanceType, setAttendanceType] = useState<AttendanceSlot>('ARRIVAL');
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [attendance, setAttendance] = useState<Record<string, AttendanceMark>>({});
    const [remarks, setRemarks] = useState<Record<string, string>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [toastMessage, setToastMessage] = useState('');

    const { data: dashboard, isFetching: fetchingDashboard } = useFetchTeacherDashboardQuery();
    const classes = dashboard?.classes || [];
    const selectedClass = useMemo(
        () => classes.find((item) => item.id === selectedClassId)
            || classes.find((item) => item.attendance_status === 'pending')
            || classes[0],
        [classes, selectedClassId],
    );

    const { data: students = [], isFetching: fetchingStudents, isError: studentsError } = useFetchTeacherStudentsQuery(
        selectedClass
            ? {
                class_name: selectedClass.class_name,
                class_section: selectedClass.section || undefined,
                academic_year: selectedClass.academic_year,
            }
            : undefined,
        { skip: !selectedClass },
    );
    const [markAttendance, { isLoading }] = useMarkAttendanceMutation();

    const academicYear = selectedClass?.academic_year || new Date().getFullYear().toString();
    const isBusy = fetchingDashboard || fetchingStudents;
    const hasStudents = students.length > 0;
    const filteredStudents = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        if (!normalizedSearch) return students;

        return students.filter((student) => {
            const name = getStudentName(student).toLowerCase();
            return name.includes(normalizedSearch) || String(student.roll_no || '').toLowerCase().includes(normalizedSearch);
        });
    }, [searchTerm, students]);
    const getStatus = (studentId: string) => attendance[studentId] || 'PRESENT';
    const summary = students.reduce(
        (counts, student) => {
            const status = getStatus(student.id);
            counts[status] += 1;
            return counts;
        },
        { PRESENT: 0, ABSENT: 0, LATE: 0, LEAVE: 0 } as Record<AttendanceMark, number>,
    );
    const allPresent = hasStudents && students.every((student) => getStatus(student.id) === 'PRESENT');

    useEffect(() => {
        setAttendance({});
        setRemarks({});
        setSuccessMessage('');
    }, [selectedClass?.id, attendanceType]);

    const updateStudentStatus = (studentId: string, status: AttendanceMark) => {
        setAttendance((current) => ({ ...current, [studentId]: status }));
        setSuccessMessage('');
    };

    const markAllPresent = () => {
        const nextValue: AttendanceMark = allPresent ? 'ABSENT' : 'PRESENT';
        setAttendance(Object.fromEntries(students.map((student) => [student.id, nextValue])));
        setSuccessMessage('');
    };

    const updateRemark = (studentId: string, value: string) => {
        setRemarks((current) => ({ ...current, [studentId]: value }));
    };

    const submitAttendance = async () => {
        if (!selectedClass || !hasStudents) return;

        try {
            await markAttendance({
                class_name: selectedClass.class_name,
                class_section: selectedClass.section || undefined,
                attendance_type: attendanceType,
                students: students.map((student) => ({
                    student_id: student.id,
                    status: getStatus(student.id),
                    remark: remarks[student.id]?.trim() || undefined,
                })),
            }).unwrap();

            const message = 'Attendance marked successfully';
            setSuccessMessage(message);
            setToastMessage(message);
        } catch (error: any) {
            setToastMessage(error?.data?.error || 'Unable to submit attendance.');
        }
    };

    return (
        <IonPage className="am-page mark-attendance-page">
            <AppHeader title="Mark Attendance" showBack backHref="/teacher-dashboard" />
            <IonContent className="am-content" fullscreen>
                <main className="mark-attendance__scroll">
                    {successMessage && (
                        <section className="mark-attendance__notice">
                            <IonIcon icon={checkmarkCircle} aria-hidden="true" />
                            <span>{successMessage}</span>
                            <button type="button" onClick={() => setSuccessMessage('')} aria-label="Dismiss">
                                <IonIcon icon={closeOutline} aria-hidden="true" />
                            </button>
                        </section>
                    )}

                    <section className="mark-attendance__class-strip">
                        <label>
                            <span>Class</span>
                            <select
                                value={selectedClass?.id || ''}
                                onChange={(event) => setSelectedClassId(event.target.value)}
                                aria-label="Select class"
                                disabled={classes.length <= 1}
                            >
                                {classes.map((classItem) => (
                                    <option key={classItem.id} value={classItem.id}>
                                        Grade {classItem.class_name}{classItem.section ? ` ${classItem.section}` : ''}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span>Date</span>
                            <input type="date" value={new Date().toISOString().slice(0, 10)} readOnly />
                        </label>
                        <small>Academic Year {academicYear}</small>
                    </section>

                    <label className="mark-attendance__search">
                        <IonIcon icon={search} aria-hidden="true" />
                        <input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search Student"
                        />
                    </label>

                    <section className="mark-attendance__segments" aria-label="Attendance slot">
                        <button
                            type="button"
                            className={attendanceType === 'ARRIVAL' ? 'is-active' : ''}
                            onClick={() => setAttendanceType('ARRIVAL')}
                        >
                            Morning
                        </button>
                        <button
                            type="button"
                            className={attendanceType === 'DEPARTURE' ? 'is-active' : ''}
                            onClick={() => setAttendanceType('DEPARTURE')}
                        >
                            Evening
                        </button>
                    </section>

                    <section className="mark-attendance__summary">
                        <strong>Summary:</strong>
                        <span>Present {summary.PRESENT}</span>
                        <span>Absent {summary.ABSENT}</span>
                        <span>Late {summary.LATE}</span>
                        <span>Leave {summary.LEAVE}</span>
                    </section>

                    <section className="mark-attendance__list-header">
                        <h2>Student List</h2>
                        <button type="button" onClick={markAllPresent} disabled={!hasStudents || isLoading}>
                            <IonIcon icon={grid} aria-hidden="true" />
                            {allPresent ? 'Clear All' : 'Mark all Present'}
                        </button>
                    </section>

                    {isBusy && (
                        <section className="mark-attendance__state">
                            <IonSpinner name="crescent" />
                            <span>Loading students...</span>
                        </section>
                    )}

                    {!isBusy && studentsError && (
                        <section className="mark-attendance__state">
                            <IonIcon icon={warning} aria-hidden="true" />
                            <span>Unable to load students.</span>
                        </section>
                    )}

                    {!isBusy && !studentsError && !hasStudents && (
                        <section className="mark-attendance__state">
                            <IonIcon icon={people} aria-hidden="true" />
                            <span>No students found for this class.</span>
                        </section>
                    )}

                    {!isBusy && !studentsError && hasStudents && (
                        <section className="mark-attendance__students">
                            {filteredStudents.map((student) => {
                                const studentName = getStudentName(student);
                                const onLeave = student.is_active === false;
                                const activeStatus = onLeave ? 'LEAVE' : getStatus(student.id);

                                return (
                                    <article key={student.id} className={onLeave ? 'is-muted' : ''}>
                                        <UserAvatar
                                            size="lg"
                                            name={studentName}
                                            src={student.profile_picture_url}
                                        />
                                        <div>
                                            <strong>{studentName}</strong>
                                            <span>Roll {student.roll_no || '--'}</span>
                                        </div>
                                        <div className="mark-attendance__status-group" aria-label={`Mark ${studentName}`}>
                                            {attendanceOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    className={activeStatus === option.value ? 'is-active' : ''}
                                                    disabled={onLeave && option.value !== 'LEAVE'}
                                                    onClick={() => updateStudentStatus(student.id, option.value)}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                        <label className="mark-attendance__remark">
                                            <IonIcon icon={chatboxEllipses} aria-hidden="true" />
                                            <input
                                                value={remarks[student.id] || ''}
                                                onChange={(event) => updateRemark(student.id, event.target.value)}
                                                placeholder="Remark"
                                            />
                                        </label>
                                    </article>
                                );
                            })}
                        </section>
                    )}
                </main>

                <IonToast
                    isOpen={Boolean(toastMessage)}
                    message={toastMessage}
                    duration={2000}
                    onDidDismiss={() => setToastMessage('')}
                />
            </IonContent>

            <section className="mark-attendance__submit-shell">
                <IonButton
                    className="am-primary-button mark-attendance__submit"
                    expand="block"
                    disabled={isLoading || !hasStudents || !selectedClass}
                    onClick={submitAttendance}
                >
                    {isLoading ? (
                        <>
                            <IonSpinner name="crescent" />
                            Submitting...
                        </>
                    ) : (
                        'Save Attendance'
                    )}
                </IonButton>
            </section>
            <AppFooter />
        </IonPage>
    );
};

export default MarkAttendance;
