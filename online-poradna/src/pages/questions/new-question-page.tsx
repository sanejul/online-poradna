import React, { useState } from 'react';
import { db, storage, auth } from '../../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/buttons/button';
import styles from './new-question-page.module.css';
import AttachmentInput from '../../components/attachment-input';
import LoadingSpinner from '../../components/loading-spinner';
import { validateQuestionText, validateQuestionTitle } from '../../helpers/validation-helper';
import { useNotification } from '../../contexts/notification-context';

const NewQuestionPage = () => {
  const [title, setTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [category, setCategory] = useState(['']);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({ title: '', questionText: '' });
  const [fieldValid, setFieldValid] = useState({ title: false, questionText: false });
  const [isLoading, setIsLoading] = useState(false); // Stav pro spinner
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const user = auth.currentUser;

  const handleBlur = (field: string, value: string) => {
    let fieldError = '';
    let isValid = false;

    switch (field) {
      case 'title':
        fieldError = validateQuestionTitle(value);
        isValid = !fieldError;
        break;
      case 'questionText':
        fieldError = validateQuestionText(value);
        isValid = !fieldError;
        break;
      default:
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [field]: fieldError }));
    setFieldValid((prev) => ({ ...prev, [field]: isValid }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (Object.values(fieldErrors).some(err => err) || !Object.values(fieldValid).every(valid => valid)) {
      setError('Zkontrolujte prosím chyby ve formuláři.');
      setIsLoading(false);
      return;
    }

    try {
      if (!user) {
        setError('Pro položení dotazu musíte být přihlášení.');
        setIsLoading(false);
        return;
      }

      const fileURLs: string[] = [];
      for (const file of files) {
        const fileRef = ref(storage, `questions/${user.uid}/${file.name}`);
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

      const formattedQuestionText = questionText.replace(/\n/g, '<br />');

      const newQuestion = {
        title,
        questionText: formattedQuestionText,
        category,
        createdAt: Timestamp.now(),
        files: fileURLs,
        isAnswered: false,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Anonym',
        },
      };

      const docRef = await addDoc(collection(db, 'questions'), newQuestion);
      showNotification(<p>Váš dotaz byl úspěšně odeslán.</p>, 5);
      navigate(`/questions/${docRef.id}`);
    } catch (error) {
      setError('Chyba při odesílání dotazu: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Položit nový dotaz</h1>

      {!user && (
        <p className={styles.infoText}>Pro položení dotazu se prosím přihlaste.</p>
      )}

      {isLoading && <LoadingSpinner />}

      <form className={styles.formContainer} onSubmit={handleSubmit}>
        <div>
          <div className={`input-container ${fieldErrors.title ? 'error' : fieldValid.title ? 'valid' : ''}`}>
            <label>Název dotazu *</label>
            <input
              type="text"
              placeholder="Čeho se týká Váš problém?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleBlur('title', title)}
              required
            />
            {fieldErrors.title && <p className="errorText">{fieldErrors.title}</p>}
          </div>

          <div
            className={`input-container ${fieldErrors.questionText ? 'error' : fieldValid.questionText ? 'valid' : ''}`}>
            <label>Text dotazu *</label>
            <textarea
              className={styles.textarea}
              placeholder="Sem prosím napište dotaz"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              onBlur={() => handleBlur('questionText', questionText)}
              required
            />
            {fieldErrors.questionText && <p className="errorText">{fieldErrors.questionText}</p>}
          </div>

          <p className={'textLeft'}>* povinné údaje</p>
        </div>
        <AttachmentInput files={files} onFilesSelected={setFiles} />
        {uploadProgress > 0 && <p>Nahrávání: {uploadProgress}%</p>}
        <div className={styles.buttonContainer}>
          <Button variant="primary" type="submit" disabled={!user || isLoading || !Object.values(fieldValid).every(valid => valid)}>
            Odeslat dotaz
          </Button>
        </div>
        {error && <p className="errorText">{error}</p>}
      </form>
    </div>
  );
};

export default NewQuestionPage;
