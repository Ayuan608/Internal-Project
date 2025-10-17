
  export default function formatTimestamp(timestamp) {
  const now = Date.now();
    const messageTime = new Date(timestamp).getTime();
    const diff = now - messageTime;
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`
    return `${Math.floor(diff / 86400000)} days ago`
  }



  const avatars = [
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Mimi',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Zoe',
]


import React from 'react';
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';

export default function Spinner({ size = 'medium', color = 'light' }) {
  const sizeClasses = {
    small: 'text-xs',
    medium: 'text-lg',
    large: 'text-2xl',
  };

  const colorClasses = {
    light: 'text-white',
    dark: 'text-gray-800',
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <motion.div
        className={`${sizeClasses[size]} ${colorClasses[color]} inline-flex`}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
      >
        <FaSpinner />
      </motion.div>
      <span className={`${colorClasses[color]} text-md font-medium`}>
        Loading...
      </span>
    </div>
  );
}


import React from 'react'
import { motion } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'


export default function Loader({ progress = 0 }) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-400 to-blue-500 flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
        className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8"
      >
        <FaWhatsapp className="w-16 h-16 text-green-500" />
      </motion.div>
      <div className="w-64 bg-white bg-opacity-30 rounded-full h-2 mb-4">
        <motion.div
          className="bg-white h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className="text-white text-lg font-semibold">Loading... {progress}%</p>
    </div>
  )
}