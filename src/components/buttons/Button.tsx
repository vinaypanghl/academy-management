import React from 'react';
import { IonButton } from '@ionic/react';

interface ButtonProps {
    onClick?: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    type?: 'button' | 'submit' | 'reset';
    color?: string;
}

const Button: React.FC<ButtonProps> = ({
    onClick,
    disabled = false,
    children,
    type = 'button',
    color = 'primary',
}) => (
    <IonButton onClick={onClick} disabled={disabled} type={type} color={color} expand="block">
        {children}
    </IonButton>
);

export default Button;
