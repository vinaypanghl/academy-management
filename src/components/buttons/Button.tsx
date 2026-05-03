import React from 'react';
import { IonButton } from '@ionic/react';

interface ButtonProps {
    onClick?: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    type?: 'button' | 'submit' | 'reset';
    color?: string;
    className?: string;
}

const Button: React.FC<ButtonProps> = ({
    onClick,
    disabled = false,
    children,
    type = 'button',
    color = 'primary',
    className,
}) => (
    <IonButton onClick={onClick} disabled={disabled} type={type} color={color} expand="block" className={className}>
        {children}
    </IonButton>
);

export default Button;
