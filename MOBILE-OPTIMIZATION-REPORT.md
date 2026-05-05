# Catecismo Digital — Mobile Optimization Report

**Date:** May 2026  
**Site:** catecismo.kipadmon.com  
**Target viewports:** 375px (iPhone SE), 390px (iPhone 14/15), 412px (Pixel 7), 430px (iPhone Pro Max)  
**Stack:** Next.js + Tailwind v4 + custom CSS (globals.css + dashboard.css)

---

## 1. CURRENT STATE ANALYSIS

### 1.1 Existing Breakpoints

| File | Breakpoint | What it does |
|------|-----------|-------------|
| `globals.css` | ≤768px | `.topic-grid` → 2 cols; `.feature-grid` → 1 col; `.bottom-nav` → flex |
| `globals.css` | ≤480px | `.topic-grid` → 1 col; `.magisterium-fab` → icon-only, bottom: 80px; `.magisterium-panel` → bottom sheet |
| `dashboard.css` | ≤768px | Sidebar slide-out; overlay; main margin-left: 0; topbar menu visible; content padding reduced |
| `dashboard.css` | ≤640px | Table → card layout via `data-label` + `::before`; `.db-section-grid.cols-2` → 1fr |
| `dashboard.css` | ≤480px | Modal → bottom sheet (border-radius top, full width) |

**Missing breakpoints:** No ≤375px or ≤430px specific handling. The gap between 480px and 640px has no intermediate step.

### 1.2 Existing Safe-Area Handling

**Only ONE instance** of `env(safe-area-inset-bottom)` exists:
- `.bottom-nav` in globals.css line 912: `padding: 8px 0 calc(8px + env(safe-area-inset-bottom))`

**Missing safe-area handling for:**
- `.db-topbar` (top notch)
- `.db-sidebar` (left safe area on landscape)
- `.db-modal` / `.db-overlay` (bottom sheet needs left/right safe area)  
- `.magisterium-fab` (bottom/right safe area)
- `.magisterium-panel` header close button area
- Toast notifications

### 1.3 Viewport Meta Tag

The viewport meta tag is the standard: `<meta name="viewport" content="width=device-width, initial-scale=1">`  

**Missing:** `viewport-fit=cover` — required for `env(safe-area-inset-*)` to work on notched iPhones. Without this, safe-area values are always 0.

---

## 2. SPECIFIC ISSUES BY VIEWPORT

### 2.1 iPhone SE (375×667)

| Issue | Severity | Location |
|-------|----------|----------|
| **Hero title overflow**: `.home-hero h1` at 2.5rem (40px) with "Catecismo" can overflow on 375px with side padding | 🔴 High | globals.css:165 |
| **Search-box input too narrow**: 480px max-width irrelevant; actual 375-48px padding = 327px, but search icon at 14px + 44px padding-left leaves tiny tap target | 🟡 Medium | globals.css:184-195 |
| **Login CTA stack**: `.login-cta` is `justify-content: space-between` but at 375px the text + button fight for space, text gets crushed | 🔴 High | globals.css:539-570 |
| **Dashboard stat-row**: `minmax(120px, 1fr)` gives 2 columns at most on 375px, but each stat-item only gets ~164px — values like "Catequistas" (label) can truncate | 🟡 Medium | dashboard.css:501 |
| **Sidebar items too short**: `.db-sidebar-item` has only `padding: 6px 10px` → tap height ~28px, below Apple's 44px minimum | 🔴 High | dashboard.css:73-81 |
| **Quiz options**: `padding: 12px 16px` → ~40px tap target height, borderline for fat fingers at 375px | 🟡 Medium | globals.css:652-664 |
| **Bottom nav items**: `padding: 4px 8px` → total ~24px tap height, far below 44px minimum | 🔴 High | globals.css:918-932 |
| **Topbar height 44px**: This is right at the minimum — but with notch safe-area inset top NOT applied, content sits under the notch | 🟡 Medium | dashboard.css:118 |
| **Lang-switcher tap targets**: `padding: 4px 12px` → ~22px tap height | 🔴 High | globals.css:272-301 |
| **Topic-row at 375px**: `.topic-row-meta` (flex-shrink:0) + gap:16px + 2 spans means meta gets pushed or wraps awkwardly | 🟡 Medium | globals.css:367-431 |

