import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { 
  Button, 
  Badge, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  Avatar,
  Chip,
  Tooltip
} from '@heroui/react';
import { motion } from 'framer-motion';
import { clearCredentials } from '../../../store/slices/adminSlice';
import { fetchLanguages } from '../../../store/slices/languageSlice';
import { 
  FaEye, 
  FaBell, 
  FaUser, 
  FaCog, 
  FaSignOutAlt,
  FaHome,
  FaChevronRight,
  FaChartBar,
  FaQuestionCircle,
  FaUsers,
  FaRocket,
  FaGlobe,
  FaCheck
} from 'react-icons/fa';
import { HiLanguage } from "react-icons/hi2";

const Topbar = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.admin);
  const { languages, isLoading } = useSelector((state) => state.language);
  const [selectedLanguage, setSelectedLanguage] = useState(router.locale || 'tr');

  // Dilleri yükle
  useEffect(() => {
    dispatch(fetchLanguages());
  }, [dispatch]);

  const handleLanguageChange = (locale) => {
    router.push(router.pathname, router.asPath, { locale });
    setSelectedLanguage(locale);
  };

  // Breadcrumb oluştur
  const getBreadcrumb = () => {
    const path = router.pathname;
    const segments = path.split('/').filter(Boolean);
    
    const breadcrumbMap = {
      '': 'Dashboard',
      'users': 'Kullanıcı Yönetimi',
      'content': 'İçerik Yönetimi',
      'settings': 'Sistem Ayarları',
      'analytics': 'İstatistikler',
      'notifications': 'Bildirimler'
    };

    if (segments.length === 0) {
      return [{ label: 'Dashboard', path: '/' }];
    }

    const breadcrumbs = [{ label: 'Dashboard', path: '/' }];
    let currentPath = '';

    segments.forEach(segment => {
      currentPath += `/${segment}`;
      breadcrumbs.push({
        label: breadcrumbMap[segment] || segment,
        path: currentPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumb();

  const handleSiteView = () => {
    window.open('http://localhost:3000', '_blank');
  };

  const handleLogout = () => {
    dispatch(clearCredentials());
    router.push('/login');
  };

  return (
    <div className="border-b border-divider bg-dark sticky top-0 shadow-sm relative">
      {/* Ana Topbar */}
      <motion.div 
        className="px-6 py-4 flex items-center justify-between h-[73px] box-border"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Sol Taraf - Breadcrumb & Sayfa Bilgisi */}
        <div className="flex items-center space-x-4">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2">
            <FaHome className="text-gray-400 w-4 h-4" />
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center space-x-2">
                {index > 0 && <FaChevronRight className="text-gray-400 w-3 h-3" />}
                <button
                  onClick={() => router.push(crumb.path)}
                  className={`text-sm transition-colors ${
                    index === breadcrumbs.length - 1
                      ? 'text-white font-semibold'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {crumb.label}
                </button>
              </div>
            ))}
          </div>
          
          {/* Sayfa Açıklaması */}
          <div className="hidden md:block">
            <span className="text-xs text-gray-300 bg-gray-800 px-2 py-1 rounded">
              {router.pathname === '/' ? 'Sistem Özeti' : 
               router.pathname === '/users' ? 'Kullanıcı İşlemleri' :
               router.pathname === '/content' ? 'İçerik Düzenleme' :
               router.pathname === '/settings' ? 'Sistem Konfigürasyonu' : 'Yönetim Paneli'}
            </span>
          </div>
        </div>



        {/* Sağ Taraf - Profesyonel Aksiyonlar */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Dil Seçimi */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                variant="light"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-700 hover:border-gray-600">
                  <HiLanguage />
                </div>
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Dil Seçimi"
              className="w-48"
            >
              {isLoading ? (
                <DropdownItem key="loading" isReadOnly>
                  Yükleniyor...
                </DropdownItem>
              ) : languages.length > 0 ? (
                languages
                  .filter(lang => lang.is_active)
                  .map((lang) => (
                    <DropdownItem 
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={selectedLanguage === lang.code ? 'bg-white/5' : ''}
                    >
                      <div className="flex items-center justify-between">
                        <span>{lang.name}</span>
                        {selectedLanguage === lang.code && <FaCheck className="text-green-500" />}
                      </div>
                    </DropdownItem>
                  ))
              ) : (
                <DropdownItem key="no-lang" isReadOnly>
                  Dil bulunamadı
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
         

          {/* Kullanıcı Menüsü */}
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                radius="full"
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'Admin')}&background=3b82f6&color=fff&size=128`}
                className="cursor-pointer"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Kullanıcı menüsü" className="w-64">
              <DropdownItem 
                key="profile-info" 
                textValue="Kullanıcı Bilgisi"
                className="cursor-default border-b border-gray-700"
              >
                <div className="py-2">
                  <p className="text-gray-300">Hoşgeldin,</p>
                  <p className="font-semibold">{user?.fullname || user?.username}</p>
                </div>
              </DropdownItem>
              
              <DropdownItem 
                key="dashboard" 
                onClick={() => router.push('/')}
              >
                Dashboard
              </DropdownItem>
              
              <DropdownItem 
                key="profile-settings" 
                onClick={() => router.push('/profile')}
              >
                Profil Ayarları
              </DropdownItem>
              
              <DropdownItem 
                key="analytics" 
                onClick={() => router.push('/analytics')}
              >
                İstatistikler
              </DropdownItem>
              
              <DropdownItem 
                key="users" 
                onClick={() => router.push('/users')}
              >
                Kullanıcı Yönetimi
              </DropdownItem>
              
              <DropdownItem 
                key="settings" 
                onClick={() => router.push('/settings')}
              >
                Sistem Ayarları
              </DropdownItem>
              
              <DropdownItem 
                key="help" 
                onClick={() => window.open('https://docs.orwys.com', '_blank')}
              >
                Yardım & Dokümantasyon
              </DropdownItem>
              
              <DropdownItem 
                key="logout" 
                color="danger"
                onClick={handleLogout}
              >
                Çıkış Yap
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
      
        </div>
      </motion.div>
    </div>
  );
};

export default Topbar;