# figma-make-app

React + Vite + Tailwind CSS project running inside Figma Make.

## Development Server

A Vite development server is **already running** on `$PORT` (default 8443). You don't need to start it manually.

- Preview URL: The user can access the running app through the preview panel
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into the `#root` element
- `src/App.tsx` - Primary application component and the usual starting point for UI work
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Vite configuration with React, Tailwind CSS v4, and Figma Make plugins plus the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

Tailwind emits utility classes in `@layer utilities`, and CSS outside any cascade layer overrides every layer regardless of specificity. Put global element styles, such as resets and defaults for `body`, headings, `button`, or `input`, inside `@layer base { ... }` so utility classes on those elements still apply. Tailwind's Preflight already applies `box-sizing: border-box`, removes default margins, and sets `font: inherit` on form controls, so do not repeat those rules.

## Design Governance

Follow this authority hierarchy for product and interface decisions:

1. User requirements and approved product decisions.
2. The existing GREAT EMPOWER design system and design tokens.
3. This project-level guidance and the existing application architecture.
4. UI/UX Pro Max recommendations.
5. Other specialized design skills.

When guidance conflicts, follow the higher-level authority. Suggestions from skills are references, not permission to change product requirements, brand decisions, architecture, or scope.

### Existing GREAT EMPOWER Design System

The established design system is authoritative. Preserve:

- Brand: GREAT EMPOWER; tagline: “Empowering You to Protect Your Tomorrow.”
- Navy `#0F294A`, crimson `#C8102E`, teal `#297E85`, and background `#F8FAFC`.
- Inter for UI typography; Cormorant Garamond Bold for the wordmark.
- Premium + Youth Hybrid design direction.

Before proposing styles or changing a page, inspect the relevant tokens and existing components. Reuse them; do not introduce parallel tokens, palettes, typography systems, or component conventions without explicit approval.

### Architecture and Product Constraints

- Preserve the existing React, TypeScript, Vite, and Tailwind CSS 4 architecture.
- Reuse existing components and design tokens. Avoid unnecessary dependencies.
- Do not add shadcn/ui, Radix UI, or another component library without explicit approval.
- Do not replace the existing application architecture or primary navigation.
- The five primary navigation destinations remain Home, Learn, Simulate, Analyze, and Guide. Rewards Hub stays separate.
- LifeTrack is a future dedicated 3D game development project. Do not expand its game implementation during other platform work.
- Maintain GREAT EMPOWER’s independent financial wellness and protection education positioning. Never imply an officially confirmed Great Eastern partnership.
- Keep financial calculations, educational claims, and rewards accurate. Clearly label illustrative examples and do not imply real financial products, guaranteed coverage, commercial partnerships, or reward redemption.

## UI/UX Pro Max

Use `.agents/skills/ui-ux-pro-max/SKILL.md` as supporting design research for focused work on:

- UI hierarchy and visual balance.
- Dashboard information density.
- Responsive layout behavior.
- Accessibility and keyboard navigation.
- Interaction states and feedback.
- Chart and data visualization usability.
- React and Tailwind implementation recommendations.

Do not automatically generate a new design system for GREAT EMPOWER. Do not use UI/UX Pro Max `--design-system` or `--persist` for this existing product. Treat its palettes, font pairings, component-library assumptions, and general patterns as suggestions only; apply them only when consistent with the established design system and project architecture. Do not follow recommendations that add dependencies or change framework versions without explicit approval.

### Required UI/UX Workflow

Before implementing a page or major UI improvement:

1. Inspect the existing page, relevant components and tokens, and project instructions.
2. Identify the specific user experience problem to solve.
3. Consult UI/UX Pro Max for relevant, focused guidance.
4. Compare its recommendations with this governance and the existing implementation.
5. Present significant design changes for approval before implementing them.
6. Implement only the approved changes and preserve unrelated behavior.
7. Verify responsive behavior, accessibility, and interaction states relevant to the change.
8. Run the appropriate build or checks for the change.

For a minor fix, proceed directly when the intended change is clear and does not alter established design decisions. Prefer focused domain or stack guidance over broad redesign recommendations. If a skill script is unavailable, use its written reference guidance; do not install system tools or dependencies without authorization.

### Specialized Skill Responsibilities

- **Brand:** brand identity and brand consistency.
- **Design System:** existing design tokens and component standards.
- **UI Styling:** implementation patterns, subject to the existing architecture and component constraints above.
- **UI/UX Pro Max:** focused professional design research and UX quality guidance.
- **Banner Design:** banner-specific work.
- **Slides:** presentation-specific work.
- **Design:** task routing to the relevant design skill; it is not an independent authority to redesign the application.

## Design Standards and UI QA

- Design standard: `docs/design/GREAT-EMPOWER-DESIGN-SYSTEM.md` (documents the existing tokens and components; level 2 in the authority order above).
- Process and definition of done: `docs/design/UI-QA-PROCESS.md`.
- Run `npm run qa:ui` for every UI change. It builds device-only (never live Supabase), checks all routes at 375/390/768/1280/1440 px and writes screenshots to `.qa/shots/`. A passing gate is not a visual review: inspect the screenshots and score them with the rubric.
- Frontend Design skill: `.claude/skills/frontend-design/`. Use it for composition, restraint and copy; it does not override the brand palette or typography.
