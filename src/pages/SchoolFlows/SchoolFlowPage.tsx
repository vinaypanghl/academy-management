import React, { useMemo, useState } from 'react';
import { IonContent, IonIcon, IonPage, IonSpinner, IonToast } from '@ionic/react';
import {
    barChart,
    calendarClear,
    chatboxEllipses,
    checkmarkCircle,
    cloudDownload,
    documentAttach,
    documentText,
    people,
    school,
    send,
    warning,
} from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import AppFooter from '../../components/layout/AppFooter';
import AppHeader from '../../components/layout/AppHeader';
import UserAvatar from '../../components/ui/UserAvatar';
import {
    useAssignHomeworkMutation,
    useFetchAcademyOverviewQuery,
    useFetchClassesQuery,
    useFetchParentDashboardQuery,
    useFetchTeacherDashboardQuery,
    useFetchTeacherStudentsQuery,
} from '../../redux/api/api';
import { useAppSelector } from '../../redux/hooks';
import { Student } from '../../types';
import './SchoolFlowPage.scss';

export type SchoolFlowVariant =
    | 'addHomework'
    | 'enterMarks'
    | 'studentFeedback'
    | 'studentDetail'
    | 'parentProgress'
    | 'parentAttendance'
    | 'parentHomework'
    | 'parentFeedback'
    | 'documents'
    | 'meetingRequest'
    | 'adminClasses'
    | 'reports';

interface SchoolFlowPageProps {
    variant: SchoolFlowVariant;
}

const titles: Record<SchoolFlowVariant, string> = {
    addHomework: 'Add Homework',
    enterMarks: 'Enter Marks',
    studentFeedback: 'Student Feedback',
    studentDetail: 'Student Detail',
    parentProgress: 'Progress',
    parentAttendance: 'Attendance',
    parentHomework: 'Homework',
    parentFeedback: 'Teacher Feedback',
    documents: 'Documents',
    meetingRequest: 'Request Meeting',
    adminClasses: 'Classes',
    reports: 'Reports',
};

const fallbackStudents: Student[] = [
    {
        id: 'sample-aarav',
        academy_id: '',
        student_id: 'STU-12',
        registration_no: 'REG-12',
        first_name: 'Aarav',
        last_name: 'Sharma',
        date_of_birth: '2015-04-18',
        roll_no: '12',
        class_name: '5',
        class_section: 'A',
        academic_year: '2026',
        is_active: true,
    },
    {
        id: 'sample-riya',
        academy_id: '',
        student_id: 'STU-13',
        registration_no: 'REG-13',
        first_name: 'Riya',
        last_name: 'Verma',
        date_of_birth: '2015-07-20',
        roll_no: '13',
        class_name: '5',
        class_section: 'A',
        academic_year: '2026',
        is_active: true,
    },
    {
        id: 'sample-kabir',
        academy_id: '',
        student_id: 'STU-14',
        registration_no: 'REG-14',
        first_name: 'Kabir',
        last_name: 'Singh',
        date_of_birth: '2015-01-10',
        roll_no: '14',
        class_name: '5',
        class_section: 'A',
        academic_year: '2026',
        is_active: true,
    },
    {
        id: 'sample-anaya',
        academy_id: '',
        student_id: 'STU-15',
        registration_no: 'REG-15',
        first_name: 'Anaya',
        last_name: 'Gupta',
        date_of_birth: '2015-11-02',
        roll_no: '15',
        class_name: '5',
        class_section: 'A',
        academic_year: '2026',
        is_active: true,
    },
];

const subjectScores = [
    { subject: 'Maths', score: 68 },
    { subject: 'Science', score: 84 },
    { subject: 'English', score: 81 },
    { subject: 'SST', score: 76 },
];

const getStudentName = (student: Student) => `${student.first_name || ''} ${student.last_name || ''}`.trim() || student.student_id;

