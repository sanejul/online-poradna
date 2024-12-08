import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNotification } from '../contexts/notification-context';
import { useNavigate, useLocation } from 'react-router-dom';

export const useAuthLogic = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from: string })?.from || '/';

  const handleUserLogout = async (callback?: () => void) => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      setIsAdmin(false);
      navigate(from);
      showNotification(<p>Uživatel odhlášen.</p>, 5);
      if (callback) {
        callback();
        showNotification(<p>Uživatel odhlášen.</p>, 5);
      }
    } catch (error) {
      showNotification(
        <p>Uživatele se nepodařilo odhlásit. Zkuste to prosím znovu.</p>,
        5,
        'warning'
      );
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);

        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.role === 'admin') {
            setIsAdmin(true);
          }
        }
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    isAuthenticated,
    isAdmin,
    handleUserLogout,
  };
};
