import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  // Scroll to top on route change or page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  // Scroll to top on button clicks
  useEffect(() => {
    const handleButtonClick = (event) => {
      if (event.target.tagName === 'BUTTON' || event.target.closest('button')) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    };

    document.addEventListener('click', handleButtonClick);
    return () => {
      document.removeEventListener('click', handleButtonClick);
    };
  }, []);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopstate = () => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('popstate', handlePopstate);
    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, []);

  return null;
}

export default ScrollToTop;