// src/pages/Welcome/WelcomePage.tsx

import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonImg, IonText } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Welcome.scss';

const WelcomePage: React.FC = () => {
    const history = useHistory();

    return (
        // <IonPage>
        //     <IonContent fullscreen className="ion-padding ion-text-center">
        //         <IonImg src="/assets/logo.png" alt="App Logo" style={{ maxWidth: '150px', margin: 'auto' }} />
        //         <IonButton expand="block" onClick={() => history.push('/register')}>
        //             Register Your Academy
        //         </IonButton>

        //         <IonText>
        //             Already a member?{' '}
        //             <IonButton fill="clear" onClick={() => history.push('/login')}>
        //                 Login
        //             </IonButton>
        //         </IonText>
        //     </IonContent>
        // </IonPage>
        <IonPage>
            <IonContent fullscreen className="welcome-page">
                <div className="welcome-container">
                    <div className="glow-top"></div>
                    <div className="glow-bottom"></div>
                    <div className="welcome-card">
                        <div className="logo-box">
                            <IonImg className="logo-img" src="/assets/academy-logo.png" alt="App Logo" />
                            {/* <img
                                src="/assets/academy-logo.png"
                                alt="logo"
                                className="logo-img"
                            /> */}
                        </div>
                        <div className="brand">EduCore</div>
                        <h1 className="title">Smart School. Smart Parents.</h1>
                        <p className="subtitle">
                            Clear dashboards for teachers, parents, and academy teams.
                        </p>
                        <IonButton
                            expand="block"
                            className="register-btn primary-btn"
                            onClick={() => history.push('/register')}
                        >
                            Register Your Academy
                        </IonButton>

                        {/* <div className="login-text">Already a member?</div> */}
                        <IonText>
                            Already a member?{' '}
                            <a
                                className="login-btn"
                                onClick={() => history.push('/login')}
                            >
                                Login
                            </a>
                        </IonText>
                    </div>
                </div>
            </IonContent>
        </IonPage >
    );
};

export default WelcomePage;
