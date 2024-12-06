import React, { Component } from 'react';

import styles from './footer.module.css';
import stylesNav from '../navigation/desktop-nav.module.css';
import '../../index.css';

import igLogo from '../../assets/ig.png';
import fbLogo from '../../assets/fb.png';
import { Link } from 'react-router-dom';

class Footer extends Component {
  render() {
    return (
      <footer
        id={styles.footerContainer}
        className={styles.section}
        data-bgcolor="#687e83"
        role="contentinfo"
        aria-labelledby="footer-claim"
      >
        <div className={styles.footerContainer}>
          <div className={styles.slogan} id="footer-claim">
            <p className={'freight-semibold'}>Haaro Naturo ~ naroste i vám</p>
          </div>

          <div className={styles.sloganMobile} aria-hidden="true">
            <p className={'freight-semibold'}>
              Haaro Naturo
              <br />~<br />
              naroste i vám
            </p>
          </div>

          <div className={styles.footerText}>
            <div className={`${styles.col} ${styles.column1}`}>
              <h2> id="contact-title"Kontaktujte nás</h2>
              <ul aria-labelledby="contact-title">
                <li>
                  <a
                    href="tel:+420 775 374 065"
                    className={stylesNav.navLink}
                    data-link="+420 775 374 065"
                    aria-label="Zavolat na číslo +420 775 374 065"
                  >
                    <span>+420 775 374 065</span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:salon@haaro-naturo.cz"
                    className={stylesNav.navLink}
                    data-link="salon@haaro-naturo.cz"
                    aria-label="Odeslat email na salon@haaro-naturo.cz"
                  >
                    <span>salon@haaro-naturo.cz</span>
                  </a>
                </li>

                <li>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://www.instagram.com/haaro_naturo/"
                    aria-label="Navštívit Instagram Haaro Naturo"
                  >
                    <img src={igLogo} alt="Logo instagramu" aria-hidden="true" />
                  </a>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://www.facebook.com/HaaroNaturo"
                    aria-label="Navštívit Facebook Haaro Naturo"
                  >
                    <img src={fbLogo} alt="Logo facebooku" aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </div>
            <div className={`${styles.col} ${styles.column2}`}>
              <h2 id="menu-title">Menu</h2>
              <ul aria-labelledby="menu-title">
                <li>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    data-link="e-shop"
                    className={stylesNav.navLink}
                    href="https://www.haaro-naturo.cz/"
                    aria-label="Otevřít e-shop Haaro Naturo"
                  >
                    <span>e-shop</span>
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    data-link="vlasová kosmetika"
                    className={stylesNav.navLink}
                    href="https://www.haaro-naturo.cz/vlasova-kosmetika/"
                    aria-label="Otevřít sekci vlasová kosmetika na e-shopu"
                  >
                    <span>vlasová kosmetika</span>
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    data-link="přírodní barvy na vlasy"
                    className={stylesNav.navLink}
                    href="https://www.haaro-naturo.cz/prirodni-barvy-na-vlasy/"
                    aria-label="Otevřít sekci přírodní barvy na vlasy"
                  >
                    <span>přírodní barvy na vlasy</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://haarosalon.cz/pages/kadernictvi.html"
                    data-link="kadeřnictví"
                    className={stylesNav.navLink}
                    aria-label="Otevřít sekci o kadeřnictví"
                  >
                    <span>kadeřnictví</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://haarosalon.cz/pages/oHaaro.html"
                    data-link="o haaro"
                    className={stylesNav.navLink}
                    aria-label="Otevřít sekci o značce Haaro Naturo"
                  >
                    <span>o haaro</span>
                  </a>
                </li>
                <li>
                  <Link
                    rel="noreferrer"
                    data-link="online poradna"
                    className={stylesNav.navLink}
                    to="/"
                    aria-label="Otevřít sekci o online poradně"
                  >
                    <span>online poradna</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div className={`${styles.col} ${styles.column3}`}>
              <h2 id="more-about-haaro-title">Více o Haaro</h2>
              <ul aria-labelledby="more-about-haaro-title">
                <li>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    data-link="blog"
                    className={stylesNav.navLink}
                    href="https://www.haaro-naturo.cz/blog/"
                    aria-label="Otevřít blog Haaro Naturo"
                  >
                    <span>blog</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://haarosalon.cz/pages/vyroba.html"
                    data-link="výroba"
                    className={stylesNav.navLink}
                    aria-label="Otevřít sekce o výrobě Haaro Naturo"
                  >
                    <span>výroba</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://haarosalon.cz/pages/kontakt.html"
                    data-link="kontakt"
                    className={stylesNav.navLink}
                    aria-label="Otevřít sekci kontakt"
                  >
                    <span>kontakt</span>
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    data-link="věrnostní klub"
                    className={stylesNav.navLink}
                    href="https://www.haaro-naturo.cz/vernostni-program/"
                    aria-label="Otevřít sekci věrnostní klub"
                  >
                    <span>věrnostní klub</span>
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    data-link="pomáháme"
                    className={stylesNav.navLink}
                    href="https://www.haaro-naturo.cz/pomahame/"
                    aria-label="Otevřít sekci pomáháme"
                  >
                    <span>pomáháme</span>
                  </a>
                </li>
              </ul>
            </div>
            <div className={`${styles.col} ${styles.column4}`}>
              <h2>O nákupu</h2>
              <ul>
                <li>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    data-link="obchodní podmínky"
                    className={stylesNav.navLink}
                    href="https://www.haaro-naturo.cz/obchodni-podminky/"
                    aria-label="Otevřít sekci onchodní podmínky"
                  >
                    <span>obchodní podmínky</span>
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    data-link="podmínky ochrany osobních údajů"
                    className={stylesNav.navLink}
                    href="https://www.haaro-naturo.cz/podminky-ochrany-osobnich-udaju/"
                    aria-label="Otevřít sekci podmínky ochrany osobních údajů"
                  >
                    <span>podmínky ochrany osobních údajů</span>
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    data-link="přeprava a platba"
                    className={stylesNav.navLink}
                    href="https://www.haaro-naturo.cz/preprava-a-platba/"
                    aria-label="Otevřít sekci přeprava a platba"
                  >
                    <span>přeprava a platba</span>
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    data-link="velkoobchod"
                    className={stylesNav.navLink}
                    href="https://www.haaro-naturo.cz/velkoobchod-2/"
                    aria-label="Otevřít sekci velkoobchod"
                  >
                    <span>velkoobchod</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div id={styles.footerCopy} className={styles.footerCopy}>
            <p>© 2024 Haaro Naturo s.r.o</p>
            <p>
              Created by{' '}
              <a target="_blank" rel="noreferrer" href="#" aria-label="Autor: Julie Sanetrníková">
                Julie Sanetrníková
              </a>
            </p>
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;
