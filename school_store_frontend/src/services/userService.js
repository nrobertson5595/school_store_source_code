import { API_BASE_URL } from '../utils/constants.js';

class UserService {
    async getAllUsers() {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                return { success: true, users: data };
            } else {
                return { success: false, error: 'Failed to fetch users' };
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            return { success: false, error: 'Error fetching users' };
        }
    }

    async createUser(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const data = await response.json();
                return { success: true, user: data };
            } else {
                const errorData = await response.json();
                return {
                    success: false,
                    error: errorData.message || 'Failed to create user'
                };
            }
        } catch (error) {
            console.error('Error creating user:', error);
            return { success: false, error: 'Error creating user' };
        }
    }

    async updateUser(userId, userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const data = await response.json();
                return { success: true, user: data };
            } else {
                const errorData = await response.json();
                return {
                    success: false,
                    error: errorData.message || 'Failed to update user'
                };
            }
        } catch (error) {
            console.error('Error updating user:', error);
            return { success: false, error: 'Error updating user' };
        }
    }

    async deleteUser(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                return { success: true };
            } else {
                const errorData = await response.json();
                return {
                    success: false,
                    error: errorData.message || 'Failed to delete user'
                };
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            return { success: false, error: 'Error deleting user' };
        }
    }

    async getStudents() {
        try {
            const result = await this.getAllUsers();
            if (result.success) {
                const students = result.users.filter(user => user.role === 'student');
                return { success: true, students };
            }
            return result;
        } catch (error) {
            console.error('Error fetching students:', error);
            return { success: false, error: 'Error fetching students' };
        }
    }
}

const userService = new UserService();

// Export both default and named exports for compatibility
export default userService;
export const {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getStudents
} = userService;

// Alias for backward compatibility
export const getUsers = userService.getAllUsers.bind(userService);