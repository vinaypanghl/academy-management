import React from 'react';
import { IonItem, IonLabel, IonSelect, IonSelectOption, IonText } from '@ionic/react';
import { useField } from 'formik';

type LabelPlacement = 'floating' | 'fixed' | 'stacked';

interface SelectFieldProps {
    name: string;
    label: string;
    placeholder?: string;
    multiple?: boolean;
    options: { value: string; label: string }[];
    value?: string | string[];
    onIonChange?: (e: any) => void;
    labelPlacement?: LabelPlacement;
    error?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
    name,
    label,
    placeholder,
    multiple = false,
    options,
    value: externalValue,
    onIonChange: externalOnChange,
    labelPlacement = 'stacked',
    error,
}) => {
    let field, meta, helpers;

    // Try to bind to Formik if available
    try {
        [field, meta, helpers] = useField(name);
    } catch {
        field = { name, value: externalValue || '', onChange: () => {} };
        meta = { touched: false, error: '' };
        helpers = { setValue: () => {} };
    }

    const handleChange = (e: CustomEvent) => {
        const val = e.detail.value;
        helpers.setValue(val);
        if (externalOnChange) externalOnChange(e);
    };

    return (
        <>
            <IonItem>
                <IonLabel position={labelPlacement}>{label}</IonLabel>
                <IonSelect
                    multiple={multiple}
                    placeholder={placeholder}
                    value={externalValue !== undefined ? externalValue : field.value || ''}
                    onIonChange={handleChange}
                >
                    {options.map((opt, index) => (
                        <IonSelectOption key={`${opt.value}-${index}`} value={opt.value}>
                            {opt.label}
                        </IonSelectOption>
                    ))}
                </IonSelect>
            </IonItem>

            {(meta.touched && meta.error) || error ? (
                <IonText color="danger" className="ion-padding-start">
                    {error || meta.error}
                </IonText>
            ) : null}
        </>
    );
};

export default SelectField;
