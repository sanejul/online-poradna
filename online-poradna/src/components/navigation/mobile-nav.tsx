import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './mobile-nav.module.css';
import logo2 from '../../assets/haaro_logo_light.png';
import { useAuthLogic } from '../../hooks/use-auth';
import logo from '../../assets/haaro_logo_black.png';
import { useWindowSize } from '../../hooks/use-window-size';

const MobileNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, handleUserLogout } = useAuthLogic();
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useWindowSize();

  const closeOverlay = (): void => {
    const overlay = document.querySelector(`.${styles.overlay}`) as HTMLElement;
    const contain = document.querySelector(`.${styles.contain}`) as HTMLElement;

    if (overlay && contain && overlay.classList.contains(styles.open)) {
      const isOpen = overlay.classList.toggle(styles.open);
      contain.classList.toggle(styles.change);

      overlay.setAttribute('aria-hidden', !isOpen ? 'true' : 'false');
      contain.setAttribute('aria-expanded', isOpen ? 'true' : 'false')

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

      const isOpen = overlay.classList.contains(styles.open);
      overlay.setAttribute('aria-hidden', !isOpen ? 'true' : 'false');
      contain.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
  };

  useEffect(() => {
    const toggleButton = document.querySelector(`.${styles.contain}`);
    if (toggleButton) {
      toggleButton.addEventListener('click', toggleClasses);
    }

    const navLinks = document.querySelectorAll(
      `.${styles.navLink}, button.${styles.navLink}`,
    );
    navLinks.forEach((link) => {
      link.addEventListener('click', closeOverlay);
    });

    return () => {
      const navLinks = document.querySelectorAll(
        `.${styles.navLink}, button.${styles.navLink}`,
      );
      navLinks.forEach((link) => {
        link.removeEventListener('click', closeOverlay);
      });
    };
  }, []);

  return (
    <header className={styles.container}>
      <p aria-hidden="true">HAARO-PORADNA</p>
      {((isAdmin && !isMobile) || !isMobile) && (
        <Link to="/" className={styles.logo} aria-label="Přejít na úvodní stránku">
          <img id={styles.logo} src={logo} alt="Haaro Naturo logo" />
        </Link>
      )}
      <div>
        <nav id={styles.mobileNavbar} className={styles.mobileNavbar} tabIndex={1}>
          <div className={styles.navbarButtons}>
            <button
              className={styles.contain}
              tabIndex={1}
              aria-label="Otevřít nebo zavřít menu"
              aria-controls="mobileMenu"
              aria-expanded="false"
            >
              <span className={styles.bar1}></span>
              <span className={styles.bar2}></span>
              <span className={styles.bar3}></span>
            </button>
          </div>
        </nav>

        <nav
          className={styles.overlay}
          id="mobileMenu"
          role="dialog"
          aria-label="Navigace v aplikaci"
          aria-hidden="true"
        >
          <div className={styles.overlayMenu} tabIndex={1}>
            <ul>
              <li>
                <Link to="/" className={styles.logo2} aria-label="Přejít na úvodní stránku">
                  <img id={styles.logo2} src={logo2} alt="Haaro Naturo logo" />
                </Link>
              </li>
              <li>
                <Link to="/" data-link="o poradně" className={styles.navLink} aria-label="Přejít na úvodní stránku">
                  <span>o poradně</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/novy-dotaz"
                  data-link="nový dotaz"
                  className={styles.navLink}
                  aria-label="Položit nový dotaz"
                >
                  <span>nový dotaz</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/vsechny-dotazy"
                  data-link="prohlédnout dotazy"
                  className={styles.navLink}
                  aria-label="Prohlédnout všechny dotazy"
                >
                  <span>prohlédnout dotazy</span>
                </Link>
              </li>
              {isAuthenticated && (
                <li>
                  <Link
                    to="/profil"
                    data-link="můj profil"
                    className={styles.navLink}
                    onClick={closeOverlay}
                    aria-label="Přejít na svůj profil"
                  >
                    <span>můj profil</span>
                  </Link>
                </li>
              )}
              {isAdmin && (
                <>
                  <li>
                    <Link
                      to="/seznam-uzivatelu"
                      data-link="seznam uživatelů"
                      className={styles.navLink}
                      onClick={closeOverlay}
                      aria-label="Zobrazit seznam uživatelů"
                    >
                      <span>seznam uživatelů</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/sprava-kategorii"
                      data-link="správa kategorií"
                      className={styles.navLink}
                      onClick={closeOverlay}
                      aria-label="Správa kategorií"
                    >
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
                  aria-label="Přejít na blog"
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
                  aria-label="Přejít na e-shop"
                >
                  <span>e-shop</span>
                </a>
              </li>
              {!isAuthenticated ? (
                <>
                  <li>
                    <Link
                      to="/prihlaseni"
                      data-link="přihlásit se"
                      className={styles.navLink}
                      onClick={closeOverlay}
                      aria-label="Přihlásit se"
                    >
                      <span>přihlásit se</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/registrace"
                      data-link="registrovat se"
                      className={styles.navLink}
                      onClick={closeOverlay}
                      aria-label="Registrovat nový účet"
                    >
                      <span>registrovat se</span>
                    </Link>
                  </li>
                </>
              ) : (
                <li>
                  <button
                    onClick={() => handleUserLogout(closeOverlay)}
                    className={styles.navLink}
                    aria-label="Odhlásit se"
                  >
                    <span>odhlásit se</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default MobileNav;
