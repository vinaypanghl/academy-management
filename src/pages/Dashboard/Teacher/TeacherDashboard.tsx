// src/pages/dashboard/TeacherDashboard.tsx
import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';

const TeacherDashboard: React.FC = () => {
    return (
        <IonPage id="main-content">
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Teacher Dashboard</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <h2>Welcome, Teacher!</h2>
                <p>View your classes, attendance, grades, and assignments.</p>
            </IonContent>
        </IonPage>
    );
};

export default TeacherDashboard;
