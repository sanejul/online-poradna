import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Modal from '../../components/modal/modal';
import styles from './users-list-page.module.css'
import paginationStyles from '../questions/archive-page.module.css'
import LoadingSpinner from '../../components/loading-spinner';
import Button from '../../components/buttons/button';
import SearchBar from '../../components/navigation/search-bar';
import Pagination from '@mui/material/Pagination';
import { validateFirstName, validateLastName, validateEmail, isEmailUnique } from '../../helpers/validation-helper';
import { useNotification } from '../../contexts/notification-context';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const UsersListPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const { showNotification } = useNotification();

  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [fieldErrors, setFieldErrors] = useState({ firstName: '', lastName: '', email: '' });
  const [fieldValid, setFieldValid] = useState({ firstName: false, lastName: false, email: false });
  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({
    firstName: false,
    lastName: false,
    email: false,
  });

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
            const allUsers: User[] = usersSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            } as User));

            allUsers.sort((a, b) => a.firstName.localeCompare(b.firstName));
            setUsers(allUsers);
            setFilteredUsers(allUsers);
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

  const fetchUsers = async () => {
    const usersCollectionRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollectionRef);
    const allUsers: User[] = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as User));
    setUsers(allUsers);
    setFilteredUsers(allUsers);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const lowerCaseQuery = query.toLowerCase();
    const filtered = users.filter((user) =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(lowerCaseQuery) ||
      user.email.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleChange = (field: string, value: string) => {
    setEditingUser((prevUser: any) => ({ ...prevUser, [field]: value }));
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
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
        isValid = !error;

        if (isValid) {
          const emailQuery = query(collection(db, 'users'), where('email', '==', value));
          const emailSnapshot = await getDocs(emailQuery);
          if (!emailSnapshot.empty && editingUser?.email !== value) {
            error = 'Tento e-mail je již registrován.';
            isValid = false;
          }
        }
        break;
      default:
        break;
    }

    setFieldErrors(prev => ({ ...prev, [field]: error }));
    setFieldValid(prev => ({ ...prev, [field]: isValid }));
  };

  const isFormValid = () => {
    return Object.entries(touchedFields).some(([field, touched]) => touched) &&
      Object.entries(fieldValid).every(([field, valid]) => {
        return !touchedFields[field] || (touchedFields[field] && valid);
      });
  };

  // Výpočet položek pro aktuální stránku
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({
      top: 0, // Posune stránku na vrchol
      behavior: 'smooth', // Plynulý přechod
    });
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // uložení upravených údajů
  const saveUser = async (userId: string, updatedUserData: any) => {
    if (Object.values(fieldErrors).some((err) => err)) {
      setError('Opravte chyby před uložením.');
      return;
    }

    try {
      const { id, ...dataToUpdate } = updatedUserData;

      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, dataToUpdate);
      console.log('Uživatel úspěšně aktualizován:', dataToUpdate);
      showNotification(<p>Osobní údaje {userToDelete?.firstName} {userToDelete?.lastName} byly úspěšně aktualizovány.</p>, 15);

      setUsers(users.map(user => (user.id === userId ? { ...user, ...dataToUpdate } : user)));
      await fetchUsers();
      setEditingUser(null);
      setTouchedFields({ firstName: false, lastName: false, email: false });
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
      setUsers((prevUsers) => prevUsers.filter(user => user.id !== userId));
      await fetchUsers();

      setIsModalOpen(false);
      showNotification(<p>Uživatel {userToDelete?.firstName} {userToDelete?.lastName} byl úspěšně smazán.</p>, 5);
    } catch (e) {
      console.error('Chyba při mazání uživatele:', e);
      setError('Chyba při mazání uživatele.');
    }
  };

  const openDeleteModal = (user: any) => {
    setUserToDelete(user);
    setModalContent(
      <div className={"modalContainer"}>
        <p>Opravdu chcete smazat uživatele {userToDelete?.firstName} {userToDelete?.lastName}?</p>
        <div className={"modalActions"}>
          <Button type={'button'} variant="secondary" onClick={() => setIsModalOpen(false)}>zrušit</Button>
          <Button type={'button'} variant="delete" onClick={async () => {
            await deleteUser(userToDelete.id)
            setIsModalOpen(false);
          }}>smazat</Button>
        </div>
      </div>
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
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
      <SearchBar onSearch={handleSearch} placeholder="Vyhledat uživatele..." />
      <ul>
        {currentItems.map((user) => (
          <li key={user.id}>
            {editingUser?.id === user.id ? (
              <div className={styles.userItemEdit}>
                <h2>Editace uživatele</h2>
                <div
                  className={`input-container ${fieldErrors.firstName ? 'error' : fieldValid.firstName ? 'valid' : ''}`}>
                  <label>Jméno *</label>
                  <input
                    type="text"
                    defaultValue={user.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    onBlur={() => handleBlur('firstName', editingUser.firstName)}
                    required
                  />
                  {fieldErrors.firstName && <p className="errorText">{fieldErrors.firstName}</p>}
                </div>
                <div
                  className={`input-container ${fieldErrors.lastName ? 'error' : fieldValid.lastName ? 'valid' : ''}`}>
                  <label>Příjmení *</label>
                  <input
                    type="text"
                    defaultValue={user.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    onBlur={() => handleBlur('lastName', editingUser.lastName)}
                    required
                  />
                  {fieldErrors.lastName && <p className="errorText">{fieldErrors.lastName}</p>}
                </div>
                <div className={`input-container ${fieldErrors.email ? 'error' : fieldValid.email ? 'valid' : ''}`}>
                  <label>Email *</label>
                  <input
                    type="text"
                    defaultValue={user.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email', editingUser.email)}
                    required
                  />
                  {fieldErrors.email && <p className="errorText">{fieldErrors.email}</p>}
                </div>
                <div className={"input-container"}>
                  <label>Role *</label>
                  <select
                    defaultValue={user.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <Button variant="primary" type="submit" onClick={() => saveUser(user.id, editingUser)} disabled={!isFormValid()}>Uložit</Button>
                <Button variant="secondary" type="button" onClick={() => setEditingUser(null)}>Zrušit</Button>
              </div>
            ) : (
              <div className={styles.userItem}>
                <p><strong>Jméno:</strong> {user.firstName} {user.lastName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <Button variant="edit" type="button" onClick={() => setEditingUser(user)}>Upravit</Button>
                <Button variant="delete" type="button" onClick={() => openDeleteModal(user)}>Smazat</Button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className={`${paginationStyles.pagination} custom-pagination`}>
        <Pagination
          shape="rounded"
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalContent}
      </Modal>
    </div>
  );
};

export default UsersListPage;
