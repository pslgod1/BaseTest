import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdminUserTest } from '../../api';
import type { UserTestDTO } from '../../types';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './AdminResultPage.module.css';
import QuestionReview from "../../components/QuestionReview/QuestionReview.tsx";

const COMP_LABELS: Record<string, string> = {
  LITERACY:       'Грамотность',
  COMMUNICATIONS: 'Коммуникации',
  SAFETY:         'Безопасность',
  CONSUMPTION:    'Потребление',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function formatDuration(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const totalMin = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return totalMin > 0 ? `${totalMin} мин ${sec} сек` : `${sec} сек`;
}

function getScoreClass(pct: number) {
  if (pct >= 80) return styles.scoreHigh;
  if (pct >= 60) return styles.scoreMid;
  return styles.scoreLow;
}

function getBarClass(pct: number) {
  if (pct >= 70) return styles.compBarHigh;
  if (pct >= 40) return styles.compBarMid;
  return styles.compBarLow;
}

export default function AdminResultPage() {
  const { userTestId } = useParams<{ userTestId: string }>();
  const navigate = useNavigate();

  const [userTest, setUserTest] = useState<UserTestDTO | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!userTestId) return;
    getAdminUserTest(Number(userTestId))
      .then((r) => setUserTest(r.data))
      .catch((err) => {
        if (err.response?.status === 401) navigate('/login');
        else navigate('/admin');
      })
      .finally(() => setLoading(false));
  }, [userTestId, navigate]);

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.loading}>Загрузка результата...</div>
        <Footer />
      </div>
    );
  }

  if (!userTest) return null;

  const { test, answers, user, startAt, completedAt, percentage } = userTest;
  const pct      = Math.round(percentage ?? 0);
  const duration = completedAt ? formatDuration(startAt, completedAt) : '—';

  // Статистика по компетенциям
  const compStats = test.questions.reduce((acc, q) => {
    const ans = answers.find((a) => a.questionDTO.id === q.id);
    if (!acc[q.type]) acc[q.type] = { total: 0, correct: 0 };
    acc[q.type].total += 1;
    if (ans?.isCorrect) acc[q.type].correct += 1;
    return acc;
  }, {} as Record<string, { total: number; correct: number }>);

  const compResults = Object.entries(compStats).map(([key, s]) => ({
    key,
    label: COMP_LABELS[key] ?? key,
    pct:   Math.round((s.correct / s.total) * 100),
    correct: s.correct,
    total:   s.total,
  }));

  const correctTotal = answers.filter((a) => a.isCorrect).length;

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className={styles.inner}>

          {/* Back */}
          <button className={styles.backBtn} onClick={() => navigate('/admin')}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад в панель
          </button>

          {/* Header */}
          <div className={styles.headerSection}>
            <p className={styles.pageLabel}>Результат теста — просмотр администратора</p>
            <h1 className={styles.testTitle}>{test.title}</h1>
            <div className={styles.meta}>
              <span className={styles.metaItem}>👤 {user?.name ?? '—'}</span>
              <span className={styles.metaItem}>✉️ {user?.email ?? '—'}</span>
              {completedAt && (
                <span className={styles.metaItem}>📅 {formatDate(completedAt)}</span>
              )}
            </div>
          </div>

          {/* Score card */}
          <div className={styles.scoreCard}>
            <div className={`${styles.scoreCircle} ${getScoreClass(pct)}`}>
              <span className={styles.scoreNum}>{pct}</span>
              <span className={styles.scoreUnit}>%</span>
            </div>

            <div className={styles.scoreInfo}>
              <div className={styles.scoreLabel}>
                {pct >= 80 ? 'Отличный результат' : pct >= 60 ? 'Хороший результат' : 'Требует улучшения'}
              </div>
              <div className={styles.scoreSubLabel}>
                Правильных ответов: {correctTotal} из {test.questions.length}
              </div>
            </div>

            <div className={styles.scoreMeta}>
              <div className={styles.scoreMetaItem}>
                <span className={styles.scoreMetaLabel}>Начало</span>
                <span className={styles.scoreMetaValue}>
                  {startAt ? new Date(startAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '—'}
                </span>
              </div>
              <div className={styles.scoreMetaItem}>
                <span className={styles.scoreMetaLabel}>Время</span>
                <span className={styles.scoreMetaValue}>{duration}</span>
              </div>
              <div className={styles.scoreMetaItem}>
                <span className={styles.scoreMetaLabel}>Вопросов</span>
                <span className={styles.scoreMetaValue}>{test.questions.length}</span>
              </div>
            </div>
          </div>

          {/* Competency breakdown */}
          {compResults.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>По компетенциям</span>
              </div>
              <div className={styles.compGrid}>
                {compResults.map((c) => (
                  <div key={c.key} className={styles.compItem}>
                    <div className={styles.compHeader}>
                      <span className={styles.compName}>{c.label}</span>
                      <span className={styles.compScore}>{c.correct}/{c.total} ({c.pct}%)</span>
                    </div>
                    <div className={styles.compBarWrap}>
                      <div
                        className={`${styles.compBarFill} ${getBarClass(c.pct)}`}
                        style={{ width: `${c.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Answers breakdown */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Разбор ответов</span>
            </div>

              {answers.length === 0 ? (
                  <div className={styles.empty}>Ответы не найдены.</div>
              ) : (
                  <div style={{ padding: '16px' }}>
                      <QuestionReview questions={test.questions} answers={answers} />
                  </div>
              )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
