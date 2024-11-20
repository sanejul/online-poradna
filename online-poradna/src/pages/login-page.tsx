import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import Button from '../components/buttons/button';
import styles from './login.module.css';
import { validateEmail, validatePassword } from '../helpers/validation-helper';
import { useNotification } from '../contexts/notification-context';
import {Helmet} from "react-helmet";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [fieldValid, setFieldValid] = useState({ email: false, password: false });
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from: string })?.from || '/';

  const handleBlur = (field: string, value: string) => {
    let fieldError = '';
    let isValid = false;

    switch (field) {
      case 'email':
        fieldError = validateEmail(value);
        isValid = !fieldError;
        break;
      case 'password':
        fieldError = validatePassword(value);
        isValid = !fieldError;
        break;
      default:
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [field]: fieldError }));
    setFieldValid((prev) => ({ ...prev, [field]: isValid }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          <div className="g-recaptcha" data-sitekey="6LdU-oAqAAAAAF-4qysAE35W9xrt6d_j9Ml2oIfn"></div>
          <div className={`input-container ${fieldErrors.email ? 'error' : fieldValid.email ? 'valid' : ''}`}>
            <label>E-mail *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email', email)}
              required
            />
            {fieldErrors.email && <p className="errorText">{fieldErrors.email}</p>}
          </div>

          <div className={`input-container ${fieldErrors.password ? 'error' : fieldValid.password ? 'valid' : ''}`}>
            <label>Heslo (min 6 znaků) *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password', password)}
              required
            />
            {fieldErrors.password && <p className="errorText">{fieldErrors.password}</p>}
          </div>

          <p className={'textLeft'}>* povinné údaje</p>
          <Button type="submit" variant={'primary'} disabled={Object.values(fieldValid).some(valid => !valid)}>Přihlásit
            se</Button>
          {error && <p className="errorText">{error}</p>}
        </form>

        <div>
          <div className={styles.questionContainer}>
            <p>Ještě nemáte založený účet?</p>
            <Link to="/registration">Registrujte se</Link>
          </div>

          <div className={styles.questionContainer}>
            <p>Zapomněli jste heslo?</p>
            <Link to="/resetPassword">Obnovit heslo</Link>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Login;
