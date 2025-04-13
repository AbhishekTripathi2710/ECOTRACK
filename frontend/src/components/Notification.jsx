import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Award } from 'lucide-react';

const Notification = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
            type === 'achievement' ? 'bg-green-500' : 'bg-blue-500'
          } text-white`}
        >
          {type === 'achievement' ? (
            <Award className="w-6 h-6" />
          ) : (
            <CheckCircle className="w-6 h-6" />
          )}
          <div>
            <p className="font-semibold">
              {type === 'achievement' ? 'Achievement Unlocked!' : 'Challenge Completed!'}
            </p>
            <p>{message}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              onClose();
            }}
            className="ml-4 text-white hover:text-gray-200"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification; 