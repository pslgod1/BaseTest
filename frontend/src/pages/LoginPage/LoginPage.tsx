import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../api';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import PasswordInput from '../../components/PasswordInput/PasswordInput';
import styles from './LoginPage.module.css';

interface FormErrors {
  email?: string;
  password?: string;
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!email) errs.email = 'Введите email';
    else if (!validateEmail(email)) errs.email = 'Некорректный email';
    if (!password) errs.password = 'Введите пароль';
    else if (password.length < 6) errs.password = 'Минимум 6 символов';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res.data.success) {
        navigate(res.data.redirectUrl || '/');
      } else {
        setServerError(res.data.message || 'Неверный email или пароль');
      }
    } catch (err: any) {
      setServerError(
        err?.response?.data?.errorMessage || 'Неверный email или пароль'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.logoRow}>
            <img src="/logo.png" alt="Логотип" className={styles.logoImg} />
            <span className={styles.logoText}>Base<span>Test</span></span>
          </div>

          <h1 className={styles.title}>Вход в аккаунт</h1>
          <p className={styles.subtitle}>Введите данные для входа</p>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {serverError && (
              <div className={styles.errorBanner}>{serverError}</div>
            )}

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                placeholder="ваш@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                }}
                autoComplete="email"
              />
              {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
            </div>

            <div className={styles.fieldGroup}>
              <PasswordInput
                label="Пароль"
                value={password}
                onChange={(v) => {
                  setPassword(v);
                  if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                }}
                error={errors.password}
                placeholder="••••••••"
              />
              <Link to="/forgot-password" className={styles.forgotLink}>
                Забыли пароль?
              </Link>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : null}
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className={styles.divider} style={{ marginTop: 20 }}>
            <span className={styles.registerLink}>
              Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
            </span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
