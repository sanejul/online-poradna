import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { doc, getDoc, getDocs, collection, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import AnswerList from './answer-list';
import styles from './question-detail-page.module.css';
import archiveStyles from './archive-page.module.css';
import arrow from '../../assets/icons/arrow.png'
import LoadingSpinner from '../../components/loading-spinner';
import CustomCloseIcon from '../../components/icons/close-icon';
import Button from '../../components/buttons/button';
import Modal from '../../components/modal/modal';
import AttachmentInput from '../../components/attachment-input';
import { validateQuestionTitle, validateQuestionText } from '../../helpers/validation-helper';
import editPen from '../../assets/icons/edit-pen.png';
import { useNotification } from '../../contexts/notification-context';
import { uploadAndTransformFiles } from '../../utils/file-utils';
import { formatTextForDisplay, convertTextForEditing } from '../../utils/text-utils';
import { Helmet } from 'react-helmet';

interface Category {
  id: string;
  name: string;
}

interface FileData {
  thumbnailUrl: string;
  fullImageUrl: string;
  originalUrl: string;
}

interface QuestionData {
  title: string;
  questionText: string;
  category: string[];
  createdAt: Timestamp;
  files?: FileData[];
  isAnswered: boolean;
  user: {
    uid: string;
    displayName: string;
    email: string;
  };
}

const QuestionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [editingField, setEditingField] = useState<null | 'title' | 'category' | 'text' | 'newCategory'>(null);
  const [tempQuestion, setTempQuestion] = useState<any>(null);
  const [answerText, setAnswerText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({ title: '', questionText: '', answerText: '' });
  const [fieldValid, setFieldValid] = useState({ title: false, questionText: false, answerText: false });
  const [currentAttachments, setCurrentAttachments] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showNotification } = useNotification();
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const user = auth.currentUser;

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
          setIsAdmin(true);
        }
      }
    };

    console.warn('user:', user);

    checkAdminRole();
  }, [user]);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!id) return;
      const docRef = doc(db, 'questions', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const questionData = docSnap.data();
        console.warn('Fetched question data:', questionData);

        const transformedFiles = questionData.files?.map((file: any) => ({
          thumbnailUrl: file.thumbnailUrl || '',
          fullImageUrl: file.fullImageUrl || '',
          originalUrl: file.originalUrl || '',
        })) || [];

        setQuestion({
          ...questionData,
          files: transformedFiles,
        } as QuestionData);
        setTempQuestion({ ...questionData });
        setSelectedCategoryIds(questionData.category || []);
      }
    };

    const fetchCategories = async () => {
      const categorySnapshot = await getDocs(collection(db, 'categories'));
      const categoryList: Category[] = categorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Category));
      setAllCategories(categoryList);
    };

    fetchQuestion();
    fetchCategories();
  }, [id]);

  useEffect(() => {
    if (question) {
      setTempQuestion({
        title: question.title,
        questionText: question.questionText.replace(/<br\s*\/?>/gi, '\n'),
      });
    }
  }, [question]);

  const handleChange = (field: 'title' | 'questionText' | 'answerText', value: string) => {
    let error = '';
    let isValid = false;

    // Validace podle pole
    if (field === 'title') {
      error = validateQuestionTitle(value.trim());
      isValid = !error;
      setTempQuestion((prev: any) => ({ ...prev, title: value }));
    } else if (field === 'questionText') {
      error = validateQuestionText(value.trim());
      isValid = !error;
      setTempQuestion((prev: any) => ({ ...prev, questionText: value }));
    } else if (field === 'answerText') {
      error = validateQuestionText(value.trim());
      isValid = !error;
      setAnswerText(value);
    }

    // Aktualizace stavů pro chyby a validitu
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
    setFieldValid((prev) => ({ ...prev, [field]: isValid }));
  };


  const handleBlur = (field: 'title' | 'questionText', value: string) => {
    let error = '';
    let isValid = false;

    if (field === 'title') {
      error = validateQuestionTitle(value);
      isValid = !error;
    } else if (field === 'questionText') {
      error = validateQuestionText(value);
      isValid = !error;
    }

    setFieldErrors(prev => ({ ...prev, [field]: error }));
    setFieldValid(prev => ({ ...prev, [field]: isValid }));
  };

  const saveCategoryChanges = async () => {
    if (!id) return;
    try {
      await updateDoc(doc(db, 'questions', id), {
        category: selectedCategoryIds,
      });
      setQuestion({
        ...question!,
        category: selectedCategoryIds,
        title: question?.title || '',
        questionText: question?.questionText || '',
        createdAt: question?.createdAt || Timestamp.now(),
      });
      setEditingField(null);
      setShowCategoryDropdown(false);
    } catch (error) {
      console.error('Error while saving categories:', error);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryIds((prevSelected) =>
      prevSelected.includes(categoryId)
        ? prevSelected.filter((id) => id !== categoryId)
        : [...prevSelected, categoryId],
    );
  };

  const cancelChanges = () => {
    setSelectedCategoryIds(question?.category || []);
    setEditingField(null);
    setShowCategoryDropdown(false);
  };

  const selectedCategoryNames = selectedCategoryIds
    .map(id => allCategories.find(category => category.id === id)?.name)
    .filter(Boolean) as string[];

  const deleteQuestion = () => {
    setModalContent(
      <div className={'modalContainer'}>
        <p>Opravdu chcete odstranit celou konverzaci?</p>
        <div className={'modalActions'}>
          <Button type={'button'} variant="secondary" onClick={() => setIsModalOpen(false)}>zrušit</Button>
          <Button type={'button'} variant="delete" onClick={async () => {
            await deleteDoc(doc(db, 'questions', id!));
            setIsModalOpen(false);
            showNotification(<p>Konverzace byla úspěšně smazána.</p>, 15);
            navigate('/vsechny-dotazy');
          }}>smazat</Button>
        </div>
      </div>,
    );
    setIsModalOpen(true);
  };

  const handleFileClick = (files: FileData[], index: number) => {
    const imageUrls = files.map((file) => file.fullImageUrl || file.originalUrl);
    setCurrentAttachments(imageUrls);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const startEditingQuestionText = () => {
    if (!tempQuestion) return;

    setEditingField('text');
    setTempQuestion({
      ...tempQuestion,
      questionText: convertTextForEditing(tempQuestion.questionText),
    });
  };

  const saveChanges = async () => {
    if (!id || !tempQuestion) return;

    if (fieldErrors.title || fieldErrors.questionText) {
      console.error('Nelze uložit, dokud nejsou vyřešeny chyby.');
      return;
    }

    console.log('Saving title:', tempQuestion.title);

    try {
      await updateDoc(doc(db, 'questions', id), {
        title: tempQuestion.title,
        questionText: formatTextForDisplay(tempQuestion.questionText),
      });
      setQuestion({
        ...question!,
        title: tempQuestion.title,
        questionText: formatTextForDisplay(tempQuestion.questionText),
      });
      setEditingField(null);
      setFieldErrors({ title: '', questionText: '', answerText: '' });
      setFieldValid({ title: false, questionText: false, answerText: false });
      console.log('Změny úspěšně uloženy.');
    } catch (error) {
      console.error('Chyba při ukládání:', error);
    }
  };


  if (!question) return <LoadingSpinner />;

  const isAuthor = question.user?.uid === user?.uid;

  const isAdminRole = async (uid: string): Promise<boolean> => {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    return userDocSnap.exists() && userDocSnap.data().role === 'admin';
  };

  const checkIfAnsweredByAdmin = async (questionId: string): Promise<boolean> => {
    const answersSnapshot = await getDocs(collection(db, 'questions', questionId, 'answers'));
    for (const answer of answersSnapshot.docs) {
      const authorUid = answer.data().author.uid;
      const isAdmin = await isAdminRole(authorUid);
      if (isAdmin) {
        return true;
      }
    }
    return false;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fieldValid.answerText) {
      console.error('Odpověď musí obsahovat nějaký text.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError('Musíte být přihlášeni, abyste mohli odpovědět.');
      return;
    }

    try {
      setIsLoading(true);
      const fileURLs: { thumbnailUrl: string; fullImageUrl: string; originalUrl: string }[] = [];

      for (const file of files) {
        const urls = await uploadAndTransformFiles(file, `answers/${user.uid}`);
        fileURLs.push(urls);
      }

      const isCurrentUserAdmin = await isAdminRole(user.uid);

      await addDoc(collection(db, 'questions', id!, 'answers'), {
        text: formatTextForDisplay(answerText),
        author: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Anonym',
        },
        createdAt: Timestamp.now(),
        attachments: fileURLs,
      });

      console.log('Odpověď odeslána.');
      setAnswerText('');
      setFieldErrors((prev) => ({ ...prev, answerText: '' })); // Resetování chyb
      setFieldValid((prev) => ({ ...prev, answerText: false }));
      setFiles([]);
      setUploadProgress(0);
      showNotification(<p>Odpověď byla úspěšně odeslána.</p>, 5);

      if (isCurrentUserAdmin) {
        await updateDoc(doc(db, 'questions', id!), { isAnswered: true });
        console.log(`Question ${id} marked as answered: true`);
      } else {
        console.log(`Question ${id} remains unanswered as the responder is not an admin.`);
      }
    } catch (error) {
      showNotification(<p>Odpověď se nepodařilo odeslat. Zkuste to prosím znovu.</p>, 10, 'warning');
      console.error('Chyba při odesílání odpovědi:', error);
      setError('Chyba při odesílání odpovědi: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const firstName = question.user?.displayName?.split(' ')[0] || 'Anonym';

  return (
    <div className={`${styles.container} ${user ? '' : styles.marginBottom}`}>
      <Helmet>
        <title>Detail dotazu - Poradna Haaro Naturo</title>
        <meta name="description" content={`Detail dotazu ${question.title}`} />
        <meta name="keywords" content="" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {isLoading && <LoadingSpinner />}

      {isAdmin && (
        <div className={styles.deleteConversationButton}>
          <Button type={'button'} onClick={deleteQuestion} variant="delete">Smazat celou konverzaci</Button>
        </div>
      )}

      <div className={styles.categoryList}>
        {selectedCategoryNames.length > 0 ? (
          <span className={styles.categorySpan}>{selectedCategoryNames.join(', ')}</span>
        ) : (
          <span>Zatím nejsou přiřazeny žádné kategorie</span>
        )}
      </div>

      {editingField === 'category' ? (
        <div className={`${styles.categorySection} ${archiveStyles.categoryContainer}`}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            {showCategoryDropdown ? 'Skrýt kategorie' : 'Zobrazit kategorie'}
            <span
              className={`${archiveStyles.arrowIcon} ${showCategoryDropdown ? archiveStyles.arrowUp : archiveStyles.arrowDown}`}></span>
          </Button>
          {showCategoryDropdown && (
            <div className={archiveStyles.categoryDropdown}>
              {allCategories.map((cat) => (
                <div key={cat.id}>
                  <input
                    type="checkbox"
                    id={`category-${cat.id}`}
                    value={cat.id}
                    checked={selectedCategoryIds.includes(cat.id)}
                    onChange={() => handleCategorySelect(cat.id)}
                  />
                  <label htmlFor={`category-${cat.id}`} className={archiveStyles.categoryLabel}>
                    {cat.name}
                  </label>
                </div>
              ))}
            </div>
          )}
          <div className={styles.actionButtonsContainer}>
            <Button type="button" onClick={cancelChanges} variant="secondary">
              Zrušit
            </Button>
            <Button type="submit" onClick={saveCategoryChanges} variant="primary">
              Uložit kategorie
            </Button>
          </div>
        </div>
      ) : (
        isAdmin && (
          <button
            className={styles.editIconBtn}
            onClick={() => {
              setEditingField('category');
              setShowCategoryDropdown(true);
            }}
          >
            <img src={editPen} alt="Edit category" />
          </button>
        )
      )}

      <div>
        {editingField === 'title' ? (
          <>
            <div className={`input-container ${fieldErrors.title ? 'error' : fieldValid.title ? 'valid' : ''}`}>
              <input
                type="text"
                value={tempQuestion?.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
              {fieldErrors.title && <p className="errorText">{fieldErrors.title}</p>}
            </div>
            <div className={styles.actionButtonsContainer}>
              <Button type={'button'} onClick={cancelChanges} variant="secondary">Zrušit</Button>
              <Button type={'submit'} onClick={saveChanges} variant="primary">Uložit název</Button>
            </div>
          </>
        ) : (
          <h1>{question.title}
            {isAdmin && (
              <button className={styles.editIconBtn}>
                <img src={editPen} alt="Edit title" onClick={() => setEditingField('title')} />
              </button>
            )}
          </h1>
        )}
      </div>

      <div className={`${styles.bubbleInfo} ${isAuthor ? styles.rightBubbleInfo : styles.leftBubbleInfo}`}>
        <p className={styles.author}>{firstName}</p>
        <p className={styles.date}>
          {question.createdAt && question.createdAt.seconds
            ? new Date(question.createdAt.seconds * 1000).toLocaleString('cs-CZ', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
            : 'Datum není k dispozici'}
        </p>
      </div>

      <div className={`${isAuthor || isAdmin ? styles.left : styles.right}`}>
        <div className={`${isAdmin ? styles.bubbleEditQuestion : ''}`}>
          {isAdmin && (
            <div
              className={`${isAdmin ? styles.bubbleEditQuestionInner : ''} ${isAuthor || isAdmin ? styles.left : styles.right}`}>
              {isAdmin && (
                <div className={styles.answerActions}>
                  {editingField === 'text' ? (
                    <div className={styles.actionButtonsContainer}>
                      <Button variant="secondary" type="button" onClick={cancelChanges}>Zrušit</Button>
                      <Button variant="primary" type="submit" onClick={saveChanges}>Uložit změny</Button>
                    </div>
                  ) : (
                    <button className={styles.editIconBtn} type="button" onClick={startEditingQuestionText}>
                      <img src={editPen} alt="Edit text" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <div
            className={`${styles.bubble} ${isAuthor ? styles.rightBubble : styles.leftBubble}
          ${editingField === 'text' ? styles.bubbleEditMode : ''}`}
          >
            {editingField === 'text' ? (
              <div
                className={`input-container ${fieldErrors.questionText ? 'error' : fieldValid.questionText ? 'valid' : ''}`}>
              <textarea
                value={tempQuestion?.questionText || ''}
                onChange={(e) => handleChange('questionText', e.target.value)}
                required
              />
                {fieldErrors.questionText && <p className="errorText">{fieldErrors.questionText}</p>}
              </div>
            ) : (
              <p className={styles.formattedText} dangerouslySetInnerHTML={{ __html: question.questionText }} />
            )}
          </div>
        </div>
      </div>


      {question.files && question.files.length > 0 && (
        <div className={styles.attachmentPreviews}>
          <div
            className={`${styles.previewContainer} ${isAuthor ? styles.rightPreviewContainer : styles.leftPreviewContainer}`}>
            {question?.files?.map((file: FileData, index: number) => (
              <img
                key={index}
                src={file.thumbnailUrl || file.originalUrl}
                alt={`Příloha ${index + 1}`}
                className={styles.previewImage}
                onClick={() => handleFileClick(question.files!, index)}
              />
            ))}
          </div>
        </div>
      )}

      {isLightboxOpen && (
        <div className={styles.lightBoxContainer}>
          <Lightbox
            slides={currentAttachments.map((url) => ({ src: url }))}
            open={isLightboxOpen}
            close={() => setIsLightboxOpen(false)}
            index={lightboxIndex}
            styles={{
              container: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(5px)',
                color: '#F5F5F5FF !important',
              },
            }}
            render={{
              buttonPrev: () => (
                <button className={`${styles.customArrow} ${styles.customArrowLeft}`} onClick={() => setLightboxIndex(lightboxIndex - 1)}>
                    <img src={arrow}  alt='Šipka doleva'/>
                </button>
              ),
              buttonNext: () => (
                <button className={`${styles.customArrow} ${styles.customArrowRight}`} onClick={() => setLightboxIndex(lightboxIndex + 1)}>
                  <img src={arrow} alt="Šipka doprava" />
                </button>
              ),
              buttonClose: () => <CustomCloseIcon onClick={() => setIsLightboxOpen(false)} />,
            }}
          />
        </div>
      )}

      <AnswerList questionId={id!} />

      {user !== null ? (
        <div className={styles.answerContainer}>
          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div>
            <form onSubmit={handleSubmit}>
              <div
                className={`input-container ${fieldErrors.answerText ? 'error' : fieldValid.answerText ? 'valid' : ''}`}>
                  <textarea
                    value={answerText}
                    onChange={(e) => handleChange('answerText', e.target.value)}
                    required
                    placeholder="Zadejte text vaší zprávy..."
                  />
              </div>
              {fieldErrors.answerText &&
                <p className={`errorText ${styles.errorTextAnswer}`}>{fieldErrors.answerText}</p>}
              <AttachmentInput files={files} onFilesSelected={setFiles} />
              {uploadProgress > 0 && <p>Nahrávání: {uploadProgress}%</p>}
              <div className={styles.buttonContainer}>
                <Button variant="primary" type="submit" disabled={isLoading || !fieldValid.answerText}>
                  Odeslat odpověď
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className={styles.loginInfo}>
          <p>Pokud jste autorem dotazu a chcete pokračovat v konverzaci, tak se prosím <Link
            to={'/prihlaseni'}>přihlaste</Link>.</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalContent}
      </Modal>
    </div>
  );
};

export default QuestionDetailPage;
