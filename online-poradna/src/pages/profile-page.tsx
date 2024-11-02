import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, updateEmail, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";
import QuestionListItem from "../components/question-list-item";
import styles from "./profile-page.module.css";
import Button from '../components/buttons/button';

const ProfilePage: React.FC = () => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [userQuestions, setUserQuestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [originalData, setOriginalData] = useState<any>(null);

  const fetchUserData = async (uid: string) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setFirstName(userData?.firstName || "");
        setLastName(userData?.lastName || "");
        setEmail(userData?.email || "");
        setOriginalData(userData);
      }
    } catch (error) {
      setError("Nepodařilo se načíst uživatelská data.");
      console.error("Chyba při načítání uživatelských dat:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserQuestions = (uid: string) => {
    const questionsQuery = query(collection(db, "questions"), where("user.uid", "==", uid));
    const unsubscribe = onSnapshot(questionsQuery, (querySnapshot) => {
      const questions: any[] = [];
      querySnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...doc.data() });
      });
      setUserQuestions(questions);
    });
    return unsubscribe;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setLoading(true);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: `${firstName} ${lastName}`,
        });

        if (auth.currentUser.email !== email) {
          await updateEmail(auth.currentUser, email);
        }
      }

      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        firstName,
        lastName,
        email,
      });

      setMessage("Údaje byly úspěšně aktualizovány.");
      setIsEditMode(false);
    } catch (error) {
      setError("Nepodařilo se aktualizovat údaje.");
      console.error("Chyba při aktualizaci údajů:", error);
    } finally {
      setLoading(false);
    }
  };

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
        fetchUserData(user.uid);
        const unsubscribeQuestions = fetchUserQuestions(user.uid);
        return () => unsubscribeQuestions();
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
    <div className={styles.profileContainer}>
      <h1>Můj profil</h1>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!isEditMode ? (
        <div className={styles.profileInfo}>
          <p><strong>Jméno: </strong> <span>{firstName}</span></p>
          <p><strong>Příjmení: </strong> <span>{lastName}</span></p>
          <p><strong>Email: </strong> <span>{email}</span></p>
          <Button onClick={() => setIsEditMode(true)} type={"button"} variant={"edit"}>Upravit osobní údaje</Button>
          <Link className={styles.link} to="/resetPassword">Zaslat email pro obnovení hesla</Link>
        </div>
      ) : (
        <form onSubmit={handleUpdate}>
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
          <Button type="button" onClick={handleCancelEdit} variant={"secondary"}>
            Zrušit
          </Button>
          <Button type="submit" variant={"primary"}>Uložit změny</Button>
        </form>
      )}

      <h2 className={styles.h2}>Vaše dotazy</h2>
      {userQuestions.length === 0 ? (
        <p>Zatím jste nepoložili žádné dotazy.</p>
      ) : (
        // Úprava mapování dat na ProfilePage
        <ul className={styles.listItemContainer}>
          {userQuestions.map((question) => (
            <QuestionListItem
              key={question.id}
              id={question.id}
              title={question.title}
              text={question.questionText}
              createdAt={new Date(question.createdAt.seconds * 1000)} // Převod timestampu na Date objekt
              isAnswered={question.isAnswered}
              category={question.category}
            />
          ))}
        </ul>

      )}
    </div>
  );
};

export default ProfilePage;
