import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './BasicCardPayment.module.css';

const cardOptions = {
  basic: {
    label: 'Carte basique Derivcash',
    tier: 'BASIQUE',
    range: '1-200 EUR',
    number: '•••• 0200',
    price: '10 €',
    capacity: '1 € à 200 €',
    previewClass: styles.basicPreview,
    productId: 'prd_shu2yl',
    paymentUrl: 'https://eifdunpt.mychariow.shop/prd_shu2yl/checkout',
  },
  standard: {
    label: 'Carte Standard Derivcash',
    tier: 'STANDARD',
    range: '201-1000 EUR',
    number: '•••• 1000',
    price: '15 €',
    capacity: '201 € à 1000 €',
    previewClass: styles.standardPreview,
    productId: '',
    paymentUrl: '',
  },
  premium: {
    label: 'Carte Premium Derivcash',
    tier: 'PREMIUM',
    range: '1001-4000 EUR',
    number: '•••• 4000',
    price: '20 €',
    capacity: '1001 € à 4000 €',
    previewClass: styles.premiumPreview,
    productId: '',
    paymentUrl: '',
  },
} as const;

type CardKey = keyof typeof cardOptions;

export default function BasicCardPayment() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedCard = searchParams.get('card') as CardKey | null;
  const selectedCard = requestedCard && requestedCard in cardOptions ? cardOptions[requestedCard] : cardOptions.basic;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={styles.paymentPage}>
      <header className={styles.paymentHeader}>
        <Link to="/dashboard?tab=cards" className={styles.backLink}>
          <ArrowLeft size={18} />
          Retour au tableau de bord
        </Link>
        <div className={styles.brand}>Derivcash</div>
      </header>

      <main className={styles.paymentShell}>
        <section className={styles.paymentIntro}>
          <div className={`${styles.cardPreview} ${selectedCard.previewClass}`}>
            <div className={styles.cardPreviewTop}>
              <span>Derivcash</span>
              <CreditCard size={24} />
            </div>
            <div className={styles.cardPreviewChip} />
            <div className={styles.cardPreviewNumber}>{selectedCard.number}</div>
            <div className={styles.cardPreviewMeta}>
              <span>{selectedCard.tier}</span>
              <span>{selectedCard.range}</span>
            </div>
          </div>

          <div>
            <span className={styles.badge}>
              <ShieldCheck size={15} />
              Paiement sécurisé
            </span>
            <h1>{selectedCard.label}</h1>
            <p>Capacité de transfert de {selectedCard.capacity}. Prix de la carte : {selectedCard.price}.</p>
          </div>
        </section>

        <section className={styles.widgetPanel}>
          <h2>Finaliser l'obtention de la carte</h2>
          <p>Validez le paiement pour activer votre carte et transférer votre solde Derivcash.</p>
          {selectedCard.productId ? (
            <div className={styles.checkoutSection}>
              <div className={styles.directCheckout}>
                <a href={selectedCard.paymentUrl} className={styles.directCheckoutButton}>
                  <ExternalLink size={18} />
                  Payer maintenant
                </a>
                <p>Vous serez redirigé vers la page de paiement sécurisée pour finaliser votre carte.</p>
              </div>
            </div>
          ) : (
            <div className={styles.unconfiguredPayment}>
              <CreditCard size={34} />
              <h3>Paiement bientôt disponible</h3>
              <p>Le lien de paiement de cette carte n'est pas encore configuré. Ajoutez son identifiant produit pour activer le paiement.</p>
              <Link to="/dashboard?tab=cards" className={styles.returnButton}>
                Retourner à Mes Cartes
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
