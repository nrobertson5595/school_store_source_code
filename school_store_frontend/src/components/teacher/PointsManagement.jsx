import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { getUsers } from '../../services/userService';
import { awardPoints, awardPointsToMultipleStudents, getPointsTransactions } from '../../services/pointsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const PointsManagement = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [points, setPoints] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredStudents, setFilteredStudents] = useState([]);

    useEffect(() => {
        fetchStudentsAndTransactions();
    }, []);

    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filteredData = students.filter(item => {
            return Object.keys(item).some(key =>
                ['first_name', 'last_name'].includes(key) && String(item[key]).toLowerCase().includes(lowercasedFilter)
            );
        });
        setFilteredStudents(filteredData);
    }, [searchTerm, students]);

    const fetchStudentsAndTransactions = async () => {
        try {
            const result = await getUsers();
            // Handle the response structure - getUsers returns {success: boolean, users: array}
            if (result && result.success && result.users) {
                const studentUsers = result.users.filter(u => u.role === 'student');
                setStudents(studentUsers);
                setFilteredStudents(studentUsers);
            } else {
                console.error('[PointsManagement] Failed to fetch users:', result?.error || 'Unknown error');
                setStudents([]);
                setFilteredStudents([]);
            }

            const pointsHistory = await getPointsTransactions();
            // Handle the response structure - getPointsTransactions returns {success: boolean, transactions: array}
            // Ensure transactions is always an array
            if (pointsHistory && pointsHistory.success && Array.isArray(pointsHistory.transactions)) {
                setTransactions(pointsHistory.transactions);
            } else {
                console.error('[PointsManagement] Failed to fetch transactions:', pointsHistory?.error || 'Unknown error');
                setTransactions([]);
            }
        } catch (error) {
            console.error('[PointsManagement] Error fetching data:', error);
            setStudents([]);
            setTransactions([]);
        }
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(filteredStudents.map(s => s.id));
        }
        setSelectAll(!selectAll);
    };

    const handleStudentSelect = (studentId) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handleAwardPoints = async () => {
        if (selectedStudents.length === 0 || !points || !reason) {
            alert('Please select students, enter points, and provide a reason.');
            return;
        }

        // DEBUG LOGGING: Log what we're sending
        console.log('[DEBUG] Awarding points with:', {
            selectedStudents,
            points,
            reason,
            selectedStudentsType: typeof selectedStudents,
            pointsType: typeof points
        });

        setLoading(true);
        try {
            // Call awardPointsToMultipleStudents for multiple students
            const response = await awardPointsToMultipleStudents(selectedStudents, points, reason);

            // DEBUG LOGGING: Log the response
            console.log('[DEBUG] Award points response:', response);

            if (response.success) {
                setSelectedStudents([]);
                setPoints('');
                setReason('');
                setSelectAll(false);
                fetchStudentsAndTransactions();
                alert('Points awarded successfully!');
            } else {
                console.error('[DEBUG] Award points failed:', response);
                alert(`Failed to award points: ${response.results?.errors?.join(', ') || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Failed to award points:', error);
            console.error('[DEBUG] Award points error stack:', error.stack);
            alert('Failed to award points.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Award Points</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">Select Students</h3>
                            <Input
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="mb-2"
                            />
                            <div className="flex items-center space-x-2 mb-2">
                                <Checkbox id="selectAll" checked={selectAll} onCheckedChange={handleSelectAll} />
                                <label htmlFor="selectAll">Select All</label>
                            </div>
                            <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                                {filteredStudents.map(student => (
                                    <div key={student.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`student-${student.id}`}
                                            checked={selectedStudents.includes(student.id)}
                                            onCheckedChange={() => handleStudentSelect(student.id)}
                                        />
                                        <label htmlFor={`student-${student.id}`}>
                                            {student.first_name} {student.last_name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Input
                            type="number"
                            placeholder="Points to award"
                            value={points}
                            onChange={(e) => setPoints(e.target.value)}
                        />
                        <Textarea
                            placeholder="Reason for award"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                        <Button onClick={handleAwardPoints} disabled={loading}>
                            {loading ? 'Awarding...' : 'Award Points'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Points</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map(tx => (
                                <TableRow key={tx.id}>
                                    <TableCell>{tx.user_name}</TableCell>
                                    <TableCell>{tx.amount}</TableCell>
                                    <TableCell>{tx.reason}</TableCell>
                                    <TableCell>{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default PointsManagement;