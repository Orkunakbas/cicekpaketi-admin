import React from 'react';
import { useSelector } from 'react-redux';
import { FaUserPlus } from 'react-icons/fa';

const EnSonUyeList = () => {
  const { recentUsers } = useSelector((state) => state.dashboard);

  const getInitials = (name) => {
    if (!name) return 'N/A';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="border border-gray-700/40 rounded-2xl p-6 hover:border-gray-600/50 transition-all duration-300" style={{ backgroundColor: '#1d1d2b' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/50">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800/30">
          <FaUserPlus className="text-sm text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-white">
          En Son Üyeler
        </h3>
      </div>

      {/* Users List */}
      <div className="divide-y divide-white/[0.03]">
        {recentUsers && recentUsers.length > 0 ? recentUsers.map((user, index) => (
          <div
            key={index}
            className="group/item flex items-center justify-between py-3.5 first:pt-0 hover:bg-gray-800/20 px-2 -mx-2 rounded-lg transition-all duration-300"
          >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 ring-1 ring-white/5">
                <span className="text-indigo-400 font-semibold text-xs">
                  {getInitials(user.name)}
                </span>
              </div>
              
              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate text-sm mb-1 leading-tight">
                  {user.name}
                </p>
                <p className="text-gray-500 text-xs truncate">
                  {user.email}
                </p>
              </div>
            </div>
            
            {/* Date Badge */}
            <div className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-gray-700/40 group-hover/item:border-gray-600/60 transition-all duration-300">
              <span className="text-gray-400 text-xs font-medium whitespace-nowrap">
                {user.date}
              </span>
            </div>
          </div>
        )) : (
          <div className="py-8 text-center">
            <p className="text-gray-500 text-sm">Henüz üye kaydı yok</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnSonUyeList;