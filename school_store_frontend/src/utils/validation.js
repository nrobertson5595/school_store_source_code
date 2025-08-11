export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePoints = (points) => {
    const pointsNum = parseInt(points);
    return !isNaN(pointsNum) && pointsNum > 0;
};

export const validateRequired = (value) => {
    return value && value.toString().trim().length > 0;
};

export const validateName = (name) => {
    return name && name.trim().length >= 2;
};

export const validateUsername = (username) => {
    return username && username.trim().length >= 3;
};

export const validatePassword = (password) => {
    return password && password.length >= 6;
};

export const validatePrice = (price) => {
    const priceNum = parseFloat(price);
    return !isNaN(priceNum) && priceNum > 0;
};

export const validateQuantity = (quantity) => {
    const quantityNum = parseInt(quantity);
    return !isNaN(quantityNum) && quantityNum > 0;
};

export const validateFormData = (formData, requiredFields) => {
    const errors = {};

    requiredFields.forEach(field => {
        if (!validateRequired(formData[field])) {
            errors[field] = `${field} is required`;
        }
    });

    if (formData.email && !validateEmail(formData.email)) {
        errors.email = 'Invalid email format';
    }

    if (formData.points && !validatePoints(formData.points)) {
        errors.points = 'Points must be a positive number';
    }

    if (formData.first_name && !validateName(formData.first_name)) {
        errors.first_name = 'First name must be at least 2 characters';
    }

    if (formData.last_name && !validateName(formData.last_name)) {
        errors.last_name = 'Last name must be at least 2 characters';
    }

    if (formData.username && !validateUsername(formData.username)) {
        errors.username = 'Username must be at least 3 characters';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};