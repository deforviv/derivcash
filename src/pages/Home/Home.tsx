import { useState, type MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './Home.module.css';
import { ArrowRight, CheckCircle2, Shield, Clock, FileText, User, Globe, LayoutDashboard, CreditCard, Settings, Bell } from 'lucide-react';
import AnimatedText from '../../components/ui/AnimatedText';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loanAmount, setLoanAmount] = useState<number>(5000);

  const locale = i18n.language === 'en' ? 'en-GB' : 'fr-FR';
  const protectedDestination = isAuthenticated ? '/dashboard' : '/register';
  const handleProtectedAction = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    navigate(protectedDestination);
  };

  return (
    <div className={styles.home}>
      {/* SECTION 1 - MAIN HERO */}
      <section className={styles.heroSection}>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <AnimatedText
              as="h1"
              text={`${t('hero.title1')} ${t('hero.title2')} ${t('hero.title3')}`}
              className={styles.heroTitle}
              delay={100}
              stagger={55}
            />
            <AnimatedText
              as="p"
              text={t('hero.subtitle')}
              className={styles.heroSubtitle}
              delay={400}
              stagger={35}
            />
            <div className={styles.heroActions}>
              <button className={`btn ${styles.btnHeroPrimary}`} onClick={handleProtectedAction}>{t('hero.cta')}</button>
              <Link to={protectedDestination} className={`btn ${styles.btnHeroOutline}`}>{t('nav.applyLoan')}</Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.productMockup}>
              <div className={styles.mockupHeader}>
                <span className={styles.mockupTitle}>
                  {i18n.language === 'en' ? 'Your loan application' : 'Votre demande de financement'}
                </span>
                <span className={styles.mockupProgress}>60%</span>
              </div>
              <div className={styles.mockupContent}>
                <div className={styles.mockupSteps}>
                  <div className={styles.mockupStep}>
                    <CheckCircle2 size={18} className={styles.stepIconSuccess} />
                    <span>{i18n.language === 'en' ? 'Personal information' : 'Informations personnelles'}</span>
                  </div>
                  <div className={styles.mockupStep}>
                    <CheckCircle2 size={18} className={styles.stepIconSuccess} />
                    <span>{i18n.language === 'en' ? 'Verification' : 'Vérification'}</span>
                  </div>
                  <div className={`${styles.mockupStep} ${styles.stepActive}`}>
                    <div className={styles.stepIconActive}></div>
                    <span>{i18n.language === 'en' ? 'Application review' : 'Étude de la demande'}</span>
                  </div>
                  <div className={`${styles.mockupStep} ${styles.stepPending}`}>
                    <div className={styles.stepIconPending}></div>
                    <span>{i18n.language === 'en' ? 'Decision' : 'Décision'}</span>
                  </div>
                </div>
                
                <div className={styles.mockupAdvisor}>
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Advisor" className={styles.advisorAvatar} />
                  <div className={styles.advisorInfo}>
                    <span className={styles.advisorName}>Sarah M.</span>
                    <span className={styles.advisorRole}>{i18n.language === 'en' ? 'Your advisor' : 'Votre conseillère'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 - QUICK ACTIONS */}
      <section className={styles.actionsSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>{t('actions.title')}</h2>
          <div className={styles.actionGrid}>

            <a href={protectedDestination} onClick={handleProtectedAction} className={styles.actionCard} style={{ backgroundImage: `url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80&fit=crop')` }}>
              <div className={styles.actionCardOverlay} />
              <div className={styles.actionCardContent}>
                <div className={styles.actionCardIcon}>
                  <Shield size={22} />
                </div>
                <h3>{t('actions.eligibility.title')}</h3>
                <p>{t('actions.eligibility.description')}</p>
                <span className={styles.actionCardLink}>{i18n.language === 'en' ? 'Get started' : 'Commencer'} <ArrowRight size={15} /></span>
              </div>
            </a>

            <a href={protectedDestination} onClick={handleProtectedAction} className={styles.actionCard} style={{ backgroundImage: `url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80&fit=crop')` }}>
              <div className={styles.actionCardOverlay} />
              <div className={styles.actionCardContent}>
                <div className={styles.actionCardIcon}>
                  <FileText size={22} />
                </div>
                <h3>{t('actions.financing.title')}</h3>
                <p>{t('actions.financing.description')}</p>
                <span className={styles.actionCardLink}>{i18n.language === 'en' ? 'Apply now' : 'Faire une demande'} <ArrowRight size={15} /></span>
              </div>
            </a>

            <a href={protectedDestination} onClick={handleProtectedAction} className={styles.actionCard} style={{ backgroundImage: `url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80&fit=crop')` }}>
              <div className={styles.actionCardOverlay} />
              <div className={styles.actionCardContent}>
                <div className={styles.actionCardIcon}>
                  <Clock size={22} />
                </div>
                <h3>{t('actions.process.title')}</h3>
                <p>{t('actions.process.description')}</p>
                <span className={styles.actionCardLink}>{i18n.language === 'en' ? 'Learn more' : 'En savoir plus'} <ArrowRight size={15} /></span>
              </div>
            </a>

            <a href={protectedDestination} onClick={handleProtectedAction} className={styles.actionCard} style={{ backgroundImage: `url('https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80&fit=crop')` }}>
              <div className={styles.actionCardOverlay} />
              <div className={styles.actionCardContent}>
                <div className={styles.actionCardIcon}>
                  <FileText size={22} />
                </div>
                <h3>{t('actions.conditions.title')}</h3>
                <p>{t('actions.conditions.description')}</p>
                <span className={styles.actionCardLink}>{i18n.language === 'en' ? 'View conditions' : 'Voir les conditions'} <ArrowRight size={15} /></span>
              </div>
            </a>

          </div>
        </div>
      </section>
      
      {/* SECTION 3 - TRUST AND PLATFORM METRICS */}
      <section className={styles.trustSection}>
        <div className="container">
          <div className={styles.trustGrid}>
            <div className={styles.trustCard}>
              <div className={styles.trustIconWrap}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div className={styles.trustCardBody}>
                <strong>{t('trust.items.transparent')}</strong>
                <span>{t('trust.items.noFees')}</span>
              </div>
            </div>
            <div className={styles.trustCard}>
              <div className={styles.trustIconWrap}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div className={styles.trustCardBody}>
                <strong>{t('trust.items.secureVerification')}</strong>
                <span>{t('trust.items.encryptedData')}</span>
              </div>
            </div>
            <div className={styles.trustCard}>
              <div className={styles.trustIconWrap}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <div className={styles.trustCardBody}>
                <strong>{t('trust.items.onlineTracking')}</strong>
                <span>{t('trust.items.personalSpace')}</span>
              </div>
            </div>
            <div className={styles.trustCard}>
              <div className={styles.trustIconWrap}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div className={styles.trustCardBody}>
                <strong>{t('trust.items.supportAvailable')}</strong>
                <span>{t('trust.items.humanAssistance')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 - LOAN SOLUTIONS */}
      <section id="solutions" className={styles.solutionsSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>{t('solutions.sectionTitle')}</h2>
          <div className={styles.solutionsGrid}>

            <a href={protectedDestination} onClick={handleProtectedAction} className={styles.solutionCard} style={{ backgroundImage: `url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=80&fit=crop')` }}>
              <div className={styles.solutionOverlay} />
              <div className={styles.solutionCardContent}>
                <div className={styles.solutionBadges}>
                  <span className={styles.solutionBadge}>{t('solutions.personal.badge1')}</span>
                  <span className={styles.solutionBadge}>{t('solutions.personal.badge2')}</span>
                </div>
                <div className={styles.solutionCardBody}>
                  <h3>{t('solutions.personal.title')}</h3>
                  <p>{t('solutions.personal.description')}</p>
                </div>
                <span className={styles.solutionCardLink}>{t('solutions.personal.cta')} <ArrowRight size={15} /></span>
              </div>
            </a>

            <a href={protectedDestination} onClick={handleProtectedAction} className={styles.solutionCard} style={{ backgroundImage: `url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80&fit=crop')` }}>
              <div className={styles.solutionOverlay} />
              <div className={styles.solutionCardContent}>
                <div className={styles.solutionBadges}>
                  <span className={styles.solutionBadge}>{t('solutions.professional.badge1')}</span>
                  <span className={styles.solutionBadge}>{t('solutions.professional.badge2')}</span>
                </div>
                <div className={styles.solutionCardBody}>
                  <h3>{t('solutions.professional.title')}</h3>
                  <p>{t('solutions.professional.description')}</p>
                </div>
                <span className={styles.solutionCardLink}>{t('solutions.professional.cta')} <ArrowRight size={15} /></span>
              </div>
            </a>

            <a href={protectedDestination} onClick={handleProtectedAction} className={styles.solutionCard} style={{ backgroundImage: `url('https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&q=80&fit=crop')` }}>
              <div className={styles.solutionOverlay} />
              <div className={styles.solutionCardContent}>
                <div className={styles.solutionBadges}>
                  <span className={styles.solutionBadge}>{t('solutions.urgent.badge1')}</span>
                  <span className={styles.solutionBadge}>{t('solutions.urgent.badge2')}</span>
                </div>
                <div className={styles.solutionCardBody}>
                  <h3>{t('solutions.urgent.title')}</h3>
                  <p>{t('solutions.urgent.description')}</p>
                </div>
                <span className={styles.solutionCardLink}>{t('solutions.urgent.cta')} <ArrowRight size={15} /></span>
              </div>
            </a>

          </div>
        </div>
      </section>

      {/* SECTION 5 - HOW IT WORKS */}
      <section id="fonctionnement" className={styles.processSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>{t('process.sectionTitle')}</h2>
          <div className={styles.processGrid}>
            <div className={styles.processCard}>
              <div className={styles.processCardHeader}>
                <span className={styles.processStepNum}>01</span>
                <div className={styles.processIconWrapper}>
                  <User size={20} />
                </div>
              </div>
              <h4>{t('process.step1.title')}</h4>
              <p>{t('process.step1.description')}</p>
            </div>
            
            <div className={styles.processCard}>
              <div className={styles.processCardHeader}>
                <span className={styles.processStepNum}>02</span>
                <div className={styles.processIconWrapper}>
                  <Shield size={20} />
                </div>
              </div>
              <h4>{t('process.step2.title')}</h4>
              <p>{t('process.step2.description')}</p>
            </div>
            
            <div className={styles.processCard}>
              <div className={styles.processCardHeader}>
                <span className={styles.processStepNum}>03</span>
                <div className={styles.processIconWrapper}>
                  <FileText size={20} />
                </div>
              </div>
              <h4>{t('process.step3.title')}</h4>
              <p>{t('process.step3.description')}</p>
            </div>
            
            <div className={styles.processCard}>
              <div className={styles.processCardHeader}>
                <span className={styles.processStepNum}>04</span>
                <div className={styles.processIconWrapper}>
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <h4>{t('process.step4.title')}</h4>
              <p>{t('process.step4.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 - ELIGIBILITY CHECKER */}
      <section id="eligibilite" className={styles.eligibilitySection}>
        <div className="container">
          <div className={styles.eligibilityContainer}>
            <div className={styles.eligibilityHeader}>
              <h2 className={styles.sectionTitle}>{t('eligibility.sectionTitle')}</h2>
              <p>{t('eligibility.disclaimer')}</p>
              
              <ul className={styles.eligibilityFeatures}>
                <li><CheckCircle2 size={18} /> {i18n.language === 'en' ? 'Immediate indicative response' : 'Réponse de principe immédiate'}</li>
                <li><CheckCircle2 size={18} /> {i18n.language === 'en' ? 'No impact on your credit score' : 'Sans impact sur votre pointage de crédit'}</li>
                <li><CheckCircle2 size={18} /> {i18n.language === 'en' ? 'Financing from €200' : 'Financement à partir de 200 €'}</li>
              </ul>
            </div>
            
            <div className={styles.eligibilityForm}>
              <div className={styles.formGroup}>
                <label>{t('eligibility.form.country.label')} <Globe size={14} className={styles.labelIcon}/></label>
                <select className={styles.input} defaultValue="">
                  <option value="" disabled>{t('eligibility.form.country.placeholder')}</option>
                  <optgroup label={i18n.language === 'en' ? 'French-speaking Countries (Worldwide)' : 'Pays Francophones (Monde entier)'}>
                    <option>France</option>
                    <option>Belgique / Belgium</option>
                    <option>Suisse / Switzerland</option>
                    <option>Canada (Québec)</option>
                    <option>Côte d'Ivoire</option>
                    <option>Sénégal</option>
                    <option>Cameroun</option>
                    <option>{i18n.language === 'en' ? 'Other French-speaking countries...' : 'Autres pays francophones...'}</option>
                  </optgroup>
                  <optgroup label={i18n.language === 'en' ? 'English-speaking Countries (Worldwide)' : 'Pays Anglophones (Monde entier)'}>
                    <option>{i18n.language === 'en' ? 'United Kingdom' : 'Royaume-Uni'}</option>
                    <option>{i18n.language === 'en' ? 'United States' : 'États-Unis'}</option>
                    <option>{i18n.language === 'en' ? 'Canada (English)' : 'Canada (Anglophone)'}</option>
                    <option>Australia</option>
                    <option>Nigeria</option>
                    <option>{i18n.language === 'en' ? 'South Africa' : 'Afrique du Sud'}</option>
                    <option>{i18n.language === 'en' ? 'Other English-speaking countries...' : 'Autres pays anglophones...'}</option>
                  </optgroup>
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>{t('eligibility.form.purpose.label')}</label>
                  <select className={styles.input}>
                    <option>{t('eligibility.purposes.personal')}</option>
                    <option>{i18n.language === 'en' ? 'Vehicle purchase' : 'Achat véhicule'}</option>
                    <option>{i18n.language === 'en' ? 'Home improvement' : 'Travaux & Rénovation'}</option>
                    <option>{t('eligibility.purposes.professional')}</option>
                    <option>{t('eligibility.purposes.urgent')}</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>{t('eligibility.form.duration.label')}</label>
                  <select className={styles.input}>
                    <option>12 {t('eligibility.form.duration.months')}</option>
                    <option>24 {t('eligibility.form.duration.months')}</option>
                    <option>36 {t('eligibility.form.duration.months')}</option>
                    <option>48 {t('eligibility.form.duration.months')}</option>
                    <option>60 {t('eligibility.form.duration.months')}</option>
                  </select>
                </div>
              </div>

              <div className={styles.sliderContainer}>
                <div className={styles.sliderHeader}>
                  <label>{t('eligibility.form.amount.label')}</label>
                  <div className={styles.sliderValue}>{loanAmount.toLocaleString(locale)} €</div>
                </div>
                <input 
                  type="range" 
                  min="200" 
                  max="100000" 
                  step="100" 
                  value={loanAmount} 
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className={styles.rangeSlider} 
                  style={{ backgroundSize: `${((loanAmount - 200) * 100) / (100000 - 200)}% 100%` }}
                />
                <div className={styles.sliderLimits}>
                  <span>{t('eligibility.form.amount.min')}</span>
                  <span>100 000 €</span>
                </div>
              </div>

              <button className="btn btn-primary" onClick={handleProtectedAction} style={{ width: '100%', marginTop: 'var(--spacing-md)', fontSize: '1rem', padding: '14px' }}>
                {t('hero.cta')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 - CONTENT & DASHBOARD PREVIEW */}
      <section className={styles.contentSection}>
        <div className="container">
          <div className={styles.contentLayout}>
            
            <div className={styles.contentArticles}>
              <div className={styles.articlesHeader}>
                <h2 className={styles.sectionTitle}>{i18n.language === 'en' ? 'Understanding financing' : 'Comprendre le financement'}</h2>
                <p>{i18n.language === 'en' ? 'Clear resources to guide you at every step.' : 'Des ressources claires pour vous accompagner à chaque étape.'}</p>
              </div>
              <div className={styles.articlesList}>
                <a href={protectedDestination} onClick={handleProtectedAction} className={styles.articleCard}>
                  <div className={styles.articleCardContent}>
                    <h4>{i18n.language === 'en' ? 'How does a loan application work?' : 'Comment fonctionne une demande de prêt ?'}</h4>
                    <p>{i18n.language === 'en' ? 'Discover the 4 key steps in our secure validation process.' : 'Découvrez les 4 étapes clés de notre processus de validation sécurisé.'}</p>
                  </div>
                  <div className={styles.articleCardArrow}><ArrowRight size={20} /></div>
                </a>
                <a href={protectedDestination} onClick={handleProtectedAction} className={styles.articleCard}>
                  <div className={styles.articleCardContent}>
                    <h4>{i18n.language === 'en' ? 'Understanding rates and repayments' : 'Comprendre les taux et remboursements'}</h4>
                    <p>{i18n.language === 'en' ? 'Everything you need to know about APR, monthly payments and insurance.' : 'Tout savoir sur le TAEG, le calcul des mensualités et l\'assurance.'}</p>
                  </div>
                  <div className={styles.articleCardArrow}><ArrowRight size={20} /></div>
                </a>
                <a href={protectedDestination} onClick={handleProtectedAction} className={styles.articleCard}>
                  <div className={styles.articleCardContent}>
                    <h4>{i18n.language === 'en' ? 'How do we protect your data?' : 'Comment protégeons-nous vos données ?'}</h4>
                    <p>{i18n.language === 'en' ? 'Our advanced security protocols and bank-grade encryption explained.' : 'Nos protocoles de sécurité avancés et de chiffrement bancaire expliqués.'}</p>
                  </div>
                  <div className={styles.articleCardArrow}><ArrowRight size={20} /></div>
                </a>
              </div>
            </div>
            
            <div className={styles.dashboardPreviewSection}>
              <div className={styles.dashboardHeader}>
                <h2 className={styles.sectionTitle}>{i18n.language === 'en' ? 'Your personal space' : 'Votre espace personnel'}</h2>
                <p>{i18n.language === 'en' ? 'Manage your loans effortlessly from an intuitive dashboard.' : 'Gérez vos prêts en toute simplicité depuis un tableau de bord intuitif.'}</p>
              </div>
              
              <div className={styles.previewWindow}>
                <div className={styles.previewSidebar}>
                  <div className={styles.previewLogo}>D.</div>
                  <div className={styles.previewNavGroup}>
                    <div className={`${styles.previewNavItem} ${styles.active}`}><LayoutDashboard size={20} /></div>
                    <div className={styles.previewNavItem}><CreditCard size={20} /></div>
                    <div className={styles.previewNavItem}><FileText size={20} /></div>
                  </div>
                  <div className={styles.previewNavItem} style={{marginTop: 'auto'}}><Settings size={20} /></div>
                </div>
                
                <div className={styles.previewMain}>
                  <div className={styles.previewTopbar}>
                    <strong>{i18n.language === 'en' ? 'Overview' : 'Vue d\'ensemble'}</strong>
                    <div className={styles.previewUser}><Bell size={18} className={styles.bellIcon}/> <div className={styles.previewAvatar}></div></div>
                  </div>
                  
                  <div className={styles.previewCardsRow}>
                    <div className={styles.previewStatCard}>
                      <span>{i18n.language === 'en' ? 'Current payment' : 'Mensualité en cours'}</span>
                      <strong>245.00 € <span className={styles.statDetail}>(12 Nov)</span></strong>
                    </div>
                    <div className={styles.previewStatCard}>
                      <span>{i18n.language === 'en' ? 'Remaining balance' : 'Capital restant'}</span>
                      <strong>8 450.00 €</strong>
                    </div>
                  </div>

                  <div className={styles.previewRequestCard}>
                    <div className={styles.previewRequestHeader}>
                      <div className={styles.requestInfo}>
                        <strong>{i18n.language === 'en' ? 'Personal Loan #REQ-892' : 'Prêt Personnel #REQ-892'}</strong>
                        <span>{i18n.language === 'en' ? 'Submitted on Oct. 10' : 'Soumis le 10 Oct.'}</span>
                      </div>
                      <span className={styles.badgeWarning}>{i18n.language === 'en' ? 'Action required' : 'Action requise'}</span>
                    </div>
                    <div className={styles.previewRequestAction}>
                      <div className={styles.actionTextWrapper}>
                        <FileText size={16} className={styles.actionIcon} />
                        <span>{i18n.language === 'en' ? 'Please upload your proof of address' : 'Veuillez uploader votre justificatif de domicile'}</span>
                      </div>
                      <button className={styles.actionBtn}>{i18n.language === 'en' ? 'Upload' : 'Uploader'}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>
    </div>
  );
}
