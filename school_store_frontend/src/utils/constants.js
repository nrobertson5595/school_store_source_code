export const SIZE_PRICING = {
    xsmall: 50,
    small: 100,
    medium: 250,
    large: 500,
    xlarge: 1000
};

// Debug logging for environment variables
console.log('[Constants] import.meta.env:', import.meta.env);
console.log('[Constants] VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('[Constants] NODE_ENV:', import.meta.env.MODE);
console.log('[Constants] All Vite env vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

console.log('[Constants] Final API_BASE_URL:', API_BASE_URL);

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