### 2.2 iPhone 14/15 (390×844)

| Issue | Severity | Location |
|-------|----------|----------|
| **Same as iPhone SE** but slightly more room — hero title fits, but all touch-target issues remain | — | Same |
| **Dynamic Island notch**: `env(safe-area-inset-top)` ≈ 59px, but topbar uses `position: sticky; top: 0` with no safe-area offset | 🔴 High | dashboard.css:115-121 |
| **Home indicator**: `env(safe-area-inset-bottom)` ≈ 34px — only bottom-nav handles it; scrollable content hits home indicator bar | 🔴 High | Multiple |

### 2.3 Pixel 7 (412×915)

| Issue | Severity | Location |
|-------|----------|----------|
| **Mostly fine** at 412px — stat-row gives 3 columns, cards are comfortable | — | — |
| **Android safe area**: Not as critical since no notch, but gesture navigation bar can overlap bottom-nav | 🟡 Medium | — |
| **db-content max-width: 960px** means wide empty margins at 412px — not terrible but could use optimized padding | 🟢 Low | dashboard.css:132-134 |

### 2.4 iPhone Pro Max (430×932)

| Issue | Severity | Location |
|-------|----------|----------|
| **Generally comfortable** — most layouts work well at 430px | — | — |
| **Safe-area same issues** as iPhone 14/15 with notch + home indicator | 🔴 High | Same |
| **Landscape mode**: Unhandled — sidebar drawer in landscape has no width constraint, can cover 70%+ of screen | 🟡 Medium | — |

---

## 3. CSS CODE FIXES

### 3.1 Viewport Meta — Enable Safe Areas

**File:** `src/app/layout.tsx` (or next metadata config)

```tsx
// In next.config or layout metadata:
export const metadata: Metadata = {
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",  // ← CRITICAL: enables env(safe-area-inset-*)
  },
};
```

Or in a `<head>` override if using a custom document.

### 3.2 Global Safe-Area CSS Custom Properties

**Add to `globals.css` after `@theme { }` block:**

```css
/* === Safe Area (notched phones) === */
@supports (padding: max(0px)) {
  :root {
    --safe-top: env(safe-area-inset-top);
    --safe-bottom: env(safe-area-inset-bottom);
    --safe-left: env(safe-area-inset-left);
    --safe-right: env(safe-area-inset-right);
  }
}
```

### 3.3 Topbar Safe-Area Fix

**File:** `dashboard.css`

```css
.db-topbar {
  position: sticky; top: 0; z-index: 20;
  display: flex; align-items: center;
  height: 44px; padding: 0 24px;
  /* ADD: */
  padding-top: env(safe-area-inset-top);      /* ← notch offset */
  padding-left: calc(24px + env(safe-area-inset-left));
  padding-right: calc(24px + env(safe-area-inset-right));
  background: rgba(255,255,255,0.85); backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border-light);
}
```

### 3.4 Public Site Header Safe-Area

**File:** `Header.tsx` — update inline styles:

```tsx
<header className="site-header" style={{
  position: "sticky", top: 0, zIndex: 50,
  paddingTop: "env(safe-area-inset-top)",    // ← ADD
  paddingLeft: "calc(24px + env(safe-area-inset-left))",   // ← ADD
  paddingRight: "calc(24px + env(safe-area-inset-right))", // ← ADD
  // ...existing styles
}}>
```

Or better, move to CSS classes in `globals.css`:

```css
.site-header {
  padding-top: env(safe-area-inset-top);
  padding-left: calc(24px + env(safe-area-inset-left));
  padding-right: calc(24px + env(safe-area-inset-right));
}
```

### 3.5 Fix Bottom Navigation Touch Targets

**File:** `globals.css`

