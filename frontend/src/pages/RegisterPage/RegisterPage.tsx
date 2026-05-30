import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendRegistrationCode, verifyRegistration, resendVerificationCode } from '../../api';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import PasswordInput from '../../components/PasswordInput/PasswordInput';
import styles from './RegisterPage.module.css';

interface Step1Errors {
  name?: string;
  email?: string;
  password?: string;
  agreement?: string;
}

interface Step2Errors {
  code?: string;
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const CheckIcon = () => (
  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [step1Errors, setStep1Errors] = useState<Step1Errors>({});

  // Step 2
  const [registrationId, setRegistrationId] = useState('');
  const [code, setCode] = useState('');
  const [step2Errors, setStep2Errors] = useState<Step2Errors>({});

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const validateStep1 = (): boolean => {
    const errs: Step1Errors = {};
    if (!name.trim()) errs.name = 'Введите имя';
    if (!email) errs.email = 'Введите email';
    else if (!validateEmail(email)) errs.email = 'Некорректный email';
    if (!password) errs.password = 'Введите пароль';
    else if (password.length < 6) errs.password = 'Минимум 6 символов';
    if (!agreed) errs.agreement = 'Необходимо принять соглашение';
    setStep1Errors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validateStep1()) return;
    setLoading(true);
    try {
      const res = await sendRegistrationCode({ name, email, password });
      setRegistrationId(res.data.registrationId);
      setStep(2);
      startResendCooldown();
    } catch (err: any) {
      setServerError(err?.response?.data?.errorMessage || 'Ошибка регистрации. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!code.trim()) {
      setStep2Errors({ code: 'Введите код' });
      return;
    }
    setLoading(true);
    try {
      await verifyRegistration({ registrationId, code });
      navigate('/chooseTest');
    } catch (err: any) {
      setServerError(err?.response?.data?.errorMessage || 'Неверный код. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await resendVerificationCode(registrationId);
      startResendCooldown();
    } catch {
      setServerError('Не удалось отправить код повторно');
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

          {/* Steps indicator */}
          <div className={styles.steps}>
            <div className={`${styles.stepDot} ${step >= 1 ? styles.stepDotActive : ''} ${step > 1 ? styles.stepDotDone : ''}`}>
              {step > 1 ? <CheckIcon /> : '1'}
            </div>
            <div className={`${styles.stepLine} ${step > 1 ? styles.stepLineDone : ''}`} />
            <div className={`${styles.stepDot} ${step >= 2 ? styles.stepDotActive : ''}`}>
              2
            </div>
          </div>
          <div className={styles.stepsLabels}>
            <span className={`${styles.stepLabelItem} ${step === 1 ? styles.stepLabelItemActive : ''}`}>Данные</span>
            <span className={`${styles.stepLabelItem} ${step === 2 ? styles.stepLabelItemActive : ''}`}>Подтверждение</span>
          </div>

          {step === 1 ? (
            <>
              <h1 className={styles.title}>Создать аккаунт</h1>
              <p className={styles.subtitle}>Заполните данные для регистрации</p>

              <form className={styles.form} onSubmit={handleStep1Submit} noValidate>
                {serverError && <div className={styles.errorBanner}>{serverError}</div>}

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Имя</label>
                  <input
                    type="text"
                    className={`${styles.input} ${step1Errors.name ? styles.inputError : ''}`}
                    placeholder="Иван Иванов"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (step1Errors.name) setStep1Errors((p) => ({ ...p, name: undefined }));
                    }}
                    autoComplete="name"
                  />
                  {step1Errors.name && <span className={styles.fieldError}>{step1Errors.name}</span>}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    className={`${styles.input} ${step1Errors.email ? styles.inputError : ''}`}
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (step1Errors.email) setStep1Errors((p) => ({ ...p, email: undefined }));
                    }}
                    autoComplete="email"
                  />
                  {step1Errors.email && <span className={styles.fieldError}>{step1Errors.email}</span>}
                </div>

                <div className={styles.fieldGroup}>
                  <PasswordInput
                    label="Пароль"
                    value={password}
                    onChange={(v) => {
                      setPassword(v);
                      if (step1Errors.password) setStep1Errors((p) => ({ ...p, password: undefined }));
                    }}
                    error={step1Errors.password}
                    placeholder="Минимум 6 символов"
                    showStrength
                  />
                </div>

                {/* Agreement */}
                <div>
                  <label className={styles.agreement} onClick={() => {
                    setAgreed((a) => !a);
                    if (step1Errors.agreement) setStep1Errors((p) => ({ ...p, agreement: undefined }));
                  }}>
                    <div className={`${styles.checkbox} ${agreed ? styles.checkboxChecked : ''} ${step1Errors.agreement ? styles.checkboxError : ''}`}>
                      {agreed && <CheckIcon />}
                    </div>
                    <span className={styles.agreementText}>
                      Я принимаю{' '}
                      <a href="#" onClick={(e) => e.stopPropagation()}>Пользовательское соглашение</a>
                      {' '}и{' '}
                      <a href="#" onClick={(e) => e.stopPropagation()}>Политику конфиденциальности</a>
                    </span>
                  </label>
                  {step1Errors.agreement && (
                    <span className={styles.fieldError} style={{ marginTop: 4, display: 'block' }}>
                      {step1Errors.agreement}
                    </span>
                  )}
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? <span className={styles.spinner} /> : null}
                  {loading ? 'Отправка...' : 'Продолжить'}
                </button>
              </form>

              <div className={styles.loginLink}>
                Уже есть аккаунт? <Link to="/login">Войти</Link>
              </div>
            </>
          ) : (
            <>
              <h1 className={styles.title}>Подтверждение email</h1>
              <p className={styles.subtitle}>
                Код отправлен на{' '}
                <span className={styles.emailHighlight}>{email}</span>
              </p>

              <form className={styles.form} onSubmit={handleStep2Submit} noValidate>
                {serverError && <div className={styles.errorBanner}>{serverError}</div>}

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Код подтверждения</label>
                  <input
                    type="text"
                    className={`${styles.input} ${styles.codeInput} ${step2Errors.code ? styles.inputError : ''}`}
                    placeholder="000000"
                    value={code}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setCode(v);
                      if (step2Errors.code) setStep2Errors({});
                    }}
                    maxLength={6}
                    autoComplete="one-time-code"
                    autoFocus
                  />
                  {step2Errors.code && <span className={styles.fieldError}>{step2Errors.code}</span>}
                  <div className={styles.resendRow}>
                    <span>Не получили?</span>
                    <button
                      type="button"
                      className={styles.resendBtn}
                      onClick={handleResend}
                      disabled={resendCooldown > 0}
                    >
                      {resendCooldown > 0 ? `Повторить через ${resendCooldown}с` : 'Отправить повторно'}
                    </button>
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading || code.length < 6}>
                  {loading ? <span className={styles.spinner} /> : null}
                  {loading ? 'Проверка...' : 'Подтвердить'}
                </button>
              </form>

              <div className={styles.loginLink}>
                <button
                  style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => { setStep(1); setServerError(''); setCode(''); }}
                >
                  ← Изменить данные
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
