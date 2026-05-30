import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, verifyResetCode, resetPassword } from '../../api';
import Header from '../../components/Header/Header';
import styles from './ForgotPasswordPage.module.css';

type Step = 'email' | 'code' | 'password';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('email');

  // step 1
  const [email, setEmail] = useState('');

  // step 2
  const [resetId, setResetId] = useState('');
  const [code, setCode] = useState('');

  // step 3
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Step 1: отправить код на почту ───────────────────────────────
  const handleSendCode = async () => {
    setError('');
    if (!email.trim()) { setError('Введите email'); return; }
    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      // бэкенд возвращает resetId в теле или хедере — уточни под свой ответ
      // предполагаем что res.data содержит { resetId: string }
      setResetId((res.data as any).resetId ?? '');
      setStep('code');
    } catch (e: any) {
      setError(e.response?.data?.errorMessage ?? 'Ошибка. Проверьте email.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: проверить код ─────────────────────────────────────────
  const handleVerifyCode = async () => {
    setError('');
    if (code.trim().length < 4) { setError('Введите код из письма'); return; }
    setLoading(true);
    try {
      await verifyResetCode(resetId, code.trim());
      setStep('password');
    } catch (e: any) {
      setError(e.response?.data?.errorMessage ?? 'Неверный код.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: сохранить новый пароль ───────────────────────────────
  const handleResetPassword = async () => {
    setError('');
    if (newPassword.length < 6) { setError('Пароль должен быть не менее 6 символов'); return; }
    if (newPassword !== confirmPassword) { setError('Пароли не совпадают'); return; }
    setLoading(true);
    try {
      await resetPassword(resetId, newPassword);
      navigate('/login', { state: { passwordChanged: true } });
    } catch (e: any) {
      setError(e.response?.data?.errorMessage ?? 'Не удалось сменить пароль.');
    } finally {
      setLoading(false);
    }
  };

  const STEPS: { key: Step; label: string }[] = [
    { key: 'email',    label: 'Email'   },
    { key: 'code',     label: 'Код'     },
    { key: 'password', label: 'Пароль'  },
  ];

  const stepIndex = STEPS.findIndex(s => s.key === step);

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className={styles.card}>

          {/* Step indicator */}
          <div className={styles.stepper}>
            {STEPS.map((s, i) => (
              <div key={s.key} className={styles.stepperItem}>
                <div className={`${styles.stepDot} ${i < stepIndex ? styles.stepDone : ''} ${i === stepIndex ? styles.stepActive : ''}`}>
                  {i < stepIndex
                    ? <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    : <span>{i + 1}</span>
                  }
                </div>
                <span className={`${styles.stepLabel} ${i === stepIndex ? styles.stepLabelActive : ''}`}>{s.label}</span>
                {i < STEPS.length - 1 && (
                  <div className={`${styles.stepLine} ${i < stepIndex ? styles.stepLineDone : ''}`} />
                )}
              </div>
            ))}
          </div>

          {/* ── Step 1 ── */}
          {step === 'email' && (
            <div className={styles.body}>
              <h1 className={styles.title}>Восстановление пароля</h1>
              <p className={styles.subtitle}>Введите email, привязанный к аккаунту — мы отправим код для сброса пароля.</p>

              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                  className={styles.input}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendCode()}
                  autoFocus
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button className={styles.btnPrimary} onClick={handleSendCode} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : 'Отправить код'}
              </button>

              <p className={styles.hint}>
                Вспомнили пароль? <Link to="/login" className={styles.link}>Войти</Link>
              </p>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 'code' && (
            <div className={styles.body}>
              <h1 className={styles.title}>Введите код</h1>
              <p className={styles.subtitle}>
                Мы отправили код на <strong>{email}</strong>. Проверьте папку «Спам», если письмо не пришло.
              </p>

              <div className={styles.field}>
                <label className={styles.label}>Код из письма</label>
                <input
                  className={`${styles.input} ${styles.inputCode}`}
                  type="text"
                  placeholder="123456"
                  maxLength={8}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && handleVerifyCode()}
                  autoFocus
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button className={styles.btnPrimary} onClick={handleVerifyCode} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : 'Подтвердить'}
              </button>

              <button className={styles.btnBack} onClick={() => { setStep('email'); setError(''); setCode(''); }}>
                ← Изменить email
              </button>
            </div>
          )}

          {/* ── Step 3 ── */}
          {step === 'password' && (
            <div className={styles.body}>
              <h1 className={styles.title}>Новый пароль</h1>
              <p className={styles.subtitle}>Придумайте надёжный пароль — не менее 6 символов.</p>

              <div className={styles.field}>
                <label className={styles.label}>Новый пароль</label>
                <div className={styles.inputWrap}>
                  <input
                    className={styles.input}
                    type={showNew ? 'text' : 'password'}
                    placeholder="Минимум 6 символов"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    autoFocus
                  />
                  <button className={styles.eyeBtn} type="button" onClick={() => setShowNew(v => !v)} tabIndex={-1}>
                    {showNew
                      ? <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                      : <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    }
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Повторите пароль</label>
                <div className={styles.inputWrap}>
                  <input
                    className={`${styles.input} ${confirmPassword && confirmPassword !== newPassword ? styles.inputError : ''}`}
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Повторите пароль"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                  />
                  <button className={styles.eyeBtn} type="button" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                    {showConfirm
                      ? <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                      : <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    }
                  </button>
                </div>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button className={styles.btnPrimary} onClick={handleResetPassword} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : 'Сохранить пароль'}
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
