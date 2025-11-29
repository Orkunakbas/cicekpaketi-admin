import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const TotalDegerler = () => {
  // Örnek veriler - API'den gelecek
  const stats = [
    { 
      title: 'Toplam Sipariş', 
      value: 1250, 
      chartColor: '#3b82f6',
      gradient: 'from-blue-500 to-cyan-500',
      data: [
        { value: 1100 },
        { value: 1150 },
        { value: 1120 },
        { value: 1180 },
        { value: 1200 },
        { value: 1230 },
        { value: 1250 }
      ]
    },
    { 
      title: 'Toplam Üye', 
      value: 1234, 
      chartColor: '#ec4899',
      gradient: 'from-pink-500 to-rose-500',
      data: [
        { value: 1100 },
        { value: 1140 },
        { value: 1170 },
        { value: 1190 },
        { value: 1210 },
        { value: 1220 },
        { value: 1234 }
      ]
    },
    { 
      title: 'Toplam Ürün', 
      value: 156, 
      chartColor: '#a855f7',
      gradient: 'from-purple-500 to-pink-500',
      data: [
        { value: 120 },
        { value: 130 },
        { value: 135 },
        { value: 145 },
        { value: 148 },
        { value: 152 },
        { value: 156 }
      ]
    },
    { 
      title: 'Toplam Değerlendirme', 
      value: 342, 
      chartColor: '#eab308',
      gradient: 'from-yellow-500 to-amber-500',
      data: [
        { value: 280 },
        { value: 295 },
        { value: 310 },
        { value: 320 },
        { value: 330 },
        { value: 338 },
        { value: 342 }
      ]
    },
  ];

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
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TotalDegerler;