import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Eye, EyeOff, Check } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../contexts';
import { notify } from '../ui/notify';
import styles from './AuthForm.module.css';

const schema = z.object({
  name:            z.string().min(2, 'Introdu numele tău'),
  email:           z.string().email('E-mail invalid'),
  password:        z.string().min(6, 'Minim 6 caractere'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Parolele nu se potrivesc',
  path: ['confirmPassword'],
});

/* Puterea parolei */
const putereParola = (pw = '') => {
  if (!pw) return { scor: 0, eticheta: '', culoare: '' };
  let s = 0;
  if (pw.length >= 6)  s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) || /[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 14) s++;
  return [
    { eticheta: '',          culoare: '' },
    { eticheta: 'Slabă',     culoare: 'var(--neon-coral)' },
    { eticheta: 'Medie',     culoare: '#f59e0b'           },
    { eticheta: 'Bună',      culoare: '#4ade80'           },
    { eticheta: 'Puternică', culoare: 'var(--neon-cyan)'  },
  ][s];
};

const CAMPURI = [
  {
    nume: 'name', id: 'r-name', tip: 'text',
    eticheta: 'Nume complet', placeholder: 'Prenume și nume',
    autoComplete: 'name', esteParola: false,
  },
  {
    nume: 'email', id: 'r-email', tip: 'email',
    eticheta: 'E-mail', placeholder: 'adresa@email.ro',
    autoComplete: 'email', inputMode: 'email', autoCapitalize: 'none', spellCheck: false,
    esteParola: false,
  },
  {
    nume: 'password', id: 'r-pw', tip: 'password',
    eticheta: 'Parolă', placeholder: 'Minim 6 caractere',
    autoComplete: 'new-password',
    esteParola: true, cheieViz: 'pw', arataPutere: true,
  },
  {
    nume: 'confirmPassword', id: 'r-cpw', tip: 'password',
    eticheta: 'Confirmă parola', placeholder: 'Repetă parola',
    autoComplete: 'new-password',
    esteParola: true, cheieViz: 'cpw',
  },
];

const wrap = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.055, delayChildren: 0.02 } },
};
const rand = {
  hidden:  { opacity: 0, y: 7 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};
const err = {
  initial: { opacity: 0, y: -4 },
  animate: { opacity: 1, y:  0, transition: { duration: 0.14 } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.1  } },
};

