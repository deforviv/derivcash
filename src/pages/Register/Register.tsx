import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, Eye, EyeOff, ShieldCheck, ChevronRight, ChevronDown, Loader2, Mars, Venus } from 'lucide-react';
import { sendVerificationEmail } from '../../utils/brevo';
import { checkDuplicate, createProfile } from '../../utils/supabase';
import { useAuth } from '../../context/AuthContext';
import styles from './Register.module.css';

export default function Register() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);

  // Step 1 fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Step 3 fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Field-level error messages
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordMismatchError, setPasswordMismatchError] = useState('');

  // Verification State
  const [generatedCode, setGeneratedCode] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSending, setIsSending] = useState(false);
  const [otpError, setOtpError] = useState(false);
  
  // Custom Select State
  const [country, setCountry] = useState('');
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setIsCountryOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const francophoneCountries = [
    "Belgique", "Bénin", "Burkina Faso", "Burundi", "Cameroun", "Canada", "Comores", 
    "Congo", "Côte d'Ivoire", "Djibouti", "France", "Gabon", "Guinée", "Guinée équatoriale", 
    "Haïti", "Luxembourg", "Madagascar", "Mali", "Maurice", "Monaco", "Niger", 
    "République centrafricaine", "République démocratique du Congo", "Rwanda", "Sénégal", 
    "Seychelles", "Suisse", "Tchad", "Togo", "Vanuatu"
  ].sort((a, b) => a.localeCompare(b));
  
  const anglophoneCountries = [
    "Antigua and Barbuda", "Australia", "Bahamas", "Barbados", "Belize", "Botswana", 
    "Canada", "Dominica", "Eswatini", "Fiji", "Gambia", "Ghana", "Grenada", "Guyana", 
    "India", "Ireland", "Jamaica", "Kenya", "Kiribati", "Lesotho", "Liberia", "Malawi", 
    "Malta", "Marshall Islands", "Mauritius", "Micronesia", "Namibia", "Nauru", 
    "New Zealand", "Nigeria", "Pakistan", "Palau", "Papua New Guinea", "Philippines", 
    "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", 
    "Samoa", "Seychelles", "Sierra Leone", "Singapore", "Solomon Islands", "South Africa", 
    "South Sudan", "Sudan", "Tanzania", "Tonga", "Trinidad and Tobago", "Tuvalu", 
    "Uganda", "United Kingdom", "United States", "Vanuatu", "Zambia", "Zimbabwe"
  ].sort((a, b) => a.localeCompare(b));

  // City State
  const [city, setCity] = useState('');

  // Reset city when country changes
  useEffect(() => {
    setCity('');
  }, [country]);

  // Simple password strength calculation
  const getPasswordStrength = () => {
    if (password.length === 0) return 0;
    let strength = 0;
    if (password.length > 5) strength += 1;
    if (password.length > 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const strength = getPasswordStrength();
  const strengthClasses = ['weak', 'weak', 'fair', 'good', 'strong'];
  const strengthLabels = [
    t('register.strengthWeak'),
    t('register.strengthWeak'),
    t('register.strengthFair'),
    t('register.strengthGood'),
    t('register.strengthStrong'),
  ];

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      // Duplicate check on email + phone
      setIsSending(true);
      setEmailError('');
      setPhoneError('');
      const { emailTaken, phoneTaken } = await checkDuplicate(email, phone);

      setIsSending(false);
      
      if (emailTaken) {
        setEmailError(t('register.step1.emailTaken'));
        return;
      }
      if (phoneTaken) {
        setPhoneError(t('register.step1.phoneTaken'));
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      // Validate password match
      if (password !== confirmPassword) {
        setPasswordMismatchError(
          i18n.language === 'en' ? 'Passwords do not match.' : 'Les mots de passe ne correspondent pas.'
        );
        return;
      }
      setPasswordMismatchError('');
      // Generate OTP & send via Brevo
      setIsSending(true);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      const sent = await sendVerificationEmail(email, firstName, code, i18n.language as 'fr' | 'en');
      setIsSending(false);
      if (sent) {
        setStep(4);
      } else {
        alert(i18n.language === 'en' ? 'Failed to send verification email. Please try again.' : "Échec de l'envoi de l'email. Veuillez réessayer.");
      }
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otp.join('');
    if (enteredCode === generatedCode) {
      // Save profile to Supabase
      setIsSending(true);
      const newProfile = {
        first_name: firstName,
        last_name: lastName,
        gender,
        email,
        phone,
        country,
        city,
        password_hash: btoa(encodeURIComponent(password)), // Safe base64 encode
      };
      
      const { data, error } = await createProfile(newProfile);

      setIsSending(false);

      if (error || !data) {
        alert(i18n.language === 'en' ? `Registration failed: ${error}` : `Échec de l'inscription: ${error}`);
        return; // DO NOT PROCEED TO SUCCESS STEP
      }
      
      // Log the user in via AuthContext using the returned data from Supabase
      login(data);
      
      setStep(5);
      setTimeout(() => navigate('/dashboard'), 800);
    } else {
      setOtpError(true);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError(false);

    // Auto focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleResend = async () => {
    setIsSending(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    await sendVerificationEmail(email, firstName, code, i18n.language as 'fr'|'en');
    setIsSending(false);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const stepLabels = t('register.stepLabels', { returnObjects: true }) as string[];
  const sideFeatures = t('register.sideFeatures', { returnObjects: true }) as string[];

  return (
    <div className={styles.registerPage}>
      {/* LEFT PANEL */}
      <div className={styles.leftPanel}>
        <div className={styles.leftBg} />
        <div className={styles.leftOverlay} />
        
        <div className={styles.leftContent}>
          <Link to="/" className={styles.leftLogo}>Derivcash</Link>
          
          <div className={styles.leftBody}>
            <h1 className={styles.leftTagline}>{t('register.sideTitle')}</h1>
            
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
                <span className={styles.statValue}>98%</span>
                <span className={styles.statLabel}>{i18n.language === 'en' ? 'Satisfied clients' : 'Clients satisfaits'}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>48h</span>
                <span className={styles.statLabel}>{i18n.language === 'en' ? 'Response time' : 'Temps de réponse'}</span>
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
          
          {step < 5 ? (
            <>
              {/* Stepper */}
              <div className={styles.stepper}>
                {[1, 2, 3, 4].map((s) => (
                  <div 
                    key={s} 
                    className={`${styles.stepItem} ${s === step ? styles.stepActive : ''} ${s < step ? styles.stepDone : ''}`}
                  >
                    <div className={styles.stepCircle}>
                      {s < step ? <Check size={16} strokeWidth={3} /> : s}
                    </div>
                    <span className={styles.stepLabel}>{stepLabels[s - 1]}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={step === 4 ? handleVerify : handleNext}>
                {step === 1 && (
                  <div className={styles.stepContent}>
                    <div className={styles.formHeader}>
                      <h2 className={styles.formTitle}>{t('register.step1.title')}</h2>
                      <p className={styles.formSubtitle}>{t('register.step1.subtitle')}</p>
                    </div>
                    
                    <div className={styles.formGrid}>
                      {/* Gender Toggle */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>{t('register.step1.gender')}</label>
                        <div className={styles.genderToggle}>
                          <button
                            type="button"
                            className={`${styles.genderOption} ${gender === 'male' ? styles.genderActive : ''}`}
                            onClick={() => setGender('male')}
                          >
                            <Mars size={18} />
                            {t('register.step1.genderMale')}
                          </button>
                          <button
                            type="button"
                            className={`${styles.genderOption} ${gender === 'female' ? styles.genderActive : ''}`}
                            onClick={() => setGender('female')}
                          >
                            <Venus size={18} />
                            {t('register.step1.genderFemale')}
                          </button>
                        </div>
                        {/* Hidden required input for gender validation */}
                        <input type="hidden" value={gender} required />
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>{t('register.step1.firstName')}</label>
                          <input type="text" className={styles.fieldInput} value={firstName} onChange={e => setFirstName(e.target.value)} required />
                        </div>
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>{t('register.step1.lastName')}</label>
                          <input type="text" className={styles.fieldInput} value={lastName} onChange={e => setLastName(e.target.value)} required />
                        </div>
                      </div>
                      
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>{t('register.step1.email')}</label>
                        <input
                          type="email"
                          className={`${styles.fieldInput} ${emailError ? styles.fieldInputError : ''}`}
                          value={email}
                          onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                          required
                        />
                        {emailError && <span className={styles.fieldError}>{emailError}</span>}
                      </div>
                      
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>{t('register.step1.phone')}</label>
                        <input
                          type="tel"
                          className={`${styles.fieldInput} ${phoneError ? styles.fieldInputError : ''}`}
                          placeholder={t('register.step1.phonePlaceholder')}
                          value={phone}
                          onChange={e => { setPhone(e.target.value); setPhoneError(''); }}
                          required
                        />
                        {phoneError && <span className={styles.fieldError}>{phoneError}</span>}
                      </div>
                    </div>

                    <div className={styles.formActions}>
                      <button type="submit" className={styles.btnNext} disabled={isSending || !gender}>
                        {isSending ? <Loader2 size={20} className={styles.spinner} /> : <>{t('register.step1.next')} <ChevronRight size={20} /></>}
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className={styles.stepContent}>
                    <div className={styles.formHeader}>
                      <h2 className={styles.formTitle}>{t('register.step2.title')}</h2>
                      <p className={styles.formSubtitle}>{t('register.step2.subtitle')}</p>
                    </div>
                    
                    <div className={styles.formGrid}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>{t('register.step2.country')}</label>
                        
                        <div className={styles.customSelectWrapper} ref={countryRef}>
                          <div 
                            className={`${styles.customSelect} ${isCountryOpen ? styles.selectOpen : ''} ${!country ? styles.selectPlaceholder : ''}`}
                            onClick={() => setIsCountryOpen(!isCountryOpen)}
                          >
                            <span>{country || t('register.step2.countryPlaceholder')}</span>
                            <ChevronDown size={16} className={`${styles.selectIcon} ${isCountryOpen ? styles.selectIconOpen : ''}`} />
                          </div>
                          
                          {isCountryOpen && (
                            <div className={styles.selectDropdown}>
                              <div className={styles.selectGroup}>
                                <div className={styles.selectGroupLabel}>{i18n.language === 'en' ? 'French-speaking' : 'Francophones'}</div>
                                {francophoneCountries.map((c) => (
                                  <div key={c} className={`${styles.selectOption} ${country === c ? styles.selectOptionActive : ''}`} onClick={() => { setCountry(c); setIsCountryOpen(false); }}>
                                    {c} {country === c && <Check size={14} className={styles.checkIcon} />}
                                  </div>
                                ))}
                              </div>
                              
                              <div className={styles.selectGroup}>
                                <div className={styles.selectGroupLabel}>{i18n.language === 'en' ? 'English-speaking' : 'Anglophones'}</div>
                                {anglophoneCountries.map((c) => (
                                  <div key={c} className={`${styles.selectOption} ${country === c ? styles.selectOptionActive : ''}`} onClick={() => { setCountry(c); setIsCountryOpen(false); }}>
                                    {c} {country === c && <Check size={14} className={styles.checkIcon} />}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Hidden input to keep form validation working */}
                        <input type="hidden" required value={country} />
                      </div>
                      
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>{t('register.step2.city')}</label>
                        <input
                          type="text"
                          className={styles.fieldInput}
                          placeholder={i18n.language === 'en' ? (country ? 'Enter your city' : 'Select a country first') : (country ? 'Entrez votre ville' : 'Sélectionnez d\'abord un pays')}
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          disabled={!country}
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.formActions}>
                      <button type="button" className={styles.btnBack} onClick={handleBack}>
                        {t('register.step2.back')}
                      </button>
                      <button type="submit" className={styles.btnNext}>
                        {t('register.step2.next')} <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className={styles.stepContent}>
                    <div className={styles.formHeader}>
                      <h2 className={styles.formTitle}>{t('register.step3.title')}</h2>
                      <p className={styles.formSubtitle}>{t('register.step3.subtitle')}</p>
                    </div>
                    
                    <div className={styles.formGrid}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>{t('register.step3.password')}</label>
                        <div className={styles.fieldInputWrapper}>
                          <input 
                            type={showPassword ? "text" : "password"} 
                            className={styles.fieldInput} 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                        
                        {password.length > 0 && (
                          <div className={styles.passwordStrength}>
                            <div className={styles.strengthBar}>
                              <div className={`${styles.strengthFill} ${styles[strengthClasses[strength]]}`} />
                            </div>
                            <span className={`${styles.strengthText} ${styles[strengthClasses[strength]]}`}>
                              {strengthLabels[strength]}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>{t('register.step3.confirmPassword')}</label>
                        <input
                          type={showPassword ? "text" : "password"}
                          className={`${styles.fieldInput} ${passwordMismatchError ? styles.fieldInputError : ''}`}
                          value={confirmPassword}
                          onChange={e => { setConfirmPassword(e.target.value); setPasswordMismatchError(''); }}
                          required
                        />
                        {passwordMismatchError && <span className={styles.fieldError}>{passwordMismatchError}</span>}
                      </div>

                      <label className={styles.termsRow}>
                        <input type="checkbox" className={styles.termsCheckbox} required />
                        <span className={styles.termsLabel}>
                          {t('register.step3.terms')} <Link to="/terms">{t('register.step3.termsLink')}</Link> {t('register.step3.termsAnd')} <Link to="/privacy">{t('register.step3.privacyLink')}</Link>.
                        </span>
                      </label>
                    </div>

                    <div className={styles.formActions}>
                      <button type="button" className={styles.btnBack} onClick={handleBack} disabled={isSending}>
                        {t('register.step3.back')}
                      </button>
                      <button type="submit" className={styles.btnNext} disabled={isSending}>
                        {isSending ? <Loader2 size={20} className={styles.spinner} /> : t('register.step3.submit')}
                      </button>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className={styles.stepContent}>
                    <div className={styles.formHeader}>
                      <h2 className={styles.formTitle}>{t('register.step4.title')}</h2>
                      <p className={styles.formSubtitle}>
                        {t('register.step4.subtitle')} <strong>{email}</strong>
                      </p>
                    </div>
                    
                    <div className={styles.otpContainer}>
                      <div className={styles.otpInputs}>
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            className={`${styles.otpInput} ${otpError ? styles.otpInputError : ''}`}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            required
                          />
                        ))}
                      </div>
                      
                      {otpError && (
                        <div className={styles.otpErrorMessage}>
                          {t('register.step4.invalidCode')}
                        </div>
                      )}
                      
                      <div className={styles.otpResend}>
                        <button type="button" onClick={handleResend} disabled={isSending}>
                          {isSending ? <Loader2 size={16} className={styles.spinner} /> : t('register.step4.resend')}
                        </button>
                      </div>
                    </div>

                    <div className={styles.formActions}>
                      <button type="submit" className={styles.btnNext} style={{ width: '100%' }}>
                        {t('register.step4.verify')}
                      </button>
                    </div>
                  </div>
                )}
              </form>
              
              <div className={styles.loginRedirect}>
                {t('register.alreadyAccount')} 
                <Link to="/login">{t('register.login')}</Link>
              </div>
            </>
          ) : (
            <div className={styles.successState}>
              <div className={styles.successIcon}>
                <ShieldCheck size={40} />
              </div>
              <div>
                <h2 className={styles.successTitle}>{t('register.success.title')}</h2>
                <p className={styles.successSubtitle}>{t('register.success.subtitle')}</p>
              </div>
              <div className={styles.successActions}>
                <Link to="/dashboard" className={styles.btnSuccess}>
                  {t('register.success.cta')}
                </Link>
                <Link to="/" className={styles.btnSuccessOutline}>
                  {t('register.success.home')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
