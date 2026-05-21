# Design System
<!-- Read by: SDD Agent, Implementer Agent -->
<!-- ONLY for front-end projects. Delete this file entirely if your project has no UI. -->
<!-- If this file doesn't exist, front-end agents will not apply any design constraints. -->

---

## Component Library

[What UI library / component system is used?]

Examples:
- shadcn/ui (Radix UI primitives + Tailwind)
- MUI (Material UI)
- Chakra UI
- Custom components in `/components/ui/`
- None — plain HTML + CSS

**Rule:** Always prefer existing components over building new ones.
Check `/components/ui/` before creating any new UI element.

---

## Styling System

[How is CSS/styling handled?]

Examples:
- Tailwind CSS — utility classes only, no custom CSS unless absolutely necessary
- CSS Modules — one `.module.css` file per component
- Styled-components — see `/styles/theme.ts` for tokens

---

## Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#000000` | Main actions, CTAs |
| `secondary` | `#000000` | Secondary actions |
| `destructive` | `#ef4444` | Delete, error states |
| `muted` | `#6b7280` | Placeholder text, disabled |
| `background` | `#ffffff` | Page background |
| `foreground` | `#111111` | Default text |
| `border` | `#e5e7eb` | Dividers, input borders |

[Add your actual token values]

---

## Typography

| Element | Class / Style | Notes |
|---------|--------------|-------|
| H1 | `text-3xl font-bold` | Page titles only |
| H2 | `text-2xl font-semibold` | Section titles |
| H3 | `text-xl font-medium` | Card titles |
| Body | `text-base` | Default prose |
| Small | `text-sm` | Labels, captions |
| Code | `font-mono text-sm` | Inline code |

---

## Spacing Scale

Use only these values (Tailwind scale): `1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24`
[Or define your custom scale]

---

## Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Wide desktop |

Design is **mobile-first** — base styles target mobile, breakpoints add complexity.

---

## Component Patterns

### Forms
- Always use [React Hook Form / Formik / native] + [Zod / Yup] for validation
- Display field errors inline below the input
- Submit button shows loading state during async operations

### Loading States
- Use skeleton components (not spinners) for content loading
- Skeletons must match the shape of the actual content

### Error States
- API errors: toast notification (top-right, 4s duration)
- Form errors: inline below each field
- Full-page errors: error boundary component

### Empty States
- Every list/table must have an empty state component
- Empty states include: icon, title, description, and (if relevant) a CTA

---

## Rules

- [e.g. "Never use inline styles — always use Tailwind classes or CSS modules"]
- [e.g. "Always use design tokens, never hardcode color values"]
- [e.g. "All interactive elements must have focus-visible styles"]
- [e.g. "Images must always have alt text"]
- [e.g. "Minimum touch target size: 44x44px"]
