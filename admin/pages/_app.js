import "@/styles/globals.css";
import { HeroUIProvider } from "@heroui/react";
import { NextIntlClientProvider } from 'next-intl';
import { Provider } from 'react-redux';
import { store } from '../store';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { restoreSession } from '../store/slices/adminSlice';
import Head from 'next/head';
import Sidebar from '../components/design/sidebar/Sidebar';
import Topbar from '../components/design/topbar/Topbar';
import { motion } from 'framer-motion';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

// Inter font konfigürasyonu
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Authentication Guard Component
function AuthGuard({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [redirectDelay, setRedirectDelay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { isAuthenticated, isInitialized, successMessage, sidebarCollapsed } = useSelector((state) => state.admin);
  
  // Public sayfalar (authentication gerektirmeyen)
  const publicPages = ['/login'];
  const isPublicPage = publicPages.includes(router.pathname);

  // Component mount kontrolü
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Session restore et
  useEffect(() => {
    if (isMounted && !isInitialized) {
      dispatch(restoreSession());
    }
  }, [dispatch, isInitialized, isMounted]);

  // Authentication kontrolü ve loading state
  useEffect(() => {
    if (isMounted && isInitialized && !redirectDelay) {
      if (!isAuthenticated && !isPublicPage) {
        // Giriş yapılmamış ve public sayfa değilse login'e yönlendir
        router.push('/login');
      } else if (isAuthenticated && isPublicPage && !successMessage) {
        // Giriş yapılmış ve login sayfasındaysa ana sayfaya yönlendir (success message yoksa)
        router.push('/');
      } else {
        // Her şey tamam, loading'i kapat
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, isInitialized, isPublicPage, router, redirectDelay, successMessage, isMounted]);

  // Login başarılı olduğunda 2 saniye bekle
  useEffect(() => {
    if (successMessage && isAuthenticated && isPublicPage) {
      setRedirectDelay(true);
      const timer = setTimeout(() => {
        setRedirectDelay(false);
        router.push('/');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage, isAuthenticated, isPublicPage, router]);

  // Server-side rendering sırasında hiçbir şey gösterme
  if (!isMounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  // Loading durumunda hiçbir şey gösterme
  if (!isInitialized || isLoading) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  // Login sayfasında sidebar gösterme
  if (isPublicPage) {
    return children;
  }

  // Diğer sayfalarda sidebar ile layout
  return (
    <div className="flex h-screen">
      <Sidebar />
      <motion.div 
        className="flex-1 flex flex-col"
        animate={{ 
          marginLeft: sidebarCollapsed ? '64px' : '256px'
        }}
        transition={{ 
          duration: 0.3, 
          ease: "easeInOut" 
        }}
      >
        <Topbar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </motion.div>
    </div>
  );
}

App.getInitialProps = async ({ ctx }) => {
  const { locale = 'tr' } = ctx;
  
  // Dil mesajlarını yükle
  let messages = {};
  try {
    messages = {
      common: (await import(`../languages/${locale}/common.json`)).default,
    };
  } catch (error) {
    console.error('Dil dosyası yüklenemedi:', error);
    messages = { common: {} };
  }

  return {
    pageProps: {
      messages,
      locale,
    }
  };
};

export default function App({ Component, pageProps }) {
  const router = useRouter();
  
  return (
    <Provider store={store}>
      <HeroUIProvider>
        <NextIntlClientProvider messages={pageProps?.messages} locale={router.locale || 'tr'}>
          <Head>
            <title>Orwys | Yönetim Paneli</title>
          </Head>
          <div className={`${inter.variable} font-sans`}>
            <AuthGuard>
              <Component {...pageProps} />
            </AuthGuard>
          </div>
          <Toaster 
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1e1e2d',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
              },
              success: {
                style: {
                  background: '#1e1e2d',
                  color: '#fff',
                  border: '1px solid #10b981',
                },
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                style: {
                  background: '#1e1e2d',
                  color: '#fff',
                  border: '1px solid #ef4444',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </NextIntlClientProvider>
      </HeroUIProvider>
    </Provider>
  );
}
