import React from 'react';
import { Link } from 'react-router-dom';
import styles from './question-list-item.module.css';

interface QuestionListItemProps {
  id: string;
  title: string;
  text: string;
  createdAt: Date;
  isAnswered: boolean;
  category: string[];
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
      <p className={styles.category}>
        {category.map((cat, index) => (
          <span key={index} className={styles.categoryItem}>
      {cat}{' '}
    </span>
        ))}
      </p>
      <div className={styles.info}>
        <div>
          <p className={styles.date}>{createdAt.toLocaleDateString('cs-CZ')}{' '}</p>
          <p className={`${isAnswered ? styles.isAnswered : ''}`}>{isAnswered ? 'Zodpovězeno' : 'Čeká na odpověď'}</p>
        </div>
        <Link to={`/questions/${id}`} className={styles.button}>
          prohlédnout
        </Link>
      </div>
    </li>
  );
};

export default QuestionListItem;
