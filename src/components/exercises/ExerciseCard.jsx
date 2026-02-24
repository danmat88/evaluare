import { useCallback, useEffect, useRef, useState } from 'react';
import { BlockMath } from 'react-katex';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Eye, Flame, RotateCcw, XCircle } from 'lucide-react';
import Blackboard from '../blackboard/Blackboard';
import ChalkText from '../blackboard/ChalkText';
import MathKeyboard from '../keyboard/MathKeyboard';
import SolutionReveal from './SolutionReveal';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Particles from '../ui/Particles';
import useExerciseStore from '../../store/exerciseStore';
import { useAuth } from '../../contexts';
import { saveExerciseResult } from '../../firebase/results';
import styles from './ExerciseCard.module.css';

const DIFF_LABEL = ['', '* Usor', '** Mediu', '*** Greu'];
const DIFF_COLOR = ['', 'mint', 'yellow', 'coral'];

const CORRECT_MSGS = [
  'Excelent! Continua tot asa!',
  'Bravo! Esti pe drumul cel bun!',
  'Perfect! Raspuns corect!',
  'Corect! Foarte bine!',
  'Genial! Esti in forma!',
  'Superb! Matematica de top!',
  'Impresionant! Mai departe!',
  'Exact! Bun de tot!',
];

const WRONG_MSGS = [
  'Nu e acesta. Mai incearca!',
  'Aproape! Verifica calculul.',
  'Nu renunta. Incearca din nou.',
  'Gandeste-te pas cu pas.',
  'Revezi formula si incearca!',
  'Esti aproape! Mai incearca o data.',
  'Nu e corect. Poti mai bine!',
  'Concentreaza-te si recalculeaza.',
];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

