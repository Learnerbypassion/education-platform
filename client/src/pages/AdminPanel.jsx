import { useEffect, useState } from 'react';
import API from '../api/axios';
import { getAdminStats } from '../api/analyticsApi';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { HiOutlineUserRemove, HiOutlineAcademicCap, HiOutlineUserGroup, HiOutlineBookOpen, HiOutlineCollection, HiOutlineBadgeCheck } from 'react-icons/hi';
import { formatDate } from '../utils/helpers';
import './AdminPanel.css';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        API.get('/users'),
        getAdminStats()
      ]);
      setUsers(usersRes.data.data);
      setStats(statsRes.data.data);
    } catch {
      toast.error('Failed to load administrative data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await API.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchData();
    } catch {
      toast.error('Delete failed');
    }
  };

  if (loading) return <Loader text="Loading administrative space..." />;

  return (
    <div className="admin-page animate-page-enter">
      <h1 className="section-title">Admin <span className="gradient-text">Panel</span></h1>
      <p className="section-subtitle">System administration & user moderation</p>

      {stats && (
        <div className="stats-grid grid grid-4 mb-lg animate-slide-up">
          <div className="stat-card glass-card">
            <div className="stat-icon-wrapper text-brand-600"><HiOutlineUserGroup size={24} /></div>
            <div className="stat-info">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon-wrapper text-info-600"><HiOutlineBookOpen size={24} /></div>
            <div className="stat-info">
              <h3>{stats.totalCourses}</h3>
              <p>Total Courses</p>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon-wrapper text-success-600"><HiOutlineCollection size={24} /></div>
            <div className="stat-info">
              <h3>{stats.totalEnrollments}</h3>
              <p>Enrollments</p>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon-wrapper text-accent-600"><HiOutlineBadgeCheck size={24} /></div>
            <div className="stat-info">
              <h3>{stats.totalCertificates}</h3>
              <p>Certificates</p>
            </div>
          </div>
        </div>
      )}

      <div className="admin-table-wrapper glass-card animate-slide-up delay-1">
        <h3>User Management</h3>
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
