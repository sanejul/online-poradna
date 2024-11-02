// QuestionDetailPage.tsx

import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth, storage } from '../../firebase';
import { doc, getDoc, getDocs, collection, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import AnswerList from './answer-list';
import styles from './question-detail-page.module.css';
import archiveStyles from './archive-page.module.css';
import LoadingSpinner from '../../components/loading-spinner';
import CustomCloseIcon from '../../components/icons/close-icon';
import Button from '../../components/buttons/button';
import Modal from '../../components/modal/modal';
import AttachmentInput from '../../components/attachment-input';
import editPen from '../../assets/icons/edit-pen.png';
import { ArchiveContext } from './archive-context';

interface Category {
  id: string;
  name: string;
}

const QuestionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<any>(null);
  const [editingField, setEditingField] = useState<null | 'title' | 'category' | 'text' | 'newCategory'>(null);
  const [tempQuestion, setTempQuestion] = useState<any>(null);
  const [answerText, setAnswerText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const user = auth.currentUser;

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

/*  const archiveContext = useContext(ArchiveContext);
  const categories = archiveContext?.categories || [];*/

  useEffect(() => {
    // Check if user is admin
    const checkAdminRole = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
          setIsAdmin(true);
        }
      }
    };

    checkAdminRole();
  }, [user]);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!id) return;
      const docRef = doc(db, 'questions', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const questionData = docSnap.data();
        setQuestion(questionData);
        // Initialize tempQuestion with the fetched question data
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
        questionText: question.questionText,
      });
    }
  }, [question]);

  const saveCategoryChanges = async () => {
    if (!id) return;
    try {
      await updateDoc(doc(db, 'questions', id), {
        category: selectedCategoryIds,
      });
      setQuestion({ ...question, category: selectedCategoryIds });
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
        : [...prevSelected, categoryId]
    );
  };


  const cancelChanges = () => {
    setSelectedCategoryIds(question.category || []);
    setEditingField(null);
    setShowCategoryDropdown(false);
  };

  const selectedCategoryNames = selectedCategoryIds
    .map(id => allCategories.find(category => category.id === id)?.name)
    .filter(Boolean) as string[];

  const deleteQuestion = () => {
    setModalContent(
      <>
        <p>Opravdu chcete odstranit konverzaci?</p>
        <div className={styles.modalActions}>
          <Button type={'button'} variant="secondary" onClick={() => setIsModalOpen(false)}>Ne</Button>
          <Button type={'button'} variant="delete" onClick={async () => {
            await deleteDoc(doc(db, 'questions', id!));
            setIsModalOpen(false);
            navigate('/archivePage');
          }}>Ano</Button>
        </div>
      </>,
    );
    setIsModalOpen(true);
  };

  const handleFileClick = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const handleEditField = (field: 'title' | 'text') => {
    if (question) {
      setTempQuestion({
        ...question,
        title: question.title,
        questionText: question.questionText,
      });
    }
    setEditingField(field);
  };


  const saveChanges = async () => {
    if (!id || !tempQuestion) return; // Ensure tempQuestion is not null

    try {
      await updateDoc(doc(db, 'questions', id), {
        title: tempQuestion.title,
        questionText: tempQuestion.questionText,
      });

      setQuestion(tempQuestion); // Reflect changes in the main question state
      setEditingField(null);
    } catch (error) {
      console.error('Error while saving:', error);
    }
  };


  if (!question) return <LoadingSpinner />;

  const isAuthor = question.user?.uid === user?.uid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      setError('Musíte být přihlášeni, abyste mohli odpovědět.');
      return;
    }

    try {
      const fileURLs: string[] = [];
      for (const file of files) {
        const fileRef = ref(storage, `answers/${user?.uid}/${file.name}`);
        const uploadTask = uploadBytesResumable(fileRef, file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => reject(error),
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              fileURLs.push(downloadURL);
              resolve();
            },
          );
        });
      }

      const formattedAnswerText = answerText.replace(/\n/g, '<br />');

      await addDoc(collection(db, 'questions', id!, 'answers'), {
        text: formattedAnswerText,
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
      setFiles([]);
      setUploadProgress(0);
    } catch (error) {
      console.error('Chyba při odesílání odpovědi:', error);
      setError('Chyba při odesílání odpovědi: ' + (error as Error).message);
    }
  };

  const handleFileChange = (files: File[]) => {
    setFiles(files);
  };

  const firstName = question.user?.displayName?.split(' ')[0] || 'Anonym';

  return (
    <div className={`${styles.container} ${isAuthorized ? '' : styles.marginBottom}`}>

      {isAdmin && (
        <div className={styles.deleteConversationButton}>
          <Button type={'button'} onClick={deleteQuestion} variant="delete">Smazat celou konverzaci</Button>
        </div>
      )}

      <h1>
        {editingField === 'title' ? (
          <>
            <input
              type="text"
              value={tempQuestion?.title || ''}
              onChange={(e) => setTempQuestion({ ...tempQuestion, title: e.target.value })}
            />
            <div className={styles.actionButtonsContainer}>
              <Button type={'submit'} onClick={saveChanges} variant="primary">Uložit název</Button>
              <Button type={'button'} onClick={cancelChanges} variant="secondary">Zrušit</Button>
            </div>
          </>
        ) : (
          <>
            {question.title}
            {isAdmin && (
              <button className={styles.editIconBtn}>
              <img src={editPen} alt="Edit title" onClick={() => setEditingField('title')} />
              </button>
            )}
          </>
        )}
      </h1>

      <div className={styles.categoryList}>
        {selectedCategoryNames.length > 0 ? (
          selectedCategoryNames.map((name, index) => (
            <span key={index} className={styles.categorySpan}>{name}</span>
          ))
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
            <span className={`${archiveStyles.arrowIcon} ${showCategoryDropdown ? archiveStyles.arrowUp : archiveStyles.arrowDown}`}></span>
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
            <Button type="button" onClick={saveCategoryChanges} variant="primary">
              Uložit
            </Button>
            <Button type="button" onClick={cancelChanges} variant="secondary">
              Zrušit
            </Button>
          </div>
        </div>
      ) : (
        <button
          className={styles.editIconBtn}
          onClick={() => {
            setEditingField('category');
            setShowCategoryDropdown(true);
          }}
        >
          <img src={editPen} alt="Edit category" />
        </button>
      )}

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

      <div className={`${isAdmin ? styles.bubbleEditQuestion : ''} ${isAuthor ? styles.left : styles.right}`}>
        {isAdmin && (
          <div className={`${isAdmin ? styles.bubbleEditQuestion : ''} ${isAuthor ? styles.left : styles.right}`}>
            {isAdmin && (
              <div className={styles.answerActions}>
                {editingField === 'text' ? (
                  <div className={styles.actionButtonsContainer}>
                    <Button variant="primary" type="submit" onClick={saveChanges}>Uložit změny</Button>
                    <Button variant="secondary" type="button" onClick={cancelChanges}>Zrušit</Button>
                  </div>
                ) : (
                  <button className={styles.editIconBtn} type="button" onClick={() => setEditingField('text')}>
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
            <textarea
              value={tempQuestion?.questionText || ''}
              onChange={(e) => setTempQuestion({ ...tempQuestion, questionText: e.target.value })}
            />
          ) : (
            <p className={styles.formattedText} dangerouslySetInnerHTML={{ __html: question.questionText }} />
          )}
        </div>
      </div>


      {question.files && question.files.length > 0 && (
        <div className={styles.attachmentPreviews}>
          <div
            className={`${styles.previewContainer} ${isAuthor ? styles.leftPreviewContainer : styles.rightPreviewContainer}`}>
            {question.files.map((file: string, index: number) => (
              <img
                key={index}
                src={file}
                alt={`Příloha ${index + 1}`}
                className={styles.previewImage}
                onClick={() => handleFileClick(index)}
              />
            ))}
          </div>
        </div>
      )}

      {isLightboxOpen && (
        <Lightbox
          slides={question.files.map((file: string) => ({ src: file }))}
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

      <AnswerList questionId={id!} />

      {user !== undefined && (
        <div className={styles.answerContainer}>
          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div>
            <form onSubmit={handleSubmit}>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              required
              placeholder="Zadejte odpověď..."
            />
              <AttachmentInput files={files} onFilesSelected={setFiles} />
              {uploadProgress > 0 && <p>Nahrávání: {uploadProgress}%</p>}
              <div className={styles.buttonContainer}>
                <Button variant="primary" type="submit" disabled={isLoading}>
                  Odeslat odpověď
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalContent}
      </Modal>
    </div>
  );
};

export default QuestionDetailPage;
