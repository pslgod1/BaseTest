import { useRef, useState } from 'react';
import type { UserTestDTO } from '../../types';
import styles from './Certificate.module.css';

interface Props {
  userTest: UserTestDTO;
}

const COMP_LABELS: Record<string, string> = {
  LITERACY:       'Цифровая грамотность',
  COMMUNICATIONS: 'Цифровые коммуникации',
  SAFETY:         'Цифровая безопасность',
  CONSUMPTION:    'Цифровое потребление',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function getCertId(userTestId: number) {
  return `DT-${String(userTestId).padStart(6, '0')}-${new Date().getFullYear()}`;
}

function getCompetency(userTest: UserTestDTO) {
  const type = userTest.test?.questions?.[0]?.type;
  return type ? (COMP_LABELS[type] ?? type) : 'Цифровые компетенции';
}

export default function CertificateDownload({ userTest }: Props) {
  const certRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const pct        = Math.round(userTest.percentage ?? 0);
  const name       = userTest.user?.name ?? 'Участник';
  const testTitle  = userTest.test?.title ?? 'Тест';
  const competency = getCompetency(userTest);
  const dateStr    = userTest.completedAt ? formatDate(userTest.completedAt) : formatDate(new Date().toISOString());
  const certId     = getCertId(userTest.id);

  const handleDownload = async () => {
    if (!certRef.current) return;
    setLoading(true);

    try {
      // Динамически загружаем html2canvas только при скачивании
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 900,
        height: 636,
      });

      const link = document.createElement('a');
      link.download = `Сертификат_${name.replace(/\s+/g, '_')}_${testTitle.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Ошибка при генерации сертификата:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Кнопка скачивания */}
      <button
        className={styles.downloadBtn}
        onClick={handleDownload}
        disabled={loading}
      >
        {loading ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: 'spin 0.8s linear infinite' }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
            </svg>
            Генерация...
          </>
        ) : (
          <>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Скачать сертификат
          </>
        )}
      </button>

      {/* Скрытый сертификат для рендера */}
      <div className={styles.canvasWrap}>
        <div ref={certRef} className={styles.cert}>

          {/* Левая панель */}
          <div className={styles.certLeft}>
            <div className={styles.certLogoWrap}>
              <img src="/logo.png" alt="BaseTest" className={styles.certLogoImg} />
              <span className={styles.certLogoText}>BaseTest</span>
            </div>
            <div className={styles.certLeftScore}>
              <span className={styles.certScoreNum}>{pct}</span>
              <span className={styles.certScoreUnit}>%</span>
            </div>
            <span className={styles.certLeftLabel}>Результат</span>
          </div>

          {/* Акцентная вертикальная линия */}
          <div className={styles.certAccent} />

          {/* Правая часть */}
          <div className={styles.certRight}>
            <div>
              <div className={styles.certTag}>Сертификат о прохождении</div>
              <div className={styles.certTitle}>Настоящий сертификат подтверждает, что</div>
              <div className={styles.certName}>{name}</div>
              <div className={styles.certDesc}>
                успешно прошёл(а) тестирование по направлению{' '}
                <strong>«{competency}»</strong> в рамках программы оценки базовых цифровых компетенций платформы <strong>BaseTest</strong>.
              </div>

              <div className={styles.certMeta}>
                <div className={styles.certMetaItem}>
                  <span className={styles.certMetaLabel}>Тест</span>
                  <span className={styles.certMetaValue}>{testTitle}</span>
                </div>
                <div className={styles.certMetaItem}>
                  <span className={styles.certMetaLabel}>Дата</span>
                  <span className={styles.certMetaValue}>{dateStr}</span>
                </div>
                <div className={styles.certMetaItem}>
                  <span className={styles.certMetaLabel}>Результат</span>
                  <span className={styles.certMetaValue}>{pct}%</span>
                </div>
              </div>
            </div>

            <div className={styles.certFooter}>
              <span className={styles.certFooterLeft}>basetest.ru</span>
              <span className={styles.certId}>{certId}</span>
            </div>
          </div>

          {/* Декоративные точки */}
          <div className={styles.certDots}>
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className={styles.certDot} />
            ))}
          </div>

        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
