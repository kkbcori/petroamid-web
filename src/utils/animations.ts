// ─────────────────────────────────────────────────────────────────────────────
// PetRoamID – Animation utilities
// Pure CSS keyframes injected once into <head>, reusable across all pages.
// React Native equivalent: use Animated.timing / Animated.spring instead.
// ─────────────────────────────────────────────────────────────────────────────

export function injectAnimationStyles() {
  if (document.getElementById('petroamid-animations')) return;
  const style = document.createElement('style');
  style.id = 'petroamid-animations';
  style.textContent = `
    /* ── Entrance ──────────────────────────────────────────────────────── */
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes popIn {
      0%   { opacity: 0; transform: scale(0.82); }
      70%  { transform: scale(1.06); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(28px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    /* ── Looping ambient ───────────────────────────────────────────────── */
    @keyframes floatUp {
      0%   { transform: translateY(0px)  rotate(0deg); }
      50%  { transform: translateY(-8px) rotate(4deg); }
      100% { transform: translateY(0px)  rotate(0deg); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50%       { transform: scale(1.12); }
    }
    @keyframes wiggle {
      0%,100% { transform: rotate(0deg); }
      20%     { transform: rotate(-10deg); }
      40%     { transform: rotate(10deg); }
      60%     { transform: rotate(-6deg); }
      80%     { transform: rotate(6deg); }
    }
    @keyframes bounce {
      0%,100% { transform: translateY(0); }
      40%     { transform: translateY(-10px); }
      60%     { transform: translateY(-5px); }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }

    /* ── Interaction feedback ──────────────────────────────────────────── */
    @keyframes checkPop {
      0%   { transform: scale(0);    opacity: 0; }
      60%  { transform: scale(1.3);  opacity: 1; }
      100% { transform: scale(1);    opacity: 1; }
    }
    @keyframes ripple {
      0%   { transform: scale(0); opacity: 0.6; }
      100% { transform: scale(4); opacity: 0;   }
    }
    @keyframes confettiDrop {
      0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
      100% { transform: translateY(120px) rotate(720deg); opacity: 0; }
    }
    @keyframes mapPinBounce {
      0%,100% { transform: translateY(0) scale(1); }
      30%     { transform: translateY(-16px) scale(1.2); }
      60%     { transform: translateY(-6px) scale(1.05); }
    }
    @keyframes scoreGrow {
      from { width: 0%; }
    }

    /* ── Helpers ───────────────────────────────────────────────────────── */
    .anim-fade-slide-up  { animation: fadeSlideUp  0.4s ease both; }
    .anim-pop-in         { animation: popIn        0.35s cubic-bezier(.34,1.56,.64,1) both; }
    .anim-slide-right    { animation: slideInRight 0.35s ease both; }
    .anim-float          { animation: floatUp      3s ease-in-out infinite; }
    .anim-pulse          { animation: pulse        2s ease-in-out infinite; }
    .anim-wiggle         { animation: wiggle       0.5s ease; }
    .anim-bounce         { animation: bounce       0.6s ease; }
    .anim-check-pop      { animation: checkPop     0.35s cubic-bezier(.34,1.56,.64,1) both; }
    .anim-spin           { animation: spin         1s linear infinite; }
  `;
  document.head.appendChild(style);
}

// Confetti burst — spawns coloured particles then cleans up
export function triggerConfetti(container: HTMLElement) {
  const COLOURS = ['#2A9D8F','#E9C46A','#F4A261','#E76F51','#264653','#3B5BDB'];
  const SHAPES  = ['●','★','♥','◆','▲'];
  for (let i = 0; i < 30; i++) {
    const el = document.createElement('span');
    const colour = COLOURS[Math.floor(Math.random() * COLOURS.length)];
    const shape  = SHAPES [Math.floor(Math.random() * SHAPES.length)];
    el.textContent = shape;
    el.style.cssText = `
      position:absolute; pointer-events:none; user-select:none;
      left:${20 + Math.random() * 60}%;
      top:${Math.random() * 30}%;
      color:${colour};
      font-size:${10 + Math.random() * 14}px;
      animation: confettiDrop ${0.8 + Math.random() * 1.2}s ease forwards;
      animation-delay: ${Math.random() * 0.4}s;
      z-index: 999;
    `;
    container.style.position = 'relative';
    container.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }
}

// Ripple on button click
export function addRipple(e: React.MouseEvent<HTMLElement>) {
  const btn  = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const el   = document.createElement('span');
  const size = Math.max(rect.width, rect.height);
  el.style.cssText = `
    position:absolute; pointer-events:none;
    width:${size}px; height:${size}px;
    left:${e.clientX - rect.left - size/2}px;
    top:${e.clientY - rect.top  - size/2}px;
    background:rgba(255,255,255,0.35);
    border-radius:50%;
    animation: ripple 0.55s ease forwards;
    z-index:10;
  `;
  btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.appendChild(el);
  setTimeout(() => el.remove(), 600);
}
