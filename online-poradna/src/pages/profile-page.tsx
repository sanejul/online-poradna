import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, updateEmail, updateProfile } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import QuestionListItem from '../components/question-list-item';
import styles from './profile-page.module.css';
import Button from '../components/buttons/button';
import { isEmailUnique, validateEmail, validateFirstName, validateLastName } from '../helpers/validation-helper';
import { useNotification } from '../contexts/notification-context';
import { useAuthLogic } from '../hooks/use-auth';
import LoadingSpinner from '../components/loading-spinner';
import {Helmet} from "react-helmet";

interface Category {
  id: string;
  name: string;
}

const ProfilePage: React.FC = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userQuestions, setUserQuestions] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [originalData, setOriginalData] = useState<any>(null);
  const { handleUserLogout } = useAuthLogic();

  const { showNotification } = useNotification();

  const [fieldErrors, setFieldErrors] = useState({ firstName: '', lastName: '', email: '' });
  const [fieldValid, setFieldValid] = useState({ firstName: true, lastName: true, email: true });
  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({
    firstName: false,
    lastName: false,
    email: false,
  });

  const fetchUserData = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setFirstName(userData?.firstName || '');
        setLastName(userData?.lastName || '');
        setEmail(userData?.email || '');
        setOriginalData(userData);
      }
    } catch (error) {
      showNotification(<p>Nepodařilo se načíst uživatelská data. Zkuste to prosím později.</p>, 10, 'warning');
      setError('Nepodařilo se načíst uživatelská data.');
      console.error('Chyba při načítání uživatelských dat:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserQuestions = (uid: string) => {
    const questionsQuery = query(collection(db, 'questions'), where('user.uid', '==', uid));
    return onSnapshot(questionsQuery, (querySnapshot) => {
      const questions: any[] = [];
      querySnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...doc.data() });
      });
      setUserQuestions(questions);
    });
  };

  const handleBlur = async (field: string, value: string) => {
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
        if (!error && value !== originalData?.email) {
          const unique = await isEmailUnique(value);
          if (!unique) {
            error = 'Tento e-mail je již použitý.';
          }
        }
        isValid = !error;
        break;
      default:
        break;
    }

    setFieldErrors(prev => ({ ...prev, [field]: error }));
    setFieldValid(prev => ({ ...prev, [field]: isValid }));
  };

  const isFormValid = () => {
    return Object.entries(fieldValid).every(([field, valid]) => {
      return valid || !touchedFields[field];
    });
  };

  const handleChange = (field: string, value: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    setFieldValid((prev) => ({ ...prev, [field]: true }));

    if (field === 'firstName') setFirstName(value);
    if (field === 'lastName') setLastName(value);
    if (field === 'email') setEmail(value);
  };


  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (Object.values(fieldErrors).some(err => err) || !Object.values(fieldValid).every(valid => valid)) {
      setError('Zkontrolujte prosím chyby ve formuláři.');
      return;
    }

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

      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        firstName,
        lastName,
        email,
      });

      showNotification(<p>Vaše údaje byly úspěšně aktualizovány.</p>, 5);
      setIsEditMode(false);
    } catch (error) {
      setError('Nepodařilo se aktualizovat údaje.');
      console.error('Chyba při aktualizaci údajů:', error);
      showNotification(<p>Osobní údaje se nepodařilo aktualizovat. Zkuste to prosím znovu.</p>, 10, 'warning');
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
        setError('Nejste přihlášeni.');
      }
    });

    const categoriesRef = collection(db, 'categories');
    const unsubscribeCategories = onSnapshot(categoriesRef, (querySnapshot) => {
      const categoryList: Category[] = [{ id: 'all', name: 'Všechny kategorie' }];
      querySnapshot.forEach((doc) => {
        categoryList.push({ id: doc.id, name: doc.data().name });
      });
      setCategories(categoryList);
    });

    return () => unsubscribe();
    return () => unsubscribeCategories();
  }, []);

  if (loading) {
    return <LoadingSpinner></LoadingSpinner>;
  }

  if (!userId) {
    return <p>{error}</p>;
  }

  return (
    <div className={styles.profileContainer}>
      <Helmet>
        <title>Profil - Poradna Haaro Naturo</title>
        <meta name="description" content="Uživatelský profil v poradně Haaro Naturo." />
      </Helmet>
      <h1>Můj profil</h1>

      {!isEditMode ? (
        <div className={styles.profileInfo}>
          <div className={styles.personalInfo}>
            <p><strong>Jméno: </strong> <span>{firstName}</span></p>
            <p><strong>Příjmení: </strong> <span>{lastName}</span></p>
            <p><strong>Email: </strong> <span>{email}</span></p>
          </div>
          <Button onClick={() => setIsEditMode(true)} type={'button'} variant={'edit'}>Upravit osobní údaje</Button>
          <Button onClick={() => handleUserLogout()} type={'button'} variant={'delete'}>odhlásit se</Button>
          <Link className={styles.link} to="/obnoveni-hesla">Zaslat email pro obnovení hesla</Link>
        </div>
      ) : (
        <form className={styles.editMode} onSubmit={handleUpdate}>

          <div className={`input-container ${fieldErrors.firstName ? 'error' : fieldValid.firstName ? 'valid' : ''}`}>
            <label>Jméno:</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              onBlur={() => handleBlur('firstName', firstName)}
              required
            />
            {fieldErrors.firstName && <p className="errorText">{fieldErrors.firstName}</p>}
          </div>

          <div className={`input-container ${fieldErrors.lastName ? 'error' : fieldValid.lastName ? 'valid' : ''}`}>
            <label>Příjmení:</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              onBlur={() => handleBlur('lastName', lastName)}
              required
            />
            {fieldErrors.lastName && <p className="errorText">{fieldErrors.lastName}</p>}
          </div>

          <div className={`input-container ${fieldErrors.email ? 'error' : fieldValid.email ? 'valid' : ''}`}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email', email)}
              required
            />
            {fieldErrors.email && <p className="errorText">{fieldErrors.email}</p>}
          </div>

          {error && <p className="errorText">{error}</p>}

          <Button type="button" onClick={handleCancelEdit} variant={'secondary'}>
            Zrušit
          </Button>
          <Button type="submit" variant={'primary'} disabled={!isFormValid()}>Uložit změny</Button>
        </form>
      )}

      <h2 className={styles.h2}>Vaše dotazy</h2>
      {userQuestions.length === 0 ? (
        <p>Zatím jste nepoložili žádné dotazy.</p>
      ) : (
        <ul className={styles.listItemContainer}>
          {userQuestions.map((question) => (
            <QuestionListItem
              key={question.id}
              id={question.id}
              title={question.title}
              text={question.questionText}
              createdAt={new Date(question.createdAt.seconds * 1000)}
              isAnswered={question.isAnswered}
              category={
                Array.isArray(question.category)
                  ? question.category.map((catId: string) => categories.find((cat) => cat.id === catId)?.name || catId)
                  : ['Žádná kategorie']
              }
            />
          ))}
        </ul>

      )}
    </div>
  );
};

export default ProfilePage;
