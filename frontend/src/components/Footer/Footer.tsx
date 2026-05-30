import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.logo}>
          <img src="/logo.png" alt="Логотип" className={styles.logoImg} />
          <span className={styles.logoText}>BaseTest</span>
        </div>
        <span className={styles.copy}>© {new Date().getFullYear()} BaseTest. Все права защищены.</span>
        <div className={styles.links}>
          <a href="#" className={styles.link}>О проекте</a>
          <a href="#" className={styles.link}>Политика конфиденциальности</a>
        </div>
      </div>
    </footer>
  );
}
