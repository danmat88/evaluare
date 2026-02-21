import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import ChalkText from '../blackboard/ChalkText';
import Button from '../ui/Button';
import { useAuth } from '../../contexts';
import { notify } from '../ui/Toast';
import styles from './AuthForm.module.css';

const schema = z.object({
  name:            z.string().min(2, 'Introdu numele'),
  email:           z.string().email('Email invalid'),
  password:        z.string().min(6, 'Minim 6 caractere'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Parolele nu se potrivesc', path: ['confirmPassword'],
});

const FIELDS = [
  { name: 'name',            type: 'text',     label: 'NUME',            ph: 'Prenume și Nume' },
  { name: 'email',           type: 'email',    label: 'EMAIL',           ph: 'adresa@email.ro' },
  { name: 'password',        type: 'password', label: 'PAROLĂ',          ph: '••••••••' },
  { name: 'confirmPassword', type: 'password', label: 'CONFIRMĂ PAROLA', ph: '••••••••' },
];

const RegisterForm = ({ onSwitch }) => {
  const { register: registerUser } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      /* AuthContext.register sets user+profile → isAuthenticated → Public guard redirects */
    } catch {
      notify.error('Înregistrarea a eșuat. Încearcă din nou.');
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
        <ChalkText color="yellow" size="xl" glow>Hai la tablă!</ChalkText>
        <ChalkText color="muted" size="sm">Cont gratuit, progres nelimitat</ChalkText>
      </div>

      <div className={styles.fields}>
        {FIELDS.map((f) => (
          <div key={f.name} className={styles.field}>
            <label className={styles.label}>
              <ChalkText size="xs" color="muted">{f.label}</ChalkText>
            </label>
            <input
              className={`${styles.input} ${errors[f.name] ? styles.inputErr : ''}`}
              type={f.type}
              placeholder={f.ph}
              autoComplete="on"
              {...register(f.name)}
            />
            {errors[f.name] && (
              <ChalkText size="xs" color="coral">{errors[f.name].message}</ChalkText>
            )}
          </div>
        ))}
      </div>

      <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
        Creează cont →
      </Button>

      <p className={styles.footer}>
        <ChalkText size="sm" color="muted">Ai deja cont?&nbsp;</ChalkText>
        <button type="button" className={styles.switchBtn} onClick={onSwitch}>
          <ChalkText size="sm" color="cyan">Conectează-te</ChalkText>
        </button>
      </p>
    </motion.form>
  );
};

export default RegisterForm;
