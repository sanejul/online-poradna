import React, { useState } from 'react';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { validateEmail } from '../helpers/validation-helper';
import { useNotification } from '../contexts/notification-context';
import Button from '../components/buttons/button';
import styles from '../pages/login.module.css';
import { Link } from 'react-router-dom';

const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);
  const { showNotification } = useNotification();

  const handleBlur = () => {
    const emailError = validateEmail(email);
    setFieldError(emailError);
    setIsValid(!emailError);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fieldError || !isValid) {
      setError('Zadejte prosím platný e-mail.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      showNotification(`Odkaz pro obnovu hesla byl odeslán na adresu ${email}`, 5);
      setError(null);
    } catch (error) {
      setError('Nastala chyba při odesílání e-mailu, zkuste to prosím znovu.');
      setMessage(null);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Obnova hesla</h1>
      <p className={styles.infoText}>Zadejte e-mail, kterým jste se registrovali.</p>
      <p className={styles.infoText}>Přijde vám odkaz, kde si zvolíte nové heslo a poté se s ním můžete přihlásit do
        aplikace.</p>

      <form className={styles.form} onSubmit={handlePasswordReset} method="POST">
        <div className="g-recaptcha" data-sitekey="6LdU-oAqAAAAAF-4qysAE35W9xrt6d_j9Ml2oIfn"></div>
        <div className={`input-container ${fieldError ? 'error' : isValid ? 'valid' : ''}`}>
          <label>Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleBlur}
            required
          />
          {fieldError && <p className="errorText">{fieldError}</p>}
        </div>
        {error && <p className="errorText">{error}</p>}
        <Button variant={'primary'} type="submit" disabled={!isValid}>Odeslat odkaz pro obnovu hesla</Button>
      </form>

      <div className={styles.questionContainer}>
        <p>Už máte obnovené heslo?</p>
        <Link to="/login">Přihlaste se</Link>
      </div>
    </div>
  )
    ;
};

export default ResetPasswordPage;
