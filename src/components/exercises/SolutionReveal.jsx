import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockMath } from 'react-katex';
import { ArrowRight, Check, ListChecks } from 'lucide-react';
import ChalkText from '../blackboard/ChalkText';
import Button from '../ui/Button';
import styles from './SolutionReveal.module.css';

const SolutionReveal = ({ steps = [], onClose }) => {
  const [visible, setVisible] = useState(0);

  return (
    <div className={styles.container}>
      <div className={styles.steps}>
        <AnimatePresence>
          {steps.slice(0, visible).map((step, i) => (
            <motion.div
              key={i}
              className={styles.step}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.pill}>{i + 1}</div>
              <div className={styles.body}>
                {step.text && (
                  <ChalkText animated color={step.color || 'white'} charDelay={0.018}>
                    {step.text}
                  </ChalkText>
                )}
                {step.math && (
                  <motion.div className={styles.math} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}>
                    <BlockMath math={step.math} />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {visible === 0 && (
          <div className={styles.empty}>
            <ChalkText color="muted" size="sm">Apasa "Pasul urmator" pentru a vedea rezolvarea.</ChalkText>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.dots}>
          {steps.map((_, i) => (
            <span key={i} className={`${styles.dot} ${i < visible ? styles.dotFilled : ''}`} />
          ))}
        </div>

        <div className={styles.btns}>
          {visible < steps.length && (
            <>
              <Button variant="secondary" size="sm" icon={<ArrowRight size={13} />} onClick={() => setVisible((v) => v + 1)}>
                Pasul {visible + 1}
              </Button>
              <Button variant="ghost" size="sm" icon={<ListChecks size={13} />} onClick={() => setVisible(steps.length)}>
                Arata tot
              </Button>
            </>
          )}

          {visible === steps.length && steps.length > 0 && (
            <Button variant="success" icon={<Check size={13} />} onClick={onClose}>
              Am inteles
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolutionReveal;
