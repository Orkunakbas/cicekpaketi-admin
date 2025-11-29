import React from 'react';
import { useSelector } from 'react-redux';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const TotalDegerler = () => {
  const { totalStats, loading } = useSelector((state) => state.dashboard);

  // API'den gelen verileri kullan
  const stats = [
    { 
      title: 'Toplam Sipariş', 
      value: totalStats?.totalOrders.value || 0, 
      chartColor: '#3b82f6',
      gradient: 'from-blue-500 to-cyan-500',
      data: totalStats?.totalOrders.chartData || []
    },
    { 
      title: 'Toplam Üye', 
      value: totalStats?.totalUsers.value || 0, 
      chartColor: '#ec4899',
      gradient: 'from-pink-500 to-rose-500',
      data: totalStats?.totalUsers.chartData || []
    },
    { 
      title: 'Toplam Ürün', 
      value: totalStats?.totalProducts.value || 0, 
      chartColor: '#a855f7',
      gradient: 'from-purple-500 to-pink-500',
      data: totalStats?.totalProducts.chartData || []
    },
    { 
      title: 'Toplam Değerlendirme', 
      value: 0, 
      chartColor: '#eab308',
      gradient: 'from-yellow-500 to-amber-500',
      data: [
        { value: 0 },
        { value: 0 },
        { value: 0 },
        { value: 0 },
        { value: 0 },
        { value: 0 },
        { value: 0 }
      ]
    },
  ];

  if (loading.totalStats) {
    return <div className="text-white">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-3">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="group relative border border-gray-700/40 rounded-2xl overflow-hidden hover:border-gray-600/50 transition-all duration-300">
          {/* Subtle Gradient Background */}
          <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
          
          {/* Content */}
          <div className="relative p-4">
            <div className="flex items-center justify-between">
              {/* Title & Value */}
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">{stat.title}</p>
                <p className="text-xl font-bold text-white tabular-nums">{stat.value.toLocaleString('tr-TR')}</p>
              </div>
              
              {/* Mini Area Chart - Cute & Modern */}
              {stat.data && stat.data.length > 0 ? (
                <div className="flex-shrink-0 w-20 h-10 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stat.data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={stat.chartColor} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={stat.chartColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={stat.chartColor}
                        strokeWidth={2}
                        fill={`url(#gradient-${index})`}
                        isAnimationActive={true}
                        animationDuration={800}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-shrink-0 w-20 h-10 flex items-center justify-center opacity-30">
                  <span className="text-xs text-gray-500">-</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TotalDegerler;