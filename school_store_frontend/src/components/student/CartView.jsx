import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { purchaseItems as purchaseItemsService } from '../../services/storeService';
import { useAuth } from '../auth/AuthWrapper';
import { toast } from 'sonner';

const CartView = ({ cart, removeFromCart, clearCart }) => {
    const { user, refreshUser } = useAuth();
    const totalPoints = cart.reduce((sum, item) => sum + item.price, 0);

    const handlePurchase = async () => {
        console.log('DEBUG: Cart items:', cart);
        // Map cart items to the format expected by the service
        const itemsToPurchase = cart.map(item => ({
            id: item.id,
            size: item.selectedSize,
            quantity: 1  // Each cart item represents quantity of 1
        }));
        console.log('DEBUG: Items to purchase:', itemsToPurchase);

        try {
            // Call the service without user.id (it's handled by auth headers)
            const response = await purchaseItemsService(itemsToPurchase);
            console.log('DEBUG: Purchase response:', response);

            if (response.success) {
                toast.success('Purchase successful!');
                clearCart();
                refreshUser(); // Refresh user data to get updated points
            } else {
                toast.error(response.message || 'Purchase failed.');
                if (response.errors) {
                    response.errors.forEach(err => {
                        console.error('Item purchase error:', err);
                    });
                }
            }
        } catch (error) {
            toast.error('An error occurred during purchase.');
            console.error('Purchase error:', error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Cart</CardTitle>
                <CardDescription>Review your items before purchasing.</CardDescription>
            </CardHeader>
            <CardContent>
                {cart.length === 0 ? (
                    <p>Your cart is empty.</p>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cart.map((item) => (
                                    <TableRow key={item.cartItemId}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>{item.selectedSize.toUpperCase()}</TableCell>
                                        <TableCell>{item.price} points</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeFromCart(item.cartItemId)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="mt-6 space-y-4">
                            <div className="flex justify-between text-lg font-semibold">
                                <span>Total</span>
                                <span>{totalPoints} points</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Your balance</span>
                                <span>{user.points_balance} points</span>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
                                <Button
                                    onClick={handlePurchase}
                                    disabled={totalPoints > user.points_balance || totalPoints === 0}
                                >
                                    {totalPoints > user.points_balance ? "Not Enough Points" : "Purchase"}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default CartView;