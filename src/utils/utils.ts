import * as Yup from 'yup';

export const phoneRegExp = /^[+]?[\d\s\-()]{10,15}$/;

export const phoneValidator = Yup.string()
    .matches(phoneRegExp, 'Phone number is not valid')
    .required('Phone number is required');

export const emailValidator = Yup.string()
    .email('Invalid email format')
    .required('Email is required');

export function generateExternalId(prefix: string, year: string, index = 1): string {
    return `${prefix}-${year}-${String(index).padStart(3, '0')}`;
}

export function validateRequiredFields(fields: Record<string, any>, requiredList: string[]) {
    for (const field of requiredList) {
        if (!fields[field]) {
            return `${field} is required`;
        }
    }
    return null;
}
