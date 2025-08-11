import { API_BASE_URL } from '../utils/constants.js';

class StoreService {
    async getAllItems() {
        try {
            const response = await fetch(`${API_BASE_URL}/store/items`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                return { success: true, items: data };
            } else {
                return {
                    success: false,
                    error: 'Failed to fetch store items'
                };
            }
        } catch (error) {
            console.error('Error fetching store items:', error);
            return { success: false, error: 'Error fetching store items' };
        }
    }

    async createItem(itemData) {
        try {
            const response = await fetch(`${API_BASE_URL}/store/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(itemData)
            });

            if (response.ok) {
                const data = await response.json();
                return { success: true, item: data };
            } else {
                const errorData = await response.json();
                return {
                    success: false,
                    error: errorData.message || 'Failed to create store item'
                };
            }
        } catch (error) {
            console.error('Error creating store item:', error);
            return { success: false, error: 'Error creating store item' };
        }
    }

    async updateItem(itemId, itemData) {
        try {
            const response = await fetch(`${API_BASE_URL}/store/items/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(itemData)
            });

            if (response.ok) {
                const data = await response.json();
                return { success: true, item: data };
            } else {
                const errorData = await response.json();
                return {
                    success: false,
                    error: errorData.message || 'Failed to update store item'
                };
            }
        } catch (error) {
            console.error('Error updating store item:', error);
            return { success: false, error: 'Error updating store item' };
        }
    }

    async deleteItem(itemId) {
        try {
            const response = await fetch(`${API_BASE_URL}/store/items/${itemId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                return { success: true };
            } else {
                const errorData = await response.json();
                return {
                    success: false,
                    error: errorData.message || 'Failed to delete store item'
                };
            }
        } catch (error) {
            console.error('Error deleting store item:', error);
            return { success: false, error: 'Error deleting store item' };
        }
    }

    async purchaseItem(userId, itemId, quantity, size) {
        try {
            const response = await fetch(`${API_BASE_URL}/store/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    user_id: userId,
                    item_id: itemId,
                    quantity: quantity,
                    size: size
                })
            });

            if (response.ok) {
                const data = await response.json();
                return { success: true, purchase: data };
            } else {
                const errorData = await response.json();
                return {
                    success: false,
                    error: errorData.message || 'Failed to purchase item'
                };
            }
        } catch (error) {
            console.error('Error purchasing item:', error);
            return { success: false, error: 'Error purchasing item' };
        }
    }

    async getPurchaseHistory(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/store/purchases/${userId}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                return { success: true, purchases: data };
            } else {
                return {
                    success: false,
                    error: 'Failed to fetch purchase history'
                };
            }
        } catch (error) {
            console.error('Error fetching purchase history:', error);
            return { success: false, error: 'Error fetching purchase history' };
        }
    }

    getMockStoreItems() {
        return [
            {
                id: 1,
                name: '🎨 Art Supplies Set',
                description: 'Complete set of colored pencils, markers, and drawing paper',
                price: 50,
                category: 'Art & Crafts',
                image_url: '🎨'
            },
            {
                id: 2,
                name: '📚 Adventure Book',
                description: 'Exciting collection of adventure stories for young readers',
                price: 75,
                category: 'Books',
                image_url: '📚'
            },
            {
                id: 3,
                name: '🎮 Educational Game',
                description: 'Fun learning game that makes math and science exciting',
                price: 100,
                category: 'Games',
                image_url: '🎮'
            },
            {
                id: 4,
                name: '✏️ Premium Pencil Set',
                description: 'Set of high-quality pencils with fun designs',
                price: 25,
                category: 'School Supplies',
                image_url: '✏️'
            },
            {
                id: 5,
                name: '🏆 Achievement Stickers',
                description: 'Pack of colorful achievement and motivation stickers',
                price: 15,
                category: 'Rewards',
                image_url: '🏆'
            },
            {
                id: 6,
                name: '🧩 Puzzle Challenge',
                description: '100-piece puzzle with beautiful artwork',
                price: 60,
                category: 'Games',
                image_url: '🧩'
            }
        ];
    }
}

const storeService = new StoreService();

// Export both default and named exports for compatibility
export default storeService;
export const {
    getAllItems,
    createItem,
    updateItem,
    deleteItem,
    purchaseItem,
    getPurchaseHistory,
    getMockStoreItems
} = storeService;

// Alias for backward compatibility
export const getStoreItems = storeService.getAllItems.bind(storeService);