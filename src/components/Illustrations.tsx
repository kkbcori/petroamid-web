// ─────────────────────────────────────────────────────────────────────────────
// PetRoamID – Page Banners
//
// Mobile-first pattern — maps directly to React Native:
//   Web  <img>            →  RN  <Image source={require(...)} />
//   Web  position:absolute →  RN  position:'absolute'
//   Web  backgroundColor  →  RN  backgroundColor
//   Web  opacity          →  RN  opacity
//
// Key: parent has solid backgroundColor → transparent PNG areas show that
//      colour → zero checkerboard on web AND mobile.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';

import sceneAirport  from '../assets/scene-airport.png';
import scenePlane    from '../assets/scene-plane.png';
import sceneHug      from '../assets/scene-hug.png';
import sceneWalk     from '../assets/scene-walk.png';
import sceneBackpack from '../assets/scene-backpack.png';
import sceneCats     from '../assets/scene-cats.png';

// ── Per-page theme colours ────────────────────────────────────────────────────
export const WELCOME_COLOR   = '#E8F4F2';
export const DASHBOARD_COLOR = '#FEF0E8';
export const PETS_COLOR      = '#FEF3E2';
export const TRAVEL_COLOR    = '#E8EDF8';
export const CHECKLIST_COLOR = '#F5EEE6';
export const SETTINGS_COLOR  = '#FFF0E0';

// ── Shared banner ─────────────────────────────────────────────────────────────
interface BannerProps {
  title:       string;
  subtitle?:   string;
  color:       string;       // solid background — transparent PNG pixels show this
  imgSrc:      string;
  imgSide?:    'left' | 'right';
  imgHeight?:  number;
  titleColor?: string;
}

export function PageBanner({
  title,
  subtitle,
  color,
  imgSrc,
  imgSide    = 'right',
  imgHeight  = 210,
  titleColor = '#1a2e2b',
}: BannerProps) {
  return (
    <div style={{
      position:        'relative',
      overflow:        'hidden',
      // ↓ This solid colour fills the whole banner.
      //   Transparent PNG pixels show THIS colour — no checkerboard ever.
      backgroundColor:  color,
      borderRadius:    '0 0 28px 28px',
      marginBottom:     22,
      marginLeft:      -16,
      marginRight:     -16,
      height:           imgHeight,
    }}>

      {/* ── Illustration image ── */}
      <img
        src={imgSrc}
        alt=""
        aria-hidden="true"
        style={{
          position:       'absolute',
          bottom:          0,
          [imgSide]:      -8,
          height:         '95%',
          maxWidth:       '62%',
          objectFit:      'contain',
          objectPosition: 'bottom',
          // Only use opacity — no blend modes (not available in React Native)
          opacity:         0.88,
          userSelect:     'none',
          pointerEvents:  'none',
        }}
      />

      {/* Horizontal gradient — keeps text legible, fades image into bg colour */}
      <div style={{
        position:      'absolute',
        inset:          0,
        background:     imgSide === 'right'
          ? `linear-gradient(to right, ${color} 28%, ${color}e0 46%, ${color}88 62%, ${color}22 80%, transparent 100%)`
          : `linear-gradient(to left,  ${color} 28%, ${color}e0 46%, ${color}88 62%, ${color}22 80%, transparent 100%)`,
        pointerEvents: 'none',
      }} />

      {/* Bottom fade — content below reads cleanly */}
      <div style={{
        position:      'absolute',
        bottom:         0, left: 0, right: 0,
        height:        '38%',
        background:    `linear-gradient(to bottom, transparent, ${color})`,
        pointerEvents: 'none',
      }} />

      {/* Text */}
      <div style={{ position: 'relative', zIndex: 2, padding: '22px 20px 18px' }}>
        <h1 style={{
          fontFamily:   "'Playfair Display', Georgia, serif",
          fontSize:      22,
          fontWeight:    700,
          color:         titleColor,
          lineHeight:    1.25,
          marginBottom:  5,
          maxWidth:     '58%',
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize:   13,
            color:      titleColor,
            opacity:    0.65,
            lineHeight: 1.5,
            margin:     0,
            maxWidth:  '54%',
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Named shortcuts (one per page) ────────────────────────────────────────────
export function DashboardBanner({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <PageBanner
      title={title} subtitle={subtitle}
      color={DASHBOARD_COLOR} imgSrc={sceneHug}
      titleColor="#3b1a0a"
    />
  );
}

export function PetsBanner() {
  return (
    <PageBanner
      title="My Pets 🐾" subtitle="Manage your travel companions"
      color={PETS_COLOR} imgSrc={sceneCats}
      titleColor="#5c2d00"
    />
  );
}

export function TravelBanner() {
  return (
    <PageBanner
      title="Plan a Trip ✈️" subtitle="Generate your compliance checklist"
      color={TRAVEL_COLOR} imgSrc={sceneAirport}
      titleColor="#1a2952"
    />
  );
}

export function ChecklistBanner({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <PageBanner
      title={title} subtitle={subtitle}
      color={CHECKLIST_COLOR} imgSrc={scenePlane}
      titleColor="#3b2710"
    />
  );
}

export function SettingsBanner() {
  return (
    <PageBanner
      title="Settings ⚙️" subtitle="Profile, backup & data"
      color={SETTINGS_COLOR} imgSrc={sceneBackpack}
      titleColor="#5c2800"
    />
  );
}

export { sceneWalk };
