import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';

const UserManagement = () => {
    const { addToast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showResetModal, setShowResetModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [processing, setProcessing] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            const response = await api.get('/auth/users');
            setUsers(response.data);
        } catch (error) {
            addToast('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleResetClick = (user) => {
        setSelectedUser(user);
        setNewPassword(''); // Reset field
        setShowResetModal(true);
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 6) {
            addToast('Password must be at least 6 characters', 'error');
            return;
        }

        setProcessing(true);
        try {
            await api.post(`/auth/users/${selectedUser.id}/reset-password`, { newPassword });
            addToast(`Password reset for ${selectedUser.username}`, 'success');
            setShowResetModal(false);
        } catch (error) {
            addToast(error.response?.data?.error || 'Failed to reset password', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleRoleChange = async (user, newRole) => {
        if (!window.confirm(`Change role of ${user.username} to ${newRole}?`)) return;

        try {
            await api.put(`/auth/users/${user.id}/role`, { role: newRole });
            addToast('Role updated', 'success');
            fetchUsers(); // Refresh list
        } catch (error) {
            addToast('Failed to update role', 'error');
        }
    };

    if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

    return (
        <Container fluid className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>User Management</h2>
                <Button variant="primary" onClick={fetchUsers}>Refresh</Button>
            </div>

            <div className="table-responsive shadow-sm rounded bg-white">
                <Table hover className="mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Created On</th>
                            <th className="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="align-middle fw-bold">{user.username}</td>
                                <td className="align-middle">
                                    <select
                                        className="form-select form-select-sm"
                                        style={{ width: 'auto' }}
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user, e.target.value)}
                                        disabled={user.username === 'admin'} // Protect primary admin
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="staff">Staff</option>
                                        <option value="manager">Manager</option>
                                    </select>
                                </td>
                                <td className="align-middle text-muted">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="text-end">
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleResetClick(user)}
                                    >
                                        Reset Password
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {/* Reset Password Modal */}
            <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Reset Password</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handlePasswordReset}>
                    <Modal.Body>
                        <p>Resetting password for user: <strong>{selectedUser?.username}</strong></p>
                        <Form.Group>
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <Form.Text className="text-muted">
                                Enter a strong temporary password.
                            </Form.Text>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowResetModal(false)}>Cancel</Button>
                        <Button variant="danger" type="submit" disabled={processing}>
                            {processing ? 'Resetting...' : 'Confirm Reset'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default UserManagement;
