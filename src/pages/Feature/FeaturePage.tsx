import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import AppFooter from '../../components/layout/AppFooter';
import AppHeader from '../../components/layout/AppHeader';

interface FeaturePageProps {
    title: string;
    eyebrow?: string;
}

const FeaturePage: React.FC<FeaturePageProps> = ({ title, eyebrow = 'Academy Workspace' }) => (
    <IonPage className="am-page feature-page">
        <AppHeader title={title} />
        <IonContent className="am-content" fullscreen>
            <main className="am-scroll feature-page__body">
                <span className="am-kicker">{eyebrow}</span>
                <h1>{title}</h1>
                <p>This workspace is ready for the next product pass.</p>
            </main>
        </IonContent>
        <AppFooter />
    </IonPage>
);

export default FeaturePage;
