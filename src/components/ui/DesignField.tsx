import React from 'react';
import {
    IonIcon,
    IonInput,
    IonInputPasswordToggle,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonTextarea,
} from '@ionic/react';
import { informationCircle } from 'ionicons/icons';
import './DesignField.scss';

type FieldType = 'text' | 'email' | 'tel' | 'password' | 'number' | 'date' | 'time';

interface DesignInputProps {
    name: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: FieldType;
    optional?: boolean;
    error?: string;
    prefix?: React.ReactNode;
    suffixIcon?: string;
    helperText?: string;
    disabled?: boolean;
    className?: string;
    multiline?: boolean;
    rows?: number;
    showPasswordToggle?: boolean;
}

interface DesignSelectProps {
    name: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    error?: string;
    optional?: boolean;
    className?: string;
    disabled?: boolean;
}

interface FormNoticeProps {
    title?: string;
    children: React.ReactNode;
    tone?: 'warning' | 'info';
    className?: string;
}

export const DesignInput: React.FC<DesignInputProps> = ({
    name,
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    optional = false,
    error,
    prefix,
    suffixIcon,
    helperText,
    disabled = false,
    className = '',
    multiline = false,
    rows = 4,
    showPasswordToggle = true,
}) => (
    <label className={`design-field ${error ? 'design-field--error' : ''} ${disabled ? 'design-field--disabled' : ''} ${className}`} htmlFor={name}>
        <span className="design-field__label">
            {label}
            {optional && <span> (Optional)</span>}
        </span>

        <IonItem className="design-field__item" lines="none">
            {multiline ? (
                <IonTextarea
                    id={name}
                    className="design-field__control design-field__control--textarea"
                    value={value}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={rows}
                    onIonInput={(event) => onChange(`${event.detail.value ?? ''}`)}
                />
            ) : (
                <IonInput
                    id={name}
                    className="design-field__control"
                    type={type}
                    value={value}
                    placeholder={placeholder}
                    disabled={disabled}
                    onIonInput={(event) => onChange(`${event.detail.value ?? ''}`)}
                >
                    {prefix && <span slot="start" className="design-field__prefix">{prefix}</span>}
                    {suffixIcon && <IonIcon slot="end" className="design-field__suffix-icon" icon={suffixIcon} aria-hidden="true" />}
                    {type === 'password' && showPasswordToggle && <IonInputPasswordToggle slot="end" color="medium" />}
                </IonInput>
            )}
        </IonItem>

        {helperText && !error && <span className="design-field__helper">{helperText}</span>}
        {error && <span className="design-field__error">{error}</span>}
    </label>
);

export const DesignSelect: React.FC<DesignSelectProps> = ({
    name,
    label,
    value,
    onChange,
    options,
    placeholder,
    error,
    optional = false,
    className = '',
    disabled = false,
}) => (
    <label className={`design-field ${error ? 'design-field--error' : ''} ${disabled ? 'design-field--disabled' : ''} ${className}`} htmlFor={name}>
        <span className="design-field__label">
            {label}
            {optional && <span> (Optional)</span>}
        </span>

        <IonItem className="design-field__item" lines="none">
            <IonSelect
                id={name}
                className="design-field__control design-field__select"
                value={value}
                placeholder={placeholder}
                disabled={disabled}
                onIonChange={(event) => onChange(`${event.detail.value ?? ''}`)}
                interface="popover"
            >
                {options.map((option) => (
                    <IonSelectOption key={option.value} value={option.value}>
                        {option.label}
                    </IonSelectOption>
                ))}
            </IonSelect>
        </IonItem>

        {error && <span className="design-field__error">{error}</span>}
    </label>
);

export const FormNotice: React.FC<FormNoticeProps> = ({
    title,
    children,
    tone = 'info',
    className = '',
}) => (
    <div className={`form-notice form-notice--${tone} ${className}`} role={tone === 'warning' ? 'alert' : 'note'}>
        <IonIcon icon={informationCircle} aria-hidden="true" />
        <div>
            {title && <strong>{title}</strong>}
            <p>{children}</p>
        </div>
    </div>
);
