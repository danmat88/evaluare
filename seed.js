/**
 * SEED SCRIPT — Romanian National Evaluation Math (Evaluarea Națională cls. VIII)
 * Uses Firebase ADMIN SDK — bypasses Firestore Security Rules entirely.
 *
 * Setup (one-time):
 *   1. Firebase Console → Project Settings → Service Accounts → Generate new private key
 *   2. Save the downloaded JSON as  serviceAccountKey.json  next to this file
 *   3. node seed.js
 *
 * To wipe and re-seed: node seed.js --clean
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const serviceAccount = require('./serviceAccountKey.json');

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const NOW = FieldValue.serverTimestamp();

// ─── EXERCISES ────────────────────────────────────────────────────────────
// Each exercise: id, chapter, difficulty (1-3), text, answer (exact string),
//                math? (KaTeX string), solution: [{text, math?, color}]
// color values: 'white' | 'yellow' | 'green' | 'cyan' | 'coral'

const EXERCISES = [

  // ══ MULȚIMI (10) ═══════════════════════════════════════════════════════
  {
    id: 'mul-01', chapter: 'multimi', difficulty: 1,
    text: 'Fie A = {1, 2, 3, 4, 5} și B = {3, 4, 5, 6, 7}. Calculează A ∩ B.',
    answer: '{3, 4, 5}',
    solution: [
      { text: 'Intersecția conține elementele comune ambelor mulțimi.', color: 'white' },
      { text: '1 ∉ B, 2 ∉ B, dar 3 ∈ B ✓, 4 ∈ B ✓, 5 ∈ B ✓', color: 'yellow' },
      { text: 'A ∩ B = {3, 4, 5}', math: 'A \\cap B = \\{3, 4, 5\\}', color: 'green' },
    ],
  },
  {
    id: 'mul-02', chapter: 'multimi', difficulty: 1,
    text: 'Fie A = {1, 2, 3, 4, 5} și B = {3, 4, 5, 6, 7}. Calculează A ∪ B.',
    answer: '{1, 2, 3, 4, 5, 6, 7}',
    solution: [
      { text: 'Reuniunea conține toate elementele din ambele mulțimi, fără repetiții.', color: 'white' },
      { text: 'A ∪ B = {1, 2, 3, 4, 5, 6, 7}', math: 'A \\cup B = \\{1,2,3,4,5,6,7\\}', color: 'green' },
    ],
  },
  {
    id: 'mul-03', chapter: 'multimi', difficulty: 2,
    text: 'Fie A = {x ∈ ℕ | x < 5}. Câte submulțimi are A?',
    answer: '32',
    solution: [
      { text: 'A = {0, 1, 2, 3, 4}, deci |A| = 5.', color: 'yellow' },
      { text: 'Numărul submulțimilor: 2ⁿ', math: '2^n', color: 'white' },
      { text: '2⁵ = 32', math: '2^5 = 32', color: 'green' },
    ],
  },
  {
    id: 'mul-04', chapter: 'multimi', difficulty: 2,
    text: 'Dacă A = {1, 2, 3} și B = {2, 3, 4, 5}, calculează A \\ B.',
    answer: '{1}',
    solution: [
      { text: 'Diferența A \\ B = elementele din A care NU sunt în B.', color: 'white' },
      { text: '1 ∉ B ✓, 2 ∈ B ✗, 3 ∈ B ✗', color: 'yellow' },
      { text: 'A \\ B = {1}', math: 'A \\setminus B = \\{1\\}', color: 'green' },
    ],
  },
  {
    id: 'mul-05', chapter: 'multimi', difficulty: 1,
    text: 'Mulțimea A = {1, 2, 3}. Câte elemente are mulțimea puterilor P(A)?',
    answer: '8',
    solution: [
      { text: '|A| = 3, deci |P(A)| = 2³', math: '|\\mathcal{P}(A)| = 2^3 = 8', color: 'green' },
    ],
  },
  {
    id: 'mul-06', chapter: 'multimi', difficulty: 1,
    text: 'Fie A = {a, b, c} și B = {c, d}. Calculează A ∩ B.',
    answer: '{c}',
    solution: [
      { text: 'Elementul comun este c.', color: 'yellow' },
      { text: 'A ∩ B = {c}', math: 'A \\cap B = \\{c\\}', color: 'green' },
    ],
  },
  {
    id: 'mul-07', chapter: 'multimi', difficulty: 2,
    text: 'A = {1, 3, 5, 7, 9} și B = {1, 2, 3}. Câte elemente are A \\ B?',
    answer: '3',
    solution: [
      { text: 'A \\ B = {5, 7, 9} — elementele din A care nu sunt în B.', color: 'yellow' },
      { text: '|A \\ B| = 3', math: '|A \\setminus B| = 3', color: 'green' },
    ],
  },
  {
    id: 'mul-08', chapter: 'multimi', difficulty: 3,
    text: 'Fie U = {1..10}, A = {par} și B = {multiplu de 3 ≤ 10}. Câte elemente are A ∩ B?',
    answer: '1',
    solution: [
      { text: 'A = {2, 4, 6, 8, 10}, B = {3, 6, 9}', color: 'yellow' },
      { text: 'A ∩ B = {6} → 1 element', math: 'A \\cap B = \\{6\\}', color: 'green' },
    ],
  },
  {
    id: 'mul-09', chapter: 'multimi', difficulty: 1,
    text: 'Fie A = ∅ și B = {1, 2}. Câte elemente are A ∪ B?',
    answer: '2',
    solution: [
      { text: 'A este mulțimea vidă, deci A ∪ B = B.', color: 'white' },
      { text: '|A ∪ B| = |B| = 2', math: '|A \\cup B| = 2', color: 'green' },
    ],
  },
  {
    id: 'mul-10', chapter: 'multimi', difficulty: 3,
    text: 'Fie A cu 3 elemente și B cu 4 elemente, A ∩ B = {x, y}. Câte elemente are A ∪ B?',
    answer: '5',
    solution: [
      { text: '|A ∪ B| = |A| + |B| − |A ∩ B|', math: '|A \\cup B| = |A| + |B| - |A \\cap B|', color: 'white' },
      { text: '|A ∪ B| = 3 + 4 − 2 = 5', math: '3 + 4 - 2 = 5', color: 'green' },
    ],
  },

  // ══ NUMERE (15) ════════════════════════════════════════════════════════
  {
    id: 'num-01', chapter: 'numere', difficulty: 1,
    text: 'Calculează: |−7| + |3 − 8|.',
    answer: '12',
    solution: [
      { text: '|−7| = 7', math: '|-7| = 7', color: 'yellow' },
      { text: '|3 − 8| = |−5| = 5', math: '|3-8| = 5', color: 'yellow' },
      { text: '7 + 5 = 12', math: '7 + 5 = 12', color: 'green' },
    ],
  },
  {
    id: 'num-02', chapter: 'numere', difficulty: 1,
    text: 'Care este cel mai mare număr întreg x cu x < √50?',
    answer: '7',
    solution: [
      { text: '7² = 49 < 50 și 8² = 64 > 50', math: '7^2=49 < 50 < 64=8^2', color: 'yellow' },
      { text: 'Cel mai mare întreg x < √50 este x = 7.', color: 'green' },
    ],
  },
  {
    id: 'num-03', chapter: 'numere', difficulty: 2,
    text: 'Calculează: (2/3 + 1/4) × 12.',
    answer: '11',
    solution: [
      { text: '2/3 + 1/4 = 8/12 + 3/12 = 11/12', math: '\\frac{2}{3}+\\frac{1}{4}=\\frac{11}{12}', color: 'yellow' },
      { text: '11/12 × 12 = 11', math: '\\frac{11}{12} \\times 12 = 11', color: 'green' },
    ],
  },
  {
    id: 'num-04', chapter: 'numere', difficulty: 2,
    text: 'Calculează: 3² + 4².',
    answer: '25',
    solution: [
      { text: '3² = 9, 4² = 16', math: '3^2+4^2=9+16=25', color: 'green' },
    ],
  },
  {
    id: 'num-05', chapter: 'numere', difficulty: 3,
    text: 'Fie a = 0,(36). Scrie a ca fracție ireductibilă.',
    answer: '4/11',
    solution: [
      { text: 'x = 0,(36), 100x = 36,(36)', math: '100x - x = 36 \\Rightarrow 99x = 36', color: 'yellow' },
      { text: '36/99 = 4/11', math: 'x = \\frac{4}{11}', color: 'green' },
    ],
  },
  {
    id: 'num-06', chapter: 'numere', difficulty: 1,
    text: 'Calculează: (−2)³.',
    answer: '-8',
    solution: [
      { text: '(−2)³ = (−2)(−2)(−2)', math: '(-2)^3 = -8', color: 'green' },
    ],
  },
  {
    id: 'num-07', chapter: 'numere', difficulty: 1,
    text: 'Calculează: √144.',
    answer: '12',
    solution: [
      { text: '12² = 144', math: '\\sqrt{144} = 12', color: 'green' },
    ],
  },
  {
    id: 'num-08', chapter: 'numere', difficulty: 2,
    text: 'Calculează: 5! (5 factorial).',
    answer: '120',
    solution: [
      { text: '5! = 5 × 4 × 3 × 2 × 1 = 120', math: '5! = 120', color: 'green' },
    ],
  },
  {
    id: 'num-09', chapter: 'numere', difficulty: 2,
    text: 'Cel mai mic număr natural cu 3 cifre divisibil la 6 este:',
    answer: '102',
    solution: [
      { text: 'Cel mai mic număr cu 3 cifre este 100. Verificăm: 100 / 6 nu e întreg.', color: 'white' },
      { text: '102 / 6 = 17 → 102 este divisibil cu 6.', color: 'yellow' },
      { text: 'Răspuns: 102', math: '102 = 6 \\times 17', color: 'green' },
    ],
  },
  {
    id: 'num-10', chapter: 'numere', difficulty: 3,
    text: 'Calculează: (3 − 5)² − (−1)³ + |−2|.',
    answer: '7',
    solution: [
      { text: '(3−5)² = (−2)² = 4', math: '(-2)^2 = 4', color: 'yellow' },
      { text: '(−1)³ = −1', math: '(-1)^3 = -1', color: 'yellow' },
      { text: '|−2| = 2', math: '|-2| = 2', color: 'yellow' },
      { text: '4 − (−1) + 2 = 4 + 1 + 2 = 7', math: '4+1+2=7', color: 'green' },
    ],
  },
  {
    id: 'num-11', chapter: 'numere', difficulty: 1,
    text: 'Calculează: 2³ × 3².',
    answer: '72',
    solution: [
      { text: '2³ = 8, 3² = 9', math: '2^3 \\times 3^2 = 8 \\times 9 = 72', color: 'green' },
    ],
  },
  {
    id: 'num-12', chapter: 'numere', difficulty: 2,
    text: 'Câte cifre are numărul 2¹⁰?',
    answer: '4',
    solution: [
      { text: '2¹⁰ = 1024, care are 4 cifre.', math: '2^{10} = 1024', color: 'green' },
    ],
  },
  {
    id: 'num-13', chapter: 'numere', difficulty: 1,
    text: 'Suma primelor 5 numere naturale pare (0, 2, 4, 6, 8) este:',
    answer: '20',
    solution: [
      { text: '0 + 2 + 4 + 6 + 8 = 20', math: '0+2+4+6+8=20', color: 'green' },
    ],
  },
  {
    id: 'num-14', chapter: 'numere', difficulty: 3,
    text: 'Calculează: ∛−27.',
    answer: '-3',
    solution: [
      { text: '(−3)³ = −27', math: '\\sqrt[3]{-27} = -3', color: 'green' },
    ],
  },
  {
    id: 'num-15', chapter: 'numere', difficulty: 2,
    text: 'Fie n = 2 × 3² × 5. Câți divizori pozitivi are n?',
    answer: '12',
    solution: [
      { text: 'n = 2¹ × 3² × 5¹', math: 'n = 2^1 \\cdot 3^2 \\cdot 5^1', color: 'yellow' },
      { text: 'Numărul de divizori = (1+1)(2+1)(1+1) = 2×3×2 = 12', math: 'd(n) = 2 \\cdot 3 \\cdot 2 = 12', color: 'green' },
    ],
  },

  // ══ ECUAȚII (20) ══════════════════════════════════════════════════════
  {
    id: 'ec-01', chapter: 'ecuatii', difficulty: 1,
    text: 'Rezolvă: 2x + 5 = 13.',
    answer: '4',
    solution: [
      { text: '2x = 13 − 5 = 8', math: '2x = 8', color: 'yellow' },
      { text: 'x = 4', math: 'x = 4', color: 'green' },
    ],
  },
  {
    id: 'ec-02', chapter: 'ecuatii', difficulty: 1,
    text: 'Rezolvă: 3x − 7 = 2x + 1.',
    answer: '8',
    solution: [
      { text: '3x − 2x = 1 + 7', math: 'x = 8', color: 'green' },
    ],
  },
  {
    id: 'ec-03', chapter: 'ecuatii', difficulty: 2,
    text: 'Rezolvă ecuația de gradul II: x² − 5x + 6 = 0.',
    answer: 'x=2 sau x=3',
    solution: [
      { text: 'Δ = 25 − 24 = 1', math: '\\Delta = 1', color: 'yellow' },
      { text: 'x₁,₂ = (5 ± 1) / 2', math: 'x_{1,2} = \\frac{5 \\pm 1}{2}', color: 'yellow' },
      { text: 'x₁ = 3, x₂ = 2', math: 'x_1=3,\\; x_2=2', color: 'green' },
    ],
  },
  {
    id: 'ec-04', chapter: 'ecuatii', difficulty: 2,
    text: 'Rezolvă sistemul: 2x + y = 7, x − y = 2.',
    answer: 'x=3, y=1',
    solution: [
      { text: 'Adunăm ecuațiile: 3x = 9, x = 3', math: '3x = 9 \\Rightarrow x = 3', color: 'yellow' },
      { text: 'y = x − 2 = 1', math: 'y = 1', color: 'green' },
    ],
  },
  {
    id: 'ec-05', chapter: 'ecuatii', difficulty: 2,
    text: 'Rezolvă în ℝ: x² − 4 = 0.',
    answer: 'x=2 sau x=-2',
    solution: [
      { text: 'x² = 4', math: 'x^2 = 4', color: 'yellow' },
      { text: 'x = ±2', math: 'x = \\pm 2', color: 'green' },
    ],
  },
  {
    id: 'ec-06', chapter: 'ecuatii', difficulty: 3,
    text: 'Rezolvă: x² + 2x − 8 = 0.',
    answer: 'x=2 sau x=-4',
    solution: [
      { text: 'Δ = 4 + 32 = 36, √Δ = 6', math: '\\Delta = 36', color: 'yellow' },
      { text: 'x₁ = 2, x₂ = −4', math: 'x_1=2,\\; x_2=-4', color: 'green' },
    ],
  },
  {
    id: 'ec-07', chapter: 'ecuatii', difficulty: 1,
    text: 'Rezolvă: x/2 + 3 = 7.',
    answer: '8',
    solution: [
      { text: 'x/2 = 4', math: '\\frac{x}{2} = 4', color: 'yellow' },
      { text: 'x = 8', math: 'x = 8', color: 'green' },
    ],
  },
  {
    id: 'ec-08', chapter: 'ecuatii', difficulty: 1,
    text: 'Rezolvă: 4(x − 1) = 12.',
    answer: '4',
    solution: [
      { text: '4x − 4 = 12', math: '4x = 16', color: 'yellow' },
      { text: 'x = 4', math: 'x = 4', color: 'green' },
    ],
  },
  {
    id: 'ec-09', chapter: 'ecuatii', difficulty: 2,
    text: 'Rezolvă sistemul: x + y = 10, x − y = 4.',
    answer: 'x=7, y=3',
    solution: [
      { text: 'Adunăm: 2x = 14, x = 7', math: 'x = 7', color: 'yellow' },
      { text: 'y = 10 − 7 = 3', math: 'y = 3', color: 'green' },
    ],
  },
  {
    id: 'ec-10', chapter: 'ecuatii', difficulty: 2,
    text: 'Rezolvă: x² − 9 = 0.',
    answer: 'x=3 sau x=-3',
    solution: [
      { text: 'x² = 9', math: 'x^2 = 9', color: 'yellow' },
      { text: 'x = ±3', math: 'x = \\pm 3', color: 'green' },
    ],
  },
  {
    id: 'ec-11', chapter: 'ecuatii', difficulty: 3,
    text: 'Rezolvă: x² − 6x + 9 = 0.',
    answer: 'x=3',
    solution: [
      { text: 'Δ = 36 − 36 = 0 → soluție dublă', math: '\\Delta = 0', color: 'yellow' },
      { text: 'x = 6/2 = 3', math: 'x = 3', color: 'green' },
    ],
  },
  {
    id: 'ec-12', chapter: 'ecuatii', difficulty: 1,
    text: 'Rezolvă: 2x + 3x = 25.',
    answer: '5',
    solution: [
      { text: '5x = 25', math: '5x = 25', color: 'yellow' },
      { text: 'x = 5', math: 'x = 5', color: 'green' },
    ],
  },
  {
    id: 'ec-13', chapter: 'ecuatii', difficulty: 2,
    text: 'Rezolvă inecuația: 2x − 3 < 7.',
    answer: 'x<5',
    solution: [
      { text: '2x < 10', math: '2x < 10', color: 'yellow' },
      { text: 'x < 5', math: 'x < 5', color: 'green' },
    ],
  },
  {
    id: 'ec-14', chapter: 'ecuatii', difficulty: 3,
    text: 'Rezolvă: x² + x − 6 = 0.',
    answer: 'x=2 sau x=-3',
    solution: [
      { text: 'Δ = 1 + 24 = 25, √Δ = 5', math: '\\Delta = 25', color: 'yellow' },
      { text: 'x = (−1 ± 5) / 2', math: 'x_1=2,\\; x_2=-3', color: 'green' },
    ],
  },
  {
    id: 'ec-15', chapter: 'ecuatii', difficulty: 1,
    text: 'Rezolvă: 10 − 3x = 1.',
    answer: '3',
    solution: [
      { text: '3x = 9', math: '3x = 9', color: 'yellow' },
      { text: 'x = 3', math: 'x = 3', color: 'green' },
    ],
  },
  {
    id: 'ec-16', chapter: 'ecuatii', difficulty: 2,
    text: 'Suma rădăcinilor ecuației x² − 7x + 12 = 0 este:',
    answer: '7',
    solution: [
      { text: 'Prin relațiile lui Viète: x₁ + x₂ = −b/a = 7', math: 'x_1 + x_2 = 7', color: 'green' },
    ],
  },
  {
    id: 'ec-17', chapter: 'ecuatii', difficulty: 2,
    text: 'Produsul rădăcinilor ecuației x² − 7x + 12 = 0 este:',
    answer: '12',
    solution: [
      { text: 'Prin Viète: x₁ × x₂ = c/a = 12', math: 'x_1 \\cdot x_2 = 12', color: 'green' },
    ],
  },
  {
    id: 'ec-18', chapter: 'ecuatii', difficulty: 3,
    text: 'Rezolvă: 2x² − 8 = 0.',
    answer: 'x=2 sau x=-2',
    solution: [
      { text: '2x² = 8, x² = 4', math: 'x^2 = 4', color: 'yellow' },
      { text: 'x = ±2', math: 'x = \\pm 2', color: 'green' },
    ],
  },
  {
    id: 'ec-19', chapter: 'ecuatii', difficulty: 1,
    text: 'Rezolvă: 7 − x = 2x − 2.',
    answer: '3',
    solution: [
      { text: '7 + 2 = 2x + x = 3x', math: '3x = 9', color: 'yellow' },
      { text: 'x = 3', math: 'x = 3', color: 'green' },
    ],
  },
  {
    id: 'ec-20', chapter: 'ecuatii', difficulty: 3,
    text: 'Rezolvă sistemul: 3x − 2y = 4, x + y = 3.',
    answer: 'x=2, y=1',
    solution: [
      { text: 'Din a 2-a: x = 3 − y. Substituim în prima.', color: 'white' },
      { text: '3(3−y) − 2y = 4 → 9 − 5y = 4 → y = 1', math: 'y = 1', color: 'yellow' },
      { text: 'x = 3 − 1 = 2', math: 'x = 2', color: 'green' },
    ],
  },

  // ══ FUNCȚII (15) ══════════════════════════════════════════════════════
  {
    id: 'fct-01', chapter: 'functii', difficulty: 1,
    text: 'f(x) = 2x + 1. Calculează f(3).',
    answer: '7',
    solution: [
      { text: 'f(3) = 2·3 + 1 = 7', math: 'f(3) = 7', color: 'green' },
    ],
  },
  {
    id: 'fct-02', chapter: 'functii', difficulty: 2,
    text: 'f(x) = 3x − 2. Pentru ce x avem f(x) = 7?',
    answer: '3',
    solution: [
      { text: '3x − 2 = 7 → 3x = 9 → x = 3', math: 'x = 3', color: 'green' },
    ],
  },
  {
    id: 'fct-03', chapter: 'functii', difficulty: 2,
    text: 'f(x) = x² − 3x + 2. Calculează f(0) + f(1) + f(2).',
    answer: '2',
    solution: [
      { text: 'f(0)=2, f(1)=0, f(2)=0', color: 'yellow' },
      { text: '2 + 0 + 0 = 2', math: '2+0+0=2', color: 'green' },
    ],
  },
  {
    id: 'fct-04', chapter: 'functii', difficulty: 1,
    text: 'f(x) = x². Calculează f(−3).',
    answer: '9',
    solution: [
      { text: 'f(−3) = (−3)² = 9', math: 'f(-3) = 9', color: 'green' },
    ],
  },
  {
    id: 'fct-05', chapter: 'functii', difficulty: 2,
    text: 'f(x) = 2x + 3 și f(a) = 11. Calculează a.',
    answer: '4',
    solution: [
      { text: '2a + 3 = 11 → 2a = 8 → a = 4', math: 'a = 4', color: 'green' },
    ],
  },
  {
    id: 'fct-06', chapter: 'functii', difficulty: 1,
    text: 'f(x) = 5 − 2x. Calculează f(0).',
    answer: '5',
    solution: [
      { text: 'f(0) = 5 − 0 = 5', math: 'f(0) = 5', color: 'green' },
    ],
  },
  {
    id: 'fct-07', chapter: 'functii', difficulty: 2,
    text: 'f(x) = x³ − 1. Calculează f(2).',
    answer: '7',
    solution: [
      { text: 'f(2) = 8 − 1 = 7', math: 'f(2) = 2^3 - 1 = 7', color: 'green' },
    ],
  },
  {
    id: 'fct-08', chapter: 'functii', difficulty: 3,
    text: 'f(x) = x² − 4x + 4. Valoarea minimă a lui f(x) este:',
    answer: '0',
    solution: [
      { text: 'f(x) = (x − 2)², minim în x = 2.', math: 'f(x) = (x-2)^2 \\geq 0', color: 'yellow' },
      { text: 'Valoarea minimă: f(2) = 0', math: 'f_{min} = 0', color: 'green' },
    ],
  },
  {
    id: 'fct-09', chapter: 'functii', difficulty: 1,
    text: 'f(x) = 3x. Calculează f(1) + f(2) + f(3).',
    answer: '18',
    solution: [
      { text: 'f(1)=3, f(2)=6, f(3)=9', color: 'yellow' },
      { text: '3+6+9=18', math: '3+6+9=18', color: 'green' },
    ],
  },
  {
    id: 'fct-10', chapter: 'functii', difficulty: 2,
    text: 'f(x) = 2x − 4. Zeroul funcției (f(x) = 0) este:',
    answer: '2',
    solution: [
      { text: '2x − 4 = 0 → x = 2', math: 'x = 2', color: 'green' },
    ],
  },
  {
    id: 'fct-11', chapter: 'functii', difficulty: 2,
    text: 'f(x) = −x + 5. Calculează f(5).',
    answer: '0',
    solution: [
      { text: 'f(5) = −5 + 5 = 0', math: 'f(5) = 0', color: 'green' },
    ],
  },
  {
    id: 'fct-12', chapter: 'functii', difficulty: 3,
    text: 'f(x) = x² − 1. Suma soluțiilor ecuației f(x) = 0 este:',
    answer: '0',
    solution: [
      { text: 'x² = 1 → x = ±1', math: 'x = \\pm 1', color: 'yellow' },
      { text: 'Suma: 1 + (−1) = 0', math: '1 + (-1) = 0', color: 'green' },
    ],
  },
  {
    id: 'fct-13', chapter: 'functii', difficulty: 1,
    text: 'f(x) = x + 7. Calculează f(−7).',
    answer: '0',
    solution: [
      { text: 'f(−7) = −7 + 7 = 0', math: 'f(-7) = 0', color: 'green' },
    ],
  },
  {
    id: 'fct-14', chapter: 'functii', difficulty: 2,
    text: 'f(x) = 4x − 8. Calculează f(3).',
    answer: '4',
    solution: [
      { text: 'f(3) = 12 − 8 = 4', math: 'f(3) = 4', color: 'green' },
    ],
  },
  {
    id: 'fct-15', chapter: 'functii', difficulty: 3,
    text: 'Fie f(x) = 2x + a. Dacă f(1) = 5, calculează a.',
    answer: '3',
    solution: [
      { text: 'f(1) = 2 + a = 5 → a = 3', math: 'a = 3', color: 'green' },
    ],
  },

  // ══ PROGRESII (10) ════════════════════════════════════════════════════
  {
    id: 'prg-01', chapter: 'progresii', difficulty: 1,
    text: 'Progresia aritmetică 3, 7, 11, 15, ... Al 10-lea termen este:',
    answer: '39',
    solution: [
      { text: 'r = 4, a₁₀ = 3 + 9·4 = 39', math: 'a_{10} = 3 + 9 \\cdot 4 = 39', color: 'green' },
    ],
  },
  {
    id: 'prg-02', chapter: 'progresii', difficulty: 2,
    text: 'Progresia geometrică 2, 6, 18, 54, ... Al 5-lea termen este:',
    answer: '162',
    solution: [
      { text: 'q = 3, b₅ = 2·3⁴ = 162', math: 'b_5 = 2 \\cdot 81 = 162', color: 'green' },
    ],
  },
  {
    id: 'prg-03', chapter: 'progresii', difficulty: 2,
    text: 'Suma primilor 10 termeni ai progresiei aritmetice cu a₁=1, r=2.',
    answer: '100',
    solution: [
      { text: 'a₁₀ = 1 + 18 = 19', math: 'a_{10} = 19', color: 'yellow' },
      { text: 'S₁₀ = 10·(1+19)/2 = 100', math: 'S_{10} = 100', color: 'green' },
    ],
  },
  {
    id: 'prg-04', chapter: 'progresii', difficulty: 1,
    text: 'Fie progresia aritmetică 1, 4, 7, 10, ... Rația r este:',
    answer: '3',
    solution: [
      { text: 'r = 4 − 1 = 3', math: 'r = 3', color: 'green' },
    ],
  },
  {
    id: 'prg-05', chapter: 'progresii', difficulty: 2,
    text: 'Progresia geometrică 1, 2, 4, 8, ... Rația q este:',
    answer: '2',
    solution: [
      { text: 'q = 2/1 = 2', math: 'q = 2', color: 'green' },
    ],
  },
  {
    id: 'prg-06', chapter: 'progresii', difficulty: 2,
    text: 'Al 5-lea termen al progresiei aritmetice cu a₁=2 și r=3 este:',
    answer: '14',
    solution: [
      { text: 'a₅ = 2 + 4·3 = 14', math: 'a_5 = 2 + 12 = 14', color: 'green' },
    ],
  },
  {
    id: 'prg-07', chapter: 'progresii', difficulty: 3,
    text: 'Suma primilor n termeni ai unei progresii aritmetice cu a₁=5, aₙ=45, n=9 este:',
    answer: '225',
    solution: [
      { text: 'Sₙ = n(a₁ + aₙ)/2 = 9·50/2 = 225', math: 'S_9 = \\frac{9 \\cdot 50}{2} = 225', color: 'green' },
    ],
  },
  {
    id: 'prg-08', chapter: 'progresii', difficulty: 1,
    text: 'Progresia 5, 10, 15, 20, ... Al 6-lea termen este:',
    answer: '30',
    solution: [
      { text: 'r = 5, a₆ = 5 + 5·5 = 30', math: 'a_6 = 30', color: 'green' },
    ],
  },
  {
    id: 'prg-09', chapter: 'progresii', difficulty: 2,
    text: 'Al treilea termen al progresiei geometrice cu b₁=3 și q=2 este:',
    answer: '12',
    solution: [
      { text: 'b₃ = 3 · 2² = 12', math: 'b_3 = 3 \\cdot 4 = 12', color: 'green' },
    ],
  },
  {
    id: 'prg-10', chapter: 'progresii', difficulty: 3,
    text: 'Suma primilor 6 termeni ai progresiei geometrice cu b₁=1 și q=2 este:',
    answer: '63',
    solution: [
      { text: 'S₆ = 1·(2⁶−1)/(2−1) = 63', math: 'S_6 = \\frac{2^6-1}{1} = 63', color: 'green' },
    ],
  },

  // ══ PROBABILITĂȚI (8) ════════════════════════════════════════════════
  {
    id: 'prob-01', chapter: 'probabilitati', difficulty: 1,
    text: 'Aruncăm un zar. P(număr par) = ?',
    answer: '1/2',
    solution: [
      { text: '{2,4,6} — 3 favorabile din 6', math: 'P = \\frac{3}{6} = \\frac{1}{2}', color: 'green' },
    ],
  },
  {
    id: 'prob-02', chapter: 'probabilitati', difficulty: 2,
    text: 'Dintr-un lot de 10 becuri, 3 defecte. P(bec bun) = ?',
    answer: '7/10',
    solution: [
      { text: '10 − 3 = 7 bune', math: 'P = \\frac{7}{10}', color: 'green' },
    ],
  },
  {
    id: 'prob-03', chapter: 'probabilitati', difficulty: 1,
    text: 'Aruncăm o monedă. P(cap) = ?',
    answer: '1/2',
    solution: [
      { text: '1 caz favorabil din 2', math: 'P = \\frac{1}{2}', color: 'green' },
    ],
  },
  {
    id: 'prob-04', chapter: 'probabilitati', difficulty: 2,
    text: 'Dintr-o urnă cu 5 bile roșii și 3 albastre, P(albastră) = ?',
    answer: '3/8',
    solution: [
      { text: '3 favorabile din 8 total', math: 'P = \\frac{3}{8}', color: 'green' },
    ],
  },
  {
    id: 'prob-05', chapter: 'probabilitati', difficulty: 2,
    text: 'Aruncăm un zar. P(număr > 4) = ?',
    answer: '1/3',
    solution: [
      { text: '{5, 6} — 2 favorabile din 6', math: 'P = \\frac{2}{6} = \\frac{1}{3}', color: 'green' },
    ],
  },
  {
    id: 'prob-06', chapter: 'probabilitati', difficulty: 3,
    text: 'P(A) = 0.3, P(B) = 0.4, A și B incompatibile. P(A ∪ B) = ?',
    answer: '0.7',
    solution: [
      { text: 'P(A ∪ B) = P(A) + P(B) = 0.7', math: 'P(A \\cup B) = 0.3 + 0.4 = 0.7', color: 'green' },
    ],
  },
  {
    id: 'prob-07', chapter: 'probabilitati', difficulty: 1,
    text: 'P(eveniment sigur) = ?',
    answer: '1',
    solution: [
      { text: 'Evenimentul sigur are probabilitatea 1.', math: 'P = 1', color: 'green' },
    ],
  },
  {
    id: 'prob-08', chapter: 'probabilitati', difficulty: 2,
    text: 'Aruncăm un zar. P(număr prim) = ?',
    answer: '1/2',
    solution: [
      { text: '{2, 3, 5} — 3 prime din 6', math: 'P = \\frac{3}{6} = \\frac{1}{2}', color: 'green' },
    ],
  },

  // ══ TRIUNGHIURI (18) ══════════════════════════════════════════════════
  {
    id: 'tri-01', chapter: 'triunghiuri', difficulty: 1,
    text: 'Triunghi dreptunghic cu catele 3 cm și 4 cm. Ipotenuza c = ?',
    answer: '5',
    solution: [
      { text: 'c² = 9 + 16 = 25, c = 5 cm', math: 'c = 5 \\text{ cm}', color: 'green' },
    ],
  },
  {
    id: 'tri-02', chapter: 'triunghiuri', difficulty: 1,
    text: 'Triunghi echilateral cu latura 6 cm. Perimetrul P = ?',
    answer: '18',
    solution: [
      { text: 'P = 3 × 6 = 18 cm', math: 'P = 18 \\text{ cm}', color: 'green' },
    ],
  },
  {
    id: 'tri-03', chapter: 'triunghiuri', difficulty: 2,
    text: 'Unghiurile sunt în raportul 1:2:3. Cel mai mare unghi = ?',
    answer: '90',
    solution: [
      { text: '6x = 180°, x = 30°', math: '3x = 90°', color: 'green' },
    ],
  },
  {
    id: 'tri-04', chapter: 'triunghiuri', difficulty: 2,
    text: 'Aria unui triunghi cu b = 8 cm și h = 5 cm = ?',
    answer: '20',
    solution: [
      { text: 'A = (8×5)/2 = 20 cm²', math: 'A = \\frac{8 \\times 5}{2} = 20 \\text{ cm}^2', color: 'green' },
    ],
  },
  {
    id: 'tri-05', chapter: 'triunghiuri', difficulty: 3,
    text: 'Ipotenuza unui triunghi dreptunghic isoscel este 10 cm. Cata = ?',
    answer: '5√2',
    solution: [
      { text: '2a² = 100, a = 5√2 cm', math: 'a = 5\\sqrt{2} \\text{ cm}', color: 'green' },
    ],
  },
  {
    id: 'tri-06', chapter: 'triunghiuri', difficulty: 1,
    text: 'Suma unghiurilor unui triunghi este:',
    answer: '180',
    solution: [
      { text: 'Suma unghiurilor = 180°', math: '\\alpha + \\beta + \\gamma = 180°', color: 'green' },
    ],
  },
  {
    id: 'tri-07', chapter: 'triunghiuri', difficulty: 2,
    text: 'Triunghi dreptunghic cu catele 5 și 12. Ipotenuza = ?',
    answer: '13',
    solution: [
      { text: 'c² = 25 + 144 = 169, c = 13', math: 'c = 13', color: 'green' },
    ],
  },
  {
    id: 'tri-08', chapter: 'triunghiuri', difficulty: 1,
    text: 'Triunghi isoscel cu două laturi de 7 cm și baza 4 cm. Perimetrul = ?',
    answer: '18',
    solution: [
      { text: 'P = 7 + 7 + 4 = 18 cm', math: 'P = 18 \\text{ cm}', color: 'green' },
    ],
  },
  {
    id: 'tri-09', chapter: 'triunghiuri', difficulty: 2,
    text: 'Într-un triunghi, două unghiuri sunt 40° și 70°. Al treilea unghi = ?',
    answer: '70',
    solution: [
      { text: '180° − 40° − 70° = 70°', math: '180 - 110 = 70°', color: 'green' },
    ],
  },
  {
    id: 'tri-10', chapter: 'triunghiuri', difficulty: 3,
    text: 'Triunghi echilateral cu latura 4 cm. Înălțimea h = ? (în cm, forma cu √3)',
    answer: '2√3',
    solution: [
      { text: 'h = (a√3)/2 = (4√3)/2 = 2√3 cm', math: 'h = 2\\sqrt{3} \\text{ cm}', color: 'green' },
    ],
  },
  {
    id: 'tri-11', chapter: 'triunghiuri', difficulty: 1,
    text: 'Un triunghi dreptunghic are ipotenuza 10 și o cată 6. Cealaltă cată = ?',
    answer: '8',
    solution: [
      { text: 'a² = 100 − 36 = 64, a = 8', math: 'a = 8', color: 'green' },
    ],
  },
  {
    id: 'tri-12', chapter: 'triunghiuri', difficulty: 2,
    text: 'Aria triunghiului echilateral cu latura 6 cm = ? (cu √3)',
    answer: '9√3',
    solution: [
      { text: 'A = (a²√3)/4 = (36√3)/4 = 9√3 cm²', math: 'A = 9\\sqrt{3} \\text{ cm}^2', color: 'green' },
    ],
  },
  {
    id: 'tri-13', chapter: 'triunghiuri', difficulty: 3,
    text: 'Unghiul exterior al unui triunghi format cu un unghi interior de 40° este:',
    answer: '140',
    solution: [
      { text: 'Unghiul exterior = 180° − 40° = 140°', math: '180 - 40 = 140°', color: 'green' },
    ],
  },
  {
    id: 'tri-14', chapter: 'triunghiuri', difficulty: 1,
    text: 'Triunghi dreptunghic cu catele 8 și 6. Perimetrul = ?',
    answer: '24',
    solution: [
      { text: 'c = 10 (3-4-5 × 2), P = 6+8+10 = 24', math: 'P = 24 \\text{ cm}', color: 'green' },
    ],
  },
  {
    id: 'tri-15', chapter: 'triunghiuri', difficulty: 2,
    text: 'Mediana la ipotenuza unui triunghi dreptunghic cu ipotenuza 12 cm = ?',
    answer: '6',
    solution: [
      { text: 'Mediana la ipotenuza = ipotenuza/2 = 6 cm', math: 'm_c = \\frac{c}{2} = 6 \\text{ cm}', color: 'green' },
    ],
  },
  {
    id: 'tri-16', chapter: 'triunghiuri', difficulty: 1,
    text: 'Triunghi cu aria 30 cm² și baza 10 cm. Înălțimea h = ?',
    answer: '6',
    solution: [
      { text: 'A = (b·h)/2 → h = 2A/b = 60/10 = 6 cm', math: 'h = 6 \\text{ cm}', color: 'green' },
    ],
  },
  {
    id: 'tri-17', chapter: 'triunghiuri', difficulty: 2,
    text: 'Triunghi dreptunghic cu catele egale și aria 8 cm². Cata = ?',
    answer: '4',
    solution: [
      { text: 'A = a²/2 = 8 → a² = 16 → a = 4 cm', math: 'a = 4 \\text{ cm}', color: 'green' },
    ],
  },
  {
    id: 'tri-18', chapter: 'triunghiuri', difficulty: 3,
    text: 'Teorema sinusurilor: a/sin A = 2R. Dacă a = 5 și sin A = 1/2, atunci R = ?',
    answer: '5',
    solution: [
      { text: '2R = a/sin A = 5/(1/2) = 10', math: 'R = 5', color: 'green' },
    ],
  },

  // ══ PATRULATERE (12) ══════════════════════════════════════════════════
  {
    id: 'pat-01', chapter: 'patrulatere', difficulty: 1,
    text: 'Dreptunghi cu lungimea 8 cm și lățimea 5 cm. Aria = ?',
    answer: '40',
    solution: [
      { text: 'A = 8 × 5 = 40 cm²', math: 'A = 40 \\text{ cm}^2', color: 'green' },
    ],
  },
  {
    id: 'pat-02', chapter: 'patrulatere', difficulty: 1,
    text: 'Pătrat cu diagonala 6√2 cm. Latura = ?',
    answer: '6',
    solution: [
      { text: 'a = d/√2 = 6 cm', math: 'a = 6 \\text{ cm}', color: 'green' },
    ],
  },
  {
    id: 'pat-03', chapter: 'patrulatere', difficulty: 2,
    text: 'Romb cu diagonalele d₁ = 6 cm și d₂ = 8 cm. Aria = ?',
    answer: '24',
    solution: [
      { text: 'A = (d₁·d₂)/2 = 48/2 = 24 cm²', math: 'A = 24 \\text{ cm}^2', color: 'green' },
    ],
  },
  {
    id: 'pat-04', chapter: 'patrulatere', difficulty: 2,
    text: 'Trapez cu bazele 10 cm și 6 cm, înălțimea 4 cm. Aria = ?',
    answer: '32',
    solution: [
      { text: 'A = (B+b)·h/2 = 16·4/2 = 32 cm²', math: 'A = 32 \\text{ cm}^2', color: 'green' },
    ],
  },
  {
    id: 'pat-05', chapter: 'patrulatere', difficulty: 1,
    text: 'Pătrat cu latura 9 cm. Aria = ?',
    answer: '81',
    solution: [
      { text: 'A = 9² = 81 cm²', math: 'A = 81 \\text{ cm}^2', color: 'green' },
    ],
  },
  {
    id: 'pat-06', chapter: 'patrulatere', difficulty: 1,
    text: 'Dreptunghi cu perimetrul 24 cm și lățimea 4 cm. Lungimea = ?',
    answer: '8',
    solution: [
      { text: '2(l + L) = 24 → l + L = 12 → L = 8 cm', math: 'L = 8 \\text{ cm}', color: 'green' },
    ],
  },
  {
    id: 'pat-07', chapter: 'patrulatere', difficulty: 2,
    text: 'Paralelogram cu baza 10 cm și înălțimea 5 cm. Aria = ?',
    answer: '50',
    solution: [
      { text: 'A = b · h = 10 × 5 = 50 cm²', math: 'A = 50 \\text{ cm}^2', color: 'green' },
    ],
  },
  {
    id: 'pat-08', chapter: 'patrulatere', difficulty: 2,
    text: 'Pătrat cu diagonala 10 cm. Aria = ?',
    answer: '50',
    solution: [
      { text: 'A = d²/2 = 100/2 = 50 cm²', math: 'A = \\frac{d^2}{2} = 50 \\text{ cm}^2', color: 'green' },
    ],
  },
  {
    id: 'pat-09', chapter: 'patrulatere', difficulty: 3,
    text: 'Trapez dreptunghic cu bazele 8 și 4 cm, latura perpendiculară 3 cm. Aria = ?',
    answer: '18',
    solution: [
      { text: 'A = (8+4)·3/2 = 18 cm²', math: 'A = 18 \\text{ cm}^2', color: 'green' },
    ],
  },
  {
    id: 'pat-10', chapter: 'patrulatere', difficulty: 1,
    text: 'Suma unghiurilor unui patrulater convex = ?',
    answer: '360',
    solution: [
      { text: 'Suma unghiurilor = 360°', math: '\\sum \\angle = 360°', color: 'green' },
    ],
  },
  {
    id: 'pat-11', chapter: 'patrulatere', difficulty: 2,
    text: 'Romb cu latura 5 cm. Perimetrul = ?',
    answer: '20',
    solution: [
      { text: 'P = 4 × 5 = 20 cm', math: 'P = 20 \\text{ cm}', color: 'green' },
    ],
  },
  {
    id: 'pat-12', chapter: 'patrulatere', difficulty: 3,
    text: 'Dreptunghi cu diagonala 13 cm și latura 5 cm. Cealaltă latură = ?',
    answer: '12',
    solution: [
      { text: 'l² + 25 = 169 → l² = 144 → l = 12 cm', math: 'l = 12 \\text{ cm}', color: 'green' },
    ],
  },

  // ══ CERC (10) ════════════════════════════════════════════════════════
  {
    id: 'cerc-01', chapter: 'cerc', difficulty: 1,
    text: 'Cerc cu raza r = 5 cm. Lungimea cercului (cu π) = ?',
    answer: '10π',
    solution: [
      { text: 'L = 2πr = 10π cm', math: 'L = 10\\pi \\text{ cm}', color: 'green' },
    ],
  },
  {
    id: 'cerc-02', chapter: 'cerc', difficulty: 1,
    text: 'Cerc cu raza r = 4 cm. Aria discului (cu π) = ?',
    answer: '16π',
    solution: [
      { text: 'A = πr² = 16π cm²', math: 'A = 16\\pi \\text{ cm}^2', color: 'green' },
    ],
  },
  {
    id: 'cerc-03', chapter: 'cerc', difficulty: 2,
    text: 'Sector de cerc cu r = 6 cm și unghi 60°. Aria (cu π) = ?',
    answer: '6π',
    solution: [
      { text: 'A = (60/360)·π·36 = 6π cm²', math: 'A = 6\\pi \\text{ cm}^2', color: 'green' },
    ],
  },
  {
    id: 'cerc-04', chapter: 'cerc', difficulty: 1,
    text: 'Cerc cu diametrul 14 cm. Lungimea (cu π) = ?',
    answer: '14π',
    solution: [
      { text: 'L = πd = 14π cm', math: 'L = 14\\pi \\text{ cm}', color: 'green' },
    ],
  },
  {
    id: 'cerc-05', chapter: 'cerc', difficulty: 2,
    text: 'Aria unui disc este 25π cm². Raza = ?',
    answer: '5',
    solution: [
      { text: 'πr² = 25π → r² = 25 → r = 5 cm', math: 'r = 5 \\text{ cm}', color: 'green' },
    ],
  },
  {
    id: 'cerc-06', chapter: 'cerc', difficulty: 2,
    text: 'Lungimea unui cerc este 12π cm. Raza = ?',
    answer: '6',
    solution: [
      { text: '2πr = 12π → r = 6 cm', math: 'r = 6 \\text{ cm}', color: 'green' },
    ],
  },
  {
    id: 'cerc-07', chapter: 'cerc', difficulty: 3,
    text: 'Sector de cerc cu aria 9π cm² și raza 6 cm. Unghiul la centru = ?',
    answer: '90',
    solution: [
      { text: '(α/360)·π·36 = 9π → α/360 = 1/4 → α = 90°', math: '\\alpha = 90°', color: 'green' },
    ],
  },
  {
    id: 'cerc-08', chapter: 'cerc', difficulty: 1,
    text: 'Cerc cu raza 3 cm. Aria discului (cu π) = ?',
    answer: '9π',
    solution: [
      { text: 'A = π·9 = 9π cm²', math: 'A = 9\\pi \\text{ cm}^2', color: 'green' },
    ],
  },
  {
    id: 'cerc-09', chapter: 'cerc', difficulty: 2,
    text: 'Coarda unui cerc are lungimea egală cu raza r = 8 cm. Unghiul la centru = ?',
    answer: '60',
    solution: [
      { text: 'Triunghiul format este echilateral, deci unghiul = 60°.', math: '\\alpha = 60°', color: 'green' },
    ],
  },
  {
    id: 'cerc-10', chapter: 'cerc', difficulty: 3,
    text: 'Aria sectorului de cerc cu r = 10 cm și unghi 36° este (cu π) = ?',
    answer: '10π',
    solution: [
      { text: 'A = (36/360)·π·100 = 10π cm²', math: 'A = 10\\pi \\text{ cm}^2', color: 'green' },
    ],
  },

  // ══ CORPURI GEOMETRICE (10) ═══════════════════════════════════════════
  {
    id: 'corp-01', chapter: 'corpuri', difficulty: 1,
    text: 'Cub cu muchia 3 cm. Volumul = ?',
    answer: '27',
    solution: [
      { text: 'V = a³ = 27 cm³', math: 'V = 3^3 = 27 \\text{ cm}^3', color: 'green' },
    ],
  },
  {
    id: 'corp-02', chapter: 'corpuri', difficulty: 2,
    text: 'Paralelipiped 4×3×5 cm. Volumul = ?',
    answer: '60',
    solution: [
      { text: 'V = 4·3·5 = 60 cm³', math: 'V = 60 \\text{ cm}^3', color: 'green' },
    ],
  },
  {
    id: 'corp-03', chapter: 'corpuri', difficulty: 2,
    text: 'Sferă cu raza r = 3 cm. Volumul (cu π) = ?',
    answer: '36π',
    solution: [
      { text: 'V = (4/3)πr³ = (4/3)·π·27 = 36π cm³', math: 'V = 36\\pi \\text{ cm}^3', color: 'green' },
    ],
  },
  {
    id: 'corp-04', chapter: 'corpuri', difficulty: 3,
    text: 'Cilindru cu r = 2 cm și h = 5 cm. Volumul (cu π) = ?',
    answer: '20π',
    solution: [
      { text: 'V = πr²h = π·4·5 = 20π cm³', math: 'V = 20\\pi \\text{ cm}^3', color: 'green' },
    ],
  },
  {
    id: 'corp-05', chapter: 'corpuri', difficulty: 1,
    text: 'Cub cu muchia 5 cm. Aria totală = ?',
    answer: '150',
    solution: [
      { text: 'A = 6a² = 6·25 = 150 cm²', math: 'A = 150 \\text{ cm}^2', color: 'green' },
    ],
  },
  {
    id: 'corp-06', chapter: 'corpuri', difficulty: 2,
    text: 'Piramidă pătrată cu baza 6 cm și înălțimea 4 cm. Volumul = ?',
    answer: '48',
    solution: [
      { text: 'V = (1/3)·B·h = (1/3)·36·4 = 48 cm³', math: 'V = 48 \\text{ cm}^3', color: 'green' },
    ],
  },
  {
    id: 'corp-07', chapter: 'corpuri', difficulty: 1,
    text: 'Paralelipiped pătrat cu baza 3 cm și înălțimea 7 cm. Volumul = ?',
    answer: '63',
    solution: [
      { text: 'V = 3·3·7 = 63 cm³', math: 'V = 63 \\text{ cm}^3', color: 'green' },
    ],
  },
  {
    id: 'corp-08', chapter: 'corpuri', difficulty: 2,
    text: 'Sferă cu diametrul 6 cm. Raza = ?',
    answer: '3',
    solution: [
      { text: 'r = d/2 = 3 cm', math: 'r = 3 \\text{ cm}', color: 'green' },
    ],
  },
  {
    id: 'corp-09', chapter: 'corpuri', difficulty: 3,
    text: 'Con cu r = 3 cm și h = 4 cm. Volumul (cu π) = ?',
    answer: '12π',
    solution: [
      { text: 'V = (1/3)πr²h = (1/3)·π·9·4 = 12π cm³', math: 'V = 12\\pi \\text{ cm}^3', color: 'green' },
    ],
  },
  {
    id: 'corp-10', chapter: 'corpuri', difficulty: 1,
    text: 'Cub cu aria totală 24 cm². Muchia = ?',
    answer: '2',
    solution: [
      { text: '6a² = 24 → a² = 4 → a = 2 cm', math: 'a = 2 \\text{ cm}', color: 'green' },
    ],
  },

  // ══ TRIGONOMETRIE (8) ════════════════════════════════════════════════
  {
    id: 'trig-01', chapter: 'trigonometrie', difficulty: 2,
    text: 'sin 30° = 1/2. Ipotenuza 10 cm. Cateta opusă unghiului 30° = ?',
    answer: '5',
    solution: [
      { text: 'CO = 10 · sin 30° = 10 · 1/2 = 5 cm', math: 'CO = 5 \\text{ cm}', color: 'green' },
    ],
  },
  {
    id: 'trig-02', chapter: 'trigonometrie', difficulty: 2,
    text: 'Calculează: sin²30° + cos²30°.',
    answer: '1',
    solution: [
      { text: 'Identitatea fundamentală: sin²α + cos²α = 1', math: '\\sin^2\\alpha + \\cos^2\\alpha = 1', color: 'green' },
    ],
  },
  {
    id: 'trig-03', chapter: 'trigonometrie', difficulty: 3,
    text: 'Cateta alăturată 6 cm, ipotenuza 10 cm. cos A = ?',
    answer: '3/5',
    solution: [
      { text: 'cos A = 6/10 = 3/5', math: '\\cos A = \\frac{3}{5}', color: 'green' },
    ],
  },
  {
    id: 'trig-04', chapter: 'trigonometrie', difficulty: 1,
    text: 'sin 90° = ?',
    answer: '1',
    solution: [
      { text: 'sin 90° = 1', math: '\\sin 90° = 1', color: 'green' },
    ],
  },
  {
    id: 'trig-05', chapter: 'trigonometrie', difficulty: 1,
    text: 'cos 0° = ?',
    answer: '1',
    solution: [
      { text: 'cos 0° = 1', math: '\\cos 0° = 1', color: 'green' },
    ],
  },
  {
    id: 'trig-06', chapter: 'trigonometrie', difficulty: 2,
    text: 'tan 45° = ?',
    answer: '1',
    solution: [
      { text: 'tan 45° = sin 45° / cos 45° = 1', math: '\\tan 45° = 1', color: 'green' },
    ],
  },
  {
    id: 'trig-07', chapter: 'trigonometrie', difficulty: 3,
    text: 'sin 60° = √3/2. Cateta opusă 60° în triunghi dreptunghic cu ipotenuza 8 cm = ?',
    answer: '4√3',
    solution: [
      { text: 'CO = 8 · sin 60° = 8 · √3/2 = 4√3 cm', math: 'CO = 4\\sqrt{3} \\text{ cm}', color: 'green' },
    ],
  },
  {
    id: 'trig-08', chapter: 'trigonometrie', difficulty: 2,
    text: 'Calculează: sin 0° + cos 90°.',
    answer: '0',
    solution: [
      { text: 'sin 0° = 0, cos 90° = 0', math: '0 + 0 = 0', color: 'green' },
    ],
  },
];

// ─── TESTS ────────────────────────────────────────────────────────────────

const TESTS = [
  {
    id: 'test-01',
    title: 'Simulare EN 2025 — Varianta 1',
    description: 'Test complet cu toate subiectele, nivel mediu.',
    totalPoints: 100,
    createdAt: NOW,
    subjects: [
      {
        name: 'Subiectul I',
        description: '5 exerciții × 5p fiecare.',
        exercises: [
          { id: 'T1-S1-1', text: 'Calculează: (−3)² + |−5|.', math: '(-3)^2 + |-5|', answer: '14', points: 5 },
          { id: 'T1-S1-2', text: 'Fie A = {1, 2, 3} și B = {2, 3, 4}. Câte elemente are A ∪ B?', answer: '4', points: 5 },
          { id: 'T1-S1-3', text: 'Rezolvă: 5x − 3 = 12.', math: '5x - 3 = 12', answer: '3', points: 5 },
          { id: 'T1-S1-4', text: 'Care este probabilitatea de a extrage o bilă albă din 3 albe și 2 roșii?', answer: '3/5', points: 5 },
          { id: 'T1-S1-5', text: 'Un triunghi dreptunghic are catele 5 cm și 12 cm. Ipotenuza este:', answer: '13', points: 5 },
        ],
      },
      {
        name: 'Subiectul II',
        description: '3 exerciții × 10p fiecare.',
        exercises: [
          { id: 'T1-S2-1', text: 'Progresia aritmetică 2, 5, 8, 11, ... Al 8-lea termen este:', math: 'a_n = a_1 + (n-1)r', answer: '23', points: 10 },
          { id: 'T1-S2-2', text: 'f(x) = 2x² − 3x + 1. Calculează f(2).', math: 'f(x) = 2x^2 - 3x + 1', answer: '3', points: 10 },
          { id: 'T1-S2-3', text: 'Un dreptunghi are perimetrul 28 cm și lățimea 5 cm. Aria sa este:', answer: '45', points: 10 },
        ],
      },
      {
        name: 'Subiectul III',
        description: '3 probleme × 15p fiecare.',
        exercises: [
          { id: 'T1-S3-1', text: 'Un cerc are aria 36π cm². Raza cercului (în cm) este:', math: 'A = \\pi r^2 = 36\\pi', answer: '6', points: 15 },
          { id: 'T1-S3-2', text: 'Rezolvă x² − 7x + 10 = 0. Suma soluțiilor este:', math: 'x^2 - 7x + 10 = 0', answer: '7', points: 15 },
          { id: 'T1-S3-3', text: 'Paralelipiped 2×3×h cm, volumul 30 cm³. Calculează h.', math: 'V = 2 \\times 3 \\times h = 30', answer: '5', points: 15 },
        ],
      },
    ],
  },

  {
    id: 'test-02',
    title: 'Simulare EN 2025 — Varianta 2',
    description: 'Test complet, nivel ușor-mediu. Recomandat pentru prima simulare.',
    totalPoints: 100,
    createdAt: NOW,
    subjects: [
      {
        name: 'Subiectul I',
        description: '5 exerciții × 5p fiecare.',
        exercises: [
          { id: 'T2-S1-1', text: 'Calculează: 3² − |−4| + 1.', math: '3^2 - |-4| + 1', answer: '6', points: 5 },
          { id: 'T2-S1-2', text: 'Fie A = {x ∈ ℕ | x ≤ 4}. Câte elemente are A?', answer: '5', points: 5 },
          { id: 'T2-S1-3', text: 'Rezolvă: 3(x + 2) = 15.', math: '3(x+2) = 15', answer: '3', points: 5 },
          { id: 'T2-S1-4', text: 'Progresia geometrică 1, 3, 9, ... Al 5-lea termen este:', answer: '81', points: 5 },
          { id: 'T2-S1-5', text: 'Un pătrat are latura 7 cm. Aria sa este:', answer: '49', points: 5 },
        ],
      },
      {
        name: 'Subiectul II',
        description: '3 exerciții × 10p fiecare.',
        exercises: [
          { id: 'T2-S2-1', text: 'f(x) = −x + 4. Calculează f(−2) + f(6).', math: 'f(x) = -x + 4', answer: '0', points: 10 },
          { id: 'T2-S2-2', text: 'Rezolvă sistemul x + y = 8, x − y = 2. Valoarea lui x este:', math: 'x+y=8,\\quad x-y=2', answer: '5', points: 10 },
          { id: 'T2-S2-3', text: 'Un cerc are raza r = 7 cm. Lungimea sa (cu π) este:', math: 'L = 2\\pi r', answer: '14π', points: 10 },
        ],
      },
      {
        name: 'Subiectul III',
        description: '3 probleme × 15p fiecare.',
        exercises: [
          { id: 'T2-S3-1', text: 'Triunghi dreptunghic cu catele 8 și 15 cm. Ipotenuza este:', math: 'c^2 = 8^2 + 15^2', answer: '17', points: 15 },
          { id: 'T2-S3-2', text: 'Ecuația x² − 5x + 6 = 0 are soluțiile x₁ și x₂. Produsul x₁·x₂ este:', math: 'x^2 - 5x + 6 = 0', answer: '6', points: 15 },
          { id: 'T2-S3-3', text: 'Un cub are aria totală 54 cm². Muchia cubului este:', math: '6a^2 = 54', answer: '3', points: 15 },
        ],
      },
    ],
  },

  {
    id: 'test-03',
    title: 'Simulare EN 2025 — Varianta 3',
    description: 'Test de dificultate ridicată. Pregătit pentru examenul real.',
    totalPoints: 100,
    createdAt: NOW,
    subjects: [
      {
        name: 'Subiectul I',
        description: '5 exerciții × 5p fiecare.',
        exercises: [
          { id: 'T3-S1-1', text: 'Calculează: (−2)⁴ − |3 − 7|.', math: '(-2)^4 - |3-7|', answer: '12', points: 5 },
          { id: 'T3-S1-2', text: 'A cu 4 el. și B cu 3 el., A∩B cu 2 el. Câte el. are A∪B?', answer: '5', points: 5 },
          { id: 'T3-S1-3', text: 'Rezolvă: x² − 2x − 3 = 0. Suma soluțiilor este:', math: 'x^2-2x-3=0', answer: '2', points: 5 },
          { id: 'T3-S1-4', text: 'Un zar este aruncat. P(număr mai mare ca 4) = ?', answer: '1/3', points: 5 },
          { id: 'T3-S1-5', text: 'Triunghi echilateral cu latura 4 cm. Aria (cu √3) este:', answer: '4√3', points: 5 },
        ],
      },
      {
        name: 'Subiectul II',
        description: '3 exerciții × 10p fiecare.',
        exercises: [
          { id: 'T3-S2-1', text: 'Suma primilor 12 termeni ai P.A. cu a₁=2 și r=3 este:', math: 'S_{12}=\\frac{12(a_1+a_{12})}{2}', answer: '222', points: 10 },
          { id: 'T3-S2-2', text: 'f(x) = x² + 2x − 3. Zeroul pozitiv al funcției este:', math: 'f(x)=x^2+2x-3', answer: '1', points: 10 },
          { id: 'T3-S2-3', text: 'Romb cu diagonalele 10 și 24 cm. Latura rombului este:', answer: '13', points: 10 },
        ],
      },
      {
        name: 'Subiectul III',
        description: '3 probleme × 15p fiecare.',
        exercises: [
          { id: 'T3-S3-1', text: 'Con cu r = 3 cm și h = 4 cm. Volumul (cu π) este:', math: 'V=\\frac{1}{3}\\pi r^2 h', answer: '12π', points: 15 },
          { id: 'T3-S3-2', text: 'Rezolvă sistemul 2x+3y=12, x−y=1. Valoarea lui x este:', math: '2x+3y=12,\\;x-y=1', answer: '3', points: 15 },
          { id: 'T3-S3-3', text: 'Cerc cu circumferința 10π cm. Aria discului (cu π) este:', math: 'L=2\\pi r=10\\pi', answer: '25π', points: 15 },
        ],
      },
    ],
  },
];

// ─── SEED ─────────────────────────────────────────────────────────────────

const CLEAN = process.argv.includes('--clean');

async function deleteCollection(colName) {
  const snap = await db.collection(colName).limit(400).get();
  if (snap.empty) return;
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  // Recurse if more docs remain
  if (snap.size === 400) await deleteCollection(colName);
}

async function seed() {
  console.log('🌱 Starting seed...\n');

  if (CLEAN) {
    console.log('🗑  Cleaning existing data...');
    await Promise.all(['exercises', 'tests'].map(deleteCollection));
    console.log('✅ Clean done.\n');
  }

  // ── Exercises ──────────────────────────────────────────────────────────
  console.log(`📝 Writing ${EXERCISES.length} exercises...`);
  const BATCH = 400;
  for (let i = 0; i < EXERCISES.length; i += BATCH) {
    const batch = db.batch();
    EXERCISES.slice(i, i + BATCH).forEach((ex) => {
      const { id, ...data } = ex;
      batch.set(db.collection('exercises').doc(id), { ...data, createdAt: NOW });
    });
    await batch.commit();
  }
  console.log('✅ Exercises written.\n');

  // ── Tests ──────────────────────────────────────────────────────────────
  console.log(`🧪 Writing ${TESTS.length} tests...`);
  for (const test of TESTS) {
    const { id, ...data } = test;
    await db.collection('tests').doc(id).set(data);
    console.log(`   ✓ ${test.title}`);
  }
  console.log('✅ Tests written.\n');

  // ── Summary ────────────────────────────────────────────────────────────
  const chapterCounts = {};
  EXERCISES.forEach((e) => { chapterCounts[e.chapter] = (chapterCounts[e.chapter] || 0) + 1; });

  console.log('🎉 Seed complete!');
  console.log(`   Exercises : ${EXERCISES.length}`);
  console.log(`   Tests     : ${TESTS.length}`);
  console.log('\n   Per chapter:');
  Object.entries(chapterCounts).sort().forEach(([ch, n]) => console.log(`     ${ch.padEnd(16)} ${n}`));

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
