import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../../utils/gtm';

const GTMProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    trackPageView();
  }, [location]);

  return <>{children}</>;
};

export default GTMProvider;
