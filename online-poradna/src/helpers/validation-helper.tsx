import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export const validateFirstName = (firstName: string): string => {
  if (!firstName.trim()) {
    return 'Jméno musí být vyplněné.';
  }
  return '';
};

export const validateLastName = (lastName: string): string => {
  if (!lastName.trim()) {
    return 'Příjmení musí být vyplněné.';
  }
  return '';
};

export const validateEmail = (email: string): string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Zadejte platnou e-mailovou adresu.';
  }
  return '';
};

export const isEmailUnique = async (email: string): Promise<boolean> => {
  const usersCollection = collection(db, 'users');
  const q = query(usersCollection, where('email', '==', email));
  const querySnapshot = await getDocs(q);

  return querySnapshot.empty;
};

export const validatePassword = (password: string): string => {
  if (password.length < 6) {
    return 'Heslo musí mít alespoň 6 znaků';
  }
  return '';
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): string => {
  if (password !== confirmPassword) {
    return 'Hesla se neshodují';
  }
  return '';
};

export const validateQuestionTitle = (questionTitle: string): string => {
  if (!questionTitle.trim()) {
    return 'Název dotazu musí být vyplněný.';
  }
  return '';
};

export const validateQuestionText = (questionText: string): string => {
  if (!questionText.trim()) {
    return 'Text dotazu/odpovědi musí být vyplněný.';
  }
  return '';
};

export const validateCategoryName = (categoryName: string): string => {
  if (!categoryName.trim()) {
    return 'Text dotazu/odpovědi musí být vyplněný.';
  }
  return '';
};
