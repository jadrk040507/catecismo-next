---
version: alpha
name: Catecismo
description: Catholic formation platform — Notion-minimal premium edtech with pastoral sobriety. Bilingual (ES/EN), open library + private classroom/LMS.
colors:
  primary: "#37352F"
  secondary: "#787774"
  tertiary: "#B4B2AB"
  neutral: "#F7F6F3"
  surface: "#FFFFFF"
  border: "#E8E7E4"
  border-light: "#EDECE9"
  hover: "#F1F0EC"
  active: "#EBE9E5"
  accent: "#2EAADC"
  accent-soft: "#E7F5FB"
  red: "#E03E3E"
  red-soft: "#FDE8E8"
  green: "#0F7B4E"
  green-soft: "#E6F4EC"
  amber: "#AB6A0A"
  amber-soft: "#FEF5E7"
  papal: "#9B7A2E"
typography:
  h1:
    fontFamily: Inter
    fontSize: 2.25rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  h2:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  h3:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.4
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.7
  body-md:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.7
  body-sm:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.6
  caption:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.02em"
  label:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.05em"
    textTransform: uppercase
  mono:
    fontFamily: "SFMono-Regular", "Menlo", monospace
    fontSize: 0.8125rem
    fontWeight: 400
    lineHeight: 1.5
rounded:
  xs: 3px
  sm: 5px
  md: 8px
  lg: 12px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: 10px 20px
  button-primary-hover:
    backgroundColor: "#2D2B26"
  button-secondary:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: 10px 20px
  button-secondary-hover:
    backgroundColor: "{colors.hover}"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.red}"
    rounded: "{rounded.md}"
    padding: 10px 20px
  button-danger-hover:
    backgroundColor: "{colors.red-soft}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: 20px
    borderColor: "{colors.border-light}"
  card-hover:
    borderColor: "{colors.border}"
    shadow: "0 1px 3px rgba(0,0,0,0.04)"
  callout:
    backgroundColor: "{colors.neutral}"
    rounded: "{rounded.md}"
    padding: 16px 20px
    borderLeft: 3px solid "{colors.primary}"
  callout-accent:
    borderLeft: 3px solid "{colors.accent}"
    backgroundColor: "{colors.accent-soft}"
  callout-amber:
    borderLeft: 3px solid "{colors.amber}"
    backgroundColor: "{colors.amber-soft}"
  callout-green:
    borderLeft: 3px solid "{colors.green}"
    backgroundColor: "{colors.green-soft}"
  callout-red:
    borderLeft: 3px solid "{colors.red}"
    backgroundColor: "{colors.red-soft}"
  badge:
    rounded: "{rounded.sm}"
    padding: 2px 8px
    typography: "{typography.caption}"
  sidebar:
    width: 240px
    backgroundColor: "{colors.neutral}"
  topbar:
    height: 48px
    backgroundColor: "rgba(255,255,255,0.82)"
    backdropFilter: blur(12px)
  input:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: 10px 14px
    borderColor: "{colors.border}"
  input-focus:
    borderColor: "{colors.accent}"
  modal:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    shadow: "0 8px 30px rgba(0,0,0,0.12)"
  progress-bar:
    rounded: "{rounded.xs}"
    height: 6px
    backgroundColor: "{colors.border-light}"
  progress-fill:
    backgroundColor: "{colors.accent}"
  tts-player:
    backgroundColor: "{colors.neutral}"
    rounded: "{rounded.md}"
---

## Overview

Catecismo is a Catholic formation platform combining an open public library with a private classroom/LMS. The visual identity is **Notion-minimal premium edtech** — clean, functional, professional — with a **pastoral, sobriety** tone. No liturgical aesthetics, no baroque, no gold gradients, no serif fonts, no children's illustrations.

The platform serves:
- **Students** — learning, progress, quizzes, gamification
- **Catechists** — class management, assignments, student tracking
- **Parents/Tutors** — child progress monitoring
- **Parish/Institution Admins** — user management, analytics
- **Super Admins** — full platform control

Everything is bilingual (Spanish/English) with seamless language switching.

## Colors

