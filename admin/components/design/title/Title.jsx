import React from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Button } from '@heroui/react';
import { IoArrowBack } from 'react-icons/io5';

const Title = ({ children, showBackButton = false }) => {
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
        <Button
          isIconOnly
          variant="bordered"
          onPress={handleBack}
          className="border-gray-700 hover:border-gray-600"
        >
          <IoArrowBack className="text-white text-xl" />
        </Button>
      )}
      
      <h2 className="text-2xl medium text-white tracking-wide">
        {children}
      </h2>
    </motion.div>
  );
};

export default Title;