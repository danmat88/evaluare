import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
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
    label: 'Nume elev',
    placeholder: 'Prenume si nume',
    autoComplete: 'name',
  },
  {
    name: 'email',
    id: 'register-email',
    type: 'email',
    label: 'Email',
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
    label: 'Parola',
    placeholder: 'Minimum 6 caractere',
    autoComplete: 'new-password',
  },
  {
    name: 'confirmPassword',
    id: 'register-confirm-password',
    type: 'password',
    label: 'Confirma parola',
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
      className={`${styles.form} ${styles.formRegister}`}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.22 }}
    >
      <div className={`${styles.fields} ${styles.fieldsGrid}`}>
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

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={isSubmitting}
        icon={<UserPlus size={14} />}
        className={styles.submit}
      >
        Creeaza cont
      </Button>

      <p className={styles.footer}>
        <span className={styles.footerText}>Ai deja cont?</span>
        <button type="button" className={styles.switchBtn} onClick={onSwitch}>Conecteaza-te</button>
      </p>
    </motion.form>
  );
};

export default RegisterForm;
