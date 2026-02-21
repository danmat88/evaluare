import { useState, useRef } from 'react';
import { BlockMath } from 'react-katex';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Eye, RotateCcw, ArrowRight } from 'lucide-react';
import Blackboard from '../blackboard/Blackboard';
import ChalkText from '../blackboard/ChalkText';
import MathKeyboard from '../keyboard/MathKeyboard';
import SolutionReveal from './SolutionReveal';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Particles from '../ui/Particles';
import useExerciseStore from '../../store/exerciseStore';
import styles from './ExerciseCard.module.css';

const DIFF_LABEL = ['', '★ Ușor', '★★ Mediu', '★★★ Greu'];
const DIFF_COLOR = ['', 'mint', 'yellow', 'coral'];

const CORRECT_MSGS = ['Excelent! 🎯', 'Bravo! 🌟', 'Perfect! ✨', 'Corect! 🎉', 'Genial! 🚀'];
const WRONG_MSGS   = ['Mai încearcă!', 'Aproape!', 'Nu renunța!', 'Gândește-te din nou!'];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

const ExerciseCard = ({ exercise, onResult, onNext }) => {
  const [answer, setAnswer]           = useState('');
  const [submitted, setSubmitted]     = useState(false);
  const [correct, setCorrect]         = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [flash, setFlash]             = useState(null);
  const [showParticles, setShowParticles] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const boardRef = useRef(null);

  const { submitAnswer: storeSubmit, streak } = useExerciseStore();

  const handleKey       = (v) => !submitted && setAnswer((a) => a + v);
  const handleBackspace = ()  => !submitted && setAnswer((a) => a.slice(0, -1));
  const handleClear     = ()  => !submitted && setAnswer('');

  const handleSubmit = () => {
    if (!answer || submitted) return;
    const isCorrect = answer.trim() === String(exercise.answer).trim();

    setCorrect(isCorrect);
    setSubmitted(true);
    setFeedbackMsg(isCorrect ? rand(CORRECT_MSGS) : rand(WRONG_MSGS));

    // Flash the board
    setFlash(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => setFlash(null), 700);

    if (isCorrect) {
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 1200);
    }

    // Update store XP/streak
    useExerciseStore.setState((s) => {
      const newStreak = isCorrect ? s.streak + 1 : 0;
      let xpGain = isCorrect ? 10 : 0;
      if (newStreak === 3) xpGain += 5;
      if (newStreak === 5) xpGain += 10;
      if (newStreak > 5 && newStreak % 5 === 0) xpGain += 10;
      return {
        answered: true, correct: isCorrect,
        streak: newStreak,
        bestStreak: Math.max(s.bestStreak, newStreak),
        xp: s.xp + xpGain,
        lastXpGain: xpGain,
        totalCorrect: isCorrect ? s.totalCorrect + 1 : s.totalCorrect,
        totalAnswered: s.totalAnswered + 1,
      };
    });

    onResult?.({ exerciseId: exercise.id, correct: isCorrect });
  };

  const handleReset = () => {
    setAnswer(''); setSubmitted(false); setCorrect(null);
    setShowSolution(false); setFlash(null);
  };

  const diff = exercise.difficulty || 1;

  return (
    <div className={styles.card}>
      {/* ── Board panel ── */}
      <div className={styles.boardPanel} ref={boardRef}>
        <Blackboard className={styles.board} flash={flash}>
          <div className={styles.boardInner}>
            {/* Meta row */}
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
                  🔥 {streak} la rând!
                </motion.span>
              )}
            </div>

            {/* Question */}
            <div className={styles.question}>
              <ChalkText size="lg" color="white">{exercise.text}</ChalkText>
              {exercise.math && (
                <div className={styles.mathBlock}>
                  <BlockMath math={exercise.math} />
                </div>
              )}
            </div>

            {/* Answer area */}
            <div className={styles.answerArea}>
              <ChalkText size="xs" color="muted">RĂSPUNS</ChalkText>
              <div className={`${styles.answerBox} ${submitted ? (correct ? styles.answerOk : styles.answerErr) : answer ? styles.answerFilled : ''}`}>
                <span className={styles.answerText}>
                  {answer || <span className={styles.cursor} />}
                </span>
                {submitted && (
                  <span className={styles.resultIcon}>
                    {correct
                      ? <CheckCircle2 size={20} className={styles.iconOk} />
                      : <XCircle size={20} className={styles.iconErr} />
                    }
                  </span>
                )}
              </div>
            </div>

            {/* Feedback */}
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

        {/* Particles burst */}
        {showParticles && (
          <Particles active={showParticles} originX="50%" originY="40%" />
        )}

        {/* Actions */}
        <div className={styles.actions}>
          {!submitted ? (
            <Button variant="primary" onClick={handleSubmit} disabled={!answer} size="md">
              Verifică răspunsul →
            </Button>
          ) : (
            <div className={styles.postActions}>
              <Button variant="ghost" size="sm" icon={<RotateCcw size={13} />} onClick={handleReset}>
                Încearcă din nou
              </Button>
              {!correct && (
                <Button variant="outline" size="sm" icon={<Eye size={13} />} onClick={() => setShowSolution(true)}>
                  Vezi rezolvarea
                </Button>
              )}
              {onNext && (
                <Button variant={correct ? 'success' : 'ghost'} size="sm" icon={<ArrowRight size={13} />} onClick={() => { handleReset(); onNext(); }}>
                  Exercițiul următor
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Keyboard ── */}
      <MathKeyboard onKey={handleKey} onBackspace={handleBackspace} onClear={handleClear} className={styles.keyboard} />

      <Modal isOpen={showSolution} onClose={() => setShowSolution(false)} title="Rezolvare pas cu pas" size="lg">
        <SolutionReveal steps={exercise.solution || []} onClose={() => setShowSolution(false)} />
      </Modal>
    </div>
  );
};

export default ExerciseCard;
