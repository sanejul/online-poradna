import { useState, useEffect } from 'react';

interface WindowSize {
  isMobile: boolean;
  isBiggerMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
}

export const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    isMobile: false,
    isBiggerMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowSize({
        isMobile: width <= 576,
        isBiggerMobile: width > 576 && width <= 768,
        isTablet: width > 768 && width <= 1024,
        isDesktop: width > 1024 && width <= 1395,
        isLargeDesktop: width > 1395,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
};
