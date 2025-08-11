import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/userService';
import StudentTable from '../shared/StudentTable';
import EditStudentDialog from '../shared/EditStudentDialog';
import AddStudentForm from '../AddStudentForm'; // Assuming this is a shared component

const StudentManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        console.log('[StudentManagement] Fetching users...');
        setLoading(true);
        try {
            const result = await getUsers();
            console.log('[StudentManagement] getUsers result:', result);

            // Handle the response - getUsers returns {success: boolean, users: array}
            if (result && result.success && result.users) {
                console.log('[StudentManagement] Successfully fetched users:', result.users.length);
                setUsers(result.users);
            } else if (result && !result.success) {
                console.error('[StudentManagement] Failed to fetch users:', result.error);
                setUsers([]);
            } else {
                console.error('[StudentManagement] Unexpected result format:', result);
                setUsers([]);
            }
        } catch (error) {
            console.error('[StudentManagement] Error in fetchUsers:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = async (formData) => {
        try {
            const result = await createUser(formData);
            if (result.success) {
                fetchUsers();
                setShowAddDialog(false);
                return true; // Return success to AddStudentForm
            } else {
                alert(result.error || 'Failed to create student');
                return false; // Return failure to AddStudentForm
            }
        } catch (error) {
            console.error('Failed to add student:', error);
            alert('An error occurred while creating the student');
            return false;
        }
    };

    const handleEditStudent = (student) => {
        setSelectedStudent(student);
        setShowEditDialog(true);
    };

    const handleUpdateStudent = async (formData) => {
        try {
            await updateUser(selectedStudent.id, formData);
            fetchUsers();
            setShowEditDialog(false);
            setSelectedStudent(null);
        } catch (error) {
            console.error('Failed to update student:', error);
        }
    };

    const handleDeleteStudent = async (studentId) => {
        try {
            await deleteUser(studentId);
            fetchUsers();
        } catch (error) {
            console.error('Failed to delete student:', error);
        }
    };

    console.log('[StudentManagement] Current users state:', users);
    console.log('[StudentManagement] Users is array?:', Array.isArray(users));

    const filteredUsers = Array.isArray(users) ? users
        .filter(user => {
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            const matchesSearch =
                user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.username.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesRole && matchesSearch;
        }) : [];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Student
                </Button>
            </div>
            {loading ? (
                <p>Loading students...</p>
            ) : (
                <StudentTable
                    students={filteredUsers}
                    onEdit={handleEditStudent}
                    onDelete={handleDeleteStudent}
                />
            )}
            {showAddDialog && (
                <AddStudentForm
                    isOpen={showAddDialog}
                    onSubmit={handleAddStudent}
                    onClose={() => setShowAddDialog(false)}
                    isSubmitting={false}
                />
            )}
            {showEditDialog && selectedStudent && (
                <EditStudentDialog
                    student={selectedStudent}
                    onUpdateStudent={handleUpdateStudent}
                    onClose={() => setShowEditDialog(false)}
                />
            )}
        </div>
    );
};

export default StudentManagement;