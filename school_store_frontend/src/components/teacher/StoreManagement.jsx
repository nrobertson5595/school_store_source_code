import React, { useState, useEffect, useCallback } from 'react';
import {
    getStoreItems,
    createStoreItem,
    updateStoreItem,
    deleteStoreItem,
    uploadImage,
} from '../../services/storeService';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

const StoreItemForm = ({ item, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        available_sizes: [],
        is_available: true,
        image_url: '',
    });
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '',
                description: item.description || '',
                category: item.category || '',
                available_sizes: item.available_sizes || [],
                is_available: item.is_available !== undefined ? item.is_available : true,
                image_url: item.image_url || '',
            });
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSizeChange = (size) => {
        setFormData((prev) => {
            const newSizes = prev.available_sizes.includes(size)
                ? prev.available_sizes.filter((s) => s !== size)
                : [...prev.available_sizes, size];
            return { ...prev, available_sizes: newSizes };
        });
    };

    const handleAvailabilityChange = (checked) => {
        setFormData((prev) => ({ ...prev, is_available: checked }));
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const submissionData = new FormData();

        if (imageFile) {
            submissionData.append('image', imageFile);
        }

        Object.keys(formData).forEach(key => {
            if (key === 'available_sizes') {
                formData[key].forEach(size => submissionData.append('available_sizes', size));
            } else {
                submissionData.append(key, formData[key]);
            }
        });

        await onSubmit(submissionData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Item Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" value={formData.category} onChange={handleChange} required />
            </div>
            <div>
                <Label>Available Sizes</Label>
                <div className="flex items-center space-x-4 mt-2">
                    {SIZES.map((size) => (
                        <div key={size} className="flex items-center space-x-2">
                            <Checkbox
                                id={`size-${size}`}
                                checked={formData.available_sizes.includes(size)}
                                onCheckedChange={() => handleSizeChange(size)}
                            />
                            <Label htmlFor={`size-${size}`}>{size}</Label>
                        </div>
                    ))}
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="image">Image</Label>
                <Input id="image" type="file" onChange={handleImageChange} />
                {formData.image_url && !imageFile && <img src={formData.image_url} alt={formData.name} className="w-20 h-20 mt-2 object-cover" />}
            </div>
            <div className="flex items-center space-x-2">
                <Switch
                    id="is_available"
                    checked={formData.is_available}
                    onCheckedChange={handleAvailabilityChange}
                />
                <Label htmlFor="is_available">Item is Available</Label>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save</Button>
            </DialogFooter>
        </form>
    );
};

const StoreManagement = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getStoreItems();
            setItems(data);
        } catch (error) {
            console.error('Failed to fetch store items:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleFormSubmit = async (formData) => {
        try {
            if (editingItem) {
                await updateStoreItem(editingItem.id, formData);
            } else {
                await createStoreItem(formData);
            }
            fetchItems();
            setIsDialogOpen(false);
            setEditingItem(null);
        } catch (error) {
            console.error('Failed to save item:', error);
            alert('Failed to save item. Check console for details.');
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await deleteStoreItem(id);
                fetchItems();
            } catch (error) {
                console.error('Failed to delete item:', error);
            }
        }
    };

    const openAddDialog = () => {
        setEditingItem(null);
        setIsDialogOpen(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Store Management</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openAddDialog}>
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                        </DialogHeader>
                        <StoreItemForm
                            item={editingItem}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setIsDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <p>Loading items...</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Points Value</TableHead>
                            <TableHead>Available Sizes</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => {
                            // Get the points values for available sizes
                            const pointsDisplay = item.size_pricing
                                ? Object.entries(item.size_pricing)
                                    .map(([size, points]) => `${size.toUpperCase()}: ${points}`)
                                    .join(', ')
                                : 'N/A';

                            return (
                                <TableRow key={item.id}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{pointsDisplay}</TableCell>
                                    <TableCell>{item.available_sizes.join(', ')}</TableCell>
                                    <TableCell>
                                        <Badge variant={item.is_available ? 'default' : 'destructive'}>
                                            {item.is_available ? 'Available' : 'Unavailable'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="space-x-2">
                                        <Button variant="outline" size="icon" onClick={() => handleEdit(item)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};

export default StoreManagement;