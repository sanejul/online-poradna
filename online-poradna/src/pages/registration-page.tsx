import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import {
  validateFirstName,
  validateLastName,
  validateEmail,
  isEmailUnique,
  validatePassword,
  validateConfirmPassword,
} from '../helpers/validation-helper';
import { useNotification } from '../contexts/notification-context';
import Button from '../components/buttons/button';
import styles from './login.module.css';
import { Helmet } from 'react-helmet';
import ReCAPTCHA from 'react-google-recaptcha';

const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [fieldValid, setFieldValid] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const handleCaptchaChange = (token: string | null) => {
    const isVerified = !!token;
    setCaptchaVerified(isVerified);

    if (
      isVerified &&
      error === 'Pro dokončení registrace prosím potvrďte, že nejste robot.'
    ) {
      setError(null);
    }
  };

  const handleChange = (field: string, value: string) => {
    let error = '';
    let isValid = false;

    switch (field) {
      case 'firstName':
        error = validateFirstName(value);
        isValid = !error;
        setFirstName(value);
        break;
      case 'lastName':
        error = validateLastName(value);
        isValid = !error;
        setLastName(value);
        break;
      case 'email':
        error = validateEmail(value);
        isValid = !error;
        setEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        isValid = !error;
        setPassword(value);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(password, value);
        isValid = !error;
        setConfirmPassword(value);
        break;
      default:
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [field]: error }));
    setFieldValid((prev) => ({ ...prev, [field]: isValid }));
  };

  const handleBlurEmail = async () => {
    const emailError = validateEmail(email);
    if (!emailError) {
      const isUnique = await isEmailUnique(email);
      setFieldErrors((prev) => ({
        ...prev,
        email: isUnique ? '' : 'Tento e-mail už někdo v této aplikaci používá.',
      }));
      setFieldValid((prev) => ({
        ...prev,
        email: isUnique,
      }));
    } else {
      setFieldErrors((prev) => ({ ...prev, email: emailError }));
      setFieldValid((prev) => ({ ...prev, email: false }));
    }
  };

  const isFormValid = Object.values(fieldValid).every((isValid) => isValid);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!captchaVerified) {
      setError('Pro dokončení registrace prosím potvrďte, že nejste robot.');
      return;
    }

    if (Object.values(fieldErrors).some((err) => err)) {
      setError('Zkontrolujte prosím chyby ve formuláři.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: `${firstName} ${lastName}` });

      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email: user.email,
        role: 'user',
        createdAt: new Date(),
        uid: user.uid,
      });

      showNotification(
        <p>Registrace proběhla úspěšně. Nyní se můžete přihlásit.</p>,
        5
      );
      navigate('/prihlaseni');
    } catch (error: any) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError(
            'Tento e-mail je již registrován. Přihlaste se nebo použijte jiný.'
          );
          break;
        default:
          setError('Došlo k neočekávané chybě. Zkuste to prosím znovu.');
          break;
      }
      showNotification(
        <p>Při registraci nastal problém. Zkuste to prosím znovu.</p>,
        10,
        'warning',
      );
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>Registrace - Poradna Haaro Naturo</title>
        <meta
          name="description"
          content="Registrace do online poradny Haaro Naturo."
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <h1 id="form-title">Registrace</h1>
      <div className={styles.formContainer}>
        <form className={styles.form} onSubmit={handleRegister} method="POST" aria-labelledby="form-title">
          <div className="captcha">
            <ReCAPTCHA
              sitekey="6LfcuT4jAAAAADrHwrSTR5_S19LYAUk-TMnZdF48"
              onChange={handleCaptchaChange}
              data-size="compact"
              data-theme="light"
            />
          </div>
          <div
            className={`input-container ${fieldErrors.firstName ? 'error' : fieldValid.firstName ? 'valid' : ''}`}
          >
            <label>Jméno (u dotazu bude zveřejněno) *</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              required
              aria-invalid={!!fieldErrors.firstName}
              aria-describedby={fieldErrors.firstName ? 'first-name-error' : undefined}
            />
            {fieldErrors.firstName && (
              <p className={'errorText'} id="first-name-error">{fieldErrors.firstName}</p>
            )}
          </div>
          <div
            className={`input-container ${fieldErrors.lastName ? 'error' : fieldValid.lastName ? 'valid' : ''}`}
          >
            <label>Příjmení *</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              required
              aria-invalid={!!fieldErrors.lastName}
              aria-describedby={fieldErrors.lastName ? 'last-name-error' : undefined}
            />
            {fieldErrors.lastName && (
              <p className={'errorText'} id="last-name-error">{fieldErrors.lastName}</p>
            )}
          </div>
          <div
            className={`input-container ${fieldErrors.email ? 'error' : fieldValid.email ? 'valid' : ''}`}
          >
            <label>Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
            {fieldErrors.email && (
              <p className={'errorText'} id="email-error">{fieldErrors.email}</p>
            )}
          </div>
          <div
            className={`input-container ${fieldErrors.password ? 'error' : fieldValid.password ? 'valid' : ''}`}
          >
            <label>Heslo (min 6 znaků) *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            />
            {fieldErrors.password && (
              <p className={'errorText'} id="password-error">{fieldErrors.password}</p>
            )}
          </div>
          <div
            className={`input-container ${fieldErrors.confirmPassword ? 'error' : fieldValid.confirmPassword ? 'valid' : ''}`}
          >
            <label>Potvrdit heslo *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              required
              aria-invalid={!!fieldErrors.confirmPassword}
              aria-describedby={fieldErrors.confirmPassword ? 'confirm-password-error' : undefined}
            />
            {fieldErrors.confirmPassword && (
              <p className={'errorText'} id="confirm-password-error">{fieldErrors.confirmPassword}</p>
            )}
          </div>
          <p className={'textLeft'}>* povinné údaje</p>
          {error && <p className={'errorText'} role="alert">{error}</p>}
          <Button type="submit" variant={'primary'} isDisabled={!isFormValid}>
            vytvořit můj účet
          </Button>
        </form>

        <div className={styles.questionContainer}>
          <p>Už máte založený účet?</p>
          <Link to="/prihlaseni">Přihlaste se</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
