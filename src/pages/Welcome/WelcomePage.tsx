// src/pages/Welcome/WelcomePage.tsx

import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonImg, IonText } from '@ionic/react';
import { useHistory } from 'react-router-dom';

const WelcomePage: React.FC = () => {
    const history = useHistory();

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Welcome</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className="ion-padding ion-text-center">
                <IonImg src="/assets/logo.png" alt="App Logo" style={{ maxWidth: '150px', margin: 'auto' }} />
                <IonButton expand="block" onClick={() => history.push('/register')}>
                    Register Your Academy
                </IonButton>

                <IonText>
                    Already a member?{' '}
                    <IonButton fill="clear" onClick={() => history.push('/login')}>
                        Login
                    </IonButton>
                </IonText>
            </IonContent>
        </IonPage>
    );
};

export default WelcomePage;
