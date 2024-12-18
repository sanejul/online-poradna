import React from 'react';
import styles from './loading-spinner.module.css';

const LoadingSpinner = () => {
  return (
    <div className={styles.spinnerContainer} role={'status'}>
      <div className={styles.spinner}></div>
    </div>
  );
};
export default LoadingSpinner;
