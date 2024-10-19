import React, { useState, useEffect } from 'react';
import './App.css';
import HomePage from './pages/home-page';
import { Route, Routes } from 'react-router-dom';
import DesktopNav from './components/navigation/desktop-nav';
import MobileNav from './components/navigation/mobile-nav';
import Footer from './components/footer/footer';

function App() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="App">
      {!isDesktop ? <MobileNav /> : <DesktopNav />}

      <div className="main-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
<div>
  <Footer></Footer>
</div>
    </div>
  );
}

export default App;
