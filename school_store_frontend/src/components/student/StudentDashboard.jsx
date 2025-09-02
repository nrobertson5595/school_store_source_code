import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StoreGrid from './StoreGrid';
import CartView from './CartView';
import { useAuth } from '../auth/AuthWrapper';
import { Button } from '@/components/ui/button';
import { ShoppingCart, LogOut } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { SchoolBanner, PointsDisplay } from '../shared/SchoolTheme';

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
        <div className="school-container">
            <Toaster richColors />

            {/* Enhanced School-Themed Header */}
            <SchoolBanner
                title={`Welcome back, ${user.first_name}!`}
                subtitle="Ready to explore our amazing school store?"
                mascot={true}
                className="mb-6"
            />

            {/* Points Display Card */}
            <div className="card-academic mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-display text-school mb-2">Your Achievement Points</h2>
                        <p className="text-muted-foreground">Earned through great work and participation!</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <PointsDisplay points={user.points_balance || 0} animated={true} size="lg" />
                        <Button onClick={logout} variant="outline" size="icon" className="school-hover">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
            {/* Enhanced School-Themed Tabs */}
            <Tabs defaultValue="store" className="card-academic">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="store" className="font-display">
                        🛍️ School Store
                    </TabsTrigger>
                    <TabsTrigger value="cart" className="font-display">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        My Cart {cart.length > 0 && `(${cart.length})`}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="store" className="mt-0">
                    <div className="space-y-4">
                        <h3 className="text-lg font-display text-school">Browse our amazing selection!</h3>
                        <StoreGrid addToCart={addToCart} />
                    </div>
                </TabsContent>
                <TabsContent value="cart" className="mt-0">
                    <div className="space-y-4">
                        <h3 className="text-lg font-display text-school">Your shopping cart</h3>
                        <CartView cart={cart} removeFromCart={removeFromCart} clearCart={clearCart} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default StudentDashboard;