```css
.bottom-nav-item {
  display: flex; flex-direction: column; align-items: center;
  gap: 2px;
  padding: 8px 12px;                    /* was: 4px 8px */
  min-width: 48px;                       /* ← ADD: ensures ≥48px tap width */
  min-height: 44px;                      /* ← ADD: Apple HIG minimum */
  font-size: 0.625rem;
  font-weight: 500;
  color: var(--color-tertiary);
  text-decoration: none;
  transition: color 0.15s;
}
```

### 3.6 Fix Sidebar Item Touch Targets

**File:** `dashboard.css`

```css
.db-sidebar-item {
  display: flex; align-items: center; gap: 8px; width: 100%;
  padding: 10px 10px;                 /* was: 6px 10px — adds 4px each side = ~44px tap height */
  border-radius: var(--radius-sm);
  border: none; background: none;
  font-size: 13px; font-weight: 450; color: var(--color-secondary);
  cursor: pointer; text-align: left; font-family: var(--font-sans);
  transition: background 0.1s; text-decoration: none;
  line-height: 1.5;
  min-height: 44px;                     /* ← ADD: explicit minimum */
}
```

### 3.7 Fix Login CTA on Small Screens

**File:** `globals.css`

```css
@media (max-width: 480px) {
  .login-cta {
    flex-direction: column;              /* ← stack vertically */
    align-items: stretch;                /* ← full-width children */
    gap: 12px;
    text-align: center;
  }
  .login-cta p { margin-bottom: 0; }
  .login-cta a { width: 100%; justify-content: center; }
}
```

### 3.8 Fix Hero Title Scaling

**File:** `globals.css`

```css
.home-hero h1 {
  font-size: 2.5rem;                     /* 40px — desktop */
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin-bottom: 16px;
}

@media (max-width: 480px) {
  .home-hero h1 {
    font-size: clamp(1.75rem, 8vw, 2.5rem);   /* ← fluid: 28px–40px */
  }
  .home-hero {
    padding: 40px 20px 32px;             /* reduced from 64/24/48 */
  }
  .home-hero p {
    font-size: 1rem;                     /* was 1.125rem, slightly smaller on mobile */
  }
}
```

### 3.9 Fix Lang Switcher Touch Targets

**File:** `globals.css`

```css
.lang-switcher a,
.lang-switcher button {
  padding: 8px 14px;                      /* was: 4px 12px → now ~32px tap height, closer to 44px */
  font-size: 0.75rem;
  font-weight: 600;
  min-height: 32px;                       /* ← ADD */
  min-width: 40px;                        /* ← ADD: each button needs decent width */
  color: var(--color-secondary);
  text-decoration: none;
  transition: all 0.15s;
  border: none; background: none; cursor: pointer;
}
```

### 3.10 Fix Dashboard Stat Row for iPhone SE

**File:** `dashboard.css`

```css
/* Existing at ≤768px: */
@media (max-width: 768px) {
  .db-stat-row { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
}

/* ADD new smaller breakpoint: */
@media (max-width: 380px) {
  .db-stat-row { 
    grid-template-columns: 1fr 1fr;     /* force 2 cols on iPhone SE */
    gap: 6px;
  }
  .db-stat-item { padding: 14px 16px; }  /* slightly tighter */
  .db-stat-val { font-size: 22px; }     /* was 26px */
}
```

### 3.11 Fix Topic Row on Narrow Screens

**File:** `globals.css`

```css
@media (max-width: 480px) {
  .topic-row {
    flex-wrap: wrap;
    gap: 8px;                           /* was 16px */
    padding: 14px 16px;                  /* was 16px 20px */
  }
  .topic-row-meta {
    width: 100%;                         /* ← force meta to its own line */
    gap: 8px;
    margin-top: 4px;
  }
  .topic-row-num {
    width: 28px; height: 28px;           /* was 32px, slightly smaller */
    font-size: 0.75rem;
  }
}
```

### 3.12 Fix Quiz Option Touch Targets

**File:** `globals.css`

```css
@media (max-width: 480px) {
  .quiz-option {
    padding: 14px 16px;                 /* was 12px 16px → ~46px min tap height */
    min-height: 44px;                    /* ← ADD: explicit minimum */
  }
  .quiz-question {
    font-size: 1rem;                     /* was 1.125rem, slightly smaller */
  }
}
```

