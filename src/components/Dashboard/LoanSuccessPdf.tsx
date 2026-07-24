import { jsPDF } from 'jspdf';
import { useAuth } from '../../context/AuthContext';
import type { LoanData } from './LoanApplication';
import { FileDown, CheckCircle, ArrowRight } from 'lucide-react';
import styles from './LoanSuccessPdf.module.css';

interface Props {
  loanData: LoanData;
  onContinue: () => void;
}

export default function LoanSuccessPdf({ loanData, onContinue }: Props) {
  const { user } = useAuth();

  const handleDownloadPDF = () => {
    if (!user) return;
    const doc = new jsPDF();
    
    // Theme colors
    const primaryColor = [242, 66, 80]; // var(--color-accent) #f24250
    const textColor = [20, 20, 20];
    const lightText = [100, 100, 100];

    // Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("DERIVCASH", 105, 20, { align: "center" });

    // Title
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(16);
    doc.text("Demande de Financement - Synthèse", 20, 45);
    
    // User Info section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Informations Personnelles", 20, 60);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(lightText[0], lightText[1], lightText[2]);
    doc.text(`Nom complet : ${user.first_name} ${user.last_name}`, 20, 70);
    doc.text(`Email : ${user.email}`, 20, 78);
    doc.text(`Téléphone : ${user.phone}`, 20, 86);
    doc.text(`Localisation : ${user.city}, ${user.country}`, 20, 94);

    // Loan Info section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text("Détails du Prêt", 120, 60);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(lightText[0], lightText[1], lightText[2]);
    const solTitle = loanData.solutionType === 'personal' ? 'Besoin personnel' : 
                     loanData.solutionType === 'professional' ? 'Projet professionnel' : 'Besoin urgent';
    doc.text(`Type de prêt : ${solTitle}`, 120, 70);
    doc.text(`Montant demandé : ${loanData.amount.toLocaleString('fr-FR')} €`, 120, 78);
    doc.text(`Durée : ${loanData.duration} mois`, 120, 86);
    doc.text(`Revenus mensuels : ${loanData.monthlyIncome} €`, 120, 94);
    
    // Draw a line
    doc.setDrawColor(230, 230, 230);
    doc.line(20, 105, 190, 105);

    // Images Section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text("Pièces Justificatives", 20, 120);

    // Helper to add images if they are valid base64
    const addImgSafe = (base64String: string, x: number, y: number, w: number, h: number) => {
        try {
            if (base64String && base64String.startsWith('data:image')) {
               doc.addImage(base64String, 'JPEG', x, y, w, h);
            } else if (base64String && base64String.startsWith('data:application/pdf')) {
               doc.text("(Document PDF fourni - Non affichable dans ce reçu)", x, y + 10);
            }
        } catch (e) {
            console.error("Erreur ajout image PDF:", e);
            doc.text("(Erreur d'affichage de l'image)", x, y + 10);
        }
    };

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    // Selfie
    doc.text("Selfie de vérification", 20, 130);
    if (loanData.selfieBase64) {
        addImgSafe(loanData.selfieBase64, 20, 135, 60, 60);
    } else {
        doc.text("Aucun selfie fourni.", 20, 140);
    }

    // Identity Document
    const idTypeName = loanData.idType === 'cni' ? "Carte d'identité" : 
                       loanData.idType === 'passport' ? "Passeport" : 
                       loanData.idType === 'license' ? "Permis de conduire" : "Document";
    doc.text(`Document : ${idTypeName}`, 100, 130);
    if (loanData.identityBase64) {
        addImgSafe(loanData.identityBase64, 100, 135, 90, 60);
    } else {
        doc.text("Aucun document fourni.", 100, 140);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Document généré automatiquement par Derivcash.", 105, 280, { align: "center" });
    
    doc.save("derivcash_contrat_pret.pdf");
  };

  return (
    <div className={styles.successContainer}>
      <div className={styles.successCard}>
        <div className={styles.iconCircle}>
          <CheckCircle size={48} className={styles.successIcon} />
        </div>
        
        <h2 className={styles.title}>Demande envoyée avec succès !</h2>
        <p className={styles.subtitle}>
          Votre dossier est en cours d'analyse par notre équipe. 
          Vous recevrez une réponse sous 24h.
        </p>

        <div className={styles.actionsBox}>
          <button className={styles.btnDownload} onClick={handleDownloadPDF}>
            <FileDown size={20} />
            Télécharger mon contrat (PDF)
          </button>
          
          <button className={styles.btnContinue} onClick={onContinue}>
            Retour au tableau de bord <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
