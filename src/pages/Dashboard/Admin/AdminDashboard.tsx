import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonLabel, IonButton, IonLoading, IonToast } from '@ionic/react';
import { fetchUsers, deleteUser } from '../../../redux/slices/usersSlice';
import { useTypedDispatch, useTypedSelector } from '../../../redux/store';

const AdminDashboard: React.FC = () => {
    const dispatch = useTypedDispatch();
    const { users, loading, error } = useTypedSelector(state => state.users);
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    useEffect(() => {
        if (error) setToastMsg(error);
    }, [error]);

    const handleDeleteUser = async (id: string) => {
        try {
            await dispatch(deleteUser(id)).unwrap();
            setToastMsg('User deleted successfully');
            dispatch(fetchUsers());
        } catch {
            setToastMsg('Failed to delete user');
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar><IonTitle>Admin Dashboard</IonTitle></IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {loading && <IonLoading isOpen message="Loading users..." />}
                <IonList>
                    {users.map((user) => (
                        <IonItem key={user.id}>
                            <IonLabel>{user.first_name} {user.last_name} ({user.role})</IonLabel>
                            <IonButton color="danger" size="small" onClick={() => handleDeleteUser(user.id)}>Delete</IonButton>
                        </IonItem>
                    ))}
                </IonList>
                <IonToast isOpen={!!toastMsg} message={toastMsg || ''} duration={2000} onDidDismiss={() => setToastMsg(null)} />
            </IonContent>
        </IonPage>
    );
};

export default AdminDashboard;
