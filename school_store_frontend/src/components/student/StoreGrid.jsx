import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getStoreItems } from '../../services/storeService';

const StoreGrid = ({ addToCart }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const storeItems = await getStoreItems();
                setItems(storeItems);
            } catch (error) {
                console.error('Failed to fetch store items:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    if (loading) {
        return <div>Loading store items...</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            console.log('Inspecting items prop in StoreGrid:', items);
            console.log('Inspecting items prop in StoreGrid:', items);
            {items.map((item) => (
                <Card key={item.id}>
                    <CardHeader>
                        <CardTitle>{item.name}</CardTitle>
                        <CardDescription>{item.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl text-center mb-4">{item.image_url}</div>
                        <p>{item.description}</p>
                        <div className="flex justify-between items-center mt-4">
                            <span className="font-semibold">{item.price} points</span>
                            <Button onClick={() => addToCart(item)}>Add to Cart</Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default StoreGrid;