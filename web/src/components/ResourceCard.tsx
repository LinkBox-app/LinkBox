import { motion, type Variants, type AnimationGeneratorType } from 'framer-motion';
import React from 'react';

export interface Resource {
  id: number;
  title: string;
  digest: string;
  url: string;
  tags: string[];
  created_at: string | null;
}

interface ResourceCardProps {
  resources: Resource[];
  className?: string;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resources, className = '' }) => {
  // 卡片动画变体
  const cardVariants: Variants = {
    initial: { 
      opacity: 0, 
      y: 20,
      rotate: -1
    },
    animate: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: {
        type: "spring" as AnimationGeneratorType,
        stiffness: 260,
        damping: 20,
      }
    }
  };

  if (!resources || resources.length === 0) {
    return null;
  }

  const handleResourceClick = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`space-y-2 sm:space-y-3 md:space-y-4 w-full ${className}`}>
      {resources.map((resource, index) => (
        <motion.div
          key={resource.id || index}
          className="p-3 sm:p-4 border-2 border-solid cursor-pointer transition-all"
          style={{
            backgroundColor: 'rgba(255, 248, 232, 1)',
            borderColor: 'rgba(19, 0, 0, 1)',
            color: 'rgba(19, 0, 0, 1)',
            boxShadow: '4px 4px 0px rgba(19, 0, 0, 1)'
          }}
          onClick={(e) => handleResourceClick(resource.url, e)}
          variants={cardVariants}
          initial="initial"
          animate={{
            opacity: 1,
            y: 0,
            rotate: 0,
            transition: {
              delay: index * 0.1,
              type: "spring" as AnimationGeneratorType,
              stiffness: 260,
              damping: 20,
            }
          }}
          whileHover={{ 
            x: -2,
            y: -2,
            rotate: 0.5,
            boxShadow: '6px 6px 0px rgba(19, 0, 0, 1)',
            transition: {
              type: "spring" as AnimationGeneratorType,
              stiffness: 400,
              damping: 20,
            }
          }}
          whileTap={{ 
            x: 2,
            y: 2,
            rotate: 0,
            boxShadow: '2px 2px 0px rgba(19, 0, 0, 1)'
          }}
        >
          {/* 资源标题 */}
          <motion.h3 
            className="font-bold text-sm sm:text-base lg:text-lg mb-2 line-clamp-2"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.1 }}
          >
            {resource.title}
          </motion.h3>
          
          {/* 资源摘要 */}
          <p className="text-xs sm:text-sm opacity-80 mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-3">
            {resource.digest}
          </p>
          
          {/* 标签 */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
              {resource.tags.slice(0, 3).map((tag, tagIndex) => (
                <motion.span
                  key={tagIndex}
                  className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs border-2 border-solid font-semibold"
                  style={{
                    backgroundColor: 'rgba(255, 239, 215, 1)',
                    borderColor: 'rgba(19, 0, 0, 1)',
                    color: 'rgba(19, 0, 0, 1)',
                    boxShadow: '1px 1px 0px rgba(19, 0, 0, 0.3)'
                  }}
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                    transition: {
                      delay: tagIndex * 0.05,
                      type: "spring" as AnimationGeneratorType,
                      stiffness: 300,
                      damping: 20,
                    }
                  }}
                  whileHover={{
                    scale: 1.05,
                    rotate: -1,
                    boxShadow: '2px 2px 0px rgba(19, 0, 0, 0.5)'
                  }}
                >
                  #{tag}
                </motion.span>
              ))}
              {resource.tags.length > 3 && (
                <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs opacity-60">
                  +{resource.tags.length - 3}
                </span>
              )}
            </div>
          )}
          
          {/* URL显示 */}
          <motion.div 
            className="text-xs opacity-60 truncate mb-1 sm:mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            {new URL(resource.url).hostname}
          </motion.div>
          
          {/* 点击提示 */}
          <motion.div 
            className="text-xs opacity-0 text-center font-bold"
            style={{ color: 'rgba(255, 111, 46, 1)' }}
            whileHover={{ opacity: 1 }}
          >
            → 点击打开
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

export default ResourceCard;