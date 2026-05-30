import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getMe, logout } from '../../api';
import type { UserDTO } from '../../types';
import styles from './Header.module.css';

export default function Header() {
  const [user, setUser] = useState<UserDTO | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    getMe()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setUser(null);
      navigate('/login');
    }
  };

  const isActive = (path: string) =>
    location.pathname === path ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to={user ? '/dashboard' : '/'} className={styles.logo}>
          <img src="/logo.png" alt="Логотип" className={styles.logoImg} />
          <span className={styles.logoText}>
            Base<span>Test</span>
          </span>
        </Link>

        <nav className={styles.nav}>
          {user ? (
            <>
              <Link to="/chooseTest" className={isActive('/chooseTest')}>
                Тесты
              </Link>
              <Link to="/dashboard" className={isActive('/dashboard')}>
                Мои результаты
              </Link>
              {user.role === 'ADMIN' && (
                <>
                  <div className={styles.divider} />
                  <Link to="/admin" className={isActive('/admin')}>
                    Панель админа
                  </Link>
                  <span className={styles.adminBadge}>Admin</span>
                </>
              )}
              <div className={styles.divider} />
              <button className={styles.btnOutline} onClick={handleLogout}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.btnOutline}>
                Войти
              </Link>
              <Link to="/register" className={styles.btnPrimary}>
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
