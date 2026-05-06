// Bird flying animation — centered in the left text area of Plan a Trip banner
import React, { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import lottieBirdData from '../assets/lottie-bird.json';

export default function TripBannerAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef      = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    animRef.current = lottie.loadAnimation({
      container:     containerRef.current,
      renderer:      'svg',
      loop:          true,
      autoplay:      true,
      animationData: lottieBirdData,
    });
    return () => { animRef.current?.destroy(); animRef.current = null; };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position:      'absolute',
        left:          '5%',
        top:           '50%',
        transform:     'translateY(-50%)',
        width:         120,
        height:        120,
        zIndex:        3,
        opacity:       0.95,
        pointerEvents: 'none',
      }}
    />
  );
}
