import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);
  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    isInstructor: user?.role === 'instructor' || user?.role === 'admin',
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
  };
};
