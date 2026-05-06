// ─────────────────────────────────────────────────────────────────────────────
// PetsBannerAnimation — paws then doggie, looping in sequence
// Plays: paws anim → doggie anim → paws → doggie → ...
// RN equivalent: same Lottie JSON files with lottie-react-native
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import lottiePawsData   from '../assets/lottie-paws.json';
import lottieDogData    from '../assets/lottie-doggie.json';

const SEQUENCE = [
  { data: lottiePawsData,  duration: 3000 },  // paws plays for 3s
  { data: lottieDogData,   duration: 3500 },  // doggie plays for 3.5s
];

export default function PetsBannerAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef      = useRef<AnimationItem | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy previous
    animRef.current?.destroy();
    animRef.current = null;

    const current = SEQUENCE[step % SEQUENCE.length];

    animRef.current = lottie.loadAnimation({
      container:     containerRef.current,
      renderer:      'svg',
      loop:          true,
      autoplay:      true,
      animationData: current.data,
    });

    // After duration, advance to next in sequence
    const timer = setTimeout(() => {
      setStep(s => s + 1);
    }, current.duration);

    return () => {
      clearTimeout(timer);
      animRef.current?.destroy();
      animRef.current = null;
    };
  }, [step]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left:      12,
        bottom:    8,
        width:     120,
        height:    120,
        zIndex:    3,
        opacity:   0.92,
        pointerEvents: 'none',
      }}
    />
  );
}
