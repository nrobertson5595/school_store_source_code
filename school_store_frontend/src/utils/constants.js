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

// For Vercel deployment, use relative path for API or environment variable
const getApiBaseUrl = () => {
    // If we have an explicit environment variable, use it
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }

    // In production on Vercel, use relative path
    if (import.meta.env.PROD && typeof window !== 'undefined') {
        return '/api';
    }

    // Default to localhost for development
    return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();

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