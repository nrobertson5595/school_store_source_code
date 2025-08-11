export const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
};

export const calculateItemPrice = (basePrice, size, sizePricing) => {
    return basePrice + (sizePricing[size] || 0);
};

export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
};

export const sortItemsByName = (items) => {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
};

export const filterItemsByCategory = (items, category) => {
    if (!category || category === 'all') {
        return items;
    }
    return items.filter(item => item.category === category);
};

export const getUniqueCategories = (items) => {
    const categories = items.map(item => item.category).filter(Boolean);
    return [...new Set(categories)];
};

export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export const sortUsers = (users, field, direction) => {
    return [...users].sort((a, b) => {
        let aVal = a[field] || '';
        let bVal = b[field] || '';

        if (field === 'points_balance') {
            aVal = aVal || 0;
            bVal = bVal || 0;
        }

        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        if (direction === 'asc') {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
    });
};