import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, verifyResetCode, resetPassword } from '../../api';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import PasswordInput from '../../components/PasswordInput/PasswordInput';
import styles from './ForgotPasswordPage.module.css';

type Step = 'email' | 'code' | 'password';

const CheckIcon = () => (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

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
        const [showConfirm, setShowConfirm] = useState(false);

        const [loading, setLoading] = useState(false);
        const [error, setError] = useState('');

        const [resendCooldown, setResendCooldown] = useState(0);

        const STEPS: { key: Step; label: string }[] = [
        { key: 'email',    label: 'Email'   },
        { key: 'code',     label: 'Код'     },
        { key: 'password', label: 'Пароль'  },
        ];

        const stepIndex = STEPS.findIndex(s => s.key === step);

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
            await forgotPassword(email.trim());
            startResendCooldown();
        } catch {
            setError('Не удалось отправить код повторно');
        }
        };

        // ── Step 1: отправить код на почту ───────────────────────────────
        const handleSendCode = async (e: React.FormEvent) => {
            e.preventDefault();
            setError('');
            if (!email.trim()) { setError('Введите email'); return; }
            setLoading(true);
            try {
            const res = await forgotPassword(email.trim());
            setResetId((res.data as any).resetId ?? '');
            setStep('code');
            startResendCooldown();
        } catch (e: any) {
            setError(e.response?.data?.errorMessage ?? 'Ошибка. Проверьте email.');
        } finally {
            setLoading(false);
        }
        };

        // ── Step 2: проверить код ─────────────────────────────────────────
        const handleVerifyCode = async (e: React.FormEvent) => {
            e.preventDefault();
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
        const handleResetPassword = async (e: React.FormEvent) => {
            e.preventDefault();
            setError('');
            if (newPassword.length < 6) { setError('Пароль должен быть не менее 6 символов'); return; }
            if (newPassword !== confirmPassword) { setError('Пароли не совпадают'); return; }
            setLoading(true);
            try {
            await resetPassword(resetId, newPassword, confirmPassword);
            navigate('/login', { state: { passwordChanged: true } });
        } catch (e: any) {
            setError(e.response?.data?.errorMessage ?? 'Не удалось сменить пароль.');
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

                    {/* Steps indicator */}
                    <div className={styles.steps}>
                        <div className={`${styles.stepDot} ${stepIndex >= 0 ? styles.stepDotActive : ''} ${stepIndex > 0 ? styles.stepDotDone : ''}`}>
                            {stepIndex > 0 ? <CheckIcon /> : '1'}
                        </div>
                        <div className={`${styles.stepLine} ${stepIndex > 0 ? styles.stepLineDone : ''}`} />
                        <div className={`${styles.stepDot} ${stepIndex >= 1 ? styles.stepDotActive : ''} ${stepIndex > 1 ? styles.stepDotDone : ''}`}>
                            {stepIndex > 1 ? <CheckIcon /> : '2'}
                        </div>
                        <div className={`${styles.stepLine} ${stepIndex > 1 ? styles.stepLineDone : ''}`} />
                        <div className={`${styles.stepDot} ${stepIndex >= 2 ? styles.stepDotActive : ''}`}>
                            3
                        </div>
                    </div>
                    <div className={styles.stepsLabels}>
                        <span className={`${styles.stepLabelItem} ${stepIndex === 0 ? styles.stepLabelItemActive : ''}`}>Email</span>
                        <span className={`${styles.stepLabelItem} ${stepIndex === 1 ? styles.stepLabelItemActive : ''}`}>Код</span>
                        <span className={`${styles.stepLabelItem} ${stepIndex === 2 ? styles.stepLabelItemActive : ''}`}>Пароль</span>
                    </div>

                    {/* ── Step 1 ── */}
                    {step === 'email' && (
                        <>
                            <h1 className={styles.title}>Восстановление пароля</h1>
                            <p className={styles.subtitle}>Введите email, привязанный к аккаунту — мы отправим код для сброса пароля.</p>

                            <form className={styles.form} onSubmit={handleSendCode} noValidate>
                                {error && <div className={styles.errorBanner}>{error}</div>}

                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Email</label>
                                    <input
                                        type="email"
                                        className={`${styles.input} ${error && !email.trim() ? styles.inputError : ''}`}
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                        autoComplete="email"
                                        autoFocus
                                    />
                                </div>

                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? <span className={styles.spinner} /> : null}
                                    {loading ? 'Отправка...' : 'Отправить код'}
                                </button>
                            </form>

                            <div className={styles.loginLink}>
                                Вспомнили пароль? <Link to="/login">Войти</Link>
                            </div>
                        </>
                    )}

                    {/* ── Step 2 ── */}
                    {step === 'code' && (
                        <>
                            <h1 className={styles.title}>Введите код</h1>
                            <p className={styles.subtitle}>
                                Мы отправили код на <span className={styles.emailHighlight}>{email}</span>. Проверьте папку «Спам», если письмо не пришло.
                            </p>

                            <form className={styles.form} onSubmit={handleVerifyCode} noValidate>
                                {error && <div className={styles.errorBanner}>{error}</div>}

                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Код из письма</label>
                                    <input
                                        type="text"
                                        className={`${styles.input} ${styles.codeInput} ${error && !code.trim() ? styles.inputError : ''}`}
                                        placeholder="000000"
                                        value={code}
                                        onChange={(e) => {
                                            const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setCode(v);
                                            if (error) setError('');
                                        }}
                                        maxLength={6}
                                        autoComplete="one-time-code"
                                        autoFocus
                                    />
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

                                <button type="submit" className={styles.submitBtn} disabled={loading || code.length < 4}>
                                    {loading ? <span className={styles.spinner} /> : null}
                                    {loading ? 'Проверка...' : 'Подтвердить'}
                                </button>
                            </form>

                            <div className={styles.loginLink}>
                                <button
                                    style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                                    onClick={() => { setStep('email'); setError(''); setCode(''); }}
                                >
                                    ← Изменить email
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── Step 3 ── */}
                    {step === 'password' && (
                        <>
                            <h1 className={styles.title}>Новый пароль</h1>
                            <p className={styles.subtitle}>Придумайте надёжный пароль — не менее 6 символов.</p>

                            <form className={styles.form} onSubmit={handleResetPassword} noValidate>
                                {error && <div className={styles.errorBanner}>{error}</div>}

                                <div className={styles.fieldGroup}>
                                    <PasswordInput
                                        label="Новый пароль"
                                        value={newPassword}
                                        onChange={(v) => { setNewPassword(v); if (error) setError(''); }}
                                        error={error && newPassword.length < 6 ? error : undefined}
                                        placeholder="Минимум 6 символов"
                                        showStrength
                                    />
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Повторите пароль</label>
                                    <div className={styles.inputWrap}>
                                        <input
                                            className={`${styles.input} ${confirmPassword && confirmPassword !== newPassword ? styles.inputError : ''}`}
                                            type={showConfirm ? 'text' : 'password'}
                                            placeholder="Повторите пароль"
                                            value={confirmPassword}
                                            onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(''); }}
                                            autoComplete="new-password"
                                        />
                                        <button className={styles.eyeBtn} type="button" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                                            {showConfirm
                                                ? <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                                                : <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                            }
                                        </button>
                                    </div>
                                    {confirmPassword && confirmPassword !== newPassword && (
                                        <span className={styles.fieldError}>Пароли не совпадают</span>
                                    )}
                                </div>

                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? <span className={styles.spinner} /> : null}
                                    {loading ? 'Сохранение...' : 'Сохранить пароль'}
                                </button>
                            </form>

                            <div className={styles.loginLink}>
                                <button
                                    style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                                    onClick={() => { setStep('code'); setError(''); setConfirmPassword(''); }}
                                >
                                    ← Назад к коду
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