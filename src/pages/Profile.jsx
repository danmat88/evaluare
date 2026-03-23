import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, FileText, Flame, History, Target, Trophy, Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts';
import useExerciseStore from '../store/exerciseStore';
import { getUserTestResults } from '../firebase/results';
import { STORAGE_CHANGE_EVENT, getStorageScope } from '../utils/storage';
import {
  mergeChapterProgress,
  readStudyInsights,
  summarizeStudyInsights,
} from '../utils/studyInsights';
import {
  readExerciseNotes,
  readStudentPreferences,
  summarizeExerciseNotes,
} from '../utils/studentToolkit';
import { getLevel, getLevelProgress } from '../utils/xp';
import styles from './Profile.module.css';

const LEVEL_NAMES = ['Debutant', 'Elev', 'Sarguincios', 'Priceput', 'Avansat', 'Expert', 'Maestru', 'Profesor', 'Geniu', 'Olimpic'];

const CHAPTERS = [
  { id: 'multimi', label: 'Multimi', total: 10 },
  { id: 'numere', label: 'Numere', total: 15 },
  { id: 'ecuatii', label: 'Ecuatii', total: 20 },
  { id: 'functii', label: 'Functii', total: 15 },
  { id: 'progresii', label: 'Progresii', total: 10 },
  { id: 'probabilitati', label: 'Probabilitati', total: 8 },
  { id: 'triunghiuri', label: 'Triunghiuri', total: 18 },
  { id: 'patrulatere', label: 'Patrulatere', total: 12 },
  { id: 'cerc', label: 'Cerc', total: 10 },
  { id: 'corpuri', label: 'Corpuri', total: 10 },
  { id: 'trigonometrie', label: 'Trigonometrie', total: 8 },
];

const gradeInfo = (pct) => {
  if (pct >= 90) return { g: '10', cls: styles.gradeTop };
  if (pct >= 80) return { g: '9', cls: styles.gradeTop };
  if (pct >= 70) return { g: '8', cls: styles.gradeMid };
  if (pct >= 60) return { g: '7', cls: styles.gradeMid };
  if (pct >= 50) return { g: '6', cls: styles.gradeWarn };
  return { g: '<5', cls: styles.gradeLow };
};

