import React from 'react';
import styles from './modal.module.css';
import CustomCloseIconBlack from '../../components/icons/close-icon-black';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalCloseButton} onClick={onClose}>
          <CustomCloseIconBlack></CustomCloseIconBlack>
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
