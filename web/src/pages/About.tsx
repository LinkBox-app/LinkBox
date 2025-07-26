import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const About = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // 视差效果
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const parallaxScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  // 鼠标跟踪效果
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleStartExploring = () => {
    localStorage.setItem("app:first_visit", "false");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[rgba(255,239,215,1)] overflow-x-hidden">
      {/* 动态背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full blur-2xl sm:blur-3xl opacity-20"
          style={{
            background: "rgba(255, 111, 46, 0.3)",
            left: `${mousePosition.x * 0.05}px`,
            top: `${mousePosition.y * 0.05}px`,
            transform: "translate(-50%, -50%)",
            transition: "all 0.3s ease-out"
          }}
        />
        <div className="dot-pattern absolute inset-0 opacity-10" />
      </div>

      {/* Hero 区域 */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
        style={{ y: parallaxY, scale: parallaxScale }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Logo 动画 */}
            <motion.div 
              className="mb-6 sm:mb-8 inline-block"
              animate={{ 
                rotate: [0, 2, -2, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="bg-[rgba(255,248,232,1)] border-2 border-[rgba(19,0,0,1)] p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-[3px_3px_0_rgba(19,0,0,1)] sm:shadow-[4px_4px_0_rgba(19,0,0,1)] hover:shadow-[4px_4px_0_rgba(19,0,0,1)] sm:hover:shadow-[6px_6px_0_rgba(19,0,0,1)] transition-all duration-300">
                <img src="/icon.svg" alt="LinkBox" className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto" />
              </div>
            </motion.div>

            {/* 主标题 */}
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-[rgba(19,0,0,1)] mb-4 sm:mb-6"
              style={{ fontFamily: "Menlo, Consolas, 'Courier New', monospace" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Link
              <span className="text-[rgba(255,111,46,1)]">Box</span>
            </motion.h1>

            {/* 副标题 */}
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-[rgba(19,0,0,0.8)] mb-8 sm:mb-10 md:mb-12 max-w-2xl lg:max-w-3xl mx-auto px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              智能收藏，AI 赋能的资源管理专家
            </motion.p>

            {/* 打字机效果的描述 */}
            <motion.div
              className="text-sm sm:text-base md:text-lg lg:text-xl text-[rgba(19,0,0,0.7)] mb-10 sm:mb-12 md:mb-16 font-mono px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <TypewriterText text="让您的收藏变得井井有条，智能分类，一键搜索" />
            </motion.div>

            {/* CTA 按钮 */}
            <motion.button
              onClick={handleStartExploring}
              className="bg-[rgba(255,111,46,1)] text-white px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 text-base sm:text-lg md:text-xl font-bold border-2 border-[rgba(19,0,0,1)] shadow-[3px_3px_0_rgba(19,0,0,1)] sm:shadow-[4px_4px_0_rgba(19,0,0,1)] hover:shadow-[4px_4px_0_rgba(19,0,0,1)] sm:hover:shadow-[6px_6px_0_rgba(19,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              开始探索
            </motion.button>
          </motion.div>

          {/* 滚动提示 */}
          <motion.div 
            className="absolute bottom-6 sm:bottom-10 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[rgba(19,0,0,0.4)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </div>
      </motion.section>

      {/* 功能介绍 */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center text-[rgba(19,0,0,1)] mb-12 sm:mb-14 md:mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            核心功能
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* 使用流程 */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-[rgba(255,248,232,0.5)]">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center text-[rgba(19,0,0,1)] mb-12 sm:mb-14 md:mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            简单三步
          </motion.h2>

          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            {steps.map((step, index) => (
              <StepCard key={index} step={step} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* 底部 CTA */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[rgba(19,0,0,1)] mb-6 sm:mb-8 px-4">
            准备好管理您的收藏了吗？
          </h2>
          <p className="text-lg sm:text-xl text-[rgba(19,0,0,0.7)] mb-8 sm:mb-10 md:mb-12 px-4">
            立即开始使用 LinkBox，让 AI 帮您整理数字资源
          </p>
          <motion.button
            onClick={handleStartExploring}
            className="bg-[rgba(255,111,46,1)] text-white px-8 py-4 sm:px-10 sm:py-5 md:px-12 md:py-6 text-lg sm:text-xl md:text-2xl font-bold border-2 border-[rgba(19,0,0,1)] shadow-[3px_3px_0_rgba(19,0,0,1)] sm:shadow-[4px_4px_0_rgba(19,0,0,1)] hover:shadow-[4px_4px_0_rgba(19,0,0,1)] sm:hover:shadow-[6px_6px_0_rgba(19,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            立即开始
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
};

// 打字机效果组件
const TypewriterText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [text]);

  return <span>{displayText}<span className="animate-pulse">|</span></span>;
};

// 功能卡片组件
const FeatureCard = ({ feature, index }: { feature: any; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      whileHover={{ rotate: -2, scale: 1.05 }}
      className="bg-[rgba(255,248,232,1)] border-2 border-[rgba(19,0,0,1)] p-6 sm:p-8 shadow-[3px_3px_0_rgba(19,0,0,1)] sm:shadow-[4px_4px_0_rgba(19,0,0,1)] hover:shadow-[4px_4px_0_rgba(19,0,0,1)] sm:hover:shadow-[6px_6px_0_rgba(19,0,0,1)] transition-all duration-300"
    >
      <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">{feature.icon}</div>
      <h3 className="text-xl sm:text-2xl font-bold text-[rgba(19,0,0,1)] mb-3 sm:mb-4">{feature.title}</h3>
      <p className="text-sm sm:text-base text-[rgba(19,0,0,0.7)]">{feature.description}</p>
    </motion.div>
  );
};

// 步骤卡片组件
const StepCard = ({ step, index }: { step: any; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 md:gap-8"
    >
      <motion.div 
        className="flex-shrink-0 w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-[rgba(255,111,46,1)] text-white flex items-center justify-center text-2xl sm:text-3xl font-bold border-2 border-[rgba(19,0,0,1)] shadow-[3px_3px_0_rgba(19,0,0,1)] sm:shadow-[4px_4px_0_rgba(19,0,0,1)]"
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
      >
        {index + 1}
      </motion.div>
      <div className="flex-1 bg-[rgba(255,248,232,1)] border-2 border-[rgba(19,0,0,1)] p-4 sm:p-6 shadow-[3px_3px_0_rgba(19,0,0,1)] sm:shadow-[4px_4px_0_rgba(19,0,0,1)] text-center sm:text-left">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[rgba(19,0,0,1)] mb-2">{step.title}</h3>
        <p className="text-sm sm:text-base text-[rgba(19,0,0,0.7)]">{step.description}</p>
      </div>
    </motion.div>
  );
};

// 数据
const features = [
  {
    icon: "🤖",
    title: "AI 智能分类",
    description: "自动为您的收藏生成标签和摘要，让资源管理更高效"
  },
  {
    icon: "🔍",
    title: "强大搜索",
    description: "通过标签、关键词快速找到您需要的资源"
  },
  {
    icon: "💬",
    title: "AI 对话助手",
    description: "与 AI 对话，获取个性化的资源推荐和整理建议"
  }
];

const steps = [
  {
    title: "添加收藏",
    description: "粘贴链接或输入资源信息，AI 会自动识别并生成标签"
  },
  {
    title: "智能整理",
    description: "AI 自动分类，为每个资源生成摘要和标签"
  },
  {
    title: "快速查找",
    description: "通过标签筛选或关键词搜索，秒速定位您的收藏"
  }
];

export default About;