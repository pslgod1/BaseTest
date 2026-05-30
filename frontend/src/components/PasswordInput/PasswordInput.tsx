import { useState } from 'react';
import styles from './PasswordInput.module.css';

interface Props {
  label: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  placeholder?: string;
  showStrength?: boolean;
}

function getStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

const strengthLabels = ['', 'Слабый', 'Средний', 'Хороший', 'Надёжный'];

export default function PasswordInput({ label, value, onChange, error, placeholder, showStrength }: Props) {
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? getStrength(value) : 0;

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputWrap}>
        <input
          type={visible ? 'text' : 'password'}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
        >
          {visible ? (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>

      {showStrength && value && (
        <div className={styles.strength}>
          <div className={styles.strengthBars}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`${styles.bar} ${i <= strength ? styles[`barActive${strength}` as keyof typeof styles] : ''}`}
              />
            ))}
          </div>
          <span className={`${styles.strengthLabel} ${styles[`label${strength}` as keyof typeof styles]}`}>
            {strengthLabels[strength]}
          </span>
        </div>
      )}

      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
