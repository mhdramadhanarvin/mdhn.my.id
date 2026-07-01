# AGENTS.md

**Last Updated**: 2026-07-01  
**Project**: mdhn.my.id — Personal blog built with Astro 6

---

## PROJECT

**Name**: astro-blog  
**Live Site**: https://mdhn.my.id  
**Description**: Personal blog featuring articles on DevOps, Go, Laravel, and infrastructure. Built with Astro 6 + Solid.js for interactive components.  
**Scale**: 38 code files (.ts/.tsx/.astro), 1875 lines of code, small project with flat directory structure.

**Package Manager**: README says `pnpm`, but no `pnpm-lock.yaml` found in root. `new/new/` embedded project uses `npm`.

---

## TECH STACK

- **Framework**: Astro 6.0.4
- **UI Libraries**: Solid.js 1.8 (interactive components)
- **Styling**: Tailwind CSS 3.4 + @tailwindcss/typography
- **Content**: MDX, Astro Content Collections (glob loader)
- **Search**: fuse.js 7
- **Build Tools**: TypeScript 5.6, ESLint (flat config)
- **Integrations**: @astrojs/mdx, @astrojs/sitemap, @astrojs/solid-js, @astrojs/tailwind

---

## PROJECT STRUCTURE

```
.
├── src/
│   ├── pages/              # Routes (index, blog, projects, work, about, search, legal)
│   │   ├── rss.xml.ts      # RSS endpoint (.ts not .astro)
│   │   ├── robots.txt.ts   # Robots endpoint (.ts not .astro)
│   │   └── [subdirs]/      # about/, blog/, projects/, work/, search/, legal/
│   ├── layouts/            # 5 layout files (flat): PageLayout, TopLayout, BottomLayout, ArticleTopLayout, ArticleBottomLayout
│   ├── components/         # 13 components (flat, PascalCase)
│   │   ├── *.astro         # Static/shell components (BaseHead, Container, Drawer, Footer, Header, MeteorShower, StackCard, TwinklingStars)
│   │   └── *.tsx           # Interactive Solid.js (ArrowCard, Blog, Counter, Projects, Search)
│   ├── content/            # Content collections (blog/, projects/, work/, legal/)
│   ├── lib/
│   │   └── utils.ts        # cn(), formatDate(), readingTime()
│   ├── consts.ts           # Site config, page metadata, links, socials
│   ├── content.config.ts   # 4 collections: work, blog, projects, legal
│   ├── types.ts            # Site, Page, Links, Socials types
│   └── env.d.ts            # Astro env types
├── public/                 # Static assets
├── new/new/                # EMBEDDED WIP REDESIGN (separate git repo, npm, own AGENTS.md)
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── eslint.config.mjs
└── package.json
```

**Directory Structure**: Flat. No subdirectories in `src/components/` or `src/layouts/`. All files at top level.

---

## CONVENTIONS

### File Naming
- **PascalCase** for all components and layouts: `BaseHead.astro`, `ArrowCard.tsx`, `PageLayout.astro`
- **kebab-case** for utility modules: `utils.ts`
- **lowercase** for config files: `consts.ts`, `types.ts`

### Component Types
- **`.astro` files**: Static/shell components (HTML-like, server-rendered)
- **`.tsx` files**: Interactive Solid.js components (client-side interactivity)
- **`.ts` endpoint routes**: API endpoints (e.g., `rss.xml.ts`, `robots.txt.ts`)

### Import Paths
- **Path alias**: `@*` → `src/*` (NOT `@/*` — single asterisk)
  ```typescript
  import { SITE } from "@consts";        // ✅ Correct
  import { cn } from "@lib/utils";       // ✅ Correct
  import type { Site } from "@types";    // ✅ Correct
  import { SITE } from "@/consts";       // ❌ Wrong (@ followed by /)
  ```

### Styling
- **Tailwind CSS**: Dark mode = `class`-based (toggle via JS)
- **Custom font**: Atkinson (sans-serif)
- **Custom animations**: `twinkle` (2s), `meteor` (3s), `typing` (blink+typing effect)
- **Custom rotations**: 45°, 135°, 225°, 315°
- **Typography plugin**: @tailwindcss/typography with `maxWidth: full`
- **CRITICAL**: `applyBaseStyles: false` in `astro.config.mjs` — Tailwind base styles are NOT auto-injected. Must import manually if needed.