export default function RegisterForm({ onSwitch }) {
  const { register: inregistreaza } = useAuth();
  const [vizibil, setViz] = useState({ pw: false, cpw: false });
  const passwordInputRefs = useRef({});

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    shouldFocusError: true,
  });

  const valoareParola = watch('password', '');
  const { scor, eticheta: etPutere, culoare } = putereParola(valoareParola);

  const onSubmit = async (data) => {
    try {
      await inregistreaza(data);
    } catch {
      notify.error('Înregistrarea a eșuat. Verifică datele și încearcă din nou.');
    }
  };

  const keepInputFocus = (event) => {
    event.preventDefault();
  };

  const togglePassword = (fieldKey) => {
    const input = passwordInputRefs.current[fieldKey];
    const selectionStart = input?.selectionStart ?? null;
    const selectionEnd = input?.selectionEnd ?? null;

    setViz((value) => ({ ...value, [fieldKey]: !value[fieldKey] }));

    requestAnimationFrame(() => {
      if (!input) return;

      input.focus({ preventScroll: true });

      if (typeof selectionStart === 'number' && typeof selectionEnd === 'number') {
        try {
          input.setSelectionRange(selectionStart, selectionEnd);
        } catch {
          // Some mobile browsers do not allow selection updates here.
        }
      }
    });
  };

  return (
    <motion.form
      className={`${styles.form} ${styles.formRegister}`}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      variants={wrap}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, x: 8, transition: { duration: 0.16 } }}
    >
      <div className={`${styles.fields} ${styles.fieldsGrid}`}>
        {CAMPURI.map((c) => {
          const eroare  = errors[c.nume];
          const eOk     = dirtyFields[c.nume] && !eroare;
          const tipReal = c.esteParola ? (vizibil[c.cheieViz] ? 'text' : 'password') : c.tip;
          const fieldRegistration = register(c.nume);

          return (
            <motion.div key={c.nume} className={styles.field} variants={rand}>

              <div className={styles.labelRow}>
                <label className={styles.label} htmlFor={c.id}>{c.eticheta}</label>
                <AnimatePresence>
                  {eOk && (
                    <motion.span className={styles.validIcon}
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1   }}
                      exit={{    opacity: 0, scale: 0.4 }}
                      transition={{ duration: 0.16 }}>
                      <Check size={10} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {c.esteParola ? (
                <div className={styles.inputWrap}>
                  <input
                    id={c.id}
                    className={`${styles.input} ${styles.inputHasSuffix} ${eroare ? styles.inputErr : ''} ${eOk ? styles.inputOk : ''}`}
                    type={tipReal}
                    placeholder={c.placeholder}
                    autoComplete={c.autoComplete}
                    aria-invalid={Boolean(eroare)}
                    aria-describedby={`${c.id}-err`}
                    {...fieldRegistration}
                    ref={(node) => {
                      passwordInputRefs.current[c.cheieViz] = node;
                      fieldRegistration.ref(node);
                    }}
                  />
                  <button
                    type="button"
                    className={styles.pwToggle}
                    tabIndex={-1}
                    onPointerDown={keepInputFocus}
                    onClick={() => togglePassword(c.cheieViz)}
                    aria-label={vizibil[c.cheieViz] ? 'Ascunde parola' : 'Arată parola'}>
                    {vizibil[c.cheieViz] ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              ) : (
                <input
                  id={c.id}
                  className={`${styles.input} ${eroare ? styles.inputErr : ''} ${eOk ? styles.inputOk : ''}`}
                  type={c.tip}
                  placeholder={c.placeholder}
                  autoComplete={c.autoComplete}
                  inputMode={c.inputMode}
                  autoCapitalize={c.autoCapitalize}
                  spellCheck={c.spellCheck}
                  aria-invalid={Boolean(eroare)}
                  aria-describedby={`${c.id}-err`}
                  {...fieldRegistration}
                />
              )}

              {/* Slot eroare — înălțime rezervată mereu */}
              <div className={styles.errorSlot}>
                <AnimatePresence>
                  {eroare && (
                    <motion.span id={`${c.id}-err`} className={styles.errorText} {...err}>
                      {eroare.message}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Slot putere parolă — înălțime rezervată mereu */}
              {c.arataPutere && (
                <div className={styles.strengthSlot}>
                  <AnimatePresence>
                    {valoareParola && (
                      <motion.div className={styles.strengthWrap}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{    opacity: 0 }}
                        transition={{ duration: 0.15 }}>
                        <div className={styles.strengthBars}>
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={styles.strengthBar}
                              style={{ background: i <= scor ? culoare : undefined }} />
                          ))}
                        </div>
                        <div className={styles.strengthMeta}>
                          <span className={styles.strengthHint}>Complexitate</span>
                          <span className={styles.strengthLabel} style={{ color: culoare }}>
                            {etPutere}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

            </motion.div>
          );
        })}
      </div>

      <motion.div variants={rand}>
        <Button type="submit" variant="primary" size="lg" fullWidth
          loading={isSubmitting} icon={<UserPlus size={14} />} className={styles.submit}>
          Creează cont
        </Button>
      </motion.div>

      <motion.p className={styles.footer} variants={rand}>
        <span className={styles.footerText}>Ai deja cont?</span>
        <button type="button" className={styles.switchBtn} onClick={onSwitch}>
          Conectează-te
        </button>
      </motion.p>
    </motion.form>
  );
}
