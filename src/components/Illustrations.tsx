// ─────────────────────────────────────────────────────────────────────────────
// PetRoamID – Flat illustration scenes (one per page)
// Flat cartoon style inspired by modern pet-app UI references.
// Each exports a React SVG component + its theme color.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';

interface SceneProps { style?: React.CSSProperties; }

// ── 1. WELCOME (ProfilePage) ─── Royal blue, person walking golden dog ────────
export const WELCOME_COLOR = '#2D4DD4';
export function WelcomeScene({ style }: SceneProps) {
  return (
    <svg viewBox="0 0 400 420" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block', ...style }}>
      {/* Sky */}
      <rect width="400" height="420" fill="#2D4DD4"/>
      {/* Sun glow */}
      <circle cx="310" cy="130" r="90" fill="#FCD34D" opacity="0.18"/>
      <circle cx="310" cy="130" r="68" fill="#FCD34D" opacity="0.55"/>
      {/* Ground */}
      <rect x="0" y="378" width="400" height="42" fill="#1D35A0"/>
      <ellipse cx="200" cy="378" rx="215" ry="18" fill="#2340C0"/>
      {/* Grass blades */}
      {[30,55,80,320,350,375].map((x,i) => (
        <path key={i} d={`M${x},378 Q${x+5},${355+i%3*6} ${x+10},378`} stroke="#16A34A" strokeWidth="3" fill="none" strokeLinecap="round"/>
      ))}

      {/* ── PERSON (walking right) ── */}
      {/* Left shoe */}
      <ellipse cx="135" cy="375" rx="20" ry="9" fill="#92400E"/>
      {/* Right shoe */}
      <ellipse cx="172" cy="376" rx="22" ry="9" fill="#92400E"/>
      {/* Left leg (back) */}
      <path d="M148,298 Q140,336 132,372" stroke="#F97316" strokeWidth="22" strokeLinecap="round" fill="none"/>
      {/* Right leg (front) */}
      <path d="M163,298 Q172,337 175,372" stroke="#F97316" strokeWidth="22" strokeLinecap="round" fill="none"/>
      {/* Torso */}
      <rect x="132" y="230" width="52" height="78" rx="14" fill="#1D4ED8"/>
      {/* Jacket hem shadow */}
      <rect x="132" y="293" width="52" height="16" rx="6" fill="#1A42C0"/>
      {/* Left arm (swinging back) */}
      <path d="M134,248 Q110,274 105,304" stroke="#1D4ED8" strokeWidth="20" strokeLinecap="round" fill="none"/>
      {/* Right arm (forward, holding leash) */}
      <path d="M182,248 Q202,268 207,292" stroke="#1D4ED8" strokeWidth="20" strokeLinecap="round" fill="none"/>
      {/* Right hand */}
      <circle cx="208" cy="295" r="10" fill="#FBBF24"/>
      {/* Neck */}
      <rect x="148" y="214" width="20" height="20" rx="5" fill="#FBBF24"/>
      {/* Head */}
      <circle cx="158" cy="192" r="32" fill="#FBBF24"/>
      {/* Hair */}
      <path d="M126,187 Q127,146 158,143 Q189,146 190,183 Q183,158 158,156 Q133,158 126,187Z" fill="#1C1917"/>
      {/* Eyes */}
      <circle cx="148" cy="191" r="4" fill="#1C1917"/>
      <circle cx="169" cy="191" r="4" fill="#1C1917"/>
      <circle cx="149.5" cy="189.5" r="1.3" fill="white"/>
      <circle cx="170.5" cy="189.5" r="1.3" fill="white"/>
      {/* Smile */}
      <path d="M151,203 Q158,210 166,203" stroke="#92400E" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

      {/* ── LEASH ── */}
      <path d="M207,292 Q242,308 270,324" stroke="#B45309" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeDasharray="none"/>

      {/* ── DOG (golden retriever) ── */}
      {/* Tail (curled up, behind body) */}
      <path d="M245,352 Q222,322 233,300 Q244,280 262,298" stroke="#D97706" strokeWidth="14" strokeLinecap="round" fill="none"/>
      {/* Body */}
      <ellipse cx="305" cy="366" rx="62" ry="30" fill="#FDE68A"/>
      {/* Belly shadow */}
      <ellipse cx="305" cy="376" rx="55" ry="14" fill="#FCD34D" opacity="0.5"/>
      {/* Back legs */}
      <path d="M266,385 Q263,400 261,414" stroke="#D97706" strokeWidth="14" strokeLinecap="round" fill="none"/>
      <path d="M286,390 Q284,405 283,415" stroke="#D97706" strokeWidth="14" strokeLinecap="round" fill="none"/>
      {/* Front legs */}
      <path d="M322,390 Q322,405 321,415" stroke="#D97706" strokeWidth="14" strokeLinecap="round" fill="none"/>
      <path d="M340,386 Q342,401 342,414" stroke="#D97706" strokeWidth="14" strokeLinecap="round" fill="none"/>
      {/* Neck */}
      <ellipse cx="348" cy="352" rx="22" ry="26" fill="#FDE68A"/>
      {/* Head */}
      <circle cx="358" cy="328" r="30" fill="#FDE68A"/>
      {/* Snout */}
      <ellipse cx="376" cy="340" rx="17" ry="12" fill="#D97706"/>
      {/* Nose */}
      <ellipse cx="384" cy="335" rx="6.5" ry="5" fill="#1C1917"/>
      <ellipse cx="384" cy="334" rx="2" ry="1.5" fill="white"/>
      {/* Eye */}
      <circle cx="362" cy="320" r="5.5" fill="#1C1917"/>
      <circle cx="364" cy="318" r="1.8" fill="white"/>
      {/* Ear (floppy) */}
      <path d="M341,315 Q322,326 330,350 Q340,336 351,322Z" fill="#D97706"/>
      {/* Collar */}
      <path d="M335,346 Q349,338 364,342" stroke="#EF4444" strokeWidth="7" strokeLinecap="round" fill="none"/>
      <circle cx="349" cy="341" r="4.5" fill="#B45309"/>

      {/* Small decorative stars in sky */}
      {[[60,80],[90,45],[200,60],[240,30]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="white" opacity="0.7"/>
      ))}
    </svg>
  );
}

