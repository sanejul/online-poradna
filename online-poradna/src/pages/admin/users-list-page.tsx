import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Modal from '../../components/modal/modal';
import styles from './users-list-page.module.css';
import paginationStyles from '../questions/archive-page.module.css';
import LoadingSpinner from '../../components/loading-spinner';
import Button from '../../components/buttons/button';
import SearchBar from '../../components/navigation/search-bar';
import Pagination from '@mui/material/Pagination';
import {
  validateFirstName,
  validateLastName,
  validateEmail,
} from '../../helpers/validation-helper';
import { useNotification } from '../../contexts/notification-context';
import { Helmet } from 'react-helmet';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [fieldErrors, setFieldErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [fieldValid, setFieldValid] = useState({
    firstName: false,
    lastName: false,
    email: false,
  });
  const [touchedFields, setTouchedFields] = useState<{
    [key: string]: boolean;
  }>({
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
            const allUsers: User[] = usersSnapshot.docs.map(
              (doc) =>
                ({
                  id: doc.id,
                  ...doc.data(),
                }) as User
            );

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
    const allUsers: User[] = usersSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as User
    );
    setUsers(allUsers);
    setFilteredUsers(allUsers);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const lowerCaseQuery = query.toLowerCase();
    const filtered = users.filter(
      (user) =>
        `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .includes(lowerCaseQuery) ||
        user.email.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleChange = async (field: string, value: string) => {
    if (editingUser && editingUser[field] === value) {
      return;
    }

    setEditingUser((prevUser: any) => ({ ...prevUser, [field]: value }));

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

        // Kontrola jedinečnosti e-mailu
        if (isValid && editingUser?.email !== value) {
          const emailQuery = query(
            collection(db, 'users'),
            where('email', '==', value)
          );
          const emailSnapshot = await getDocs(emailQuery);
          if (!emailSnapshot.empty) {
            const isCurrentEmail = emailSnapshot.docs.some(
              (doc) => doc.id === editingUser?.id
            );
            if (!isCurrentEmail) {
              error = 'Tento e-mail je již registrován.';
              isValid = false;
            }
          }
        }
        break;
      default:
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [field]: error }));
    setFieldValid((prev) => ({ ...prev, [field]: isValid }));
  };

  const isFormValid = () => {
    return (
      Object.values(fieldValid).some((valid) => valid) && // Alespoň jedno pole je validní
      !Object.values(fieldErrors).some((error) => error) // Žádné pole nemá chybu
    );
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

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
      showNotification(
        <p>
          Osobní údaje {userToDelete?.firstName} {userToDelete?.lastName} byly
          úspěšně aktualizovány.
        </p>,
        15
      );

      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, ...dataToUpdate } : user
        )
      );
      await fetchUsers();
      setEditingUser(null);
      setTouchedFields({ firstName: false, lastName: false, email: false });
    } catch (e) {
      showNotification(
        <p>Osobní údaje se nepodařilo aktualizovat. Zkuste to prosím znovu.</p>,
        10,
        'warning'
      );
      console.error('Chyba při ukládání dat:', e);
      setError('Chyba při ukládání dat.');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await deleteDoc(userDocRef);
      console.log('Uživatel úspěšně smazán:', userId);

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      await fetchUsers();

      setIsModalOpen(false);
      showNotification(
        <p>
          Uživatel {userToDelete?.firstName} {userToDelete?.lastName} byl
          úspěšně smazán.
        </p>,
        5
      );
    } catch (e) {
      showNotification(
        <p>
          Smazání uživatele {userToDelete?.firstName} {userToDelete?.lastName}{' '}
          se nezdařilo. Zkuste to prosím znovu.
        </p>,
        10,
        'warning'
      );
      console.error('Chyba při mazání uživatele:', e);
      setError('Chyba při mazání uživatele.');
    }
  };

  const openDeleteModal = (user: any) => {
    if (!user) {
      showNotification(
        <p>Nepovedlo se načíst uživatele, zkuste to prosím znovu.</p>,
        10,
        'warning'
      );
      console.error('Neplatný uživatel předaný do openDeleteModal.');
      return;
    }

    setUserToDelete(user);
    setModalContent(
      <div className={'modalContainer'}>
        <p>
          Opravdu chcete smazat uživatele {userToDelete?.firstName}{' '}
          {userToDelete?.lastName}?
        </p>
        <div className={'modalActions'}>
          <Button
            type={'button'}
            variant="secondary"
            onClick={() => setIsModalOpen(false)}
          >
            zrušit
          </Button>
          <Button
            type={'button'}
            variant="delete"
            onClick={async () => {
              if (user.id) {
                await deleteUser(user.id);
                setIsModalOpen(false);
              } else {
                showNotification(
                  <p>Neplatný uživatel, mazání se nezdařilo.</p>,
                  10,
                  'warning'
                );
              }
            }}
          >
            smazat
          </Button>
        </div>
      </div>
    );
    setIsModalOpen(true);
  };

  if (loading) {
    return <LoadingSpinner></LoadingSpinner>;
  }

  return (
    <div className={styles.container}>
      <Helmet>
        <title>Uživatelé - Poradna Haaro Naturo</title>
        <meta name="description" content="Správa uživatelů a jejich rolí." />
      </Helmet>
      <h1>Seznam uživatelů</h1>
      <div className={styles.searchBarContainer}>
        <SearchBar
          onSearch={handleSearch}
          placeholder="Vyhledat uživatele..."
        />
      </div>
      <ul>
        {currentItems.map((user) => (
          <li key={user.id}>
            {editingUser?.id === user.id ? (
              <div className={styles.userItemEdit}>
                <h2>Editace uživatele</h2>
                <div
                  className={`input-container ${fieldErrors.firstName ? 'error' : fieldValid.firstName ? 'valid' : ''}`}
                >
                  <label>Jméno *</label>
                  <input
                    type="text"
                    defaultValue={user.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    required
                  />
                  {fieldErrors.firstName && (
                    <p className="errorText">{fieldErrors.firstName}</p>
                  )}
                </div>
                <div
                  className={`input-container ${fieldErrors.lastName ? 'error' : fieldValid.lastName ? 'valid' : ''}`}
                >
                  <label>Příjmení *</label>
                  <input
                    type="text"
                    defaultValue={user.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    required
                  />
                  {fieldErrors.lastName && (
                    <p className="errorText">{fieldErrors.lastName}</p>
                  )}
                </div>
                <div
                  className={`input-container ${fieldErrors.email ? 'error' : fieldValid.email ? 'valid' : ''}`}
                >
                  <label>Email *</label>
                  <input
                    type="text"
                    defaultValue={user.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                  {fieldErrors.email && (
                    <p className="errorText">{fieldErrors.email}</p>
                  )}
                </div>
                <div className={'input-container'}>
                  <label>Role *</label>
                  <select
                    defaultValue={user.role}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, role: e.target.value })
                    }
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <Button
                  variant="primary"
                  type="submit"
                  onClick={() => saveUser(user.id, editingUser)}
                  disabled={!isFormValid()}
                >
                  Uložit
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setEditingUser(null)}
                >
                  Zrušit
                </Button>
              </div>
            ) : (
              <div className={styles.profileInfo}>
                <div className={styles.personalInfo}>
                  <p>
                    <strong>Jméno:</strong> {user.firstName} {user.lastName}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {user.role}
                  </p>
                </div>
                <div className={styles.buttonsContainer}>
                  <Button
                    variant="edit"
                    type="button"
                    onClick={() => setEditingUser(user)}
                  >
                    Upravit
                  </Button>
                  <Button
                    variant="delete"
                    type="button"
                    onClick={() => openDeleteModal(user)}
                  >
                    Smazat
                  </Button>
                </div>
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
