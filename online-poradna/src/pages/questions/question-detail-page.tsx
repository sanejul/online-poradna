import React, { useEffect, useRef, useState } from 'react';
import { useParams } from "react-router-dom";
import { db, auth, storage } from '../../firebase';
import { doc, getDoc, collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import AnswerList from "./answer-list";
import styles from "./question-detail-page.module.css";
import LoadingSpinner from '../../components/loading-spinner';
import CustomCloseIcon from '../../components/icons/close-icon';
import CustomPrevIcon from '../../components/icons/prev-icon';
import CustomNextIcon from '../../components/icons/next-icon';
import AttachmentInput from '../../components/attachment-input';
import Button from '../../components/buttons/button';

const QuestionDetailPage = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState<any>(null);
  const [answerText, setAnswerText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const user = auth.currentUser;
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchQuestion = async () => {
      const docRef = doc(db, "questions", id!);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const questionData = docSnap.data();
        setQuestion(questionData);

        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.data();
          setIsAuthorized(
            userData?.role === "admin" || questionData?.user?.uid === user.uid
          );
        }
      } else {
        console.error("Dotaz nenalezen.");
      }
    };
    fetchQuestion();
  }, [id, user]);

  const handleFileClick = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  if (!question) return <LoadingSpinner />;

  const isAuthor = question.user?.uid === user?.uid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      setError("Musíte být přihlášeni, abyste mohli odpovědět.");
      return;
    }

    try {
      const fileURLs: string[] = [];
      for (const file of files) {
        const fileRef = ref(storage, `answers/${user?.uid}/${file.name}`);
        const uploadTask = uploadBytesResumable(fileRef, file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => reject(error),
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              fileURLs.push(downloadURL);
              resolve();
            }
          );
        });
      }

      const formattedAnswerText = answerText.replace(/\n/g, '<br />');

      await addDoc(collection(db, "questions", id!, "answers"), {
        text: formattedAnswerText,
        author: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "Anonym",
        },
        createdAt: Timestamp.now(),
        attachments: fileURLs,
      });

      console.log("Odpověď odeslána.");
      setAnswerText("");
      setFiles([]);
      setUploadProgress(0);
    } catch (error) {
      console.error("Chyba při odesílání odpovědi:", error);
      setError("Chyba při odesílání odpovědi: " + (error as Error).message);
    }
  };

  const handleFileChange = (files: File[]) => {
    setFiles(files);
  };


  const firstName = question.user?.displayName?.split(" ")[0] || "Anonym";

  return (
    <div className={`${styles.container} ${isAuthorized ? '' : styles.marginBottom}`}>
      <h1>{question.title}</h1>
      <p className={styles.category}>{question.category}</p>

      <div className={`${styles.bubbleInfo} ${isAuthor ? styles.rightBubbleInfo : styles.leftBubbleInfo}`}>
        <p className={styles.author}>{question.user?.displayName.split(" ")[0] || 'Anonym'}</p>
        <p className={styles.date}>
          {new Date(question.createdAt.seconds * 1000).toLocaleString('cs-CZ', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      <div className={`${styles.bubble} ${isAuthor ? styles.rightBubble : styles.leftBubble}`}>
        <p
          className={styles.formattedText}
          dangerouslySetInnerHTML={{ __html: question.questionText }}
        />
      </div>

      {question.files && question.files.length > 0 && (
        <div className={styles.attachmentPreviews}>
          <div className={`${styles.previewContainer} ${isAuthor ? styles.leftPreviewContainer : styles.rightPreviewContainer}`}>
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
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(5px)", // Blur effect on background
            },
          }}
          render={{
            buttonClose: () => <CustomCloseIcon onClick={() => setIsLightboxOpen(false)} />,
            /*            buttonPrev: () => <CustomPrevIcon onClick={() => setLightboxIndex(lightboxIndex - 1)} />,
                        buttonNext: () => <CustomNextIcon onClick={() => setLightboxIndex(lightboxIndex + 1)} />,*/
          }}
        />
      )}

      <AnswerList questionId={id!} isAuthor={isAuthor} />

      {isAuthorized && (
        <div className={styles.answerContainer}>
          {error && <p style={{ color: "red" }}>{error}</p>}
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
      )}
    </div>
  );
};
export default QuestionDetailPage;
