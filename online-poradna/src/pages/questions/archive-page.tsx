import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import LoadingSpinner from "../../components/loading-spinner";
import QuestionListItem from "../../components/question-list-item";
import styles from "./archive-page.module.css";
import SearchBar from '../../components/navigation/search-bar';
import Button from '../../components/buttons/button';

// Definice rozhraní pro otázky
interface Question {
  id: string;
  title: string;
  questionText: string;
  createdAt: { seconds: number; nanoseconds: number };
  isAnswered: boolean;
  category: string[];
}

interface Category {
  id: string;
  name: string;
}

const ArchivePage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["all"]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  useEffect(() => {
    // Fetch categories as objects with id and name
    const categoriesRef = collection(db, "categories");
    const unsubscribeCategories = onSnapshot(categoriesRef, (querySnapshot) => {
      const categoryList: Category[] = [{ id: "all", name: "Všechny kategorie" }];
      querySnapshot.forEach((doc) => {
        categoryList.push({ id: doc.id, name: doc.data().name });
      });
      setCategories(categoryList);
    });

    return () => unsubscribeCategories();
  }, []);

  useEffect(() => {
    // Fetch questions and store their data including category IDs
    const questionsRef = collection(db, "questions");
    const unsubscribeQuestions = onSnapshot(questionsRef, (querySnapshot) => {
      const questionsList: Question[] = [];
      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() } as Question;
        questionsList.push(data);
      });

      setQuestions(questionsList);
      setFilteredQuestions(questionsList);
      setLoading(false);
    });

    return () => unsubscribeQuestions();
  }, []);

  useEffect(() => {
    let filtered = questions;

    // Apply text search filter first
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((question) =>
        (question.title || "").toLowerCase().includes(lowerCaseQuery) ||
        (question.questionText || "").toLowerCase().includes(lowerCaseQuery)
      );
    }

    // Apply category filter if "Všechny kategorie" is not selected
    if (!selectedCategories.includes("all") && selectedCategories.length > 0) {
      filtered = filtered.filter((question) => {
        if (Array.isArray(question.category)) {
          return question.category.some((catId) => selectedCategories.includes(catId));
        }
        return false;
      });
    }

    setFilteredQuestions(filtered);
  }, [searchQuery, questions, selectedCategories]);


  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const toggleCategoryDropdown = () => {
    setShowCategoryDropdown(!showCategoryDropdown);
  };

  const handleCategorySelect = (categoryId: string) => {
    if (categoryId === "all") {
      setSelectedCategories(["all"]);
    } else {
      setSelectedCategories((prevSelected) => {
        const isSelected = prevSelected.includes(categoryId);
        let newSelection;

        if (isSelected) {
          newSelection = prevSelected.filter((cat) => cat !== categoryId);
          return newSelection.length === 0 ? ["all"] : newSelection;
        }
        return prevSelected.filter((cat) => cat !== "all").concat(categoryId);
      });
    }
  };

  return (
    <div className={styles.archiveContainer}>
      <h1>Všechny dotazy</h1>

      <div className={styles.searchBar}>
        <SearchBar onSearch={handleSearch} placeholder={"Vyhledat dotaz..."} />
      </div>

      <div className={styles.categoryContainer}>
        <Button type={'button'} variant={'secondary'} onClick={toggleCategoryDropdown}>
          {showCategoryDropdown ? 'Skrýt kategorie' : 'Kategorie'}
          <span className={`${styles.arrowIcon} ${showCategoryDropdown ? styles.arrowUp : styles.arrowDown}`}></span>
        </Button>
        {showCategoryDropdown && (
          <div className={styles.categoryDropdown}>
            {categories.map((category) => (
              <div key={category.id}>
                <input
                  type="checkbox"
                  id={`category-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategorySelect(category.id)}
                />
                <label htmlFor={`category-${category.id}`} className={styles.categoryLabel}>
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredQuestions.length === 0 ? (
        <p>Zatím nejsou žádné dotazy.</p>
      ) : (
        <ul className={styles.listItemContainer}>
          {filteredQuestions.map((question) => (
            <QuestionListItem
              key={question.id}
              id={question.id}
              title={question.title}
              text={question.questionText}
              createdAt={new Date(question.createdAt.seconds * 1000)}
              isAnswered={question.isAnswered}
              category={
                Array.isArray(question.category)
                  ? question.category
                    .map((catId) => categories.find(cat => cat.id === catId)?.name || catId)
                    .join(' ')
                  : ('Žádná kategorie')
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default ArchivePage;