### 3.13 Fix Magisterium FAB Safe Area

**File:** `globals.css`

```css
.magisterium-fab {
  position: fixed;
  bottom: calc(24px + env(safe-area-inset-bottom));   /* ← safe area aware */
  right: calc(24px + env(safe-area-inset-right));     /* ← safe area aware */
  z-index: 9998;
  /* ... existing styles ... */
}

@media (max-width: 480px) {
  .magisterium-fab {
    padding: 14px;
    gap: 0;
    bottom: calc(76px + env(safe-area-inset-bottom)); /* was 80px, now accounts for safe area */
    right: calc(16px + env(safe-area-inset-right));
  }
}
```

### 3.14 Fix Modal/Bottom Sheet Safe Area

**File:** `dashboard.css`

```css
@media (max-width: 480px) {
  .db-overlay { align-items: flex-end; }
  .db-modal {
    max-width: 100%; width: 100%;
    border-radius: 12px 12px 0 0;
    padding: 20px 18px calc(24px + env(safe-area-inset-bottom)); /* ← ADD safe-area bottom */
    max-height: 80vh;
  }
  /* Add drag handle for bottom sheet UX: */
  .db-modal::before {
    content: '';
    display: block;
    width: 36px; height: 4px;
    border-radius: 2px;
    background: var(--color-border);
    margin: 0 auto 16px;
  }
}
```

### 3.15 Add Bottom Padding for Content (Home Indicator)

**File:** `dashboard.css` and `globals.css`

```css
/* Dashboard content — prevent content from hiding behind bottom nav + home indicator */
@media (max-width: 768px) {
  .db-content {
    padding: 20px 16px calc(48px + env(safe-area-inset-bottom)); /* ← was 48px fixed */
  }
}

/* Public page lesson content */
.lesson-page {
  padding-bottom: calc(80px + env(safe-area-inset-bottom)); /* extra for bottom-nav */
}
```

### 3.16 Fix Dashboard Content Padding on iPhone SE

**File:** `dashboard.css`

```css
@media (max-width: 380px) {
  .db-content {
    padding: 16px 12px calc(48px + env(safe-area-inset-bottom));
  }
  .db-content h1 {
    font-size: 20px;                     /* was 24px */
  }
}
```

---

## 4. NAVIGATION PATTERN RECOMMENDATIONS

### 4.1 Current: Sidebar Drawer (Good — Needs Refinement)

The existing drawer pattern works. Improvements needed:

1. **Swipe-to-close gesture**: The sidebar has no swipe gesture — only the overlay click closes it. Add touch swipe-left to close:
   ```tsx
   // Add to DashboardPage.tsx sidebar nav element:
   const touchStart = useRef(0);
   <nav
     className={`db-sidebar${sidebarOpen ? " open" : ""}`}
     onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
     onTouchEnd={(e) => {
       const delta = touchStart.current - e.changedTouches[0].clientX;
       if (delta > 50) setSidebarOpen(false);  // swipe left to close
     }}
   >
   ```

2. **Sidebar width on mobile**: Currently fixed at 240px. On 375px screens that's 64% of viewport. Consider:
   ```css
   @media (max-width: 480px) {
     .db-sidebar {
       width: min(280px, 80vw);  /* cap at 80% of viewport */
     }
   }
   ```

3. **Body scroll lock when sidebar is open**: Currently missing — users can scroll the background while the overlay is showing:
   ```tsx
   // Add to DashboardPage.tsx:
   useEffect(() => {
     document.body.style.overflow = sidebarOpen ? 'hidden' : '';
     return () => { document.body.style.overflow = ''; };
   }, [sidebarOpen]);
   ```

### 4.2 Bottom Navigation (Needs Role-Based Items)

Currently shows on ≤768px but the code doesn't define specific nav items — it appears unused or generic. For an edtech app:

**Recommended bottom nav items by role:**

