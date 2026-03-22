import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Eye, EyeOff, Check } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../contexts';
import { notify } from '../ui/notify';
import styles from './AuthForm.module.css';

const schema = z.object({
  email:    z.string().email('E-mail invalid'),
  password: z.string().min(6, 'Minim 6 caractere'),
});

const wrap = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.02 } },
};
const rand = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};
const err = {
  initial: { opacity: 0, y: -4 },
  animate: { opacity: 1, y:  0, transition: { duration: 0.15 } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.12 } },
};

export default function LoginForm({ onSwitch }) {
  const { login, resetPassword } = useAuth();
  const [arataPw, setAr]  = useState(false);
  const [tremura, setTr]  = useState(false);
  const [trimiteReset, setTrimiteReset] = useState(false);
  const passwordInputRef  = useRef(null);

  const {
    register,
    getValues,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    shouldFocusError: true,
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
    } catch {
      notify.error('E-mail sau parolă incorectă. Mai încearcă.');
      setTr(true);
      setTimeout(() => setTr(false), 500);
    }
  };

  const handleResetPassword = async () => {
    const email = String(getValues('email') || '').trim();

    if (!email) {
      notify.error('Scrie adresa de e-mail si apoi cere resetarea parolei.');
      return;
    }

    const emailValid = await trigger('email');
    if (!emailValid) {
      notify.error('Adresa de e-mail nu este valida.');
      return;
    }

    try {
      setTrimiteReset(true);
      await resetPassword(email);
      notify.success('Am trimis emailul de resetare a parolei.');
    } catch {
      notify.error('Nu am putut trimite emailul de resetare. Verifica adresa si incearca din nou.');
    } finally {
      setTrimiteReset(false);
    }
  };

  const keepInputFocus = (event) => {
    event.preventDefault();
  };

  const togglePassword = () => {
    const input = passwordInputRef.current;
    const selectionStart = input?.selectionStart ?? null;
    const selectionEnd = input?.selectionEnd ?? null;

    setAr((value) => !value);

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

  const emailOk = dirtyFields.email    && !errors.email;
  const parolaOk = dirtyFields.password && !errors.password;
  const passwordField = register('password');

  return (
    <motion.form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      variants={wrap}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, x: -8, transition: { duration: 0.16 } }}
    >
      <div className={`${styles.fields} ${tremura ? styles.fieldShake : ''}`}>

        {/* E-mail */}
        <motion.div className={styles.field} variants={rand}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="l-email">E-mail</label>
            <AnimatePresence>
              {emailOk && (
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
          <input
            id="l-email"
            className={`${styles.input} ${errors.email ? styles.inputErr : ''} ${emailOk ? styles.inputOk : ''}`}
            type="email"
            placeholder="adresa@email.ro"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={Boolean(errors.email)}
            aria-describedby="l-email-err"
            {...register('email')}
          />
          <div className={styles.errorSlot}>
            <AnimatePresence>
              {errors.email && (
                <motion.span id="l-email-err" className={styles.errorText} {...err}>
                  {errors.email.message}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Parolă */}
        <motion.div className={styles.field} variants={rand}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="l-pw">Parolă</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AnimatePresence>
                {parolaOk && (
                  <motion.span className={styles.validIcon}
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1   }}
                    exit={{    opacity: 0, scale: 0.4 }}
                    transition={{ duration: 0.16 }}>
                    <Check size={10} />
                  </motion.span>
                )}
              </AnimatePresence>
              <button
                type="button"
                className={styles.forgotBtn}
                onClick={handleResetPassword}
                disabled={trimiteReset}
              >
                Ai uitat parola?
              </button>
            </div>
          </div>
          <div className={styles.inputWrap}>
            <input
              id="l-pw"
              className={`${styles.input} ${styles.inputHasSuffix} ${errors.password ? styles.inputErr : ''} ${parolaOk ? styles.inputOk : ''}`}
              type={arataPw ? 'text' : 'password'}
              placeholder="Parola ta"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby="l-pw-err"
              {...passwordField}
              ref={(node) => {
                passwordInputRef.current = node;
                passwordField.ref(node);
              }}
            />
            <button
              type="button"
              className={styles.pwToggle}
              tabIndex={-1}
              onPointerDown={keepInputFocus}
              onClick={togglePassword}
              aria-label={arataPw ? 'Ascunde parola' : 'Arată parola'}>
              {arataPw ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
          <div className={styles.errorSlot}>
            <AnimatePresence>
              {errors.password && (
                <motion.span id="l-pw-err" className={styles.errorText} {...err}>
                  {errors.password.message}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <motion.div variants={rand}>
        <Button type="submit" variant="primary" size="lg" fullWidth
          loading={isSubmitting} icon={<LogIn size={14} />} className={styles.submit}>
          Intră în cont
        </Button>
      </motion.div>

      <motion.p className={styles.footer} variants={rand}>
        <span className={styles.footerText}>Nu ai cont?</span>
        <button type="button" className={styles.switchBtn} onClick={onSwitch}>
          Înregistrează-te
        </button>
      </motion.p>
    </motion.form>
  );
}
