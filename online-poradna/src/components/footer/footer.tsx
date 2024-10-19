import React, {Component} from 'react';

import styles from "./footer.module.css";
import stylesNav from "../navigation/desktop-nav.module.css";
import '../../index.css';

import igLogo from "../../assets/ig.png";
import fbLogo from "../../assets/fb.png";

class Footer extends Component {
  render() {
    return (
      <footer id={styles.footerContainer} className={styles.section} data-bgcolor="#687e83">
        <div className={styles.footerContainer}>

          <div className={styles.slogan}>
            <p className={"freight-semibold"}>Haaro Naturo ~ naroste i vám</p>
          </div>

          <div className={styles.sloganMobile}>
            <p className={"freight-semibold"}>Haaro Naturo<br />~<br />naroste i vám</p>
          </div>

          <div className={styles.footerText}>
            <div className={`${styles.col} ${styles.column1}`}>
              <h2>Kontaktujte nás</h2>
              <ul>
                <li><a href="tel:+420 775 374 065" className={stylesNav.navLink}
                       data-link="+420 775 374 065"><span>+420 775 374 065</span></a></li>
                <li><a href="mailto:salon@haaro-naturo.cz" className={stylesNav.navLink}
                       data-link="salon@haaro-naturo.cz"><span>salon@haaro-naturo.cz</span></a>
                </li>

                <li><a target="_blank" rel="noreferrer"
                       href="https://www.instagram.com/haaro_naturo/"><img src={igLogo}
                                                                           alt="Logo instagramu"/></a>
                  <a target="_blank" rel="noreferrer"
                     href="https://www.facebook.com/HaaroNaturo"><img src={fbLogo}
                                                                      alt="Logo facebooku"/></a>
                </li>
              </ul>
            </div>
            <div className={`${styles.col} ${styles.column2}`}>
              <h2>Menu</h2>
              <ul>
                <li><a target="_blank" rel="noreferrer" data-link="e-shop" className={stylesNav.navLink}
                       href="https://www.haaro-naturo.cz/"><span>e-shop</span></a>
                </li>
                <li><a target="_blank" rel="noreferrer" data-link="vlasová kosmetika" className={stylesNav.navLink}
                       href="https://www.haaro-naturo.cz/vlasova-kosmetika/"><span>vlasová kosmetika</span></a>
                </li>
                <li><a target="_blank" rel="noreferrer" data-link="přírodní barvy na vlasy" className={stylesNav.navLink}
                       href="https://www.haaro-naturo.cz/prirodni-barvy-na-vlasy/"><span>přírodní barvy na vlasy</span></a>
                </li>
                <li><a href="https://haarosalon.cz/pages/kadernictvi.html" data-link="kadeřnictví"
                       className={stylesNav.navLink}><span>kadeřnictví</span></a></li>
                <li><a href="https://haarosalon.cz/pages/oHaaro.html" data-link="o haaro"
                       className={stylesNav.navLink}><span>o haaro</span></a></li>
                <li><a target="_blank" rel="noreferrer" data-link="online poradna" className={stylesNav.navLink}
                       href="https://www.haaro-edu.cz/"><span>online poradna</span></a></li>
              </ul>

            </div>
            <div className={`${styles.col} ${styles.column3}`}>
              <h2>Více o Haaro</h2>
              <ul>
                <li><a target="_blank" rel="noreferrer" data-link="blog" className={stylesNav.navLink}
                       href="https://www.haaro-naturo.cz/blog/"><span>blog</span></a>
                </li>
                <li><a href="https://haarosalon.cz/pages/vyroba.html" data-link="výroba"
                       className={stylesNav.navLink}><span>výroba</span></a>
                </li>
                <li><a href="https://haarosalon.cz/pages/kontakt.html" data-link="kontakt"
                       className={stylesNav.navLink}><span>kontakt</span></a></li>
                <li><a target="_blank" rel="noreferrer" data-link="věrnostní klub" className={stylesNav.navLink}
                       href="https://www.haaro-naturo.cz/vernostni-program/"><span>věrnostní klub</span></a>
                </li>
                <li><a href="https://haarosalon.cz/pages/kadernictvi.html" data-link="kadeřnictví"
                       className={stylesNav.navLink}><span>kadeřnictví</span></a></li>
                <li><a target="_blank" rel="noreferrer" data-link="pomáháme" className={stylesNav.navLink}
                       href="https://www.haaro-naturo.cz/pomahame/"><span>pomáháme</span></a>
                </li>
              </ul>

            </div>
            <div className={`${styles.col} ${styles.column4}`}>
              <h2>O nákupu</h2>
              <ul>
                <li><a target="_blank" rel="noreferrer" data-link="obchodní podmínky" className={stylesNav.navLink}
                       href="https://www.haaro-naturo.cz/obchodni-podminky/"><span>obchodní podmínky</span></a>
                </li>
                <li><a target="_blank" rel="noreferrer" data-link="podmínky ochrany osobních údajů"
                       className={stylesNav.navLink}
                       href="https://www.haaro-naturo.cz/podminky-ochrany-osobnich-udaju/"><span>podmínky ochrany osobních údajů</span></a>
                </li>
                <li><a target="_blank" rel="noreferrer" data-link="přeprava a platba" className={stylesNav.navLink}
                       href="https://www.haaro-naturo.cz/preprava-a-platba/"><span>přeprava a platba</span></a>
                </li>
                <li><a target="_blank" rel="noreferrer" data-link="velkoobchod" className={stylesNav.navLink}
                       href="https://www.haaro-naturo.cz/velkoobchod-2/"><span>velkoobchod</span></a>
                </li>
              </ul>

            </div>
          </div>
          <div id={styles.footerCopy} className={styles.footerCopy}>
            <p>© 2024 Haaro Naturo s.r.o</p>
            <p>Created by <a target="_blank" rel="noreferrer" href="#">Julie Sanetrníková</a></p>
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;
