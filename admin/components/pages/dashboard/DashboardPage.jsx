import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Title from '@/components/design/title/Title';
import TotalDegerler from './TotalDegerler';
import BuAykiDegerler from './BuAykiDegerler';
import EnCokSatanUrunler from './EnCokSatanUrunler';
import EnSonUyeList from './EnSonUyeList';
import { 
  fetchMonthlyStats, 
  fetchTotalStats, 
  fetchTopProducts, 
  fetchRecentUsers 
} from '@/store/slices/dashboardSlice';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // 'month', 'week', 'month30'

  useEffect(() => {
    // Seçilen periyoda göre verileri çek
    dispatch(fetchMonthlyStats(selectedPeriod));
    dispatch(fetchTotalStats());
    dispatch(fetchTopProducts());
    dispatch(fetchRecentUsers());
  }, [dispatch, selectedPeriod]);

  return (
    <div className="px-6 pb-10">

      {/* Bu Ayki Değerler */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
            Performans
          </h2>
          <div className="flex items-center gap-2 bg-gray-800/40 border border-gray-700/40 rounded-xl p-1">
            <button 
              onClick={() => setSelectedPeriod('month')}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                selectedPeriod === 'month' 
                  ? 'bg-gray-700/60 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Bu Ay
            </button>
            <button 
              onClick={() => setSelectedPeriod('week')}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                selectedPeriod === 'week' 
                  ? 'bg-gray-700/60 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Son 7 Gün
            </button>
            <button 
              onClick={() => setSelectedPeriod('month30')}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                selectedPeriod === 'month30' 
                  ? 'bg-gray-700/60 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Son 30 Gün
            </button>
          </div>
        </div>
        <BuAykiDegerler />
      </div>

      {/* Genel İstatistikler ve En Çok Satan Ürünler */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Sol - En Çok Satan Ürünler */}
        <div className="lg:col-span-2">
          <EnCokSatanUrunler />
        </div>
        
        {/* Sağ - Genel İstatistikler */}
        <div className="lg:col-span-1">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              Genel İstatistikler
            </h2>
            <TotalDegerler />
          </div>
        </div>
      </div>

      {/* En Son Üyeler */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <EnSonUyeList />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;