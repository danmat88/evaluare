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
import { STORAGE_KEYS, safeReadJSON, todayStamp } from '../utils/storage';
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
  { icon: <Zap size={16} />, label: 'XP Total', key: 'xp', color: 'yellow' },
  { icon: <Flame size={16} />, label: 'Serie', key: 'streak', color: 'coral' },
  { icon: <Target size={16} />, label: 'Corecte', key: 'totalCorrect', color: 'mint' },
];

const LiveClock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');
  const ss = now.getSeconds().toString().padStart(2, '0');
  const day = now.toLocaleDateString('ro-RO', { weekday: 'long' });
  const date = now.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' });

  return (
    <div className={styles.clock}>
      <div className={styles.clockFace}>
        <span className={styles.clockHM}>{hh}<span className={styles.clockColon}>:</span>{mm}</span>
        <span className={styles.clockSec}>{ss}</span>
      </div>
      <div className={styles.clockMeta}>
        <span className={styles.clockDay}>{day}</span>
        <span className={styles.clockDate}>{date}</span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { profile } = useAuth();
  const { xp, streak, totalCorrect } = useExerciseStore();
  const values = { xp, streak, totalCorrect };

  const [favoritesCount, setFavoritesCount] = useState(0);
  const [dailyCorrect, setDailyCorrect] = useState(0);
  const [dailyAttempted, setDailyAttempted] = useState(0);
  const [lastExercise, setLastExercise] = useState(null);
  const [activityHistory, setActivityHistory] = useState({});

  const name = profile?.name?.split(' ')[0] || 'elev';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buna dimineata' : hour < 18 ? 'Buna ziua' : 'Buna seara';

  const refreshJourney = useCallback(() => {
    const today = todayStamp();

    const favorites = safeReadJSON(STORAGE_KEYS.favorites, []);
    setFavoritesCount(Array.isArray(favorites) ? favorites.length : 0);

    const daily = safeReadJSON(STORAGE_KEYS.dailyActivity, { date: today, attempted: [], correct: [] });
    const normalized = daily?.date === today ? daily : { date: today, attempted: [], correct: [] };

    setDailyCorrect(Array.isArray(normalized.correct) ? normalized.correct.length : 0);
    setDailyAttempted(Array.isArray(normalized.attempted) ? normalized.attempted.length : 0);

    const last = safeReadJSON(STORAGE_KEYS.lastExercise, null);
    setLastExercise(last && typeof last === 'object' ? last : null);

    const history = safeReadJSON(STORAGE_KEYS.activityHistory, {});
    setActivityHistory(history && typeof history === 'object' ? history : {});
  }, []);

  useEffect(() => {
    refreshJourney();
    window.addEventListener('focus', refreshJourney);
    window.addEventListener('storage', refreshJourney);
    return () => {
      window.removeEventListener('focus', refreshJourney);
      window.removeEventListener('storage', refreshJourney);
    };
  }, [refreshJourney]);

  const progress = useMemo(() => profile?.progress || {}, [profile?.progress]);

  const weakest = useMemo(() => {
    let minPct = 101;
    let found = null;

    for (const ch of CHAPTERS) {
      const pct = ch.total > 0 ? ((progress[ch.id] || 0) / ch.total) * 100 : 0;
      if (pct < minPct) {
        minPct = pct;
        found = ch;
      }
    }

    return found;
  }, [progress]);

  const goalPct = Math.min(Math.round((dailyCorrect / DAILY_GOAL) * 100), 100);
  const remaining = Math.max(DAILY_GOAL - dailyCorrect, 0);
  const resumeLink = lastExercise?.chapter ? `/exercitii?capitol=${lastExercise.chapter}` : '/exercitii';

  const weekSeries = useMemo(() => {
    const now = new Date();
    const rows = [];

    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
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

  const maxWeekCorrect = Math.max(1, ...weekSeries.map((row) => row.correct));
  const weekActiveDays = weekSeries.filter((row) => row.attempted > 0).length;
  const weekCorrectTotal = weekSeries.reduce((sum, row) => sum + row.correct, 0);
  const consistencyLabel = weekActiveDays >= 5
    ? 'Ritmul este excelent. Continua asa.'
    : weekActiveDays >= 3
      ? 'Ritm bun. Mai adauga 1-2 sesiuni.'
      : 'Porneste cu sesiuni scurte in fiecare zi.';

  return (
    <Layout>
      <motion.div className={styles.page} variants={stagger} initial="initial" animate="animate">
        <motion.div className={styles.greeting} variants={up}>
          <div className={styles.greetingText}>
            <span className={styles.greetingLabel}>{greeting},</span>
            <span className={styles.greetingName}>{name}!</span>
          </div>
          <p className={styles.greetingSub}>Continua sa exersezi si vei fi pregatit pentru examen.</p>
        </motion.div>

        <motion.div className={styles.clockCard} variants={up}>
          <div className={styles.clockGlow} />
          <LiveClock />
        </motion.div>

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
          <ProgressDashboard profile={profile} xp={xp} />
        </motion.div>

        {STATS.map((s, i) => (
          <motion.div key={s.label} className={`${styles.statCard} ${styles[`statCell${i}`]}`} variants={up}>
            <span className={`${styles.statIcon} ${styles[`iconBg_${s.color}`]}`}>{s.icon}</span>
            <AnimatedCounter value={values[s.key]} className={`${styles.statNum} ${styles[`c_${s.color}`]}`} />
            <span className={styles.statLabel}>{s.label}</span>
          </motion.div>
        ))}

        <motion.div className={styles.navExercises} variants={up}>
          <Link to="/exercitii" className={`${styles.navCard} ${styles.navCard_cyan}`}>
            <div className={`${styles.navIcon} ${styles.navIconCyan}`}><BookOpen size={22} /></div>
            <div className={styles.navBody}>
              <span className={styles.navTitle}>Exercitii</span>
              <span className={styles.navDesc}>Pe capitole, solutii animate, tastatura matematica</span>
            </div>
            <ArrowRight size={16} className={styles.arrow} />
          </Link>
        </motion.div>

        <motion.div className={styles.navTests} variants={up}>
          <Link to="/teste" className={`${styles.navCard} ${styles.navCard_yellow}`}>
            <div className={`${styles.navIcon} ${styles.navIconYellow}`}><FlaskConical size={22} /></div>
            <div className={styles.navBody}>
              <span className={styles.navTitle}>Test simulat</span>
              <span className={styles.navDesc}>Subiect I + II + III, 2 ore, corectare instant</span>
            </div>
            <ArrowRight size={16} className={styles.arrow} />
          </Link>
        </motion.div>

        <motion.div className={styles.journeyCard} variants={up}>
          <div className={styles.journeyHead}>
            <CircleGauge size={15} />
            <span className={styles.sectionLabel}>Plan zilnic</span>
          </div>

          <div className={styles.journeyStats}>
            <span className={styles.journeyChip}><Target size={12} /> {dailyCorrect}/{DAILY_GOAL} corecte azi</span>
            <span className={styles.journeyChip}><BookOpen size={12} /> {dailyAttempted} incercate azi</span>
            <span className={styles.journeyChip}><Bookmark size={12} /> {favoritesCount} favorite</span>
          </div>

          <div className={styles.goalTrack}>
            <motion.div
              className={styles.goalFill}
              initial={{ width: 0 }}
              animate={{ width: `${goalPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>

          <div className={styles.momentumBlock}>
            <div className={styles.momentumHead}>
              <span className={styles.momentumTitle}><BarChart3 size={13} /> Ritm 7 zile</span>
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

          <div className={styles.journeyFooter}>
            <span className={styles.journeyHint}>
              {remaining > 0 ? `Mai ai ${remaining} exercitii corecte pana la obiectivul zilnic.` : 'Obiectivul zilnic este atins. Continua!'}
            </span>
            <Link to={resumeLink} className={styles.journeyAction}>
              <Play size={13} />
              {lastExercise ? 'Continua ultimul exercitiu' : 'Incepe o sesiune noua'}
            </Link>
          </div>
        </motion.div>

        <motion.div className={styles.tipCard} variants={up}>
          <div className={styles.tipHeader}>
            <Clock3 size={14} className={styles.tipIcon} />
            <span className={styles.tipLabel}>Sfatul zilei</span>
          </div>
          <span className={styles.tipText}>{dailyTip}</span>

          {weakest && (
            <div className={styles.tipHint}>
              <Target size={14} className={styles.tipHintIcon} />
              <span className={styles.tipHintText}>
                Exerseaza mai mult la <strong>{weakest.label}</strong>
                {' '}| {progress[weakest.id] || 0}/{weakest.total} exercitii completate.
              </span>
              <Link className={styles.tipAction} to={`/exercitii?capitol=${weakest.id}`}>
                Incepe acum
              </Link>
            </div>
          )}
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Dashboard;
