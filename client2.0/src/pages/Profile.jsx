import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../hooks/useAuth';
import { updateProfile } from '../api/authApi';
import { loadUser } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import { getInitials } from '../utils/helpers';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    githubUsername: user?.githubUsername || '',
    socialLinks: {
      website: user?.socialLinks?.website || '',
      linkedin: user?.socialLinks?.linkedin || '',
      twitter: user?.socialLinks?.twitter || '',
    },
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(user?.profileImage || '');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('bio', form.bio);
      formData.append('githubUsername', form.githubUsername);
      formData.append('socialLinks[website]', form.socialLinks.website);
      formData.append('socialLinks[linkedin]', form.socialLinks.linkedin);
      formData.append('socialLinks[twitter]', form.socialLinks.twitter);
      
      if (imageFile) {
        formData.append('profileImage', imageFile);
      }

      await updateProfile(formData);
      await dispatch(loadUser());
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <h1 className="profile-title section-title">My <span className="gradient-text">Profile</span></h1>
      
      <form onSubmit={handleSubmit} className="profile-form glass-card" id="profile-form">
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper">
            {preview ? (
              <img src={preview} alt={form.name} className="avatar avatar-xl" />
            ) : (
              <div className="avatar avatar-xl avatar-placeholder">{getInitials(form.name)}</div>
            )}
            <label className="avatar-upload-btn">
              Change Image
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
          </div>
          <div className="profile-info-header">
            <h3>{form.name}</h3>
            <span className="badge badge-primary">{user?.role}</span>
          </div>
        </div>

        <div className="divider" />

        <div className="grid grid-2">
          <div className="input-group">
            <label htmlFor="profile-name">Full Name</label>
            <input id="profile-name" type="text" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="input-group">
            <label htmlFor="profile-github">GitHub Username</label>
            <input id="profile-github" type="text" className="input-field" placeholder="github_user" value={form.githubUsername} onChange={(e) => setForm({ ...form, githubUsername: e.target.value })} />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="profile-bio">Bio</label>
          <textarea id="profile-bio" className="input-field" placeholder="Tell us about yourself..." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>

        <div className="profile-social-inputs">
          <h4>Social Profiles</h4>
          <div className="grid grid-3">
            <div className="input-group">
              <label htmlFor="profile-web">Website</label>
              <input id="profile-web" type="url" className="input-field" placeholder="https://" value={form.socialLinks.website} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, website: e.target.value } })} />
            </div>
            <div className="input-group">
              <label htmlFor="profile-linkedin">LinkedIn</label>
              <input id="profile-linkedin" type="url" className="input-field" placeholder="https://linkedin.com/in/" value={form.socialLinks.linkedin} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, linkedin: e.target.value } })} />
            </div>
            <div className="input-group">
              <label htmlFor="profile-twitter">Twitter</label>
              <input id="profile-twitter" type="url" className="input-field" placeholder="https://twitter.com/" value={form.socialLinks.twitter} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, twitter: e.target.value } })} />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
