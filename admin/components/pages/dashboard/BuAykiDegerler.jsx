import React from 'react';
import { FaMoneyBillWave, FaChartLine, FaShoppingBag, FaUserPlus, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const BuAykiDegerler = () => {
  // Örnek veriler - API'den gelecek
  const stats = {
    primary: { 
      title: 'Bu Ay Hasılat', 
      value: '₺45.2K', 
      trend: '+23.1%',
      trendUp: true,
      icon: FaMoneyBillWave, 
      iconColor: 'text-emerald-400',
      iconBg: 'bg-green-500/10',
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      trendColor: 'text-emerald-500',
      trendBg: 'bg-green-500/10',
    },
    secondary: [
      { 
        title: 'Bu Ay Sipariş', 
        value: 250, 
        trend: '+12.5%',
        trendUp: true,
        icon: FaShoppingBag, 
        iconColor: 'text-indigo-400',
        iconBg: 'bg-indigo-600/10',
        gradient: 'from-indigo-600 to-indigo-500',
        trendColor: 'text-indigo-400',
      },
      { 
        title: 'Ort. Sipariş Tutarı', 
        value: '₺180.8', 
        trend: '+9.3%',
        trendUp: true,
        icon: FaChartLine, 
        iconColor: 'text-purple-400',
        iconBg: 'bg-purple-500/10',
        gradient: 'from-purple-500 to-violet-500',
        trendColor: 'text-purple-400',
      },
      { 
        title: 'Yeni Üyeler', 
        value: 89, 
        trend: '+15.7%',
        trendUp: true,
        icon: FaUserPlus, 
        iconColor: 'text-gray-500',
        iconBg: 'bg-gray-600/10',
        gradient: 'from-gray-600 to-gray-500',
        trendColor: 'text-gray-500',
      },
    ]
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Primary Card - Büyük */}
      <div className="lg:col-span-1 group relative">
        <div className="relative h-full border border-gray-700/40 rounded-2xl p-5 hover:border-gray-600/50 transition-all duration-300 overflow-hidden" style={{ backgroundColor: '#1d1d2b' }}>
          {/* Subtle Gradient Mist */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stats.primary.gradient} blur-3xl opacity-10 pointer-events-none`} />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/[0.02] pointer-events-none" />
          <div className="flex flex-col h-full justify-between relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${stats.primary.iconBg} group-hover:scale-105 transition-transform duration-300`}>
                <stats.primary.icon className={`text-[22px] ${stats.primary.iconColor}`} />
              </div>
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${stats.primary.trendBg}`}>
                {stats.primary.trendUp ? <FaArrowUp className={`text-xs ${stats.primary.trendColor}`} /> : <FaArrowDown className={`text-xs ${stats.primary.trendColor}`} />}
                <span className={`text-xs font-semibold ${stats.primary.trendColor}`}>
                  {stats.primary.trend}
                </span>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-gray-400 mb-1.5">{stats.primary.title}</p>
              <p className="text-3xl font-bold text-white tracking-tight">
                {typeof stats.primary.value === 'number' ? stats.primary.value.toLocaleString('tr-TR') : stats.primary.value}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Cards - Grid */}
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.secondary.map((stat, index) => (
          <div key={index} className="group">
            <div className="h-full border border-gray-700/40 rounded-2xl p-4 hover:border-gray-600/50 transition-all duration-300 overflow-hidden relative" style={{ backgroundColor: '#1d1d2b' }}>
              {/* Subtle Gradient Mist */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} blur-3xl opacity-10 pointer-events-none`} />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/[0.02] pointer-events-none" />
              <div className="flex flex-col h-full justify-between relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${stat.iconBg} group-hover:scale-105 transition-transform duration-300`}>
                    <stat.icon className={`text-lg ${stat.iconColor}`} />
                  </div>
                  <div className={`flex items-center gap-1 ${stat.trendColor}`}>
                    {stat.trendUp ? <FaArrowUp className="text-[10px]" /> : <FaArrowDown className="text-[10px]" />}
                    <span className="text-xs font-semibold">{stat.trend}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">{stat.title}</p>
                  <p className="text-2xl font-bold text-white tracking-tight">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString('tr-TR') : stat.value}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuAykiDegerler;