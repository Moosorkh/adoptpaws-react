import React from 'react';
import { motion } from 'framer-motion';

interface RevealTextProps {
  children: React.ReactNode;
  delay?: number;
  as?: 'div' | 'span';
  className?: string;
}

/**
 * Fades + slides content up into place the first time it scrolls into view.
 */
const RevealText: React.FC<RevealTextProps> = ({ children, delay = 0, as = 'div', className }) => {
  const MotionTag = as === 'span' ? motion.span : motion.div;

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
};

export default RevealText;
