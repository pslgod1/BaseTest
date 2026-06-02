import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMe } from '../../api';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './HomePage.module.css';

const COMPETENCIES = [
  {
    num: '01',
    en: 'Literacy',
    title: 'Цифровая грамотность',
    desc: 'Умение работать с цифровой информацией, критически оценивать источники и использовать базовые цифровые инструменты.',
  },
  {
    num: '02',
    en: 'Communications',
    title: 'Цифровые коммуникации',
    desc: 'Навыки эффективного общения в цифровой среде, работа с мессенджерами, почтой и социальными сетями.',
  },
  {
    num: '03',
    en: 'Safety',
    title: 'Цифровая безопасность',
    desc: 'Защита персональных данных, осознанное поведение в сети, противодействие мошенничеству и угрозам.',
  },
  {
    num: '04',
    en: 'Consumption',
    title: 'Цифровое потребление',
    desc: 'Грамотное использование цифровых сервисов, онлайн-покупок, государственных порталов и финансовых инструментов.',
  },
];

const STEPS = [
  { num: '01', title: 'Зарегистрируйтесь', desc: 'Создайте аккаунт за пару минут — нужны только имя и email.' },
  { num: '02', title: 'Выберите тест', desc: 'Выберите одну из четырёх компетенций и начните тестирование.' },
  { num: '03', title: 'Пройдите тест', desc: 'Отвечайте на вопросы в удобном темпе с навигацией вперёд и назад.' },
  { num: '04', title: 'Получите результат', desc: 'Узнайте свой уровень цифровых компетенций и скачайте сертификат.' },
];

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    getMe()
      .then(() => navigate('/login'))
      .catch(() => {/* не авторизован — остаёмся на главной */});
  }, [navigate]);

  return (
    <div className={styles.page}>
      <Header />

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <div className={styles.heroLogoWrap}>
              <img src="/logo.png" alt="Логотип" className={styles.heroLogoImg} />
              <span className={styles.heroLogoText}>BaseTest</span>
            </div>
            <span className={styles.heroTagline}>Платформа цифровых компетенций</span>
            <h1 className={styles.heroTitle}>
              Проверьте свой уровень цифрового развития
            </h1>
            <p className={styles.heroDesc}>
              Пройдите тестирование и узнайте, насколько вы готовы к цифровому миру. Четыре направления, сотни вопросов, мгновенный результат.
            </p>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.heroActions}>
              <Link to="/register" className={styles.btnPrimary}>
                <span>Начать бесплатно</span>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link to="/login" className={styles.btnGhost}>
                Войти в аккаунт
              </Link>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>4</span>
                <span className={styles.heroStatLabel}>Компетенции</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>100+</span>
                <span className={styles.heroStatLabel}>Вопросов</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>0 ₽</span>
                <span className={styles.heroStatLabel}>Бесплатно</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPETENCIES ── */}
      <section className={styles.compSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionLabel}>Направления тестирования</span>
            <h2 className={styles.sectionTitle}>Четыре ключевые компетенции</h2>
          </div>
          <div className={styles.compGrid}>
            {COMPETENCIES.map((c) => (
              <div key={c.num} className={styles.compCard}>
                <span className={styles.compNum}>{c.num}</span>
                <div>
                  <div className={styles.compEn}>{c.en}</div>
                  <div className={styles.compTitle}>{c.title}</div>
                  <p className={styles.compDesc}>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={styles.howSection}>
        <div className={styles.howInner}>
          <div className={styles.howHead}>
            <div>
              <p className={styles.howLabel}>Как это работает</p>
              <h2 className={styles.howTitle}>Всего четыре простых шага</h2>
            </div>
            <p className={styles.howSub}>
              От регистрации до сертификата — процесс занимает не больше 20 минут. Никаких сложностей.
            </p>
          </div>
          <div className={styles.stepsGrid}>
            {STEPS.map((s) => (
              <div key={s.num} className={styles.stepItem}>
                <div className={styles.stepNumBox}>{s.num}</div>
                <div className={styles.stepTitle}>{s.title}</div>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <div>
            <p className={styles.ctaLabel}>Готовы начать?</p>
            <h2 className={styles.ctaTitle}>Проверьте свои цифровые компетенции</h2>
            <p className={styles.ctaSub}>
              Регистрация займёт меньше минуты. Никаких подписок — тестирование полностью бесплатно.
            </p>
          </div>
          <div className={styles.ctaRight}>
            <Link to="/register" className={styles.ctaBtnDark}>
              <span>Зарегистрироваться бесплатно</span>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <span className={styles.ctaNote}>
              Уже есть аккаунт?{' '}
              <Link to="/login" className={styles.ctaNoteLink}>Войти →</Link>
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
