import React from 'react';

import sceneAirport  from '../assets/scene-airport.png';
import scenePlane    from '../assets/scene-plane.png';
import sceneHug      from '../assets/scene-hug.png';
import sceneWalk     from '../assets/scene-walk.png';
import sceneBackpack from '../assets/scene-backpack.png';
import sceneCats     from '../assets/scene-cats.png';

export const WELCOME_COLOR   = '#E8F4F2';
export const DASHBOARD_COLOR = '#FEF0E8';
export const PETS_COLOR      = '#FEF3E2';
export const TRAVEL_COLOR    = '#E8EDF8';
export const CHECKLIST_COLOR = '#F5EEE6';
export const SETTINGS_COLOR  = '#FFF0E0';

interface BannerProps {
  title:       string;
  subtitle?:   string;
  color:       string;
  imgSrc:      string;
  imgSide?:    'left' | 'right';
  imgHeight?:  number;
  titleColor?: string;
}

export function PageBanner({
  title, subtitle, color, imgSrc,
  imgSide   = 'right',
  imgHeight = 210,
  titleColor = '#1a2e2b',
}: BannerProps) {
  return (
    <div style={{
      position:        'relative',
      overflow:        'hidden',
      backgroundColor:  color,        // fills the whole banner
      borderRadius:    '0 0 28px 28px',
      marginBottom:     22,
      marginLeft:      -16,
      marginRight:     -16,
      height:           imgHeight,
    }}>
      {/* ── Illustration ──────────────────────────────────────────────────────
          backgroundColor on the <img> itself = the KEY fix.
          Transparent PNG pixels show this colour → zero checkerboard.
          Maps directly to RN: <Image style={{ backgroundColor: color }} />
      ── */}
      <img
        src={imgSrc}
        alt=""
        aria-hidden="true"
        style={{
          position:        'absolute',
          bottom:           0,
          [imgSide]:       -8,
          height:          '96%',
          maxWidth:        '64%',
          objectFit:       'contain',
          objectPosition:  'bottom',
          opacity:          0.90,
          // ↓ This fills transparent PNG areas with the banner colour
          backgroundColor:  color,
          userSelect:      'none',
          pointerEvents:   'none',
        }}
      />

      {/* Gradient — blends image into bg on the image side */}
      <div style={{
        position:      'absolute',
        inset:          0,
        background:     imgSide === 'right'
          ? `linear-gradient(to right, ${color} 30%, ${color}cc 48%, ${color}66 65%, transparent 85%)`
          : `linear-gradient(to left,  ${color} 30%, ${color}cc 48%, ${color}66 65%, transparent 85%)`,
        pointerEvents: 'none',
      }} />

      {/* Bottom fade */}
      <div style={{
        position:      'absolute',
        bottom:         0, left: 0, right: 0,
        height:        '36%',
        background:    `linear-gradient(to bottom, transparent, ${color})`,
        pointerEvents: 'none',
      }} />

      {/* Text */}
      <div style={{ position: 'relative', zIndex: 2, padding: '22px 20px 18px' }}>
        <h1 style={{
          fontFamily:   "'Playfair Display', Georgia, serif",
          fontSize:      22, fontWeight: 700, color: titleColor,
          lineHeight:    1.25, marginBottom: 5, maxWidth: '56%',
        }}>{title}</h1>
        {subtitle && (
          <p style={{
            fontSize: 13, color: titleColor, opacity: 0.65,
            lineHeight: 1.5, margin: 0, maxWidth: '52%',
          }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export function DashboardBanner({ title, subtitle }: { title: string; subtitle: string }) {
  return <PageBanner title={title} subtitle={subtitle} color={DASHBOARD_COLOR} imgSrc={sceneHug}      titleColor="#3b1a0a" />;
}
export function PetsBanner() {
  return <PageBanner title="My Pets 🐾" subtitle="Manage your travel companions" color={PETS_COLOR} imgSrc={sceneCats}     titleColor="#5c2d00" />;
}
export function TravelBanner() {
  return <PageBanner title="Plan a Trip ✈️" subtitle="Generate your compliance checklist" color={TRAVEL_COLOR} imgSrc={sceneAirport} titleColor="#1a2952" />;
}
export function ChecklistBanner({ title, subtitle }: { title: string; subtitle: string }) {
  return <PageBanner title={title} subtitle={subtitle} color={CHECKLIST_COLOR} imgSrc={scenePlane}    titleColor="#3b2710" />;
}
export function SettingsBanner() {
  return <PageBanner title="Settings ⚙️" subtitle="Profile, backup & data" color={SETTINGS_COLOR} imgSrc={sceneBackpack} titleColor="#5c2800" />;
}

export { sceneWalk };
