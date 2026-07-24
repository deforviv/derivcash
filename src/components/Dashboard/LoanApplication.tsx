import { useState, useRef } from 'react';
import { 
  Briefcase, 
  User, 
  Zap, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Upload, 
  FileText,
  Loader2,
  Camera
} from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../context/AuthContext';
import styles from './LoanApplication.module.css';
export interface LoanData {
  amount: number;
  duration: number;
  solutionType: string;
  monthlyIncome: string;
  monthlyExpenses: string;
  employmentStatus: string;
  selfieBase64: string;
  identityBase64: string;
  idType: string;
}

interface LoanApplicationProps {
  onSuccess: (data: LoanData) => void;
  onCancel: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export default function LoanApplication({ onSuccess, onCancel }: LoanApplicationProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [solutionType, setSolutionType] = useState<'personal' | 'professional' | 'urgent' | ''>('');
  const [amount, setAmount] = useState(5000);
  const [duration, setDuration] = useState(24);
  
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');

  const [files, setFiles] = useState({
    selfie: false,
    identity: false,
  });

  const [fileData, setFileData] = useState({
    selfie: '',
    identity: ''
  });
  
  const [idType, setIdType] = useState('');
  // selfieSource: '' = not done, 'camera' = taken live, 'import' = file imported
  const [selfieSource, setSelfieSource] = useState<'' | 'camera' | 'import'>('');
  const selfieCameraRef = useRef<HTMLInputElement>(null);
  const selfieImportRef  = useRef<HTMLInputElement>(null);
  const identityFileRef  = useRef<HTMLInputElement>(null);

  const handleSelfieCamera = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const base64 = await fileToBase64(e.target.files[0]);
      setFileData(prev => ({ ...prev, selfie: base64 }));
      setSelfieSource('camera');
      setFiles(prev => ({ ...prev, selfie: true }));
    }
  };

  const handleSelfieImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const base64 = await fileToBase64(e.target.files[0]);
      setFileData(prev => ({ ...prev, selfie: base64 }));
      setSelfieSource('import');
      setFiles(prev => ({ ...prev, selfie: true }));
    }
  };

  const solutions = [
    {
      id: 'personal',
      title: 'Besoin personnel',
      desc: 'Pour un projet de vie ou une dépense imprévue.',
      icon: <User size={24} />,
      min: 200,
      max: 50000,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.1)'
    },
    {
      id: 'professional',
      title: 'Projet professionnel',
      desc: 'Développez votre activité avec flexibilité.',
      icon: <Briefcase size={24} />,
      min: 1000,
      max: 100000,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.1)'
    },
    {
      id: 'urgent',
      title: 'Besoin urgent',
      desc: 'Réponse et déblocage sous 24h garantis.',
      icon: <Zap size={24} />,
      min: 200,
      max: 10000,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)'
    }
  ];

  const activeSolution = solutions.find(s => s.id === solutionType);

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleSolutionSelect = (id: any) => {
    setSolutionType(id);
    const sol = solutions.find(s => s.id === id);
    if (sol && (amount < sol.min || amount > sol.max)) {
      setAmount(sol.min + (sol.max - sol.min) * 0.1); // Default to 10% of max
    }
    setTimeout(handleNext, 300);
  };

  const calculateMonthlyPayment = () => {
    // Dummy calculation for UI purposes (e.g., 3.5% interest rate)
    const rate = 0.035 / 12;
    const payment = (amount * rate) / (1 - Math.pow(1 + rate, -duration));
    return payment.toFixed(2);
  };

  const handleIdentityUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const base64 = await fileToBase64(e.target.files[0]);
      setFileData(prev => ({ ...prev, identity: base64 }));
      setFiles(prev => ({ ...prev, identity: true }));
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    
    // Check if we need to insert profile_id. 
    // Since we are mocking Auth with local storage, we fetch the actual UUID of this user from DB.
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', user.email)
      .single();

    if (profile) {
      const { error } = await supabase.from('loan_applications').insert([
        {
          profile_id: profile.id,
          solution_type: solutionType,
          amount,
          duration_months: duration,
          employment_status: employmentStatus,
          monthly_income: parseFloat(monthlyIncome),
          monthly_expenses: parseFloat(monthlyExpenses),
          documents: {
            selfie: {
              uploaded: files.selfie,
              source: selfieSource,
              data_url: fileData.selfie,
            },
            identity: {
              uploaded: files.identity,
              id_type: idType,
              data_url: fileData.identity,
            }
          },
          status: 'pending'
        }
      ]);

      if (error) {
        console.error("Error creating loan:", error);
      }
    }
    
    setIsSubmitting(false);
    onSuccess({
      amount,
      duration,
      solutionType,
      monthlyIncome,
      monthlyExpenses,
      employmentStatus,
      selfieBase64: fileData.selfie,
      identityBase64: fileData.identity,
      idType
    });
  };

  return (
    <div className={styles.wizardContainer}>
      <div className={styles.wizardHeader}>
        <div className={styles.headerTop}>
          <h2>Demande de Financement</h2>
          <button className={styles.cancelBtn} onClick={onCancel}>Annuler</button>
        </div>
        
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${(step / 4) * 100}%` }} />
          </div>
          <div className={styles.progressSteps}>
            <span className={step >= 1 ? styles.stepActive : ''}>Solution</span>
            <span className={step >= 2 ? styles.stepActive : ''}>Montant</span>
            <span className={step >= 3 ? styles.stepActive : ''}>Informations</span>
            <span className={step >= 4 ? styles.stepActive : ''}>Documents</span>
          </div>
        </div>
      </div>

      <div className={styles.wizardBody}>
        {/* STEP 1: SOLUTION TYPE */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Quel est votre projet ?</h3>
            <p className={styles.stepSubtitle}>Choisissez la solution la plus adaptée à vos besoins actuels.</p>
            
            <div className={styles.solutionsGrid}>
              {solutions.map((sol) => (
                <div
                  key={sol.id}
                  className={`${styles.solutionCard} ${solutionType === sol.id ? styles.solutionActive : ''}`}
                  onClick={() => handleSolutionSelect(sol.id)}
                  style={{ '--card-color': sol.color } as React.CSSProperties}
                >
                  <div className={styles.solHeader}>
                    <div className={styles.solIcon} style={{ backgroundColor: sol.bg, color: sol.color }}>
                      {sol.icon}
                    </div>
                    <div className={styles.solBadge}>
                      {sol.min.toLocaleString('fr-FR')}€ - {sol.max.toLocaleString('fr-FR')}€
                    </div>
                  </div>
                  <h4>{sol.title}</h4>
                  <p>{sol.desc}</p>
                  
                  <button 
                    className={styles.chooseBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSolutionSelect(sol.id);
                    }}
                  >
                    Choisir <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: AMOUNT AND DURATION */}
        {step === 2 && activeSolution && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Définissez votre prêt</h3>
            <p className={styles.stepSubtitle}>Ajustez le montant et la durée pour trouver la mensualité idéale.</p>
            
            <div className={styles.calculatorSection}>
              <div className={styles.calcControls}>
                <div className={styles.sliderGroup}>
                  <div className={styles.sliderHeader}>
                    <label>Montant souhaité</label>
                    <span className={styles.sliderValue}>{amount.toLocaleString('fr-FR')} €</span>
                  </div>
                  <input 
                    type="range" 
                    min={activeSolution.min} 
                    max={activeSolution.max} 
                    step={100}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className={styles.slider}
                  />
                  <div className={styles.sliderBounds}>
                    <span>{activeSolution.min}€</span>
                    <span>{activeSolution.max}€</span>
                  </div>
                </div>

                <div className={styles.sliderGroup}>
                  <div className={styles.sliderHeader}>
                    <label>Durée de remboursement</label>
                    <span className={styles.sliderValue}>{duration} mois</span>
                  </div>
                  <input 
                    type="range" 
                    min={6} 
                    max={84} 
                    step={6}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className={styles.slider}
                  />
                  <div className={styles.sliderBounds}>
                    <span>6 mois</span>
                    <span>84 mois</span>
                  </div>
                </div>
              </div>

              <div className={styles.calcResult}>
                <h4>Mensualité estimée</h4>
                <div className={styles.monthlyPayment}>
                  {calculateMonthlyPayment()} <span>€ / mois</span>
                </div>
                <p className={styles.calcNote}>TAEG fixe de 3.5%. Montant total dû: {((parseFloat(calculateMonthlyPayment()) * duration)).toFixed(2)} €</p>
                <div className={styles.calcSummary}>
                  <div className={styles.summaryItem}>
                    <span>Type de prêt</span>
                    <strong>{activeSolution.title}</strong>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Taux d'intérêt</span>
                    <strong>Fixe</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <button className={styles.btnBack} onClick={handlePrev}><ChevronLeft size={20} /> Retour</button>
              <button className={styles.btnNext} onClick={handleNext}>Continuer <ChevronRight size={20} /></button>
            </div>
          </div>
        )}

        {/* STEP 3: INFORMATION */}
        {step === 3 && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Informations financières</h3>
            <p className={styles.stepSubtitle}>Ces informations nous permettent de valider votre capacité de remboursement.</p>
            
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Situation professionnelle</label>
                <select 
                  className={styles.fieldInput} 
                  value={employmentStatus}
                  onChange={(e) => setEmploymentStatus(e.target.value)}
                  required
                >
                  <option value="">Sélectionnez votre situation</option>
                  <option value="CDI">Salarié (CDI)</option>
                  <option value="CDD">Salarié (CDD / Intérim)</option>
                  <option value="Indépendant">Indépendant / Chef d'entreprise</option>
                  <option value="Retraité">Retraité</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Revenus nets mensuels (€)</label>
                  <input 
                    type="number" 
                    className={styles.fieldInput}
                    placeholder="Ex: 2500"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    required 
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Charges mensuelles (€)</label>
                  <input 
                    type="number" 
                    className={styles.fieldInput}
                    placeholder="Loyer, autres crédits..."
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(e.target.value)}
                    required 
                  />
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <button className={styles.btnBack} onClick={handlePrev}><ChevronLeft size={20} /> Retour</button>
              <button 
                className={styles.btnNext} 
                onClick={handleNext}
                disabled={!employmentStatus || !monthlyIncome || !monthlyExpenses}
              >
                Continuer <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: DOCUMENTS */}
        {step === 4 && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Pièces justificatives</h3>
            <p className={styles.stepSubtitle}>Téléversez vos documents pour finaliser votre demande. Formats acceptés : PDF, JPG, PNG.</p>
            
            <div className={styles.documentsGrid}>
              
              {/* Selfie */}
              <div className={`${styles.docUploadCard} ${files.selfie ? styles.docUploaded : ''}`}>
                <div className={styles.docIcon}>
                  {files.selfie ? <Check size={24} className={styles.successColor} /> : <Camera size={24} />}
                </div>
                <div className={styles.docInfo}>
                  <h4>Selfie de vérification</h4>
                  <p>Prenez un selfie en direct pour confirmer votre identité.</p>
                </div>
                {!files.selfie ? (
                  <div className={styles.selfieActions}>
                    {/* Camera: opens front camera directly */}
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      ref={selfieCameraRef}
                      style={{ display: 'none' }}
                      onChange={handleSelfieCamera}
                    />
                    {/* Import: opens file explorer */}
                    <input
                      type="file"
                      accept="image/*"
                      ref={selfieImportRef}
                      style={{ display: 'none' }}
                      onChange={handleSelfieImport}
                    />
                    <button
                      className={styles.uploadBtnCamera}
                      onClick={() => selfieCameraRef.current?.click()}
                    >
                      <Camera size={15} /> Prendre
                    </button>
                    <button
                      className={styles.uploadBtn}
                      onClick={() => selfieImportRef.current?.click()}
                    >
                      <Upload size={15} /> Importer
                    </button>
                  </div>
                ) : (
                  <span className={styles.uploadedText}>
                    {selfieSource === 'camera' ? '✓ Photo prise' : '✓ Selfie ajouté'}
                  </span>
                )}
              </div>

              {/* Pièce d'identité */}
              <div className={`${styles.docUploadCard} ${files.identity ? styles.docUploaded : ''} ${!files.selfie ? styles.docDisabled : ''}`}>
                <div className={styles.docIcon}>
                  {files.identity ? <Check size={24} className={styles.successColor} /> : <FileText size={24} />}
                </div>
                <div className={styles.docInfo}>
                  <h4>Pièce d'identité</h4>
                  {!files.identity ? (
                    <select 
                      className={styles.docSelect} 
                      value={idType} 
                      onChange={(e) => setIdType(e.target.value)}
                      disabled={!files.selfie}
                    >
                      <option value="">Sélectionnez le document...</option>
                      <option value="cni">Carte d'identité</option>
                      <option value="passport">Passeport</option>
                      <option value="license">Permis de conduire</option>
                    </select>
                  ) : (
                    <p>Document: {idType === 'cni' ? "Carte d'identité" : idType === 'passport' ? "Passeport" : "Permis de conduire"}</p>
                  )}
                </div>
                {!files.identity ? (
                  <>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      ref={identityFileRef}
                      style={{ display: 'none' }}
                      onChange={handleIdentityUpload}
                    />
                    <button 
                      className={styles.uploadBtn} 
                      onClick={() => identityFileRef.current?.click()}
                      disabled={!files.selfie || !idType}
                      style={!files.selfie || !idType ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                      <Upload size={16} /> Parcourir
                    </button>
                  </>
                ) : (
                  <span className={styles.uploadedText}>✓ Téléversé</span>
                )}
              </div>
            </div>

            <div className={styles.formActions}>
              <button className={styles.btnBack} onClick={handlePrev} disabled={isSubmitting}><ChevronLeft size={20} /> Retour</button>
              <button 
                className={styles.btnSubmit} 
                onClick={handleSubmit}
                disabled={!files.selfie || !files.identity || isSubmitting}
              >
                {isSubmitting ? <Loader2 size={20} className={styles.spinner} /> : 'Soumettre mon dossier'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
