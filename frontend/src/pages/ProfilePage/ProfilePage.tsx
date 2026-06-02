import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getMe, getUserTests, createUserTestAttempt } from '../../api';
import type { UserDTO, UserTestDTO } from '../../types';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './ProfilePage.module.css';


function getScoreClass(pct: number) {
    if (pct >= 80) return 'high';
    if (pct >= 50) return 'mid';
    return 'low';
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('ru-RU', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

function formatDuration(start: string, end: string) {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const totalMin = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    if (totalMin === 0) return `${sec} сек`;
    return `${totalMin} мин ${sec} сек`;
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserDTO | null>(null);
    const [tests, setTests] = useState<UserTestDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [retrying, setRetrying] = useState<number | null>(null);

    useEffect(() => {
        getMe()
            .then((res) => {
                setUser(res.data);
                return getUserTests();
            })
            .then((res) => {
                // сортируем: незавершённые вверх, затем по дате убыванию
                const sorted = [...res.data].sort((a, b) => {
                    if (!a.completedAt && b.completedAt) return -1;
                    if (a.completedAt && !b.completedAt) return 1;
                    return new Date(b.startAt).getTime() - new Date(a.startAt).getTime();
                });
                setTests(sorted);
            })
            .catch((err) => {
                if (err.response?.status === 401) navigate('/login');
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    const handleRetry = async (testId: number) => {
        setRetrying(testId);
        try {
            const { data } = await createUserTestAttempt(testId);
            navigate(`/test/${data.id}`);
        } catch {
            // ignore
        } finally {
            setRetrying(null);
        }
    };

    const completed = tests.filter((t) => t.completedAt);
    const inProgress = tests.filter((t) => !t.completedAt);

    const avgScore = completed.length
        ? Math.round(completed.reduce((acc, t) => acc + (t.percentage ?? 0), 0) / completed.length)
        : null;

    const bestScore = completed.length
        ? Math.round(Math.max(...completed.map((t) => t.percentage ?? 0)))
        : null;

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.main}>
                <div className={styles.inner}>

                    {/* ── Top ── */}
                    <div className={styles.topRow}>
                        <div>
                            <p className={styles.pageLabel}>Личный кабинет</p>
                            <h1 className={styles.pageTitle}>
                                {user ? `Привет, ${user.name}` : 'Мои результаты'}
                            </h1>
                        </div>
                        <Link to="/chooseTest" className={styles.btnNew}>
                            Пройти тест
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    </div>

                    {/* ── Stats row ── */}
                    {!loading && completed.length > 0 && (
                        <div className={styles.statsRow}>
                            <div className={styles.statCard}>
                                <span className={styles.statNum}>{completed.length}</span>
                                <span className={styles.statLabel}>Завершено тестов</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statNum}>{avgScore}%</span>
                                <span className={styles.statLabel}>Средний результат</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statNum}>{bestScore}%</span>
                                <span className={styles.statLabel}>Лучший результат</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statNum}>{inProgress.length}</span>
                                <span className={styles.statLabel}>Незавершённых</span>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className={styles.loadingWrap}>
                            <span className={styles.spinner} />
                            <span>Загрузка результатов...</span>
                        </div>
                    )}

                    {!loading && tests.length === 0 && (
                        <div className={styles.empty}>
                            <div className={styles.emptyIcon}>📋</div>
                            <p className={styles.emptyTitle}>Вы ещё не проходили тесты</p>
                            <p className={styles.emptyDesc}>Выберите компетенцию и проверьте свои знания</p>
                            <Link to="/chooseTest" className={styles.btnNew} style={{ marginTop: 16 }}>
                                Выбрать тест →
                            </Link>
                        </div>
                    )}

                    {/* ── In progress ── */}
                    {!loading && inProgress.length > 0 && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.dotYellow} />
                                Незавершённые
                            </h2>
                            <div className={styles.list}>
                                {inProgress.map((t) => (
                                    <div key={t.id} className={styles.card}>
                                        <div className={styles.cardLeft}>
                                            <div className={styles.cardTitle}>{t.test.title}</div>
                                            <div className={styles.cardMeta}>
                                                Начат {formatDate(t.startAt)}
                                                &nbsp;·&nbsp;
                                                {t.answers?.length ?? 0} из {t.test.questions.length} вопросов
                                            </div>
                                        </div>
                                        <div className={styles.cardRight}>
                                            <button
                                                className={styles.btnContinue}
                                                onClick={() => navigate(`/test/${t.id}`)}
                                            >
                                                Продолжить →
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ── Completed ── */}
                    {!loading && completed.length > 0 && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.dotGreen} />
                                Завершённые
                            </h2>
                            <div className={styles.list}>
                                {completed.map((t) => {
                                    const pct = Math.round(t.percentage ?? 0);
                                    const scoreClass = getScoreClass(pct);
                                    const isOpen = expanded === t.id;
                                    const correct = t.answers?.filter((a) => a.isCorrect).length ?? 0;
                                    const total = t.answers?.length ?? 0;

                                    return (
                                        <div key={t.id} className={styles.card}>
                                            <div
                                                className={styles.cardMain}
                                                onClick={() => setExpanded(isOpen ? null : t.id)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className={styles.cardLeft}>
                                                    <div className={styles.cardTitle}>{t.test.title}</div>
                                                    <div className={styles.cardMeta}>
                                                        {formatDate(t.completedAt!)}
                                                        &nbsp;·&nbsp;
                                                        {formatDuration(t.startAt, t.completedAt!)}
                                                        &nbsp;·&nbsp;
                                                        {correct}/{total} правильных
                                                    </div>
                                                </div>
                                                <div className={styles.cardRight}>
                          <span className={`${styles.badge} ${styles[`badge_${scoreClass}`]}`}>
                            {pct}%
                          </span>
                                                    <span className={styles.chevron} style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </span>
                                                </div>
                                            </div>

                                            {/* Expanded detail */}
                                            {isOpen && (
                                                <div className={styles.detail}>
                                                    {/* Score bar */}
                                                    <div className={styles.scoreBarWrap}>
                                                        <div className={styles.scoreBarTrack}>
                                                            <div
                                                                className={`${styles.scoreBarFill} ${styles[`fill_${scoreClass}`]}`}
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                        <span className={styles.scoreBarLabel}>{pct}%</span>
                                                    </div>

                                                    {/* Answers list */}
                                                    <div className={styles.answersList}>
                                                        {t.answers?.map((a, i) => (
                                                            <div
                                                                key={a.id}
                                                                className={`${styles.answerRow} ${a.isCorrect ? styles.answerCorrect : styles.answerWrong}`}
                                                            >
                                                                <span className={styles.answerNum}>{i + 1}</span>
                                                                <span className={styles.answerQ}>{a.questionDTO.question}</span>
                                                                <span className={styles.answerIcon}>{a.isCorrect ? '✓' : '✗'}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className={styles.detailActions}>
                                                        <button
                                                            className={styles.btnRetry}
                                                            disabled={retrying === t.test.id}
                                                            onClick={() => handleRetry(t.test.id)}
                                                        >
                                                            {retrying === t.test.id ? <span className={styles.spinnerSm} /> : 'Пройти ещё раз'}
                                                        </button>

                                                        <Link to={`/result/${t.id}`} className={styles.btnDetail}>
                                                            Подробный результат
                                                        </Link>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                </div>
            </main>

            <Footer />
        </div>
    );
}