import React, { useState } from "react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { validateEmail } from '../helpers/validation-helper';
import Button from '../components/buttons/button';
import styles from '../pages/login.module.css';

const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(false);

  const handleBlur = () => {
    const emailError = validateEmail(email);
    setFieldError(emailError);
    setIsValid(!emailError);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fieldError || !isValid) {
      setError("Zadejte prosím platný e-mail.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(`Odkaz na obnovu hesla byl odeslán na adresu ${email}`);
      setError(null);
    } catch (error) {
      setError("Nastala chyba při odesílání e-mailu, zkuste to prosím znovu.");
      setMessage(null);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Obnova hesla</h1>

      <form onSubmit={handlePasswordReset}>
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
        <Button variant={"primary"} type="submit" disabled={!isValid}>Odeslat odkaz na obnovu hesla</Button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p className="errorText">{error}</p>}
    </div>
  );
};

export default ResetPasswordPage;