### Utility Functions (`src/lib/utils.ts`)
- `cn(...inputs)`: Merges Tailwind classes (clsx + tailwind-merge)
- `formatDate(date)`: Formats dates as `en-US` (short month/2-digit day/numeric year)
- `readingTime(html)`: Calculates reading time (200 words/min)

---

## COMMANDS

```bash
# Development
npm run dev              # Start dev server
npm run dev:network      # Dev server accessible on network
npm start                # Alias for dev

# Build
npm run build            # astro check && astro build (typecheck gates build)
npm run preview          # Preview production build
npm run preview:network  # Preview on network

# Linting
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
```

**No test script configured.** No test framework present.

---

## KEY PATTERNS

### Routing & Pages
**See**: `src/pages/AGENTS.md` for complete routing patterns, dynamic routes, endpoints, and layout composition.

**Quick ref**:
- `/` → `src/pages/index.astro`
- `/blog/*` → `blog/[...slug].astro` (dynamic)
- `/projects/*` → `projects/[...slug].astro` (dynamic)
- `/legal/*` → `legal/[...slug].astro` (dynamic, no index)
- `/rss.xml` → `rss.xml.ts` (endpoint)
- `/robots.txt` → `robots.txt.ts` (endpoint)

### Content Collections & Schema
**See**: `src/content/AGENTS.md` for collection definitions, schemas, and adding new content.

**Collections** (defined in `src/content.config.ts`):
1. **`blog`**: Blog posts (Markdown only)
2. **`projects`**: Projects (Markdown/MDX)
3. **`work`**: Work experience (Markdown/MDX)
4. **`legal`**: Legal docs (Markdown/MDX)

### Search
- **Implementation**: `Search.tsx` (Solid.js component)
- **Library**: fuse.js 7
- **Page**: `/search` (`src/pages/search/index.astro`)
- **Indexing**: Client-side, all blog posts + projects

---

## KNOWN ISSUES

1. **Template leftover**: `SITE.DESCRIPTION` in `src/consts.ts` still says `"Welcome to Astro Sphere..."` (should reflect actual site)
2. **LinkedIn URL typo**: Trailing double-slash in `SOCIALS` LinkedIn URL (`https://linkedin.com/in/mhdramadhanarvin//`)
3. **Active-link behavioral drift**: `Header.astro` uses `pathname === LINK.HREF || "/" + subpath?.[0] === LINK.HREF`; `Drawer.astro` hardcodes `"search"` instead of `LINK.HREF` in the same check
4. **Unused component**: `Counter.tsx` (demo component, not used in production)
5. **Package manager ambiguity**: README says `pnpm`, but no `pnpm-lock.yaml` present

---

## NOTES

- **Embedded project**: `./new/new/` is a WIP redesign with separate git repo, npm (not pnpm), and its own `AGENTS.md`. It has 21 components, 7 pages, and uses BaseLayout/PageLayout/ArticleLayout pattern. **Do NOT merge without approval.**
- **No CI/CD**: Only `.github/workflows/stale.yaml` (closes inactive issues). No build/test/deploy workflow. Deploy is GitHub Pages (per README) but no workflow present.
- **No .editorconfig**: Editor settings not standardized.
- **TypeScript**: Strict mode enabled (`astro/tsconfigs/strict`). `strictNullChecks: true`.
- **ESLint**: Flat config format. Uses recommended rules from @eslint/js, typescript-eslint, eslint-plugin-astro. Special parser for `.astro` files: `astro-eslint-parser` with `@typescript-eslint/parser` as inner parser.

---

## CONTENT

- **Blog posts**: 8 entries (01-08)
- **Projects**: 4 entries
- **Work entries**: 4 (streamuniverse-be, devops, hoi, zog-infra)
- **Legal pages**: 2 (privacy, terms)

---

**For questions about conventions, patterns, or architecture, refer to this document first.**
