import { useSetAtom, useAtomValue } from 'jotai';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import { accessTokenAtom, refreshTokenAtom, userAtom } from '@/atoms/auth.atoms';
import type { LoginDto, RegisterDto } from '@/types/auth.types';

export function useAuth() {
  const setAccessToken = useSetAtom(accessTokenAtom);
  const setRefreshToken = useSetAtom(refreshTokenAtom);
  const setUser = useSetAtom(userAtom);
  const isAuthenticated = useAtomValue(accessTokenAtom);

  const loginMutation = useMutation({
    mutationFn: (dto: LoginDto) => authApi.login(dto),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setUser(data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (dto: RegisterDto) => authApi.register(dto),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setUser(data.user);
    },
  });

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  };

  return {
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    
    logout,
    isAuthenticated: !!isAuthenticated,
  };
}
