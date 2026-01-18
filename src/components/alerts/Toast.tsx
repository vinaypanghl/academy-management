import React from 'react';
import { IonToast } from '@ionic/react';

interface ToastProps {
    isOpen: boolean;
    message: string;
    color?: string;
    duration?: number;
    onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({
    isOpen,
    message,
    color = 'primary',
    duration = 2000,
    onDismiss,
}) => (
    <IonToast
        isOpen={isOpen}
        message={message}
        color={color}
        duration={duration}
        onDidDismiss={onDismiss}
        position="bottom"
    />
);

export default Toast;
