// ─────────────────────────────────────────────────────────────────────────────
// PetRoamID – Page Banners
// Images have their backgrounds baked in as page bg colour (done in Python).
// NO mix-blend-mode needed — transparent/dark areas replaced at pixel level.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import sceneAirport  from '../assets/scene-airport.png';
import scenePlane    from '../assets/scene-plane.png';
import sceneHug      from '../assets/scene-hug.png';
import sceneWalk     from '../assets/scene-walk.png';
import sceneBackpack from '../assets/scene-backpack.png';
import sceneCats     from '../assets/scene-cats.png';
import sceneStay     from '../assets/scene-stay.png';
import sceneVet      from '../assets/scene-vet.png';

export const WELCOME_COLOR   = '#E8F4F2';
export const DASHBOARD_COLOR = '#FEF0E8';
import PetsBannerAnimation from './PetsBannerAnimation';
import DashboardBannerAnimation from './DashboardBannerAnimation';

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
  imgSide    = 'right',
  imgHeight  = 210,
  titleColor = '#1a2e2b',
}: BannerProps) {
  return (
    <div style={{
      position:     'relative',
      overflow:     'hidden',
      background:   color,
      borderRadius: '0 0 28px 28px',
      marginBottom: 22,
      marginLeft:   -16,
      marginRight:  -16,
      height:       imgHeight,
    }}>
      {/* Image — bg already baked in as page colour, no blend mode needed */}
      <img
        src={imgSrc}
        alt=""
        aria-hidden="true"
        style={{
          position:       'absolute',
          bottom:         0,
          [imgSide]:      -8,
          height:         '100%',
          maxWidth:       '65%',
          objectFit:      'contain',
          objectPosition: 'bottom',
          // No mixBlendMode — background colour is baked into the PNG pixels
          userSelect:     'none',
          pointerEvents:  'none',
        }}
      />

      {/* Gradient — text side always readable */}
      <div style={{
        position:   'absolute',
        inset:       0,
        background:  imgSide === 'right'
          ? `linear-gradient(to right, ${color} 32%, ${color}dd 50%, ${color}88 65%, transparent 85%)`
          : `linear-gradient(to left,  ${color} 32%, ${color}dd 50%, ${color}88 65%, transparent 85%)`,
        pointerEvents: 'none',
      }} />

      {/* Bottom fade */}
      <div style={{
        position:   'absolute',
        bottom:     0, left: 0, right: 0,
        height:     '38%',
        background: `linear-gradient(to bottom, transparent, ${color})`,
        pointerEvents: 'none',
      }} />

      {/* Text */}
      <div style={{ position: 'relative', zIndex: 2, padding: '22px 20px 18px' }}>
        <h1 style={{
          fontFamily:   "'Playfair Display', Georgia, serif",
          fontSize:     22, fontWeight: 700,
          color:        titleColor,
          lineHeight:   1.25, marginBottom: 5,
          maxWidth:     '56%',
        }}>{title}</h1>
        {subtitle && (
          <p style={{
            fontSize: 13, color: titleColor, opacity: 0.65,
            lineHeight: 1.5, margin: 0, maxWidth: '53%',
          }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export function DashboardBanner({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ position: 'relative' }}>
      <PageBanner title={title} subtitle={subtitle} color={DASHBOARD_COLOR} imgSrc={scenePlane} titleColor="#3b1a0a" />
      <DashboardBannerAnimation />
    </div>
  );
}
export function PetsBanner() {
  return (
    <div style={{ position: 'relative' }}>
      <PageBanner title="My Pets 🐾" subtitle="Manage your travel companions" color={PETS_COLOR} imgSrc={sceneCats} titleColor="#5c2d00" />
      <PetsBannerAnimation />
    </div>
  );
}
export function TravelBanner() {
  return <PageBanner title="Plan a Trip ✈️" subtitle="Generate your compliance checklist"     color={TRAVEL_COLOR}    imgSrc={sceneAirport} titleColor="#1a2952" />;
}
export function ChecklistBanner({ title, subtitle }: { title: string; subtitle: string }) {
  return <PageBanner title={title} subtitle={subtitle}                                         color={CHECKLIST_COLOR} imgSrc={sceneHug}     titleColor="#3b2710" />;
}
export function SettingsBanner() {
  return <PageBanner title="Settings ⚙️" subtitle="Profile, backup & data"                    color={SETTINGS_COLOR}  imgSrc={sceneBackpack} titleColor="#5c2800" />;
}
export function StaysBanner() {
  return <PageBanner title="🏨 Pet-Friendly Stays" subtitle="Hotels, B&Bs and campgrounds that welcome pets" color="#E8F4F0" imgSrc={sceneStay} titleColor="#1a3530" imgSide="right" />;
}
export function VetsBanner() {
  return <PageBanner title="🏥 Nearby Vets" subtitle="Find vet clinics and animal hospitals near you"        color="#EAF0F8" imgSrc={sceneVet}  titleColor="#1a2952" imgSide="right" />;
}

export { sceneWalk };
