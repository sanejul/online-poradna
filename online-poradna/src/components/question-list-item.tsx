// QuestionListItem.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './question-list-item.module.css';

interface QuestionListItemProps {
  id: string;
  title: string;
  text: string;
  createdAt: Date;            // Datum vytvoření dotazu
  isAnswered: boolean;        // Stav zodpovězení dotazu
  category: string;           // Kategorie dotazu
}

const QuestionListItem: React.FC<QuestionListItemProps> = ({
                                                             id,
                                                             title,
                                                             text,
                                                             createdAt,
                                                             isAnswered,
                                                             category,
                                                           }) => {
  return (
    <li className={styles.listItem}>
      <Link to={`/questions/${id}`} className={styles.title}>
        <h2>{title}</h2>
      </Link>
      {/*<p className={styles.text}>{text}</p>*/}
      <p>Kategorie: <strong>{category}</strong>{' '}</p>
      <div className={styles.info}>
        <div>
          <p>{createdAt.toLocaleDateString('cs-CZ')}{' '}</p>
          <p>{isAnswered ? 'Zodpovězeno' : 'Nezodpovězeno'}</p>
        </div>
        <Link to={`/questions/${id}`} className={styles.button}>
          Prohlédnout
        </Link>
      </div>
    </li>
  );
};

export default QuestionListItem;