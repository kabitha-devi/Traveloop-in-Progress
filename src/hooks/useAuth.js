import useAuthStore from '../store/authStore';

export function useAuth() {
  const { currentUser, isAuthenticated, isLoading, login, register, logout, updateProfile } = useAuthStore();

  return {
    user: currentUser,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    initials: currentUser
      ? `${currentUser.firstName?.[0] || ''}${currentUser.lastName?.[0] || ''}`.toUpperCase()
      : '?',
  };
}

export default useAuth;
