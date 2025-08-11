import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudentManagement from './StudentManagement';
import PointsManagement from './PointsManagement';
import { useAuth } from '../auth/AuthWrapper';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const TeacherDashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="container mx-auto p-4">
            <header className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
                <div className="flex items-center gap-4">
                    <span>Welcome, {user.first_name} {user.last_name}</span>
                    <Button onClick={logout} variant="outline" size="icon">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </header>
            <Tabs defaultValue="student-management">
                <TabsList>
                    <TabsTrigger value="student-management">Student Management</TabsTrigger>
                    <TabsTrigger value="points-management">Points Management</TabsTrigger>
                </TabsList>
                <TabsContent value="student-management">
                    <StudentManagement />
                </TabsContent>
                <TabsContent value="points-management">
                    <PointsManagement />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default TeacherDashboard;