const getGrade = (value: string) => {
    if (value.toUpperCase() === 'AB') return '-';
    const marks = Number(value);
    if (Number.isNaN(marks)) return '-';
    if (marks >= 40) return 'A';
    if (marks >= 32) return 'B';
    if (marks >= 22) return 'C';
    return 'D';
};

const SchoolFlowPage: React.FC<SchoolFlowPageProps> = ({ variant }) => {
    const params = useParams<{ studentId?: string }>();
    const role = useAppSelector((state) => state.auth.role);
    const needsTeacher = ['addHomework', 'enterMarks', 'studentFeedback', 'studentDetail'].includes(variant);
    const needsParent = ['studentDetail', 'parentProgress', 'parentAttendance', 'parentHomework', 'parentFeedback', 'documents', 'meetingRequest'].includes(variant);
    const needsAdmin = ['adminClasses', 'reports'].includes(variant);

    const teacherQuery = useFetchTeacherDashboardQuery(undefined, { skip: !needsTeacher });
    const parentQuery = useFetchParentDashboardQuery(undefined, { skip: !needsParent });
    const classesQuery = useFetchClassesQuery(undefined, { skip: variant !== 'adminClasses' });
    const overviewQuery = useFetchAcademyOverviewQuery(undefined, { skip: !needsAdmin });
    const teacherClasses = teacherQuery.data?.classes || [];
    const firstClass = teacherClasses[0];
    const teacherStudentsQuery = useFetchTeacherStudentsQuery(
        firstClass
            ? {
                class_name: firstClass.class_name,
                class_section: firstClass.section || undefined,
                academic_year: firstClass.academic_year,
            }
            : undefined,
        { skip: !needsTeacher || !firstClass },
    );
    const [assignHomework, assignHomeworkState] = useAssignHomeworkMutation();
    const [toastMsg, setToastMsg] = useState('');
    const [homeworkForm, setHomeworkForm] = useState({
        class_section_id: firstClass?.id || '',
        subject: 'Maths',
        title: 'Fractions Worksheet',
        description: 'Solve Q1-Q10 from chapter 4',
        due_date: '2026-04-20',
        assign_to: 'all' as 'all' | 'selected',
    });
    const [marks, setMarks] = useState<Record<string, string>>({
        'sample-aarav': '42',
        'sample-riya': '37',
        'sample-kabir': '18',
        'sample-anaya': 'AB',
    });
    const [rating, setRating] = useState('Excellent');
    const [parentVisible, setParentVisible] = useState(true);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

    const students = teacherStudentsQuery.data?.length ? teacherStudentsQuery.data : fallbackStudents;
    const children = parentQuery.data?.children || [];
    const selectedChild = useMemo(() => (
        children.find((child) => child.id === selectedChildId)
        || children.find((child) => child.id === params.studentId)
        || children[0]
    ), [children, params.studentId, selectedChildId]);
    const detailStudent = useMemo(() => (
        students.find((student) => student.id === params.studentId)
        || students[0]
    ), [params.studentId, students]);
    const detailName = selectedChild?.display_name || getStudentName(detailStudent);
    const classLabel = selectedChild
        ? `Class ${selectedChild.class_name}${selectedChild.class_section ? ` ${selectedChild.class_section}` : ''}`
        : `Class ${detailStudent.class_name}${detailStudent.class_section ? ` ${detailStudent.class_section}` : ''}`;
    const isLoading = teacherQuery.isFetching || parentQuery.isFetching || classesQuery.isFetching || overviewQuery.isFetching || teacherStudentsQuery.isFetching;

    const publishHomework = async () => {
        const classSectionId = homeworkForm.class_section_id || firstClass?.id;
        if (!classSectionId || !homeworkForm.title.trim()) {
            setToastMsg('Class and title are required.');
            return;
        }

        try {
            await assignHomework({
                class_section_id: classSectionId,
                subject: homeworkForm.subject,
                title: homeworkForm.title.trim(),
                description: homeworkForm.description.trim(),
                due_date: homeworkForm.due_date,
                assign_to: homeworkForm.assign_to,
            }).unwrap();
            setToastMsg('Homework published successfully.');
        } catch (error: any) {
            setToastMsg(error?.data?.error || 'Unable to publish homework right now.');
        }
    };

    const renderStudentSwitcher = () => (
        <div className="school-flow__chips">
            {(children.length ? children : [{ id: detailStudent.id, display_name: detailName }]).map((child: any) => (
                <button
                    key={child.id}
                    type="button"
                    className={(selectedChild?.id || detailStudent.id) === child.id ? 'is-active' : ''}
                    onClick={() => setSelectedChildId(child.id)}
                >
                    {child.display_name}
                </button>
            ))}
            {children.length > 1 && <span>Sibling Quick Switch</span>}
        </div>
    );

    const renderAddHomework = () => (
        <>
            <section className="school-flow__form">
                <label>
                    <span>Class</span>
                    <select
                        value={homeworkForm.class_section_id || firstClass?.id || ''}
                        onChange={(event) => setHomeworkForm((current) => ({ ...current, class_section_id: event.target.value }))}
                    >
                        {teacherClasses.length ? teacherClasses.map((item) => (
                            <option key={item.id} value={item.id}>
                                Grade {item.class_name}{item.section ? ` ${item.section}` : ''}
                            </option>
                        )) : <option value="">Grade 5A</option>}
                    </select>
                </label>
                <label>
                    <span>Subject</span>
                    <select value={homeworkForm.subject} onChange={(event) => setHomeworkForm((current) => ({ ...current, subject: event.target.value }))}>
                        <option>Maths</option>
                        <option>Science</option>
                        <option>English</option>
                    </select>
                </label>
                <label>
                    <span>Title</span>
                    <input value={homeworkForm.title} onChange={(event) => setHomeworkForm((current) => ({ ...current, title: event.target.value }))} />
                </label>
                <label>
                    <span>Description</span>
                    <textarea value={homeworkForm.description} onChange={(event) => setHomeworkForm((current) => ({ ...current, description: event.target.value }))} />
                </label>
                <label>
                    <span>Due Date</span>
                    <input type="date" value={homeworkForm.due_date} onChange={(event) => setHomeworkForm((current) => ({ ...current, due_date: event.target.value }))} />
                </label>
                <label>
                    <span>Attachment</span>
                    <button type="button" className="school-flow__upload">
                        <IonIcon icon={documentAttach} aria-hidden="true" />
                        Upload File
                    </button>
                </label>
                <label>
                    <span>Assign To</span>
                    <select value={homeworkForm.assign_to} onChange={(event) => setHomeworkForm((current) => ({ ...current, assign_to: event.target.value as 'all' | 'selected' }))}>
                        <option value="all">All Students</option>
                        <option value="selected">Selected Students</option>
                    </select>
                </label>
            </section>
            <section className="school-flow__section">
                <h2>Previous Homework</h2>
                <div className="school-flow__stack">
                    {(teacherQuery.data?.assignments?.length ? teacherQuery.data.assignments : [
                        { id: 'decimals', title: 'Decimals Practice', due_date: '12 Apr' },
                        { id: 'tables', title: 'Tables Revision', due_date: '09 Apr' },
                    ]).slice(0, 3).map((item) => (
                        <article key={item.id} className="school-flow__row">
                            <IonIcon icon={documentText} aria-hidden="true" />
                            <span>{item.title} - Due {item.due_date || 'soon'}</span>
                        </article>
                    ))}
                </div>
            </section>
            <section className="school-flow__cta">
                <button type="button" onClick={() => setToastMsg('Draft saved on this device.')}>Save Draft</button>
                <button type="button" className="is-primary" disabled={assignHomeworkState.isLoading} onClick={publishHomework}>
                    {assignHomeworkState.isLoading ? 'Publishing...' : 'Publish Homework'}
                </button>
            </section>
        </>
    );

    const renderEnterMarks = () => (
        <>
            <section className="school-flow__filters">
                <label><span>Class</span><select><option>Grade 5A</option></select></label>
                <label><span>Exam</span><select><option>Unit Test 1</option></select></label>
                <label><span>Subject</span><select><option>Maths</option></select></label>
            </section>
            <section className="school-flow__table" aria-label="Enter marks">
                <div className="school-flow__table-head">
                    <span>Student Name</span><span>Max Marks</span><span>Obtained</span><span>Grade</span><span>Remark</span>
                </div>
                {students.slice(0, 6).map((student, index) => {
                    const value = marks[student.id] ?? ['42', '37', '18', 'AB'][index] ?? '';
                    return (
                        <div key={student.id} className="school-flow__table-row">
                            <strong>{getStudentName(student)}</strong>
                            <span>50</span>
                            <input value={value} onChange={(event) => setMarks((current) => ({ ...current, [student.id]: event.target.value }))} />
                            <span>{getGrade(value)}</span>
                            <input placeholder={value === '18' ? 'Weak' : value.toUpperCase() === 'AB' ? 'Absent' : ''} />
                        </div>
                    );
                })}
            </section>
            <section className="school-flow__cta">
                <button type="button" onClick={() => setToastMsg('Marks draft saved.')}>Save Draft</button>
                <button type="button" className="is-primary" onClick={() => setToastMsg('Marks submitted. Backend table ready in SQL update.')}>Submit Marks</button>
            </section>
        </>
    );

    const renderFeedbackForm = () => (
        <>
            <section className="school-flow__form">
                <label><span>Student</span><select>{students.map((student) => <option key={student.id}>{getStudentName(student)}</option>)}</select></label>
                <label><span>Feedback Type</span><select><option>Academic</option><option>Behavior</option><option>Homework</option></select></label>
                <label><span>Strengths</span><input defaultValue="Participates well in class" /></label>
                <label><span>Weaknesses</span><input defaultValue="Needs practice in word problems" /></label>
                <label><span>Suggestion</span><input defaultValue="Daily 20 min revision at home" /></label>
            </section>
            <section className="school-flow__section">
                <h2>Rating</h2>
                <div className="school-flow__chips">
                    {['Excellent', 'Good', 'Average', 'Weak'].map((item) => (
                        <button key={item} type="button" className={rating === item ? 'is-active' : ''} onClick={() => setRating(item)}>{item}</button>
                    ))}
                    <button type="button" className={parentVisible ? 'is-active' : ''} onClick={() => setParentVisible((current) => !current)}>
                        Parent Visible {parentVisible ? 'ON' : 'OFF'}
                    </button>
                </div>
            </section>
            <section className="school-flow__section">
                <h2>Quick Suggestions</h2>
                <div className="school-flow__chips">
                    {['Needs more revision', 'Good participation', 'Improve writing'].map((item) => <button key={item} type="button">{item}</button>)}
                </div>
            </section>
            <section className="school-flow__cta school-flow__cta--single">
                <button type="button" className="is-primary" onClick={() => setToastMsg('Feedback ready to sync after backend deploy.')}>Submit</button>
            </section>
        </>
    );

    const renderStudentDetail = () => (
        <>
            <section className="school-flow__student-card">
                <UserAvatar size="lg" name={detailName} src={selectedChild?.profile_picture_url || detailStudent.profile_picture_url} />
                <div>
                    <strong>{detailName}</strong>
                    <span>{classLabel} • Roll {selectedChild?.roll_no || detailStudent.roll_no || '12'} • Parent: Mr. Sharma</span>
                    <small>Attendance {selectedChild?.attendance_percentage ?? 91}% | Avg Marks {selectedChild?.avg_marks ?? 78}% | Last Feedback: 10 Apr</small>
                </div>
            </section>
            <nav className="school-flow__tabs" aria-label="Student detail sections">
                {['Overview', 'Attendance', 'Academics', 'Homework', 'Behavior', 'Feedback', 'Documents'].map((tab, index) => (
                    <button key={tab} type="button" className={index === 0 ? 'is-active' : ''}>{tab}</button>
                ))}
            </nav>
            <section className="school-flow__section">
                <h2>Overview</h2>
                <div className="school-flow__bullets">
                    <p>Recent performance improved</p>
                    <p>Needs support in Maths word problems</p>
                    <p>Homework completion: {selectedChild?.homework_completion ?? 85}%</p>
                </div>
            </section>
        </>
    );

    const renderParentProgress = () => (
        <>
            <section className="school-flow__section school-flow__section--first">
                <h2>Student</h2>
                {renderStudentSwitcher()}
            </section>
            <nav className="school-flow__tabs" aria-label="Progress tabs">
                {['Overview', 'Subjects', 'Exams', 'Trend'].map((tab, index) => <button key={tab} type="button" className={index === 0 ? 'is-active' : ''}>{tab}</button>)}
            </nav>
            <section className="school-flow__summary-card">
                <p>Average Score: <strong>{selectedChild?.avg_marks ?? 78}%</strong></p>
                <p>Best Subject: <strong>Science</strong></p>
                <p>Needs Attention: <strong>Maths</strong></p>
            </section>
            <section className="school-flow__section">
                <h2>Subject Cards</h2>
                <div className="school-flow__bars">
                    {subjectScores.map((item) => (
                        <article key={item.subject}>
                            <span>{item.subject}</span>
                            <strong>{item.score}%</strong>
                            <div><i style={{ width: `${item.score}%` }}></i></div>
                        </article>
                    ))}
                </div>
            </section>
        </>
    );

    const renderAttendanceView = () => (
        <>
            <section className="school-flow__summary-card">
                <p>Month: <strong>April 2026</strong></p>
                <p>Attendance: <strong>{selectedChild?.attendance_percentage ?? 91}%</strong></p>
                <p>Present 20 | Absent 2 | Late 1 | Leave 1</p>
            </section>
            <section className="school-flow__calendar">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su', '.', '.', '1P', '2P', '3P', '4A', '5-', '6P', '7P', '8L', '9P', '10P', '11-', '12-', '13P', '14P', '15P', '16P', '17P', '18-', '19-'].map((day, index) => (
                    <span key={`${day}-${index}`} className={day.includes('A') ? 'is-danger' : day.includes('L') ? 'is-warning' : day.includes('P') ? 'is-success' : ''}>{day}</span>
                ))}
            </section>
            <section className="school-flow__section">
                <h2>Notes</h2>
                <div className="school-flow__bullets"><p>Absent on 4 Apr</p><p>Late arrival on 8 Apr</p></div>
            </section>
        </>
    );

    const renderParentHomework = () => {
        const assignments = parentQuery.data?.assignments?.length ? parentQuery.data.assignments : [
            { id: 'fractions', title: 'Maths - Fractions Worksheet', due_date: '20 Apr 2026', status: 'pending' },
            { id: 'reading', title: 'English - Reading Task', due_date: '18 Apr 2026', status: 'submitted', teacher_remark: 'Good effort' },
        ];

        return (
            <>
                <div className="school-flow__chips">{['All', 'Pending', 'Submitted', 'Late'].map((item, index) => <button key={item} type="button" className={index === 0 ? 'is-active' : ''}>{item}</button>)}</div>
                <div className="school-flow__stack">
                    {assignments.map((item) => (
                        <article key={item.id} className="school-flow__homework-card">
                            <strong>{item.title}</strong>
                            <span>Due: {item.due_date || 'Not set'}</span>
                            <span>Status: {item.status || 'Pending'}</span>
                            {item.teacher_remark && <span>Teacher Remark: {item.teacher_remark}</span>}
                            <button type="button">Open Attachment</button>
                        </article>
                    ))}
                </div>
            </>
        );
    };

    const renderTeacherFeedback = () => {
        const feedback = parentQuery.data?.feedback?.length ? parentQuery.data.feedback : [
            {
                id: '17-apr',
                teacher_name: 'Ms. Neha',
                date: '17 Apr 2026',
                strengths: 'Active in class discussion',
                weaknesses: 'Needs better speed in problem solving',
                suggestion: 'Practice worksheets regularly',
            },
            {
                id: '03-apr',
                teacher_name: 'Ms. Neha',
                date: '03 Apr 2026',
                strengths: 'Improved homework consistency',
                weaknesses: 'Careless mistakes',
            },
        ];

        return (
            <>
                <section className="school-flow__section school-flow__section--first">
                    <h2>Recommended Parent Actions</h2>
                    <div className="school-flow__bullets"><p>Daily 20 min maths practice</p><p>Encourage reading aloud</p></div>
                </section>
                <div className="school-flow__stack">
                    {feedback.map((item) => (
                        <article key={item.id} className="school-flow__feedback-card">
                            <strong>Teacher: {item.teacher_name}</strong>
                            <span>Date: {item.date}</span>
                            <span>Strengths: {item.strengths}</span>
                            <span>Weaknesses: {item.weaknesses}</span>
                            {item.suggestion && <span>Suggestion: {item.suggestion}</span>}
                        </article>
                    ))}
                </div>
            </>
        );
    };

    const renderDocuments = () => {
        const docs = parentQuery.data?.documents?.length ? parentQuery.data.documents : [
            { id: 'report', title: 'Report Card - Unit Test 1', type: 'Report Cards', uploaded_at: '15 Apr 2026' },
            { id: 'certificate', title: 'Participation Certificate', type: 'Certificates', uploaded_at: '28 Mar 2026' },
        ];

        return (
            <>
                <div className="school-flow__chips">{['All', 'Report Cards', 'Certificates', 'Medical'].map((item, index) => <button key={item} type="button" className={index === 0 ? 'is-active' : ''}>{item}</button>)}</div>
                <div className="school-flow__stack">
                    {docs.map((doc) => (
                        <article key={doc.id} className="school-flow__document-card">
                            <IonIcon icon={documentText} aria-hidden="true" />
                            <div>
                                <strong>{doc.title}</strong>
                                <span>Uploaded: {doc.uploaded_at}</span>
                                <div>
                                    <button type="button">View {doc.type === 'Report Cards' ? 'PDF' : 'Image'}</button>
                                    <button type="button"><IonIcon icon={cloudDownload} aria-hidden="true" />Download</button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </>
        );
    };

    const renderMeetingRequest = () => (
        <>
            <section className="school-flow__form">
                <label><span>Child</span><select>{children.map((child) => <option key={child.id}>{child.display_name}</option>)}{!children.length && <option>Aarav Sharma</option>}</select></label>
                <label><span>Teacher</span><select><option>Ms. Neha</option></select></label>
                <label><span>Preferred Date</span><input type="date" defaultValue="2026-04-22" /></label>
                <label><span>Preferred Time</span><input type="time" defaultValue="11:30" /></label>
                <label><span>Purpose</span><input defaultValue="Discuss maths improvement" /></label>
            </section>
            <section className="school-flow__section">
                <h2>Previous Requests</h2>
                <div className="school-flow__stack">
                    {(parentQuery.data?.meetings?.length ? parentQuery.data.meetings : [
                        { id: '12-apr', status: 'Pending', scheduled_time: '12 Apr' },
                        { id: '28-mar', status: 'Completed', scheduled_time: '28 Mar' },
                    ]).map((item: any) => (
                        <article key={item.id} className="school-flow__row">
                            <IonIcon icon={calendarClear} aria-hidden="true" />
                            <span>{item.scheduled_time ? String(item.scheduled_time).slice(0, 10) : 'Requested'} - {item.status}</span>
                        </article>
                    ))}
                </div>
            </section>
            <section className="school-flow__cta school-flow__cta--single">
                <button type="button" className="is-primary" onClick={() => setToastMsg('Meeting request prepared for backend sync.')}>
                    <IonIcon icon={send} aria-hidden="true" />
                    Send
                </button>
            </section>
        </>
    );

    const renderAdminClasses = () => (
        <>
            <section className="school-flow__table school-flow__table--classes">
                <div className="school-flow__table-head"><span>Class</span><span>Section</span><span>Teacher</span><span>Students</span><span>Actions</span></div>
                {(classesQuery.data?.length ? classesQuery.data : [
                    { id: '5a', class_name: '5', section: 'A', teacher_name: 'Ms. Neha', student_count: 38 },
                    { id: '6b', class_name: '6', section: 'B', teacher_name: 'Mr. Raj', student_count: 42 },
                ] as any[]).map((item: any) => (
                    <div key={item.id} className="school-flow__table-row">
                        <strong>{item.class_name}</strong>
                        <span>{item.section || '-'}</span>
                        <span>{item.teacher_name || 'Unassigned'}</span>
                        <span>{item.student_count || 0}</span>
                        <span><button type="button">View</button> <button type="button">Edit</button></span>
                    </div>
                ))}
            </section>
            <section className="school-flow__section">
                <h2>Inside Class View</h2>
                <div className="school-flow__bullets">
                    <p>Students list</p><p>Assigned subjects</p><p>Teacher mapping</p><p>Performance summary</p>
                </div>
            </section>
        </>
    );

    const renderReports = () => (
        <>
            <section className="school-flow__filters">
                <label><span>Class</span><select><option>All Classes</option><option>Grade 5A</option></select></label>
                <label><span>Date Range</span><select><option>April 2026</option><option>Current Session</option></select></label>
            </section>
            <section className="school-flow__report-cards">
                <article><IonIcon icon={calendarClear} aria-hidden="true" /><span>Avg Attendance</span><strong>{overviewQuery.data?.metrics.attendance_today ?? 89}%</strong></article>
                <article><IonIcon icon={barChart} aria-hidden="true" /><span>Avg Marks</span><strong>74%</strong></article>
                <article><IonIcon icon={checkmarkCircle} aria-hidden="true" /><span>HW Completion</span><strong>81%</strong></article>
            </section>
            <section className="school-flow__graph">
                <h2>Graph Section</h2>
                <div><span style={{ height: '72%' }}></span><span style={{ height: '54%' }}></span><span style={{ height: '86%' }}></span><span style={{ height: '64%' }}></span></div>
                <p>Attendance trend • Marks distribution • Class comparison</p>
            </section>
        </>
    );

    const renderContent = () => {
        switch (variant) {
            case 'addHomework': return renderAddHomework();
            case 'enterMarks': return renderEnterMarks();
            case 'studentFeedback': return renderFeedbackForm();
            case 'studentDetail': return renderStudentDetail();
            case 'parentProgress': return renderParentProgress();
            case 'parentAttendance': return renderAttendanceView();
            case 'parentHomework': return renderParentHomework();
            case 'parentFeedback': return renderTeacherFeedback();
            case 'documents': return renderDocuments();
            case 'meetingRequest': return renderMeetingRequest();
            case 'adminClasses': return renderAdminClasses();
            case 'reports': return renderReports();
            default: return null;
        }
    };

    const backHref = role === 'parent' ? '/parent-dashboard' : role === 'teacher' ? '/teacher-dashboard' : '/academy-dashboard';

    return (
        <IonPage className={`am-page school-flow-page school-flow-page--${variant}`}>
            <AppHeader title={titles[variant]} showBack backHref={backHref} />
            <IonContent className="am-content" fullscreen>
                <main className="school-flow__scroll">
                    <section className="school-flow__brand-strip">
                        <span>EduCore</span>
                        <strong>Smart School. Smart Parents.</strong>
                    </section>
                    {isLoading ? (
                        <section className="school-flow__state">
                            <IonSpinner name="crescent" />
                            <span>Loading {titles[variant].toLowerCase()}...</span>
                        </section>
                    ) : (
                        renderContent()
                    )}
                </main>
                <IonToast isOpen={Boolean(toastMsg)} message={toastMsg} duration={2200} onDidDismiss={() => setToastMsg('')} />
            </IonContent>
            <AppFooter />
        </IonPage>
    );
};

export default SchoolFlowPage;
