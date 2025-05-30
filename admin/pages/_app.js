import "@/styles/globals.css";
import { HeroUIProvider } from "@heroui/react";
import { Provider } from 'react-redux';
import { store } from '../store';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { restoreSession } from '../store/slices/authSlice';

// Authentication Guard Component
function AuthGuard({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useSelector((state) => state.auth);
  
  // Public sayfalar (authentication gerektirmeyen)
  const publicPages = ['/login'];
  const isPublicPage = publicPages.includes(router.pathname);

  // Session restore et
  useEffect(() => {
    if (!isInitialized) {
      dispatch(restoreSession());
    }
  }, [dispatch, isInitialized]);

  // Authentication kontrolü
  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated && !isPublicPage) {
        // Giriş yapılmamış ve public sayfa değilse login'e yönlendir
        router.push('/login');
      } else if (isAuthenticated && isPublicPage) {
        // Giriş yapılmış ve login sayfasındaysa ana sayfaya yönlendir
        router.push('/');
      }
    }
  }, [isAuthenticated, isInitialized, isPublicPage, router]);

  // Henüz initialize olmamışsa loading göster
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Public sayfa ise veya giriş yapılmışsa içeriği göster
  if (isPublicPage || isAuthenticated) {
    return children;
  }

  // Diğer durumlarda loading göster (yönlendirme sırasında)
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Yönlendiriliyor...</p>
      </div>
    </div>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <HeroUIProvider>
        <AuthGuard>
          <Component {...pageProps} />
        </AuthGuard>
      </HeroUIProvider>
    </Provider>
  );
}