| Role | Tab 1 | Tab 2 | Tab 3 | Tab 4 |
|------|-------|-------|-------|-------|
| Student | Home | My Classes | Progress | Achievements |
| Parent | Home | My Children | — | — |
| Catechist | Dashboard | Classes | — | — |
| Admin | Overview | Users | Analytics | Settings |

**Implementation:**
```tsx
// Add to DashboardPage.tsx:
const bottomNavItems = (() => {
  if (isStudent && !isCatechist) {
    return [
      { tab: "overview", icon: <Sparkles />, label: t("myLearning") },
      { tab: "my-classes", icon: <BookOpen />, label: t("myClasses") },
      { tab: "progress", icon: <BarChart3 />, label: t("progress") },
      { tab: "achievements", icon: <Trophy />, label: t("achievements") },
    ];
  }
  if (isParent && !isCatechist) {
    return [
      { tab: "overview", icon: <Home />, label: t("overview") },
      { tab: "my-children", icon: <Heart />, label: t("myChildren") },
    ];
  }
  // Admin/Catechist — more items
  return [
    { tab: "overview", icon: <LayoutDashboard />, label: t("overview") },
    { tab: "classes", icon: <School />, label: t("classes") },
    { tab: "analytics", icon: <BarChart3 />, label: t("analytics") },
    { tab: "settings", icon: <Settings />, label: t("settings") },
  ];
})();
```

**Render:**
```tsx
<nav className="bottom-nav">
  {bottomNavItems.map(item => (
    <button
      key={item.tab}
      className={`bottom-nav-item${tab === item.tab ? " active" : ""}`}
      onClick={() => setTab(item.tab as Tab)}
    >
      {item.icon}
      {item.label}
    </button>
  ))}
</nav>
```

### 4.3 Public Site Header Mobile Nav

Current: simple toggle dropdown. **Issues:**
- No animation (just appears/disappears)
- No body scroll lock
- Tap targets are OK at `padding: 12px 16px` (~40px)

**Recommended:**
```css
/* Add slide-down animation to mobile nav */
.site-header-mobile-nav {
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.25s var(--ease-out), padding 0.25s var(--ease-out);
}
.site-header-mobile-nav.open {
  max-height: 300px; /* enough for 5 items */
}
```

---

## 5. TOUCH TARGET SIZES — COMPREHENSIVE FIX

Per Apple HIG and WCAG 2.5.8: **minimum 44×44px (iOS) / 48×48px (Material)**.

### Table of Current vs. Required

| Element | Current tap height | Required | Fix |
|---------|-------------------|----------|-----|
| `.db-sidebar-item` | ~28px | 44px | `padding: 10px 10px; min-height: 44px;` |
| `.bottom-nav-item` | ~24px | 44px | `padding: 8px 12px; min-height: 44px; min-width: 48px;` |
| `.lang-switcher a` | ~22px | 44px | `padding: 8px 14px; min-height: 32px;` |
| `.quiz-option` | ~40px | 44px | `padding: 14px 16px; min-height: 44px;` |
| `.lesson-tab` | ~36px | 44px | `padding: 12px 16px;` |
| `.db-btn.sm` | ~24px | 44px | `padding: 10px 12px; font-size: 12px;` on mobile |
| `.db-subtab` | ~32px | 44px | `padding: 12px 14px;` |
| `.magisterium-close-btn` | 32×32 | 44×44 | `width: 44px; height: 44px;` |
| `.read-aloud-btn` | ~30px | 44px | `padding: 10px 12px;` |
| `.read-aloud-stop` | 28×28 | 44×44 | `width: 44px; height: 44px;` |

### Global Touch-Target Fix for Mobile

**Add to `globals.css`:**

