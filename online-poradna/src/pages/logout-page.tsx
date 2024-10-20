import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const Logout = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Úspěšné odhlášení");
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
