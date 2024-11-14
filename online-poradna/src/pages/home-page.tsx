import React from 'react';
import Footer from '../components/footer/footer';
import styles from './home-page.module.css';
import homeImgGray from '../assets/images/Zk_HN_foceni_zeny_24-07.jpg';
import homeImg from '../assets/images/Zk_HN_foceni_zeny_24-08.jpg';
import arrow from '../assets/icons/arrow.png';
import Button from '../components/buttons/button';
import { Link } from 'react-router-dom';
import { useWindowSize } from '../hooks/use-window-size';

const HomePage = () => {
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useWindowSize();

  return (
    <>
      <div className={styles.container}>
        <div className={styles.titleContainer}>
          <h1>Online poradna <br />
            pro přírodní barvení vlasů</h1>
          {(isDesktop || isLargeDesktop) && (
            <img src={arrow} className={styles.arrow} alt="šipka dolů"></img>
          )}
          <img src={homeImg} className={styles.img} alt="Haaro Naturo - poradna - úvodní fotka"></img>
        </div>

        <p className={styles.claim}>Rozumíme vlasům i přírodním barvám.{!isMobile && (<br />)} Zeptejte se nás.</p>
        <div className={styles.buttonsContainer}>
          <Link to="/archivePage"><Button type={'button'} variant={'primary'}>Prohlédnout dotazy</Button></Link>
          <Link to="/newQuestionPage"><Button type={'button'} variant={'secondary'}>Položit nový dotaz</Button></Link>
        </div>

        <div className={styles.infoContainer}>
          <div className={styles.h2Container}>
            <h2>
              Kdo Vám odpovídá
              <span className={styles.underline}></span>
            </h2>

            <div className={styles.textContainer}>
              <p>Jmenuji se Zita a založila jsem přírodní kadeřnictví Haaro Naturo v Liberci.</p>
              <ul>
                <li>nabízím vám 12 let zkušeností s přírodním barvením vlasů</li>
                <li>rukama mi prošly tisíce typů a barev vlasů</li>
                <li>vím, co přírodní barvy umí, i co neumí</li>
              </ul>
            </div>
          </div>

          <div className={styles.h2Container}>
            <h2>Jak to tady funguje
              <span className={styles.underline}></span>
            </h2>

            <div className={styles.textContainer}>
              <ul>
                <li>mrkněte na předešlé odpovědi, třeba najdete podobný problém, jako je ten váš</li>
                <li>registrujte se, přihlaste se a napište mi</li>
                <li>u dotazu bude zveřejněno pouze Vaše křestní jméno</li>
              </ul>
            </div>
          </div>

          <div className={styles.h2Container}>
            <h2>Napište mi toho hodně o svých vlasech
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
              <p>Vyfoťte se! Stačí mobilem, na denním světle, z různých úhlů, detaily odrostu, celek, zepředu,
                zezadu...
                hodněkrát.
                Pošlete mi ty fotky, které nejvíc odpovídají vaší reálné barvě.</p>
              <p>Počítejte prosím s tím, že se budu ještě doptávat. Udělejte si čas na další konverzaci. Budu se
                snažit
                vám opravdu
                pomoct, nekopíruju sem instantní odpovědi.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer></Footer>;
    </>
  )
    ;
};

export default HomePage;
