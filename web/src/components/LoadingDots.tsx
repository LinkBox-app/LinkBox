import React, { useState, useEffect } from 'react';
import { motion, type Variants, type Easing } from 'framer-motion';

interface LoadingDotsProps {
  text?: string;
  className?: string;
}

const LoadingDots: React.FC<LoadingDotsProps> = ({ text = "Loading", className = "" }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') {
          return '';
        } else if (prev === '') {
          return '.';
        } else if (prev === '.') {
          return '..';
        } else {
          return '...';
        }
      });
    }, 500); // 每500毫秒变化一次

    return () => clearInterval(interval);
  }, []);

  // 动画变体
  const containerVariants: Variants = {
    initial: { opacity: 0.8 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  const dotVariants: Variants = {
    initial: { y: 0 },
    animate: {
      y: [-3, 0, -3],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut" as Easing
      }
    }
  };

  return (
    <motion.span 
      className={`inline-flex items-center ${className}`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <span>{text}</span>
      <motion.span 
        className="inline-block ml-0.5"
        variants={dotVariants}
        initial="initial"
        animate="animate"
      >
        {dots}
      </motion.span>
    </motion.span>
  );
};

export default LoadingDots;