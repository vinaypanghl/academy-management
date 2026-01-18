import React, { useEffect } from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Switch, Route, Redirect } from 'react-router-dom';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, useTypedDispatch } from './redux/store';

import WelcomePage from './pages/Welcome/WelcomePage';
import RegisterPage from './pages/Register/RegisterPage';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/Login/LoginPage';
import AcademyDashboard from './pages/Dashboard/Academy/AcademyDashboard';
import Sidebar from './components/Sidebar';
import { supabase } from './services/apiClient';
import { clearCredentials, rehydrateUser } from './redux/slices/authSlice';
import TeacherDashboard from './pages/Dashboard/Teacher/TeacherDashboard';
import ParentDashboard from './pages/Dashboard/Parent/ParentDashboard';


setupIonicReact();

const App = () => {
    const dispatch = useTypedDispatch();

    useEffect(() => {
        dispatch(rehydrateUser());

        const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                dispatch(clearCredentials());
            } else if (session?.user) {
                dispatch(rehydrateUser());
            }
        });

        return () => {
            subscription.subscription.unsubscribe();
        };
    }, [dispatch]);
    return (
        <>
            <Sidebar />
            <IonRouterOutlet id='main-content'>
                <Switch>
                    <Route exact path="/" component={WelcomePage} />
                    <Route exact path="/register" component={RegisterPage} />
                    <Route exact path="/login" component={LoginPage} />

                    <PrivateRoute
                        exact
                        path="/academy-dashboard"
                        component={AcademyDashboard}
                        allowedRoles={['academy', 'admin']}
                    />
                    <PrivateRoute
                        exact
                        path="/teacher-dashboard"
                        component={TeacherDashboard}
                        allowedRoles={['teacher']}
                    />
                    <PrivateRoute
                        exact
                        path="/parent-dashboard"
                        component={ParentDashboard}
                        allowedRoles={['parent']}
                    />
                    <Route render={() => <Redirect to="/" />} />
                </Switch>
            </IonRouterOutlet>
        </>
    );
};

export default App;
