import React from 'react';
import { IonInput, IonInputPasswordToggle, IonItem, IonText } from '@ionic/react';
import type { InputCustomEvent } from '@ionic/core';
import { useField } from 'formik';

type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
type LabelPlacement = 'floating' | 'fixed' | 'start' | 'end' | 'stacked' | 'outside';

interface InputFieldProps {
    name: string;
    label: string;
    type?: InputType;
    placeholder?: string;
    labelPlacement?: LabelPlacement;
    value?: string;
    onIonChange?: (e: InputCustomEvent) => void;
    className?: string;
    helperText?: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    labelAction?: React.ReactNode;
    showPasswordToggle?: boolean;
    required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
    name,
    label,
    type = 'text',
    placeholder,
    labelPlacement = 'stacked',
    value: externalValue,
    onIonChange: externalOnChange,
    className,
    helperText,
    prefix,
    suffix,
    labelAction,
    showPasswordToggle = true,
    required = false,
}) => {
    const [field, meta, helpers] = useField(name);
    const outsideLabel = labelPlacement === 'outside';
    const inputId = `field-${name}`;

    const handleChange = (e: InputCustomEvent) => {
        const val = e.detail.value;
        helpers.setValue(val);
        if (externalOnChange) externalOnChange(e);
    };

    const labelContent = (
        <>
            {label}
            {required && <span className="form-field__required"> *</span>}
        </>
    );

    return (
        <div className={`form-field ${className || ''}`}>
            {outsideLabel && labelAction && (
                <div className="form-field__label-row">
                    <label className="form-field__label" htmlFor={inputId}>
                        {labelContent}
                    </label>
                    <div className="form-field__label-action">{labelAction}</div>
                </div>
            )}
            {outsideLabel && !labelAction && (
                <label className="form-field__label" htmlFor={inputId}>
                    {labelContent}
                </label>
            )}
            <IonItem className="form-field__item" lines="none">
                <IonInput 
                    id={inputId}
                    className="form-field__input"
                    label={outsideLabel ? undefined : `${label}${required ? ' *' : ''}`}
                    labelPlacement={outsideLabel ? undefined : labelPlacement}
                    {...field}
                    type={type}
                    placeholder={placeholder}
                    value={externalValue !== undefined ? externalValue : field.value || ''}
                    onIonChange={handleChange}
                    onIonBlur={() => helpers.setTouched(true)}
                >
                    {prefix && (
                        <span slot="start" className="form-field__prefix">
                            {prefix}
                        </span>
                    )}
                    {suffix && (
                        <span slot="end" className="form-field__suffix">
                            {suffix}
                        </span>
                    )}
                    {type === 'password' && showPasswordToggle && <IonInputPasswordToggle slot="end" color="medium" />}
                </IonInput>
            </IonItem>
            {helperText && !(meta.touched && meta.error) && (
                <div className="form-field__helper">{helperText}</div>
            )}
            {meta.touched && meta.error && (
                <IonText color="danger" className="form-field__error">
                    <span>{meta.error}</span>
                </IonText>
            )}
        </div>
    );
};

export default InputField;
