import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, updateEmail, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Link } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditMode, setIsEditMode] = useState<boolean>(false); // Přidán stav pro editační mód
  const [originalData, setOriginalData] = useState<any>(null); // Pro uložení původních dat

  const fetchUserData = async (uid: string) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setFirstName(userData?.firstName || "");
        setLastName(userData?.lastName || "");
        setEmail(userData?.email || "");
        setOriginalData(userData); // Uložení původních dat
      }
    } catch (error) {
      setError("Nepodařilo se načíst uživatelská data.");
      console.error("Chyba při načítání uživatelských dat:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setLoading(true);

      // Aktualizace údajů ve Firebase Auth
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: `${firstName} ${lastName}`,
        });

        if (auth.currentUser.email !== email) {
          await updateEmail(auth.currentUser, email);
        }
      }

      // Aktualizace údajů ve Firestore
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        firstName,
        lastName,
        email,
      });

      setMessage("Údaje byly úspěšně aktualizovány.");
      setIsEditMode(false); // Ukončení editačního režimu
    } catch (error) {
      setError("Nepodařilo se aktualizovat údaje.");
      console.error("Chyba při aktualizaci údajů:", error);
    } finally {
      setLoading(false);
    }
  };

  // Funkce pro zrušení změn a návrat k původním datům
  const handleCancelEdit = () => {
    if (originalData) {
      setFirstName(originalData.firstName);
      setLastName(originalData.lastName);
      setEmail(originalData.email);
    }
    setIsEditMode(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchUserData(user.uid); // Načítání dat z Firestore
      } else {
        setError("Nejste přihlášeni.");
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Načítání...</p>;
  }

  if (!userId) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>Můj profil</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!isEditMode ? (
        <div>
          <p>Jméno: {firstName}</p>
          <p>Příjmení: {lastName}</p>
          <p>Email: {email}</p>
          <Link to="/resetPassword">Obnovit heslo</Link>
          <button onClick={() => setIsEditMode(true)}>Upravit</button>
        </div>
      ) : (
        <form onSubmit={handleUpdate}>
          {/* Editace uživatelských údajů */}
          <div>
            <label>Jméno:</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Příjmení:</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit">Uložit změny</button>
          <button type="button" onClick={handleCancelEdit}>
            Zrušit
          </button>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;
