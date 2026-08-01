import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../hooks/useAuth';
import { updateProfile } from '../api/authApi';
import { loadUser } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import { getInitials } from '../utils/helpers';
import { 
  HiOutlineUser, 
  HiOutlineCamera, 
  HiOutlineSparkles, 
  HiOutlinePencilAlt
} from 'react-icons/hi';
import { FaGithub } from 'react-icons/fa';
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
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      toast.success('Image selected! Click Save Profile to apply.');
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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Member';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="profile-container max-w-3xl mx-auto space-y-8 py-4 animate-fade-in">
      
      {/* Header Banner & Profile Card */}
      <div className="relative rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[#0c0e17]/90 shadow-2xl backdrop-blur-2xl overflow-hidden">
        {/* Cover Gradient Mesh Banner */}
        <div className="h-36 md:h-44 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-black/30" />
        </div>

        {/* Profile Info Overlay Row */}
        <div className="px-6 md:px-8 pb-6 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-14 md:-mt-16">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            {/* Avatar Circle with Upload Trigger */}
            <div className="relative group">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full p-1 bg-white dark:bg-[#0c0e17] shadow-xl relative z-10 overflow-hidden">
                {preview ? (
                  <img src={preview} alt={form.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-2xl font-black text-white shadow-inner">
                    {getInitials(form.name)}
                  </div>
                )}
                <label className="absolute inset-1 rounded-full bg-slate-950/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-1 text-white cursor-pointer z-20">
                  <HiOutlineCamera size={22} />
                  <span className="text-[9px] font-extrabold uppercase tracking-wider">Change</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>

            {/* Name Header */}
            <div className="space-y-1 pb-1">
              <h1 className="text-2xl md:text-3xl font-black font-heading text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
                {form.name || 'User Profile'}
              </h1>
            </div>
          </div>

        </div>
      </div>

      {/* Main Form Editor Panel */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[#0c0e17]/90 p-6 md:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
        
        {/* Editor Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading flex items-center gap-2">
            <HiOutlinePencilAlt className="text-indigo-500" />
            <span>Edit Profile</span>
          </h2>
          <span className="text-xs font-bold text-slate-400">Account Details</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" id="profile-form">
          
          {/* Personal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="profile-name" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <HiOutlineUser />
                </div>
                <input
                  id="profile-name"
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/60 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-github" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                GitHub Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FaGithub />
                </div>
                <input
                  id="profile-github"
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/60 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="e.g. samitnandi"
                  value={form.githubUsername}
                  onChange={(e) => setForm({ ...form, githubUsername: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile-bio" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              Bio & Overview
            </label>
            <textarea
              id="profile-bio"
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/60 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="Tell us about yourself..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>

          {/* Social Profiles */}
          <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Social Links
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="profile-web" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Website
                </label>
                <input
                  id="profile-web"
                  type="url"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/60 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="https://yourwebsite.com"
                  value={form.socialLinks.website}
                  onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, website: e.target.value } })}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="profile-linkedin" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  LinkedIn
                </label>
                <input
                  id="profile-linkedin"
                  type="url"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/60 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="https://linkedin.com/in/..."
                  value={form.socialLinks.linkedin}
                  onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, linkedin: e.target.value } })}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="profile-twitter" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Twitter
                </label>
                <input
                  id="profile-twitter"
                  type="url"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/60 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="https://twitter.com/..."
                  value={form.socialLinks.twitter}
                  onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, twitter: e.target.value } })}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white rounded-2xl font-extrabold text-sm shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <HiOutlineSparkles />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};

export default Profile;
