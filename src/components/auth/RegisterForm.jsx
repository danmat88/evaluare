import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import ChalkText from '../blackboard/ChalkText';
import Button from '../ui/Button';
import { useAuth } from '../../contexts';
import { notify } from '../ui/notify';
import styles from './AuthForm.module.css';

const schema = z.object({
  name: z.string().min(2, 'Introdu numele'),
  email: z.string().email('Email invalid'),
  password: z.string().min(6, 'Minim 6 caractere'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Parolele nu se potrivesc',
  path: ['confirmPassword'],
});

const FIELDS = [
  {
    name: 'name',
    id: 'register-name',
    type: 'text',
    label: 'NUME',
    placeholder: 'Prenume si nume',
    autoComplete: 'name',
  },
  {
    name: 'email',
    id: 'register-email',
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
    id: 'register-password',
    type: 'password',
    label: 'PAROLA',
    placeholder: 'Minimum 6 caractere',
    autoComplete: 'new-password',
  },
  {
    name: 'confirmPassword',
    id: 'register-confirm-password',
    type: 'password',
    label: 'CONFIRMA PAROLA',
    placeholder: 'Repeta parola',
    autoComplete: 'new-password',
  },
];

const RegisterForm = ({ onSwitch }) => {
  const { register: registerUser } = useAuth();
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
      await registerUser(data);
      /* AuthContext.register sets user+profile -> isAuthenticated -> Public guard redirects */
    } catch {
      notify.error('Inregistrarea a esuat. Verifica datele si incearca din nou.');
    }
  };

  return (
    <motion.form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.22 }}
    >
      <div className={styles.heading}>
        <ChalkText color="yellow" size="xl" glow>Hai la tabla!</ChalkText>
        <ChalkText color="muted" size="sm">Cont gratuit, progres nelimitat</ChalkText>
      </div>

      <div className={styles.fields}>
        {FIELDS.map((field) => {
          const error = errors[field.name];
          const errorId = `${field.id}-error`;

          return (
            <div key={field.name} className={styles.field}>
              <label className={styles.label} htmlFor={field.id}>
                <ChalkText size="xs" color="muted">{field.label}</ChalkText>
              </label>
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
                <ChalkText as="span" id={errorId} size="xs" color="coral">
                  {error.message}
                </ChalkText>
              )}
            </div>
          );
        })}
      </div>

      <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting} icon={<UserPlus size={14} />}>
        Creeaza cont
      </Button>

      <p className={styles.footer}>
        <ChalkText size="sm" color="muted">Ai deja cont.&nbsp;</ChalkText>
        <button type="button" className={styles.switchBtn} onClick={onSwitch}>
          <ChalkText size="sm" color="cyan">Conecteaza-te</ChalkText>
        </button>
      </p>
    </motion.form>
  );
};

export default RegisterForm;
