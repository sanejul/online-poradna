import React, { useEffect, useState } from 'react';
import CustomCloseIconGreen from '../components/icons/close-icon-green';
import styles from './notification.module.css';
import CustomCloseIconRed from '../components/icons/close-icon-red';

interface NotificationProps {
  children: React.ReactNode;
  timeout: number;
  type?: 'success' | 'warning';
  onClose?: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  children,
  timeout,
  type = 'success',
  onClose,
}) => {
  const [remainingTime, setRemainingTime] = useState(timeout * 1000);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (remainingTime <= 0) {
      handleClose();
      return;
    }

    const timerInterval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1000) {
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(timerInterval);
  }, [remainingTime]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  const notificationClass =
    type === 'warning'
      ? `${styles.notificationContainer} ${styles.warning}`
      : styles.notificationContainer;

  return (
    <div className={notificationClass}>
      <div className={styles.header}>
        <div className={styles.content}>{children}</div>
        <button onClick={handleClose} className={styles.closeButton}>
          {type === 'warning' ? (
            <CustomCloseIconRed />
          ) : (
            <CustomCloseIconGreen />
          )}
        </button>
      </div>
      <div
        className={styles.timerBar}
        style={{ width: `${(remainingTime / (timeout * 1000)) * 100}%` }}
      />
    </div>
  );
};

export default Notification;
