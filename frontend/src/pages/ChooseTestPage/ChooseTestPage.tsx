// ChooseTestPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTests, createUserTestAttempt, getMe } from '../../api';
import type { TestDTO } from '../../types';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './ChooseTestPage.module.css';

export default function ChooseTestPage() {
    const [tests, setTests] = useState<TestDTO[]>([]);
    const [selectedTest, setSelectedTest] = useState<TestDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        getMe()
            .then(() => getTests())
            .then((res) => setTests(res.data))
            .catch((err) => {
                if (err.response?.status === 401) navigate('/login');
                else setError('Не удалось загрузить тесты');
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    const handleStartTest = async () => {
        if (!selectedTest) return;
        try {
            const { data } = await createUserTestAttempt(selectedTest.id);
            navigate(`/test/${data.id}`);
        } catch {
            setError('Не удалось начать тест');
        }
    };

    return (
        <div className={styles.page}>
            <Header />
            <main className={styles.main}>
                <div className={styles.head}>
                    <h1 className={styles.title}>Доступные тесты</h1>
                    <p className={styles.subtitle}>
                        Выберите одну из компетенций, чтобы проверить свои цифровые навыки
                    </p>
                </div>

                {loading && <p className={styles.loading}>Загрузка...</p>}
                {error && <p className={styles.error}>{error}</p>}

                {!loading && !error && (
                    <div className={styles.grid}>
                        {tests.map((test) => (
                            <button
                                key={test.id}
                                className={styles.card}
                                onClick={() => setSelectedTest(test)}
                            >
                <span className={styles.cardNum}>
                  {test.questions.length} вопр.
                </span>
                                <div>
                                    <div className={styles.cardTitle}>{test.title}</div>
                                    <p className={styles.cardDesc}>{test.description}</p>
                                    <div className={styles.cardMeta}>
                                        ⏱ {test.timeLimitMinutes} мин.
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </main>

            {selectedTest && (
                <div className={styles.overlay} onClick={() => setSelectedTest(null)}>
                    <div
                        className={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className={styles.modalTitle}>{selectedTest.title}</h2>
                        <p className={styles.modalDesc}>{selectedTest.description}</p>
                        <div className={styles.modalStats}>
                            <span>⏱ {selectedTest.timeLimitMinutes} мин.</span>
                            <span>📝 {selectedTest.questions.length} вопросов</span>
                            <span>👤 {selectedTest.admin.name}</span>
                        </div>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.btnOutline}
                                onClick={() => setSelectedTest(null)}
                            >
                                Отмена
                            </button>
                            <button
                                className={styles.btnPrimary}
                                onClick={handleStartTest}
                            >
                                Начать тест
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}