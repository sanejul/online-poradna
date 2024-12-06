import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/haaro_logo_black.png';
import styles from './desktop-nav.module.css';
import { useAuthLogic } from '../../hooks/use-auth';

const DesktopNav: React.FC = () => {
  const { isAuthenticated, isAdmin, handleUserLogout } = useAuthLogic();

  return (
      <nav id={styles.navbar} className={styles.navContainer} tabIndex={1} aria-label="Hlavní navigace">
        <p data-link="HAARO-PORADNA" aria-hidden="true">
          <span>HAARO-PORADNA</span>
        </p>
        <Link to="/" className={styles.logo} aria-label="Přejít na úvodní stránku poradny">
          <img id={styles.logo} src={logo} alt="Haaro Naturo logo" />
        </Link>
        <span id={styles.mockup} aria-hidden="true"></span>
        <ul role="menubar" aria-label="Navigace stránek">
          <li role="none">
            <Link
              to="/"
              data-link="o poradně"
              className={styles.navLink}
              role="menuitem"
              aria-label="Informace o poradně"
            >
              <span>o poradně</span>
            </Link>
          </li>
          <li role="none">
            <Link
              to="/novy-dotaz"
              data-link="nový dotaz"
              className={styles.navLink}
              role="menuitem"
              aria-label="Položit nový dotaz"
            >
              <span>nový dotaz</span>
            </Link>
          </li>
          <li role="none">
            <Link
              to="/vsechny-dotazy"
              data-link="prohlédnout dotazy"
              className={styles.navLink}
              role="menuitem"
              aria-label="Prohlédnout všechny dotazy"
            >
              <span>prohlédnout dotazy</span>
            </Link>
          </li>
          {isAuthenticated && (
            <li role="none">
              <Link
                to="/profil"
                data-link="můj profil"
                className={styles.navLink}
                role="menuitem"
                aria-label="Přejít do svého profilu"
              >
                <span>můj profil</span>
              </Link>
            </li>
          )}
          {isAdmin && (
            <>
              <li role="none">
                <Link
                  to="/seznam-uzivatelu"
                  data-link="seznam uživatelů"
                  className={styles.navLink}
                  role="menuitem"
                  aria-label="Seznam všech uživatelů"
                >
                  <span>seznam uživatelů</span>
                </Link>
              </li>
              <li role="none">
                <Link
                  to="/sprava-kategorii"
                  data-link="správa kategorií"
                  className={styles.navLink}
                  role="menuitem"
                  aria-label="Správa kategorií dotazů"
                >
                  <span>správa kategorií</span>
                </Link>
              </li>
            </>
          )}
          {!isAdmin && (
            <>
              <li role="none">
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://www.haaro-naturo.cz/"
                  data-link="e-shop"
                  className={styles.navLink}
                  role="menuitem"
                  aria-label="Přejít na e-shop Haaro Naturo"
                >
                  <span>e-shop</span>
                </a>
              </li>
              <li role="none">
                <Link
                  to="/"
                  data-link="blog"
                  className={styles.navLink}
                  role="menuitem"
                  aria-label="Přejít na blog"
                >
                  <span>blog</span>
                </Link>
              </li>
            </>
          )}

          {!isAuthenticated && (
            <>
              <li role="none">
                <Link
                  to="/prihlaseni"
                  data-link="přihlásit se"
                  className={styles.navLink}
                  role="menuitem"
                  aria-label="Přihlásit se do poradny"
                >
                  <span>přihlásit se</span>
                </Link>
              </li>
              <li role="none">
                <Link
                  to="/registrace"
                  data-link="registrovat se"
                  className={styles.navLink}
                  role="menuitem"
                  aria-label="Registrovat nový účet"
                >
                  <span>registrovat se</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
  );
};

export default DesktopNav;
