---
name: LMS Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464553'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777584'
  outline-variant: '#c8c4d5'
  surface-tint: '#544fc0'
  primary: '#1f108e'
  on-primary: '#ffffff'
  primary-container: '#3730a3'
  on-primary-container: '#a9a7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#4648d4'
  on-secondary: '#ffffff'
  secondary-container: '#6063ee'
  on-secondary-container: '#fffbff'
  tertiary: '#003421'
  on-tertiary: '#ffffff'
  tertiary-container: '#004d33'
  on-tertiary-container: '#2dc68d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3b35a7'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The design system is anchored in a philosophy of "Cognitive Clarity." It targets educational institutions and corporate training environments where focus is the primary currency. The aesthetic is a refined blend of **Modern Corporate** and **Minimalism**, stripping away non-essential decorative elements to prioritize content absorption. 

The emotional response is one of calm confidence and structured intelligence. By utilizing generous white space and a technical but approachable color palette, the UI feels "automated" and "smart"—acting as an invisible facilitator rather than a complex tool. The style avoids heavy ornamentation, opting instead for precise alignment, subtle motion, and high-quality typography to convey premium value.

## Colors

The palette is professional and authoritative, centered around a deep **Indigo Primary** (#3730A3) that evokes trust and stability. 

- **Primary & Secondary:** Used for brand presence, primary actions, and progress indicators.
- **Slate Grays:** Used for text hierarchies and UI borders to maintain a soft, low-fatigue visual environment.
- **AI Accents:** A secondary indigo glow and subtle gradients are reserved exclusively for "smart" features, such as automated grading or personalized course recommendations.
- **Success/Tertiary:** A crisp Emerald Green is used for completion states and achievement milestones, providing a clear psychological reward for the learner.

## Typography

This design system utilizes a dual-font strategy to balance character with utility. 

**Hanken Grotesk** is used for headlines and display styles; its sharp, contemporary geometry gives the platform a "tech-forward" feel. **Inter** is used for all body copy and UI labels due to its exceptional legibility at small sizes and neutral tone, which is critical for long-form educational reading.

Line heights are intentionally generous (1.5x for body text) to reduce eye strain during extended study sessions. High-contrast weights (Bold 700 vs Regular 400) are used to create a clear information hierarchy without relying on color.

## Layout & Spacing

The layout follows a **Fixed Grid** model for desktop to ensure content remains readable and focused, centering the learning experience. 

- **Desktop:** 12-column grid with a 1280px max-width. 24px gutters.
- **Tablet:** 8-column fluid grid with 24px margins.
- **Mobile:** 4-column fluid grid with 16px margins.

Spacing is based on a 4px baseline shift. Large vertical margins (`lg` and `xl`) are used between major content sections to prevent the UI from feeling "crowded," maintaining the distraction-free promise of the system.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Ambient Shadows**. The design system uses three levels of depth:

1.  **Level 0 (Flat):** The main background surface, using the Slate-tinted white.
2.  **Level 1 (Subtle):** Cards and content containers use a pure white surface with a very soft, diffused 4% opacity indigo-tinted shadow (0px 4px 20px).
3.  **Level 2 (Interactive):** Hover states and active modals use a more pronounced 8% opacity shadow with a slight 2px vertical offset to suggest "lift."

AI-enhanced components utilize a 1px inner stroke of the secondary color and a faint outer glow to signify their "smart" status, rather than traditional elevation.

## Shapes

The shape language is consistently **Rounded**, using an 8px (0.5rem) base radius. This softens the professional tone, making the learning environment feel welcoming rather than rigid. 

- **Standard Buttons/Inputs:** 8px (rounded)
- **Cards & Large Containers:** 16px (rounded-lg)
- **AI Recommendation Chips:** 32px (rounded-xl) to distinguish them as organic, system-generated elements.

## Components

### Buttons & Inputs
Buttons feature a solid primary fill for main actions and a "ghost" style with a 1px Slate-200 border for secondary actions. Input fields use a 1px border that thickens and changes to Indigo on focus, accompanied by a soft focus ring.

### Cards
Lesson and Course cards are the core of the experience. They use a Level 1 elevation, generous 24px internal padding, and a clear "Progress Bar" component at the bottom using a 4px height.

### AI Features (Smart Components)
Any component driven by AI (e.g., "Recommended for You" or "Smart Summary") must feature a subtle gradient border transition from Indigo to Emerald and a "sparkle" icon. These components use a slightly more translucent background (Glassmorphism light) to feel separate from static content.

### Progress & Data Viz
Data visualizations for analytics should use clean, thin strokes and a palette of Indigo, Slate, and Emerald. Avoid "heavy" charts; use donut charts with rounded caps and simple sparklines to maintain the minimal aesthetic.

### Lists
Lists use 16px vertical spacing between items with a subtle 1px divider. Each list item has a hover state that applies a soft background tint (#F1F5F9) to guide the user's eye.