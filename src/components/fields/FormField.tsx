import React from 'react';
import { IonInput, IonItem, IonLabel, IonText } from '@ionic/react';
import { useField } from 'formik';

type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';

interface InputFieldProps {
    name: string;
    label: string;
    type?: InputType;
    placeholder?: string;
    labelPlacement?: 'floating' | 'fixed' | 'start' | 'end' | 'stacked';
    value?: string;
    onIonChange?: (e: any) => void;
}

const InputField: React.FC<InputFieldProps> = ({ name, label, type = 'text', placeholder, labelPlacement = 'stacked', value: externalValue, onIonChange: externalOnChange }) => {
    const [field, meta, helpers] = useField(name);
    const handleChange = (e: CustomEvent) => {
        const val = e.detail.value;
        helpers.setValue(val); // update Formik
        if (externalOnChange) externalOnChange(e);
    };
    return (
        <>
            <IonItem>
                <IonInput 
                    label={label}
                    labelPlacement={labelPlacement}

                    {...field}
                    type={type}
                    placeholder={placeholder}
                    value={externalValue !== undefined ? externalValue : field.value || ''}
                    onIonChange={handleChange}
                >
                </IonInput>
            </IonItem>
            {meta.touched && meta.error && (
                <IonText color="danger" className="ion-padding-start">
                    {meta.error}
                </IonText>
            )}
        </>
    );
};

export default InputField;
