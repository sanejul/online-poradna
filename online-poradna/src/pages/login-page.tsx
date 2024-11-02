import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import Button from '../components/buttons/button';
import styles from './login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from: string })?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Přihlášení úspěšné');
      navigate(from); // Přesměrování na původní stránku
    } catch (error) {
      setError('Chyba při přihlášení: ' + (error as any).message);
    }
  };

  return (
    <div>
      <h1>Přihlášení</h1>
      <div className={styles.formContainer}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Heslo"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant={'primary'}>Přihlásit se</Button>
        </form>
        {error && <p>{error}</p>}

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
