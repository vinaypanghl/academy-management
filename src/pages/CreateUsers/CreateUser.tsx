// import React, { useEffect, useState } from 'react';
// import { useHistory } from 'react-router-dom';
// import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonLabel, IonButton, IonToast, IonLoading } from '@ionic/react';
// import { useAppDispatch, useAppSelector } from '../../redux/hooks';
// import CreateUserModal from '../../components/modals/UserCreateModal';

// const CreateUsers: React.FC = () => {
//     const dispatch = useAppDispatch();
//     const history = useHistory();
//     const [modalOpen, setModalOpen] = useState(false);
//     const [toastMessage, setToastMessage] = useState('');

//     const handleDeleteUser = async () => {
//         try {
//             setToastMessage('User deleted');
//         } catch {
//             setToastMessage('Failed to delete user');
//         }
//     };

//     const handleCreateUser = async () => {
//         try {
//             setToastMessage('User created successfully! Redirecting...');
//             setModalOpen(false);
//             setTimeout(() => {
//                 setToastMessage('');
//                 history.push('/users');
//             }, 2000);
//         } catch {
//             setToastMessage('Failed to create user');
//         }
//     };

//     return (
//         <IonPage id='main-content'>
//             <IonHeader>
//                 <IonToolbar><IonTitle>User Management</IonTitle></IonToolbar>
//             </IonHeader>
//             <IonContent fullscreen={true} className="ion-padding">
//                 <IonList>
//                     <IonItem>
//                         <IonLabel></IonLabel>
//                         <IonButton color="danger" size="small" onClick={() => handleDeleteUser()}>Delete</IonButton>
//                     </IonItem>
//                 </IonList>
//                 <IonButton 
//                     expand="block" 
//                     onClick={() => setModalOpen(true)}
//                 >
//                     Create User
//                 </IonButton>
//                 <CreateUserModal
//                     isOpen={modalOpen}
//                     onClose={() => setModalOpen(false)}
//                     currentUserRole={currentUserRole}
//                     onCreate={handleCreateUser}
//                 />
//                 <IonToast isOpen={!!toastMessage} message={toastMessage} duration={2000} onDidDismiss={() => setToastMessage('')} />
//             </IonContent>
//         </IonPage>
//     );
// };

// export default CreateUsers;
