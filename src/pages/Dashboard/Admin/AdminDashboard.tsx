import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import AppFooter from '../../../components/layout/AppFooter';
import AppHeader from '../../../components/layout/AppHeader';

const AdminDashboard: React.FC = () => (
    <IonPage className="am-page feature-page">
        <AppHeader title="Admin Dashboard" />
        <IonContent className="am-content" fullscreen>
            <main className="am-scroll feature-page__body">
                <span className="am-kicker">Academy / Admin</span>
                <h1>Admin Dashboard</h1>
                <p>Manage institutional users, classes, student registration, and parent connections from the menu.</p>
            </main>
        </IonContent>
        <AppFooter />
    </IonPage>
);

export default AdminDashboard;
