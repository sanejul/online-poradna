import React from "react";
import styles from "./button.module.css";

interface ButtonProps {
  type: "button" | "submit" | "reset";
  variant: "primary" | "secondary" | "edit" | "delete";
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ type, variant, onClick, children, disabled }) => {
  const buttonClass = `${styles.button} ${
    variant === "primary" ? styles.primary :
      variant === "secondary" ? styles.secondary :
        variant === "edit" ? styles.edit :
          styles.delete
  }`;

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
