import React from 'react';
import { Route, Redirect, RouteProps, RouteComponentProps } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';

interface PrivateRouteProps extends RouteProps {
    component: React.ComponentType<any>;
    allowedRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, allowedRoles, ...rest }) => {
    const { user, role } = useAppSelector((state) => state.auth);

    return (
        <Route
            {...rest}
            render={props => {
                if (!user) {
                    return <Redirect to="/login" />;
                }

                if (allowedRoles && !allowedRoles.includes(role || '')) {
                    return <Redirect to="/" />;
                }

                return <Component {...props} />;
            }}
        />
    );
};

export default PrivateRoute;
