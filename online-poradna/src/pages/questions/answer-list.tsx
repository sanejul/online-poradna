import React, { useEffect, useState } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import CustomCloseIcon from '../../components/icons/close-icon';
import CustomPrevIcon from '../../components/icons/prev-icon';
import CustomNextIcon from '../../components/icons/next-icon';
/*import styles from './answer-list.module.css';*/
import styles from './question-detail-page.module.css';

interface AnswerListProps {
  questionId: string;
  isAuthor: boolean;
}

interface Answer {
  id: string;
  text: string;
  author: { displayName: string; uid: string };
  createdAt: { seconds: number; nanoseconds: number };
  attachments?: string[];
}

const AnswerList: React.FC<AnswerListProps> = ({ questionId, isAuthor }) => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [currentAttachments, setCurrentAttachments] = useState<string[]>([]);
  const currentUserUid = auth.currentUser?.uid;

  useEffect(() => {
    const q = query(collection(db, 'questions', questionId, 'answers'), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const answersList: Answer[] = [];
      querySnapshot.forEach((doc) => {
        answersList.push({ ...doc.data(), id: doc.id } as Answer);
      });
      setAnswers(answersList); // Zobrazení bez reverzního řazení
    });

    return () => unsubscribe();
  }, [questionId]);


  const handleAttachmentClick = (attachments: string[], index: number) => {
    setCurrentAttachments(attachments);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <div>
      {answers.length === 0 ? (
        <p>Na tento dotaz zatím nikdo neodpověděl.</p>
      ) : (
        <div className={styles.answerList}>
          {answers.map((answer) => (
            <div key={answer.id} className={styles.bubbleContainer}>
              <div
                className={`${styles.bubbleInfo} ${answer.author.uid !== currentUserUid ? styles.leftBubbleInfo : styles.rightBubbleInfo}`}>
                <p>{answer.author.displayName.split(' ')[0]}</p>
                <p className={styles.timestamp}>
                  {new Date(answer.createdAt.seconds * 1000).toLocaleString('cs-CZ', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div
                className={`${styles.bubble} 
                  ${answer.author.uid !== currentUserUid
                  ? styles.leftBubble // Pokud je odpověď od aktuálně přihlášeného uživatele, zobrazí se vpravo
                  : styles.rightBubble // Pokud je odpověď od někoho jiného, zobrazí se vlevo
                }`}
              >
                <p
                  className={styles.formattedText}
                  dangerouslySetInnerHTML={{ __html: answer.text }}
                />
              </div>

              <div key={answer.id}>
                {answer.attachments && answer.attachments.length > 0 && (
                  <div className={styles.attachmentPreviews}>
                    <div className={`${styles.previewContainer} ${answer.author.uid !== currentUserUid ? styles.rightPreviewContainer : styles.leftPreviewContainer}`}>
                      {answer.attachments.map((file: string, index: number) => (
                        <img
                          key={index}
                          src={file}
                          alt={`Příloha ${index + 1}`}
                          className={styles.previewImage}
                          onClick={() => handleAttachmentClick(answer.attachments!, index)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isLightboxOpen && (
        <Lightbox
          slides={currentAttachments.map((file) => ({ src: file }))}
          open={isLightboxOpen}
          close={() => setIsLightboxOpen(false)}
          index={lightboxIndex}
          styles={{
            container: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(5px)',
            },
          }}
          render={{
            buttonClose: () => <CustomCloseIcon onClick={() => setIsLightboxOpen(false)} />,
            /*       buttonPrev: () => (
                     <CustomPrevIcon onClick={() => setLightboxIndex((lightboxIndex - 1 + currentAttachments.length) % currentAttachments.length)} />
                   ),
                   buttonNext: () => (
                     <CustomNextIcon onClick={() => setLightboxIndex((lightboxIndex + 1) % currentAttachments.length)} />
                   ),*/
          }}
        />
      )}
    </div>
  );
};

export default AnswerList;
