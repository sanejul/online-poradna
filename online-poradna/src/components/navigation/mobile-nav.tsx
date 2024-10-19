import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './mobile-nav.module.css';
import logo2 from '../../assets/haaro_logo_light.png';

class MobileNav extends Component {
    closeOverlay = (): void => {
        const overlay = document.querySelector(`.${styles.overlay}`) as HTMLElement;
        const contain = document.querySelector(`.${styles.contain}`) as HTMLElement;

        if (overlay && contain && overlay.classList.contains(styles.open)) {
            overlay.classList.remove(styles.open);
            contain.classList.remove(styles.change);
        }
    };

    componentDidMount() {
        const toggleButton = document.querySelector(`.${styles.contain}`);
        if (toggleButton) {
            toggleButton.addEventListener('click', this.toggleClasses);
        }

        const navLinks = document.querySelectorAll(`.${styles.navLink}`);
        navLinks.forEach((link) => {
            link.addEventListener('click', this.closeOverlay);
        });
    }

    componentWillUnmount() {
        const toggleButton = document.querySelector(`.${styles.contain}`);
        if (toggleButton) {
            toggleButton.removeEventListener('click', this.toggleClasses);
        }

        const navLinks = document.querySelectorAll(`.${styles.navLink}`);
        navLinks.forEach((link) => {
            link.removeEventListener('click', this.closeOverlay);
        });
    }

    toggleClasses = () => {
        const overlay = document.querySelector(`.${styles.overlay}`);
        const contain = document.querySelector(`.${styles.contain}`);

        if (overlay && contain) {
            overlay.classList.toggle(styles.open);
            contain.classList.toggle(styles.change);
        }
    };

    render() {
        return (
          <header className={styles.container}>
              <p>HAARO-PORADNA</p>
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
                                  <a href="https://haarosalon.cz/index.html" className={styles.logo2}>
                                      <img id={styles.logo2} src={logo2} alt="Haaro Naturo logo" />
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
                              <li>
                                  <Link to="/" data-link="blog" className={styles.navLink}>
                                      <span>blog</span>
                                  </Link>
                              </li>
                              <li>
                                  <a
                                    href="https://haarosalon.cz/index.html"
                                    data-link="úvod"
                                    className={styles.navLink}
                                  >
                                      <span>úvod</span>
                                  </a>
                              </li>
                              <li>
                                  <a
                                    href="https://haarosalon.cz/pages/oHaaro.html"
                                    data-link="o haaro"
                                    className={styles.navLink}
                                  >
                                      <span>o haaro</span>
                                  </a>
                              </li>
                              <li>
                                  <a
                                    href="https://haarosalon.cz/pages/vyroba.html"
                                    data-link="výroba"
                                    className={styles.navLink}
                                  >
                                      <span>výroba</span>
                                  </a>
                              </li>
                              <li>
                                  <a
                                    href="https://haarosalon.cz/pages/kadernictvi.html"
                                    data-link="kadeřnictví"
                                    className={styles.navLink}
                                  >
                                      <span>kadeřnictví</span>
                                  </a>
                              </li>
                              <li>
                                  <a
                                    href="https://haarosalon.cz/pages/kontakt.html"
                                    data-link="kontakt"
                                    className={styles.navLink}
                                  >
                                      <span>kontakt</span>
                                  </a>
                              </li>
                          </ul>
                      </div>
                  </nav>
              </div>
          </header>
        );
    }
}

export default MobileNav;
