# src/pages/AGENTS.md

**Scope**: Routing layer — all page routes and API endpoints.  
**Last Updated**: 2026-07-01

---

## DIRECTORY OVERVIEW

```
src/pages/
├── index.astro           # Home (/)
├── about/
│   └── index.astro       # About page (/about)
├── blog/
│   ├── index.astro       # Blog index (/blog)
│   └── [...slug].astro   # Dynamic article route (/blog/:slug)
├── projects/
│   ├── index.astro       # Projects index (/projects)
│   └── [...slug].astro   # Dynamic project route (/projects/:slug)
├── work/
│   └── index.astro       # Work/experience page (/work)
├── search/
│   └── index.astro       # Search page (/search)
├── legal/
│   └── [...slug].astro   # Legal docs (privacy, terms) - no index
├── rss.xml.ts            # RSS feed endpoint (/rss.xml)
└── robots.txt.ts         # Robots endpoint (/robots.txt)
```

---

## ROUTE MAP & BEHAVIOR

| Route | File | Purpose | Data Source |
|-------|------|---------|-------------|
| `/` | `index.astro` | Home landing | Static HTML |
| `/about` | `about/index.astro` | About author | Static HTML |
| `/blog` | `blog/index.astro` | Blog listing | All blog posts (collection) |
| `/blog/:slug` | `blog/[...slug].astro` | Article detail | Single blog post |
| `/projects` | `projects/index.astro` | Projects listing | All projects (collection) |
| `/projects/:slug` | `projects/[...slug].astro` | Project detail | Single project |
| `/work` | `work/index.astro` | Experience/work history | All work entries (collection) |
| `/search` | `search/index.astro` | Full-text search | Client-side fuse.js |
| `/legal/:slug` | `legal/[...slug].astro` | Legal pages | Single legal doc |
| `/rss.xml` | `rss.xml.ts` | RSS feed | All blog posts |
| `/robots.txt` | `robots.txt.ts` | Robots protocol | Static text |

---

## DYNAMIC ROUTING PATTERNS

### Article Routes (`[...slug].astro`)

**Pattern**: `src/pages/blog/[...slug].astro` and `src/pages/projects/[...slug].astro`

```typescript
export async function getStaticPaths() {
  // Fetch all entries from collection
  const entries = await getCollection("blog");  // or "projects"
  
  // Return paths array with params
  return entries
    .filter(entry => !entry.data.draft)
    .map(entry => ({
      params: { slug: entry.slug },
      props: { entry }
    }));
}

const { entry } = Astro.props;
```

**Key**: Uses `getCollection()` + `.slug` from collection entry (auto-derived from file path).

### Legal Routes (Dynamic, No Index)

**Pattern**: `src/pages/legal/[...slug].astro` — renders ONLY direct routes, no `/legal/` index (must navigate directly to `/legal/privacy` or `/legal/terms`).

---

## ENDPOINT ROUTES (`.ts` files)

### `rss.xml.ts`

```typescript
// Returns Astro feed response
export const GET = (context) => {
  return rss({
    title: SITE.TITLE,
    description: SITE.DESCRIPTION,
    site: context.site,
    items: [/* mapped blog items */]
  });
};
```

Generates `/rss.xml` — RSS 2.0 feed for blog posts.

### `robots.txt.ts`

```typescript
export const GET = (context) => {
  return new Response(`
    User-agent: *
    Allow: /
    Sitemap: ${new URL("sitemap-index.xml", context.site)}
  `);
};
```

Generates `/robots.txt` for search engine crawlers.

---

## LAYOUT COMPOSITION

Each page route wraps content with **PageLayout.astro** (imports BaseHead, Header, Drawer, Footer).

**Example** (`index.astro`):
```astro
---
import PageLayout from "@layouts/PageLayout.astro";
---

<PageLayout>
  <!-- Page content -->
</PageLayout>
```

**Article pages** (`blog/[...slug].astro`, `projects/[...slug].astro`) use:
```astro
<PageLayout>
  <ArticleTopLayout>
    <!-- Meta, title -->
  </ArticleTopLayout>
  <article>
    <!-- Content -->
  </article>
  <ArticleBottomLayout>
    <!-- Related, nav -->
  </ArticleBottomLayout>
</PageLayout>
```

---

## CONTENT COLLECTION INTEGRATION

Routes query content collections defined in `src/content.config.ts`:

- **`blog`**: `./src/content/blog/**/*.md`
  - Query via `getCollection("blog")`
  - Schema: `{ title, summary, date, tags, draft? }`

- **`projects`**: `./src/content/projects/**/*.{md,mdx}`
  - Query via `getCollection("projects")`
  - Schema: `{ title, summary, date, tags, draft?, demoUrl?, repoUrl? }`

- **`work`**: `./src/content/work/**/*.{md,mdx}`
  - Query via `getCollection("work")`
  - Schema: `{ company, role, dateStart, dateEnd }`

- **`legal`**: `./src/content/legal/**/*.{md,mdx}`
  - Query via `getCollection("legal")`
  - Schema: `{ title, date }`

---

## CONVENTIONS

### File Naming
- **Index routes**: `index.astro` (served at directory level)
- **Dynamic routes**: `[...slug].astro` (rest parameter for nested paths)
- **Endpoints**: `*.ts` (API-style routes returning Response objects)

### Imports
- Path alias: `@layouts/*`, `@components/*`, etc.
- Collections: `import { getCollection } from "astro:content"`

### Filtering
Draft posts hidden from listings:
```typescript
const posts = (await getCollection("blog"))
  .filter(p => !p.data.draft)
  .sort((a, b) => b.data.date - a.data.date);
```

---

## SEARCH IMPLEMENTATION

**Page**: `src/pages/search/index.astro`  
**Component**: `Search.tsx` (Solid.js)  
**Library**: fuse.js 7

Search indexes all blog posts + projects client-side. No backend query needed.

---

## KNOWN PATTERNS & GOTCHAS

1. **Draft filtering**: Always filter `!entry.data.draft` when querying collections for public routes.
2. **RSS feed**: Manually maintained in `rss.xml.ts` — no auto-discovery. Update if collection schema changes.
3. **Slugs**: Auto-derived from file path; nested directories become hierarchical slugs (e.g., `01-intro/index.md` → slug `01-intro`).
4. **No 404 custom page**: Astro default 404 used. Consider adding `src/pages/404.astro` if custom error handling needed.
5. **Legal routes**: No `/legal/` index — only specific legal pages are routable.

---

**For questions about routing, dynamic paths, or content integration, refer to this document.**
