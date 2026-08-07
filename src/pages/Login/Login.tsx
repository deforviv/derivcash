import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, Eye, EyeOff, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    let profile = null;
    const { data, error: dbError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (!dbError && data) {
      profile = data;
    } else {
      // Fallback to local storage if Supabase fails or doesn't find the user
      const localProfiles = JSON.parse(localStorage.getItem('derivcash_mock_profiles') || '[]');
      profile = localProfiles.find((p: any) => p.email === email);
    }

    setIsLoading(false);

    if (!profile || profile.password_hash !== btoa(encodeURIComponent(password))) {
      setError(i18n.language === 'en' ? 'Invalid email or password' : 'Email ou mot de passe incorrect');
      return;
    }

    if (profile.is_banned) {
      setError(i18n.language === 'en' ? 'This profile has been banned' : 'Ce profil a été banni');
      return;
    }

    // Success
    login(profile);
    navigate(profile.role === 'admin' ? '/admin' : '/dashboard');
  };

  const sideFeatures = t('login.sideFeatures', { returnObjects: true }) as string[];

  return (
    <div className={styles.loginPage}>
      {/* LEFT PANEL */}
      <div className={styles.leftPanel}>
        <div className={styles.leftBg} />
        <div className={styles.leftOverlay} />
        
        <div className={styles.leftContent}>
          <Link to="/" className={styles.leftLogo}>Derivcash</Link>
          
          <div className={styles.leftBody}>
            <h1 className={styles.leftTagline}>{t('login.sideTitle')}</h1>
            
            <ul className={styles.leftFeatures}>
              {sideFeatures.map((feature, idx) => (
                <li key={idx}>
                  <div className={styles.featureCheck}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>100%</span>
                <span className={styles.statLabel}>{i18n.language === 'en' ? 'Secure platform' : 'Plateforme sécurisée'}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>24/7</span>
                <span className={styles.statLabel}>{i18n.language === 'en' ? 'Support access' : 'Accès support'}</span>
              </div>
            </div>
          </div>
          
          <div className={styles.leftFooter}>
            &copy; {new Date().getFullYear()} Derivcash. {i18n.language === 'en' ? 'All rights reserved.' : 'Tous droits réservés.'}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className={styles.rightPanel}>
        <div className={styles.formWrapper}>
          
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>{t('login.title')}</h2>
            <p className={styles.formSubtitle}>{t('login.subtitle')}</p>
          </div>
          
          <form onSubmit={handleLogin}>
            {error && (
              <div style={{ backgroundColor: 'rgba(229, 62, 62, 0.1)', color: '#e53e3e', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>⚠️</span> {error}
              </div>
            )}
            
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>{t('login.email')}</label>
                <input 
                  type="email" 
                  className={`${styles.fieldInput} ${error ? styles.fieldInputError : ''}`}
                  placeholder={t('login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  required 
                />
              </div>
              
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>{t('login.password')}</label>
                <div className={styles.fieldInputWrapper}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className={`${styles.fieldInput} ${error ? styles.fieldInputError : ''}`}
                    placeholder={t('login.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    required 
                  />
                  <button 
                    type="button" 
                    className={styles.inputIcon} 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className={styles.forgotPassword}>
                <Link to="/forgot-password">{t('login.forgotPassword')}</Link>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.btnSubmit} disabled={isLoading}>
                {isLoading ? <Loader2 size={20} className={styles.spinner} /> : <>{t('login.submit')} <ChevronRight size={20} /></>}
              </button>
            </div>
          </form>
          
          <div className={styles.registerRedirect}>
            {t('login.noAccount')} 
            <Link to="/register">{t('login.register')}</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