```css
/* === Mobile Touch Target Enforcement (≤768px) === */
@media (max-width: 768px) {
  .btn,
  .db-btn {
    min-height: 44px;
    padding-top: 10px;
    padding-bottom: 10px;
  }
  .btn-sm,
  .db-btn.sm {
    min-height: 36px;    /* secondary buttons: slightly smaller OK */
    padding: 8px 14px;
  }
  .btn-sm:where(.danger, .primary),
  .db-btn.sm:where(.danger, .primary) {
    min-height: 44px;    /* but primary/danger: full height */
  }
  .lesson-tab {
    padding: 12px 16px;   /* was 10px 16px */
    min-height: 44px;
  }
  .db-subtab {
    padding: 12px 14px;   /* was 9px 14px */
    min-height: 44px;
  }
  .read-aloud-btn {
    padding: 10px 12px;   /* was 6px 12px */
    min-height: 44px;
  }
  .read-aloud-stop {
    width: 44px; height: 44px; /* was 28×28 */
  }
  .magisterium-close-btn {
    width: 44px; height: 44px; /* was 32×32 */
  }
}
```

---

## 6. TYPOGRAPHY SCALING APPROACH

### 6.1 Current State

- Desktop headings use fixed pixel sizes (2.5rem hero, 2.25rem h1, 1.5rem h2, etc.)
- No fluid typography — just abrupt jumps at breakpoints
- At 375px, hero H1 (40px) is ~10.7% of viewport width — acceptable but borderline

### 6.2 Recommended: CSS `clamp()` Fluid Scale

```css
/* === Fluid Typography === */

/* Hero title */
.home-hero h1 {
  font-size: clamp(1.75rem, 7vw, 2.5rem);       /* 28px → 40px */
  line-height: 1.15;
}

/* Section/lesson headers */
.section-header h1,
.lesson-header h1 {
  font-size: clamp(1.5rem, 6vw, 2.25rem);        /* 24px → 36px */
}

/* Dashboard h1 */
.db-content h1 {
  font-size: clamp(1.25rem, 5vw, 1.5rem);        /* 20px → 24px */
}

/* H2-level headings */
.prose h2,
.section-header h2,
.feature-section h2 {
  font-size: clamp(1.25rem, 4vw, 1.5rem);        /* 20px → 24px */
}

/* Paragraph text — keep 16px minimum for readability */
.prose p,
.home-hero p {
  font-size: clamp(1rem, 2.5vw, 1.05rem);        /* 16px → 16.8px */
}

/* Dashboard stat values */
.db-stat-val {
  font-size: clamp(1.25rem, 5vw, 1.625rem);     /* 20px → 26px */
}

/* Small text — never below 11px */
.db-stat-lbl,
.db-badge {
  font-size: max(11px, 0.6875rem);                /* floor at 11px */
}
```

### 6.3 Line Height for Mobile

Current `body { line-height: 1.7 }` is good. But on mobile, slightly more generous:
```css
@media (max-width: 480px) {
  body { line-height: 1.75; }
  .prose p { line-height: 1.85; }  /* extra breathing room on small screens */
}
```

---

## 7. TABLE/CARD ALTERNATIVES ON MOBILE

### 7.1 Current: Table → Card Transform at ≤640px

The existing `dashboard.css` already does the `data-label::before` transform. This is **good**, but has issues:

1. **`data-label=""` cells hide their label** — the actions column uses `data-label=""` which hides the label, but without it, the action buttons float without context.
2. **Layout**: `display: flex; justify-content: space-between` on each `td` means values are right-aligned and can wrap awkwardly.

### 7.2 Fixes

```css
@media (max-width: 640px) {
  .db-table td {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 0;                 /* was 4px 0 — slightly more room */
    border: none;
    font-size: 13px;
    gap: 10px;
  }
  .db-table td::before {
    content: attr(data-label);
    font-size: 10px;
    font-weight: 600;
    color: var(--color-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    flex-shrink: 0;
    max-width: 40%;                 /* ← ADD: prevent label taking too much space */
  }
  /* Action cells: stack buttons vertically on very small screens */
  @media (max-width: 380px) {
    .db-table td .db-btn-group {
      flex-direction: column;
      gap: 4px;
    }
    .db-table td .db-btn-group .db-btn {
      width: 100%;
      justify-content: center;
    }
  }
}
```

### 7.3 For Wider Tables (Analytics)

The analytics table has 4 columns and should use horizontal scroll rather than card transform:

