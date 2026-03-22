/**
 * ZeceLogo — componentă de brand
 *
 * Props:
 *   size     — "sm" | "md" (implicit) | "lg"
 *   variant  — "full" (implicit) | "mark" | "wordmark"
 *   as       — tag HTML, implicit "div" (pasează "a" + href pentru link)
 */
import clsx from 'clsx';
import styles from './ZeceLogo.module.css';

/* ── Configurație dimensiuni per marcă ────────────────────── */
const CFG = {
  sm: {
    viewBox: '0 0 30 30',
    svgSize: 22,
    stroke: 4.5,
    // Diagonala Z: linia de sus, curba funcție, linia de jos
    d: 'M 6 9  L 24 9  C 19 14 11 17.5 6 21  L 24 21',
  },
  md: {
    viewBox: '0 0 44 44',
    svgSize: 32,
    stroke: 6.2,
    d: 'M 8 13 L 36 13 C 29 20 18 25 8 30 L 36 30',
  },
  lg: {
    viewBox: '0 0 60 60',
    svgSize: 44,
    stroke: 8,
    d: 'M 11 18 L 49 18 C 41 27 27 33 11 40 L 49 40',
  },
};

/* ── Marcă (pătratul cu Z) ────────────────────────────────── */
function Mark({ size = 'md' }) {
  const { viewBox, svgSize, stroke, d } = CFG[size];
  const sizeClass = `size${size[0].toUpperCase()}${size.slice(1)}`;

  return (
    <div className={clsx(styles.mark, styles[sizeClass])}>
      {/* Straturii decorative — ordine: grid → halo → shimmer → Z */}
      <span className={styles.grid}    aria-hidden="true" />
      <span className={styles.halo}    aria-hidden="true" />
      <span className={styles.shimmer} aria-hidden="true" />

      <svg
        className={styles.zSvg}
        width={svgSize}
        height={svgSize}
        viewBox={viewBox}
        fill="none"
        aria-hidden="true"
      >
        <defs>
          {/* Gradient Z: cyan strălucitor → teal → albastru-verzui */}
          <linearGradient id={`zg-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#00f0d0" />
            <stop offset="50%"  stopColor="#00c8e8" />
            <stop offset="100%" stopColor="#00a8d8" />
          </linearGradient>
          {/* Drop shadow filtru pentru Z */}
          <filter id={`zglow-${size}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
            <feColorMatrix in="blur" type="matrix"
              values="0 0 0 0 0   0 0.9 0 0 0.8   0 0 1 0 0.85   0 0 0 0.7 0"
              result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Umbra/glow a literei Z — desenată de două ori: o dată mai gros sub */}
        <path
          d={d}
          stroke="rgba(0,229,200,0.25)"
          strokeWidth={stroke + 3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Litera Z principală */}
        <path
          d={d}
          stroke={`url(#zg-${size})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#zglow-${size})`}
        />
      </svg>
    </div>
  );
}

/* ── Logo complet ─────────────────────────────────────────── */
function FullLogo({ size, className, as: Tag = 'div', ...rest }) {
  const sc = `size${size[0].toUpperCase()}${size.slice(1)}`;
  return (
    <Tag className={clsx(styles.root, styles[sc], className)} {...rest}>
      <Mark size={size} />
      <div className={styles.meta}>
        <span className={styles.eyebrow}>Pregătire · Matematică</span>
        <span className={styles.name}>Zece</span>
      </div>
    </Tag>
  );
}

/* ── Doar marcă ───────────────────────────────────────────── */
function MarkOnly({ size, className, as: Tag = 'div', ...rest }) {
  const sc = `size${size[0].toUpperCase()}${size.slice(1)}`;
  return (
    <Tag className={clsx(styles.root, styles[sc], className)} {...rest}>
      <Mark size={size} />
    </Tag>
  );
}

/* ── Wordmark ─────────────────────────────────────────────── */
const WM_SIZES = { sm: '1.3rem', md: '1.9rem', lg: '2.7rem' };

function Wordmark({ size, className, as: Tag = 'div', ...rest }) {
  return (
    <Tag className={clsx(styles.wordmarkRoot, className)} {...rest}>
      <span className={styles.wordmarkName} style={{ fontSize: WM_SIZES[size] }}>
        Zece
      </span>
      <span className={styles.wordmarkAccent} aria-hidden="true" />
    </Tag>
  );
}

/* ── Export principal ─────────────────────────────────────── */
export default function ZeceLogo({
  size    = 'md',
  variant = 'full',
  as      = 'div',
  className,
  ...rest
}) {
  const p = { size, as, className, ...rest };
  if (variant === 'mark')     return <MarkOnly  {...p} />;
  if (variant === 'wordmark') return <Wordmark  {...p} />;
  return                             <FullLogo  {...p} />;
}