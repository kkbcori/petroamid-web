// Cat sleeping/playing animation for dashboard banner left area
import React, { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import lottieCatData from '../assets/lottie-cat-sleep.json';

export default function DashboardBannerAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef      = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    animRef.current = lottie.loadAnimation({
      container:     containerRef.current,
      renderer:      'svg',
      loop:          true,
      autoplay:      true,
      animationData: lottieCatData,
    });
    return () => { animRef.current?.destroy(); animRef.current = null; };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position:      'absolute',
        left:          8,
        bottom:        6,
        width:         130,
        height:        130,
        zIndex:        3,
        opacity:       0.95,
        pointerEvents: 'none',
      }}
    />
  );
}
