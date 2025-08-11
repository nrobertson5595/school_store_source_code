import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StoreGrid from './StoreGrid';
import CartView from './CartView';
import { useAuth } from '../auth/AuthWrapper';
import { Button } from '@/components/ui/button';
import { ShoppingCart, LogOut } from 'lucide-react';

const StudentDashboard = () => {
    const { user, logout } = useAuth();

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
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
                        Cart
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="store">
                    <StoreGrid />
                </TabsContent>
                <TabsContent value="cart">
                    <CartView />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default StudentDashboard;