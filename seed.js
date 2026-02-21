/**
 * SEED SCRIPT — Romanian National Evaluation Math (Evaluarea Națională cls. VIII)
 * Uses Firebase ADMIN SDK — bypasses Firestore Security Rules entirely.
 *
 * Setup (one-time):
 *   1. npm install firebase-admin
 *   2. Firebase Console → Project Settings → Service Accounts → Generate new private key
 *   3. Save the downloaded JSON as  serviceAccountKey.json  next to this file
 *   4. node seed.js
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';

// ─── SERVICE ACCOUNT ──────────────────────────────────────────────────────
// Download from: Firebase Console → Project Settings → Service Accounts
const serviceAccount = require('./serviceAccountKey.json');
// ──────────────────────────────────────────────────────────────────────────

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ─── EXERCISES ────────────────────────────────────────────────────────────

const EXERCISES = [

  // ── MULȚIMI ─────────────────────────────────────────────────────────────
  {
    id: 'mul-01', chapter: 'multimi', difficulty: 1, points: 5,
    text: 'Fie A = {1, 2, 3, 4, 5} și B = {3, 4, 5, 6, 7}. Calculează A ∩ B.',
    answer: '{3, 4, 5}',
    solution: [
      { text: 'Intersecția conține elementele comune celor două mulțimi.', color: 'white' },
      { text: 'Verificăm fiecare element din A: 1 ∉ B, 2 ∉ B, 3 ∈ B ✓, 4 ∈ B ✓, 5 ∈ B ✓', color: 'yellow' },
      { text: 'A ∩ B = {3, 4, 5}', math: 'A \\cap B = \\{3, 4, 5\\}', color: 'green' },
    ],
  },
  {
    id: 'mul-02', chapter: 'multimi', difficulty: 1, points: 5,
    text: 'Fie A = {1, 2, 3, 4, 5} și B = {3, 4, 5, 6, 7}. Calculează A ∪ B.',
    answer: '{1, 2, 3, 4, 5, 6, 7}',
    solution: [
      { text: 'Reuniunea conține toate elementele din ambele mulțimi, fără repetiții.', color: 'white' },
      { text: 'A ∪ B = {1, 2, 3, 4, 5, 6, 7}', math: 'A \\cup B = \\{1,2,3,4,5,6,7\\}', color: 'green' },
    ],
  },
  {
    id: 'mul-03', chapter: 'multimi', difficulty: 2, points: 5,
    text: 'Fie A = {x ∈ ℕ | x < 5}. Câte submulțimi are mulțimea A?',
    answer: '32',
    solution: [
      { text: 'Mai întâi determinăm A = {0, 1, 2, 3, 4}, deci |A| = 5 elemente.', color: 'yellow' },
      { text: 'Numărul de submulțimi ale unei mulțimi cu n elemente este 2ⁿ.', color: 'white' },
      { text: '2⁵ = 32', math: '2^5 = 32', color: 'green' },
    ],
  },
  {
    id: 'mul-04', chapter: 'multimi', difficulty: 2, points: 5,
    text: 'Dacă A = {1, 2, 3} și B = {2, 3, 4, 5}, calculează A \\ B (diferența).',
    answer: '{1}',
    solution: [
      { text: 'Diferența A \\ B conține elementele din A care nu sunt în B.', color: 'white' },
      { text: '1 ∉ B ✓, 2 ∈ B ✗, 3 ∈ B ✗', color: 'yellow' },
      { text: 'A \\ B = {1}', math: 'A \\setminus B = \\{1\\}', color: 'green' },
    ],
  },

  // ── NUMERE ───────────────────────────────────────────────────────────────
  {
    id: 'num-01', chapter: 'numere', difficulty: 1, points: 5,
    text: 'Calculează: |−7| + |3 − 8|.',
    answer: '12',
    solution: [
      { text: '|−7| = 7', math: '|-7| = 7', color: 'yellow' },
      { text: '|3 − 8| = |−5| = 5', math: '|3-8| = |-5| = 5', color: 'yellow' },
      { text: '7 + 5 = 12', math: '7 + 5 = 12', color: 'green' },
    ],
  },
  {
    id: 'num-02', chapter: 'numere', difficulty: 1, points: 5,
    text: 'Care este cel mai mare număr întreg x cu proprietatea că x < √50?',
    answer: '7',
    solution: [
      { text: 'Calculăm: 7² = 49 < 50 și 8² = 64 > 50', math: '7^2=49<50<64=8^2', color: 'yellow' },
      { text: 'Deci √50 este între 7 și 8, mai aproape de 7.', color: 'white' },
      { text: 'Cel mai mare întreg x < √50 este x = 7.', color: 'green' },
    ],
  },
  {
    id: 'num-03', chapter: 'numere', difficulty: 2, points: 5,
    text: 'Calculează: (2/3 + 1/4) × 12.',
    answer: '11',
    solution: [
      { text: 'Calculăm suma fracțiilor: 2/3 + 1/4 = 8/12 + 3/12 = 11/12', math: '\\frac{2}{3}+\\frac{1}{4}=\\frac{8}{12}+\\frac{3}{12}=\\frac{11}{12}', color: 'yellow' },
      { text: 'Înmulțim cu 12: (11/12) × 12 = 11', math: '\\frac{11}{12} \\times 12 = 11', color: 'green' },
    ],
  },
  {
    id: 'num-04', chapter: 'numere', difficulty: 2, points: 5,
    text: 'Calculează: 3² + 4².',
    answer: '25',
    solution: [
      { text: '3² = 9, 4² = 16', math: '3^2=9,\\quad 4^2=16', color: 'yellow' },
      { text: '9 + 16 = 25', math: '9+16=25', color: 'green' },
    ],
  },
  {
    id: 'num-05', chapter: 'numere', difficulty: 3, points: 5,
    text: 'Fie numărul rațional a = 0,(36). Scrie a ca fracție ireductibilă.',
    answer: '4/11',
    solution: [
      { text: 'Fie x = 0,(36). Atunci 100x = 36,(36)', math: 'x = 0.\\overline{36}\\Rightarrow 100x = 36.\\overline{36}', color: 'yellow' },
      { text: '100x − x = 36  ⟹  99x = 36', math: '99x = 36 \\Rightarrow x = \\frac{36}{99}', color: 'yellow' },
      { text: 'Simplificăm: 36/99 = 4/11 (împărțim la 9)', math: 'x = \\frac{4}{11}', color: 'green' },
    ],
  },

  // ── ECUAȚII ──────────────────────────────────────────────────────────────
  {
    id: 'ec-01', chapter: 'ecuatii', difficulty: 1, points: 5,
    text: 'Rezolvă ecuația: 2x + 5 = 13.',
    answer: '4',
    solution: [
      { text: 'Scădem 5 din ambele membre:', math: '2x = 13 - 5 = 8', color: 'yellow' },
      { text: 'Împărțim la 2:', math: 'x = \\frac{8}{2} = 4', color: 'green' },
    ],
  },
  {
    id: 'ec-02', chapter: 'ecuatii', difficulty: 1, points: 5,
    text: 'Rezolvă ecuația: 3x − 7 = 2x + 1.',
    answer: '8',
    solution: [
      { text: 'Aducem termenii cu x în stânga:', math: '3x - 2x = 1 + 7', color: 'yellow' },
      { text: 'Simplificăm:', math: 'x = 8', color: 'green' },
    ],
  },
  {
    id: 'ec-03', chapter: 'ecuatii', difficulty: 2, points: 5,
    text: 'Rezolvă ecuația de gradul II: x² − 5x + 6 = 0.',
    answer: 'x=2 sau x=3',
    solution: [
      { text: 'Calculăm discriminantul:', math: '\\Delta = (-5)^2 - 4 \\cdot 1 \\cdot 6 = 25 - 24 = 1', color: 'yellow' },
      { text: 'Rădăcinile sunt:', math: 'x_{1,2} = \\frac{5 \\pm 1}{2}', color: 'yellow' },
      { text: 'x₁ = 3, x₂ = 2', math: 'x_1 = 3,\\quad x_2 = 2', color: 'green' },
    ],
  },
  {
    id: 'ec-04', chapter: 'ecuatii', difficulty: 2, points: 5,
    text: 'Rezolvă sistemul: { 2x + y = 7, x − y = 2 }.',
    answer: 'x=3, y=1',
    solution: [
      { text: 'Adunăm ecuațiile pentru a elimina y:', math: '(2x + y) + (x - y) = 7 + 2', color: 'yellow' },
      { text: 'Obținem: 3x = 9, deci x = 3.', math: '3x = 9 \\Rightarrow x = 3', color: 'yellow' },
      { text: 'Din ecuația a doua: y = x − 2 = 1.', math: 'y = 3 - 2 = 1', color: 'green' },
    ],
  },
  {
    id: 'ec-05', chapter: 'ecuatii', difficulty: 3, points: 5,
    text: 'Rezolvă în ℝ: x² − 4 = 0.',
    answer: 'x=2 sau x=-2',
    solution: [
      { text: 'x² = 4', math: 'x^2 = 4', color: 'yellow' },
      { text: '|x| = 2, deci x = ±2', math: 'x = \\pm 2', color: 'green' },
    ],
  },
  {
    id: 'ec-06', chapter: 'ecuatii', difficulty: 3, points: 5,
    text: 'Rezolvă ecuația: x² + 2x − 8 = 0.',
    answer: 'x=2 sau x=-4',
    solution: [
      { text: 'Δ = 4 + 32 = 36, √Δ = 6', math: '\\Delta = 4 + 32 = 36', color: 'yellow' },
      { text: 'x₁,₂ = (−2 ± 6) / 2', math: 'x_{1,2} = \\frac{-2 \\pm 6}{2}', color: 'yellow' },
      { text: 'x₁ = 2, x₂ = −4', math: 'x_1 = 2,\\quad x_2 = -4', color: 'green' },
    ],
  },

  // ── FUNCȚII ──────────────────────────────────────────────────────────────
  {
    id: 'fct-01', chapter: 'functii', difficulty: 1, points: 5,
    text: 'Funcția f: ℝ → ℝ, f(x) = 2x + 1. Calculează f(3).',
    answer: '7',
    solution: [
      { text: 'Substituim x = 3:', math: 'f(3) = 2 \\cdot 3 + 1 = 6 + 1 = 7', color: 'green' },
    ],
  },
  {
    id: 'fct-02', chapter: 'functii', difficulty: 2, points: 5,
    text: 'Funcția f(x) = 3x − 2. Pentru ce valoare a lui x avem f(x) = 7?',
    answer: '3',
    solution: [
      { text: '3x − 2 = 7', math: '3x - 2 = 7', color: 'yellow' },
      { text: '3x = 9', math: '3x = 9', color: 'yellow' },
      { text: 'x = 3', math: 'x = 3', color: 'green' },
    ],
  },
  {
    id: 'fct-03', chapter: 'functii', difficulty: 2, points: 5,
    text: 'Fie f(x) = x² − 3x + 2. Calculează f(0) + f(1) + f(2).',
    answer: '2',
    solution: [
      { text: 'f(0) = 0 − 0 + 2 = 2', math: 'f(0) = 2', color: 'yellow' },
      { text: 'f(1) = 1 − 3 + 2 = 0', math: 'f(1) = 0', color: 'yellow' },
      { text: 'f(2) = 4 − 6 + 2 = 0', math: 'f(2) = 0', color: 'yellow' },
      { text: 'f(0) + f(1) + f(2) = 2 + 0 + 0 = 2', math: '2 + 0 + 0 = 2', color: 'green' },
    ],
  },

  // ── PROGRESII ────────────────────────────────────────────────────────────
  {
    id: 'prg-01', chapter: 'progresii', difficulty: 1, points: 5,
    text: 'Progresia aritmetică: 3, 7, 11, 15, ... Care este termenul al 10-lea?',
    answer: '39',
    solution: [
      { text: 'Rația este r = 7 − 3 = 4', math: 'r = 4', color: 'yellow' },
      { text: 'Formula termenului general: aₙ = a₁ + (n−1)·r', math: 'a_n = a_1 + (n-1) \\cdot r', color: 'white' },
      { text: 'a₁₀ = 3 + 9·4 = 3 + 36 = 39', math: 'a_{10} = 3 + 9 \\cdot 4 = 39', color: 'green' },
    ],
  },
  {
    id: 'prg-02', chapter: 'progresii', difficulty: 2, points: 5,
    text: 'Progresia geometrică: 2, 6, 18, 54, ... Care este termenul al 5-lea?',
    answer: '162',
    solution: [
      { text: 'Rația este q = 6 / 2 = 3', math: 'q = 3', color: 'yellow' },
      { text: 'Formula: bₙ = b₁ · qⁿ⁻¹', math: 'b_n = b_1 \\cdot q^{n-1}', color: 'white' },
      { text: 'b₅ = 2 · 3⁴ = 2 · 81 = 162', math: 'b_5 = 2 \\cdot 3^4 = 162', color: 'green' },
    ],
  },
  {
    id: 'prg-03', chapter: 'progresii', difficulty: 2, points: 5,
    text: 'Suma primilor 10 termeni ai progresiei aritmetice cu a₁ = 1 și r = 2.',
    answer: '100',
    solution: [
      { text: 'Formula sumei: Sₙ = n(a₁ + aₙ) / 2', math: 'S_n = \\frac{n(a_1 + a_n)}{2}', color: 'white' },
      { text: 'a₁₀ = 1 + 9·2 = 19', math: 'a_{10} = 19', color: 'yellow' },
      { text: 'S₁₀ = 10(1 + 19) / 2 = 100', math: 'S_{10} = \\frac{10 \\cdot 20}{2} = 100', color: 'green' },
    ],
  },

  // ── PROBABILITĂȚI ────────────────────────────────────────────────────────
  {
    id: 'prob-01', chapter: 'probabilitati', difficulty: 1, points: 5,
    text: 'Aruncăm un zar echilibrat. Care este probabilitatea de a obține un număr par?',
    answer: '1/2',
    solution: [
      { text: 'Numerele pare pe zar: {2, 4, 6} — 3 cazuri favorabile din 6.', color: 'white' },
      { text: 'P(par) = 3/6 = 1/2', math: 'P = \\frac{3}{6} = \\frac{1}{2}', color: 'green' },
    ],
  },
  {
    id: 'prob-02', chapter: 'probabilitati', difficulty: 2, points: 5,
    text: 'Dintr-un lot de 10 becuri, 3 sunt defecte. Alegem un bec la întâmplare. P(bec bun) = ?',
    answer: '7/10',
    solution: [
      { text: 'Becuri bune: 10 − 3 = 7', color: 'yellow' },
      { text: 'P(bun) = 7/10', math: 'P = \\frac{7}{10}', color: 'green' },
    ],
  },

  // ── TRIUNGHIURI ──────────────────────────────────────────────────────────
  {
    id: 'tri-01', chapter: 'triunghiuri', difficulty: 1, points: 5,
    text: 'Într-un triunghi dreptunghic, catele sunt a = 3 cm și b = 4 cm. Calculează ipotenuza c.',
    answer: '5',
    solution: [
      { text: 'Aplicăm teorema lui Pitagora:', math: 'c^2 = a^2 + b^2', color: 'white' },
      { text: 'c² = 9 + 16 = 25', math: 'c^2 = 9 + 16 = 25', color: 'yellow' },
      { text: 'c = 5 cm', math: 'c = 5 \\text{ cm}', color: 'green' },
    ],
  },
  {
    id: 'tri-02', chapter: 'triunghiuri', difficulty: 1, points: 5,
    text: 'Un triunghi echilateral are latura de 6 cm. Calculează perimetrul.',
    answer: '18',
    solution: [
      { text: 'Triunghiul echilateral are toate laturile egale.', color: 'white' },
      { text: 'P = 3 × 6 = 18 cm', math: 'P = 3 \\times 6 = 18 \\text{ cm}', color: 'green' },
    ],
  },
  {
    id: 'tri-03', chapter: 'triunghiuri', difficulty: 2, points: 5,
    text: 'Unghiurile unui triunghi sunt în raportul 1:2:3. Care este măsura unghiului cel mai mare?',
    answer: '90',
    solution: [
      { text: 'Suma unghiurilor este 180°', math: 'x + 2x + 3x = 180°', color: 'white' },
      { text: '6x = 180°, deci x = 30°', math: 'x = 30°', color: 'yellow' },
      { text: 'Unghiul cel mai mare: 3x = 90°', math: '3 \\times 30° = 90°', color: 'green' },
    ],
  },
  {
    id: 'tri-04', chapter: 'triunghiuri', difficulty: 2, points: 5,
    text: 'Aria unui triunghi cu baza b = 8 cm și înălțimea h = 5 cm este:',
    answer: '20',
    solution: [
      { text: 'Formula ariei triunghiului:', math: 'A = \\frac{b \\cdot h}{2}', color: 'white' },
      { text: 'A = (8 × 5) / 2 = 20 cm²', math: 'A = \\frac{8 \\times 5}{2} = 20 \\text{ cm}^2', color: 'green' },
    ],
  },
  {
    id: 'tri-05', chapter: 'triunghiuri', difficulty: 3, points: 5,
    text: 'Ipotenuza unui triunghi dreptunghic isoscel este de 10 cm. Calculează cata.',
    answer: '5√2',
    solution: [
      { text: 'La un triunghi dreptunghic isoscel, catele sunt egale: a = b.', color: 'white' },
      { text: 'Din Pitagora: a² + a² = 100, deci 2a² = 100, a² = 50', math: '2a^2 = 100 \\Rightarrow a^2 = 50', color: 'yellow' },
      { text: 'a = √50 = 5√2 cm', math: 'a = 5\\sqrt{2} \\text{ cm}', color: 'green' },
    ],
  },

  // ── PATRULATERE ──────────────────────────────────────────────────────────
  {
    id: 'pat-01', chapter: 'patrulatere', difficulty: 1, points: 5,
    text: 'Un dreptunghi are lungimea 8 cm și lățimea 5 cm. Calculează aria.',
    answer: '40',
    solution: [
      { text: 'Aria dreptunghiului:', math: 'A = l \\times L = 8 \\times 5 = 40 \\text{ cm}^2', color: 'green' },
    ],
  },
  {
    id: 'pat-02', chapter: 'patrulatere', difficulty: 1, points: 5,
    text: 'Un pătrat are diagonala de 6√2 cm. Calculează latura.',
    answer: '6',
    solution: [
      { text: 'Diagonala pătratului: d = a√2', math: 'd = a\\sqrt{2}', color: 'white' },
      { text: 'a = d / √2 = 6√2 / √2 = 6 cm', math: 'a = \\frac{6\\sqrt{2}}{\\sqrt{2}} = 6 \\text{ cm}', color: 'green' },
    ],
  },
  {
    id: 'pat-03', chapter: 'patrulatere', difficulty: 2, points: 5,
    text: 'Un romb are diagonalele d₁ = 6 cm și d₂ = 8 cm. Calculează aria.',
    answer: '24',
    solution: [
      { text: 'Aria rombului:', math: 'A = \\frac{d_1 \\times d_2}{2} = \\frac{6 \\times 8}{2} = 24 \\text{ cm}^2', color: 'green' },
    ],
  },
  {
    id: 'pat-04', chapter: 'patrulatere', difficulty: 2, points: 5,
    text: 'Un trapez are bazele B = 10 cm, b = 6 cm și înălțimea h = 4 cm. Calculează aria.',
    answer: '32',
    solution: [
      { text: 'Aria trapezului:', math: 'A = \\frac{(B+b) \\cdot h}{2} = \\frac{16 \\times 4}{2} = 32 \\text{ cm}^2', color: 'green' },
    ],
  },

  // ── CERC ────────────────────────────────────────────────────────────────
  {
    id: 'cerc-01', chapter: 'cerc', difficulty: 1, points: 5,
    text: 'Un cerc are raza r = 5 cm. Calculează lungimea cercului. (Lasă răspunsul cu π)',
    answer: '10π',
    solution: [
      { text: 'Lungimea cercului:', math: 'L = 2\\pi r = 2 \\times \\pi \\times 5 = 10\\pi \\text{ cm}', color: 'green' },
    ],
  },
  {
    id: 'cerc-02', chapter: 'cerc', difficulty: 1, points: 5,
    text: 'Un cerc are raza r = 4 cm. Calculează aria discului. (Lasă răspunsul cu π)',
    answer: '16π',
    solution: [
      { text: 'Aria discului:', math: 'A = \\pi r^2 = \\pi \\times 4^2 = 16\\pi \\text{ cm}^2', color: 'green' },
    ],
  },
  {
    id: 'cerc-03', chapter: 'cerc', difficulty: 2, points: 5,
    text: 'Un sector de cerc are raza 6 cm și unghiul la centru de 60°. Calculează aria sa. (cu π)',
    answer: '6π',
    solution: [
      { text: 'Aria sectorului:', math: 'A = \\frac{\\alpha}{360} \\times \\pi r^2 = \\frac{60}{360} \\times 36\\pi = 6\\pi \\text{ cm}^2', color: 'green' },
    ],
  },

  // ── CORPURI GEOMETRICE ───────────────────────────────────────────────────
  {
    id: 'corp-01', chapter: 'corpuri', difficulty: 1, points: 5,
    text: 'Un cub are muchia de 3 cm. Calculează volumul.',
    answer: '27',
    solution: [
      { text: 'Volumul cubului:', math: 'V = a^3 = 3^3 = 27 \\text{ cm}^3', color: 'green' },
    ],
  },
  {
    id: 'corp-02', chapter: 'corpuri', difficulty: 2, points: 5,
    text: 'Un paralelipiped dreptunghic are dimensiunile 4×3×5 cm. Calculează volumul.',
    answer: '60',
    solution: [
      { text: 'Volumul paralelipipedului:', math: 'V = l \\times L \\times h = 4 \\times 3 \\times 5 = 60 \\text{ cm}^3', color: 'green' },
    ],
  },
  {
    id: 'corp-03', chapter: 'corpuri', difficulty: 2, points: 5,
    text: 'O sferă are raza r = 3 cm. Calculează volumul. (cu π)',
    answer: '36π',
    solution: [
      { text: 'Volumul sferei:', math: 'V = \\frac{4}{3}\\pi r^3 = \\frac{4}{3} \\times \\pi \\times 27 = 36\\pi \\text{ cm}^3', color: 'green' },
    ],
  },
  {
    id: 'corp-04', chapter: 'corpuri', difficulty: 3, points: 5,
    text: 'Un cilindru are raza r = 2 cm și înălțimea h = 5 cm. Calculează volumul. (cu π)',
    answer: '20π',
    solution: [
      { text: 'Volumul cilindrului:', math: 'V = \\pi r^2 h = \\pi \\times 4 \\times 5 = 20\\pi \\text{ cm}^3', color: 'green' },
    ],
  },

  // ── TRIGONOMETRIE ────────────────────────────────────────────────────────
  {
    id: 'trig-01', chapter: 'trigonometrie', difficulty: 2, points: 5,
    text: 'Într-un triunghi dreptunghic, sin 30° = 1/2. Dacă ipotenuza este 10 cm, care este cateta opusă unghiului de 30°?',
    answer: '5',
    solution: [
      { text: 'sin 30° = cateta opusă / ipotenuza', math: '\\sin 30° = \\frac{CO}{10}', color: 'white' },
      { text: 'CO = 10 × sin 30° = 10 × 1/2 = 5 cm', math: 'CO = 10 \\times \\frac{1}{2} = 5 \\text{ cm}', color: 'green' },
    ],
  },
  {
    id: 'trig-02', chapter: 'trigonometrie', difficulty: 2, points: 5,
    text: 'Calculează: sin²30° + cos²30°.',
    answer: '1',
    solution: [
      { text: 'Relația fundamentală a trigonometriei:', math: '\\sin^2 \\alpha + \\cos^2 \\alpha = 1', color: 'white' },
      { text: 'Această relație este valabilă pentru orice unghi, inclusiv 30°.', color: 'yellow' },
      { text: 'Deci sin²30° + cos²30° = 1', math: '\\sin^2 30° + \\cos^2 30° = 1', color: 'green' },
    ],
  },
  {
    id: 'trig-03', chapter: 'trigonometrie', difficulty: 3, points: 5,
    text: 'Într-un triunghi dreptunghic, cateta alăturată unghiului A este 6 cm, ipotenuza 10 cm. Calculează cos A.',
    answer: '3/5',
    solution: [
      { text: 'cos A = cateta alăturată / ipotenuza', math: '\\cos A = \\frac{6}{10} = \\frac{3}{5}', color: 'green' },
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
    subjects: [
      {
        name: 'Subiectul I',
        description: 'Câte un punct pentru fiecare răspuns corect.',
        exercises: [
          { id: 'T1-S1-1', text: 'Calculează: (−3)² + |−5|.', math: '(-3)^2 + |-5|', answer: '14', points: 5 },
          { id: 'T1-S1-2', text: 'Fie A = {1, 2, 3} și B = {2, 3, 4}. Câte elemente are A ∪ B?', answer: '4', points: 5 },
          { id: 'T1-S1-3', text: 'Rezolvă: 5x − 3 = 12.', math: '5x - 3 = 12', answer: '3', points: 5 },
          { id: 'T1-S1-4', text: 'Care este probabilitatea de a extrage o bilă albă din 3 bile albe și 2 roșii?', answer: '3/5', points: 5 },
          { id: 'T1-S1-5', text: 'Un triunghi dreptunghic are catele 5 cm și 12 cm. Ipotenuza este:', answer: '13', points: 5 },
        ],
      },
      {
        name: 'Subiectul II',
        description: 'Exerciții de nivel mediu.',
        exercises: [
          { id: 'T1-S2-1', text: 'Progresia aritmetică 2, 5, 8, 11, ... al 8-lea termen este:', math: 'a_n = a_1 + (n-1)r', answer: '23', points: 10 },
          { id: 'T1-S2-2', text: 'Funcția f(x) = 2x² − 3x + 1. Calculează f(2).', math: 'f(x) = 2x^2 - 3x + 1', answer: '3', points: 10 },
          { id: 'T1-S2-3', text: 'Un dreptunghi are perimetrul 28 cm și lățimea 5 cm. Aria sa este:', answer: '45', points: 10 },
        ],
      },
      {
        name: 'Subiectul III',
        description: 'Probleme complexe.',
        exercises: [
          { id: 'T1-S3-1', text: 'Un cerc are aria 36π cm². Calculează raza cercului (în cm).', math: 'A = \\pi r^2 = 36\\pi', answer: '6', points: 15 },
          { id: 'T1-S3-2', text: 'Rezolvă ecuația: x² − 7x + 10 = 0. Suma soluțiilor este:', math: 'x^2 - 7x + 10 = 0', answer: '7', points: 15 },
          { id: 'T1-S3-3', text: 'Un paralelipiped are dimensiunile 2×3×h cm și volumul 30 cm³. Calculează h.', math: 'V = 2 \\times 3 \\times h = 30', answer: '5', points: 15 },
        ],
      },
    ],
  },

  {
    id: 'test-02',
    title: 'Simulare EN 2025 — Varianta 2',
    description: 'Test complet, nivel ușor-mediu. Recomandat pentru prima simulare.',
    totalPoints: 100,
    subjects: [
      {
        name: 'Subiectul I',
        description: 'Câte 5 puncte pentru fiecare răspuns corect.',
        exercises: [
          { id: 'T2-S1-1', text: 'Calculează: 3² − |−4| + 1.', math: '3^2 - |-4| + 1', answer: '6', points: 5 },
          { id: 'T2-S1-2', text: 'Fie A = {x ∈ ℕ | x ≤ 4}. Câte elemente are A?', answer: '5', points: 5 },
          { id: 'T2-S1-3', text: 'Rezolvă: 3(x + 2) = 15.', math: '3(x+2) = 15', answer: '3', points: 5 },
          { id: 'T2-S1-4', text: 'Progresia geometrică: 1, 3, 9, ... Al 5-lea termen este:', answer: '81', points: 5 },
          { id: 'T2-S1-5', text: 'Un pătrat are latura 7 cm. Aria sa este:', answer: '49', points: 5 },
        ],
      },
      {
        name: 'Subiectul II',
        description: 'Exerciții de nivel mediu.',
        exercises: [
          { id: 'T2-S2-1', text: 'Funcția f: ℝ → ℝ, f(x) = −x + 4. Calculează f(−2) + f(6).', math: 'f(x) = -x + 4', answer: '0', points: 10 },
          { id: 'T2-S2-2', text: 'Rezolvă sistemul: { x + y = 8, x − y = 2 }. Valoarea lui x + y este:', math: 'x+y=8,\\quad x-y=2', answer: '8', points: 10 },
          { id: 'T2-S2-3', text: 'Un cerc are raza r = 7 cm. Lungimea sa este (cu π):', math: 'L = 2\\pi r', answer: '14π', points: 10 },
        ],
      },
      {
        name: 'Subiectul III',
        description: 'Probleme complexe.',
        exercises: [
          { id: 'T2-S3-1', text: 'Într-un triunghi dreptunghic cu catete 8 și 15 cm, ipotenuza este:', math: 'c^2 = 8^2 + 15^2', answer: '17', points: 15 },
          { id: 'T2-S3-2', text: 'Ecuația x² − 5x + 6 = 0 are soluțiile x₁ și x₂. Produsul x₁·x₂ este:', math: 'x^2 - 5x + 6 = 0', answer: '6', points: 15 },
          { id: 'T2-S3-3', text: 'Un cub are aria totală 54 cm². Muchia cubului este:', math: '6a^2 = 54', answer: '3', points: 15 },
        ],
      },
    ],
  },
];

// ─── SEED FUNCTION ────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Starting seed...\n');

  // Exercises — batch write (Admin SDK: db.batch())
  console.log(`📝 Writing ${EXERCISES.length} exercises...`);
  const batchSize = 400;
  for (let i = 0; i < EXERCISES.length; i += batchSize) {
    const batch = db.batch();
    EXERCISES.slice(i, i + batchSize).forEach((ex) => {
      batch.set(db.collection('exercises').doc(ex.id), ex);
    });
    await batch.commit();
  }
  console.log('✅ Exercises written.\n');

  // Tests
  console.log(`🧪 Writing ${TESTS.length} tests...`);
  for (const test of TESTS) {
    await db.collection('tests').doc(test.id).set(test);
    console.log(`   ✓ ${test.title}`);
  }
  console.log('✅ Tests written.\n');

  console.log('🎉 Seed complete!');
  console.log(`   Exercises: ${EXERCISES.length}`);
  console.log(`   Tests: ${TESTS.length}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
