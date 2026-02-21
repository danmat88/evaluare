import { Toaster, toast } from 'react-hot-toast';
import styles from './Toast.module.css';

export const ToastProvider = () => (
  <Toaster position="top-right" toastOptions={{
    duration: 2800,
    className: styles.toast,
    success: { className: `${styles.toast} ${styles.success}` },
    error:   { className: `${styles.toast} ${styles.error}` },
  }} />
);

export const notify = {
  success: (msg) => toast.success(msg),
  error:   (msg) => toast.error(msg),
  info:    (msg) => toast(msg),
};

export default ToastProvider;
