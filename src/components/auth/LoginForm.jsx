import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ChalkText from '../blackboard/ChalkText';
import Button from '../ui/Button';
import { loginUser } from '../../firebase/auth';
import useAuthStore from '../../store/authStore';
import { notify } from '../ui/Toast';
import styles from './AuthForm.module.css';

const schema = z.object({
  email:    z.string().email('Email invalid'),
  password: z.string().min(6, 'Minim 6 caractere'),
});

const LoginForm = () => {
  const navigate = useNavigate();
  const setUser  = useAuthStore((s) => s.setUser);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const cred = await loginUser(data);
      setUser(cred.user);
      navigate('/dashboard');
    } catch {
      notify.error('Email sau parolă incorectă.');
    }
  };

  return (
    <motion.form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

      <div className={styles.brand}>
        <span className={styles.sigma}>∑</span>
        <span className={styles.brandName}>EN·Math</span>
      </div>

      <div className={styles.heading}>
        <ChalkText color="yellow" size="2xl" glow>Bine ai revenit!</ChalkText>
        <ChalkText color="muted" size="sm">Continuă pregătirea pentru examen</ChalkText>
      </div>

      <div className={styles.fields}>
        {[
          { name: 'email',    type: 'email',    label: 'EMAIL',   ph: 'adresa@email.ro' },
          { name: 'password', type: 'password', label: 'PAROLĂ',  ph: '••••••••' },
        ].map((f) => (
          <div key={f.name} className={styles.field}>
            <label className={styles.label}><ChalkText size="xs" color="muted">{f.label}</ChalkText></label>
            <input className={`${styles.input} ${errors[f.name] ? styles.inputErr : ''}`}
              type={f.type} placeholder={f.ph} autoComplete="on" {...register(f.name)} />
            {errors[f.name] && <ChalkText size="xs" color="coral">{errors[f.name].message}</ChalkText>}
          </div>
        ))}
      </div>

      <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
        Intră în cont →
      </Button>

      <p className={styles.footer}>
        <ChalkText size="sm" color="muted">Nu ai cont?&nbsp;</ChalkText>
        <Link to="/register"><ChalkText size="sm" color="cyan">Înregistrează-te</ChalkText></Link>
      </p>
    </motion.form>
  );
};

export default LoginForm;
