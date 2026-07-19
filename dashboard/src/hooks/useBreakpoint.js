import { useEffect, useState } from 'react';

// desktop > 1120px · tablet ≤ 1120px · mobile ≤ 760px
const get = () =>
  window.innerWidth <= 760 ? 'mobile' : window.innerWidth <= 1120 ? 'tablet' : 'desktop';

export default function useBreakpoint() {
  const [bp, setBp] = useState(get);
  useEffect(() => {
    const onResize = () => setBp(get());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return { bp, isMobile: bp === 'mobile', isTablet: bp === 'tablet', isNarrow: bp !== 'desktop' };
}
