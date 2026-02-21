import { motion } from 'framer-motion';
import clsx from 'clsx';
import styles from './ChalkText.module.css';

const ChalkText = ({ children, animated = false, color = 'white', size = 'base', glow = false, className, delayStart = 0, charDelay = 0.028, as: Tag = 'span' }) => {
  const cls = clsx(styles.chalk, styles[`c_${color}`], styles[`s_${size}`], glow && styles[`glow_${color}`], className);

  if (!animated) return <Tag className={cls}>{children}</Tag>;

  return (
    <Tag className={cls}>
      {String(children).split('').map((char, i) => (
        <motion.span key={i} initial={{ opacity: 0, filter: 'blur(2px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ delay: delayStart + i * charDelay, duration: 0.06 }}>
          {char}
        </motion.span>
      ))}
    </Tag>
  );
};

export default ChalkText;
