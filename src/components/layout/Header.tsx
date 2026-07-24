import { Link } from 'react-router-dom';
import { Search, User, Globe, ChevronDown, Check, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';

export default function Header() {
  const { t, i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, logout } = useAuth();

  const currentLang = i18n.language.startsWith('en') ? 'en' : 'fr';

  const languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const switchLang = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('lang', code);
    setLangOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header className={styles.header}>
        <div className={`container ${styles.container}`}>
          {/* LEFT: Logo + Desktop Nav */}
          <div className={styles.left}>
            <Link to="/" className={styles.logo} onClick={closeMobile}>
              <span className={styles.logoText}>Derivcash</span>
            </Link>
            <nav className={styles.nav}>
              <a href="#solutions" className={styles.navLink}>{t('nav.solutions')}</a>
              <a href="#eligibilite" className={styles.navLink}>{t('nav.eligibility')}</a>
              <a href="#fonctionnement" className={styles.navLink}>{t('nav.howItWorks')}</a>
            </nav>
          </div>

          {/* CENTER: Search (desktop) */}
          <div className={styles.center}>
            <div className={styles.searchBar}>
              <Search className={styles.searchIcon} size={18} />
              <input
                type="text"
                placeholder={currentLang === 'fr' ? 'Que recherchez-vous ?' : 'What are you looking for?'}
                className={styles.searchInput}
              />
            </div>
          </div>

          {/* RIGHT: Lang + Auth (desktop) */}
          <div className={styles.right}>
            <div className={styles.langSwitcher} ref={dropdownRef}>
              <button
                className={styles.langBtn}
                onClick={() => setLangOpen((v) => !v)}
                aria-label="Change language"
                aria-expanded={langOpen}
              >
                <Globe size={16} className={styles.globeIcon} />
                <span className={styles.langCode}>{currentLang.toUpperCase()}</span>
                <ChevronDown size={14} className={`${styles.chevron} ${langOpen ? styles.chevronOpen : ''}`} />
              </button>

              {langOpen && (
                <div className={styles.langDropdown}>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className={`${styles.langOption} ${currentLang === lang.code ? styles.langOptionActive : ''}`}
                      onClick={() => switchLang(lang.code)}
                    >
                      <span className={styles.langFlag}>{lang.flag}</span>
                      <span className={styles.langLabel}>{lang.label}</span>
                      {currentLang === lang.code && <Check size={14} className={styles.checkIcon} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={styles.loginBtn}>
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <button onClick={logout} className="btn btn-primary" style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-main)' }}>
                  <LogOut size={18} style={{ marginRight: '8px' }} />
                  {t('nav.logout') || 'Se Déconnecter'}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.loginBtn}>
                  <User size={18} />
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn btn-primary">
                  {t('nav.applyLoan')}
                </Link>
              </>
            )}
          </div>

          {/* HAMBURGER (mobile only) */}
          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <div className={`${styles.mobileOverlay} ${mobileOpen ? styles.mobileOverlayOpen : ''}`}>
        {/* Search */}
        <div className={styles.mobileSearch}>
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder={currentLang === 'fr' ? 'Que recherchez-vous ?' : 'What are you looking for?'}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Nav Links */}
        <nav className={styles.mobileNav}>
          <a href="#solutions" className={styles.mobileNavLink} onClick={closeMobile}>{t('nav.solutions')}</a>
          <a href="#eligibilite" className={styles.mobileNavLink} onClick={closeMobile}>{t('nav.eligibility')}</a>
          <a href="#fonctionnement" className={styles.mobileNavLink} onClick={closeMobile}>{t('nav.howItWorks')}</a>
        </nav>

        <div className={styles.mobileDivider} />

        {/* Language Switcher */}
        <div className={styles.mobileLangSection}>
          <span className={styles.mobileSectionLabel}>Langue</span>
          <div className={styles.mobileLangOptions}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`${styles.mobileLangBtn} ${currentLang === lang.code ? styles.mobileLangActive : ''}`}
                onClick={() => { switchLang(lang.code); }}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
                {currentLang === lang.code && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.mobileDivider} />

        {/* Auth Buttons */}
        <div className={styles.mobileAuthSection}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={styles.mobileAuthBtn} onClick={closeMobile}>
                <LayoutDashboard size={20} />
                <span>Mon Dashboard</span>
              </Link>
              <button
                onClick={() => { logout(); closeMobile(); }}
                className={`${styles.mobileAuthBtn} ${styles.mobileAuthBtnLogout}`}
              >
                <LogOut size={20} />
                <span>{t('nav.logout') || 'Se Déconnecter'}</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.mobileAuthBtn} onClick={closeMobile}>
                <User size={20} />
                <span>{t('nav.login')}</span>
              </Link>
              <Link to="/register" className={`${styles.mobileAuthBtn} ${styles.mobileAuthBtnPrimary}`} onClick={closeMobile}>
                <span>{t('nav.applyLoan')}</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
