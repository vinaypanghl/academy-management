import React from 'react';
import { IonItem, IonLabel, IonSelect, IonSelectOption, IonText } from '@ionic/react';
import type { SelectCustomEvent } from '@ionic/core';
import { useField } from 'formik';

type LabelPlacement = 'floating' | 'fixed' | 'stacked' | 'outside';
type SelectValue = string | string[];

interface SelectFieldProps<T extends SelectValue = string> {
    name: string;
    label: string;
    placeholder?: string;
    multiple?: boolean;
    options: { value: string; label: string }[];
    value?: T;
    onIonChange?: (e: SelectCustomEvent<T>) => void;
    labelPlacement?: LabelPlacement;
    error?: string;
    className?: string;
    required?: boolean;
}

const SelectField = <T extends SelectValue = string>({
    name,
    label,
    placeholder,
    multiple = false,
    options,
    value: externalValue,
    onIonChange: externalOnChange,
    labelPlacement = 'stacked',
    error,
    className,
    required = false,
}: SelectFieldProps<T>) => {
    let field, meta, helpers;
    const outsideLabel = labelPlacement === 'outside';
    const selectId = `select-${name}`;

    // Try to bind to Formik if available
    try {
        [field, meta, helpers] = useField(name);
    } catch {
        field = { name, value: externalValue || '', onChange: () => {} };
        meta = { touched: false, error: '' };
        helpers = { setValue: () => {} };
    }

    const handleChange = (e: SelectCustomEvent<T>) => {
        const val = e.detail.value;
        helpers.setValue(val);
        if (externalOnChange) externalOnChange(e);
    };

    return (
        <div className={`select-field ${className || ''}`}>
            {outsideLabel && (
                <label className="select-field__label" htmlFor={selectId}>
                    {label}
                    {required && <span className="select-field__required"> *</span>}
                </label>
            )}
            <IonItem className="select-field__item" lines="none">
                {!outsideLabel && (
                    <IonLabel position={labelPlacement}>
                        {label}
                        {required && <span className="select-field__required"> *</span>}
                    </IonLabel>
                )}
                <IonSelect
                    id={selectId}
                    className="select-field__select"
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
                <IonText color="danger" className="select-field__error">
                    <span>{error || meta.error}</span>
                </IonText>
            ) : null}
        </div>
    );
};

export default SelectField;
