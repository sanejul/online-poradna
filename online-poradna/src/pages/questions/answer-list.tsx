import React, { useEffect, useState } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, onSnapshot, orderBy, updateDoc, doc, getDoc } from 'firebase/firestore';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import CustomCloseIcon from '../../components/icons/close-icon';
import Button from '../../components/buttons/button';
import styles from './question-detail-page.module.css';
import editPen from '../../assets/icons/edit-pen.png';

interface AnswerListProps {
  questionId: string;
}

interface Answer {
  id: string;
  text: string;
  author: { displayName: string; uid: string };
  createdAt: { seconds: number; nanoseconds: number };
  attachments?: string[];
}

const AnswerList: React.FC<AnswerListProps> = ({ questionId }) => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [currentAttachments, setCurrentAttachments] = useState<string[]>([]);
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editedAnswerText, setEditedAnswerText] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [questionAuthorUid, setQuestionAuthorUid] = useState<string | null>(null);
  const currentUserUid = auth.currentUser?.uid;

  // Kontrola role administrátora
  useEffect(() => {
    const fetchUserRole = async () => {
      if (currentUserUid) {
        const userRef = doc(db, 'users', currentUserUid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        setIsAdmin(userData?.role === 'admin');
      }
    };
    fetchUserRole();
  }, [currentUserUid]);

  // Načtení ID autora dotazu
  useEffect(() => {
    const fetchQuestionAuthor = async () => {
      const questionRef = doc(db, 'questions', questionId);
      const questionSnap = await getDoc(questionRef);
      const questionData = questionSnap.data();
      setQuestionAuthorUid(questionData?.user?.uid || null);
    };
    fetchQuestionAuthor();
  }, [questionId]);

  useEffect(() => {
    const q = query(collection(db, 'questions', questionId, 'answers'), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const answersList: Answer[] = [];
      querySnapshot.forEach((doc) => {
        answersList.push({ ...doc.data(), id: doc.id } as Answer);
      });
      setAnswers(answersList);
    });

    return () => unsubscribe();
  }, [questionId]);

  const handleAttachmentClick = (attachments: string[], index: number) => {
    setCurrentAttachments(attachments);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const handleEditAnswer = (answerId: string, currentText: string) => {
    setEditingAnswerId(answerId);
    setEditedAnswerText(currentText);
  };

  const handleSaveAnswer = async (answerId: string) => {
    const answerRef = doc(db, 'questions', questionId, 'answers', answerId);
    await updateDoc(answerRef, { text: editedAnswerText });
    setEditingAnswerId(null);
  };

  const handleCancelEdit = () => {
    setEditingAnswerId(null);
    setEditedAnswerText('');
  };

  return (
    <div>
      {answers.length === 0 ? (
        <p>Na tento dotaz zatím nikdo neodpověděl.</p>
      ) : (
        <div className={styles.answerList}>
          {answers.map((answer) => (
            <div
              key={answer.id}
              className={`${styles.bubbleContainer} ${
                (answer.author.uid !== currentUserUid && currentUserUid !== undefined) || (currentUserUid === undefined && answer.author.uid === questionAuthorUid)
                  ? styles.left
                  : styles.right
              }`}
            >
              <div
                className={`${styles.bubbleInfo} ${
                  (answer.author.uid !== currentUserUid && currentUserUid !== undefined) || (currentUserUid === undefined && answer.author.uid === questionAuthorUid)
                    ? styles.leftBubbleInfo
                    : styles.rightBubbleInfo
                }`}
              >
                <p>{answer.author.displayName.split(' ')[0]}</p>
                <p className={styles.date}>
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
                className={`${isAdmin ? styles.bubbleEditContainer : ''}`}
              >
                {isAdmin && (
                  <div className={styles.answerActions}>
                    {editingAnswerId === answer.id ? (
                      <div className={styles.actionButtonsContainer}>
                        <Button variant="primary" type="submit" onClick={() => handleSaveAnswer(answer.id)}>
                          Uložit změny
                        </Button>
                        <Button variant="secondary" type="button" onClick={handleCancelEdit}>
                          Zrušit
                        </Button>
                      </div>
                    ) : (
                      <button
                        className={styles.editIconBtn}
                        type="button"
                        onClick={() => handleEditAnswer(answer.id, answer.text)}
                      >
                        <img src={editPen} alt="edit-pen" />
                      </button>
                    )}
                  </div>
                )}

                <div
                  className={`${styles.bubble} 
                    ${
                    (answer.author.uid !== currentUserUid && currentUserUid !== undefined) || (currentUserUid === undefined && answer.author.uid === questionAuthorUid)
                      ? styles.leftBubble
                      : styles.rightBubble
                  } 
                    ${editingAnswerId === answer.id ? styles.bubbleEditMode : ''}`}
                >
                  {editingAnswerId === answer.id ? (
                    <textarea
                      value={editedAnswerText}
                      onChange={(e) => setEditedAnswerText(e.target.value)}
                      className={styles.textInput}
                    />
                  ) : (
                    <p
                      className={styles.formattedText}
                      dangerouslySetInnerHTML={{ __html: answer.text }}
                    />
                  )}
                </div>
              </div>

              {answer.attachments && answer.attachments.length > 0 && (
                <div className={styles.attachmentPreviews}>
                  <div
                    className={`${styles.previewContainer} ${
                      (answer.author.uid !== currentUserUid && currentUserUid !== undefined) || (currentUserUid === undefined && answer.author.uid === questionAuthorUid)
                        ? styles.leftPreviewContainer
                        : styles.rightPreviewContainer
                    }`}
                  >
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
          }}
        />
      )}
    </div>
  );
};

export default AnswerList;
