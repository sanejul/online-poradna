import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import Button from '../../components/buttons/button';
import styles from './category-management-page.module.css';

interface Category {
  id: string;
  name: string;
}

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');

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
    if (newCategory.trim()) {
      const docRef = await addDoc(collection(db, 'categories'), { name: newCategory });
      setCategories([...categories, { id: docRef.id, name: newCategory }]);
      setNewCategory('');
    }
  };

  // Delete a category
  const handleDeleteCategory = async (id: string) => {
    await deleteDoc(doc(db, 'categories', id));
    setCategories(categories.filter(category => category.id !== id));
  };

  // Start editing a category
  const startEditing = (category: Category) => {
    setEditingCategory(category.id);
    setEditedCategoryName(category.name);
  };

  // Save category changes
  const handleSaveEdit = async (id: string) => {
    if (editedCategoryName.trim()) {
      const docRef = doc(db, 'categories', id);
      await updateDoc(docRef, { name: editedCategoryName });
      setCategories(categories.map(category => category.id === id ? { id, name: editedCategoryName } : category));
      setEditingCategory(null);
      setEditedCategoryName('');
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

      <div className={styles.newCategory}>
        <label>Přidat novou kategorii</label>
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Název kategorie"
        />
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
                  placeholder="Nový název kategorie"
                />
                <Button type="button" onClick={() => handleSaveEdit(category.id)} variant="primary">Uložit</Button>
                <Button type="button" onClick={handleCancelEdit} variant="secondary">Zrušit</Button>
              </>
            ) : (
              <>
                <span>{category.name}</span>
                <Button type="button" onClick={() => startEditing(category)} variant="edit">Upravit</Button>
                <Button type="button" onClick={() => handleDeleteCategory(category.id)} variant="delete">Smazat</Button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryManagementPage;
