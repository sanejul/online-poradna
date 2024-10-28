import React from 'react';
import Footer from '../components/footer/footer';

const HomePage = () => {
  return (
    <>
      <div>
        <h1>Online přírodní vlasová poradna</h1>
        <p>Porádíme Vám s čímkoliv, co se týká přírodní péče o vlsy a barvení přírodními barvami.</p>
        <h2>Jak poradna funguje</h2>
        <p>Vy se ptáte, my odpovídáme.</p>
        <p>Pokud Vás napadá otázka, nejprve se podívejte, jestli podobný nebo stejný problém neměl už někdo před
          Vámi.</p>
        <p>Archiv všech zodpovězených dotazů najdete na stránce Archiv dotazů.</p>
        <p>Pokud Váš problém, zatím nikdo neřešil, neváhejte se zeptat. Před položením dotazu se prosím
          registrujte/přihlaste do aplikace.</p>
        <p>Nebojte, bude zveřejněno pouze Vaše křestní jméno a žádn jiné osobní údaje.</p>
        <h2>Kdo Vám odpovídá</h2>
        <p>Odpovídat Vám bude Zita, zakladatelka přírodního kadeřnictví Haaro Naturo v Liberci.</p>
        <p>V Harro Naturo používáme přírodní barvy na vlasy profesionálně již 10 let. Máme za sebou desetitisíce barvení
          na tisících různých vlasů a víme, co tyto barvy umí, i co neumí.</p>
      </div>
      <Footer></Footer>
    </>
  );
};

export default HomePage;
