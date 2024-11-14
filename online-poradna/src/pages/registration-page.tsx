import React, { useState } from "react";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { validateFirstName, validateLastName, validateEmail, isEmailUnique, validatePassword, validateConfirmPassword } from '../helpers/validation-helper';
import { useNotification } from '../contexts/notification-context';
import Button from '../components/buttons/button';
import styles from './login.module.css'

const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { showNotification } = useNotification();

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from: string })?.from || "/";

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [fieldValid, setFieldValid] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const handleBlur = (field: string, value: string) => {
    let error = '';
    let isValid = false;

    switch (field) {
      case 'firstName':
        error = validateFirstName(value);
        isValid = !error;
        break;
      case 'lastName':
        error = validateLastName(value);
        isValid = !error;
        break;
      case 'email':
        error = validateEmail(value);
        isValid = !error;
        break;
      case 'password':
        error = validatePassword(value);
        isValid = !error;
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(password, value);
        isValid = !error;
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
        email: isUnique ? "" : "Tento e-mail už někdo v této aplikaci používá."
      }));
      setFieldValid((prev) => ({
        ...prev,
        email: isUnique
      }));
    } else {
      setFieldErrors((prev) => ({ ...prev, email: emailError }));
      setFieldValid((prev) => ({ ...prev, email: false }));
    }
  };

  const isFormValid = Object.values(fieldValid).every(isValid => isValid);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (Object.values(fieldErrors).some(err => err)) {
      setError("Zkontrolujte prosím chyby ve formuláři.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: `${firstName} ${lastName}` });

      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email: user.email,
        role: "user",
        createdAt: new Date(),
        uid: user.uid,
      });

      console.log("Uživatel úspěšně registrován a uložen do db.");
      showNotification(<p>Registrace proběhla úspěšně. Nyní se můžete přihlásit.</p>, 15);
      navigate('/login');
    } catch (error) {
      console.error("Chyba při registraci:", error);
      setError("Chyba při registraci: " + (error as Error).message);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Registrace</h1>
      {error && <p className={"errorText"}>{error}</p>}
      <div className={styles.formContainer}>
        <form className={styles.form} onSubmit={handleRegister}>
          <div className={`input-container ${fieldErrors.firstName ? 'error' : fieldValid.firstName ? 'valid' : ''}`}>
            <label>Jméno - bude zobrazeno *</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => handleBlur('firstName', firstName)}
              required
            />
            {fieldErrors.firstName && <p className={'errorText'}>{fieldErrors.firstName}</p>}
          </div>
          <div className={`input-container ${fieldErrors.lastName ? 'error' : fieldValid.lastName ? 'valid' : ''}`}>
            <label>Příjmení *</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => handleBlur('lastName', lastName)}
              required
            />
            {fieldErrors.lastName && <p className={"errorText"}>{fieldErrors.lastName}</p>}
          </div>
          <div className={`input-container ${fieldErrors.email ? 'error' : fieldValid.email ? 'valid' : ''}`}>
            <label>Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleBlurEmail}
              required
            />
            {fieldErrors.email && <p className={"errorText"}>{fieldErrors.email}</p>}
          </div>
          <div className={`input-container ${fieldErrors.password ? 'error' : fieldValid.password ? 'valid' : ''}`}>
            <label>Heslo *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password', password)}
              required
            />
            {fieldErrors.password && <p className={"errorText"}>{fieldErrors.password}</p>}
          </div>
          <div className={`input-container ${fieldErrors.confirmPassword ? 'error' : fieldValid.confirmPassword ? 'valid' : ''}`}>
            <label>Potvrdit heslo *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur('confirmPassword', confirmPassword)}
              required
            />
            {fieldErrors.confirmPassword && <p className={"errorText"}>{fieldErrors.confirmPassword}</p>}
          </div>
          <p className={"textLeft"}>* povinné údaje</p>
          {error && <p className="errorText">{error}</p>}
          <Button type="submit" variant={"primary"} disabled={!isFormValid}>vytvořit můj účet</Button>
        </form>

        <div className={styles.questionContainer}>
          <p>Už máte založený účet?</p>
          <Link to="/login">Přihlaste se</Link>
        </div>
      </div>

    </div>
  );
};

export default RegisterPage;