const fmtTime = (secs) => {
  if (!secs) return '--';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const Profile = () => {
  const { user, profile, logout } = useAuth();
  const { xp, bestStreak, totalCorrect, totalAnswered } = useExerciseStore();
  const [results, setResults] = useState([]);
  const storageScope = getStorageScope(user?.uid);
  const [studyInsights, setStudyInsights] = useState(() => readStudyInsights(storageScope));
  const [noteMap, setNoteMap] = useState(() => readExerciseNotes(storageScope));
  const [preferences, setPreferences] = useState(() => readStudentPreferences(storageScope));

  useEffect(() => {
    if (user?.uid) getUserTestResults(user.uid).then(setResults);
  }, [user]);

  useEffect(() => {
    const syncInsights = () => {
      setStudyInsights(readStudyInsights(storageScope));
      setNoteMap(readExerciseNotes(storageScope));
      setPreferences(readStudentPreferences(storageScope));
    };

    syncInsights();
    window.addEventListener('focus', syncInsights);
    window.addEventListener('storage', syncInsights);
    window.addEventListener(STORAGE_CHANGE_EVENT, syncInsights);

    return () => {
      window.removeEventListener('focus', syncInsights);
      window.removeEventListener('storage', syncInsights);
      window.removeEventListener(STORAGE_CHANGE_EVENT, syncInsights);
    };
  }, [storageScope]);

  const level = getLevel(xp);
  const pct = getLevelProgress(xp);
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const progress = useMemo(
    () => mergeChapterProgress(profile?.progress, studyInsights),
    [profile?.progress, studyInsights],
  );
  const studySummary = useMemo(
    () => summarizeStudyInsights(studyInsights, CHAPTERS),
    [studyInsights],
  );
  const notesSummary = useMemo(
    () => summarizeExerciseNotes(noteMap, CHAPTERS),
    [noteMap],
  );
  const reviewLink = '/exercitii?mod=review';
  const smartLink = '/exercitii?mod=smart';
  const notesLink = '/exercitii?mod=notes';
  const averageExerciseTime = studySummary.averageTimeSpent > 0
    ? `${Math.max(1, Math.round(studySummary.averageTimeSpent / 60))} min/ex.`
    : 'Se calculeaza';

  const weakest = useMemo(() => {
    let minPct = 101;
    let found = null;
    for (const ch of CHAPTERS) {
      const solved = progress[ch.id] || 0;
      const chPct = ch.total > 0 ? (solved / ch.total) * 100 : 0;
      if (chPct < minPct) {
        minPct = chPct;
        found = ch;
      }
    }
    return found;
  }, [progress]);

  return (
    <Layout scrollMode="page">
      <div className={styles.page}>
        <motion.div className={styles.profileCard} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.avatar}>
            <span className={styles.avatarLetter}>{profile?.name?.[0]?.toUpperCase()}</span>
          </div>

          <div className={styles.info}>
            <span className={styles.profileName}>{profile?.name}</span>
            <span className={styles.profileEmail}>{user?.email}</span>
            <div className={styles.levelBadge}>
              <span className={styles.levelNum}>Niv. {level}</span>
              <span className={styles.levelName}>{LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length - 1)]}</span>
            </div>
          </div>

          <div className={styles.xpBlock}>
            <div className={styles.xpBar}>
              <motion.div
                className={styles.xpFill}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <span className={styles.xpLabel}><AnimatedCounter value={xp} /> XP</span>
          </div>
        </motion.div>

        <div className={styles.statsGrid}>
          {[
            { icon: <Zap size={18} />, label: 'XP Total', value: xp, color: 'yellow' },
            { icon: <Flame size={18} />, label: 'Cel mai bun streak', value: bestStreak, color: 'coral' },
            { icon: <Trophy size={18} />, label: 'Teste completate', value: profile?.testsCompleted || 0, color: 'cyan' },
            { icon: <Target size={18} />, label: 'Acuratete', value: `${accuracy}%`, color: 'mint', raw: true },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className={`${styles.statCard} ${styles[`c_${s.color}`]}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <span className={styles.statIcon}>{s.icon}</span>
              <span className={styles.statVal}>{s.raw ? s.value : <AnimatedCounter value={s.value} />}</span>
              <span className={styles.statLbl}>{s.label}</span>
            </motion.div>
          ))}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionLead}>
              <BookOpen size={13} className={styles.sectionIcon} />
              <span className={styles.sectionLabel}>TOOLKIT DE STUDIU</span>
            </div>
          </div>

          <div className={styles.analysisGrid}>
            <div className={styles.analysisCard}>
              <span className={styles.analysisLabel}>Obiectiv zilnic</span>
              <span className={styles.analysisValue}>{preferences.dailyGoal} corecte</span>
              <span className={styles.analysisSub}>
                Tinta zilnica folosita in dashboard pentru progresul pe ziua curenta.
              </span>
            </div>

            <div className={styles.analysisCard}>
              <span className={styles.analysisLabel}>Sesiune smart</span>
              <span className={styles.analysisValue}>{preferences.smartSessionSize} exercitii</span>
              <span className={styles.analysisSub}>
                Modul smart alege automat review, zone slabe si exercitii cu notite.
              </span>
            </div>

            <div className={styles.analysisCard}>
              <span className={styles.analysisLabel}>Notite personale</span>
              <span className={styles.analysisValue}>{notesSummary.totalNotes}</span>
              <span className={styles.analysisSub}>
                {notesSummary.topChapter
                  ? `Cele mai multe sunt in ${notesSummary.topChapter.label}.`
                  : 'Nu ai inca notite salvate pe exercitii.'}
              </span>
            </div>
          </div>

          <div className={styles.analysisActionRow}>
            <Link to={smartLink} className={styles.analysisLink}>
              Porneste sesiunea smart
            </Link>
            <Link to={notesLink} className={styles.analysisLink}>
              Deschide notitele
            </Link>
            <Link to={reviewLink} className={styles.analysisLink}>
              Revino la review
            </Link>
          </div>

          {notesSummary.lastUpdatedNote && (
            <span className={styles.toolkitNote}>
              Ultima nota a fost actualizata pe {new Date(notesSummary.lastUpdatedNote.updatedAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}.
            </span>
          )}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionLead}>
              <Target size={13} className={styles.sectionIcon} />
              <span className={styles.sectionLabel}>ANALIZA DE INVATARE</span>
            </div>

            {studySummary.totalAttempts > 0 && (
              <span className={styles.histCount}>{studySummary.totalAttempts} incercari</span>
            )}
          </div>

          {studySummary.totalAttempts === 0 ? (
            <div className={styles.histEmpty}>
              <span className={styles.histEmptyIcon}><Target size={28} /></span>
              <span className={styles.histEmptyTitle}>Analiza apare dupa primele sesiuni</span>
              <span className={styles.histEmptyDesc}>Rezolva cateva exercitii, iar aici vei vedea ce merge bine si ce merita revizuit.</span>
            </div>
          ) : (
            <>
              <div className={styles.analysisGrid}>
                <div className={styles.analysisCard}>
                  <span className={styles.analysisLabel}>Acuratete recenta</span>
                  <span className={styles.analysisValue}>{studySummary.overallAccuracy}%</span>
                  <span className={styles.analysisSub}>
                    {studySummary.totalCorrectAttempts}/{studySummary.totalAttempts} raspunsuri corecte in sesiunile urmarite.
                  </span>
                </div>

                <div className={styles.analysisCard}>
                  <span className={styles.analysisLabel}>Ritm mediu</span>
                  <span className={styles.analysisValue}>{averageExerciseTime}</span>
                  <span className={styles.analysisSub}>
                    Timpul se calculeaza din exercitiile rezolvate recent, nu doar din testele complete.
                  </span>
                </div>

                <div className={styles.analysisCard}>
                  <span className={styles.analysisLabel}>Revizuire activa</span>
                  <span className={styles.analysisValue}>{studySummary.reviewCount}</span>
                  <span className={styles.analysisSub}>
                    {studySummary.reviewCount > 0
                      ? 'Ai exercitii care merita reluate pana cand raspunsul devine stabil.'
                      : 'Nu ai exercitii fragile in acest moment. Poti merge mai departe cu incredere.'}
                  </span>
                </div>
              </div>

              <div className={styles.analysisActionRow}>
                {studySummary.reviewCount > 0 && (
                  <Link to={reviewLink} className={styles.analysisLink}>
                    Deschide revizuirea
                  </Link>
                )}

                {studySummary.strongestAccuracyChapter && (
                  <Link to={`/exercitii?capitol=${studySummary.strongestAccuracyChapter.id}`} className={styles.analysisLink}>
                    Continua pe {studySummary.strongestAccuracyChapter.label}
                  </Link>
                )}

                {weakest && (
                  <Link to={`/exercitii?capitol=${weakest.id}`} className={styles.analysisLink}>
                    Repara {weakest.label}
                  </Link>
                )}
              </div>
            </>
          )}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionLead}>
              <History size={13} className={styles.sectionIcon} />
              <span className={styles.sectionLabel}>ISTORIC TESTE</span>
            </div>

            {results.length > 0 && (
              <span className={styles.histCount}>{results.length} test{results.length !== 1 ? 'e' : ''}</span>
            )}
          </div>

          {results.length === 0 ? (
            <div className={styles.histEmpty}>
              <span className={styles.histEmptyIcon}><FileText size={28} /></span>
              <span className={styles.histEmptyTitle}>Niciun test completat inca</span>
              <span className={styles.histEmptyDesc}>Incearca un test simulat pentru a vedea rezultatele aici.</span>
            </div>
          ) : (
            <div className={styles.histList}>
              {results.slice(0, 10).map((r, i) => {
                const { g, cls } = gradeInfo(r.percentage);
                const createdAt = r.createdAt?.toDate ? r.createdAt.toDate() : (r.createdAt ? new Date(r.createdAt) : null);
                return (
                  <motion.div
                    key={r.id}
                    className={styles.histItem}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className={styles.histLeft}>
                      <span className={`${styles.histGrade} ${cls}`}>{g}</span>
                      <div className={styles.histInfo}>
                        <span className={styles.histTitle}>{r.title || 'Test simulat'}</span>
                        <span className={styles.histMeta}>
                          <span>{r.score}/{r.totalPoints}p</span>
                          <span className={styles.histDot}>|</span>
                          <Clock size={11} />
                          <span>{fmtTime(r.timeSpent)}</span>
                        </span>
                      </div>
                    </div>

                    <div className={styles.histRight}>
                      <span className={`${styles.histPct} ${r.percentage >= 60 ? styles.histPctGood : styles.histPctBad}`}>
                        {r.percentage}%
                      </span>
                      <span className={styles.histDate}>
                        {createdAt
                          ? createdAt.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })
                          : '--'}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {weakest && (
          <motion.div
            className={styles.hintCard}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <BookOpen size={16} className={styles.hintIcon} />
            <div className={styles.hintBody}>
              <span className={styles.hintLabel}>CAPITOL DE IMBUNATATIT</span>
              <span className={styles.hintChapter}>{weakest.label}</span>
              <span className={styles.hintSub}>
                {progress[weakest.id] || 0}/{weakest.total} exercitii completate. Continua exersarea!
              </span>
            </div>
          </motion.div>
        )}

        <Button variant="danger" size="sm" onClick={logout} className={styles.logout}>
          Deconectare
        </Button>
      </div>
    </Layout>
  );
};

export default Profile;
