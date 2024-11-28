import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import Button from '../components/buttons/button';
import styles from './login.module.css';
import { validateEmail, validatePassword } from '../helpers/validation-helper';
import { useNotification } from '../contexts/notification-context';
import {Helmet} from "react-helmet";
import ReCAPTCHA from "react-google-recaptcha";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [fieldValid, setFieldValid] = useState({ email: false, password: false });
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from: string })?.from || '/';

  const handleCaptchaChange = (token: string | null) => {
    const isVerified = !!token;
    setCaptchaVerified(isVerified);

    if (isVerified && error === 'Pro přihlášení prosím potvrďte, že nejste robot.') {
      setError(null);
    }
  };

  const handleChange = (field: string, value: string) => {
    let fieldError = '';
    let isValid = false;

    switch (field) {
      case 'email':
        fieldError = validateEmail(value);
        isValid = !fieldError;
        setEmail(value);
        break;
      case 'password':
        fieldError = validatePassword(value);
        isValid = !fieldError;
        setPassword(value);
        break;
      default:
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [field]: fieldError }));
    setFieldValid((prev) => ({ ...prev, [field]: isValid }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaVerified) {
      setError('Pro přihlášení prosím potvrďte, že nejste robot.');
      return;
    }
    if (fieldErrors.email || fieldErrors.password) {
      setError('Zkontrolujte prosím chyby ve formuláři.');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showNotification(<p>Přihlášení proběhlo úspěšně.</p>, 5);
      navigate(from);
    } catch (error) {
      setError('Neplatné přihlašovací údaje, zkuste to prosím znovu.');
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>Detail dotazu - Poradna Haaro Naturo</title>
        <meta name="description" content="Přihlášení do online poradny Haaro Naturo." />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <h1>Přihlášení</h1>
      <div className={styles.formContainer}>
        <form className={styles.form} onSubmit={handleSubmit} method="POST">
          <div className="captcha">
            <ReCAPTCHA
              sitekey="6LfcuT4jAAAAADrHwrSTR5_S19LYAUk-TMnZdF48"
              onChange={handleCaptchaChange}
              data-size="compact"
              data-theme="light"
            />
          </div>
          <div className={`input-container ${fieldErrors.email ? 'error' : fieldValid.email ? 'valid' : ''}`}>
            <label>E-mail *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
            {fieldErrors.email && <p className="errorText">{fieldErrors.email}</p>}
          </div>

          <div className={`input-container ${fieldErrors.password ? 'error' : fieldValid.password ? 'valid' : ''}`}>
            <label>Heslo (min 6 znaků) *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
            />
            {fieldErrors.password && <p className="errorText">{fieldErrors.password}</p>}
          </div>

          <p className={'textLeft'}>* povinné údaje</p>
          {error && <p className="errorText">{error}</p>}
          <Button type="submit" variant={'primary'} disabled={Object.values(fieldValid).some(valid => !valid)}>Přihlásit
            se</Button>
        </form>

        <div>
          <div className={styles.questionContainer}>
            <p>Ještě nemáte založený účet?</p>
            <Link to="/registrace">Registrujte se</Link>
          </div>

          <div className={styles.questionContainer}>
            <p>Zapomněli jste heslo?</p>
            <Link to="/obnoveni-hesla">Obnovit heslo</Link>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Login;