// ── 2. DASHBOARD ─── Warm coral, person relaxing with cat ────────────────────
export const DASHBOARD_COLOR = '#E05252';
export function DashboardScene({ style }: SceneProps) {
  return (
    <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block', ...style }}>
      <rect width="400" height="280" fill="#E05252"/>
      {/* Warm glow circles */}
      <circle cx="340" cy="60" r="80" fill="#FF8C8C" opacity="0.35"/>
      <circle cx="60" cy="220" r="60" fill="#FF8C8C" opacity="0.25"/>

      {/* Floor */}
      <rect x="0" y="240" width="400" height="40" fill="#C43A3A"/>
      <ellipse cx="200" cy="240" rx="210" ry="16" fill="#CC4444"/>

      {/* Cushion/mat the person sits on */}
      <ellipse cx="170" cy="248" rx="75" ry="20" fill="#FF8C8C"/>
      <ellipse cx="170" cy="244" rx="68" ry="14" fill="#FFB3B3"/>

      {/* ── PERSON (sitting cross-legged, facing slightly right) ── */}
      {/* Legs (crossed, sitting) */}
      <path d="M130,225 Q145,248 170,252 Q195,248 210,225" stroke="#2A9D8F" strokeWidth="24" strokeLinecap="round" fill="none"/>
      {/* Body */}
      <rect x="143" y="168" width="54" height="70" rx="14" fill="#2A9D8F"/>
      {/* Left arm (resting on knee) */}
      <path d="M144,185 Q122,210 128,238" stroke="#2A9D8F" strokeWidth="18" strokeLinecap="round" fill="none"/>
      {/* Right arm (raised, petting cat) */}
      <path d="M196,185 Q218,175 228,160" stroke="#2A9D8F" strokeWidth="18" strokeLinecap="round" fill="none"/>
      <circle cx="229" cy="157" r="9" fill="#FBBF24"/>
      {/* Neck */}
      <rect x="156" y="152" width="18" height="20" rx="5" fill="#FBBF24"/>
      {/* Head */}
      <circle cx="165" cy="135" r="30" fill="#FBBF24"/>
      {/* Hair (ponytail) */}
      <path d="M135,128 Q136,90 165,88 Q194,90 195,125 Q188,100 165,98 Q142,100 135,128Z" fill="#1C1917"/>
      <path d="M194,115 Q205,120 200,138" stroke="#1C1917" strokeWidth="8" strokeLinecap="round" fill="none"/>
      {/* Eyes */}
      <circle cx="156" cy="133" r="4" fill="#1C1917"/>
      <circle cx="175" cy="133" r="4" fill="#1C1917"/>
      <circle cx="157.3" cy="131.5" r="1.3" fill="white"/>
      <circle cx="176.3" cy="131.5" r="1.3" fill="white"/>
      {/* Smile (happy) */}
      <path d="M157,146 Q165,154 174,146" stroke="#92400E" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

      {/* ── CAT (on lap, looking up) ── */}
      {/* Cat body (curled on lap) */}
      <ellipse cx="195" cy="225" rx="35" ry="22" fill="#F8D7A0"/>
      {/* Cat tail curling */}
      <path d="M230,228 Q248,218 245,200 Q242,188 232,194" stroke="#F8D7A0" strokeWidth="12" strokeLinecap="round" fill="none"/>
      {/* Cat head */}
      <circle cx="215" cy="203" r="24" fill="#F8D7A0"/>
      {/* Pointy ears */}
      <path d="M200,191 Q196,172 210,180Z" fill="#F8D7A0"/>
      <path d="M230,191 Q234,172 220,180Z" fill="#F8D7A0"/>
      <path d="M201,191 Q198,176 210,182Z" fill="#FFC5A5"/>
      <path d="M229,191 Q232,176 220,182Z" fill="#FFC5A5"/>
      {/* Cat face */}
      <circle cx="208" cy="201" r="4" fill="#1C1917"/>
      <circle cx="222" cy="201" r="4" fill="#1C1917"/>
      <circle cx="209" cy="199.5" r="1.3" fill="white"/>
      <circle cx="223" cy="199.5" r="1.3" fill="white"/>
      {/* Cat nose */}
      <path d="M215,208 L212,211 L218,211Z" fill="#E05252"/>
      {/* Whiskers */}
      <path d="M196,207 Q207,208 215,208" stroke="#1C1917" strokeWidth="1.2" fill="none"/>
      <path d="M196,212 Q207,210 215,210" stroke="#1C1917" strokeWidth="1.2" fill="none"/>
      <path d="M234,207 Q223,208 215,208" stroke="#1C1917" strokeWidth="1.2" fill="none"/>
      <path d="M234,212 Q223,210 215,210" stroke="#1C1917" strokeWidth="1.2" fill="none"/>

      {/* Floating hearts / sparkles */}
      {[[245,110,'❤️'],[265,70,'⭐'],[290,100,'✨']].map(([x,y,e],i) => (
        <text key={i} x={Number(x)} y={Number(y)} fontSize="18" opacity="0.7">{e}</text>
      ))}
    </svg>
  );
}

