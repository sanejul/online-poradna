import React, { useEffect, useState } from 'react';
import { db, storage } from '../../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import Button from '../../components/buttons/button';
import styles from './new-question-page.module.css';
import AttachmentInput from '../../components/attachment-input';
import LoadingSpinner from '../../components/loading-spinner';

const NewQuestionPage = () => {
  const [title, setTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [category, setCategory] = useState(['']);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Stav pro spinner
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Zapnout spinner

    const user = auth.currentUser;
    if (!user) {
      setError('Musíte být přihlášeni.');
      setIsLoading(false);
      return;
    }

    try {
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
      navigate(`/questions/${docRef.id}`);
    } catch (error) {
      setError('Chyba při odesílání dotazu: ' + (error as Error).message);
    } finally {
      setIsLoading(false); // Vypnout spinner
    }
  };

  return (
    <div className={styles.container}>
      <h1>Položit nový dotaz</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {isLoading && <LoadingSpinner />}
      <form className={styles.formContainer} onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Čeho se týká Váš problém?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className={styles.textarea}
            placeholder="Sem prosím napište dotaz"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
          />
        </div>
        <AttachmentInput files={files} onFilesSelected={setFiles} />
        {uploadProgress > 0 && <p>Nahrávání: {uploadProgress}%</p>}
        <div className={styles.buttonContainer}>
          <Button variant="primary" type="submit" disabled={isLoading}>
            Odeslat dotaz
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewQuestionPage;