const ExerciseCard = ({ exercise, onResult, onNext, initialAnswer = '', onAnswerChange }) => {
  const [answer, setAnswer] = useState(initialAnswer);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [flash, setFlash] = useState(null);
  const [showParticles, setShowParticles] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [xpFloat, setXpFloat] = useState(null);
  const boardRef = useRef(null);

  const { streak } = useExerciseStore();
  const { user } = useAuth();

  const updateAnswer = useCallback((nextValue) => {
    setAnswer(nextValue);
    onAnswerChange?.(exercise.id, nextValue);
  }, [exercise.id, onAnswerChange]);

  useEffect(() => {
    setAnswer(initialAnswer || '');
    setSubmitted(false);
    setCorrect(null);
    setShowSolution(false);
    setFlash(null);
    setFeedbackMsg('');
    setShowParticles(false);
    setXpFloat(null);
  }, [exercise.id, initialAnswer]);

  const handleKey = (v) => !submitted && updateAnswer(`${answer}${v}`);
  const handleBackspace = () => !submitted && updateAnswer(answer.slice(0, -1));
  const handleClear = () => !submitted && updateAnswer('');

  const handleSubmit = () => {
    if (!answer || submitted) return;
    const isCorrect = answer.trim() === String(exercise.answer).trim();

    setCorrect(isCorrect);
    setSubmitted(true);
    setFeedbackMsg(isCorrect ? rand(CORRECT_MSGS) : rand(WRONG_MSGS));

    setFlash(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => setFlash(null), 700);

    if (isCorrect) {
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 1200);
    }

    let earnedXp = 0;
    useExerciseStore.setState((s) => {
      const newStreak = isCorrect ? s.streak + 1 : 0;
      let xpGain = isCorrect ? 10 : 0;
      if (newStreak === 3) xpGain += 5;
      if (newStreak === 5) xpGain += 10;
      if (newStreak > 5 && newStreak % 5 === 0) xpGain += 10;
      earnedXp = xpGain;
      return {
        answered: true,
        correct: isCorrect,
        streak: newStreak,
        bestStreak: Math.max(s.bestStreak, newStreak),
        xp: s.xp + xpGain,
        lastXpGain: xpGain,
        totalCorrect: isCorrect ? s.totalCorrect + 1 : s.totalCorrect,
        totalAnswered: s.totalAnswered + 1,
      };
    });

    if (isCorrect && earnedXp > 0) {
      setXpFloat(earnedXp);
      setTimeout(() => setXpFloat(null), 1100);
    }

    if (isCorrect) onAnswerChange?.(exercise.id, '');

    if (user?.uid) {
      saveExerciseResult(user.uid, {
        exerciseId: exercise.id,
        chapter: exercise.chapter,
        correct: isCorrect,
        timeSpent: 0,
      }).catch(() => {});
    }

    onResult?.({ exerciseId: exercise.id, correct: isCorrect });
  };

  const handleReset = () => {
    updateAnswer('');
    setSubmitted(false);
    setCorrect(null);
    setShowSolution(false);
    setFlash(null);
  };

  const diff = exercise.difficulty || 1;

  return (
    <div className={styles.card}>
      <div className={styles.boardPanel} ref={boardRef}>
        <Blackboard className={styles.board} flash={flash}>
          <div className={styles.boardInner}>
            <div className={styles.meta}>
              <span className={styles.chapterTag}>
                <ChalkText size="xs" color="muted">{exercise.chapter}</ChalkText>
              </span>
              <span className={`${styles.diffTag} ${styles[`diff${diff}`]}`}>
                <ChalkText size="xs" color={DIFF_COLOR[diff]}>{DIFF_LABEL[diff]}</ChalkText>
              </span>
              {submitted && correct && streak >= 2 && (
                <motion.span
                  className={styles.streakBadge}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Flame size={12} />
                  {streak} la rand!
                </motion.span>
              )}
            </div>

            <div className={styles.question}>
              <ChalkText size="lg" color="white">{exercise.text}</ChalkText>
              {exercise.math && (
                <div className={styles.mathBlock}>
                  <BlockMath math={exercise.math} />
                </div>
              )}
            </div>

            <div className={styles.answerArea}>
              <AnimatePresence>
                {xpFloat && (
                  <motion.div
                    key="xp-float"
                    className={styles.xpFloat}
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 0, y: -56 }}
                    transition={{ duration: 1.05, ease: 'easeOut' }}
                  >
                    +{xpFloat} XP
                  </motion.div>
                )}
              </AnimatePresence>

              <ChalkText size="xs" color="muted">RASPUNS</ChalkText>
              <div
                className={`${styles.answerBox} ${submitted ? (correct ? styles.answerOk : styles.answerErr) : answer ? styles.answerFilled : ''}`}
              >
                <span className={styles.answerText}>{answer || <span className={styles.cursor} />}</span>
                {submitted && (
                  <span className={styles.resultIcon}>
                    {correct
                      ? <CheckCircle2 size={20} className={styles.iconOk} />
                      : <XCircle size={20} className={styles.iconErr} />}
                  </span>
                )}
              </div>
            </div>

            <AnimatePresence>
              {submitted && (
                <motion.div
                  className={`${styles.feedback} ${correct ? styles.feedbackOk : styles.feedbackErr}`}
                  initial={{ opacity: 0, scale: 0.9, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 280 }}
                >
                  <ChalkText size="md" color={correct ? 'mint' : 'coral'} glow animated charDelay={0.02}>
                    {feedbackMsg}
                  </ChalkText>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Blackboard>

        {showParticles && <Particles active={showParticles} originX="50%" originY="40%" />}

        <div className={styles.actions}>
          {!submitted ? (
            <Button variant="primary" onClick={handleSubmit} disabled={!answer} size="md" icon={<CheckCircle2 size={14} />}>
              Verifica raspunsul
            </Button>
          ) : (
            <div className={styles.postActions}>
              <Button variant="ghost" size="sm" icon={<RotateCcw size={13} />} onClick={handleReset}>
                Incearca din nou
              </Button>

              {!correct && (
                <Button variant="outline" size="sm" icon={<Eye size={13} />} onClick={() => setShowSolution(true)}>
                  Vezi rezolvarea
                </Button>
              )}

              {onNext && (
                <Button
                  variant={correct ? 'success' : 'ghost'}
                  size="sm"
                  icon={<ArrowRight size={13} />}
                  onClick={() => {
                    handleReset();
                    onNext();
                  }}
                >
                  Exercitiul urmator
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <MathKeyboard onKey={handleKey} onBackspace={handleBackspace} onClear={handleClear} className={styles.keyboard} />

      <Modal isOpen={showSolution} onClose={() => setShowSolution(false)} title="Rezolvare pas cu pas" size="lg">
        <SolutionReveal steps={exercise.solution || []} onClose={() => setShowSolution(false)} />
      </Modal>
    </div>
  );
};

export default ExerciseCard;
