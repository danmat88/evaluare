import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bookmark,
  CircleGauge,
  Clock3,
  Flame,
  FlaskConical,
  Play,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import ProgressDashboard from '../components/progress/ProgressDashboard';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts';
import useExerciseStore from '../store/exerciseStore';
import {
  STORAGE_CHANGE_EVENT,
  STORAGE_KEYS,
  dateStamp,
  getStorageScope,
  readScopedJSON,
  todayStamp,
} from '../utils/storage';
import {
  mergeChapterProgress,
  readStudyInsights,
  summarizeStudyInsights,
} from '../utils/studyInsights';
import styles from './Dashboard.module.css';

const DAILY_GOAL = 12;

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const up = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const TIPS = [
  'La ecuatii de gradul II, verifica mereu discriminantul Delta = b^2 - 4ac.',
  'Teorema lui Pitagora: in triunghi dreptunghic, a^2 + b^2 = c^2.',
  'Suma unghiurilor unui triunghi este intotdeauna 180 grade.',
  'Pentru progresii aritmetice: a_n = a_1 + (n-1) * r.',
  'Aria cercului: A = pi * r^2, iar lungimea cercului este 2 * pi * r.',
];

const dailyTip = TIPS[new Date().getDay() % TIPS.length];

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

const STATS = [
  { icon: <Zap size={15} />, label: 'XP Total', key: 'xp', color: 'yellow' },
  { icon: <Flame size={15} />, label: 'Serie', key: 'streak', color: 'coral' },
  { icon: <Target size={15} />, label: 'Corecte', key: 'totalCorrect', color: 'mint' },
];

