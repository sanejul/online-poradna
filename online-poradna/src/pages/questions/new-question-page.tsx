import React, { useState } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/buttons/button';
import styles from './new-question-page.module.css';
import AttachmentInput from '../../components/attachment-input';
import LoadingSpinner from '../../components/loading-spinner';
import {
  validateQuestionText,
  validateQuestionTitle,
} from '../../helpers/validation-helper';
import { useNotification } from '../../contexts/notification-context';
import { uploadAndTransformFiles } from '../../utils/file-utils';
import { formatTextForDisplay } from '../../utils/text-utils';
import { useWindowSize } from '../../hooks/use-window-size';
import { Helmet } from 'react-helmet';
import ReCAPTCHA from 'react-google-recaptcha';

const NewQuestionPage = () => {
  const [title, setTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [category, setCategory] = useState(['']);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({
    title: '',
    questionText: '',
  });
  const [fieldValid, setFieldValid] = useState({
    title: false,
    questionText: false,
  });
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isMobile } = useWindowSize();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const user = auth.currentUser;

  const handleCaptchaChange = (token: string | null) => {
    const isVerified = !!token;
    setCaptchaVerified(isVerified);

    if (
      isVerified &&
      error === 'Pro odeslání dotazu prosím potvrďte, že nejste robot.'
    ) {
      setError(null);
    }
  };

  const handleChange = (field: string, value: string) => {
    let fieldError = '';
    let isValid = false;

    switch (field) {
      case 'title':
        fieldError = validateQuestionTitle(value);
        isValid = !fieldError;
        setTitle(value);
        break;
      case 'questionText':
        fieldError = validateQuestionText(value);
        isValid = !fieldError;
        setQuestionText(value);
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
        setError("Pro položení dotazu musíte být přihlášeni.");
        setIsLoading(false);
        return;
      }

      if (!captchaVerified) {
        setError('Pro odeslání dotazu prosím potvrďte, že nejste robot.');
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
        const fileData = await uploadAndTransformFiles(
          file,
          `questions/${questionId}`,
        );
        fileDataArray.push(fileData);
      }

      await updateDoc(docRef, { files: fileDataArray });

      showNotification(<p>Váš dotaz byl úspěšně odeslán.</p>, 5);
      navigate(`/dotazy/${questionId}`);
    } catch (error) {
      showNotification(
        <p>Dotaz se nepodařilo odeslat. Zkuste to prosím znovu.</p>,
        10,
        'warning',
      );
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
      <h1 id="form-title">Položit nový dotaz</h1>

      <div id="form-instructions">
        {!user ? (
          <p className={styles.infoText}>
            Pro položení dotazu se prosím <Link to="/prihlaseni">přihlaste</Link>.
          </p>
        ) : (
          <div className={styles.infoTextContainer}>
            <p className={styles.infoText}>
              U dotazu bude zveřejněno vaše křestní jméno, které jste uvedli při
              registraci. Změnit ho můžete{' '}
              <Link to="/profil">ve svém profilu</Link>, pokud zde chcete používat
              např. přezdívku.
            </p>
            <p className={styles.infoText}>
              Jakmile odpovíme, přijde vám upozornění{isMobile && <br />} na
              e-mail.
            </p>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="loadingContainer">
          <LoadingSpinner />
          <div className="loadingText">
            <p>
              Probíhá odesílání dotazu. Pokud k dotazu byly přiloženy fotografie
              jejich zpracování může chvilku trvat.
            </p>
            <p>Děkujeme, že čekáte.</p>
          </div>
        </div>
      )}

      <form className={styles.formContainer}
            onSubmit={handleSubmit}
            aria-labelledby="form-title"
            aria-describedby="form-instructions"
      >
        <div>
          <div className="captcha">
            <ReCAPTCHA
              sitekey="6LfcuT4jAAAAADrHwrSTR5_S19LYAUk-TMnZdF48"
              onChange={handleCaptchaChange}
              data-size="compact"
              data-theme="light"
            />
          </div>
          <div
            className={`input-container ${fieldErrors.title ? 'error' : fieldValid.title ? 'valid' : ''}`}
          >
            <label htmlFor="question-title">Název dotazu *</label>
            <input
              id="question-title"
              type="text"
              placeholder="Čeho se týká Váš problém?"
              value={title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              aria-invalid={!!fieldErrors.title}
              aria-describedby={fieldErrors.title ? 'title-error' : undefined}
            />
            {fieldErrors.title && (
              <p className="errorText" id="title-error">{fieldErrors.title}</p>
            )}
          </div>

          <div
            className={`input-container ${fieldErrors.questionText ? 'error' : fieldValid.questionText ? 'valid' : ''}`}
          >
            <label htmlFor="question-text">Text dotazu *</label>
            <textarea
              id="question-text"
              className={styles.textarea}
              placeholder="Sem prosím napište dotaz"
              value={questionText}
              onChange={(e) => handleChange('questionText', e.target.value)}
              required
              aria-invalid={!!fieldErrors.questionText}
              aria-describedby={fieldErrors.questionText ? 'text-error' : undefined}
            />
            {fieldErrors.questionText && (
              <p className="errorText" id="text-error">{fieldErrors.questionText}</p>
            )}
          </div>

          <p className={'textLeft'}>* povinné údaje</p>
        </div>
        <AttachmentInput files={files} onFilesSelected={setFiles} />
        {uploadProgress > 0 && <p>Nahrávání: {uploadProgress}%</p>}
        <div className={styles.buttonContainer}>
          {error && <p className="errorText" role="alert" aria-live="assertive">{error}</p>}
          <Button
            variant="primary"
            type="submit"
            isDisabled={
              isLoading ||
              !Object.values(fieldValid).every((valid) => valid)
            }
          >
            Odeslat dotaz
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewQuestionPage;
