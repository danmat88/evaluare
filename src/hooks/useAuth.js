import useAuthStore from '../store/authStore';

// ✅ init() is called once in main.jsx — this hook just reads state
const useAuth = () => {
  const { user, profile, loading, error, logout, clearError } = useAuthStore();
  return {
    user,
    profile,
    loading,
    error,
    logout,
    clearError,
    isAuthenticated: !!user,
  };
};

export default useAuth;
