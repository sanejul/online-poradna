import React, { useState } from "react";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from: string })?.from || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Přihlášení úspěšné");
      navigate(from); // Přesměrování na původní stránku
    } catch (error) {
      setError("Chyba při přihlášení: " + (error as any).message);
    }
  };

  return (
    <div>
      <h2>Přihlášení</h2>
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Přihlásit se</button>
      </form>
      {error && <p>{error}</p>}
      <p>
        Zapomněli jste heslo?{" "}
        <Link to="/resetPassword">Obnovit heslo</Link>
      </p>
    </div>
  );
};

export default Login;
