import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Clock, Layers, Play, RotateCcw, Save } from 'lucide-react';
import TestSimulatorComp from '../components/test/TestSimulator';
import ChalkText from '../components/blackboard/ChalkText';
import Button from '../components/ui/Button';
import Layout from '../components/layout/Layout';
import useTestStore from '../store/testStore';
import { STORAGE_CHANGE_EVENT, STORAGE_KEYS, safeReadJSON } from '../utils/storage';
import styles from './TestSimulator.module.css';

const TestSimulatorPage = () => {
  const { tests, currentTest, loading, loadTests, loadTest } = useTestStore();
  const [savedSession, setSavedSession] = useState(() => safeReadJSON(STORAGE_KEYS.testSession, null));
  const restoredRef = useRef(false);

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  useEffect(() => {
    const refreshSavedSession = () => setSavedSession(safeReadJSON(STORAGE_KEYS.testSession, null));

    window.addEventListener('focus', refreshSavedSession);
    window.addEventListener('storage', refreshSavedSession);
    window.addEventListener(STORAGE_CHANGE_EVENT, refreshSavedSession);

    return () => {
      window.removeEventListener('focus', refreshSavedSession);
      window.removeEventListener('storage', refreshSavedSession);
      window.removeEventListener(STORAGE_CHANGE_EVENT, refreshSavedSession);
    };
  }, []);

  useEffect(() => {
    if (restoredRef.current || loading || currentTest || !savedSession?.testId) return;
    restoredRef.current = true;
    loadTest(savedSession.testId);
  }, [currentTest, loadTest, loading, savedSession]);

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
            <ChalkText size="sm" color="muted">Pregatire completa - conditii reale de examen</ChalkText>
            <div className={styles.bannerPills}>
              {[
                { icon: <Clock size={13} />, text: '120 minute' },
                { icon: <Award size={13} />, text: '100p + 10 oficiu' },
                { icon: <Layers size={13} />, text: 'Subiect I - II - III' },
              ].map((badge) => (
                <span key={badge.text} className={styles.pill}>
                  {badge.icon}
                  {badge.text}
                </span>
              ))}
            </div>
          </div>

          {savedSession?.testId && (
            <div className={styles.resumeCard}>
              <div className={styles.resumeLead}>
                <span className={styles.resumeIcon}><Save size={14} /></span>
                <div className={styles.resumeBody}>
                  <span className={styles.resumeTitle}>Test in progres</span>
                  <span className={styles.resumeSub}>
                    Cronometrul si raspunsurile au fost salvate. Poti continua exact de unde ai ramas.
                  </span>
                </div>
              </div>

              <Button variant="primary" size="sm" icon={<RotateCcw size={13} />} onClick={() => loadTest(savedSession.testId)}>
                Continua testul
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={styles.skeletonCard} style={{ animationDelay: `${index * 0.12}s` }}>
                <div className={styles.skTop} />
                <div className={styles.skTitle} />
                <div className={styles.skMeta} />
                <div className={styles.skFooter} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.grid}>
            {tests.map((test, index) => {
              const isSaved = savedSession?.testId === test.id;

              return (
                <motion.div
                  key={test.id}
                  className={`${styles.card} ${isSaved ? styles.cardSaved : ''}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.07, ease: [0.21, 1.11, 0.81, 0.99] }}
                >
                  <div className={styles.cardInner}>
                    <div className={styles.cardTop}>
                      <span className={styles.variantLabel}>VARIANTA {String(index + 1).padStart(2, '0')}</span>
                      <div className={styles.cardTopRight}>
                        {isSaved && <span className={styles.savedBadge}>In progres</span>}
                        <span className={styles.pts}>{test.totalPoints || 100}p</span>
                      </div>
                    </div>
                    <ChalkText size="lg" color="yellow">{test.title}</ChalkText>
                    {test.description && <ChalkText size="sm" color="muted">{test.description}</ChalkText>}
                  </div>

                  <div className={styles.cardFooter}>
                    <Button variant="primary" size="sm" fullWidth icon={<Play size={13} />} onClick={() => loadTest(test.id)}>
                      {isSaved ? 'Continua testul' : 'Incepe testul'}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TestSimulatorPage;
