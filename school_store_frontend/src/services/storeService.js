import { getToken } from './authService';

const BASE_URL = '/api/store';

const getAuthHeaders = () => {
    const token = getToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

const getAuthHeadersForFormData = () => {
    const token = getToken();
    return {
        'Authorization': `Bearer ${token}`,
    };
};

export const getStoreItems = async () => {
    const response = await fetch(`${BASE_URL}/items`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        throw new Error('Failed to fetch store items');
    }
    return response.json();
};

export const createStoreItem = async (itemData) => {
    // Convert FormData to JSON if needed
    let body;
    let headers;

    if (itemData instanceof FormData) {
        // Convert FormData to plain object
        const jsonData = {};
        const availableSizes = [];

        for (let [key, value] of itemData.entries()) {
            if (key === 'available_sizes') {
                availableSizes.push(value);
            } else if (key === 'image') {
                // Skip file uploads for now - backend expects JSON
                continue;
            } else {
                // Convert string 'true'/'false' to boolean for is_available
                if (key === 'is_available') {
                    jsonData[key] = value === 'true';
                } else {
                    jsonData[key] = value;
                }
            }
        }

        if (availableSizes.length > 0) {
            jsonData.available_sizes = availableSizes;
        }

        body = JSON.stringify(jsonData);
        headers = getAuthHeaders(); // Use JSON headers
    } else {
        body = JSON.stringify(itemData);
        headers = getAuthHeaders();
    }

    const response = await fetch(`${BASE_URL}/items`, {
        method: 'POST',
        headers: headers,
        body: body,
    });

    if (!response.ok) {
        throw new Error('Failed to create store item');
    }
    return response.json();
};

export const updateStoreItem = async (id, itemData) => {
    // Convert FormData to JSON if needed (same as createStoreItem)
    let body;
    let headers;

    if (itemData instanceof FormData) {
        // Convert FormData to plain object
        const jsonData = {};
        const availableSizes = [];

        for (let [key, value] of itemData.entries()) {
            if (key === 'available_sizes') {
                availableSizes.push(value);
            } else if (key === 'image') {
                // Skip file uploads for now - backend expects JSON
                continue;
            } else {
                // Convert string 'true'/'false' to boolean for is_available
                if (key === 'is_available') {
                    jsonData[key] = value === 'true';
                } else {
                    jsonData[key] = value;
                }
            }
        }

        if (availableSizes.length > 0) {
            jsonData.available_sizes = availableSizes;
        }

        body = JSON.stringify(jsonData);
        headers = getAuthHeaders(); // Use JSON headers
    } else {
        body = JSON.stringify(itemData);
        headers = getAuthHeaders();
    }

    const response = await fetch(`${BASE_URL}/items/${id}`, {
        method: 'PUT',
        headers: headers,
        body: body,
    });

    if (!response.ok) {
        throw new Error('Failed to update store item');
    }
    return response.json();
};

export const deleteStoreItem = async (id) => {
    const response = await fetch(`${BASE_URL}/items/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        throw new Error('Failed to delete store item');
    }
    return response.json();
};

export const uploadImage = async (formData) => {
    const response = await fetch('/api/upload/image', {
        method: 'POST',
        headers: getAuthHeadersForFormData(),
        body: formData,
    });
    if (!response.ok) {
        throw new Error('Failed to upload image');
    }
    return response.json();
};
export const purchaseItem = async (itemId, size, quantity = 1) => {
    const requestData = {
        item_id: itemId,
        size: size,
        quantity: quantity
    };
    console.log('DEBUG: purchaseItem called with:', requestData);
    const response = await fetch(`${BASE_URL}/purchase`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        console.log('DEBUG: Backend error response:', errorData);
        throw new Error(errorData.error || 'Failed to purchase item');
    }
    return response.json();
};

// Batch purchase function that calls single item purchase for each item
export const purchaseItems = async (items) => {
    console.log('DEBUG: purchaseItems batch called with:', items);
    const results = [];
    const errors = [];

    for (const item of items) {
        try {
            const result = await purchaseItem(item.id, item.size, item.quantity || 1);
            results.push(result);
        } catch (error) {
            errors.push({ item, error: error.message });
        }
    }

    if (errors.length > 0) {
        console.log('DEBUG: Some purchases failed:', errors);
        return {
            success: false,
            message: `Failed to purchase ${errors.length} item(s)`,
            errors,
            successfulPurchases: results
        };
    }

    return {
        success: true,
        purchases: results
    };
};