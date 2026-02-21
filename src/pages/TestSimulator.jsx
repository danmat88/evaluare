import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Award, ChevronRight } from 'lucide-react';
import TestSimulatorComp from '../components/test/TestSimulator';
import ChalkText from '../components/blackboard/ChalkText';
import Button from '../components/ui/Button';
import Layout from '../components/layout/Layout';
import useTestStore from '../store/testStore';
import styles from './TestSimulator.module.css';

const TestSimulatorPage = () => {
  const { tests, currentTest, loading, loadTests, loadTest } = useTestStore();
  useEffect(() => { loadTests(); }, []);

  if (currentTest) {
    return (
      <Layout>
        <div className={styles.activeTest}><TestSimulatorComp /></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <ChalkText size="2xl" color="yellow">Teste simulate</ChalkText>
            <ChalkText size="sm" color="muted">Pregătire completă · condiții reale de examen</ChalkText>
          </div>
          <div className={styles.bannerPills}>
            {[
              { icon: <Clock size={13}/>, text: '120 minute' },
              { icon: <Award size={13}/>, text: '100p + 10 oficiu' },
              { icon: <ChevronRight size={13}/>, text: 'Subiect I · II · III' },
            ].map((b) => (
              <span key={b.text} className={styles.pill}>
                {b.icon}
                <ChalkText size="xs" color="muted">{b.text}</ChalkText>
              </span>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <motion.span animate={{ opacity: [0.4,1,0.4] }} transition={{ duration: 1.4, repeat: Infinity }}>
              <ChalkText size="lg" color="yellow">Se încarcă...</ChalkText>
            </motion.span>
          </div>
        ) : (
          <div className={styles.grid}>
            {tests.map((test, i) => (
              <motion.div
                key={test.id}
                className={styles.card}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <div className={styles.cardTop}>
                  <ChalkText size="xs" color="muted">VARIANTA {String(i+1).padStart(2,'0')}</ChalkText>
                  <span className={styles.pts}>{test.totalPoints || 100}p</span>
                </div>
                <ChalkText size="lg" color="yellow">{test.title}</ChalkText>
                {test.description && <ChalkText size="sm" color="muted">{test.description}</ChalkText>}
                <Button variant="primary" size="sm" fullWidth onClick={() => loadTest(test.id)}>
                  Începe testul →
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TestSimulatorPage;
