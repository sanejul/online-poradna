import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/haaro_logo_black.png';
import styles from './desktop-nav.module.css';
import { useAuthLogic } from '../../hooks/use-auth';

const DesktopNav: React.FC = () => {
  const { isAuthenticated, isAdmin, handleUserLogout } = useAuthLogic();

  return (
    <header>
      <nav id={styles.navbar} className={styles.navContainer}>
        <p data-link="HAARO-BLOG">
          <span>HAARO-PORADNA</span>
        </p>
        <Link to="/" className={styles.logo}>
          <img id={styles.logo} src={logo} alt="Haaro Naturo logo" />
        </Link>
        <span id={styles.mockup}></span>
        <ul>
          <li>
            <Link
              to="/"
              data-link="o poradně"
              className={styles.navLink}
            >
              <span>o poradně</span>
            </Link>
          </li>
          <li>
            <Link to="/novy-dotaz" data-link="nový dotaz" className={styles.navLink}>
              <span>nový dotaz</span>
            </Link>
          </li>
          <li>
            <Link to="/vsechny-dotazy" data-link="prohlédnout dotazy" className={styles.navLink}>
              <span>prohlédnout dotazy</span>
            </Link>
          </li>
          {isAuthenticated && (
            <li>
              <Link to="/profil" data-link="můj profil" className={styles.navLink}>
                <span>můj profil</span>
              </Link>
            </li>
          )}
          {isAdmin && (
            <>
              <li>
                <Link to="/seznam-uzivatelu" data-link="seznam uživatelů" className={styles.navLink}>
                  <span>seznam uživatelů</span>
                </Link>
              </li>
              <li>
                <Link to="/sprava-kategorii" data-link="správa kategorií" className={styles.navLink}>
                  <span>správa kategorií</span>
                </Link>
              </li>
            </>
          )}
          {!isAdmin && (
            <>
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
              <li>
                <Link to="/" data-link="blog" className={styles.navLink}>
                  <span>blog</span>
                </Link>
              </li>
            </>
          )}

          {!isAuthenticated && (
            <>
              <li>
                <Link to="/prihlaseni" data-link="přihlásit se" className={styles.navLink}>
                  <span>přihlásit se</span>
                </Link>
              </li>
              <li>
                <Link to="/registrace" data-link="registrovat se" className={styles.navLink}>
                  <span>registrovat se</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  )
    ;
};

export default DesktopNav;
