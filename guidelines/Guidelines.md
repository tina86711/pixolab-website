# AEGIS Design System — Development Guidelines

> **Version:** 1.0.0 · **Status:** Active · **Maintained by:** Design System Lead
> **Token Source:** `styles/tokens.css`

---

## Table of Contents

1. [Architecture Philosophy](#1-architecture-philosophy)
2. [Usage Guidelines](#2-usage-guidelines)
3. [Component Extraction & Reuse](#3-component-extraction--reuse)
4. [Specific Implementation Rules](#4-specific-implementation-rules)
5. [Code Examples](#5-code-examples)

---

## 1. Architecture Philosophy

### 1.1 The Three-Layer Token System

This design system uses a strict **tri-layer inheritance model** — inspired by Material Design 3 and Linear.app's internal token architecture. Every design decision traces from a raw value to a semantic meaning to a component usage.

```
LAYER 1 · ref-*   (Reference)
  Raw primitives: colors, sizes, durations.
  These are the "atoms" — never used in components.

LAYER 2 · sys-*   (System)
  Semantic aliases: what a value MEANS.
  e.g. sys-bg-canvas, sys-text-primary

LAYER 3 · comp-*  (Component)
  Component-level slots: what & where a token is
  applied inside a specific UI component.
```

### 1.2 Inheritance Direction (Unidirectional — Non-negotiable)

```
ref-color-accent-500
        ↓ aliased by
sys-accent-default
        ↓ referenced by
comp-btn-accent-bg
        ↓ applied in CSS
.btn-accent { background: var(--comp-btn-accent-bg); }
```

**Cross-layer jumps are FORBIDDEN.** A component style must **never** reference a `ref-*` token directly. A system token must **never** reference a `comp-*` token.

| From / To  | `ref-*` | `sys-*` | `comp-*` |
|---|---|---|---|
| `ref-*`    | OK      | NO      | NO       |
| `sys-*`    | OK      | OK      | NO       |
| `comp-*`   | NO      | OK      | OK       |
| Component CSS | NO  | Fallback only | OK |

> `sys-*` tokens may be used in component CSS **only** when no `comp-*` token exists. Create the `comp-*` token first and ask the Design Lead.

### 1.3 Why Three Layers?

| Concern | Layer | Example |
|---|---|---|
| "What is the exact blue value?" | `ref` | `--ref-color-accent-500: #5e6ad2` |
| "What color should a primary action be?" | `sys` | `--sys-accent-default: var(--ref-color-accent-500)` |
| "What is the button background color?" | `comp` | `--comp-btn-accent-bg: var(--sys-accent-default)` |

This separation means **rebranding** only requires editing `ref` tokens. **Theming** only requires remapping `sys` tokens. Components stay untouched.

### 1.4 Atomization Principle

> **Rule:** Any UI pattern that appears in **2 or more locations** must be extracted into a shared component.

When building a new page, do not write inline styles for buttons, cards, badges, or inputs. These patterns must already exist at the component level. If they do not, create the token + component before building the page.

---

## 2. Usage Guidelines

### 2.1 Token Priority Order

When styling a component, follow this decision tree **in strict order**:

```
1. Does a comp-* token exist for this attribute?
   YES → Use it.

2. Does a sys-* token express the semantic meaning?
   YES → Create the comp-* token, map it to sys-*, then use comp-*.

3. Found only a ref-* token?
   → STOP. Do not use it. Create sys-* > comp-* first. Ask Design Lead.

4. Thinking of writing a hard-coded value?
   → STOP IMMEDIATELY. Critical violation.
```

### 2.2 Hard-coding is Strictly Forbidden

Hard-coded values make the system brittle, themes impossible, and maintenance a nightmare.

```css
/* VIOLATION — Do not write this */
.card {
  padding: 24px;
  border-radius: 12px;
  background: #ffffff;
  color: #171717;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

/* CORRECT — Always use tokens */
.card {
  padding: var(--comp-card-padding);
  border-radius: var(--comp-card-radius);
  background: var(--comp-card-bg);
  color: var(--sys-text-primary);
  box-shadow: var(--comp-card-shadow);
}
```

**Banned patterns in CSS:**

| Pattern | Why Banned |
|---|---|
| `color: #hex` | Hard-coded color |
| `padding: 12px` | Hard-coded spacing |
| `border-radius: 8px` | Hard-coded geometry |
| `font-size: 14px` | Hard-coded type scale |
| `margin: 24px auto` | Hard-coded spacing |
| `box-shadow: 0 4px ...` | Hard-coded elevation |
| `transition: 0.15s ease` | Hard-coded motion |
| `z-index: 100` | Hard-coded stacking |

### 2.3 Missing Token Protocol

If no token exists for a needed attribute:

1. **Do not invent a temporary variable.**
2. **Do not approximate** with a close token because it "looks close enough."
3. **Open a token request** — describe the semantic need, not the value.
4. Wait for the Design Lead to add the token at the appropriate layer.

---

## 3. Component Extraction & Reuse

### 3.1 DRY Principle (Don't Repeat Yourself)

**Threshold Rule:** If the same visual pattern appears in **3 or more** locations, it **must** be extracted into a shared component.

```
Before (Repeated):
  homepage.html → <div class="bg-white border border-[#e8e8e8] rounded-xl p-6 ...">
  about.html    → <div class="bg-white border border-[#e8e8e8] rounded-xl p-6 ...">
  contact.html  → <div class="bg-white border border-[#e8e8e8] rounded-xl p-6 ...">

After (Extracted):
  components/_card.css → .card { ... using tokens ... }
  All pages use:        → <div class="card">
```

### 3.2 Parameterized Design via Modifier Classes

A shared component must handle variation through **modifier classes**, not duplication.

```css
/* Base Component */
.btn { ... }        /* shared structure */

/* Size Modifiers */
.btn-sm { ... }
.btn-md { ... }     /* default */
.btn-lg { ... }

/* Variant Modifiers */
.btn-primary   { ... }
.btn-secondary { ... }
.btn-accent    { ... }
.btn-ghost     { ... }
```

**Usage in HTML:**
```html
<!-- Compose by combining base + modifiers -->
<a class="btn btn-primary btn-lg">Consult Now</a>
<button class="btn btn-secondary btn-sm">Cancel</button>
<a class="btn btn-accent">Get Started</a>
```

### 3.3 Props vs. Duplicates

| Wrong: Duplicate with micro-tweaks | Right: Single component + modifier |
|---|---|
| `.btn-hero-cta` | `.btn.btn-primary.btn-lg` |
| `.service-card-blue` | `.card[data-accent="blue"]` |
| `.footer-link-light` | `.link.link-muted` |

### 3.4 Component Directory Structure

```
components/
├── _buttons.css       # .btn, .btn-primary, .btn-sm, ...
├── _cards.css         # .card, .card-highlight, ...
├── _badges.css        # .badge, .badge-accent, ...
├── _inputs.css        # .input, .input-error, ...
├── _nav.css           # .nav, .nav-link, ...
└── _typography.css    # .heading-*, .label, .caption, ...
```

Every component file must:
1. Import from `styles/tokens.css`
2. Contain **zero hard-coded values** — only `var(--comp-*)` and `var(--sys-*)` as fallback
3. Include a brief comment block explaining the component's purpose

---

## 4. Specific Implementation Rules

### 4.1 Colors & States

All interactive elements must implement the full state chain using tokens:

```css
.btn-primary            { background: var(--comp-btn-primary-bg); }
.btn-primary:hover      { background: var(--comp-btn-primary-bg-hover); }
.btn-primary:active     { background: var(--comp-btn-primary-bg-active); }
.btn-primary:disabled   {
  background: var(--sys-text-disabled);
  color: var(--sys-text-tertiary);
  cursor: not-allowed;
  pointer-events: none;
}
.btn-primary:focus-visible {
  outline: none;
  box-shadow: var(--comp-input-shadow-focus);
}
```

**Never** define hover/active states with `filter: brightness(0.9)` or `opacity: 0.8`. Each state must have its own explicit token.

### 4.2 Spacing & Geometry

```css
/* CORRECT usage */
.card {
  padding: var(--comp-card-padding);
  gap: var(--sys-space-gap-lg);
}

.section-wrapper {
  padding-block: var(--comp-section-py-lg);
  padding-inline: var(--comp-section-px);
  max-width: var(--comp-section-max-w);
}

/* Border Radius */
.pill   { border-radius: var(--sys-radius-pill); }
.card   { border-radius: var(--comp-card-radius); }
.input  { border-radius: var(--comp-input-radius); }
```

### 4.3 Typography

Use role-based type tokens, not size tokens directly:

```css
h1  { font-size: var(--sys-text-size-h1); }
h2  { font-size: var(--sys-text-size-h2); }
p   { font-size: var(--sys-text-size-body); line-height: var(--sys-leading-body); }
.label { font-size: var(--sys-text-size-label); letter-spacing: var(--sys-tracking-caps); }
```

**Weight pairings (enforced):**

| Role | Weight Token |
|---|---|
| Display / H1 | `--sys-text-weight-extrabold` |
| H2 / H3 | `--sys-text-weight-bold` |
| H4 / Label | `--sys-text-weight-semibold` |
| Body / UI | `--sys-text-weight-medium` |
| Caption | `--sys-text-weight-regular` |

### 4.4 Motion & Transitions

```css
/* Token-driven transitions */
.btn  { transition: background var(--sys-transition-normal), box-shadow var(--sys-transition-normal); }
.card { transition: box-shadow var(--sys-transition-slow), transform var(--sys-transition-slow); }
```

### 4.5 Elevation / Shadows

```css
.card          { box-shadow: var(--comp-card-shadow); }
.card:hover    { box-shadow: var(--comp-card-shadow-hover); }
.modal         { box-shadow: var(--sys-shadow-high); }
.input:focus   { box-shadow: var(--comp-input-shadow-focus); }
```

---

## 5. Code Examples

### 5.1 Button Component — Full Implementation

```css
/* components/_buttons.css
 * Base button + variant + size modifier pattern.
 * All values sourced from styles/tokens.css
 * Never hard-code values in this file.
 */

/* Base (Shared Structure) */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sys-space-gap-sm);
  border-radius: var(--comp-btn-radius);
  font-family: var(--sys-font-body);
  font-size: var(--comp-btn-font-size);
  font-weight: var(--comp-btn-font-weight);
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  border: var(--ref-border-1) solid transparent;
  padding: var(--comp-btn-md-py) var(--comp-btn-md-px);
  transition:
    background  var(--comp-btn-transition),
    color       var(--comp-btn-transition),
    border-color var(--comp-btn-transition),
    box-shadow  var(--comp-btn-transition),
    transform   var(--comp-btn-transition);
}

/* Size Modifiers */
.btn-sm { padding: var(--comp-btn-sm-py) var(--comp-btn-sm-px); font-size: var(--comp-btn-sm-font-size); }
.btn-lg { padding: var(--comp-btn-lg-py) var(--comp-btn-lg-px); font-size: var(--comp-btn-lg-font-size); }

/* Variant: Primary (Dark Fill) */
.btn-primary { background: var(--comp-btn-primary-bg); color: var(--comp-btn-primary-text); }
.btn-primary:hover  { background: var(--comp-btn-primary-bg-hover); transform: translateY(-1px); }
.btn-primary:active { background: var(--comp-btn-primary-bg-active); transform: translateY(0); }

/* Variant: Secondary (Outlined) */
.btn-secondary { background: var(--comp-btn-secondary-bg); color: var(--comp-btn-secondary-text); border-color: var(--comp-btn-secondary-border); }
.btn-secondary:hover { background: var(--comp-btn-secondary-bg-hover); transform: translateY(-1px); }

/* Variant: Accent (Brand) */
.btn-accent { background: var(--comp-btn-accent-bg); color: var(--comp-btn-accent-text); box-shadow: var(--comp-btn-accent-shadow); }
.btn-accent:hover { background: var(--comp-btn-accent-bg-hover); transform: translateY(-1px); }

/* Variant: Ghost */
.btn-ghost { background: transparent; color: var(--comp-btn-ghost-text); }
.btn-ghost:hover { background: var(--comp-btn-ghost-bg-hover); }
```

### 5.2 Composing Buttons in HTML

```html
<a href="/contact" class="btn btn-primary btn-lg">預約免費諮詢</a>
<button class="btn btn-secondary">了解更多</button>
<a href="/pricing" class="btn btn-accent">查看方案</a>
<button class="btn btn-ghost btn-sm">取消</button>
```

### 5.3 Anti-patterns Quick Reference

```css
/* WRONG */
.nav     { background: rgba(255,255,255,0.85); }
.section { padding: 80px 32px; }
.badge   { background: var(--ref-color-accent-100); }  /* direct ref usage */

/* CORRECT */
.nav     { background: var(--comp-nav-bg); }
.section { padding: var(--comp-section-py-lg) var(--comp-section-px); }
.badge   { background: var(--sys-accent-muted); }
```

---

*Document maintained by the Design System Lead. Any proposed changes to token names, layer assignments, or component APIs require a change request and team review before implementation.*
