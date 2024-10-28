import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Modal from '../../components/modal/modal';
import styles from './users-list-page.module.css'
import LoadingSpinner from '../../components/loading-spinner';
import Button from '../../components/buttons/button';

const UsersListPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const checkAdminRole = async (user: any) => {
      try {
        setLoading(true);
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const currentUserData = userDocSnap.data();
          if (currentUserData?.role === 'admin') {
            setIsAdmin(true);
            const usersCollectionRef = collection(db, 'users');
            const usersSnapshot = await getDocs(usersCollectionRef);
            const allUsers = usersSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setUsers(allUsers);
          } else {
            setError('Nemáte oprávnění přistupovat k této stránce.');
          }
        } else {
          setError('Dokument pro aktuálního uživatele nebyl nalezen.');
        }
      } catch (e) {
        setError('Chyba při načítání dat z Firestore.');
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkAdminRole(user);
      } else {
        setError('Není přihlášený žádný uživatel.');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // uložení upravených údajů
  const saveUser = async (userId: string, updatedUserData: any) => {
    try {
      const { id, ...dataToUpdate } = updatedUserData;

      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, dataToUpdate);
      console.log('Uživatel úspěšně aktualizován:', dataToUpdate);

      // update uživatele v seznamu
      setUsers(users.map(user => (user.id === userId ? { ...user, ...dataToUpdate } : user)));
      setEditingUser(null);
    } catch (e) {
      console.error('Chyba při ukládání dat:', e);
      setError('Chyba při ukládání dat.');
    }
  };

  // mazání uživatele
  const deleteUser = async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await deleteDoc(userDocRef);
      console.log('Uživatel úspěšně smazán:', userId);

      // Aktualizujeme seznam uživatelů po smazání
      setUsers(users.filter(user => user.id !== userId));
      setShowModal(false);
    } catch (e) {
      console.error('Chyba při mazání uživatele:', e);
      setError('Chyba při mazání uživatele.');
    }
  };

  const openDeleteModal = (user: any) => {
    setUserToDelete(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setUserToDelete(null);
  };

  if (loading) {
    return <LoadingSpinner></LoadingSpinner>;
  }

  if (!isAdmin) {
    return (
      <div>
        <p>{error ? error : 'Nemáte oprávnění přistupovat k této stránce.'}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Seznam uživatelů</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {editingUser?.id === user.id ? (
              <div>
                <h2>Editace uživatele</h2>
                <p><strong>Jméno:</strong> <input type="text" defaultValue={user.firstName}
                                                  onChange={(e) => setEditingUser({
                                                    ...editingUser,
                                                    firstName: e.target.value,
                                                  })} /></p>
                <p><strong>Příjmení:</strong> <input type="text" defaultValue={user.lastName}
                                                     onChange={(e) => setEditingUser({
                                                       ...editingUser,
                                                       lastName: e.target.value,
                                                     })} /></p>
                <p><strong>Email:</strong> <input type="text" defaultValue={user.email}
                                                  onChange={(e) => setEditingUser({
                                                    ...editingUser,
                                                    email: e.target.value,
                                                  })} /></p>
                <p><strong>Role:</strong>
                  <select defaultValue={user.role}
                          onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </p>
                <Button variant={"primary"} type={"submit"} onClick={() => saveUser(user.id, editingUser)}>Uložit</Button>
                <Button variant={"secondary"} type={"button"} onClick={() => setEditingUser(null)}>Zrušit</Button>
              </div>
            ) : (
              <div className={styles.userItem}>
                <p><strong>Jméno:</strong> {user.firstName} {user.lastName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <Button variant={"edit"} type={"button"} onClick={() => setEditingUser(user)}>Upravit</Button>
                <Button variant={"delete"} type={"button"} onClick={() => openDeleteModal(user)}>Smazat</Button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <Modal isOpen={showModal} onClose={closeModal}>
        <p>Opravdu chcete smazat uživatele {userToDelete?.firstName} {userToDelete?.lastName}?</p>
        <Button variant={"delete"} type={"button"} onClick={() => deleteUser(userToDelete.id)}>Ano, smazat</Button>
        <Button variant={"secondary"} type={"button"} onClick={closeModal}>Zrušit</Button>
      </Modal>
    </div>
  );
};

export default UsersListPage;
