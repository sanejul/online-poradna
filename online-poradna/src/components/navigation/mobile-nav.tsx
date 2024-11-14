import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import styles from './mobile-nav.module.css';
import logo2 from '../../assets/haaro_logo_light.png';
import { useNotification } from '../../contexts/notification-context';
import { handleLogout } from '../../pages/logout-page';
import { useAuthLogic } from '../../hooks/use-auth';
import logo from '../../assets/haaro_logo_black.png';
import { useWindowSize } from '../../hooks/use-window-size';


const MobileNav: React.FC = () => {
  /*  const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);*/
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  const { isAuthenticated, isAdmin, handleUserLogout } = useAuthLogic();
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useWindowSize();

  // odhlášení uživatele
  const from = (location.state as { from: string })?.from || '/';

  const closeOverlay = (): void => {
    const overlay = document.querySelector(`.${styles.overlay}`) as HTMLElement;
    const contain = document.querySelector(`.${styles.contain}`) as HTMLElement;

    if (overlay && contain && overlay.classList.contains(styles.open)) {
      overlay.classList.remove(styles.open);
      contain.classList.remove(styles.change);
    }
  };

  const toggleClasses = () => {
    const overlay = document.querySelector(`.${styles.overlay}`);
    const contain = document.querySelector(`.${styles.contain}`);

    if (overlay && contain) {
      overlay.classList.toggle(styles.open);
      contain.classList.toggle(styles.change);
    }
  };

  useEffect(() => {
    const toggleButton = document.querySelector(`.${styles.contain}`);
    if (toggleButton) {
      toggleButton.addEventListener('click', toggleClasses);
    }

    // Zajištění zavření overlay při kliknutí na všechny odkazy i tlačítka
    const navLinks = document.querySelectorAll(`.${styles.navLink}, button.${styles.navLink}`);
    navLinks.forEach((link) => {
      link.addEventListener('click', closeOverlay);
    });

    return () => {
      const navLinks = document.querySelectorAll(`.${styles.navLink}, button.${styles.navLink}`);
      navLinks.forEach((link) => {
        link.removeEventListener('click', closeOverlay);
      });
    };
  }, []);

  return (
    <header className={styles.container}>
      <p>HAARO-PORADNA</p>
      {((isAdmin && !isMobile) || !isMobile) && (
        <Link to="/" className={styles.logo}>
          <img id={styles.logo} src={logo} alt="Haaro Naturo logo" />
        </Link>
      )}
      <div>
        <nav id={styles.mobileNavbar} className={styles.mobileNavbar}>
          <div className={styles.navbarButtons}>
            <button className={styles.contain}>
              <span className={styles.bar1}></span>
              <span className={styles.bar2}></span>
              <span className={styles.bar3}></span>
            </button>
          </div>
        </nav>

        <nav className={styles.overlay}>
          <div className={styles.overlayMenu}>
            <ul>
                <li>
                  <Link to="/" className={styles.logo2}>
                    <img id={styles.logo2} src={logo2} alt="Haaro Naturo logo" />
                  </Link>
                </li>
              <li>
                <Link to="/" data-link="o poradně" className={styles.navLink}>
                  <span>o poradně</span>
                </Link>
              </li>
              <li>
                <Link to="/newQuestionPage" data-link="nový dotaz" className={styles.navLink}>
                  <span>nový dotaz</span>
                </Link>
              </li>
              <li>
                <Link to="/archivePage" data-link="prohlédnout dotazy" className={styles.navLink}>
                  <span>prohlédnout dotazy</span>
                </Link>
              </li>
              {isAuthenticated && (
                <li>
                  <Link to="/profilePage" data-link="můj profil" className={styles.navLink}
                        onClick={closeOverlay}>
                    <span>můj profil</span>
                  </Link>
                </li>
              )}
              {isAdmin && (
                <>
                  <li>
                    <Link to="/usersList" data-link="seznam uživatelů" className={styles.navLink}
                          onClick={closeOverlay}>
                      <span>seznam uživatelů</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/categoryManagement" data-link="správa kategorií" className={styles.navLink}
                          onClick={closeOverlay}>
                      <span>správa kategorií</span>
                    </Link>
                  </li>
                </>
              )}
              <li>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://blog.haarosalon.cz/"
                  data-link="blog"
                  className={styles.navLink}
                >
                  <span>blog</span>
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://www.haaro-naturo.cz/"
                  data-link="e-shop"
                  className={styles.navLink}
                >
                  <span>e-shop</span>
                </a>
              </li>
            </ul>
            <ul>
              {!isAuthenticated ? (
                <>
                  <li>
                    <Link to="/login" data-link="přihlásit se" className={styles.navLink} onClick={closeOverlay}>
                      <span>přihlásit se</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/registration" data-link="registrovat se" className={styles.navLink}
                          onClick={closeOverlay}>
                      <span>registrovat se</span>
                    </Link>
                  </li>
                </>
              ) : (
                <li>
                  <button onClick={() => handleUserLogout(closeOverlay)} className={styles.navLink}>
                    <span>odhlásit se</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </nav>
      </div>
    </header>
  )
    ;
};

export default MobileNav;
