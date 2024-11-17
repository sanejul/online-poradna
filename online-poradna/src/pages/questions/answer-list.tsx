import React, { useEffect, useState } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, onSnapshot, orderBy, updateDoc, doc, getDoc } from 'firebase/firestore';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import CustomCloseIcon from '../../components/icons/close-icon';
import { validateQuestionText } from '../../helpers/validation-helper';
import { convertTextForEditing, formatTextForDisplay } from '../../utils/text-utils';
import Button from '../../components/buttons/button';
import styles from './question-detail-page.module.css';
import editPen from '../../assets/icons/edit-pen.png';

interface AnswerListProps {
  questionId: string;
}

interface Attachment {
  thumbnailUrl: string;
  fullImageUrl: string;
  originalUrl: string;
}

interface Answer {
  id: string;
  text: string;
  author: { displayName: string; uid: string };
  createdAt: { seconds: number; nanoseconds: number };
  attachments?: Attachment[];
}

const AnswerList: React.FC<AnswerListProps> = ({ questionId }) => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editedAnswerText, setEditedAnswerText] = useState<string>('');
  const [currentAttachments, setCurrentAttachments] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [questionAuthorUid, setQuestionAuthorUid] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [fieldValid, setFieldValid] = useState<{ [key: string]: boolean }>({});
  const currentUserUid = auth.currentUser?.uid;

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
        const data = doc.data();
        const transformedAttachments = (data.attachments || []).map((attachment: any) => ({
          thumbnailUrl: attachment.thumbnailUrl || '',
          fullImageUrl: attachment.fullImageUrl || '',
          originalUrl: attachment.originalUrl || '',
        }));
        answersList.push({
          ...data,
          id: doc.id,
          attachments: transformedAttachments,
        } as Answer);
      });
      console.warn('Transformed answers with attachments:', answersList);
      setAnswers(answersList);
    });

    return () => unsubscribe();
  }, [questionId]);

  useEffect(() => {
    if (questionId && answers) {
      updateIsAnsweredStatus();
    }
  }, [answers, questionId]);

  const updateIsAnsweredStatus = async () => {
    if (!questionId) return;
    const questionRef = doc(db, 'questions', questionId);

    try {
      await updateDoc(questionRef, { isAnswered: answers.length > 0 });
      console.log(`Question ${questionId} marked as answered: ${answers.length > 0}`);
    } catch (error) {
      console.error('Error updating isAnswered field:', error);
    }
  };

  const handleAttachmentClick = (attachments: Attachment[], index: number) => {
    const imageUrls = attachments.map((attachment) =>
      attachment.fullImageUrl || attachment.originalUrl || attachment.thumbnailUrl
    );
    console.warn('Attachments passed to handleAttachmentClick:', attachments);
    console.warn('imageUrls for Lightbox:', imageUrls);
    setCurrentAttachments(imageUrls);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const handleEditAnswer = (answerId: string, currentText: string) => {
    setEditingAnswerId(answerId);
    setEditedAnswerText(convertTextForEditing(currentText));
  };

  const handleAnswerBlur = (answerId: string) => {
    const error = validateQuestionText(editedAnswerText);
    const isValid = !error;

    setFieldErrors(prev => ({ ...prev, [answerId]: error }));
    setFieldValid(prev => ({ ...prev, [answerId]: isValid }));
  };

  const handleSaveAnswer = async (answerId: string) => {
    if (fieldErrors[answerId]) {
      console.error('Prázdnou odpověď nelze uložit.');
      return;
    }

    const answerRef = doc(db, 'questions', questionId, 'answers', answerId);
    const formattedText = formatTextForDisplay(editedAnswerText);
    await updateDoc(answerRef, { text: formattedText });
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
                        <Button variant="secondary" type="button" onClick={handleCancelEdit}>
                          Zrušit
                        </Button>
                        <Button variant="primary" type="submit" onClick={() => handleSaveAnswer(answer.id)}
                                disabled={!fieldValid[answer.id] || !editedAnswerText.trim()}>
                          Uložit změny
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
                    <div
                      className={`input-container ${fieldErrors[answer.id] ? 'error' : fieldValid[answer.id] ? 'valid' : ''}`}>
                      <textarea
                        value={editedAnswerText}
                        onChange={(e) => setEditedAnswerText(e.target.value)}
                        onBlur={() => handleAnswerBlur(answer.id)}
                        required
                        className={styles.textInput}
                      />
                      {fieldErrors[answer.id] && <p className="errorText">{fieldErrors[answer.id]}</p>}
                    </div>
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
                    {answer.attachments.map((file, index) => (
                      <img
                        key={index}
                        src={file.thumbnailUrl || file.originalUrl}
                        alt={`Příloha ${index + 1}`}
                        className={styles.previewImage}
                        onClick={() => handleAttachmentClick(answer.attachments || [], index)}
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
          slides={currentAttachments.map((url) => ({ src: url }))}
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
