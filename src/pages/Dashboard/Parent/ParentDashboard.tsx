// src/pages/dashboard/ParentDashboard.tsx
import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';

const ParentDashboard: React.FC = () => {
    return (
        <IonPage id="main-content">
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Parent Dashboard</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <h2>Welcome, Parent!</h2>
                <p>Check your child’s attendance, grades, assignments, and announcements.</p>
            </IonContent>
        </IonPage>
    );
};

export default ParentDashboard;
