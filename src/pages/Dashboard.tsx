import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  History, 
  Settings, 
  LogOut, 
  Bell, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Menu,
  X,
  Clock,
  ShieldCheck,
  Users,
  Download,
  UserX,
  Send,
  CheckCircle,
  XCircle,
  FileDown,
  RefreshCw,
  Image,
  FileImage
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import LoanApplication from '../components/Dashboard/LoanApplication';
import type { LoanData } from '../components/Dashboard/LoanApplication';
import LoanSuccessPdf from '../components/Dashboard/LoanSuccessPdf';
import styles from './Dashboard.module.css';

type AdminProfile = {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  role?: 'user' | 'admin';
  wallet_balance?: number;
  is_banned?: boolean;
  created_at?: string;
};

type AdminLoan = {
  id: string;
  profile_id: string;
  solution_type: string;
  amount: number;
  duration_months: number;
  employment_status: string;
  monthly_income: number;
  monthly_expenses: number;
  documents?: LoanDocuments | string | null;
  status: string;
  created_at?: string;
  reviewed_at?: string | null;
};

type LoanDocumentFile = {
  uploaded?: boolean;
  source?: string;
  id_type?: string;
  data_url?: string;
};

type LoanDocuments = {
  selfie?: LoanDocumentFile | boolean;
  identity?: LoanDocumentFile | boolean;
  id_type?: string;
};

type UserNotification = {
  id: string;
  title: string;
  message: string;
  created_at?: string;
};

