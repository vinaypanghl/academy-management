import React, { useEffect, useState } from 'react';
import {
    IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonGrid, IonRow, IonCol,
    IonButton, IonIcon, IonToast, IonMenuButton, IonButtons,
} from '@ionic/react';
import { schoolOutline, personAddOutline, peopleOutline, personOutline } from 'ionicons/icons';
import { useCreateClassesMutation, useCreateStudentsMutation, useFetchClassesQuery } from '../../../redux/api/api';
import CreateClassModal from '../../../components/modals/Classes/ClassCreateModal';
import CreateStudentModal from '../../../components/modals/Student/StudentCreateModal';
import { CreateStudentInput, ParentInput, Student } from '../../../types';
import CreateStaffModal from '../../../components/modals/Users/CreateStaffModal';
import { useAppSelector } from '../../../redux/hooks';
// import CreateUserModal from '../../../components/modals/UserCreateModal';
// types.ts
  
const AcademyDashboard: React.FC = () => {
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const [classModalOpen, setClassModalOpen] = useState(false);
    const [studentModalOpen, setStudentModalOpen] = useState(false);
    const [userModalOpen, setUserModalOpen] = useState(false);

    const [createClass, { isLoading: creatingClass }] = useCreateClassesMutation();
    const [createStudent, { isLoading: creatingStudent }] = useCreateStudentsMutation();
    const { data: classes = [], error: classesError } = useFetchClassesQuery();

    const [createAdminOpen, setCreateAdminOpen] = useState(false);
    const [createTeacherOpen, setCreateTeacherOpen] = useState(false);

    const currentUser = useAppSelector((state) => state.auth.user);
    const role = currentUser?.role;

    const handleCreateClass = async (classData: Partial<any>) => {
        try {
            const result = await createClass(classData).unwrap();
            setToastMsg(result.message || 'Class created successfully');
            setClassModalOpen(false);
        } catch (err: any) {
            setToastMsg(err.data?.error || 'Failed to create class');
        }
    };

    const handleCreateStudent = async (studentData: CreateStudentInput) => {
        try {
            const result = await createStudent(studentData).unwrap();
            setToastMsg(result.message || 'Student created successfully');
            setStudentModalOpen(false);
        } catch (err: any) {
            console.error('Create student error:', err);
            setToastMsg(err.data?.error || 'Failed to create student');
        }
    };

    const sanitizedClasses = classes.map(c => ({
        ...c,
        section: c.section ?? undefined,
    }));


    return (
        <IonPage id="main-content">
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Menu</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonGrid>
                    <IonRow className="ion-justify-content-around ion-margin-bottom">
                        <IonCol size="12" sizeMd="4">
                            <IonButton expand="block" color="primary" onClick={() => setClassModalOpen(true)}>
                                <IonIcon icon={schoolOutline} slot="start" />
                                Create Class
                            </IonButton>
                        </IonCol>

                        <IonCol size="12" sizeMd="4">
                            <IonButton expand="block" color="secondary" onClick={() => setStudentModalOpen(true)}>
                                <IonIcon icon={personAddOutline} slot="start" />
                                Create Student
                            </IonButton>
                        </IonCol>

                        {/* <IonCol size="12" sizeMd="4">
                            <IonButton expand="block" color="tertiary" onClick={() => setUserModalOpen(true)}>
                                <IonIcon icon={peopleOutline} slot="start" />
                                Create Account
                            </IonButton>
                        </IonCol> */}
                        {/* Academy ONLY */}
                        {role === 'academy' && (
                        <IonCol size="12" sizeMd="4">
                            <IonButton expand="block" color="tertiary" onClick={() => setCreateAdminOpen(true)}>
                            <IonIcon icon={peopleOutline} slot="start" />
                            Create Admin
                            </IonButton>
                        </IonCol>
                        )}

                        {/* Academy + Admin */}
                        {(role === 'academy' || role === 'admin') && (
                        <IonCol size="12" sizeMd="4">
                            <IonButton expand="block" color="medium" onClick={() => setCreateTeacherOpen(true)}>
                            <IonIcon icon={personOutline} slot="start" />
                            Create Teacher
                            </IonButton>
                        </IonCol>
                        )}
                    </IonRow>
                </IonGrid>

                <CreateClassModal
                    isOpen={classModalOpen}
                    onClose={() => setClassModalOpen(false)}
                    onCreate={handleCreateClass}
                    isSubmitting={creatingClass}
                />

                <CreateStudentModal
                    isOpen={studentModalOpen}
                    onClose={() => setStudentModalOpen(false)}
                    onCreate={handleCreateStudent}
                    isSubmitting={creatingStudent}
                    classes={sanitizedClasses}
                />

                {/* <CreateUserModal
                    isOpen={userModalOpen}
                    onClose={() => setUserModalOpen(false)} 
                    currentUserRole={currentUserRole}
                /> */}
                <CreateStaffModal
                    isOpen={createAdminOpen}
                    onClose={() => setCreateAdminOpen(false)}
                    role="admin"
                />

                <CreateStaffModal
                    isOpen={createTeacherOpen}
                    onClose={() => setCreateTeacherOpen(false)}
                    role="teacher"
                />

                <IonToast
                    isOpen={!!toastMsg}
                    message={toastMsg || ''}
                    duration={2000}
                    onDidDismiss={() => setToastMsg(null)}
                />
            </IonContent>
        </IonPage>
    );
};

export default AcademyDashboard;
