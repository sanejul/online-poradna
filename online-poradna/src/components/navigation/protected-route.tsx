// ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async (user: any) => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const currentUserData = userDocSnap.data();
          setIsAdmin(currentUserData?.role === 'admin');
        } else {
          console.error('Uživatelský dokument nebyl nalezen.');
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Chyba při ověřování role uživatele:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user: any) => {
      if (user) {
        checkAdminRole(user);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Spinner nebo jiný indikátor načítání
  }

  return isAdmin ? <>{children}</> : <Navigate to="/login" />;
};

export default ProtectedRoute;
