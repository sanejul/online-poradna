import React, { useState } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/buttons/button';
import styles from './new-question-page.module.css';
import AttachmentInput from '../../components/attachment-input';
import LoadingSpinner from '../../components/loading-spinner';
import { validateQuestionText, validateQuestionTitle } from '../../helpers/validation-helper';
import { useNotification } from '../../contexts/notification-context';
import { uploadAndTransformFiles } from '../../utils/file-utils';
import { formatTextForDisplay } from '../../utils/text-utils';
import { useWindowSize } from '../../hooks/use-window-size';
import {Helmet} from "react-helmet";

const NewQuestionPage = () => {
  const [title, setTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [category, setCategory] = useState(['']);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({ title: '', questionText: '' });
  const [fieldValid, setFieldValid] = useState({ title: false, questionText: false });
  const [isLoading, setIsLoading] = useState(false);
  const { isMobile } = useWindowSize();
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

    try {
      if (!user) {
        setError('Pro položení dotazu musíte být přihlášeni.');
        setIsLoading(false);
        return;
      }

      const newQuestion = {
        title,
        questionText: formatTextForDisplay(questionText),
        category,
        createdAt: Timestamp.now(),
        files: [],
        isAnswered: false,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Anonym',
        },
      };

      const docRef = await addDoc(collection(db, 'questions'), newQuestion);
      const questionId = docRef.id;

      const fileDataArray = [];
      for (const file of files) {
        const fileData = await uploadAndTransformFiles(file, `questions/${questionId}`);
        fileDataArray.push(fileData);
      }

      await updateDoc(docRef, { files: fileDataArray });

      showNotification(<p>Váš dotaz byl úspěšně odeslán.</p>, 5);
      navigate(`/dotazy/${questionId}`);
    } catch (error) {
      showNotification(<p>Dotaz se nepodařilo odeslat. Zkuste to prosím znovu.</p>, 10, 'warning');
      setError('Chyba při odesílání dotazu: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>Nový dotaz - Poradna Haaro Naturo</title>
        <meta name="description" content="Položte nový dotaz." />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <h1>Položit nový dotaz</h1>

      {!user ? (
        <p className={styles.infoText}>Pro položení dotazu se prosím <Link to="/prihlaseni">přihlaste</Link>.</p>
      ) : (
        <div className={styles.infoTextContainer}>
          <p className={styles.infoText}>U dotazu bude zveřejněno vaše křestní jméno, které jste uvedli při registraci.
            Změnit ho můžete <Link to="/profil">ve svém
              profilu</Link>, pokud zde chcete používat např. přezdívku.</p>
          <p className={styles.infoText}>Jakmile odpovíme, přijde vám upozornění{isMobile && (<br />)} na e-mail.</p>
        </div>
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
          <Button variant="primary" type="submit"
                  disabled={!user || isLoading || !Object.values(fieldValid).every(valid => valid)}>
            Odeslat dotaz
          </Button>
        </div>
        {error && <p className="errorText">{error}</p>}
      </form>
    </div>
  );
};

export default NewQuestionPage;
