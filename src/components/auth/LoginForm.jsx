import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../contexts';
import { notify } from '../ui/notify';
import styles from './AuthForm.module.css';

const schema = z.object({
  email: z.string().email('Email invalid'),
  password: z.string().min(6, 'Minim 6 caractere'),
});

const FIELDS = [
  {
    name: 'email',
    id: 'login-email',
    type: 'email',
    label: 'EMAIL',
    placeholder: 'adresa@email.ro',
    autoComplete: 'email',
    inputMode: 'email',
    autoCapitalize: 'none',
    spellCheck: false,
  },
  {
    name: 'password',
    id: 'login-password',
    type: 'password',
    label: 'PAROLA',
    placeholder: '********',
    autoComplete: 'current-password',
  },
];

const LoginForm = ({ onSwitch }) => {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    shouldFocusError: true,
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
      /* Auth listener -> isAuthenticated -> Public guard redirects to /dashboard */
    } catch {
      notify.error('Verifica emailul si parola, apoi incearca din nou.');
    }
  };

  return (
    <motion.form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.22 }}
    >
      <div className={styles.header}>
        <span className={styles.kicker}>Acces rapid</span>
        <p className={styles.subline}>
          Intri direct in dashboard si continui pregatirea de unde ai ramas.
        </p>
      </div>

      <div className={styles.fields}>
        {FIELDS.map((field) => {
          const error = errors[field.name];
          const errorId = `${field.id}-error`;

          return (
            <div key={field.name} className={styles.field}>
              <label className={styles.label} htmlFor={field.id}>{field.label}</label>
              <input
                id={field.id}
                className={`${styles.input} ${error ? styles.inputErr : ''}`}
                type={field.type}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                inputMode={field.inputMode}
                autoCapitalize={field.autoCapitalize}
                spellCheck={field.spellCheck}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                {...register(field.name)}
              />
              {error && (
                <span id={errorId} className={styles.errorText}>{error.message}</span>
              )}
            </div>
          );
        })}
      </div>

      <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting} icon={<LogIn size={14} />}>
        Intra in cont
      </Button>

      <p className={styles.footer}>
        <span className={styles.footerText}>Nu ai cont inca?</span>
        <button type="button" className={styles.switchBtn} onClick={onSwitch}>Inregistreaza-te</button>
      </p>
    </motion.form>
  );
};

export default LoginForm;
