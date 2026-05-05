# Design Research: catecismo.kipadmon.com → Minimalist Redesign

## Reference: new.kipadmon.com Design System

### Design Tokens Extracted
```css
:root {
  --black: #0A0A0A;
  --white: #FAFAFA;
  --gray-50: #F5F5F5;
  --gray-100: #EBEBEB;
  --gray-200: #D4D4D4;
  --gray-300: #B8B8B8;
  --gray-400: #8C8C8C;
  --gray-500: #6B6B6B;
  --gray-600: #4A4A4A;
  --gray-700: #2D2D2D;
  --gray-800: #1A1A1A;
  --gray-900: #0D0D0D;
  
  --font-display: 'Syne', sans-serif;     /* headings, tags, numbers */
  --font-body: 'Plus Jakarta Sans', sans-serif; /* body text, UI */
  
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}
```

### Key Design Patterns
- **Typography**: Display font (Syne) for headlines with extreme tight letter-spacing (-0.03em), body font (Plus Jakarta Sans) at 16px/1.6
- **Hero**: Full-bleed dark background, large clamp() headings, ghost/outline CTAs
- **Cards**: gap:2px grid with light borders, hover lift + top-accent-line animation
- **Spacing**: Generous (120px sections, 80px gaps), 48px padding on mobile
- **Colors**: Mono grayscale only — no blue/amber accents visible
- **Mobile**: Aggressive simplification at 768px, column stacking, full-width CTAs
- **Animations**: .reveal with translateY(40px) + fade, stagger delays 0.15s increments
- **Borders**: 1px solid gray-200 dividers, no border-radius (architectural)
- **Grain overlay**: SVG fractalNoise at 3% opacity for texture

## Design Changes for Catecismo

### What to KEEP (宗教特色)
- Warm cream/gold/burgundy palette (Notion base + liturgical warmth)
- Emoji icons (📖 🕊 🔥 🙏) — they work wel for edtech
- Rounded corners (edtech friendly, vs kipadmon's architectural sharp)
- The catechetical content structure (4 pillars → lessons → quizzes)

### What to BORROW from kipadmon.com
1. **Typography hierarchy**: Tighter letter-spacing on h1 (-0.02em → -0.03em), larger hero
2. **Plus Jakarta Sans** as body font (upgrade from plain Inter)
3. **Generous section spacing** (32px → 80px+ between sections)
4. **Hover patterns**: Card lift + top-line accent animation on hover
5. **Reveal animations**: Swap current fade-up for more dramatic translateY(40px)+opacity
6. **Grain overlay**: Subtle SVG noise at 3% for texture/profundity
7. **Tag system**: Small uppercase labels with dash line before section titles
8. **Mobile-first**: 24px padding, full-width CTAs, stacked cards >1 column

### What to IMPROVE for Mobile
1. Hero: clamp() already done, but increase mobile padding (24px→28px)
2. Topic grid: Add gap:12px on mobile (currently 16px tight)
3. Cards: Add tap highlight + subtle scale(1.01) on active
4. Bottom nav: Increase item spacing on wider phones
5. Search: Larger touch target, magnifying-glass icon as SVG not emoji
6. Dashboard sidebar: Overlay panel from left on mobile (drawer pattern)
7. Lesson content: Better paragraph spacing, tap-friendly callouts
8. Fonts: Reduce heading sizes on <375px screens (iPhone SE, old Androids)

## Priority Changes
1. 🔴 Swap body font → Plus Jakarta Sans
2. 🔴 Increase heading letter-spacing tightness
3. 🟡 Add grain texture overlay
4. 🟡 Increase section spacing (hero→content gap)
5. 🟡 Card hover: lift + top-line accent
6. 🟡 Add .tag small labels before sections
7. 🟢 Mobile: tap-feedback on cards, better <375px support
8. 🟢 Search: SVG icon, bigger touch target
9. 🟢 Dashboard sidebar mobile drawer