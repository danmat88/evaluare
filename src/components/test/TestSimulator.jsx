import { useCallback, useEffect, useMemo } from 'react';
import { BlockMath } from 'react-katex';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CheckSquare, Save, Send, SkipForward, CircleAlert } from 'lucide-react';
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
  const {
    currentTest,
    started,
    finished,
    answers,
    setAnswer,
    startTest,
    finishTest,
    subjectIdx,
    exerciseIdx,
    setSubjectIdx,
    setExerciseIdx,
  } = useTestStore();
  const { user } = useAuth();

  const subjects = useMemo(() => currentTest?.subjects || [], [currentTest]);
  const subject = subjects[subjectIdx];
  const exercises = subject?.exercises || [];
  const exercise = exercises[exerciseIdx];
  const currentAnswer = exercise ? (answers[exercise.id] || '') : '';

  const flattenedExercises = useMemo(
    () => subjects.flatMap((sub, subIndex) => (sub.exercises || []).map((item, itemIndex) => ({
      id: item.id,
      subjectIndex: subIndex,
      exerciseIndex: itemIndex,
      exercise: item,
    }))),
    [subjects],
  );

  const totalQuestions = flattenedExercises.length;
  const answeredCount = flattenedExercises.filter((item) => String(answers[item.id] ?? '').trim()).length;
  const currentPosition = flattenedExercises.findIndex(
    (item) => item.subjectIndex === subjectIdx && item.exerciseIndex === exerciseIdx,
  );
  const unansweredInCurrent = exercises.filter((item) => !String(answers[item.id] ?? '').trim()).length;
  const answeredInCurrent = exercises.filter((item) => String(answers[item.id] ?? '').trim()).length;

  const goToExercise = useCallback((nextSubjectIdx, nextExerciseIdx) => {
    setSubjectIdx(nextSubjectIdx);
    setExerciseIdx(nextExerciseIdx);
  }, [setExerciseIdx, setSubjectIdx]);

  const advanceToNextExercise = useCallback(() => {
    if (!flattenedExercises.length || currentPosition === -1) return;
    const next = flattenedExercises[currentPosition + 1];
    if (!next) return;
    goToExercise(next.subjectIndex, next.exerciseIndex);
  }, [currentPosition, flattenedExercises, goToExercise]);

  useEffect(() => {
    const onKey = (event) => {
      if (!started || !exercise) return;
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        advanceToNextExercise();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advanceToNextExercise, exercise, started]);

  if (!currentTest) return null;
  if (finished) return <TestResults />;

  const handleKey = (value) => started && exercise && setAnswer(exercise.id, currentAnswer + value);
  const handleBack = () => started && exercise && setAnswer(exercise.id, currentAnswer.slice(0, -1));
  const handleClr = () => started && exercise && setAnswer(exercise.id, '');

  const goToNextUnanswered = () => {
    if (!flattenedExercises.length) return;

    for (let step = 1; step <= flattenedExercises.length; step += 1) {
      const next = flattenedExercises[(currentPosition + step + flattenedExercises.length) % flattenedExercises.length];
      if (!String(answers[next.id] ?? '').trim()) {
        goToExercise(next.subjectIndex, next.exerciseIndex);
        return;
      }
    }
  };

  return (
    <div className={styles.shell}>
      <div className={styles.topBar}>
        <ChalkText size="xs" color="muted" className={styles.title}>{currentTest.title}</ChalkText>

        <div className={styles.subjectTabs}>
          {subjects.map((sub, index) => (
            <button
              key={sub.name || index}
              className={`${styles.subTab} ${subjectIdx === index ? styles.subTabActive : ''}`}
              onClick={() => goToExercise(index, 0)}
            >
              Subiectul {index + 1}
            </button>
          ))}
        </div>

        <div className={styles.topRight}>
          <span className={styles.answered}>
            <CheckSquare size={13} />
            <ChalkText size="xs" color="muted">{answeredCount}/{totalQuestions}</ChalkText>
          </span>

          <button
            className={styles.nextUnanswered}
            onClick={goToNextUnanswered}
            disabled={!started || answeredCount === totalQuestions}
            title="Mergi la urmatorul exercitiu necompletat"
          >
            <SkipForward size={12} />
            <span>Necompletat</span>
            <strong>{Math.max(totalQuestions - answeredCount, 0)}</strong>
          </button>

          <span className={styles.autosaveBadge}>
            <Save size={12} />
            <span>Autosave</span>
          </span>

          <TestTimer />

          {!started
            ? <Button variant="primary" size="sm" onClick={() => startTest(user?.uid)}>Incepe testul</Button>
            : <Button variant="danger" size="sm" icon={<Send size={13} />} onClick={() => finishTest(user?.uid)}>Preda</Button>}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.exSidebar}>
          {exercises.map((item, index) => {
            const done = !!String(answers[item.id] ?? '').trim();
            return (
              <button
                key={item.id}
                className={`${styles.exItem} ${exerciseIdx === index ? styles.exActive : ''} ${done ? styles.exDone : ''}`}
                onClick={() => setExerciseIdx(index)}
              >
                <span className={styles.exNum}>{index + 1}</span>
                {item.points && <span className={styles.exPts}>{item.points}p</span>}
                {done && (
                  <span className={styles.exCheck}>
                    <Check size={11} strokeWidth={2.6} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {exercise && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${subjectIdx}-${exerciseIdx}`}
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
                      Subiectul {subjectIdx + 1} - Exercitiul {exerciseIdx + 1}
                    </ChalkText>
                    {exercise.points && (
                      <ChalkText size="xs" color="muted">{exercise.points} puncte</ChalkText>
                    )}
                  </div>

                  <div className={styles.progressStrip}>
                    <span className={styles.progressChip}>Subiect: {answeredInCurrent}/{exercises.length}</span>
                    <span className={styles.progressChip}>Test: {answeredCount}/{totalQuestions}</span>
                    <span className={styles.progressChip}>Ramase: {Math.max(totalQuestions - answeredCount, 0)}</span>
                  </div>

                  <div className={styles.question}>
                    <ChalkText size="lg">{exercise.text}</ChalkText>
                    {exercise.math && <div className={styles.math}><BlockMath math={exercise.math} /></div>}
                  </div>

                  <div className={styles.ansSection}>
                    <ChalkText size="xs" color="muted">RASPUNS</ChalkText>
                    <div className={`${styles.ansBox} ${currentAnswer ? styles.ansFilled : ''}`}>
                      <span className={styles.ansText}>{currentAnswer || <span className={styles.cursor} />}</span>
                    </div>
                  </div>

                  {!started && (
                    <div className={styles.startPrompt}>
                      <ChalkText size="sm" color="muted">Apasa "Incepe testul" pentru a activa tastatura si cronometrul.</ChalkText>
                    </div>
                  )}

                  {started && (
                    <div className={styles.statusPrompt}>
                      <Save size={13} />
                      <span>Raspunsurile se salveaza local automat. Poti reveni daca inchizi pagina.</span>
                    </div>
                  )}

                  {started && !currentAnswer && (
                    <div className={styles.hintPrompt}>
                      <CircleAlert size={14} />
                      <span>
                        Scrie raspunsul, apoi continua cu Enter sau sari direct la un alt exercitiu.
                        {unansweredInCurrent > 0 ? ` Mai sunt ${unansweredInCurrent} necompletate in acest subiect.` : ''}
                      </span>
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
