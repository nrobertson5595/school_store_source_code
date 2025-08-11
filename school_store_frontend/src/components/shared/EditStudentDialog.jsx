import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EditStudentDialog = ({ student, onUpdateStudent, onClose }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        role: 'student',
    });

    useEffect(() => {
        if (student) {
            setFormData({
                username: student.username || '',
                email: student.email || '',
                first_name: student.first_name || '',
                last_name: student.last_name || '',
                role: student.role || 'student',
            });
        }
    }, [student]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (value) => {
        setFormData((prev) => ({ ...prev, role: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdateStudent(formData);
    };

    return (
        <Dialog open={!!student} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Student</DialogTitle>
                    <DialogDescription>Update the student's information.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" name="username" value={formData.username} onChange={handleChange} />
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                    </div>
                    <div>
                        <Label htmlFor="first_name">First Name</Label>
                        <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} />
                    </div>
                    <div>
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} />
                    </div>
                    <div>
                        <Label htmlFor="role">Role</Label>
                        <Select value={formData.role} onValueChange={handleRoleChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="teacher">Teacher</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditStudentDialog;