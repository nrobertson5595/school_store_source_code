export const SIZE_PRICING = {
    xsmall: 50,
    small: 100,
    medium: 250,
    large: 500,
    xlarge: 1000
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const DEFAULT_FORM_VALUES = {
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'student'
};

export const USER_ROLES = {
    STUDENT: 'student',
    TEACHER: 'teacher'
};

// Alias for backward compatibility
export const ROLES = USER_ROLES;

export const STORE_CATEGORIES = [
    'Art & Crafts',
    'Books',
    'Games',
    'School Supplies',
    'Rewards'
];