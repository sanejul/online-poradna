import React from 'react';
import Footer from '../components/footer/footer';
import styles from './home-page.module.css';
import homeImgFallback from '../assets/images/Zk_HN_foceni_zeny_24-08.jpg';
import homeImgMobile from '../assets/images/Zk_HN_foceni_zeny_24-08-1024.webp';
import homeImgDesktop from '../assets/images/Zk_HN_foceni_zeny_24-08-1920.webp';
import arrow from '../assets/icons/arrow.png';
import Button from '../components/buttons/button';
import { Link } from 'react-router-dom';
import { useWindowSize } from '../hooks/use-window-size';
import { Helmet } from 'react-helmet';

const HomePage = () => {
  const { isMobile, isDesktop, isLargeDesktop } = useWindowSize();

  return (
    <>
      <Helmet>
        <title>Poradna Haaro Naturo</title>
        <meta
          name="description"
          content="Máte problém s barvením vlasů hennou? Rostlinné barvy na vlasy, bez ohledu na značku, jsou náš denní chleba - rádi
              pomůžeme v online poradně přírodního kadeřnictví."
        />
        <meta
          name="keywords"
          content="barvení hennou,
              henna na vlasy,
              henové barvy,
              rostlinné barvy na vlasy,
              poradit s hennou,
              poradit s barvením hennou,
              poradit s henou,
              poradit s barvením henou,
              jak barvit hennou,
              jak barvit henou,
              henna na šediny,
              hena na šediny,
              nechytá barva na šediny,
              nechytla barva na šediny,
              nechytá henna na šediny,
              nechytla henna na šediny,
              jak barvit šediny,
              barvení šedin hennou,
              barvení šedin přírodně,"
        />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className={styles.container}>
        <div className={styles.titleContainer}>
          <h1>
            Online poradna <br />
            pro přírodní barvení vlasů
          </h1>
          {(isDesktop || isLargeDesktop) && (
            <img src={arrow} className={styles.arrow} alt="Šipka dolů"></img>
          )}
          <picture>
            <source
              srcSet={homeImgDesktop}
              media="(min-width: 768px)"
              type="image/webp"
            />
            <source
              srcSet={homeImgMobile}
              media="(max-width: 767px)"
              type="image/webp"
            />
            <img
              src={homeImgFallback}
              loading="lazy"
              className={styles.img}
              alt="Poradna Haaro Naturo - úvodní fotka, ženy"
            />
          </picture>
        </div>

        <p className={styles.claim}>
          12 let barvíme vlasy přírodně.{!isMobile && <br />} Zeptejte se na
          cokoli, rádi pomůžeme i vám.
        </p>
        <div className={styles.buttonsContainer}>
          <Link to="/vsechny-dotazy">
            <Button type={'button'} variant={'primary'}>
              Prohlédnout dotazy
            </Button>
          </Link>
          <Link to="/novy-dotaz">
            <Button type={'button'} variant={'secondary'}>
              Položit nový dotaz
            </Button>
          </Link>
        </div>

        <div className={styles.infoContainer}>
          <div className={styles.h2Container}>
            <h2>
              Kdo Vám odpovídá
              <span className={styles.underline}></span>
            </h2>

            <div className={styles.textContainer}>
              <p>
                Jmenuji se Zita a založila jsem přírodní kadeřnictví Haaro
                Naturo v Liberci.
              </p>
              <ul>
                <li>
                  nabízím vám 12 let zkušeností s přírodním barvením vlasů
                </li>
                <li>rukama mi prošly tisíce typů a barev vlasů</li>
                <li>vím, co přírodní barvy umí, i co neumí</li>
              </ul>
            </div>
          </div>

          <div className={styles.h2Container}>
            <h2>
              Jak to tady funguje
              <span className={styles.underline}></span>
            </h2>

            <div className={styles.textContainer}>
              <ul>
                <li>
                  mrkněte na <Link to="/vsechny-dotazy">předešlé odpovědi</Link>
                  , třeba najdete podobný problém, jako je ten váš
                </li>
                <li>
                  <Link to="/registrace">registrujte se</Link>,{' '}
                  <Link to="/prihlaseni">přihlaste se</Link> a{' '}
                  <Link to="/novy-dotaz">napište mi</Link>
                </li>
                <li>u dotazu bude zveřejněno pouze vaše křestní jméno</li>
              </ul>
            </div>
          </div>

          <div className={styles.h2Container}>
            <h2>
              Napište mi toho hodně o svých vlasech
              <span className={styles.underline}></span>
            </h2>
            <div className={styles.textContainer}>
              <ul>
                <li>jejich přirozenou barvu</li>
                <li>čím aktuálně barvíte a jak to vypadá</li>
                <li>jak dlouho se barvíte, celou historii…</li>
                <li>% šedin a kde všude jsou (v rámci hlavy)</li>
                <li>typ vlasů (jemné, silné, dlouhé, kudrnaté,…)</li>
                <li>co by se vám líbilo</li>
                <li>co rozhodně nechcete</li>
                <li>cokoli dalšího vás napadne</li>
              </ul>
              <p>
                Vyfoťte se! Stačí mobilem, na denním světle, z různých úhlů,
                detaily odrostu, celek, zepředu, zezadu... hodněkrát. Pošlete mi
                ty fotky, které nejvíc odpovídají vaší reálné barvě.
              </p>
              <p>
                Počítejte prosím s tím, že se budu ještě doptávat. Udělejte si
                čas na další konverzaci. Budu se snažit vám opravdu pomoct,
                nekopíruju sem instantní odpovědi.
              </p>
            </div>
          </div>

          {isMobile && (
            <div className={styles.buttonsContainer}>
              <Link to="/vsechny-dotazy">
                <Button type={'button'} variant={'primary'}>
                  Prohlédnout dotazy
                </Button>
              </Link>
              <Link to="/novy-dotaz">
                <Button type={'button'} variant={'secondary'}>
                  Položit nový dotaz
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer></Footer>
    </>
  );
};

export default HomePage;
