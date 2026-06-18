import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  getMe,
  getTests,
  createTest,
  deleteTest,
  getAdmins,
  giveAdminRole,
  getAdminUserTests,
} from '../../api';
import type { UserDTO, TestDTO, UserTestDTO } from '../../types';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './AdminPage.module.css';

type Tab = 'tests' | 'results' | 'admins';
type CompetencyType = 'LITERACY' | 'COMMUNICATIONS' | 'SAFETY' | 'CONSUMPTION';

const COMP_LABELS: Record<CompetencyType, string> = {
  LITERACY: 'Грамотность',
  COMMUNICATIONS: 'Коммуникации',
  SAFETY: 'Безопасность',
  CONSUMPTION: 'Потребление',
};

interface QuestionDraft {
  question: string;
  answerOptions: string[];
  correctAnswerIndex: number;
  type: CompetencyType;
}

interface TestDraft {
  title: string;
  description: string;
  timeLimitMinutes: number;
  questions: QuestionDraft[];
}

const emptyQuestion = (): QuestionDraft => ({
  question: '',
  answerOptions: ['', '', '', ''],
  correctAnswerIndex: 0,
  type: 'LITERACY',
});

const emptyDraft = (): TestDraft => ({
  title: '',
  description: '',
  timeLimitMinutes: 30,
  questions: [emptyQuestion()],
});