type UserLoan = {
  id: string;
  solution_type: string;
  amount: number;
  duration_months: number;
  monthly_income?: number;
  monthly_expenses?: number;
  status: string;
  created_at?: string;
  reviewed_at?: string | null;
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    return tab === 'cards' ? 'cards' : 'overview';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submittedLoanData, setSubmittedLoanData] = useState<LoanData | null>(null);
  const [persistentPendingAmount, setPersistentPendingAmount] = useState<number | null>(null);
  const [hasActiveLoan, setHasActiveLoan] = useState(false);
  const [hasExistingLoan, setHasExistingLoan] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [pendingLoan, setPendingLoan] = useState<UserLoan | null>(null);
  const [activeLoan, setActiveLoan] = useState<UserLoan | null>(null);
  const [cardEligibilityMessage, setCardEligibilityMessage] = useState('');

  useEffect(() => {
    const fetchLoanStatus = async () => {
      if (!user) return;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id,wallet_balance')
          .eq('email', user.email)
          .single();
          
        if (profile) {
          setWalletBalance(Number(profile.wallet_balance || 0));

          setPersistentPendingAmount(null);
          setHasActiveLoan(false);
          setHasExistingLoan(false);
          setPendingLoan(null);
          setActiveLoan(null);

          // Check pending loan
          const { data: pendingLoanData } = await supabase
            .from('loan_applications')
            .select('id,solution_type,amount,duration_months,monthly_income,monthly_expenses,status,created_at,reviewed_at')
            .eq('profile_id', profile.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          if (pendingLoanData) {
            setPendingLoan(pendingLoanData as UserLoan);
            setPersistentPendingAmount(pendingLoanData.amount);
          }

          // Check active/approved loan (in repayment)
          const { data: activeLoanData } = await supabase
            .from('loan_applications')
            .select('id,solution_type,amount,duration_months,monthly_income,monthly_expenses,status,created_at,reviewed_at')
            .eq('profile_id', profile.id)
            .in('status', ['approved', 'active'])
            .order('reviewed_at', { ascending: false })
            .limit(1)
            .single();

          if (activeLoanData) {
            setActiveLoan(activeLoanData as UserLoan);
            setHasActiveLoan(true);
          }

          // Track if ANY loan exists (for button label)
          const { data: anyLoan } = await supabase
            .from('loan_applications')
            .select('id')
            .eq('profile_id', profile.id)
            .limit(1)
            .single();

          if (anyLoan) {
            setHasExistingLoan(true);
          }

          const { data: profileNotifications } = await supabase
            .from('notifications')
            .select('id,title,message,created_at')
            .eq('profile_id', profile.id)
            .order('created_at', { ascending: false });

          setNotifications(profileNotifications || []);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération du statut de prêt", err);
      }
    };
    fetchLoanStatus();
  }, [user]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  // If a user goes directly to /dashboard but isn't logged in, redirect them
  if (!user) {
    navigate('/login');
    return null;
  }

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  const handleLogout = () => {
    setShowLogoutModal(true);
    setSidebarOpen(false);
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Aperçu' },
    { id: 'loans', icon: <Wallet size={20} />, label: 'Mes Prêts' },
    { id: 'cards', icon: <CreditCard size={20} />, label: 'Cartes' },
    { id: 'transactions', icon: <History size={20} />, label: 'Transactions' },
    { id: 'notifications', icon: <Bell size={20} />, label: 'Notifications' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Paramètres' },
  ];

  const hasPendingLoan = !!(submittedLoanData || persistentPendingAmount);
  // Cannot apply if pending OR active loan exists
  const canApplyForLoan = !hasPendingLoan && !hasActiveLoan;
  const loanBtnLabel = hasExistingLoan || submittedLoanData ? 'Demander un nouveau prêt' : 'Demander mon premier prêt';
  const getLoanMonthlyPayment = (loan: UserLoan) => {
    const amount = Number(loan.amount || 0);
    const duration = Number(loan.duration_months || 1);
    const rate = 0.035 / 12;
    return ((amount * rate) / (1 - Math.pow(1 + rate, -duration))).toFixed(2);
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className={styles.modalOverlay} onClick={() => setShowLogoutModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <LogOut size={32} />
            </div>
            <h3 className={styles.modalTitle}>Se déconnecter ?</h3>
            <p className={styles.modalText}>Voulez-vous vraiment quitter votre espace Derivcash ? Vous devrez vous reconnecter pour accéder à votre compte.</p>
            <div className={styles.modalActions}>
              <button className={styles.modalBtnCancel} onClick={() => setShowLogoutModal(false)}>
                Annuler
              </button>
              <button className={styles.modalBtnConfirm} onClick={confirmLogout}>
                <LogOut size={16} /> Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}

      {cardEligibilityMessage && (
        <div className={styles.modalOverlay} onClick={() => setCardEligibilityMessage('')}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={`${styles.modalIcon} ${styles.cardEligibilityIcon}`}>
              <CreditCard size={32} />
            </div>
            <h3 className={styles.modalTitle}>Carte basique requise</h3>
            <p className={styles.modalText}>{cardEligibilityMessage}</p>
            <div className={styles.modalActions}>
              <button className={styles.modalBtnCancel} onClick={() => setCardEligibilityMessage('')}>
                Annuler
              </button>
              <button
                className={styles.modalBtnConfirm}
                onClick={() => {
                  setCardEligibilityMessage('');
                  navigate('/payment/basic-card?card=basic');
                }}
              >
                <CreditCard size={16} /> Obtenir la carte Basique
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE SIDEBAR OVERLAY BACKDROP */}
      {sidebarOpen && (
        <div className={styles.sidebarBackdrop} onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarMobileOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>Derivcash</div>
          <button className={styles.sidebarCloseBtn} onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ''}`}
              onClick={() => handleTabChange(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={20} />
            <span>Se Déconnecter</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={styles.mainContent}>
        {/* TOPBAR */}
        <header className={styles.topbar}>
          <button className={styles.mobileMenuBtn} onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className={styles.greeting}>
            <h1>Bonjour, {user.first_name}</h1>
            <p>Bienvenue sur Derivcash. Votre parcours financier commence ici.</p>
          </div>
          <div className={styles.topActions}>
            <button className={styles.iconBtn} onClick={() => setActiveTab('notifications')}>
              <Bell size={20} />
              {notifications.length > 0 && <span className={styles.badge}>{notifications.length}</span>}
            </button>
            <div className={styles.avatar}>
              {user.first_name.charAt(0)}{user.last_name.charAt(0)}
            </div>
          </div>
        </header>

        {/* CONDITIONAL RENDER BASED ON ACTIVE TAB */}
        {activeTab === 'overview' && (
          <div className={styles.dashboardGrid}>
            {(submittedLoanData || persistentPendingAmount) && (
              <div className={styles.pendingAlert}>
                <div className={styles.pendingIcon}>
                  <Clock size={24} />
                </div>
                <div className={styles.pendingInfo}>
                  <h4>Prêt en cours de traitement</h4>
                  <p>Votre demande de {(submittedLoanData?.amount || persistentPendingAmount)?.toLocaleString('fr-FR')} € est en cours d'analyse. Vous recevrez une réponse sous 24h au plus tard.</p>
                </div>
              </div>
            )}
            
            {/* BALANCE CARD (EMPTY STATE) */}
            <div className={styles.balanceCard}>
              <div className={styles.cardGlow} />
              <div className={styles.balanceHeader}>
                <span>Solde Disponible</span>
                <TrendingUp size={20} className={styles.trendIcon} style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <div className={styles.balanceAmount}>
                {walletBalance.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span>€</span>
              </div>
              <div className={styles.balanceMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Capacité d'emprunt évaluée</span>
                  <span className={styles.metaValue}>Jusqu'à 50 000 €</span>
                </div>
              </div>
              {activeLoan && walletBalance > 0 ? (
                <button
                  className={styles.actionBtn}
                  onClick={() => setActiveTab('cards')}
                >
                  <Wallet size={18} />
                  Faire un retrait
                </button>
              ) : (
                <button 
                  className={styles.actionBtn}
                  onClick={() => canApplyForLoan && setActiveTab('apply_loan')}
                  disabled={!canApplyForLoan}
                  style={!canApplyForLoan ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  title={hasPendingLoan ? 'Votre demande est en cours de traitement.' : hasActiveLoan ? 'Vous avez déjà un prêt actif en remboursement.' : ''}
                >
                  <Plus size={18} />
                  {loanBtnLabel}
                </button>
              )}
            </div>

            {/* STATS CARDS (EMPTY) */}
            <div className={styles.statsContainer}>
              <div className={styles.statCard}>
                <div className={styles.statIconWrapper} style={{ backgroundColor: 'rgba(52, 211, 153, 0.05)', color: 'rgba(52, 211, 153, 0.5)' }}>
                  <ArrowUpRight size={24} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Revenus (Mois)</span>
                  <span className={styles.statValue}>0,00 €</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIconWrapper} style={{ backgroundColor: 'rgba(248, 113, 113, 0.05)', color: 'rgba(248, 113, 113, 0.5)' }}>
                  <ArrowDownRight size={24} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Dépenses (Mois)</span>
                  <span className={styles.statValue}>0,00 €</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIconWrapper} style={{ backgroundColor: 'rgba(96, 165, 250, 0.05)', color: 'rgba(96, 165, 250, 0.5)' }}>
                  <Wallet size={24} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Prochain Paiement</span>
                  <span className={styles.statValue}>--</span>
                </div>
              </div>
            </div>

            {/* RECENT TRANSACTIONS */}
            <div className={styles.transactionsSection}>
              <div className={styles.sectionHeader}>
                <h2>Transactions Récentes</h2>
              </div>
              
              <div className={styles.emptyTransactions}>
                <div className={styles.emptyIcon}>
                  <Wallet size={32} />
                </div>
                <h3>Aucune transaction pour le moment</h3>
                <p>Vos futures transactions apparaîtront ici une fois votre premier prêt approuvé.</p>
                <button 
                  className={styles.emptyActionBtn} 
                  onClick={() => canApplyForLoan && setActiveTab('apply_loan')}
                  disabled={!canApplyForLoan}
                  style={!canApplyForLoan ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  title={hasPendingLoan ? 'Votre demande est en cours de traitement.' : hasActiveLoan ? 'Vous avez déjà un prêt actif en remboursement.' : ''}
                >
                  <Plus size={16} />
                  Faire une demande
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'loans' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2>Mes Prêts</h2>
            </div>
            {activeLoan ? (
              <div className={styles.activeLoanCard}>
                <div className={styles.activeLoanHeader}>
                  <div>
                    <span className={styles.loanStatusBadge}>Prêt actif</span>
                    <h3>{Number(activeLoan.amount).toLocaleString('fr-FR')} €</h3>
                    <p>Montant versé sur votre portefeuille Derivcash.</p>
                  </div>
                  <div className={styles.activeLoanIcon}>
                    <Wallet size={30} />
                  </div>
                </div>
                <div className={styles.activeLoanDetails}>
                  <div>
                    <span>Type de prêt</span>
                    <strong>{activeLoan.solution_type}</strong>
                  </div>
                  <div>
                    <span>Durée</span>
                    <strong>{activeLoan.duration_months} mois</strong>
                  </div>
                  <div>
                    <span>Mensualité estimée</span>
                    <strong>{getLoanMonthlyPayment(activeLoan)} €</strong>
                  </div>
                  <div>
                    <span>Date d'activation</span>
                    <strong>{activeLoan.reviewed_at ? new Date(activeLoan.reviewed_at).toLocaleDateString('fr-FR') : 'Validé'}</strong>
                  </div>
                </div>
              </div>
            ) : pendingLoan || hasPendingLoan ? (
              <div className={styles.emptyTransactions} style={{ padding: '80px 24px', gridColumn: '1 / -1' }}>
                <div className={styles.emptyIcon} style={{ width: 80, height: 80 }}>
                  <Clock size={40} />
                </div>
                <h3 style={{ fontSize: '1.5rem' }}>Prêt en cours de traitement</h3>
                <p style={{ fontSize: '1.05rem' }}>Votre dossier est en cours d'analyse. Vous recevrez une réponse sous 24h.</p>
              </div>
            ) : (
              <div className={styles.emptyTransactions} style={{ padding: '80px 24px', gridColumn: '1 / -1' }}>
                <div className={styles.emptyIcon} style={{ width: 80, height: 80 }}>
                  <Wallet size={40} />
                </div>
                <h3 style={{ fontSize: '1.5rem' }}>Vous n'avez aucun prêt en cours</h3>
                <p style={{ fontSize: '1.05rem' }}>Découvrez vos offres personnalisées et obtenez un financement en moins de 24h.</p>
                <button 
                  className={styles.actionBtn} 
                  style={{ maxWidth: '300px', ...((!canApplyForLoan) ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
                  onClick={() => canApplyForLoan && setActiveTab('apply_loan')}
                  disabled={!canApplyForLoan}
                  title={hasPendingLoan ? 'Votre demande est en cours de traitement.' : hasActiveLoan ? 'Vous avez déjà un prêt actif en remboursement.' : ''}
                >
                  <Plus size={18} />
                  {loanBtnLabel}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'cards' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2>Mes Cartes</h2>
            </div>
            {!hasActiveLoan ? (
              <div className={styles.emptyTransactions} style={{ padding: '80px 24px', gridColumn: '1 / -1' }}>
                <div className={styles.emptyIcon} style={{ width: 80, height: 80 }}>
                  <CreditCard size={40} />
                </div>
                <h3 style={{ fontSize: '1.5rem' }}>
                  {hasPendingLoan ? 'Prêt en attente de validation' : 'Demandez votre premier prêt'}
                </h3>
                <p style={{ fontSize: '1.05rem' }}>
                  {hasPendingLoan
                    ? "Votre prêt doit d'abord être validé par l'administrateur avant d'accéder aux cartes Derivcash."
                    : "Votre profil doit demander son premier prêt avant d'accéder aux cartes Derivcash."}
                </p>
                {!hasPendingLoan && (
                  <button className={styles.actionBtn} style={{ maxWidth: '300px' }} onClick={() => setActiveTab('apply_loan')}>
                    <Plus size={18} />
                    Demander mon premier prêt
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className={styles.cardTransferNotice}>
                  <div className={styles.cardTransferIcon}>
                    <CreditCard size={30} />
                  </div>
                  <div>
                    <h3>Transfert vers carte Derivcash</h3>
                    <p>Vous devez transférer votre solde sur votre carte Derivcash avant de pouvoir lancer un retrait ou acheter en ligne.</p>
                    <p>Obtenez gratuitement une carte pour le transfert de votre solde.</p>
                  </div>
                </div>
                <div className={styles.cardPlansGrid}>
                  <div className={styles.cardPlan}>
                    <div className={`${styles.derivcashCardPreview} ${styles.basicCardPreview}`}>
                      <div className={styles.cardPreviewTop}>
                        <span>Derivcash</span>
                        <CreditCard size={22} />
                      </div>
                      <div className={styles.cardPreviewChip} />
                      <div className={styles.cardPreviewNumber}>•••• 0200</div>
                      <div className={styles.cardPreviewMeta}>
                        <span>BASIQUE</span>
                        <span>1-200 EUR</span>
                      </div>
                    </div>
                    <div className={styles.cardPlanHeader}>
                      <span>Carte basique</span>
                      <strong>Prix 10 €</strong>
                    </div>
                    <p>Capacité de transfert</p>
                    <h3>1 € à 200 €</h3>
                    <button
                      className={styles.emptyActionBtn}
                      onClick={() => {
                        setCardEligibilityMessage('');
                        navigate('/payment/basic-card?card=basic');
                      }}
                    >
                      <CreditCard size={16} />
                      Obtenir cette carte
                    </button>
                  </div>
                  <div className={styles.cardPlan}>
                    <div className={`${styles.derivcashCardPreview} ${styles.standardCardPreview}`}>
                      <div className={styles.cardPreviewTop}>
                        <span>Derivcash</span>
                        <CreditCard size={22} />
                      </div>
                      <div className={styles.cardPreviewChip} />
                      <div className={styles.cardPreviewNumber}>•••• 1000</div>
                      <div className={styles.cardPreviewMeta}>
                        <span>STANDARD</span>
                        <span>201-1000 EUR</span>
                      </div>
                    </div>
                    <div className={styles.cardPlanHeader}>
                      <span>Carte Standard</span>
                      <strong>Prix 15 €</strong>
                    </div>
                    <p>Capacité de transfert</p>
                    <h3>201 € à 1000 €</h3>
                    <button
                      className={styles.emptyActionBtn}
                      onClick={() => setCardEligibilityMessage("Votre profil doit d'abord obtenir une carte basique avant d'être éligible pour cette carte.")}
                    >
                      <CreditCard size={16} />
                      Obtenir cette carte
                    </button>
                  </div>
                  <div className={styles.cardPlan}>
                    <div className={`${styles.derivcashCardPreview} ${styles.premiumCardPreview}`}>
                      <div className={styles.cardPreviewTop}>
                        <span>Derivcash</span>
                        <CreditCard size={22} />
                      </div>
                      <div className={styles.cardPreviewChip} />
                      <div className={styles.cardPreviewNumber}>•••• 4000</div>
                      <div className={styles.cardPreviewMeta}>
                        <span>PREMIUM</span>
                        <span>1001-4000 EUR</span>
                      </div>
                    </div>
                    <div className={styles.cardPlanHeader}>
                      <span>Carte Premium</span>
                      <strong>Prix 20 €</strong>
                    </div>
                    <p>Capacité de transfert</p>
                    <h3>1001 € à 4000 €</h3>
                    <button
                      className={styles.emptyActionBtn}
                      onClick={() => setCardEligibilityMessage("Votre profil doit d'abord obtenir une carte basique avant d'être éligible pour cette carte.")}
                    >
                      <CreditCard size={16} />
                      Obtenir cette carte
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2>Historique des Transactions</h2>
            </div>
            <div className={styles.emptyTransactions} style={{ padding: '80px 24px', gridColumn: '1 / -1' }}>
              <div className={styles.emptyIcon} style={{ width: 80, height: 80 }}>
                <History size={40} />
              </div>
              <h3 style={{ fontSize: '1.5rem' }}>Aucune transaction</h3>
              <p style={{ fontSize: '1.05rem' }}>L'historique de toutes vos opérations sera conservé ici en toute sécurité.</p>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2>Notifications</h2>
            </div>
            {notifications.length > 0 ? (
              <div className={styles.notificationList}>
                {notifications.map((notification) => (
                  <div className={styles.notificationItem} key={notification.id}>
                    <div className={styles.notificationIcon}>
                      <Bell size={18} />
                    </div>
                    <div>
                      <h3>{notification.title}</h3>
                      <p>{notification.message}</p>
                      <span>{notification.created_at ? new Date(notification.created_at).toLocaleString('fr-FR') : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyTransactions} style={{ padding: '80px 24px', gridColumn: '1 / -1' }}>
                <div className={styles.emptyIcon} style={{ width: 80, height: 80 }}>
                  <Bell size={40} />
                </div>
                <h3 style={{ fontSize: '1.5rem' }}>Aucune notification</h3>
                <p style={{ fontSize: '1.05rem' }}>Les messages importants de Derivcash apparaîtront ici.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2>Paramètres du Profil</h2>
            </div>
            <div className={styles.settingsGrid}>
              <div className={styles.settingsCard}>
                <h3>Informations Personnelles</h3>
                <div className={styles.profileInfoList}>
                  <div className={styles.profileField}>
                    <span className={styles.profileLabel}>Nom complet</span>
                    <span className={styles.profileValue}>{user.first_name} {user.last_name}</span>
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.profileLabel}>Adresse Email</span>
                    <span className={styles.profileValue}>{user.email}</span>
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.profileLabel}>Téléphone</span>
                    <span className={styles.profileValue}>{user.phone}</span>
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.profileLabel}>Localisation</span>
                    <span className={styles.profileValue}>{user.city}, {user.country}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'apply_loan' && (
          <LoanApplication 
            onSuccess={(data) => {
              setSubmittedLoanData(data);
              setActiveTab('loan_success');
            }} 
            onCancel={() => setActiveTab('overview')} 
          />
        )}

        {activeTab === 'loan_success' && submittedLoanData && (
          <LoanSuccessPdf 
            loanData={submittedLoanData}
            onContinue={() => setActiveTab('overview')}
          />
        )}
      </main>
    </div>
  );
}

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loans, setLoans] = useState<AdminLoan[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');

  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId) || profiles[0];
  const visibleProfiles = profiles.filter((profile) => profile.role !== 'admin');
  const pendingLoans = loans.filter((loan) => loan.status === 'pending');

  const loadAdminData = async () => {
    setIsLoading(true);
    setAdminMessage('');

    const [{ data: profileRows, error: profileError }, { data: loanRows, error: loanError }] = await Promise.all([
      supabase
        .from('profiles')
        .select('id,first_name,last_name,gender,email,phone,country,city,role,wallet_balance,is_banned,created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false }),
    ]);

    if (profileError || loanError) {
      setAdminMessage('Impossible de charger toutes les donnees admin. Verifiez que la migration SQL a ete executee.');
    }

    const cleanProfiles = (profileRows || []) as AdminProfile[];
    setProfiles(cleanProfiles);
    setLoans((loanRows || []) as AdminLoan[]);
    setSelectedProfileId((current) => current || cleanProfiles.find((profile) => profile.role !== 'admin')?.id || cleanProfiles[0]?.id || '');
    setIsLoading(false);
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();
    }
  }, [user]);

  const getProfileName = (profileId: string) => {
    const profile = profiles.find((item) => item.id === profileId);
    return profile ? `${profile.first_name} ${profile.last_name}` : 'Profil inconnu';
  };

  const downloadJson = (filename: string, data: unknown) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const normalizeDocuments = (documents: AdminLoan['documents']): LoanDocuments => {
    if (!documents) return {};
    if (typeof documents === 'string') {
      try {
        return JSON.parse(documents) as LoanDocuments;
      } catch {
        return {};
      }
    }
    return documents;
  };

  const getDocumentFile = (loan: AdminLoan, key: 'selfie' | 'identity'): LoanDocumentFile | null => {
    const documentValue = normalizeDocuments(loan.documents)[key];
    if (!documentValue || typeof documentValue === 'boolean') return null;
    return documentValue.data_url ? documentValue : null;
  };

  const getDocumentExtension = (dataUrl: string) => {
    const mime = dataUrl.match(/^data:([^;]+);base64,/)?.[1] || '';
    if (mime.includes('pdf')) return 'pdf';
    if (mime.includes('png')) return 'png';
    if (mime.includes('webp')) return 'webp';
    return 'jpg';
  };

  const downloadDataUrl = (filename: string, dataUrl: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  };

  const downloadLoanDocument = (loan: AdminLoan, key: 'selfie' | 'identity') => {
    const documentFile = getDocumentFile(loan, key);
    if (!documentFile?.data_url) {
      setAdminMessage('Ce document n est pas disponible pour cette demande.');
      return;
    }

    const extension = getDocumentExtension(documentFile.data_url);
    downloadDataUrl(`derivcash-${key}-${loan.id}.${extension}`, documentFile.data_url);
  };

  const downloadProfile = (profile: AdminProfile) => {
    const profileLoans = loans.filter((loan) => loan.profile_id === profile.id);
    downloadJson(`derivcash-profil-${profile.email}.json`, { profile, loans: profileLoans });
  };

  const downloadAllProfiles = () => {
    const exportData = visibleProfiles.map((profile) => ({
      ...profile,
      loans: loans.filter((loan) => loan.profile_id === profile.id),
    }));
    downloadJson('derivcash-profils-export.json', exportData);
  };

  const sendNotification = async (profileId: string, title: string, message: string) => {
    if (!title.trim() || !message.trim()) {
      setAdminMessage('Veuillez saisir un titre et un message.');
      return false;
    }

    const { error } = await supabase.from('notifications').insert([
      {
        profile_id: profileId,
        title: title.trim(),
        message: message.trim(),
        sent_by: user?.id || null,
      },
    ]);

    if (error) {
      setAdminMessage(`Notification non envoyee: ${error.message}`);
      return false;
    }

    return true;
  };

  const handleLoanDecision = async (loan: AdminLoan, status: 'approved' | 'rejected') => {
    setAdminMessage('');

    if (status === 'approved') {
      const { error: approvalError } = await supabase.rpc('approve_loan_application', {
        p_loan_id: loan.id,
        p_admin_id: user?.id || null,
      });

      if (approvalError) {
        setAdminMessage(`Approbation impossible: ${approvalError.message}`);
        await loadAdminData();
        return;
      }

      await sendNotification(
        loan.profile_id,
        'Pret approuve',
        `Votre pret de ${Number(loan.amount).toLocaleString('fr-FR')} EUR a ete approuve et verse sur votre portefeuille Derivcash.`
      );
    } else {
      const { error: loanError } = await supabase
        .from('loan_applications')
        .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: user?.id || null })
        .eq('id', loan.id);

      if (loanError) {
        setAdminMessage(`Decision impossible: ${loanError.message}`);
        return;
      }

      await sendNotification(
        loan.profile_id,
        'Pret refuse',
        `Votre demande de pret de ${Number(loan.amount).toLocaleString('fr-FR')} EUR a ete refusee apres analyse.`
      );
    }

    setAdminMessage(status === 'approved' ? 'Pret approuve et portefeuille credite.' : 'Pret refuse et profil notifie.');
    await loadAdminData();
  };

  const toggleBan = async (profile: AdminProfile) => {
    const nextBanState = !profile.is_banned;
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: nextBanState, banned_at: nextBanState ? new Date().toISOString() : null })
      .eq('id', profile.id);

    if (error) {
      setAdminMessage(`Action impossible: ${error.message}`);
      return;
    }

    setAdminMessage(nextBanState ? 'Profil banni.' : 'Profil reactive.');
    await loadAdminData();
  };

  const handleManualNotification = async () => {
    if (!selectedProfile) return;
    const sent = await sendNotification(selectedProfile.id, notificationTitle, notificationMessage);
    if (sent) {
      setNotificationTitle('');
      setNotificationMessage('');
      setAdminMessage('Notification envoyee au profil selectionne.');
    }
  };

  const handleAdminLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>Derivcash</div>
        </div>
        <nav className={styles.sidebarNav}>
          <button className={`${styles.navItem} ${styles.navItemActive}`}>
            <ShieldCheck size={20} />
            <span>Administration</span>
          </button>
          <button className={styles.navItem} onClick={loadAdminData}>
            <RefreshCw size={20} />
            <span>Actualiser</span>
          </button>
        </nav>
        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleAdminLogout}>
            <LogOut size={20} />
            <span>Se Deconnecter</span>
          </button>
        </div>
      </aside>

      <main className={`${styles.mainContent} ${styles.adminMainContent}`}>
        <header className={styles.topbar}>
          <div className={styles.greeting}>
            <h1>Administration Derivcash</h1>
            <p>Gestion des profils, prets, bannissements et notifications.</p>
          </div>
          <div className={styles.topActions}>
            <button className={styles.adminLogoutTopBtn} onClick={handleAdminLogout} type="button">
              <LogOut size={16} />
              Déconnexion
            </button>
            <button className={styles.emptyActionBtn} onClick={downloadAllProfiles} disabled={visibleProfiles.length === 0}>
              <FileDown size={16} />
              Export global
            </button>
            <div className={styles.avatar}>AD</div>
          </div>
        </header>

        {adminMessage && <div className={styles.adminNotice}>{adminMessage}</div>}

        <div className={styles.adminStatsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper}>
              <Users size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Profils clients</span>
              <span className={styles.statValue}>{visibleProfiles.length}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper}>
              <Clock size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Prets en attente</span>
              <span className={styles.statValue}>{pendingLoans.length}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper}>
              <UserX size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Profils bannis</span>
              <span className={styles.statValue}>{visibleProfiles.filter((profile) => profile.is_banned).length}</span>
            </div>
          </div>
        </div>

        <section className={styles.adminSection}>
          <div className={styles.sectionHeader}>
            <h2>Profils existants</h2>
          </div>
          <div className={styles.adminTableWrap}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Profil</th>
                  <th>Contact</th>
                  <th>Localisation</th>
                  <th>Portefeuille</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleProfiles.map((profile) => (
                  <tr key={profile.id}>
                    <td>
                      <strong>{profile.first_name} {profile.last_name}</strong>
                      <span>{profile.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR') : ''}</span>
                    </td>
                    <td>
                      <strong>{profile.email}</strong>
                      <span>{profile.phone}</span>
                    </td>
                    <td>{profile.city}, {profile.country}</td>
                    <td>{Number(profile.wallet_balance || 0).toLocaleString('fr-FR')} EUR</td>
                    <td>
                      <span className={profile.is_banned ? styles.statusDanger : styles.statusOk}>
                        {profile.is_banned ? 'Banni' : 'Actif'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.adminActions}>
                        <button onClick={() => setSelectedProfileId(profile.id)}>Ouvrir</button>
                        <button onClick={() => downloadProfile(profile)} title="Telecharger les informations">
                          <Download size={15} />
                        </button>
                        <button onClick={() => toggleBan(profile)} title={profile.is_banned ? 'Reactiver' : 'Bannir'}>
                          <UserX size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {isLoading && <p className={styles.adminEmpty}>Chargement...</p>}
            {!isLoading && visibleProfiles.length === 0 && <p className={styles.adminEmpty}>Aucun profil client pour le moment.</p>}
          </div>
        </section>

        <section className={styles.adminSplit}>
          <div className={styles.adminSection}>
            <div className={styles.sectionHeader}>
              <h2>Demandes de pret</h2>
            </div>
            <div className={styles.loanDecisionList}>
              {loans.map((loan) => {
                const selfieDocument = getDocumentFile(loan, 'selfie');
                const identityDocument = getDocumentFile(loan, 'identity');

                return (
                  <div className={styles.loanDecisionItem} key={loan.id}>
                    <div>
                      <h3>{getProfileName(loan.profile_id)}</h3>
                      <p>{Number(loan.amount).toLocaleString('fr-FR')} EUR sur {loan.duration_months} mois</p>
                      <span>{loan.solution_type} - {loan.employment_status} - {loan.status}</span>
                      <div className={styles.loanDocuments}>
                        {selfieDocument ? (
                          <div className={styles.documentPreview}>
                            <Image size={16} />
                            <span>Selfie envoye</span>
                            <button onClick={() => downloadLoanDocument(loan, 'selfie')}>
                              <Download size={14} />
                              Télécharger
                            </button>
                          </div>
                        ) : (
                          <div className={styles.documentMissing}>
                            <Image size={16} />
                            <span>Selfie non disponible</span>
                          </div>
                        )}
                        {identityDocument ? (
                          <div className={styles.documentPreview}>
                            <FileImage size={16} />
                            <span>
                              Piece d'identite {identityDocument.id_type ? `(${identityDocument.id_type})` : ''}
                            </span>
                            <button onClick={() => downloadLoanDocument(loan, 'identity')}>
                              <Download size={14} />
                              Télécharger
                            </button>
                          </div>
                        ) : (
                          <div className={styles.documentMissing}>
                            <FileImage size={16} />
                            <span>Document d'identite non disponible</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {loan.status === 'pending' ? (
                      <div className={styles.adminActions}>
                        <button className={styles.approveBtn} onClick={() => handleLoanDecision(loan, 'approved')}>
                          <CheckCircle size={16} />
                          Approuver
                        </button>
                        <button className={styles.rejectBtn} onClick={() => handleLoanDecision(loan, 'rejected')}>
                          <XCircle size={16} />
                          Refuser
                        </button>
                      </div>
                    ) : (
                      <span className={loan.status === 'approved' ? styles.statusOk : styles.statusDanger}>
                        {loan.status === 'approved' ? 'Approuve' : 'Refuse'}
                      </span>
                    )}
                  </div>
                );
              })}
              {loans.length === 0 && <p className={styles.adminEmpty}>Aucune demande de pret.</p>}
            </div>
          </div>

          <div className={styles.adminSection}>
            <div className={styles.sectionHeader}>
              <h2>Notification individuelle</h2>
            </div>
            <div className={styles.adminForm}>
              <label>Profil</label>
              <select value={selectedProfile?.id || ''} onChange={(event) => setSelectedProfileId(event.target.value)}>
                {visibleProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.first_name} {profile.last_name} - {profile.email}
                  </option>
                ))}
              </select>
              <label>Titre</label>
              <input value={notificationTitle} onChange={(event) => setNotificationTitle(event.target.value)} placeholder="Ex: Mise a jour de votre dossier" />
              <label>Message</label>
              <textarea value={notificationMessage} onChange={(event) => setNotificationMessage(event.target.value)} placeholder="Votre message..." rows={6} />
              <button className={styles.actionBtn} onClick={handleManualNotification} disabled={!selectedProfile}>
                <Send size={18} />
                Envoyer la notification
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
