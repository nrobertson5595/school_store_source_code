import { API_BASE_URL } from '../utils/constants.js';

class AuthService {
    async login(username, password) {
        console.log('[AuthService] Login attempt for username:', username);
        console.log('[AuthService] API URL:', `${API_BASE_URL}/auth/login`);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            console.log('[AuthService] Login response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('[AuthService] Full login response data:', JSON.stringify(data, null, 2));
                console.log('[AuthService] User from backend:', data.user);

                // Backend uses session-based authentication, no token handling needed
                console.log('[AuthService] Using session-based authentication');

                return data.user;
            } else {
                const errorData = await response.json();
                console.error('[AuthService] Login failed with error:', errorData);
                return {
                    success: false,
                    error: errorData.error || 'Invalid credentials!'
                };
            }
        } catch (error) {
            console.error('[AuthService] Login error:', error);
            return {
                success: false,
                error: 'Login failed. Please check if the backend server is running.'
            };
        }
    }

    async logout() {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: 'Logout failed' };
        }
    }

    async checkAuthStatus() {
        try {
            // Backend uses /auth/me endpoint, not /auth/status
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                return { isAuthenticated: true, user: data };
            } else {
                return { isAuthenticated: false };
            }
        } catch (error) {
            console.error('Auth check error:', error);
            return { isAuthenticated: false };
        }
    }

    // Removed token management methods as backend uses session-based auth
    // Keeping empty methods for backward compatibility
    getToken() {
        return null;
    }

    setToken(token) {
        // No-op for session-based auth
    }

    removeToken() {
        // No-op for session-based auth
    }
}

const authService = new AuthService();

// Export both default and named exports for compatibility
export default authService;

// Properly bind methods for named exports
export const getToken = authService.getToken.bind(authService);
export const removeToken = authService.removeToken.bind(authService);
export const setToken = authService.setToken.bind(authService);
export const login = authService.login.bind(authService);
export const logout = authService.logout.bind(authService);
export const checkAuthStatus = authService.checkAuthStatus.bind(authService);