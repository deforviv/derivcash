import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './Footer.module.css';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.container}`}>
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <Link to="/" className={styles.logo}>
              <span className={styles.logoText}>Derivcash</span>
            </Link>
            <p className={styles.description}>
              {t('footer.description')}
            </p>
            <div className={styles.socials}>
              <a href="#" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            </div>
          </div>

          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>{t('footer.solutions.title')}</h4>
            <ul className={styles.linkList}>
              <li><Link to="#">{t('footer.solutions.personal')}</Link></li>
              <li><Link to="#">{t('footer.solutions.professional')}</Link></li>
              <li><Link to="#">{t('footer.solutions.urgent')}</Link></li>
              <li><Link to="#">{t('footer.solutions.consolidation')}</Link></li>
            </ul>
          </div>

          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>{t('footer.resources.title')}</h4>
            <ul className={styles.linkList}>
              <li><Link to="#">{t('footer.resources.howItWorks')}</Link></li>
              <li><Link to="#">{t('footer.resources.checkEligibility')}</Link></li>
              <li><Link to="#">{t('footer.resources.helpCenter')}</Link></li>
              <li><Link to="#">{t('footer.resources.blog')}</Link></li>
            </ul>
          </div>

          <div className={styles.contactCol}>
            <h4 className={styles.colTitle}>{t('footer.contact.title')}</h4>
            <ul className={styles.contactList}>
              <li>
                <Phone size={18} className={styles.contactIcon} />
                <span>{t('footer.contact.phone')}</span>
              </li>
              <li>
                <Mail size={18} className={styles.contactIcon} />
                <span>support@derivcash.com</span>
              </li>
              <li>
                <MapPin size={18} className={styles.contactIcon} />
                <span>{t('footer.contact.address')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <div className={styles.legalLinks}>
            <Link to="#">{t('footer.legal.mentions')}</Link>
            <Link to="#">{t('footer.legal.privacy')}</Link>
            <Link to="#">{t('footer.legal.terms')}</Link>
            <Link to="#">{t('footer.legal.security')}</Link>
          </div>
          <div className={styles.copyright}>
            &copy; {new Date().getFullYear()} Derivcash. {t('footer.copyright')}
          </div>
        </div>
      </div>
    </footer>
  );
}
