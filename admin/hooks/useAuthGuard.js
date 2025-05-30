import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

// Korumalı sayfalar için hook
export const useProtectedRoute = () => {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return { isAuthenticated };
};

// Login sayfası için hook (giriş yapılmışsa ana sayfaya yönlendir)
export const useLoginGuard = () => {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  return { isAuthenticated };
};

// Genel authentication guard
export const useAuthGuard = (requireAuth = true, redirectTo = '/') => {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      // Giriş gerekli ama yapılmamış -> login'e yönlendir
      router.push('/login');
    } else if (!requireAuth && isAuthenticated) {
      // Giriş yapılmış ama public sayfada -> belirtilen sayfaya yönlendir
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, requireAuth, redirectTo]);

  return { isAuthenticated };
}; 