```css
/* Keep analytics table scrollable instead of card layout */
@media (max-width: 640px) {
  .db-table-wrap.analytics-table {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .db-table-wrap.analytics-table .db-table thead {
    display: table-header-group;  /* keep headers */
  }
  .db-table-wrap.analytics-table .db-table,
  .db-table-wrap.analytics-table .db-table tbody,
  .db-table-wrap.analytics-table .db-table tr {
    display: table-row-group;
  }
  .db-table-wrap.analytics-table .db-table tr {
    padding: 0;
    border: none;
    border-radius: 0;
    background: transparent;
  }
  .db-table-wrap.analytics-table .db-table td {
    display: table-cell;
    padding: 11px 14px;
    border-bottom: 1px solid var(--color-border-light);
  }
  .db-table-wrap.analytics-table .db-table td::before {
    display: none;  /* no ::before label for scrollable tables */
  }
}
```

**Usage in component:** Add `analytics-table` class to the `.db-table-wrap`:
```tsx
<div className="db-table-wrap analytics-table">
```

---

## 8. MODAL AND OVERLAY BEHAVIOR ON MOBILE

### 8.1 Current: Bottom Sheet at ≤480px

This is the right pattern. Improvements needed:

1. **Drag handle** (visual affordance showing it's draggable):
   ```css
   @media (max-width: 480px) {
     .db-modal::before {
       content: '';
       display: block;
       width: 36px;
       height: 4px;
       border-radius: 2px;
       background: var(--color-border);
       margin: 0 auto 16px;
     }
   }
   ```

2. **Swipe-to-dismiss**: Add touch drag gesture to close:
   ```tsx
   // In modal wrapper component:
   const [dragStart, setDragStart] = useState(0);
   const [dragDelta, setDragDelta] = useState(0);

   <div
     className="db-modal"
     onTouchStart={(e) => setDragStart(e.touches[0].clientY)}
     onTouchMove={(e) => {
       const delta = e.touches[0].clientY - dragStart;
       if (delta > 0) setDragDelta(delta);  // only downward
     }}
     onTouchEnd={() => {
       if (dragDelta > 80) onClose();  // dismiss threshold
       setDragDelta(0);
     }}
     style={dragDelta > 0 ? { transform: `translateY(${dragDelta}px)` } : undefined}
   >
   ```

3. **Input focus management**: When a modal input is focused on mobile, the keyboard pushes the sheet up. Prevent this:
   ```css
   @media (max-width: 480px) {
     .db-overlay {
       align-items: flex-end;
     }
     .db-modal {
       max-height: 80vh;
       overflow-y: auto;
       /* When keyboard opens, scroll to focused input */
       overscroll-behavior: contain;
     }
   }
   ```

4. **Background scroll lock**: Same as sidebar — prevent scrolling behind overlay:
   ```tsx
   useEffect(() => {
     if (showModal) {
       document.body.style.overflow = 'hidden';
     }
     return () => { document.body.style.overflow = ''; };
   }, [showModal]);
   ```

5. **Safe-area handling for bottom sheet**:
   ```css
   @media (max-width: 480px) {
     .db-modal {
       padding-bottom: calc(24px + env(safe-area-inset-bottom));
       padding-left: calc(18px + env(safe-area-inset-left));
       padding-right: calc(18px + env(safe-area-inset-right));
     }
   }
   ```

### 8.2 Magisterium Chat Panel

Already handles ≤480px as bottom sheet. Same improvements apply:
- Add drag handle
- Add safe-area padding
- Add scroll lock

---

## 9. SAFE AREA HANDLING — COMPLETE CHECKLIST

| Element | Safe-area needed | Current | Fix |
|---------|-----------------|---------|-----|
| `<html>` viewport | `viewport-fit=cover` | ❌ Missing | Add to metadata |
| `site-header` | top, left, right | ❌ Missing | Add padding |
| `.db-topbar` | top, left, right | ❌ Missing | Add padding |
| `.db-sidebar` (open) | top, left, bottom | ❌ Missing | Add padding |
| `.bottom-nav` | bottom | ✅ Has env() | Keep, verify |
| `.magisterium-fab` | bottom, right | ❌ Missing | Add calc() |
| `.db-modal` (bottom sheet) | bottom, left, right | ❌ Missing | Add calc() |
| `.magisterium-panel` | bottom, left, right | ❌ Missing | Add calc() |
| `.toast-container` | top, right | ❌ Missing | Add calc() |
| `.db-content` | bottom (for bottom nav) | ❌ Missing | Add calc() |
| `.lesson-page` | bottom | ❌ Missing | Add calc() |

### Complete Safe-Area CSS Block

**Add to end of `globals.css`:**

```css
/* === Safe Area Insets (notched phones) === */
@supports (padding: max(0px)) {
  .site-header {
    padding-top: env(safe-area-inset-top);
    padding-left: calc(24px + env(safe-area-inset-left));
    padding-right: calc(24px + env(safe-area-inset-right));
  }

  .db-topbar {
    padding-top: env(safe-area-inset-top);
    padding-left: calc(24px + env(safe-area-inset-left));
    padding-right: calc(24px + env(safe-area-inset-right));
  }

  .db-sidebar.open {
    padding-top: calc(16px + env(safe-area-inset-top));
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
  }

  .magisterium-fab {
    bottom: calc(24px + env(safe-area-inset-bottom));
    right: calc(24px + env(safe-area-inset-right));
  }

  .toast-container {
    top: calc(16px + env(safe-area-inset-top));
    right: calc(16px + env(safe-area-inset-right));
  }

  .magisterium-panel {
    padding-bottom: env(safe-area-inset-bottom);
  }

  .db-content {
    padding-bottom: calc(64px + env(safe-area-inset-bottom));
  }

  .lesson-page {
    padding-bottom: calc(80px + env(safe-area-inset-bottom));
  }

  .section-page {
    padding-bottom: calc(64px + env(safe-area-inset-bottom));
  }
}

/* Lock body scroll behind overlays */
html.no-scroll,
html.no-scroll body {
  overflow: hidden;
  overscroll-behavior: none;
}
```

---

## 10. LANDSCAPE MODE CONSIDERATIONS

Landscape on phones (especially iPhone 14 Pro Max at 932×430) needs attention:

```css
/* Landscape phone: sidebar shouldn't consume the entire short dimension */
@media (max-height: 500px) and (orientation: landscape) {
  .db-sidebar {
    width: 240px;                /* keep same width */
    max-height: 100vh;           /* full height */
    padding-top: 8px;           /* reduced top padding */
  }
  .db-sidebar-top {
    padding: 0 14px 8px;       /* was 0 14px 14px */
  }
  .db-topbar {
    height: 40px;               /* was 44px, tighter in landscape */
  }
  .db-content {
    padding: 16px 24px 48px;
  }
}
```

---

## 11. SUMMARY: PRIORITY FIXES

### Critical (Do First)
1. **Add `viewport-fit=cover`** to viewport meta — enables all safe-area insets
2. **Fix all touch targets** — sidebar items, bottom-nav, lang-switcher, quiz options, small buttons
3. **Add safe-area padding** — topbar, home-hero content, bottom of scrollable pages
4. **Fix login-cta stacking** on ≤480px — currently unusable on iPhone SE
5. **Add body scroll lock** — when sidebar/modal overlay is open

### High Priority
6. **Add fluid typography** with `clamp()` — eliminates jarring breakpoint jumps
7. **Add role-based bottom navigation** — currently the `bottom-nav` is in CSS but has no rendering logic in components
8. **Fix modal bottom-sheet drag handle + safe area** — UX affordance + padding
9. **Add sidebar swipe-to-close gesture** — native-feeling interaction
10. **Fix hero title scaling** on 375px — use `clamp()`

### Nice to Have
11. **Add analytics table horizontal scroll** instead of card transform
12. **Add landscape orientation handling**
13. **Add mobile-friendly subtabs** (scrollable, with fade indicators)
14. **Add 380px breakpoint** for iPhone SE specific fixes
15. **Toast notification safe-area awareness**

---

*This report is based on analysis of the source code at `/home/family/local/Agents/workspace/catecismo-next` and the live site at `catecismo.kipadmon.com`. All CSS/code examples are ready to apply directly to the existing codebase.*