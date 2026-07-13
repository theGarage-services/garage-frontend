# Responsive UI Standards

This document defines the shared mobile-first responsive conventions used across every component in `frontend/src/components`. The goal is one consistent vocabulary and predictable behavior from 320px to 1440px+.

## 1. Breakpoints

Use Tailwind’s default breakpoints (defined in `tailwind.config.js`). Do not add custom breakpoints unless a feature truly needs it.

| Prefix | Min width | Typical use |
|--------|-----------|-------------|
| `sm:`  | 640px     | Button groups side-by-side, small-card grids |
| `md:`  | 768px     | Two-column layouts, tables become readable |
| `lg:`  | 1024px    | Side-by-side master-detail, large nav visible |
| `xl:`  | 1280px    | Three-column dashboards, wide hero images |

Mobile-first rule: write the base class for the smallest screen first, then layer `sm:`, `md:`, `lg:`, `xl:` overrides.

```tsx
// Good: stack on mobile, 2 columns on sm, 4 on lg
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
```

## 2. Page containers & spacing

- **Max width**: `max-w-7xl mx-auto` is the default page container.
- **Horizontal padding**: `px-4 sm:px-6 lg:px-8` everywhere page-level content sits.
- **Vertical sections**: `py-12 sm:py-16 lg:py-24` for marketing sections; `py-6` or `py-8` for app screens.
- **Card/grid gaps**: `gap-4` on mobile, `gap-6` on desktop.

## 3. Layout patterns

### Grids

| Pattern | Mobile | Desktop |
|---------|--------|---------|
| Stat cards | `grid-cols-1` | `sm:grid-cols-2 lg:grid-cols-4` |
| Two-column feature | `grid-cols-1` | `lg:grid-cols-2` |
| Three-column feature cards | `grid-cols-1` | `md:grid-cols-3` |
| Master-detail / dashboard | `grid-cols-1` | `xl:grid-cols-3` with `xl:col-span-2` main area |

### Buttons & CTA groups

Stack on mobile, row on desktop:

```tsx
<div className="flex flex-col sm:flex-row gap-3">
```

### Hero/headline typography

Use `clamp()` for big hero text so it scales fluidly and does not overflow on small screens:

```tsx
<h1 className="font-semibold tracking-tight" style={{ fontSize: 'clamp(2.5rem, 10vw, 7rem)', lineHeight: 0.95 }}>
```

For standard page headings, use Tailwind size breakpoints:

```tsx
<h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold">
```

### Desktop-only decorative elements

Floating badges, vertical divider lines, and large background images should be hidden on mobile to keep the layout focused:

```tsx
<div className="hidden lg:block">...</div>
```

## 4. Component-specific patterns

### Chat (master-detail)

On mobile, show **either** the conversation list **or** the active conversation (drill-down), never both. On desktop (`lg:`), show both side-by-side. Use the existing `useIsMobile()` hook from `@/components/ui/use-mobile` to toggle the visible pane.

```tsx
const isMobile = useIsMobile();
// Mobile: list view, then conversation detail replaces it when selected
// Desktop: fixed 320px–380px sidebar + flex-1 conversation area
```

### Data tables & lists

On mobile, tables should be replaced by stacked cards or a horizontally scrollable container. Do not squish multi-column tables.

```tsx
<div className="overflow-x-auto md:overflow-visible">
  <table className="min-w-[640px] md:min-w-0">...</table>
</div>
```

Alternatively, render a card list below `md:` and a table at `md:` and up.

### Multi-step forms & wizards

- Stack form fields `flex-col` by default; use `sm:grid-cols-2` for side-by-side fields only on larger screens.
- Step indicators must wrap if there are many steps: `flex flex-wrap gap-2`.
- Action buttons should be full-width on mobile: `w-full sm:w-auto`.

### Modals / dialogs

Limit width on small screens:

```tsx
<DialogContent className="max-w-[90vw] sm:max-w-lg md:max-w-xl">
```

### Navigation / sidebar

The existing `sidebar.tsx` already uses `useIsMobile()`. Any new sidebar-like layout should follow the same pattern: hidden off-canvas on mobile, toggled by a button, and visible as a fixed-width panel on `lg:`.

## 5. JS-level responsiveness

For behavior that cannot be expressed with CSS alone (e.g., swapping between table and card list, showing/hiding a chat pane), use the existing hook:

```tsx
import { useIsMobile } from '@/components/ui/use-mobile';

const isMobile = useIsMobile();
```

This hook matches the Tailwind `md:` breakpoint (768px). Do not write new `window.matchMedia` hooks; keep the project on one source of truth.

## 6. What to avoid

- **Fixed pixel widths on containers**: prefer `max-w-*`, `w-full`, and percentage/flex layouts.
- **Arbitrary horizontal margins** that break centering on narrow screens.
- **Text that does not wrap**: use `whitespace-normal` or `break-words` instead of `whitespace-nowrap` on long labels.
- **Two-pane layouts always visible** on mobile.
- **Inventing custom breakpoints** unless absolutely necessary.

## 7. Verification checklist

Before marking a component responsive, verify at these widths:

- **375px** (small mobile): no horizontal overflow, buttons reachable, text readable.
- **768px** (tablet): two-column layouts begin to appear, navigation usable.
- **1280px** (desktop): full layout, sidebars visible, tables comfortable.
- **1440px+**: content centered with `max-w-7xl`, no excessive whitespace.

## 8. Applying this file

Use this document as the reference when touching any component in `src/components`. If a component already has a different pattern, migrate it to these conventions when you next edit it. This keeps the entire app predictable and avoids a patchwork of responsive styles.
