import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNotification } from '../contexts/notification-context';

export const handleLogout = async (showNotification: any) => {
  try {
    await signOut(auth);
    showNotification(<p>Uživatel odhlášen.</p>, 5);
  } catch (error) {
    console.log("Chyba při odhlašování", error);
  }
};

export const Logout = () => {
  const { showNotification } = useNotification();

  return (
    <button onClick={() => handleLogout(showNotification)}>
      Odhlásit se
    </button>
  );
};

export default Logout;
