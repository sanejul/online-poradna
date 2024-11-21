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
                  <Link to="/profil" data-link="můj profil" className={styles.navLink}
                        onClick={closeOverlay}>
                    <span>můj profil</span>
                  </Link>
                </li>
              )}
              {isAdmin && (
                <>
                  <li>
                    <Link to="/seznam-uzivatelu" data-link="seznam uživatelů" className={styles.navLink}
                          onClick={closeOverlay}>
                      <span>seznam uživatelů</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/sprava-kategorii" data-link="správa kategorií" className={styles.navLink}
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
              {!isAuthenticated ? (
                <>
                  <li>
                    <Link to="/prihlaseni" data-link="přihlásit se" className={styles.navLink} onClick={closeOverlay}>
                      <span>přihlásit se</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/registrace" data-link="registrovat se" className={styles.navLink}
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
