import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getStoreItems } from '../../services/storeService';

const StoreItemCard = ({ item, addToCart }) => {
    const [selectedSize, setSelectedSize] = useState(item.available_sizes[0] || null);
    const [currentPrice, setCurrentPrice] = useState(null);

    useEffect(() => {
        if (selectedSize) {
            const sizePrice = item.size_pricing[selectedSize];
            setCurrentPrice(sizePrice);
        }
    }, [selectedSize, item.size_pricing]);

    const handleSizeChange = (size) => {
        setSelectedSize(size);
    };

    const handleAddToCart = () => {
        if (selectedSize) {
            addToCart({ ...item, selectedSize, price: currentPrice });
        } else {
            // Handle case where no size is selected, maybe show a message
            console.error("Please select a size.");
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{item.name.replace(/[\u{1F600}-\u{1F64F}]/gu, '').trim()}</CardTitle>
                <CardDescription>{item.category}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-600 mb-4">{item.description}</p>

                <div className="flex flex-col space-y-4">
                    <Select onValueChange={handleSizeChange} defaultValue={selectedSize}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a size" />
                        </SelectTrigger>
                        <SelectContent>
                            {item.available_sizes.map((size) => (
                                <SelectItem key={size} value={size}>
                                    {size.toUpperCase()} - {item.size_pricing[size]} points
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">{currentPrice !== null ? `${currentPrice} points` : 'Select a size'}</span>
                        <Button onClick={handleAddToCart} disabled={!selectedSize}>
                            Add to Cart
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


const StoreGrid = ({ addToCart }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await getStoreItems();
                console.log('DEBUG: Raw API response:', response);
                console.log('DEBUG: Response type:', typeof response);
                console.log('DEBUG: Is array?:', Array.isArray(response));
                console.log('DEBUG: Has success property?:', 'success' in response);

                if (response.success && Array.isArray(response.items)) {
                    console.log('DEBUG: Using response.items');
                    setItems(response.items);
                } else if (Array.isArray(response)) {
                    console.log('DEBUG: Response is directly an array, using it');
                    setItems(response);
                } else {
                    console.error('Invalid response format:', response);
                    setItems([]);
                }
            } catch (error) {
                console.error('Failed to fetch store items:', error);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    if (loading) {
        return <div className="text-center py-10">Loading store items...</div>;
    }

    if (!items.length) {
        return <div className="text-center py-10">No items available in the store.</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
                <StoreItemCard key={item.id} item={item} addToCart={addToCart} />
            ))}
        </div>
    );
};

export default StoreGrid;