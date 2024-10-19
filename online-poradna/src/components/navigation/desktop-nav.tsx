import React, { Component } from "react";
import { Link } from 'react-router-dom';
import logo from "../../assets/haaro_logo_black.png";
import styles from "./desktop-nav.module.css";

export class DesktopNav extends Component {
    render() {
        return (
          <header>
              <nav id={styles.navbar} className={styles.navContainer}>
                  <p data-link="HAARO-BLOG">
                      <span>HAARO-PORADNA</span>
                  </p>
                  <a href="https://haarosalon.cz/index.html" className={styles.logo}>
                      <img id={styles.logo} src={logo} alt="Haaro Naturo logo" />
                  </a>
                  <span id={styles.mockup}></span>
                  <ul>
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
              </nav>
          </header>
        );
    }
}

export default DesktopNav;
