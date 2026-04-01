/**
 * @file useDeviceType.ts
 * @description Device detection hook — blocks mobile users from the full application
 * @module arena/hooks
 * @author SKAV TECH
 * @product Togetherly Arena
 */
import { useState, useEffect } from 'react';

const DESKTOP_BREAKPOINT = 1024;

export function useDeviceType() {
  const [isDesktop, setIsDesktop] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const check = () => {
      const width = window.innerWidth;
      // Also check user agent for tablets that may report large widths
      const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsDesktop(width >= DESKTOP_BREAKPOINT && !isMobileUA);
    };

    check();
    const mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    mql.addEventListener('change', check);
    return () => mql.removeEventListener('change', check);
  }, []);

  return { isDesktop, isLoading: isDesktop === undefined };
}
