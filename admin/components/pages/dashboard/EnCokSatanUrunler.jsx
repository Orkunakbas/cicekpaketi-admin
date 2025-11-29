import React from 'react';
import { useSelector } from 'react-redux';
import { FaTrophy, FaShoppingBag } from 'react-icons/fa';
import Image from 'next/image';

const EnCokSatanUrunler = () => {
  const { topProducts, loading } = useSelector((state) => state.dashboard);

  if (loading.topProducts) {
    return <div className="text-white">Yükleniyor...</div>;
  }

  return (
    <div className="border border-gray-700/40 rounded-2xl p-6 hover:border-gray-600/50 transition-all duration-300" style={{ backgroundColor: '#1d1d2b' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/50">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800/30">
          <FaTrophy className="text-sm text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-white">
          En Çok Satan Ürünler
        </h3>
      </div>

      {/* Products List */}
      <div className="divide-y divide-white/[0.03]">
        {topProducts.map((product, index) => (
          <div
            key={index}
            className="group/item flex items-center justify-between py-3.5 first:pt-0 hover:bg-gray-800/20 px-2 -mx-2 rounded-lg transition-all duration-300"
          >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              {/* Product Image */}
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800/50 ring-1 ring-white/5 flex-shrink-0">
                <Image 
                  src={product.image} 
                  alt={product.name}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              </div>
              
              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate text-sm mb-1.5 leading-tight">
                  {product.name}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400">
                    ₺{product.revenue.toLocaleString('tr-TR')}
                  </span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-500">
                    ₺{Math.round(product.revenue / product.sales).toLocaleString('tr-TR')} ort.
                  </span>
                </div>
              </div>
            </div>
            
            {/* Sales Badge - Stronger */}
            <div className="flex items-center gap-2.5 flex-shrink-0 px-3.5 py-2 rounded-xl border border-gray-700/40 group-hover/item:border-gray-600/60 transition-all duration-300" style={{ backgroundColor: '#1d1d2b' }}>
              <FaShoppingBag className="text-indigo-400 text-sm" />
              <div className="text-right">
                <p className="text-white text-lg font-bold leading-none tabular-nums">{product.sales}</p>
                <p className="text-gray-500 text-[10px] mt-0.5">satış</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnCokSatanUrunler;