import styles from './Apply.module.css';
import { FileSignature } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

export default function Apply() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/register" replace />;
  }

  return (
    <div className={styles.applyPage}>
      <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className={styles.applyContainer}>
          <div className={styles.iconWrapper}>
            <FileSignature size={32} />
          </div>
          <h1>{t('apply.title')}</h1>
          <p>{t('apply.description')}</p>
          <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', padding: '12px 24px', fontSize: '1rem' }}>
            {t('apply.backHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
