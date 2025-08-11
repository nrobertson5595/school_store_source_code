import { API_BASE_URL } from '../utils/constants.js';

class PointsService {
    async awardPoints(studentId, points, reason) {
        try {
            // Backend expects 'user_id' and 'amount', not 'student_id' and 'points'
            const payload = {
                user_id: parseInt(studentId),  // Changed from student_id to user_id
                amount: parseInt(points),       // Changed from points to amount
                reason: reason
            };

            console.log('[DEBUG] awardPoints - Request payload:', payload);

            const response = await fetch(`${API_BASE_URL}/points/award`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            console.log('[DEBUG] awardPoints - Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                return { success: true, data };
            } else {
                const errorData = await response.json();
                console.error('[DEBUG] awardPoints - Error response:', errorData);
                return {
                    success: false,
                    error: errorData.error || errorData.message || 'Failed to award points'
                };
            }
        } catch (error) {
            console.error('Error awarding points:', error);
            return { success: false, error: 'Error awarding points' };
        }
    }

    async awardPointsToMultipleStudents(studentIds, points, reason) {
        const results = {
            successCount: 0,
            failCount: 0,
            errors: []
        };

        for (const studentId of studentIds) {
            const result = await pointsService.awardPoints(studentId, points, reason);
            if (result.success) {
                results.successCount++;
            } else {
                results.failCount++;
                results.errors.push(`Student ${studentId}: ${result.error}`);
            }
        }

        return {
            success: results.successCount > 0,
            results
        };
    }

    async getPointsTransactions() {
        try {
            console.log('[DEBUG] getPointsTransactions - Fetching from:', `${API_BASE_URL}/points/transactions`);

            const response = await fetch(`${API_BASE_URL}/points/transactions`, {
                credentials: 'include'
            });

            console.log('[DEBUG] getPointsTransactions - Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('[DEBUG] getPointsTransactions - Response data:', data);

                // The backend returns an object with 'transactions' array
                if (data && data.transactions) {
                    return { success: true, transactions: data.transactions };
                } else if (Array.isArray(data)) {
                    // If backend returns array directly
                    return { success: true, transactions: data };
                } else {
                    console.error('[DEBUG] Unexpected response format:', data);
                    return { success: true, transactions: [] };
                }
            } else {
                console.error('[DEBUG] getPointsTransactions - Failed with status:', response.status);
                return {
                    success: false,
                    error: `Failed to fetch points transactions (${response.status})`
                };
            }
        } catch (error) {
            console.error('Error fetching points transactions:', error);
            return { success: false, error: 'Error fetching points transactions' };
        }
    }

    async getPointsHistory(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/points/history/${userId}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                return { success: true, history: data };
            } else {
                return {
                    success: false,
                    error: 'Failed to fetch points history'
                };
            }
        } catch (error) {
            console.error('Error fetching points history:', error);
            return { success: false, error: 'Error fetching points history' };
        }
    }
}

const pointsService = new PointsService();

// Export both default and named exports for compatibility
export default pointsService;
export const {
    awardPoints,
    awardPointsToMultipleStudents,
    getPointsTransactions,
    getPointsHistory
} = pointsService;