// ── 3. PETS PAGE ─── Amber gold, person hugging big fluffy dog ───────────────
export const PETS_COLOR = '#D97706';
export function PetsScene({ style }: SceneProps) {
  return (
    <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block', ...style }}>
      <rect width="400" height="280" fill="#D97706"/>
      {/* Warm glow */}
      <circle cx="200" cy="280" r="160" fill="#F59E0B" opacity="0.45"/>
      <circle cx="60" cy="60" r="55" fill="#F59E0B" opacity="0.3"/>

      {/* Ground */}
      <rect x="0" y="248" width="400" height="32" fill="#B45309"/>
      <ellipse cx="200" cy="248" rx="210" ry="14" fill="#C46010"/>

      {/* Paw prints scattered */}
      {[[50,200],[360,190],[80,240],[330,240]].map(([x,y],i)=>(
        <g key={i} opacity="0.35" transform={`translate(${x},${y}) scale(0.55)`}>
          <ellipse cx="0" cy="0" rx="10" ry="12" fill="#92400E"/>
          <circle cx="-12" cy="-14" r="6" fill="#92400E"/>
          <circle cx="0" cy="-17" r="6" fill="#92400E"/>
          <circle cx="12" cy="-14" r="6" fill="#92400E"/>
        </g>
      ))}

      {/* ── BIG FLUFFY DOG (center) ── */}
      {/* Dog body (large, fluffy - white/cream) */}
      <ellipse cx="220" cy="210" rx="85" ry="52" fill="#FEF3C7"/>
      {/* Fluffy texture rings */}
      <ellipse cx="220" cy="200" rx="80" ry="40" fill="none" stroke="#FDE68A" strokeWidth="8"/>
      {/* Dog rear (fluffy) */}
      <circle cx="150" cy="195" r="48" fill="#FEF3C7"/>
      <circle cx="145" cy="185" r="40" fill="white"/>
      {/* Dog tail (big fluffy) */}
      <circle cx="108" cy="175" r="28" fill="white"/>
      <circle cx="88" cy="162" r="20" fill="#FEF3C7"/>
      {/* Dog front */}
      <circle cx="290" cy="190" r="42" fill="#FEF3C7"/>
      {/* Dog head */}
      <circle cx="318" cy="158" r="40" fill="white"/>
      {/* Dog face */}
      <ellipse cx="330" cy="172" rx="20" ry="14" fill="#FDE68A"/>
      <ellipse cx="338" cy="168" rx="8" ry="6" fill="#1C1917"/>
      <ellipse cx="338" cy="167" rx="2.5" ry="2" fill="white"/>
      <circle cx="308" cy="150" r="6" fill="#1C1917"/>
      <circle cx="310" cy="148" r="2" fill="white"/>
      {/* Dog ear (floppy, big) */}
      <path d="M290,143 Q268,155 278,185 Q292,165 304,148Z" fill="#FDE68A"/>
      {/* Dog nose */}
      <ellipse cx="308" cy="172" rx="6" ry="5" fill="none"/>
      {/* Dog legs */}
      <path d="M180,248 Q178,260 177,270" stroke="#FDE68A" strokeWidth="16" strokeLinecap="round" fill="none"/>
      <path d="M205,252 Q204,264 203,272" stroke="#FDE68A" strokeWidth="16" strokeLinecap="round" fill="none"/>
      <path d="M245,252 Q246,264 246,272" stroke="#FDE68A" strokeWidth="16" strokeLinecap="round" fill="none"/>
      <path d="M268,248 Q270,260 271,270" stroke="#FDE68A" strokeWidth="16" strokeLinecap="round" fill="none"/>

      {/* ── PERSON (kneeling, hugging dog from left) ── */}
      {/* Kneeling legs */}
      <path d="M130,235 Q115,245 108,252" stroke="#7C3AED" strokeWidth="22" strokeLinecap="round" fill="none"/>
      <path d="M152,240 Q145,250 142,258" stroke="#7C3AED" strokeWidth="22" strokeLinecap="round" fill="none"/>
      {/* Body */}
      <rect x="112" y="170" width="48" height="72" rx="13" fill="#7C3AED"/>
      {/* Both arms hugging around dog */}
      <path d="M114,188 Q90,195 88,220 Q100,240 140,245" stroke="#7C3AED" strokeWidth="20" strokeLinecap="round" fill="none"/>
      <path d="M158,188 Q180,195 188,220" stroke="#7C3AED" strokeWidth="20" strokeLinecap="round" fill="none"/>
      {/* Neck */}
      <rect x="126" y="154" width="18" height="18" rx="5" fill="#FBBF24"/>
      {/* Head */}
      <circle cx="135" cy="138" r="28" fill="#FBBF24"/>
      {/* Hair */}
      <path d="M107,133 Q108,96 135,94 Q162,96 163,130 Q157,105 135,104 Q113,105 107,133Z" fill="#1C1917"/>
      {/* Eyes (joyful, slightly squinted) */}
      <path d="M124,136 Q128,131 133,135" stroke="#1C1917" strokeWidth="2.8" fill="none" strokeLinecap="round"/>
      <path d="M137,135 Q142,130 146,134" stroke="#1C1917" strokeWidth="2.8" fill="none" strokeLinecap="round"/>
      {/* Big smile */}
      <path d="M124,149 Q135,158 146,149" stroke="#92400E" strokeWidth="2.8" fill="none" strokeLinecap="round"/>

      {/* Floating hearts */}
      <text x="320" y="85" fontSize="22" opacity="0.8">❤️</text>
      <text x="350" y="55" fontSize="16" opacity="0.6">🐾</text>
      <text x="55" y="100" fontSize="18" opacity="0.6">✨</text>
    </svg>
  );
}

