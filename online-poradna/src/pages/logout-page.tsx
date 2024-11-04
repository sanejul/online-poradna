import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNotification } from '../contexts/notification-context';

const Logout = () => {
  const { showNotification } = useNotification();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showNotification(<p>Uživatel odhlášen.</p>, 8);
    } catch (error) {
      console.log("Chyba při odhlašování", error);
    }
  };

  return (
    <button onClick={handleLogout}>
      Odhlásit se
    </button>
  );
};

export default Logout;
