import React, { useState } from 'react';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { validateEmail } from '../helpers/validation-helper';
import { useNotification } from '../contexts/notification-context';
import Button from '../components/buttons/button';
import styles from '../pages/login.module.css';
import { Link } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';

const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const { showNotification } = useNotification();

  const handleCaptchaChange = (token: string | null) => {
    const isVerified = !!token;
    setCaptchaVerified(isVerified);

    if (
      isVerified &&
      error === 'Pro odeslání e-mailu potvrďte, že nejste robot.'
    ) {
      setError(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    const emailError = validateEmail(value);
    setFieldError(emailError);
    setIsValid(!emailError);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaVerified) {
      setError('Pro odeslání e-mailu potvrďte, že nejste robot.');
      return;
    }

    if (fieldError || !isValid) {
      setError('Zadejte prosím platný e-mail.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      showNotification(
        `Odkaz pro obnovu hesla byl odeslán na adresu ${email}`,
        5
      );
      setError(null);
    } catch (error) {
      setError('Nastala chyba při odesílání e-mailu, zkuste to prosím znovu.');
      setMessage(null);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Obnova hesla</h1>
      <p className={styles.infoText}>
        Zadejte e-mail, kterým jste se registrovali.
      </p>
      <p className={styles.infoText}>
        Přijde vám odkaz, kde si zvolíte nové heslo a poté se s ním můžete
        přihlásit do aplikace.
      </p>

      <form
        className={styles.form}
        onSubmit={handlePasswordReset}
        method="POST"
      >
        <div className="captcha">
          <ReCAPTCHA
            sitekey="6LfcuT4jAAAAADrHwrSTR5_S19LYAUk-TMnZdF48"
            onChange={handleCaptchaChange}
            data-size="compact"
            data-theme="light"
          />
        </div>
        <div
          className={`input-container ${fieldError ? 'error' : isValid ? 'valid' : ''}`}
        >
          <label>Email *</label>
          <input type="email" value={email} onChange={handleChange} required />
          {fieldError && <p className="errorText">{fieldError}</p>}
        </div>
        {error && <p className="errorText">{error}</p>}
        <Button variant={'primary'} type="submit" disabled={!isValid}>
          Odeslat odkaz pro obnovu hesla
        </Button>
      </form>

      <div className={styles.questionContainer}>
        <p>Už máte obnovené heslo?</p>
        <Link to="/prihlaseni">Přihlaste se</Link>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
