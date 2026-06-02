import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getUserTest, createUserTestAttempt } from '../../api';
import type { UserTestDTO } from '../../types';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './ResultPage.module.css';
import CertificateDownload from "../../components/Certificate/Certificate.tsx";
import QuestionReview from "../../components/QuestionReview/QuestionReview.tsx";

const COMPETENCY_LABELS: Record<string, string> = {
    LITERACY: 'Грамотность',
    COMMUNICATIONS: 'Коммуникации',
    SAFETY: 'Безопасность',
    CONSUMPTION: 'Потребление',
};

function getScoreClass(pct: number) {
    if (pct >= 80) return 'high';
    if (pct >= 60) return 'mid';
    return 'low';
}

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

export default function ResultPage() {
    const { userTestId } = useParams<{ userTestId: string }>();
    const navigate = useNavigate();

    const [userTest, setUserTest] = useState<UserTestDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [retrying, setRetrying] = useState(false);

    useEffect(() => {
        if (!userTestId) return;

        getUserTest(Number(userTestId))
            .then((res) => setUserTest(res.data))
            .catch((err) => {
                if (err.response?.status === 401) navigate('/login');
                else navigate('/dashboard');
            })
            .finally(() => setLoading(false));
    }, [userTestId, navigate]);

    const handleRetry = async () => {
        if (!userTest) return;
        setRetrying(true);
        try {
            const { data } = await createUserTestAttempt(userTest.test.id);
            navigate(`/test/${data.id}`);
        } catch (err) {
            console.error(err);
        } finally {
            setRetrying(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <Header />
                <main className={styles.loading}>Загрузка результата...</main>
                <Footer />
            </div>
        );
    }

    if (!userTest) {
        return (
            <div className={styles.page}>
                <Header />
                <main className={styles.main}>Результат не найден</main>
                <Footer />
            </div>
        );
    }

    const { test, answers, startAt, completedAt, percentage } = userTest;
    const pct = Math.round(percentage ?? 0);
    const scoreClass = getScoreClass(pct);
    const duration = formatDuration(startAt, completedAt!);

    // Статистика по компетенциям
    const competencyStats = test.questions.reduce((acc, q) => {
        const answer = answers.find(a => a.questionDTO.id === q.id);
        if (!acc[q.type]) {
            acc[q.type] = { total: 0, correct: 0 };
        }
        acc[q.type].total += 1;
        if (answer?.isCorrect) acc[q.type].correct += 1;
        return acc;
    }, {} as Record<string, { total: number; correct: number }>);

    const competencyResults = Object.entries(competencyStats).map(([key, stat]) => ({
        key: key as keyof typeof COMPETENCY_LABELS,
        label: COMPETENCY_LABELS[key],
        percentage: Math.round((stat.correct / stat.total) * 100),
        correct: stat.correct,
        total: stat.total,
    }));

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.main}>
                <div className={styles.inner}>

                    <div className={styles.headerSection}>
                        <p className={styles.pageLabel}>Результат теста</p>
                        <h1 className={styles.testTitle}>{test.title}</h1>
                        <p className={styles.date}>
                            Завершён {formatDate(completedAt!)} • {duration}
                        </p>
                    </div>

                    {/* Главный результат */}
                    <div className={styles.mainResult}>
                        <div className={`${styles.scoreCircle} ${styles[scoreClass]}`}>
                            <span className={styles.score}>{pct}</span>
                            <span className={styles.scoreUnit}>%</span>
                        </div>
                        <p className={styles.resultText}>
                            {pct >= 80 ? 'Отличный результат!' : pct >= 60 ? 'Хороший результат' : 'Есть над чем поработать'}
                        </p>
                    </div>

                    {/* Компетенции */}
                    <div className={styles.competencies}>
                        <h3 className={styles.sectionTitle}>Результаты по компетенциям</h3>
                        <div className={styles.competencyGrid}>
                            {competencyResults.map((comp) => (
                                <div key={comp.key} className={styles.competencyCard}>
                                    <div className={styles.competencyName}>{comp.label}</div>
                                    <div className={styles.competencyBar}>
                                        <div
                                            className={styles.competencyFill}
                                            style={{ width: `${comp.percentage}%` }}
                                        />
                                    </div>
                                    <div className={styles.competencyScore}>
                                        {comp.correct}/{comp.total} ({comp.percentage}%)
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ответы */}
                    <div className={styles.answersSection}>
                        <h3 className={styles.sectionTitle}>Разбор ответов</h3>
                        <QuestionReview questions={test.questions} answers={answers} />
                    </div>

                    {/* Действия */}
                    <div className={styles.actions}>
                        <button className={styles.btnRetry} onClick={handleRetry} disabled={retrying}>
                            {retrying ? 'Создаём новый тест...' : 'Пройти тест ещё раз'}
                        </button>

                        {/* Кнопка сертификата — только если тест завершён */}
                        {completedAt && <CertificateDownload userTest={userTest} />}

                        <Link to="/dashboard" className={styles.btnDashboard}>
                            В личный кабинет
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}