// ─── CloseIcon ──────────────────────────────────────────────────
const CloseIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// ─── PercentBar ─────────────────────────────────────────────────
function PercentBar({ value }: { value: number }) {
  const cls = value >= 70 ? styles.percentFillGood : value >= 40 ? '' : styles.percentFillBad;
  return (
    <div className={styles.percentWrap}>
      <div className={styles.percentBar}>
        <div className={`${styles.percentFill} ${cls}`} style={{ width: `${value}%` }} />
      </div>
      <span className={styles.percentText}>{value.toFixed(0)}%</span>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('tests');

  // Auth guard
  useEffect(() => {
    getMe()
      .then((res) => {
        if (res.data.role !== 'ADMIN') navigate('/chooseTest');
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div>
            <div className={styles.pageTitle}>Панель администратора</div>
            <div className={styles.pageSubtitle}>Управление тестами, результатами и правами доступа</div>
          </div>
          <span className={styles.adminBadge}>Admin</span>
        </div>
      </div>

      <div className={styles.tabs}>
        <div className={styles.tabsInner}>
          {([
            { key: 'tests', label: 'Тесты', icon: '📋' },
            { key: 'results', label: 'Результаты', icon: '📊' },
            { key: 'admins', label: 'Администраторы', icon: '👤' },
          ] as { key: Tab; label: string; icon: string }[]).map((t) => (
            <button
              key={t.key}
              className={`${styles.tab} ${activeTab === t.key ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              <span className={styles.tabIcon}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        {activeTab === 'tests' && <TestsTab />}
        {activeTab === 'results' && <ResultsTab />}
        {activeTab === 'admins' && <AdminsTab />}
      </div>

      <Footer />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Tab: Tests
// ═══════════════════════════════════════════════════════════════
function TestsTab() {
  const [tests, setTests] = useState<TestDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    getTests()
      .then((r) => setTests(r.data))
      .catch(() => setError('Не удалось загрузить тесты'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить тест? Это действие необратимо.')) return;
    setDeletingId(id);
    try {
      await deleteTest(id);
      setTests((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError('Не удалось удалить тест');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Всего тестов</span>
          <span className={styles.statValue}>{tests.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Вопросов (всего)</span>
          <span className={styles.statValue}>{tests.reduce((s, t) => s + (t.questions?.length ?? 0), 0)}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Компетенции</span>
          <span className={styles.statValue}>4</span>
        </div>
      </div>

      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Список тестов</span>
        <button className={styles.btnPrimary} onClick={() => setShowCreate(true)}>
          + Создать тест
        </button>
      </div>

      {error && <div className={styles.errorBanner} style={{ marginBottom: 16 }}>{error}</div>}

      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : tests.length === 0 ? (
          <div className={styles.empty}>Тестов пока нет. Создайте первый!</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Название</th>
                <th>Описание</th>
                <th>Вопросов</th>
                <th>Лимит времени</th>
                <th>Создан</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.title}</td>
                  <td className={styles.tdMuted}>{t.description || '—'}</td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgeBlue}`}>
                      {t.questions?.length ?? 0} вопр.
                    </span>
                  </td>
                  <td className={styles.tdMuted}>{t.timeLimitMinutes} мин</td>
                  <td className={styles.tdMuted}>
                    {t.createAt ? new Date(t.createAt).toLocaleDateString('ru-RU') : '—'}
                  </td>
                  <td>
                    <div className={styles.actionsRow}>
                      <button
                        className={styles.btnDanger}
                        onClick={() => handleDelete(t.id)}
                        disabled={deletingId === t.id}
                      >
                        <TrashIcon />
                        {deletingId === t.id ? 'Удаление...' : 'Удалить'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <CreateTestModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load(); }}
        />
      )}
    </>
  );
}

// ─── Create Test Modal ──────────────────────────────────────────
function CreateTestModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [draft, setDraft] = useState<TestDraft>(emptyDraft());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateTest = (patch: Partial<TestDraft>) =>
    setDraft((d) => ({ ...d, ...patch }));

  const updateQuestion = (i: number, patch: Partial<QuestionDraft>) =>
    setDraft((d) => {
      const qs = [...d.questions];
      qs[i] = { ...qs[i], ...patch };
      return { ...d, questions: qs };
    });

  const updateAnswer = (qi: number, ai: number, val: string) =>
    setDraft((d) => {
      const qs = [...d.questions];
      const opts = [...qs[qi].answerOptions];
      opts[ai] = val;
      qs[qi] = { ...qs[qi], answerOptions: opts };
      return { ...d, questions: qs };
    });

  const addAnswer = (qi: number) =>
    setDraft((d) => {
      const qs = [...d.questions];
      qs[qi] = { ...qs[qi], answerOptions: [...qs[qi].answerOptions, ''] };
      return { ...d, questions: qs };
    });

  const removeAnswer = (qi: number, ai: number) =>
    setDraft((d) => {
      const qs = [...d.questions];
      const opts = qs[qi].answerOptions.filter((_, idx) => idx !== ai);
      const correct = qs[qi].correctAnswerIndex >= opts.length ? opts.length - 1 : qs[qi].correctAnswerIndex;
      qs[qi] = { ...qs[qi], answerOptions: opts, correctAnswerIndex: Math.max(0, correct) };
      return { ...d, questions: qs };
    });

  const removeQuestion = (i: number) =>
    setDraft((d) => ({ ...d, questions: d.questions.filter((_, idx) => idx !== i) }));

  const handleSubmit = async () => {
    setError('');
    if (!draft.title.trim()) { setError('Введите название теста'); return; }
    if (draft.questions.some((q) => !q.question.trim())) { setError('Заполните текст всех вопросов'); return; }
    if (draft.questions.some((q) => q.answerOptions.some((a) => !a.trim()))) {
      setError('Заполните все варианты ответов'); return;
    }
    setLoading(true);
    try {
      await createTest(draft);
      onCreated();
    } catch (e: any) {
      setError(e?.response?.data?.errorMessage || 'Не удалось создать тест');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>Создать тест</span>
          <button className={styles.modalClose} onClick={onClose}><CloseIcon /></button>
        </div>

        <div className={styles.modalBody}>
          {error && <div className={styles.errorBanner}>{error}</div>}

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Название теста</label>
            <input
              className={styles.input}
              placeholder="Например: Цифровая безопасность — базовый"
              value={draft.title}
              onChange={(e) => updateTest({ title: e.target.value })}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Описание</label>
            <textarea
              className={styles.textarea}
              placeholder="Краткое описание теста..."
              value={draft.description}
              onChange={(e) => updateTest({ description: e.target.value })}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Лимит времени (минуты)</label>
            <input
              className={styles.input}
              type="number"
              min={1}
              max={180}
              value={draft.timeLimitMinutes}
              onChange={(e) => updateTest({ timeLimitMinutes: Number(e.target.value) })}
              style={{ width: 120 }}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
              Вопросы ({draft.questions.length})
            </div>

            {draft.questions.map((q, qi) => (
              <div key={qi} className={styles.questionBlock} style={{ marginBottom: 10 }}>
                <div className={styles.questionBlockHeader}>
                  <span className={styles.questionBlockTitle}>Вопрос {qi + 1}</span>
                  {draft.questions.length > 1 && (
                    <button className={styles.btnDanger} onClick={() => removeQuestion(qi)}>
                      <TrashIcon /> Удалить
                    </button>
                  )}
                </div>

                <div className={styles.fieldGroup}>
                  <textarea
                    className={styles.textarea}
                    placeholder="Текст вопроса..."
                    value={q.question}
                    onChange={(e) => updateQuestion(qi, { question: e.target.value })}
                    style={{ minHeight: 60 }}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Компетенция</label>
                  <select
                    className={styles.select}
                    value={q.type}
                    onChange={(e) => updateQuestion(qi, { type: e.target.value as CompetencyType })}
                  >
                    {(Object.keys(COMP_LABELS) as CompetencyType[]).map((k) => (
                      <option key={k} value={k}>{COMP_LABELS[k]}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Варианты ответов <span className={styles.answerHint}>(выберите правильный)</span></label>
                  {q.answerOptions.map((opt, ai) => (
                    <div key={ai} className={styles.answerRow}>
                      <input
                        type="radio"
                        className={styles.answerRadio}
                        name={`correct-${qi}`}
                        checked={q.correctAnswerIndex === ai}
                        onChange={() => updateQuestion(qi, { correctAnswerIndex: ai })}
                      />
                      <input
                        className={`${styles.answerInput} ${q.correctAnswerIndex === ai ? styles.answerInputCorrect : ''}`}
                        placeholder={`Вариант ${ai + 1}`}
                        value={opt}
                        onChange={(e) => updateAnswer(qi, ai, e.target.value)}
                      />
                      {q.answerOptions.length > 2 && (
                        <button
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                          onClick={() => removeAnswer(qi, ai)}
                        >
                          <CloseIcon />
                        </button>
                      )}
                    </div>
                  ))}
                  {q.answerOptions.length < 6 && (
                    <button className={styles.addAnswerBtn} onClick={() => addAnswer(qi)}>
                      + Добавить вариант
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              className={styles.addQuestionBtn}
              onClick={() => setDraft((d) => ({ ...d, questions: [...d.questions, emptyQuestion()] }))}
            >
              + Добавить вопрос
            </button>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnOutline} onClick={onClose}>Отмена</button>
          <button className={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : null}
            {loading ? 'Создание...' : 'Создать тест'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Tab: Results
// ═══════════════════════════════════════════════════════════════
function ResultsTab() {
  const [tests, setTests] = useState<TestDTO[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<UserTestDTO[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getTests().then((r) => {
      setTests(r.data);
      if (r.data.length > 0) setSelectedTestId(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedTestId) return;
    setLoadingAttempts(true);
    setAttempts([]);
    setError('');
    getAdminUserTests(selectedTestId)
      .then((r) => setAttempts(r.data))
      .catch(() => setError('Не удалось загрузить результаты'))
      .finally(() => setLoadingAttempts(false));
  }, [selectedTestId]);

  const avg = attempts.length
    ? (attempts.reduce((s, a) => s + (a.percentage ?? 0), 0) / attempts.length)
    : 0;

  return (
    <>
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Попыток</span>
          <span className={styles.statValue}>{attempts.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Средний результат</span>
          <span className={styles.statValue}>{avg.toFixed(0)}%</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Завершено</span>
          <span className={styles.statValue}>{attempts.filter((a) => a.completedAt).length}</span>
        </div>
      </div>

      <div className={styles.testSelector}>
        <span className={styles.testSelectorLabel}>Тест:</span>
        <select
          className={styles.testSelectorSelect}
          value={selectedTestId ?? ''}
          onChange={(e) => setSelectedTestId(Number(e.target.value))}
        >
          {tests.map((t) => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

      {error && <div className={styles.errorBanner} style={{ marginBottom: 16 }}>{error}</div>}

      <div className={styles.card}>
        {loadingAttempts ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : attempts.length === 0 ? (
          <div className={styles.empty}>По этому тесту пока нет попыток.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Пользователь</th>
                <th>Email</th>
                <th>Результат</th>
                <th>Начало</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.user?.name ?? '—'}</td>
                  <td className={styles.tdMuted}>{a.user?.email ?? '—'}</td>
                  <td style={{ minWidth: 160 }}>
                    {a.completedAt ? <PercentBar value={a.percentage ?? 0} /> : <span className={styles.tdMuted}>—</span>}
                  </td>
                  <td className={styles.tdMuted}>
                    {a.startAt ? new Date(a.startAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td>
                    {a.completedAt
                      ? <span className={`${styles.badge} ${styles.badgeGreen}`}>Завершён</span>
                      : <span className={`${styles.badge} ${styles.badgeOrange}`}>В процессе</span>
                    }
                  </td>
                  <td>
                    <Link
                      to={`/admin/results/${a.id}`}
                      className={styles.btnView}
                    >
                      Подробнее →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </>
  );
}

// ─── Attempt Detail Modal ───────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
// Tab: Admins
// ═══════════════════════════════════════════════════════════════
function AdminsTab() {
  const [admins, setAdmins] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [granting, setGranting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    setLoading(true);
    getAdmins()
      .then((r) => setAdmins(r.data))
      .catch(() => setError('Не удалось загрузить список администраторов'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleGrant = async () => {
    setError('');
    setSuccess('');
    if (!email.trim()) { setError('Введите email пользователя'); return; }
    setGranting(true);
    try {
      await giveAdminRole(email.trim());
      setSuccess(`Права администратора выданы: ${email}`);
      setEmail('');
      load();
    } catch (e: any) {
      setError( 'Не удалось выдать права. Проверьте email.'); //e?.response?.data?.errorMessage ||
    } finally {
      setGranting(false);
    }
  };

  return (
    <>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Выдать права администратора</span>
      </div>

      <div className={styles.card} style={{ marginBottom: 24, padding: 24 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className={styles.fieldGroup} style={{ flex: 1, minWidth: 240 }}>
            <label className={styles.label}>Email пользователя</label>
            <input
              className={styles.input}
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
                setSuccess('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleGrant()}
            />
          </div>
          <button
            className={styles.btnPrimary}
            onClick={handleGrant}
            disabled={granting}
            style={{ marginBottom: 0, height: 42 }}
          >
            {granting ? <span className={styles.spinner} /> : null}
            {granting ? 'Выдача...' : 'Выдать права'}
          </button>
        </div>

        {error && <div className={styles.errorBanner} style={{ marginTop: 12 }}>{error}</div>}
        {success && (
          <div style={{ marginTop: 12, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 13, color: '#15803D' }}>
            {success}
          </div>
        )}
      </div>

      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Текущие администраторы</span>
        <span className={`${styles.badge} ${styles.badgeBlue}`}>{admins.length}</span>
      </div>

      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : admins.length === 0 ? (
          <div className={styles.empty}>Администраторов не найдено.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Имя</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Дата регистрации</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.name}</td>
                  <td className={styles.tdMuted}>{a.email}</td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgeBlue}`}>ADMIN</span>
                  </td>
                  <td className={styles.tdMuted}>
                    {a.createAt ? new Date(a.createAt).toLocaleDateString('ru-RU') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
