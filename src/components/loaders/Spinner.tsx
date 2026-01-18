import React from 'react';
import { IonSpinner } from '@ionic/react';

interface SpinnerProps {
    color?: string;
    name?: 'crescent' | 'dots' | 'circles';
    size?: 'small' | 'default' | 'large';
}

const Spinner: React.FC<SpinnerProps> = ({
    color = 'primary',
    name = 'crescent',
    size = 'default',
}) => <IonSpinner color={color} name={name} style={{ fontSize: size === 'small' ? 20 : size === 'large' ? 40 : 30 }} />;

export default Spinner;
