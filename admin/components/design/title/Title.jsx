import React from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { IoArrowBack } from 'react-icons/io5';

const Title = ({ children, showBackButton = true }) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <motion.div 
      className="mb-6 flex items-center gap-3"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {showBackButton && (
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-white/5 transition-all"
        >
          <IoArrowBack className="text-white text-xl" />
        </button>
      )}
      
      <h2 className="text-2xl medium text-white tracking-wide">
        {children}
      </h2>
    </motion.div>
  );
};

export default Title;