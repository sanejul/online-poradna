import React, { useState } from "react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";

const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Firebase funkce pro odeslání e-mailu s odkazem na reset hesla
      await sendPasswordResetEmail(auth, email);
      setMessage(`Odkaz na obnovu hesla byl odeslán na adresu ${email}`);
      setError(null);
    } catch (error) {
      setError("Chyba při odesílání e-mailu: " + (error as Error).message);
      setMessage(null);
    }
  };

  return (
    <div>
      <h2>Obnova hesla</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handlePasswordReset}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Odeslat odkaz na obnovu hesla</button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
