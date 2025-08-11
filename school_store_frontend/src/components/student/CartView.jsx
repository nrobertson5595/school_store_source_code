import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Minus } from 'lucide-react';

const CartView = ({ cart, updateCartQuantity, purchaseItems }) => {
    const totalPoints = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Cart</CardTitle>
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
                                    <TableHead>Price</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cart.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.price} points</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button size="icon" variant="outline" onClick={() => updateCartQuantity(item.id, item.quantity - 1)}>
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span>{item.quantity}</span>
                                                <Button size="icon" variant="outline" onClick={() => updateCartQuantity(item.id, item.quantity + 1)}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>{item.price * item.quantity} points</TableCell>
                                        <TableCell>
                                            <Button size="icon" variant="destructive" onClick={() => updateCartQuantity(item.id, 0)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="text-right mt-4 font-bold text-lg">
                            Total: {totalPoints} points
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button onClick={purchaseItems}>Purchase</Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default CartView;