/* ── Live clock — compact horizontal layout ────────── */
const LiveClock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');
  const ss = now.getSeconds().toString().padStart(2, '0');
  const day = now.toLocaleDateString('ro-RO', { weekday: 'short' }).replace('.', '');
  const date = now.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });

  return (
    <div className={styles.clock}>
      <div className={styles.clockFace}>
        <span className={styles.clockHM}>
          {hh}<span className={styles.clockColon}>:</span>{mm}
        </span>
        <span className={styles.clockSec}>{ss}</span>
      </div>
      <div className={styles.clockMeta}>
        <span className={styles.clockDay}>{day}</span>
        <span className={styles.clockDot}>·</span>
        <span className={styles.clockDate}>{date}</span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { xp, streak, totalCorrect } = useExerciseStore();
  const values = { xp, streak, totalCorrect };
  const storageScope = getStorageScope(user?.uid);

  const [favoritesCount, setFavoritesCount] = useState(0);
  const [dailyCorrect, setDailyCorrect] = useState(0);
  const [dailyAttempted, setDailyAttempted] = useState(0);
  const [lastExercise, setLastExercise] = useState(null);
  const [activityHistory, setActivityHistory] = useState({});
  const [studyInsights, setStudyInsights] = useState(() => readStudyInsights(storageScope));

  const name = profile?.name?.split(' ')[0] || 'elev';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buna dimineata' : hour < 18 ? 'Buna ziua' : 'Buna seara';

  const refreshJourney = useCallback(() => {
    const today = todayStamp();

    const favorites = readScopedJSON(STORAGE_KEYS.favorites, storageScope, []);
    setFavoritesCount(Array.isArray(favorites) ? favorites.length : 0);

    const daily = readScopedJSON(STORAGE_KEYS.dailyActivity, storageScope, { date: today, attempted: [], correct: [] });
    const normalized = daily?.date === today ? daily : { date: today, attempted: [], correct: [] };

    setDailyCorrect(Array.isArray(normalized.correct) ? normalized.correct.length : 0);
    setDailyAttempted(Array.isArray(normalized.attempted) ? normalized.attempted.length : 0);

    const last = readScopedJSON(STORAGE_KEYS.lastExercise, storageScope, null);
    setLastExercise(last && typeof last === 'object' ? last : null);

    const history = readScopedJSON(STORAGE_KEYS.activityHistory, storageScope, {});
    setActivityHistory(history && typeof history === 'object' ? history : {});

    setStudyInsights(readStudyInsights(storageScope));
  }, [storageScope]);

  useEffect(() => {
    refreshJourney();
    window.addEventListener('focus', refreshJourney);
    window.addEventListener('storage', refreshJourney);
    window.addEventListener(STORAGE_CHANGE_EVENT, refreshJourney);
    return () => {
      window.removeEventListener('focus', refreshJourney);
      window.removeEventListener('storage', refreshJourney);
      window.removeEventListener(STORAGE_CHANGE_EVENT, refreshJourney);
    };
  }, [refreshJourney]);

  const progress = useMemo(
    () => mergeChapterProgress(profile?.progress, studyInsights),
    [profile?.progress, studyInsights],
  );

  const weakest = useMemo(() => {
    let minPct = 101;
    let found = null;
    for (const ch of CHAPTERS) {
      const pct = ch.total > 0 ? ((progress[ch.id] || 0) / ch.total) * 100 : 0;
      if (pct < minPct) { minPct = pct; found = ch; }
    }
    return found;
  }, [progress]);

  const studySummary = useMemo(
    () => summarizeStudyInsights(studyInsights, CHAPTERS),
    [studyInsights],
  );

  const goalPct = Math.min(Math.round((dailyCorrect / DAILY_GOAL) * 100), 100);
  const remaining = Math.max(DAILY_GOAL - dailyCorrect, 0);
  const resumeLink = lastExercise?.chapter ? `/exercitii?capitol=${lastExercise.chapter}` : '/exercitii';
  const reviewLink = '/exercitii?mod=review';

  const lastChapterLabel = lastExercise?.chapter
    ? CHAPTERS.find((c) => c.id === lastExercise.chapter)?.label || lastExercise.chapter
    : null;

  const reviewChampionChapterLabel = studySummary.reviewChampion?.chapter
    ? CHAPTERS.find((c) => c.id === studySummary.reviewChampion.chapter)?.label || studySummary.reviewChampion.chapter
    : null;

  const averageSolveMinutes = studySummary.averageTimeSpent > 0
    ? `${Math.max(1, Math.round(studySummary.averageTimeSpent / 60))} min/ex.`
    : 'se calculeaza';

  const greetingSub = studySummary.reviewCount > 0
    ? `Ai ${studySummary.reviewCount} exercitii care merita o revizuire scurta.`
    : remaining > 0
      ? `Mai ai ${remaining} raspunsuri corecte pana la obiectivul de azi.`
      : studySummary.strongestAccuracyChapter
        ? `${studySummary.strongestAccuracyChapter.label} este in forma buna. Inchide cu o simulare.`
        : 'Continua sa exersezi. Esti pe drumul cel bun.';

  const weekSeries = useMemo(() => {
    const now = new Date();
    const rows = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = dateStamp(d);
      const rec = activityHistory?.[key] || {};
      rows.push({
        key,
        day: d.toLocaleDateString('ro-RO', { weekday: 'short' }).replace('.', ''),
        attempted: Number(rec.attempted || 0),
        correct: Number(rec.correct || 0),
      });
    }
    return rows;
  }, [activityHistory]);

  const maxWeekCorrect = Math.max(1, ...weekSeries.map((r) => r.correct));
  const weekActiveDays = weekSeries.filter((r) => r.attempted > 0).length;
  const weekCorrectTotal = weekSeries.reduce((sum, r) => sum + r.correct, 0);
  const consistencyLabel = weekActiveDays >= 5
    ? 'Ritmul este excelent.'
    : weekActiveDays >= 3
      ? 'Ritm bun. Mai adauga 1-2 sesiuni.'
      : 'Porneste cu sesiuni scurte zilnic.';

  const coachSteps = [
    lastExercise
      ? { label: 'Continua', title: 'Revino la ultimul exercitiu', sub: lastChapterLabel ? `Ultima oprire: ${lastChapterLabel}.` : 'Reintra in sesiunea precedenta.', to: resumeLink, action: 'Continua' }
      : { label: 'Pornire', title: 'Incepe o sesiune noua', sub: 'Alege un capitol si intra rapid in ritm.', to: '/exercitii', action: 'Deschide exercitii' },
    studySummary.reviewCount > 0
      ? { label: 'Revizuire', title: 'Curata exercitiile fragile', sub: reviewChampionChapterLabel ? `${studySummary.reviewCount} exercitii cer revizuire, mai ales in ${reviewChampionChapterLabel}.` : `${studySummary.reviewCount} exercitii cer revizuire.`, to: reviewLink, action: 'Deschide review' }
      : weakest
        ? { label: 'Recuperare', title: `Lucreaza ${weakest.label}`, sub: `${progress[weakest.id] || 0}/${weakest.total} exercitii completate.`, to: `/exercitii?capitol=${weakest.id}`, action: 'Exerseaza' }
        : { label: 'Progres', title: 'Continua pe capitole', sub: 'Construieste progres stabil in fiecare zona.', to: '/exercitii', action: 'Vezi capitolele' },
    remaining > 0
      ? { label: 'Obiectiv', title: `Mai ai ${remaining} corecte azi`, sub: 'Un sprint scurt acum iti inchide planul zilnic.', to: resumeLink, action: 'Termina obiectivul' }
      : { label: 'Simulare', title: 'Obiectivul zilnic este gata', sub: 'Poti trece pe o varianta completa de test.', to: '/teste', action: 'Incepe testul' },
  ];

  const coachInsightCards = [
    studySummary.totalAttempts > 0
      ? { label: 'Acuratete', value: `${studySummary.overallAccuracy}%`, sub: `${studySummary.totalCorrectAttempts}/${studySummary.totalAttempts} corecte recent.`, tone: 'cyan' }
      : null,
    studySummary.strongestAccuracyChapter
      ? { label: 'Capitol stabil', value: studySummary.strongestAccuracyChapter.label, sub: `${studySummary.strongestAccuracyChapter.accuracy}% pe ${studySummary.strongestAccuracyChapter.attempts} incercari.`, tone: 'mint' }
      : null,
    studySummary.reviewCount > 0
      ? { label: 'Prioritate', value: `${studySummary.reviewCount} review`, sub: reviewChampionChapterLabel ? `Incepe cu ${reviewChampionChapterLabel}.` : 'Revino pe exercitiile ratate recent.', tone: 'yellow' }
      : null,
  ].filter(Boolean);

  return (
    <Layout scrollMode="contained">
      <motion.div className={styles.page} variants={stagger} initial="initial" animate="animate">

        {/* ── Greeting card (with embedded clock) ── */}
        <motion.div className={styles.greeting} variants={up}>
          <div className={styles.greetingLeft}>
            <div className={styles.greetingText}>
              <span className={styles.greetingLabel}>{greeting},</span>
              <span className={styles.greetingName}>{name}!</span>
            </div>
            <p className={styles.greetingSub}>{greetingSub}</p>
          </div>
          <LiveClock />
        </motion.div>

        {/* ── Stats row ── */}
        <motion.div className={styles.statsRow} variants={up}>
          {STATS.map((s) => (
            <div key={s.label} className={styles.statCard}>
              <span className={`${styles.statIcon} ${styles[`iconBg_${s.color}`]}`}>{s.icon}</span>
              <div className={styles.statInfo}>
                <AnimatedCounter value={values[s.key]} className={`${styles.statNum} ${styles[`c_${s.color}`]}`} />
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Nav row ── */}
        <motion.div className={styles.navRow} variants={up}>
          <Link to="/exercitii" className={`${styles.navCard} ${styles.navCard_cyan}`}>
            <div className={`${styles.navIcon} ${styles.navIconCyan}`}><BookOpen size={20} /></div>
            <div className={styles.navBody}>
              <span className={styles.navTitle}>Exercitii</span>
              <span className={styles.navDesc}>Pe capitole, solutii animate, tastatura matematica</span>
            </div>
            <ArrowRight size={14} className={styles.arrow} />
          </Link>
          <Link to="/teste" className={`${styles.navCard} ${styles.navCard_yellow}`}>
            <div className={`${styles.navIcon} ${styles.navIconYellow}`}><FlaskConical size={20} /></div>
            <div className={styles.navBody}>
              <span className={styles.navTitle}>Test simulat</span>
              <span className={styles.navDesc}>Subiect I + II + III, 2 ore, corectare instant</span>
            </div>
            <ArrowRight size={14} className={styles.arrow} />
          </Link>
        </motion.div>

        {/* ── Journey card (fills remaining height, scrolls internally) ── */}
        <motion.div className={styles.journeyCard} variants={up}>
          {/* Fixed header */}
          <div className={styles.journeyHead}>
            <div className={styles.journeyHeadLeft}>
              <CircleGauge size={13} />
              <span className={styles.sectionLabel}>Plan zilnic</span>
            </div>
          </div>

          {/* Scrollable body */}
          <div className={styles.journeyScroll}>
            <div className={styles.journeyStats}>
              <span className={styles.journeyChip}><Target size={11} /> {dailyCorrect}/{DAILY_GOAL} corecte azi</span>
              <span className={styles.journeyChip}><BookOpen size={11} /> {dailyAttempted} incercate</span>
              <span className={styles.journeyChip}><Bookmark size={11} /> {favoritesCount} favorite</span>
              <span className={styles.journeyChip}><TrendingUp size={11} /> {studySummary.reviewCount} review</span>
              <span className={styles.journeyChip}><Clock3 size={11} /> {averageSolveMinutes}</span>
            </div>

            <div className={styles.goalTrack}>
              <motion.div
                className={styles.goalFill}
                initial={{ width: 0 }}
                animate={{ width: `${goalPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>

            {coachInsightCards.length > 0 && (
              <div className={styles.insightGrid}>
                {coachInsightCards.map((card) => (
                  <div key={card.label} className={`${styles.insightCard} ${styles[`insightCard_${card.tone}`]}`}>
                    <span className={styles.insightLabel}>{card.label}</span>
                    <span className={styles.insightValue}>{card.value}</span>
                    <span className={styles.insightSub}>{card.sub}</span>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.coachGrid}>
              {coachSteps.map((step) => (
                <div key={step.label} className={styles.coachStep}>
                  <span className={styles.coachEyebrow}>{step.label}</span>
                  <span className={styles.coachTitle}>{step.title}</span>
                  <span className={styles.coachSub}>{step.sub}</span>
                  <Link to={step.to} className={styles.coachAction}>{step.action}</Link>
                </div>
              ))}
            </div>

            <div className={styles.momentumBlock}>
              <div className={styles.momentumHead}>
                <span className={styles.momentumTitle}><BarChart3 size={12} /> Ritm 7 zile</span>
                <span className={styles.momentumMeta}>{weekCorrectTotal} corecte</span>
              </div>

              <div className={styles.momentumBars}>
                {weekSeries.map((row) => {
                  const h = row.correct > 0 ? Math.max(8, Math.round((row.correct / maxWeekCorrect) * 100)) : 4;
                  return (
                    <div key={row.key} className={styles.momentumCol} title={`${row.correct} corecte, ${row.attempted} incercate`}>
                      <span className={styles.momentumTrack}>
                        <motion.span
                          className={styles.momentumFill}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 0.35, ease: 'easeOut' }}
                        />
                      </span>
                      <span className={styles.momentumDay}>{row.day}</span>
                    </div>
                  );
                })}
              </div>

              <span className={styles.momentumHint}>
                Activ in {weekActiveDays}/7 zile. {consistencyLabel}
              </span>
            </div>

            {/* Tip strip — embedded at bottom of scroll area */}
            <div className={styles.tipStrip}>
              <div className={styles.tipStripHead}>
                <Clock3 size={12} />
                <span className={styles.tipLabel}>Sfatul zilei</span>
              </div>
              <span className={styles.tipText}>{dailyTip}</span>
              {studySummary.reviewCount > 0 ? (
                <div className={styles.tipHint}>
                  <TrendingUp size={13} className={styles.tipHintIcon} />
                  <span className={styles.tipHintText}>
                    Zona de revizuire are <strong>{studySummary.reviewCount} exercitii</strong>
                    {reviewChampionChapterLabel ? `, cu prioritate in ${reviewChampionChapterLabel}.` : '.'}
                  </span>
                  <Link className={styles.tipAction} to={reviewLink}>Revizuieste acum</Link>
                </div>
              ) : weakest && (
                <div className={styles.tipHint}>
                  <Target size={13} className={styles.tipHintIcon} />
                  <span className={styles.tipHintText}>
                    Exerseaza mai mult la <strong>{weakest.label}</strong>
                    {' '}| {progress[weakest.id] || 0}/{weakest.total} completate.
                  </span>
                  <Link className={styles.tipAction} to={`/exercitii?capitol=${weakest.id}`}>Incepe acum</Link>
                </div>
              )}
            </div>
          </div>

          {/* Fixed footer */}
          <div className={styles.journeyFooter}>
            <span className={styles.journeyHint}>
              {remaining > 0
                ? `Mai ai ${remaining} exercitii corecte pana la obiectivul zilnic.`
                : 'Obiectivul zilnic este atins. Continua!'}
            </span>
            <Link to={resumeLink} className={styles.journeyAction}>
              <Play size={12} />
              {lastExercise ? 'Continua' : 'Incepe sesiunea'}
            </Link>
          </div>
        </motion.div>

        {/* ── Progress panel (right column, spans all rows) ── */}
        <motion.div
          className={styles.progressPanel}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          <div className={styles.progressHeader}>
            <TrendingUp size={13} />
            <span className={styles.sectionLabel}>Progres capitole</span>
          </div>
          <ProgressDashboard progress={progress} xp={xp} />
        </motion.div>

      </motion.div>
    </Layout>
  );
};

export default Dashboard;
