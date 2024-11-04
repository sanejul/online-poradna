// src/context/NotificationContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import Notification from '../components/notification';

interface NotificationContextType {
  showNotification: (message: ReactNode, timeout?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notificationContent, setNotificationContent] = useState<ReactNode | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  /* eslint-disable @typescript-eslint/no-inferrable-types */
  const [timeout, setTimeoutDuration] = useState(5);
  /* eslint-enable @typescript-eslint/no-inferrable-types */


  const showNotification = (message: ReactNode, timeoutDuration: number = 5) => {
    setNotificationContent(message);
    setIsVisible(true);
    setTimeoutDuration(timeoutDuration);
  };

  const handleClose = () => {
    setIsVisible(false);
    setNotificationContent(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {isVisible && (
        <Notification timeout={timeout} onClose={handleClose}>
          {notificationContent}
        </Notification>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('Pro zobrazování notifikací je nutné použítí provideru.');
  }
  return context;
};
