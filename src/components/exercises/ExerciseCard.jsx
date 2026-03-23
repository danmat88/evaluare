import { useCallback, useEffect, useRef, useState } from 'react';
import { BlockMath } from 'react-katex';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Bookmark, CheckCircle2, Eye, Flame, RotateCcw, Save, Trash2, XCircle } from 'lucide-react';
import Blackboard from '../blackboard/Blackboard';
import ChalkText from '../blackboard/ChalkText';
import MathKeyboard from '../keyboard/MathKeyboard';
import SolutionReveal from './SolutionReveal';
import ExerciseVisual from './ExerciseVisual';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Particles from '../ui/Particles';
import useExerciseStore from '../../store/exerciseStore';
import { useAuth } from '../../contexts';
import { saveExerciseResult } from '../../firebase/results';
import { createClientId } from '../../utils/ids';
import { queuePendingExerciseResult } from '../../utils/pendingResults';
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

const REPEAT_SOLVED_MSG = 'Corect din nou. Exercitiul era deja rezolvat, asa ca nu mai primesti XP suplimentar.';
const REVIEW_MISS_MSG = 'Incercarea este salvata pentru review, dar nu iti rupe seria pe un exercitiu deja rezolvat.';

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

const ExerciseCard = ({
  exercise,
  onResult,
  onNext,
  initialAnswer = '',
  noteText = '',
  onAnswerChange,
  onNoteSave,
}) => {
  const [answer, setAnswer] = useState(initialAnswer);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [flash, setFlash] = useState(null);
  const [showParticles, setShowParticles] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [xpFloat, setXpFloat] = useState(null);
  const [noteDraft, setNoteDraft] = useState(noteText);
  const boardRef = useRef(null);
  const startedAtRef = useRef(null);
  const submittingRef = useRef(false);

  const streak = useExerciseStore((state) => state.streak);
  const submitExerciseAnswer = useExerciseStore((state) => state.submitExerciseAnswer);
  const { user } = useAuth();

  const updateAnswer = useCallback((nextValue) => {
    setAnswer(nextValue);
    onAnswerChange?.(exercise.id, nextValue);
  }, [exercise.id, onAnswerChange]);

  useEffect(() => {
    startedAtRef.current = Date.now();
    setAnswer(initialAnswer || '');
    setSubmitted(false);
    setCorrect(null);
    setShowSolution(false);
    setFlash(null);
    setFeedbackMsg('');
    setShowParticles(false);
    setXpFloat(null);
    setNoteDraft(noteText || '');
    submittingRef.current = false;
  }, [exercise.id, initialAnswer, noteText]);

  const handleKey = (value) => !submitted && updateAnswer(`${answer}${value}`);
  const handleBackspace = () => !submitted && updateAnswer(answer.slice(0, -1));
  const handleClear = () => !submitted && updateAnswer('');

  const normalizedSavedNote = String(noteText || '').trim();
  const normalizedDraftNote = String(noteDraft || '').trim();
  const noteDirty = normalizedDraftNote !== normalizedSavedNote;
  const hasNote = Boolean(normalizedDraftNote || normalizedSavedNote);
  const noteStatus = noteDirty ? 'Draft nesalvat' : hasNote ? 'Nota salvata' : 'Adauga o nota privata';

  const handleSaveNote = useCallback(() => {
    if (!onNoteSave) return;
    onNoteSave(exercise.id, noteDraft, exercise.chapter);
  }, [exercise.chapter, exercise.id, noteDraft, onNoteSave]);

  const handleClearNote = useCallback(() => {
    setNoteDraft('');
    onNoteSave?.(exercise.id, '', exercise.chapter);
  }, [exercise.chapter, exercise.id, onNoteSave]);

  const handleSubmit = () => {
    if (!answer || submitted || submittingRef.current) return;

    submittingRef.current = true;

    const attemptStartedAt = startedAtRef.current ?? Date.now();
    const timeSpent = Math.max(1, Math.round((Date.now() - attemptStartedAt) / 1000));
    const result = submitExerciseAnswer({ exercise, answer });
    if (!result) {
      submittingRef.current = false;
      return;
    }

    const isCorrect = result.correct;

    setCorrect(isCorrect);
    setSubmitted(true);
    setFeedbackMsg(
      isCorrect
        ? (result.alreadySolved ? REPEAT_SOLVED_MSG : rand(CORRECT_MSGS))
        : (result.alreadySolved ? REVIEW_MISS_MSG : rand(WRONG_MSGS)),
    );

    setFlash(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => setFlash(null), 700);

    if (isCorrect) {
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 1200);
    }

    if (isCorrect && result.xpGain > 0) {
      setXpFloat(result.xpGain);
      setTimeout(() => setXpFloat(null), 1100);
    }

    if (isCorrect) onAnswerChange?.(exercise.id, '');

    if (user?.uid) {
      const attemptId = createClientId('exercise-attempt');
      saveExerciseResult(user.uid, {
        attemptId,
        exerciseId: exercise.id,
        chapter: exercise.chapter,
        correct: isCorrect,
        timeSpent,
      }).catch(() => {
        queuePendingExerciseResult(user.uid, {
          attemptId,
          exerciseId: exercise.id,
          chapter: exercise.chapter,
          correct: isCorrect,
          timeSpent,
        });
      });
    }

    onResult?.({
      exerciseId: exercise.id,
      correct: isCorrect,
      timeSpent,
      alreadySolved: result.alreadySolved,
      countedTowardStats: result.countedTowardStats,
    });
  };

  const handleReset = () => {
    startedAtRef.current = Date.now();
    updateAnswer('');
    setSubmitted(false);
    setCorrect(null);
    setShowSolution(false);
    setFlash(null);
    setFeedbackMsg('');
    setShowParticles(false);
    setXpFloat(null);
    submittingRef.current = false;
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
              <ExerciseVisual
                visuals={exercise.visuals}
                image={exercise.image}
                imageUrl={exercise.imageUrl}
                diagram={exercise.diagram}
                diagramUrl={exercise.diagramUrl}
                svg={exercise.svg}
                svgMarkup={exercise.svgMarkup}
                caption={exercise.caption}
                alt={exercise.alt}
                label={exercise.label}
              />
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

            <div className={styles.notePanel}>
              <div className={styles.noteHead}>
                <span className={styles.noteLabel}>
                  <Bookmark size={12} />
                  Nota privata
                </span>
                <span className={`${styles.noteStatus} ${noteDirty ? styles.noteStatusDirty : ''}`}>
                  {noteStatus}
                </span>
              </div>

              <textarea
                className={styles.noteInput}
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                onBlur={() => {
                  if (noteDirty) handleSaveNote();
                }}
                placeholder="Scrie formula pe care vrei s-o retii, capcana din exercitiu sau pasul care te-a ajutat."
              />

              <div className={styles.noteActions}>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Save size={13} />}
                  onClick={handleSaveNote}
                  disabled={!noteDirty}
                >
                  Salveaza nota
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  icon={<Trash2 size={13} />}
                  onClick={handleClearNote}
                  disabled={!hasNote}
                >
                  Sterge nota
                </Button>
              </div>
            </div>
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
