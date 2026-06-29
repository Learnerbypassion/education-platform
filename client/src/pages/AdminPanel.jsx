import { useEffect, useState } from 'react';
import API from '../api/axios';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { HiOutlineUserRemove, HiOutlineAcademicCap } from 'react-icons/hi';
import { formatDate } from '../utils/helpers';
import './AdminPanel.css';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      setUsers(res.data.data);
    } catch {
      toast.error('Failed to load users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await API.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Delete failed');
    }
  };

  if (loading) return <Loader text="Loading administrative space..." />;

  return (
    <div className="admin-page">
      <h1 className="section-title">Admin <span className="gradient-text">Panel</span></h1>
      <p className="section-subtitle">System administration & user moderation</p>

      <div className="admin-table-wrapper glass-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td className="admin-user-cell">{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.role === 'admin' ? 'badge-accent' : u.role === 'instructor' ? 'badge-info' : 'badge-primary'}`}>{u.role}</span></td>
                <td>{formatDate(u.createdAt)}</td>
                <td>
                  <button className="btn btn-ghost btn-sm admin-delete-btn" onClick={() => handleDelete(u._id)} disabled={u.role === 'admin'}>
                    <HiOutlineUserRemove /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
