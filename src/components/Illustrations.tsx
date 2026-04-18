// ─────────────────────────────────────────────────────────────────────────────
// PetRoamID – Page Banners (real PNG illustrations, blended into background)
// Each page has a unique color + illustration that bleeds into the page.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';

// ── Scene image assets ────────────────────────────────────────────────────────
import sceneAirport  from '../assets/scene-airport.png';   // airport with cat   → Trip Setup
import scenePlane    from '../assets/scene-plane.png';     // boy+dog on plane   → Checklist
import sceneHug      from '../assets/scene-hug.png';       // girl hugging dog   → Dashboard
import sceneWalk     from '../assets/scene-walk.png';      // girl walking poodle→ Profile/Welcome
import sceneBackpack from '../assets/scene-backpack.png';  // man+dogs+backpack  → Settings
import sceneCats     from '../assets/scene-cats.png';      // girl with two cats → Pets

// ── Per-page theme colors (sampled from each illustration's dominant tones) ───
export const WELCOME_COLOR    = '#E8F4F2';   // soft sage — matches walk scene's botanicals
export const DASHBOARD_COLOR  = '#FDF0E8';   // warm peach — hugging scene's cream fur
export const PETS_COLOR       = '#FEF3E2';   // warm amber — cats' orange tabby tones
export const TRAVEL_COLOR     = '#E8EDF8';   // cool blue-grey — airport scene's terminal
export const CHECKLIST_COLOR  = '#F5EEE6';   // warm linen — plane interior's beige
export const SETTINGS_COLOR   = '#FFF0E0';   // light tangerine — backpack scene's orange

// ── Reusable blended banner ───────────────────────────────────────────────────
interface BannerProps {
  title:       string;
  subtitle?:   string;
  color:       string;          // background fill
  imgSrc:      string;          // illustration PNG
  imgSide?:    'left' | 'right';
  imgHeight?:  number;          // px, defaults to 100%
  imgOpacity?: number;          // 0–1, defaults to 0.55
  titleColor?: string;
  children?:   React.ReactNode; // extra elements inside banner
}

export function PageBanner({
  title, subtitle, color, imgSrc,
  imgSide = 'right',
  imgHeight = 220,
  imgOpacity = 0.55,
  titleColor = '#1a2e2b',
  children,
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
      // Subtle inner shadow at the bottom to help the page content sit on top
      boxShadow: 'inset 0 -24px 32px -8px rgba(255,255,255,0.6)',
    }}>

      {/* ── Illustration image — blended into background ── */}
      <img
        src={imgSrc}
        alt=""
        aria-hidden="true"
        style={{
          position:        'absolute',
          bottom:          0,
          [imgSide]:       imgSide === 'right' ? -10 : -10,
          height:          '100%',
          maxWidth:        '72%',
          objectFit:       'contain',
          objectPosition:  'bottom',
          opacity:         imgOpacity,
          // mix-blend-mode: multiply makes white areas transparent against colored bg
          mixBlendMode:    'multiply',
          userSelect:      'none',
          pointerEvents:   'none',
        }}
      />

      {/* ── Gradient fade on the illustration side to help it dissolve ── */}
      <div style={{
        position:   'absolute',
        inset:       0,
        background:  imgSide === 'right'
          ? `linear-gradient(to right, ${color} 25%, transparent 60%, ${color}22 100%)`
          : `linear-gradient(to left,  ${color} 25%, transparent 60%, ${color}22 100%)`,
        pointerEvents: 'none',
      }} />

      {/* ── Bottom fade so page cards read cleanly ── */}
      <div style={{
        position:   'absolute',
        bottom:      0, left: 0, right: 0,
        height:     '35%',
        background: `linear-gradient(to bottom, transparent, ${color})`,
        pointerEvents: 'none',
      }} />

      {/* ── Text + extra content ── */}
      <div style={{
        position:   'relative',
        zIndex:      2,
        padding:    '24px 20px 20px',
        // Push text to opposite side of the image
        maxWidth:    imgSide === 'right' ? '58%' : '58%',
        marginLeft:  imgSide === 'right' ? 0 : 'auto',
        marginRight: imgSide === 'right' ? 'auto' : 0,
      }}>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize:    24,
          fontWeight:  700,
          color:       titleColor,
          lineHeight:  1.2,
          marginBottom: 6,
        }}>{title}</h1>
        {subtitle && (
          <p style={{
            fontSize:  13,
            color:     titleColor,
            opacity:   0.65,
            lineHeight: 1.5,
            margin:    0,
          }}>{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  );
}

// ── Named banner shortcuts for each page ──────────────────────────────────────
export function WelcomeBanner()   { return null; } // ProfilePage handles itself
export function DashboardBanner({ title, subtitle }: { title: string; subtitle: string }) {
  return <PageBanner title={title} subtitle={subtitle} color={DASHBOARD_COLOR} imgSrc={sceneHug}      imgSide="right" imgOpacity={0.6} imgHeight={220} titleColor="#3b1a0a" />;
}
export function PetsBanner() {
  return <PageBanner title="My Pets 🐾" subtitle="Manage your travel companions" color={PETS_COLOR} imgSrc={sceneCats} imgSide="right" imgOpacity={0.55} imgHeight={210} titleColor="#5c2d00" />;
}
export function TravelBanner() {
  return <PageBanner title="Plan a Trip ✈️" subtitle="Generate your compliance checklist" color={TRAVEL_COLOR} imgSrc={sceneAirport} imgSide="right" imgOpacity={0.5} imgHeight={220} titleColor="#1a2952" />;
}
export function ChecklistBanner({ title, subtitle }: { title: string; subtitle: string }) {
  return <PageBanner title={title} subtitle={subtitle} color={CHECKLIST_COLOR} imgSrc={scenePlane} imgSide="right" imgOpacity={0.55} imgHeight={210} titleColor="#3b2710" />;
}
export function SettingsBanner() {
  return <PageBanner title="Settings ⚙️" subtitle="Profile, backup & data" color={SETTINGS_COLOR} imgSrc={sceneBackpack} imgSide="right" imgOpacity={0.5} imgHeight={210} titleColor="#5c2800" />;
}

// Re-export images for ProfilePage
export { sceneWalk };
