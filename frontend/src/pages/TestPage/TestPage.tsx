// TestPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getUserTest,
    submitAnswer,
    completeUserTest,
    getMe,
} from '../../api';
import type { UserTestDTO, QuestionDTO } from '../../types';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './TestPage.module.css';

export default function TestPage() {
    const { userTestId } = useParams<{ userTestId: string }>();
    const navigate = useNavigate();
    const [userTest, setUserTest] = useState<UserTestDTO | null>(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [finished, setFinished] = useState(false);
    const [result, setResult] = useState<number | null>(null);
    const [submittingAnswer, setSubmittingAnswer] = useState(false);

    // Загрузка данных
    useEffect(() => {
        if (!userTestId) return;
        getMe()
            .then(() => getUserTest(Number(userTestId)))
            .then((res) => {
                setUserTest(res.data);
                const totalSeconds = res.data.test.timeLimitMinutes * 60;
                setTimeLeft(totalSeconds);
            })
            .catch((err) => {
                if (err.response?.status === 401) navigate('/login');
                else {
                    // временно — покажи ошибку вместо редиректа
                    console.error('getUserTest error:', err.response?.status, err.response?.data);
                    navigate('/dashboard'); // закомментируй пока
                }
            })
    }, [userTestId, navigate]);

    // Таймер
    useEffect(() => {
        if (!userTest || timeLeft <= 0 || finished) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleComplete(); // авто-завершение
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [userTest, timeLeft, finished]);

    const handleComplete = useCallback(async () => {
        if (!userTest || finished) return;
        try {
            const { data } = await completeUserTest(userTest.id);
            navigate(`/result/${userTest.id}`);
            setResult(data.percentage);
            setFinished(true);
        } catch {
            // игнорируем ошибку, всё равно покажем редирект
            navigate('/dashboard');
        }
    }, [userTest, finished, navigate]);

    // Отправка ответа
    const handleSelectAnswer = async (questionId: number, selectedIdx: number) => {
        if (!userTest || submittingAnswer) return;
        // Проверяем, не отвечен ли уже
        const already = userTest.answers.find(
            (a) => a.questionDTO.id === questionId
        );
        if (already) return; // уже ответили
        setSubmittingAnswer(true);
        try {
            await submitAnswer({
                userTestId: userTest.id,
                questionId,
                selectedAnswerIndex: selectedIdx,
            });
            // обновляем локально список ответов
            setUserTest((prev) =>
                prev
                    ? {
                        ...prev,
                        answers: [
                            ...prev.answers,
                            {
                                id: Date.now(), // временный id
                                questionDTO: prev.test.questions.find(
                                    (q) => q.id === questionId
                                )!,
                                selectedAnswerIndex: selectedIdx,
                                isCorrect: false, // нам пока не важно
                                answerAt: new Date().toISOString(),
                            },
                        ],
                    }
                    : prev
            );
        } catch {
            // ошибка, можно показать
        } finally {
            setSubmittingAnswer(false);
        }
    };

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    if (!userTest) {
        return (
            <div className={styles.page}>
                <Header />
                <main className={styles.loading}>Загрузка теста...</main>
                <Footer />
            </div>
        );
    }

    if (finished) {
        return (
            <div className={styles.page}>
                <Header />
                <main className={styles.main}>
                    <div className={styles.resultBox}>
                        <h2 className={styles.resultTitle}>Тест завершён</h2>
                        <p className={styles.resultPercent}>
                            {result !== null ? `${result}%` : '—'}
                        </p>
                        <button
                            className={styles.btnPrimary}
                            onClick={() => navigate('/result')}
                        >
                            К результатам
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const questions: QuestionDTO[] = userTest.test.questions;
    const currentQuestion = questions[currentIdx];
    const userAnswer = userTest.answers.find(
        (a) => a.questionDTO.id === currentQuestion.id
    );

    return (
        <div className={styles.page}>
            <Header />
            <main className={styles.main}>
                <div className={styles.topBar}>
                    <div className={styles.timer}>
                        <span className={styles.timerIcon}>⏱</span>
                        {formatTime(timeLeft)}
                    </div>
                    <button className={styles.fullscreenBtn} onClick={toggleFullscreen}>
                        ⛶
                    </button>
                </div>

                <div className={styles.progress}>
                    Вопрос {currentIdx + 1} из {questions.length}
                </div>

                <div className={styles.questionCard}>
                    <h3 className={styles.questionText}>{currentQuestion.question}</h3>
                    <div className={styles.options}>
                        {currentQuestion.answers.map((opt, idx) => {
                            const selected = userAnswer?.selectedAnswerIndex === idx;
                            return (
                                <button
                                    key={idx}
                                    className={`${styles.option} ${selected ? styles.optionActive : ''}`}
                                    onClick={() => handleSelectAnswer(currentQuestion.id, idx)}
                                    disabled={!!userAnswer || submittingAnswer}
                                >
                  <span className={styles.optionMarker}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className={styles.nav}>
                    <button
                        className={styles.navBtn}
                        disabled={currentIdx === 0}
                        onClick={() => setCurrentIdx((p) => p - 1)}
                    >
                        ← Назад
                    </button>
                    <button
                        className={styles.navBtn}
                        disabled={currentIdx === questions.length - 1}
                        onClick={() => setCurrentIdx((p) => p + 1)}
                    >
                        Вперёд →
                    </button>
                </div>

                <div className={styles.finishSection}>
                    <button
                        className={styles.finishBtn}
                        onClick={handleComplete}
                    >
                        Завершить тест
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );
}