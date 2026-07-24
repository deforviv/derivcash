const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export const sendVerificationEmail = async (toEmail: string, userName: string, code: string, lang: 'fr' | 'en') => {
  const apiKey = import.meta.env.VITE_BREVO_API_KEY;
  const senderEmail = import.meta.env.VITE_BREVO_SENDER;

  if (!apiKey || !senderEmail) {
    console.error("Brevo API keys missing in .env");
    return false;
  }

  const subject = lang === 'en' 
    ? 'Derivcash - Your Verification Code' 
    : 'Derivcash - Votre code de vérification';

  const htmlContent = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9f9fb; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #0a0f1e; margin: 0; font-size: 28px; letter-spacing: -1px;">Derivcash</h1>
      </div>
      <div style="background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: center;">
        <h2 style="color: #0a0f1e; margin-top: 0;">${lang === 'en' ? 'Verify your email address' : 'Vérifiez votre adresse email'}</h2>
        <p style="color: #64748b; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
          ${lang === 'en' ? 'Hello' : 'Bonjour'} <strong>${userName}</strong>,<br>
          ${lang === 'en' ? 'Please use the verification code below to securely access your account.' : 'Veuillez utiliser le code de vérification ci-dessous pour accéder à votre compte en toute sécurité.'}
        </p>
        <div style="background-color: #f24250; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 20px; border-radius: 8px; margin: 0 auto; max-width: 300px;">
          ${code}
        </div>
        <p style="color: #94a3b8; font-size: 14px; margin-top: 30px;">
          ${lang === 'en' ? 'If you did not request this, please ignore this email.' : 'Si vous n\'avez pas demandé ceci, veuillez ignorer cet email.'}
        </p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
        &copy; ${new Date().getFullYear()} Derivcash. ${lang === 'en' ? 'All rights reserved.' : 'Tous droits réservés.'}
      </div>
    </div>
  `;

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'Derivcash', email: senderEmail },
        to: [{ email: toEmail, name: userName }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo Error:", errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Brevo Fetch Error:", error);
    return false;
  }
};
