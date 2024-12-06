import React from 'react';
import styles from './button.module.css';

interface ButtonProps {
  type: 'button' | 'submit' | 'reset';
  variant: 'primary' | 'secondary' | 'edit' | 'delete';
  onClick?: () => void;
  children: React.ReactNode;
  isDisabled?: boolean;
  class?: string;
  tabIndex?: number;
}

const Button: React.FC<ButtonProps> = ({
                                         type,
                                         variant,
                                         onClick,
                                         children,
                                         isDisabled,
                                         class: string,
                                         tabIndex,
                                       }) => {

  const disabled = Boolean(isDisabled);

  const buttonClass = `${styles.button} ${
    variant === 'primary'
      ? styles.primary
      : variant === 'secondary'
        ? styles.secondary
        : variant === 'edit'
          ? styles.edit
          : styles.delete
  } ${disabled ? styles.disabled : ''}`;

  return (
    <button
      type={type}
      className={buttonClass}
      aria-disabled={disabled}
      tabIndex={disabled ? 0 : tabIndex ?? 0}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
        } else {
          onClick?.();
        }
      }}
    >
      {children}
    </button>
  );
};

export default Button;
