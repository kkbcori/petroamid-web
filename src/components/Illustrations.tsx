import React from 'react';

import sceneAirport  from '../assets/scene-airport.png';
import scenePlane    from '../assets/scene-plane.png';
import sceneHug      from '../assets/scene-hug.png';
import sceneWalk     from '../assets/scene-walk.png';
import sceneBackpack from '../assets/scene-backpack.png';
import sceneCats     from '../assets/scene-cats.png';

export const WELCOME_COLOR   = '#E8F4F2';
export const DASHBOARD_COLOR = '#FDF0E8';
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
  imgOpacity?: number;
  titleColor?: string;
}

export function PageBanner({
  title, subtitle, color, imgSrc,
  imgSide    = 'right',
  imgHeight  = 220,
  imgOpacity = 0.65,
  titleColor = '#1a2e2b',
}: BannerProps) {
  return (
    <div style={{
      position:     'relative',
      overflow:     'hidden',
      background:   color,
      borderRadius: '0 0 32px 32px',
      marginBottom: 24,
      marginLeft:   -16,
      marginRight:  -16,
      height:       imgHeight,
    }}>
      {/* Illustration — no mix-blend-mode so transparent areas show banner colour */}
      <img
        src={imgSrc}
        alt=""
        aria-hidden="true"
        style={{
          position:       'absolute',
          bottom:          0,
          [imgSide]:      -10,
          height:         '100%',
          maxWidth:       '65%',
          objectFit:      'contain',
          objectPosition: 'bottom',
          opacity:         imgOpacity,
          // NO mixBlendMode — transparent PNG areas now show the banner bg colour
          userSelect:     'none',
          pointerEvents:  'none',
        }}
      />

      {/* Gradient on image side so it dissolves left→right */}
      <div style={{
        position:   'absolute',
        inset:       0,
        background:  imgSide === 'right'
          ? `linear-gradient(to right, ${color} 30%, ${color}88 55%, transparent 80%)`
          : `linear-gradient(to left,  ${color} 30%, ${color}88 55%, transparent 80%)`,
        pointerEvents: 'none',
      }} />

      {/* Bottom fade */}
      <div style={{
        position:   'absolute',
        bottom:      0, left: 0, right: 0,
        height:     '40%',
        background: `linear-gradient(to bottom, transparent, ${color})`,
        pointerEvents: 'none',
      }} />

      {/* Text — full width, no maxWidth clipping */}
      <div style={{
        position: 'relative',
        zIndex:    2,
        padding:  '24px 20px 20px',
      }}>
        <h1 style={{
          fontFamily:   "'Playfair Display', Georgia, serif",
          fontSize:      24,
          fontWeight:    700,
          color:         titleColor,
          lineHeight:    1.25,
          marginBottom:  6,
          // Prevent title running under the image by limiting to ~55% of width
          maxWidth:     '55%',
        }}>{title}</h1>
        {subtitle && (
          <p style={{
            fontSize:   13,
            color:      titleColor,
            opacity:    0.65,
            lineHeight: 1.5,
            margin:     0,
            maxWidth:  '52%',
          }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export function DashboardBanner({ title, subtitle }: { title: string; subtitle: string }) {
  return <PageBanner title={title} subtitle={subtitle} color={DASHBOARD_COLOR} imgSrc={sceneHug}      imgSide="right" imgOpacity={0.75} imgHeight={200} titleColor="#3b1a0a" />;
}
export function PetsBanner() {
  return <PageBanner title="My Pets 🐾" subtitle="Manage your travel companions" color={PETS_COLOR} imgSrc={sceneCats}     imgSide="right" imgOpacity={0.70} imgHeight={200} titleColor="#5c2d00" />;
}
export function TravelBanner() {
  return <PageBanner title="Plan a Trip ✈️" subtitle="Generate your compliance checklist" color={TRAVEL_COLOR} imgSrc={sceneAirport}  imgSide="right" imgOpacity={0.65} imgHeight={200} titleColor="#1a2952" />;
}
export function ChecklistBanner({ title, subtitle }: { title: string; subtitle: string }) {
  return <PageBanner title={title} subtitle={subtitle} color={CHECKLIST_COLOR} imgSrc={scenePlane}    imgSide="right" imgOpacity={0.70} imgHeight={200} titleColor="#3b2710" />;
}
export function SettingsBanner() {
  return <PageBanner title="Settings ⚙️" subtitle="Profile, backup & data" color={SETTINGS_COLOR} imgSrc={sceneBackpack} imgSide="right" imgOpacity={0.65} imgHeight={200} titleColor="#5c2800" />;
}

export { sceneWalk };
