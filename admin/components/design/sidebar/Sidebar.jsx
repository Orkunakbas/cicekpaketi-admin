import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { Button } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { clearCredentials, toggleSidebar } from '../../../store/slices/adminSlice';
import { AiOutlineHome } from "react-icons/ai";
import { BiCategory } from "react-icons/bi";









import { HiLanguage } from "react-icons/hi2";
import { HiOutlinePencilSquare } from "react-icons/hi2";








import { FaHome, FaUsers, FaFileAlt, FaCog, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaChevronDown, FaUserPlus, FaUserEdit, FaUserShield, FaPlus, FaEdit, FaTrash, FaInfoCircle, FaFile, FaBox, FaNewspaper, FaBlog, FaHandshake, FaVideo, FaQuestionCircle, FaWpforms, FaLanguage, FaCubes, FaMinus, FaClipboardList } from 'react-icons/fa';
import { FaRegImages } from 'react-icons/fa6';
import { AiOutlineRight } from 'react-icons/ai';
import { Avatar } from '@heroui/react';
import { cn } from '@heroui/react';
import Image from 'next/image';

const Sidebar = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, sidebarCollapsed } = useSelector((state) => state.admin);
  const [expandedMenus, setExpandedMenus] = useState({});

  const handleLogout = () => {
    dispatch(clearCredentials());
    router.push('/login');
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const toggleSubmenu = (menuKey) => {
    if (sidebarCollapsed) return; // Collapsed durumda alt menü açılmasın
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const menuItems = [
    { 
      icon: AiOutlineHome, 
      label: 'Dashboard', 
      path: '/',
      key: 'dashboard'
    },
    { 
      icon: FaRegImages, 
      label: 'Banner\'lar', 
      path: '/bannerlar',
      key: 'bannerlar'
    },
    { 
      icon: BiCategory, 
      label: 'Kategoriler', 
      path: '/kategoriler',
      key: 'kategoriler'
    },
    { 
      icon: FaCubes, 
      label: 'Varyantlar', 
      path: '/varyantlar',
      key: 'varyantlar'
    },
    { 
      icon: FaBox, 
      label: 'Ürünler', 
      path: '/urunler',
      key: 'urunler'
    },
    { 
      icon: FaClipboardList, 
      label: 'Siparişler', 
      path: '/siparisler',
      key: 'siparisler'
    },
    { 
      icon: FaUsers, 
      label: 'Kullanıcılar', 
      path: '/kullanicilar',
      key: 'kullanicilar'
    },
    /* { 
        icon: AiOutlineMenu, 
        label: 'Menü', 
        path: '/menu',
        key: 'menu'
      },
    { 
      icon: AiOutlineInfoCircle, 
      label: 'Hakkımızda', 
      path: '/about',
      key: 'about'
    },
    { 
      icon: AiOutlineLayout, 
      label: 'Sayfalar', 
      path: '/pages',
      key: 'pages'
    }, */
  ];

  return (
    <motion.div 
      className="border-r border-divider bg-dark flex flex-col h-screen fixed left-0 top-0 z-30 shadow-sm"
      animate={{ 
        width: sidebarCollapsed ? '64px' : '256px'
      }}
      transition={{ 
        duration: 0.3, 
        ease: "easeInOut" 
      }}
    >
      {/* Logo & Toggle */}
      <div className="px-6 py-4 border-b border-divider flex items-center justify-between h-[73px]">
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src="/logo.png"
                alt="ORWYS Logo"
                width={38}
                height={32}
                className="object-contain"
                priority
              />
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                ORWYS
              </h1>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.Button
          onClick={handleToggleSidebar}
          className={cn(
            "p-2.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl transition-all duration-200 border",
            sidebarCollapsed ? "border-transparent" : "border-gray-700"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: sidebarCollapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {sidebarCollapsed ? (
              <FaChevronRight className="w-4 h-4" />
            ) : (
              <FaChevronLeft className="w-4 h-4" />
            )}
          </motion.div>
        </motion.Button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 custom-scrollbar">
        <ul className="flex flex-col gap-0.5">
            {menuItems.map((item, index) => {
              const hasSubItems = item.hasSubmenu;
              const isExpanded = expandedMenus[item.key];
              const isSelected = router.pathname === item.path;

              if (hasSubItems) {
                return (
                  <li key={item.key}>
                    {/* Ana Menü - Alt menüsü olan */}
                    <button
                      onClick={() => toggleSubmenu(item.key)}
                      className={cn(
                        "relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium overflow-hidden",
                        "text-gray-300 transition-all duration-300 hover:text-white focus:outline-none group",
                        "before:absolute before:inset-0 before:bg-white/5 before:opacity-0 before:transition-opacity hover:before:opacity-100"
                      )}
                    >
                      <div className={cn(
                        "relative z-10 w-10 h-10 rounded-xl flex items-center justify-center text-white border transition-all duration-300",
                        sidebarCollapsed 
                          ? "border-transparent" 
                          : "border-gray-700 group-hover:scale-105 group-hover:border-gray-600"
                      )}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      {!sidebarCollapsed && (
                        <>
                          <span className="relative z-10 flex-1 text-left font-medium">{item.label}</span>
                          <AiOutlineRight
                            className={cn(
                              "relative z-10 text-gray-400 transition-all duration-300",
                              isExpanded && "rotate-90 text-white"
                            )}
                            size={14}
                          />
                        </>
                      )}
                    </button>

                    {/* Alt Menüler */}
                    <AnimatePresence>
                      {isExpanded && !sidebarCollapsed && (
                          <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          style={{ overflow: "hidden" }}
                          className="mt-1 ml-14 space-y-0.5"
                        >
                            {item.submenu.map((sub, subIndex) => {
                              const isSubSelected = router.pathname === sub.path;
                              return (
                                <motion.button
                                  key={sub.path}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: subIndex * 0.05 }}
                                  onClick={() => router.push(sub.path)}
                                  className="flex w-full items-center gap-2.5 rounded-xl py-2 px-3 text-sm transition-all duration-200 text-gray-400 hover:bg-white/5 hover:text-white"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full transition-all bg-gray-500" />
                                  <span className="text-sm">{sub.label}</span>
                                </motion.button>
                              );
                            })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              } else {
                // Alt menüsü olmayan üst menü
                return (
                  <li key={item.key}>
                    <button
                      onClick={() => router.push(item.path)}
                      className="relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium overflow-hidden transition-all duration-300 focus:outline-none group text-gray-300 hover:text-white before:absolute before:inset-0 before:bg-white/5 before:opacity-0 hover:before:opacity-100"
                    >
                      <div className={cn(
                        "relative z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 text-white border",
                        sidebarCollapsed 
                          ? "border-transparent" 
                          : "border-gray-700 group-hover:scale-105 group-hover:border-gray-600"
                      )}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      {!sidebarCollapsed && (
                        <span className="relative z-10 flex-1 text-left font-medium">{item.label}</span>
                      )}
                    </button>
                  </li>
                );
              }
            })}
          </ul>
      </nav>

      {/* Çıkış Yap Butonu */}
      <div className="p-4 border-t border-divider">
        <Button
        color='secondary'
          className="w-full font-medium text-white"
          onPress={handleLogout}
          startContent={!sidebarCollapsed && <FaSignOutAlt size={16} />}
        >
          {!sidebarCollapsed && "Çıkış Yap"}
        </Button>
      </div>
    </motion.div>
  );
};

export default Sidebar;