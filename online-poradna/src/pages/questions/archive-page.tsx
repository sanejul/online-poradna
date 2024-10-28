// ArchivePage.tsx

import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import LoadingSpinner from "../../components/loading-spinner";
import QuestionListItem from "../../components/question-list-item";
import styles from "./archive-page.module.css";
import SearchBar from '../../components/navigation/search-bar';

const ArchivePage = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const q = query(collection(db, "questions"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const questionsList: any[] = [];
      querySnapshot.forEach((doc) => {
        questionsList.push({ id: doc.id, ...doc.data() });
      });
      setQuestions(questionsList);
      setFilteredQuestions(questionsList);
      setLoading(false); // Načítání dokončeno
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredQuestions(questions);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = questions.filter((question) =>
        (question.title || "").toLowerCase().includes(lowerCaseQuery) ||
        (question.questionText || "").toLowerCase().includes(lowerCaseQuery) ||
        (question.category || "").toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredQuestions(filtered);
    }
  }, [searchQuery, questions]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div>
      <h1>Všechny dotazy</h1>
      <SearchBar onSearch={handleSearch} placeholder={"Vyhledat dotaz..."} />
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
              category={question.category}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default ArchivePage;
