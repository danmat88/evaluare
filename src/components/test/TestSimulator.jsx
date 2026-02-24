import { useState, useEffect } from 'react';
import { BlockMath } from 'react-katex';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Send } from 'lucide-react';
import Blackboard from '../blackboard/Blackboard';
import ChalkText from '../blackboard/ChalkText';
import MathKeyboard from '../keyboard/MathKeyboard';
import TestTimer from './TestTimer';
import TestResults from './TestResults';
import Button from '../ui/Button';
import useTestStore from '../../store/testStore';
import { useAuth } from '../../contexts';
import styles from './TestSimulator.module.css';

const TestSimulator = () => {
  const { currentTest, started, finished, answers, setAnswer, startTest, finishTest } = useTestStore();
  const { user } = useAuth();
  const [subjectIdx, setSubjectIdx] = useState(0);
  const [exIdx, setExIdx]           = useState(0);

  const subjects = currentTest?.subjects || [];
  const subject  = subjects[subjectIdx];
  const exercise = subject?.exercises?.[exIdx];
  const curr     = exercise ? (answers[exercise.id] || '') : '';

  // Enter to navigate exercises — must be before any early returns
  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const exs = subject?.exercises || [];
        if (exIdx < exs.length - 1) setExIdx((i) => i + 1);
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [exIdx, subject]);

  if (!currentTest) return null;
  if (finished) return <TestResults />;

  const handleKey  = (v) => started && exercise && setAnswer(exercise.id, curr + v);
  const handleBack = ()  => started && exercise && setAnswer(exercise.id, curr.slice(0, -1));
  const handleClr  = ()  => started && exercise && setAnswer(exercise.id, '');

  const answered = Object.keys(answers).length;
  const total    = subjects.reduce((s, sub) => s + (sub.exercises?.length || 0), 0);

  return (
    <div className={styles.shell}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <ChalkText size="xs" color="muted" className={styles.title}>{currentTest.title}</ChalkText>

        <div className={styles.subjectTabs}>
          {subjects.map((sub, i) => (
            <button
              key={i}
              className={`${styles.subTab} ${subjectIdx === i ? styles.subTabActive : ''}`}
              onClick={() => { setSubjectIdx(i); setExIdx(0); }}
            >
              Subiectul {i + 1}
            </button>
          ))}
        </div>

        <div className={styles.topRight}>
          <span className={styles.answered}>
            <CheckSquare size={13} />
            <ChalkText size="xs" color="muted">{answered}/{total}</ChalkText>
          </span>
          <TestTimer />
          {!started
            ? <Button variant="primary" size="sm" onClick={startTest}>Începe testul</Button>
            : <Button variant="danger" size="sm" icon={<Send size={13} />} onClick={() => finishTest(user?.uid)}>Predă</Button>
          }
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        {/* Exercise list sidebar */}
        <div className={styles.exSidebar}>
          {subject?.exercises?.map((ex, i) => {
            const done = !!answers[ex.id];
            return (
              <button
                key={ex.id}
                className={`${styles.exItem} ${exIdx === i ? styles.exActive : ''} ${done ? styles.exDone : ''}`}
                onClick={() => setExIdx(i)}
              >
                <span className={styles.exNum}>{i + 1}</span>
                {ex.points && <span className={styles.exPts}>{ex.points}p</span>}
                {done && <span className={styles.exCheck}>✓</span>}
              </button>
            );
          })}
        </div>

        {/* Exercise content */}
        {exercise && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${subjectIdx}-${exIdx}`}
              className={styles.exArea}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Blackboard className={styles.board}>
                <div className={styles.boardInner}>
                  <div className={styles.exMeta}>
                    <ChalkText size="xs" color="yellow">
                      Subiectul {subjectIdx + 1} · Exercițiul {exIdx + 1}
                    </ChalkText>
                    {exercise.points && (
                      <ChalkText size="xs" color="muted">{exercise.points} puncte</ChalkText>
                    )}
                  </div>

                  <div className={styles.question}>
                    <ChalkText size="lg">{exercise.text}</ChalkText>
                    {exercise.math && <div className={styles.math}><BlockMath math={exercise.math} /></div>}
                  </div>

                  <div className={styles.ansSection}>
                    <ChalkText size="xs" color="muted">RĂSPUNS</ChalkText>
                    <div className={`${styles.ansBox} ${curr ? styles.ansFilled : ''}`}>
                      <span className={styles.ansText}>
                        {curr || <span className={styles.cursor} />}
                      </span>
                    </div>
                  </div>

                  {!started && (
                    <div className={styles.startPrompt}>
                      <ChalkText size="sm" color="muted">Apasă „Începe testul" pentru a activa tastatura.</ChalkText>
                    </div>
                  )}
                </div>
              </Blackboard>

              <MathKeyboard
                onKey={started ? handleKey : undefined}
                onBackspace={started ? handleBack : undefined}
                onClear={started ? handleClr : undefined}
                className={styles.keyboard}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default TestSimulator;
