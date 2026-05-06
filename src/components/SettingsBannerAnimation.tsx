// Walking dog animation for Settings banner left area
import React, { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import lottieDogData from '../assets/lottie-dog-walk.json';

export default function SettingsBannerAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef      = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    animRef.current = lottie.loadAnimation({
      container:     containerRef.current,
      renderer:      'svg',
      loop:          true,
      autoplay:      true,
      animationData: lottieDogData,
    });
    return () => { animRef.current?.destroy(); animRef.current = null; };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position:      'absolute',
        left:          14,
        bottom:        8,
        width:         110,
        height:        110,
        zIndex:        3,
        opacity:       0.95,
        pointerEvents: 'none',
      }}
    />
  );
}
