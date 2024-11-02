import React, { useState } from "react";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Button from '../components/buttons/button';
import styles from './login.module.css'

const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from: string })?.from || "/";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Hesla se neshodují.");
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

      console.log("Uživatel úspěšně registrován a uložen do Firestore.");
      navigate(from);
    } catch (error) {
      console.error("Chyba při registraci:", error);
      setError("Chyba při registraci: " + (error as Error).message);
    }
  };

  return (
    <div>
      <h1>Registrace</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className={styles.formContainer}>
        <form className={styles.form} onSubmit={handleRegister}>
          <div>
            <label>Jméno:</label>
            <input
              placeholder={"Jméno"}
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Příjmení:</label>
            <input
              placeholder={"Příjmení"}
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              placeholder={"E-mail"}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Heslo:</label>
            <input
              placeholder={"Heslo"}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Potvrdit heslo:</label>
            <input
              placeholder={"Zadejte znovu stejné heslo"}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" variant={"primary"}>Registrovat</Button>
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
