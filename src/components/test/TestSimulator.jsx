import { useCallback, useEffect, useMemo, useState } from 'react';
import { BlockMath } from 'react-katex';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  CheckSquare,
  CircleAlert,
  Hourglass,
  ListTodo,
  Save,
  Send,
  ShieldCheck,
  SkipForward,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Blackboard from '../blackboard/Blackboard';
import ChalkText from '../blackboard/ChalkText';
import MathKeyboard from '../keyboard/MathKeyboard';
import TestTimer from './TestTimer';
import TestResults from './TestResults';
import ExerciseVisual from '../exercises/ExerciseVisual';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import useTestStore from '../../store/testStore';
import { useAuth } from '../../contexts';
import styles from './TestSimulator.module.css';

const formatTimeLeft = (seconds) => {
  const totalSeconds = Math.max(0, Number(seconds) || 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }

  return `${minutes} min`;
};

const TestSimulator = () => {
  const navigate = useNavigate();
  const {
    currentTest,
    started,
    finished,
    answers,
    timeLeft,
    setAnswer,
    startTest,
    finishTest,
    resetTest,
    subjectIdx,
    exerciseIdx,
    setSubjectIdx,
    setExerciseIdx,
  } = useTestStore();
  const { user } = useAuth();
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  const subjects = useMemo(() => currentTest?.subjects || [], [currentTest]);
  const subject = subjects[subjectIdx];
  const exercises = subject?.exercises || [];
  const exercise = started ? exercises[exerciseIdx] : null;
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

  const subjectSummaries = useMemo(
    () => subjects.map((sub, index) => {
      const subjectExercises = sub.exercises || [];
      return {
        id: sub.id || `subject-${index + 1}`,
        label: sub.name || `Subiectul ${index + 1}`,
        count: subjectExercises.length,
        totalPoints: subjectExercises.reduce((sum, item) => sum + (item.points || 0), 0),
      };
    }),
    [subjects],
  );

  const totalQuestions = flattenedExercises.length;
  const answeredCount = flattenedExercises.filter((item) => String(answers[item.id] ?? '').trim()).length;
  const unansweredCount = Math.max(totalQuestions - answeredCount, 0);
  const currentPosition = flattenedExercises.findIndex(
    (item) => item.subjectIndex === subjectIdx && item.exerciseIndex === exerciseIdx,
  );
  const unansweredInCurrent = exercises.filter((item) => !String(answers[item.id] ?? '').trim()).length;
  const answeredInCurrent = exercises.filter((item) => String(answers[item.id] ?? '').trim()).length;
  const submitSummary = unansweredCount > 0
    ? `Mai ai ${unansweredCount} exercitii necompletate.`
    : 'Toate exercitiile au raspuns.';
  const coachMessage = unansweredCount === totalQuestions
    ? 'Incepe cu exercitiile pe care le stii sigur. Ritmul bun vine din raspunsuri castigate rapid.'
    : unansweredCount === 0
      ? 'Ai completat tot testul. Ia un minut pentru verificare, apoi preda cu incredere.'
      : unansweredCount <= 3
        ? `Mai ai doar ${unansweredCount} exercitii goale. Fa o ultima verificare inainte de predare.`
        : `Ai completat ${answeredCount} din ${totalQuestions} exercitii. Continua cu cele sigure, apoi revino la cele grele.`;

  const goToExercise = useCallback((nextSubjectIdx, nextExerciseIdx) => {
    if (!started) return;
    setSubjectIdx(nextSubjectIdx);
    setExerciseIdx(nextExerciseIdx);
  }, [setExerciseIdx, setSubjectIdx, started]);

  const advanceToNextExercise = useCallback(() => {
    if (!started || !flattenedExercises.length || currentPosition === -1) return;
    const next = flattenedExercises[currentPosition + 1];
    if (!next) return;
    goToExercise(next.subjectIndex, next.exerciseIndex);
  }, [currentPosition, flattenedExercises, goToExercise, started]);

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

  useEffect(() => {
    if (!started || finished) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [finished, started]);

  useEffect(() => {
    if (!started || finished) {
      setConfirmSubmitOpen(false);
    }
  }, [finished, started]);

  if (!currentTest) return null;
  if (finished) return <TestResults />;

  const handleKey = (value) => started && exercise && setAnswer(exercise.id, currentAnswer + value);
  const handleBack = () => started && exercise && setAnswer(exercise.id, currentAnswer.slice(0, -1));
  const handleClr = () => started && exercise && setAnswer(exercise.id, '');

  const goToNextUnanswered = () => {
    if (!started || !flattenedExercises.length) return;

    for (let step = 1; step <= flattenedExercises.length; step += 1) {
      const next = flattenedExercises[(currentPosition + step + flattenedExercises.length) % flattenedExercises.length];
      if (!String(answers[next.id] ?? '').trim()) {
        goToExercise(next.subjectIndex, next.exerciseIndex);
        return;
      }
    }
  };

  const requestFinishTest = () => {
    if (!started) return;
    setConfirmSubmitOpen(true);
  };

  const confirmFinishTest = () => {
    setConfirmSubmitOpen(false);
    finishTest(user?.uid);
  };

  const leaveTestSetup = () => {
    resetTest();
    navigate('/teste');
  };

  if (!started) {
    return (
      <div className={styles.shell}>
        <div className={styles.topBar}>
          <ChalkText size="xs" color="muted" className={styles.title}>{currentTest.title}</ChalkText>

          <div className={styles.subjectTabs} aria-hidden="true">
            {subjectSummaries.map((item) => (
              <span key={item.id} className={styles.subTab}>{item.label}</span>
            ))}
          </div>

          <div className={styles.topRight}>
            <span className={styles.autosaveBadge}>
              <Save size={12} />
              <span>Fara preview</span>
            </span>
            <TestTimer />
          </div>
        </div>

        <div className={styles.startGate}>
          <Blackboard className={styles.startBoard}>
            <div className={styles.startBoardInner}>
              <div className={styles.startHeader}>
                <span className={styles.startBadge}>Simulare completa</span>
                <ChalkText size="2xl" color="yellow">Incepi cand esti pregatit</ChalkText>
                <ChalkText size="sm" color="muted">
                  Cerintele raman ascunse pana la start. Asa pastram experienta apropiata de examen.
                </ChalkText>
              </div>

              <div className={styles.startStats}>
                <span className={styles.startStat}><Hourglass size={14} /> 120 minute</span>
                <span className={styles.startStat}><ShieldCheck size={14} /> 100p + 10 oficiu</span>
                <span className={styles.startStat}><ListTodo size={14} /> {totalQuestions} exercitii</span>
              </div>

              <div className={styles.subjectSummaryGrid}>
                {subjectSummaries.map((item) => (
                  <div key={item.id} className={styles.subjectSummaryCard}>
                    <span className={styles.subjectSummaryLabel}>{item.label}</span>
                    <span className={styles.subjectSummaryValue}>{item.count} exercitii</span>
                    <span className={styles.subjectSummaryMeta}>{item.totalPoints} puncte</span>
                  </div>
                ))}
              </div>
            </div>
          </Blackboard>

          <div className={styles.startPanel}>
            <div className={styles.ruleBlock}>
              <span className={styles.ruleTitle}>Ce se intampla dupa start</span>
              <ul className={styles.ruleList}>
                <li>Cronometrul porneste imediat si testul devine activ.</li>
                <li>Raspunsurile se salveaza local automat pentru reluare.</li>
                <li>Poti naviga intre subiecte doar dupa start.</li>
                <li>Daca timpul expira, testul se preda automat.</li>
              </ul>
            </div>

            <div className={styles.ruleBlock}>
              <span className={styles.ruleTitle}>Recomandare de lucru</span>
              <p className={styles.ruleText}>
                Parcurge mai intai cerintele sigure, apoi revino pe cele grele.
                Pastreaza ultimele minute pentru verificare.
              </p>
            </div>

            <div className={styles.startActions}>
              <Button variant="ghost" size="sm" icon={<ArrowLeft size={13} />} onClick={leaveTestSetup}>
                Inapoi la variante
              </Button>
              <Button
                variant="primary"
                size="lg"
                icon={<Send size={14} />}
                onClick={() => startTest(user?.uid, { scope: user?.uid })}
              >
                Incepe testul
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
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
              disabled={answeredCount === totalQuestions}
              title="Mergi la urmatorul exercitiu necompletat"
            >
              <SkipForward size={12} />
              <span>Necompletat</span>
              <strong>{unansweredCount}</strong>
            </button>

            <span className={styles.autosaveBadge}>
              <Save size={12} />
              <span>Autosave</span>
            </span>

            <TestTimer />

            <Button variant="danger" size="sm" icon={<Send size={13} />} onClick={requestFinishTest}>Preda</Button>
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
                      <span className={styles.progressChip}>Ramase: {unansweredCount}</span>
                    </div>

                    <div className={styles.coachPrompt}>
                      <span className={styles.coachPromptTitle}>Ritm recomandat</span>
                      <span className={styles.coachPromptText}>{coachMessage}</span>
                    </div>

                    <div className={styles.question}>
                      <ChalkText size="lg">{exercise.text}</ChalkText>
                      {exercise.math && <div className={styles.math}><BlockMath math={exercise.math} /></div>}
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

                    <div className={styles.ansSection}>
                      <ChalkText size="xs" color="muted">RASPUNS</ChalkText>
                      <div className={`${styles.ansBox} ${currentAnswer ? styles.ansFilled : ''}`}>
                        <span className={styles.ansText}>{currentAnswer || <span className={styles.cursor} />}</span>
                      </div>
                    </div>

                    <div className={styles.statusPrompt}>
                      <Save size={13} />
                      <span>Raspunsurile se salveaza local automat. Daca inchizi pagina, vei putea relua simularea.</span>
                    </div>

                    {!currentAnswer && (
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
                  onKey={handleKey}
                  onBackspace={handleBack}
                  onClear={handleClr}
                  className={styles.keyboard}
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <Modal isOpen={confirmSubmitOpen} onClose={() => setConfirmSubmitOpen(false)} title="Preda testul?">
        <div className={styles.submitModal}>
          <span className={styles.submitLead}>{submitSummary}</span>
          <span className={styles.submitText}>
            Predarea inchide simularea si salveaza rezultatul in profil.
            {started ? ` Mai sunt ${formatTimeLeft(timeLeft)} din timpul oficial.` : ''}
          </span>

          <div className={styles.submitStats}>
            <span className={styles.submitChip}><CheckSquare size={13} /> {answeredCount}/{totalQuestions} completate</span>
            <span className={styles.submitChip}><CircleAlert size={13} /> {unansweredCount} goale</span>
          </div>

          <div className={styles.submitActions}>
            <Button variant="ghost" size="sm" onClick={() => setConfirmSubmitOpen(false)}>
              Mai verific
            </Button>
            {unansweredCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setConfirmSubmitOpen(false);
                  goToNextUnanswered();
                }}
              >
                Mergi la necompletat
              </Button>
            )}
            <Button variant="danger" size="sm" icon={<Send size={13} />} onClick={confirmFinishTest}>
              Preda acum
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TestSimulator;