// ── 4. TRIP SETUP ─── Deep navy, person + dog + airplane ─────────────────────
export const TRAVEL_COLOR = '#1E3A8A';
export function TravelScene({ style }: SceneProps) {
  return (
    <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block', ...style }}>
      <rect width="400" height="280" fill="#1E3A8A"/>
      {/* Night sky circles */}
      <circle cx="340" cy="55" r="50" fill="#2D4FBF" opacity="0.6"/>
      <circle cx="60" cy="80" r="35" fill="#2D4FBF" opacity="0.4"/>
      {/* Stars */}
      {[[40,30],[80,15],[140,40],[220,20],[290,35],[370,15],[370,70],[310,10]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={i%2===0?2:1.5} fill="white" opacity="0.75"/>
      ))}

      {/* ── AIRPLANE ── */}
      <g transform="translate(260,62) rotate(-18)">
        {/* Fuselage */}
        <ellipse cx="0" cy="0" rx="48" ry="12" fill="white"/>
        {/* Nose cone */}
        <path d="M48,-4 Q62,0 48,4Z" fill="white"/>
        {/* Tail fin */}
        <path d="M-35,-12 Q-42,-32 -25,-20 L-20,-10Z" fill="#BFDBFE"/>
        <path d="M-35,12 Q-42,28 -25,18 L-20,10Z" fill="white" opacity="0.6"/>
        {/* Wing */}
        <path d="M-10,-12 Q10,-40 30,-20 L20,-8Z" fill="#BFDBFE"/>
        {/* Windows */}
        {[-5,8,21].map((x,i)=>(
          <rect key={i} x={x} y="-5" width="7" height="7" rx="2" fill="#93C5FD"/>
        ))}
      </g>

      {/* Dashed flight path */}
      <path d="M50,140 Q200,60 305,80" stroke="#60A5FA" strokeWidth="2" fill="none" strokeDasharray="8,6" opacity="0.6"/>

      {/* Ground */}
      <rect x="0" y="244" width="400" height="36" fill="#152A6E"/>
      <ellipse cx="200" cy="244" rx="215" ry="14" fill="#1A317A"/>

      {/* Suitcase */}
      <rect x="295" y="205" width="55" height="45" rx="8" fill="#F97316"/>
      <rect x="295" y="205" width="55" height="45" rx="8" fill="none" stroke="#EA580C" strokeWidth="3"/>
      <rect x="315" y="198" width="15" height="10" rx="4" fill="#EA580C"/>
      <rect x="309" y="218" width="37" height="3" rx="1.5" fill="#EA580C"/>
      <rect x="324" y="207" width="3" height="41" rx="1.5" fill="#EA580C"/>

      {/* Globe */}
      <circle cx="355" cy="192" r="22" fill="none" stroke="#60A5FA" strokeWidth="2.5"/>
      <ellipse cx="355" cy="192" rx="10" ry="22" fill="none" stroke="#60A5FA" strokeWidth="1.5"/>
      <line x1="333" y1="192" x2="377" y2="192" stroke="#60A5FA" strokeWidth="1.5"/>
      <circle cx="355" cy="192" r="22" fill="#2D4FBF" opacity="0.4"/>

      {/* ── PERSON with backpack ── */}
      {/* Legs */}
      <path d="M142,228 Q135,240 133,252" stroke="#F97316" strokeWidth="20" strokeLinecap="round" fill="none"/>
      <path d="M162,230 Q162,242 161,252" stroke="#F97316" strokeWidth="20" strokeLinecap="round" fill="none"/>
      {/* Backpack */}
      <rect x="116" y="178" width="30" height="45" rx="8" fill="#60A5FA"/>
      <rect x="118" y="180" width="26" height="40" rx="6" fill="#3B82F6"/>
      <path d="M130,175 Q130,170 135,168 Q140,170 140,175" stroke="#60A5FA" strokeWidth="5" fill="none" strokeLinecap="round"/>
      {/* Body */}
      <rect x="132" y="175" width="48" height="68" rx="13" fill="#1D4ED8"/>
      {/* Left arm (waving) */}
      <path d="M133,192 Q112,188 100,172" stroke="#1D4ED8" strokeWidth="18" strokeLinecap="round" fill="none"/>
      <circle cx="98" cy="169" r="9" fill="#FBBF24"/>
      {/* Right arm (down holding leash) */}
      <path d="M178,192 Q190,208 194,226" stroke="#1D4ED8" strokeWidth="18" strokeLinecap="round" fill="none"/>
      <circle cx="195" cy="229" r="9" fill="#FBBF24"/>
      {/* Neck */}
      <rect x="147" y="159" width="18" height="18" rx="5" fill="#FBBF24"/>
      {/* Head */}
      <circle cx="156" cy="143" r="28" fill="#FBBF24"/>
      {/* Hair (short) */}
      <path d="M128,138 Q130,100 156,98 Q182,100 184,135 Q177,110 156,108 Q135,110 128,138Z" fill="#1C1917"/>
      {/* Eyes + smile */}
      <circle cx="147" cy="142" r="3.5" fill="#1C1917"/>
      <circle cx="166" cy="142" r="3.5" fill="#1C1917"/>
      <path d="M148,155 Q156,162 165,155" stroke="#92400E" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

      {/* Leash */}
      <path d="M194,226 Q215,235 228,240" stroke="#F59E0B" strokeWidth="3" fill="none" strokeLinecap="round"/>

      {/* ── SMALL DOG (beside person) ── */}
      <ellipse cx="252" cy="240" rx="36" ry="18" fill="#FDE68A"/>
      <path d="M222,248 Q220,258 219,265" stroke="#D97706" strokeWidth="10" strokeLinecap="round" fill="none"/>
      <path d="M238,252 Q237,262 236,267" stroke="#D97706" strokeWidth="10" strokeLinecap="round" fill="none"/>
      <path d="M265,252 Q265,262 265,267" stroke="#D97706" strokeWidth="10" strokeLinecap="round" fill="none"/>
      <path d="M278,248 Q279,258 280,265" stroke="#D97706" strokeWidth="10" strokeLinecap="round" fill="none"/>
      <circle cx="278" cy="225" r="20" fill="#FDE68A"/>
      <ellipse cx="290" cy="233" rx="11" ry="8" fill="#D97706"/>
      <ellipse cx="295" cy="230" rx="4" ry="3.5" fill="#1C1917"/>
      <circle cx="282" cy="219" r="4" fill="#1C1917"/>
      <circle cx="284" cy="217" r="1.3" fill="white"/>
      <path d="M268,218 Q258,226 264,238 Q270,228 275,220Z" fill="#D97706"/>
      <path d="M268,232 Q260,228 262,240" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

// ── 5. CHECKLIST PAGE ─── Rich violet, person + cat reviewing docs ─────────
export const CHECKLIST_COLOR = '#5B21B6';
export function ChecklistScene({ style }: SceneProps) {
  return (
    <svg viewBox="0 0 400 270" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block', ...style }}>
      <rect width="400" height="270" fill="#5B21B6"/>
      {/* Glow blobs */}
      <circle cx="330" cy="50" r="70" fill="#7C3AED" opacity="0.5"/>
      <circle cx="70" cy="200" r="50" fill="#7C3AED" opacity="0.4"/>

      {/* Ground */}
      <rect x="0" y="238" width="400" height="32" fill="#3B1280"/>
      <ellipse cx="200" cy="238" rx="210" ry="14" fill="#4A1898"/>

      {/* Floating checkmarks and stars */}
      {[[40,60,'✓'],[360,80,'✓'],[300,30,'⭐'],[100,40,'✨']].map(([x,y,e],i)=>(
        <text key={i} x={Number(x)} y={Number(y)} fontSize="20" fill="white" opacity="0.5" fontWeight="bold">{e}</text>
      ))}

      {/* ── CLIPBOARD / DOCUMENT ── */}
      <rect x="215" y="110" width="90" height="118" rx="8" fill="white"/>
      <rect x="245" y="104" width="30" height="14" rx="5" fill="#DDD6FE"/>
      {/* Checklist lines */}
      {[0,1,2,3].map(i=>(
        <g key={i}>
          <rect x="227" y={130+i*22} width="10" height="10" rx="2" fill={i<2?"#5B21B6":"#DDD6FE"}/>
          {i<2 && <path d={`M228,${134+i*22} L230,${137+i*22} L235,${131+i*22}`} stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>}
          <rect x="244" y={132+i*22} width="50" height="6" rx="2" fill={i<2?"#EDE9FE":"#F3F0FF"}/>
        </g>
      ))}

      {/* ── CAT (sitting, looking at clipboard) ── */}
      {/* Cat body */}
      <ellipse cx="262" cy="222" rx="30" ry="20" fill="#F8D7A0"/>
      {/* Cat tail */}
      <path d="M232,225 Q215,215 218,200 Q221,188 232,196" stroke="#F8D7A0" strokeWidth="11" strokeLinecap="round" fill="none"/>
      {/* Cat head */}
      <circle cx="268" cy="202" r="22" fill="#F8D7A0"/>
      {/* Ears */}
      <path d="M255,190 Q250,173 262,182Z" fill="#F8D7A0"/>
      <path d="M281,190 Q286,173 274,182Z" fill="#F8D7A0"/>
      <path d="M256,190 Q252,177 263,184Z" fill="#FCA5A5"/>
      <path d="M280,190 Q284,177 273,184Z" fill="#FCA5A5"/>
      {/* Cat face looking at doc */}
      <circle cx="261" cy="200" r="3.5" fill="#1C1917"/>
      <circle cx="275" cy="200" r="3.5" fill="#1C1917"/>
      <circle cx="262" cy="198.5" r="1.2" fill="white"/>
      <circle cx="276" cy="198.5" r="1.2" fill="white"/>
      <path d="M268,207 L265,210 L271,210Z" fill="#E05252"/>
      {/* Front paws on clipboard */}
      <ellipse cx="248" cy="228" rx="14" ry="8" fill="#F8D7A0"/>
      <ellipse cx="278" cy="230" rx="14" ry="8" fill="#F8D7A0"/>

      {/* ── PERSON (holding clipboard, reading) ── */}
      {/* Legs (standing) */}
      <path d="M133,220 Q128,232 126,245" stroke="#F97316" strokeWidth="20" strokeLinecap="round" fill="none"/>
      <path d="M153,222 Q152,234 151,245" stroke="#F97316" strokeWidth="20" strokeLinecap="round" fill="none"/>
      {/* Body */}
      <rect x="120" y="158" width="52" height="70" rx="13" fill="#059669"/>
      {/* Left arm (holding clipboard from below) */}
      <path d="M121,175 Q105,192 108,218" stroke="#059669" strokeWidth="18" strokeLinecap="round" fill="none"/>
      <circle cx="108" cy="220" r="9" fill="#FBBF24"/>
      {/* Right arm (pointing at doc) */}
      <path d="M170,175 Q188,178 200,165" stroke="#059669" strokeWidth="18" strokeLinecap="round" fill="none"/>
      <circle cx="202" cy="162" r="9" fill="#FBBF24"/>
      {/* Neck */}
      <rect x="135" y="142" width="18" height="18" rx="5" fill="#FBBF24"/>
      {/* Head */}
      <circle cx="144" cy="127" r="28" fill="#FBBF24"/>
      {/* Hair */}
      <path d="M116,122 Q118,84 144,82 Q170,84 172,119 Q165,94 144,92 Q123,94 116,122Z" fill="#1C1917"/>
      {/* Eyes (focused/reading) */}
      <circle cx="135" cy="126" r="4" fill="#1C1917"/>
      <circle cx="154" cy="126" r="4" fill="#1C1917"/>
      <circle cx="136.3" cy="124.5" r="1.4" fill="white"/>
      <circle cx="155.3" cy="124.5" r="1.4" fill="white"/>
      {/* Slight smile */}
      <path d="M136,139 Q144,146 153,139" stroke="#92400E" strokeWidth="2.3" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

// ── 6. SETTINGS PAGE ─── Warm tangerine, person cuddling large cat ────────────
export const SETTINGS_COLOR = '#EA580C';
export function SettingsScene({ style }: SceneProps) {
  return (
    <svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block', ...style }}>
      <rect width="400" height="260" fill="#EA580C"/>
      {/* Warm glow */}
      <circle cx="200" cy="260" r="180" fill="#F97316" opacity="0.4"/>
      <circle cx="350" cy="40" r="60" fill="#FB923C" opacity="0.5"/>

      {/* Ground / floor */}
      <rect x="0" y="228" width="400" height="32" fill="#C2440A"/>
      <ellipse cx="200" cy="228" rx="210" ry="14" fill="#D04D0C"/>

      {/* Cozy cushion */}
      <ellipse cx="185" cy="236" rx="100" ry="22" fill="#FB923C"/>
      <ellipse cx="185" cy="230" rx="92" ry="14" fill="#FDBA74"/>

      {/* Leaf/plant decoration */}
      <path d="M30,228 Q40,195 55,210 Q45,220 30,228Z" fill="#16A34A" opacity="0.7"/>
      <path d="M25,228 Q28,198 18,215 Q22,222 25,228Z" fill="#15803D" opacity="0.7"/>
      <path d="M370,228 Q360,200 348,215 Q358,220 370,228Z" fill="#16A34A" opacity="0.7"/>
      <path d="M375,228 Q374,200 384,215 Q380,222 375,228Z" fill="#15803D" opacity="0.7"/>

      {/* ── LARGE FLUFFY CAT ── */}
      {/* Big body */}
      <ellipse cx="220" cy="205" rx="75" ry="50" fill="#FEF3C7"/>
      <ellipse cx="200" cy="195" rx="60" ry="38" fill="white"/>
      {/* Fluffy chest */}
      <ellipse cx="210" cy="192" rx="40" ry="30" fill="white"/>
      {/* Cat head (large) */}
      <circle cx="228" cy="155" r="45" fill="#FEF3C7"/>
      <circle cx="225" cy="150" r="38" fill="white"/>
      {/* Pointy ears */}
      <path d="M196,127 Q188,98 210,115Z" fill="#FEF3C7"/>
      <path d="M256,127 Q264,98 242,115Z" fill="#FEF3C7"/>
      <path d="M197,128 Q190,105 210,118Z" fill="#FCA5A5"/>
      <path d="M255,128 Q262,105 242,118Z" fill="#FCA5A5"/>
      {/* Cat face (big eyes, happy) */}
      <circle cx="212" cy="150" r="7" fill="#1C1917"/>
      <circle cx="238" cy="150" r="7" fill="#1C1917"/>
      <circle cx="214" cy="147" r="2.5" fill="white"/>
      <circle cx="240" cy="147" r="2.5" fill="white"/>
      {/* Cat nose */}
      <path d="M225,162 L221,167 L229,167Z" fill="#E05252"/>
      {/* Smile lines */}
      <path d="M221,167 Q218,172 214,172" stroke="#E05252" strokeWidth="1.5" fill="none"/>
      <path d="M229,167 Q232,172 236,172" stroke="#E05252" strokeWidth="1.5" fill="none"/>
      {/* Whiskers */}
      {[[-1,1],[-2,0],[-1,-1],[1,1],[2,0],[1,-1]].map(([dx,dy],i)=>(
        <line key={i} x1={225+dx*2} y1={164+dy*2} x2={225+(i<3?-35:35)+dx*2} y2={164+dy*3} stroke="#78716C" strokeWidth="1.3" opacity="0.7"/>
      ))}
      {/* Cat paws */}
      <ellipse cx="160" cy="228" rx="28" ry="14" fill="#FEF3C7"/>
      <ellipse cx="278" cy="230" rx="28" ry="14" fill="#FEF3C7"/>
      {/* Toe lines */}
      {[-8,0,8].map((dx,i)=>(
        <path key={i} d={`M${160+dx},221 Q${160+dx},228 ${160+dx},232`} stroke="#FCA5A5" strokeWidth="2" strokeLinecap="round" fill="none"/>
      ))}
      {/* Cat tail */}
      <path d="M295,220 Q318,195 310,170 Q302,148 286,162" stroke="#FEF3C7" strokeWidth="16" strokeLinecap="round" fill="none"/>

      {/* ── PERSON (sitting beside cat, arm around it) ── */}
      {/* Legs */}
      <path d="M108,218 Q100,228 98,238" stroke="#2563EB" strokeWidth="20" strokeLinecap="round" fill="none"/>
      <path d="M128,222 Q126,232 124,240" stroke="#2563EB" strokeWidth="20" strokeLinecap="round" fill="none"/>
      {/* Body */}
      <rect x="93" y="160" width="50" height="66" rx="13" fill="#2563EB"/>
      {/* Left arm (at side) */}
      <path d="M94,178 Q76,194 74,215" stroke="#2563EB" strokeWidth="18" strokeLinecap="round" fill="none"/>
      {/* Right arm (around cat) */}
      <path d="M142,175 Q162,170 175,178 Q190,190 188,210" stroke="#2563EB" strokeWidth="18" strokeLinecap="round" fill="none"/>
      {/* Neck */}
      <rect x="107" y="144" width="18" height="18" rx="5" fill="#FBBF24"/>
      {/* Head */}
      <circle cx="116" cy="129" r="28" fill="#FBBF24"/>
      {/* Hair */}
      <path d="M88,124 Q90,86 116,84 Q142,86 144,121 Q137,96 116,94 Q95,96 88,124Z" fill="#1C1917"/>
      {/* Eyes (warm, happy) */}
      <path d="M105,128 Q109,123 114,127" stroke="#1C1917" strokeWidth="2.8" fill="none" strokeLinecap="round"/>
      <path d="M118,127 Q122,122 127,126" stroke="#1C1917" strokeWidth="2.8" fill="none" strokeLinecap="round"/>
      {/* Big smile */}
      <path d="M105,141 Q116,151 128,141" stroke="#92400E" strokeWidth="2.8" fill="none" strokeLinecap="round"/>

      {/* Floating hearts */}
      <text x="310" y="95" fontSize="24" opacity="0.85">❤️</text>
      <text x="340" y="65" fontSize="18" opacity="0.7">🐱</text>
      <text x="55" y="85" fontSize="20" opacity="0.65">✨</text>
      <text x="75" y="55" fontSize="16" opacity="0.55">🏠</text>
    </svg>
  );
}

// ── Reusable colored page header with illustration ────────────────────────────
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  color: string;
  children: React.ReactNode; // the Scene component
}
export function PageHeader({ title, subtitle, color, children }: PageHeaderProps) {
  return (
    <div style={{
      position: 'relative', height: 210, overflow: 'hidden',
      borderRadius: '0 0 28px 28px',
      marginBottom: 20, marginLeft: -16, marginRight: -16,
      background: color,
    }}>
      {children}
      <div style={{ position: 'absolute', top: 20, left: 20, right: 20 }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 5 }}>{subtitle}</div>
        )}
      </div>
    </div>
  );
}
