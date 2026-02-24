import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import ChalkText from '../blackboard/ChalkText';
import Button from '../ui/Button';
import { useAuth } from '../../contexts';
import { notify } from '../ui/notify';
import styles from './AuthForm.module.css';

const schema = z.object({
  email:    z.string().email('Email invalid'),
  password: z.string().min(6, 'Minim 6 caractere'),
});

const LoginForm = ({ onSwitch }) => {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
      /* Auth listener → isAuthenticated → Public guard redirects to /dashboard */
    } catch {
      notify.error('Email sau parolă incorectă.');
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
      <div className={styles.heading}>
        <ChalkText color="yellow" size="xl" glow>Bine ai revenit!</ChalkText>
        <ChalkText color="muted" size="sm">Continuă pregătirea pentru examen</ChalkText>
      </div>

      <div className={styles.fields}>
        {[
          { name: 'email',    type: 'email',    label: 'EMAIL',  ph: 'adresa@email.ro' },
          { name: 'password', type: 'password', label: 'PAROLĂ', ph: '••••••••' },
        ].map((f) => (
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
        Intră în cont →
      </Button>

      <p className={styles.footer}>
        <ChalkText size="sm" color="muted">Nu ai cont?&nbsp;</ChalkText>
        <button type="button" className={styles.switchBtn} onClick={onSwitch}>
          <ChalkText size="sm" color="cyan">Înregistrează-te</ChalkText>
        </button>
      </p>
    </motion.form>
  );
};

export default LoginForm;
