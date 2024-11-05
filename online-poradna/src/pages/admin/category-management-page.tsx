import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import Button from '../../components/buttons/button';
import styles from './category-management-page.module.css';
import { validateCategoryName } from '../../helpers/validation-helper';
import { useNotification } from '../../contexts/notification-context';
import Modal from '../../components/modal/modal';

interface Category {
  id: string;
  name: string;
}

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryError, setNewCategoryError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');
  const [editedCategoryError, setEditedCategoryError] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const { showNotification } = useNotification();

  // Load categories from the database
  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const categoryList: Category[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Category));
      setCategories(categoryList);
    };

    fetchCategories();
  }, []);

  // Add a new category
  const handleAddCategory = async () => {
    const error = validateCategoryName(newCategory);
    setNewCategoryError(error);
    if (error) return;

    try {
      const docRef = await addDoc(collection(db, 'categories'), { name: newCategory });
      setCategories([...categories, { id: docRef.id, name: newCategory }]);
      setNewCategory('');
      setNewCategoryError(null);
      showNotification(<p>Kategorie {newCategory} byla úspěšně přidána.</p>, 8);
    } catch (e) {
      console.error('Error adding category:', e);
    }
  };

  const openDeleteModal = (id: string, name: string) => {
    setCategoryToDelete(id);
    setModalContent(
      <div className={"modalContainer"}>
        <p>Opravdu chcete smazat kategorii {name}?</p>
        <div className={"modalActions"}>
          <Button type={'button'} variant="secondary" onClick={() => setIsModalOpen(false)}>zrušit</Button>
          <Button type={'button'} variant="delete" onClick={async () => {
            await handleDeleteCategory(id, name);
            setIsModalOpen(false);
          }}>smazat</Button>
        </div>
      </div>
    );
    setIsModalOpen(true);
  };

  // Delete a category
  const handleDeleteCategory = async (id: string, name: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
      setCategories(categories.filter(category => category.id !== id));
      showNotification(<p>Kategorie {name} byla úspěšně smazána.</p>, 8);
    } catch (e) {
      console.error('Error deleting category:', e);
    }
  };

  // Start editing a category
  const startEditing = (category: Category) => {
    setEditingCategory(category.id);
    setEditedCategoryName(category.name);
    setEditedCategoryError(null);
  };

  // Save category changes
  const handleSaveEdit = async (id: string, name: string) => {
    const error = validateCategoryName(editedCategoryName);
    setEditedCategoryError(error);
    if (error) return;

    try {
      const docRef = doc(db, 'categories', id);
      await updateDoc(docRef, { name: editedCategoryName });
      setCategories(categories.map(category => category.id === id ? { id, name: editedCategoryName } : category));
      showNotification(<p>Kategorie {name} byla úspěšně upravena.</p>, 8);
      setEditingCategory(null);
      setEditedCategoryName('');
    } catch (e) {
      console.error('Error updating category:', e);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditedCategoryName('');
  };

  return (
    <div className={styles.container}>
      <h1>Správa kategorií</h1>

      <div className={`${styles.newCategory} input-container`}>
        <label>Přidat novou kategorii</label>
        <input
          type="text"
          value={newCategory}
          onChange={(e) => {
            setNewCategory(e.target.value);
            setNewCategoryError(validateCategoryName(e.target.value)); // Validate on change
          }}
          placeholder="Název kategorie"
          required
        />
        {newCategoryError && <p className="errorText">{newCategoryError}</p>}
        <Button type="button" onClick={handleAddCategory} variant="primary">Přidat</Button>
      </div>

      <h2>Seznam kategorií</h2>
      <ul className={styles.categoryList}>
        {categories.map(category => (
          <li key={category.id}>
            {editingCategory === category.id ? (
              <>
                <input
                  type="text"
                  value={editedCategoryName}
                  onChange={(e) => setEditedCategoryName(e.target.value)}
                  onBlur={() => setEditedCategoryError(validateCategoryName(editedCategoryName))}
                  placeholder="Nový název kategorie"
                  required
                />
                {editedCategoryError && <p className="errorText">{editedCategoryError}</p>}
                <Button type="button" onClick={() => handleSaveEdit(category.id, category.name)} variant="primary">Uložit</Button>
                <Button type="button" onClick={handleCancelEdit} variant="secondary">Zrušit</Button>
              </>
            ) : (
              <>
                <span>{category.name}</span>
                <Button type="button" onClick={() => startEditing(category)} variant="edit">Upravit</Button>
                <Button type="button" onClick={() => openDeleteModal(category.id, category.name)} variant="delete">Smazat</Button>
              </>
            )}
          </li>
        ))}
      </ul>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalContent}
      </Modal>
    </div>
  );
};

export default CategoryManagementPage;
