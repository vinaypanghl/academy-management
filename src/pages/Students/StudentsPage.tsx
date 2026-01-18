// import React, { useEffect, useState } from 'react';
// import {
//     IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
//     IonList, IonItem, IonLabel, IonToast, IonLoading
// } from '@ionic/react';
// import { useAppDispatch, useAppSelector } from '../../redux/hooks';
// import { fetchStudents, deleteStudent, createStudent } from '../../redux/slices/studentsSlice';
// import CreateStudentModal from '../../components/modals/StudentCreateModal';
// import { Student, Role } from '../../types';

// const StudentsPage: React.FC = () => {
//     const dispatch = useAppDispatch();
//     const { students, loading, error } = useAppSelector(state => state.students);
//     const { role: currentUserRole } = useAppSelector(state => state.auth);
//     const [modalOpen, setModalOpen] = useState(false);
//     const [toastMessage, setToastMessage] = useState('');

//     const canManage = currentUserRole === 'academy' || currentUserRole === 'admin';

//     useEffect(() => {
//         dispatch(fetchStudents());
//     }, [dispatch]);

//     const handleDelete = async (id: string) => {
//         try {
//             await dispatch(deleteStudent(id)).unwrap();
//             setToastMessage('Student deleted');
//         } catch {
//             setToastMessage('Failed to delete student');
//         }
//     };

//     const handleCreate = async (studentData: Partial<Student>) => {
//         try {
//             await dispatch(createStudent(studentData)).unwrap();
//             setToastMessage('Student created');
//             dispatch(fetchStudents());
//         } catch {
//             setToastMessage('Failed to create student');
//         }
//     };

//     return (
//         <IonPage>
//             <IonHeader>
//                 <IonToolbar><IonTitle>Students</IonTitle></IonToolbar>
//             </IonHeader>
//             <IonContent>
//                 {loading && <IonLoading isOpen message="Loading students..." />}
//                 {error && <IonToast isOpen message={error} color="danger" duration={2000} onDidDismiss={() => setToastMessage('')} />}
//                 <IonList>
//                     {students.map(student => (
//                         <IonItem key={student.id}>
//                             <IonLabel>{student.first_name} {student.last_name} - {student.class_name} {student.class_section || ''}</IonLabel>
//                             {canManage && (
//                                 <IonButton color="danger" size="small" onClick={() => handleDelete(student.id)}>Delete</IonButton>
//                             )}
//                         </IonItem>
//                     ))}
//                 </IonList>
//                 {canManage && (
//                     <IonButton expand="block" onClick={() => setModalOpen(true)}>Create Student</IonButton>
//                 )}
//                 <CreateStudentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreate} parents={[]} classes={[]} />
//                 <IonToast isOpen={!!toastMessage} message={toastMessage} duration={2000} onDidDismiss={() => setToastMessage('')} />
//             </IonContent>
//         </IonPage>
//     );
// }

// export default StudentsPage;
