import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StoreGrid from './StoreGrid';
import CartView from './CartView';
import { useAuth } from '../auth/AuthWrapper';
import { Button } from '@/components/ui/button';
import { ShoppingCart, LogOut } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const [cart, setCart] = useState([]);

    const addToCart = (item) => {
        // For simplicity, we'll allow adding the same item multiple times.
        // A more robust implementation would handle quantities.
        setCart(prevCart => [...prevCart, { ...item, cartItemId: Date.now() }]);
        toast.success(`${item.name} (${item.selectedSize}) added to cart!`);
    };

    const removeFromCart = (cartItemId) => {
        setCart(prevCart => prevCart.filter(item => item.cartItemId !== cartItemId));
    };

    const clearCart = () => {
        setCart([]);
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <Toaster richColors />
            <header className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Welcome, {user.first_name}!</h1>
                <div className="flex items-center gap-4">
                    <span className="font-semibold">Points: {user.points_balance}</span>
                    <Button onClick={logout} variant="outline" size="icon">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </header>
            <Tabs defaultValue="store">
                <TabsList>
                    <TabsTrigger value="store">Store</TabsTrigger>
                    <TabsTrigger value="cart">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Cart {cart.length > 0 && `(${cart.length})`}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="store">
                    <StoreGrid addToCart={addToCart} />
                </TabsContent>
                <TabsContent value="cart">
                    <CartView cart={cart} removeFromCart={removeFromCart} clearCart={clearCart} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default StudentDashboard;