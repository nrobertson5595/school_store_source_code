import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const StudentTable = ({ students, onEdit, onDelete }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'first_name', direction: 'ascending' });

    const sortedStudents = React.useMemo(() => {
        let sortableItems = [...students];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [students, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead onClick={() => requestSort('first_name')}>First Name</TableHead>
                    <TableHead onClick={() => requestSort('last_name')}>Last Name</TableHead>
                    <TableHead onClick={() => requestSort('username')}>Username</TableHead>
                    <TableHead onClick={() => requestSort('email')}>Email</TableHead>
                    <TableHead onClick={() => requestSort('role')}>Role</TableHead>
                    <TableHead onClick={() => requestSort('points_balance')}>Points</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortedStudents.map((student) => (
                    <TableRow key={student.id}>
                        <TableCell>{student.first_name}</TableCell>
                        <TableCell>{student.last_name}</TableCell>
                        <TableCell>{student.username}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.role}</TableCell>
                        <TableCell>{student.points_balance}</TableCell>
                        <TableCell>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => onEdit(student)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the student.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => onDelete(student.id)}>
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default StudentTable;