- **Primary (#37352F):** Deep warm black — headings, primary text, primary buttons. Not blue, not purple.
- **Neutral (#F7F6F3):** Warm off-white — page backgrounds, sidebar, secondary surfaces.
- **Surface (#FFFFFF):** Pure white — cards, modals, content areas on neutral backgrounds.
- **Accent (#2EAADC):** The single interactive accent — links, progress, active states, focus rings. Used sparingly, never as a background fill for large areas.
- **Papal (#9B7A2E):** Reserved exclusively for achievement badges and gamification icons. NOT as a primary or decorative accent.
- **Red/Green/Amber:** Status colors only. Red = errors, destructive. Green = success, completion. Amber = warnings, streak indicators.

**Rejected colors:** Gold as primary, purple, royal blue, any liturgical color scheme, parchment, cream with brown tones.

## Typography

Inter is the **only** font family. No serif, no display font, no monospace for body text. Weight range: 400–700.

- Headings use tight letter-spacing (-0.02em to -0.01em) for a refined, professional feel.
- Body uses generous line-height (1.7) for readability of catechetical content.
- Labels use uppercase with wide tracking — used for metadata, table headers, status indicators.
- Mono is only for code-style elements (invite codes, technical IDs).

## Layout & Spacing

- **Content pages:** max-width 720px, centered, horizontal padding 24px.
- **Dashboard content:** max-width 860px, centered.
- **Public library pages:** max-width 960px for index/database views.
- **Sidebar:** 240px fixed on desktop, drawer on mobile (≤768px).
- **Spacing scale:** 4/8/16/24/32/48px. Generous whitespace between sections.
- **Mobile:** single column, reduced padding (16px), stacked layouts.

## Elevation & Depth

- **Default:** No shadow. Borders only (1px solid var(--border-light)).
- **Hover:** Minimal shadow (0 1px 3px rgba(0,0,0,0.04)) + border darkens to var(--border).
- **Modals:** 0 8px 30px rgba(0,0,0,0.12) — the only elevated element.
- **Sticky headers:** background blur (12px) + white at 82% opacity — no shadow.

**No colored shadows, no glowing borders, no glass morphism.**

## Shapes

- **XS (3px):** Badges, small inline elements
- **SM (5px):** Buttons in tight contexts
- **MD (8px):** Cards, inputs, modals, default
- **LG (12px):** Large feature cards, modals on mobile

**No full-rounding.** No pill-shaped cards. No circular buttons (except avatars).

## Components

### Button
Two primary weights: **Primary** (dark bg, white text) and **Secondary** (neutral bg, dark text). Danger uses red text on transparent bg with red-soft hover. All buttons: 0.15s transitions on background + border.

### Card
Surface bg + border-light. On hover: border darkens + minimal shadow. No gradients, no inner shadows, no decorative patterns.

### Callout
Four variants: neutral (dark left border, neutral bg), accent (blue), amber (warning/streak), green (success), red (error). Used for:
- Key ideas, doctrinal definitions
- Scripture quotes, Catechism references
- Practical examples, reflections
- Teacher notes, warnings

### Modal
Surface bg, 12px radius, centered with overlay backdrop. On mobile (≤480px): bottom sheet with rounded top corners. Slide-up animation (0.2s).

### TTS Player
Neutral bg, 8px radius. Three states: idle (🔊 label), playing (⏸ + progress), paused (▶). Speed selector. Voice selector (ES/EN). Highlights current paragraph during playback.

### Language Switcher
Pill toggle with ES | EN. Active side has primary bg, white text. Inactive side is neutral bg. Always visible in header and within lesson pages.

### Breadcrumb
Inline text, `→` separators. Muted text, current page in primary. On lesson pages: Home → Topic → Lesson.

## Do's and Don'ts

**Do:**
- Use Inter exclusively, weights 400–700
- Use whitespace generously — let content breathe
- Use border-light for subtle separation
- Use accent sparingly for interactive elements
- Use callouts with semantic color variants
- Use consistent 8px border radius
- Use mobile-first responsive patterns

**Don't:**
- Use serif fonts (Cormorant Garamond, Playfair Display)
- Use gold as a primary or decorative color
- Use gradients on backgrounds or buttons
- Use colored shadows or glow effects
- Use wave SVG dividers between sections
- Use parchment, cream, or brown tones as backgrounds
- Use religious icons or liturgical imagery as decorative elements
- Use rounded-2xl or full-rounding on cards
- Use initial drop caps or illuminated manuscript effects