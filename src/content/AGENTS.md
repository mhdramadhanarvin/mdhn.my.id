# src/content/AGENTS.md

**Scope**: Content collections and frontmatter schema definitions.  
**Last Updated**: 2026-07-01

---

## DIRECTORY OVERVIEW

```
src/content/
├── blog/                 # Blog posts (8 entries)
│   ├── 01-astro-sphere-file-structure/index.md
│   ├── 02-astro-sphere-getting-started/index.md
│   ├── 03-astro-sphere-add-new-post-or-projects/index.md
│   ├── 04-astro-sphere-writing-markdown/
│   ├── 05-astro-sphere-writing-mdx/index.mdx
│   ├── 06-astro-sphere-social-links/index.md
│   ├── 07-CI-CD-for-Laravel-Using-FTP-in-GitHub-Actions/index.md
│   └── 08-Building-a-Secure-SSH-Manager-with-Go-A-Developers-Guide/index.md
├── projects/             # Portfolio projects (4 entries)
│   ├── project-1/index.md
│   ├── project-2/index.md
│   ├── project-3/index.md
│   └── project-4/index.md
├── work/                 # Work/experience entries (4 entries)
│   ├── streamuniverse-be.md
│   ├── streamuniverse-devops.md
│   ├── streamuniverse-hoi.md
│   └── zog-infra.md
├── legal/                # Legal pages (2 entries)
│   ├── privacy.md
│   └── terms.md
└── config.ts             # Collection definitions (in src/)
```

---

## COLLECTION SCHEMAS

### 1. `blog` Collection

**Glob**: `./src/content/blog/**/*.md`  
**Format**: Markdown only (no MDX)

**Frontmatter Schema**:
```yaml
---
title: string                    # Required: Post title
summary: string                  # Required: Brief description
date: Date                       # Required: Publication date (coerced)
tags: string[]                   # Required: Tag array
draft?: boolean                  # Optional: Hide from listings if true
---
```

**Example**:
```yaml
---
title: "Building a Secure SSH Manager with Go"
summary: "A comprehensive guide to building SSH key management tools"
date: 2024-01-15
tags: ["Go", "Security", "DevOps"]
draft: false
---
```

**Storage**: Each post in its own directory with `index.md`. Assets (images) in same directory.

---

### 2. `projects` Collection

**Glob**: `./src/content/projects/**/*.{md,mdx}`  
**Format**: Markdown or MDX (supports interactive components)

**Frontmatter Schema**:
```yaml
---
title: string                    # Required: Project name
summary: string                  # Required: Project description
date: Date                       # Required: Project date (coerced)
tags: string[]                   # Required: Technology tags
draft?: boolean                  # Optional: Hide if true
demoUrl?: string                 # Optional: Live demo link
repoUrl?: string                 # Optional: GitHub repo link
---
```

**Example**:
```yaml
---
title: "Payment Gateway Integration"
summary: "Real-time payment processing system"
date: 2024-03-20
tags: ["Node.js", "Stripe", "TypeScript"]
draft: false
demoUrl: "https://demo.example.com"
repoUrl: "https://github.com/user/repo"
---
```

**Storage**: Each project in its own directory with `index.md` or `index.mdx`.

---

### 3. `work` Collection

**Glob**: `./src/content/work/**/*.{md,mdx}`  
**Format**: Markdown or MDX

**Frontmatter Schema**:
```yaml
---
company: string                  # Required: Company name
role: string                     # Required: Job title
dateStart: Date                  # Required: Start date (coerced)
dateEnd: Date | string           # Required: End date or "Present" (coerced/union)
---
```

**Example**:
```yaml
---
company: "StreamUniverse"
role: "DevOps Engineer"
dateStart: 2022-06-01
dateEnd: "Present"
---
```

**Storage**: One file per entry (`company-role.md` pattern recommended).

---

### 4. `legal` Collection

**Glob**: `./src/content/legal/**/*.{md,mdx}`  
**Format**: Markdown or MDX

**Frontmatter Schema**:
```yaml
---
title: string                    # Required: Document title (Privacy, Terms, etc.)
date: Date                       # Required: Last updated (coerced)
---
```

**Example**:
```yaml
---
title: "Privacy Policy"
date: 2024-01-01
---
```

**Storage**: One file per document (`privacy.md`, `terms.md`).

---

## CONTENT CONFIG

**File**: `src/content.config.ts`

```typescript
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    draft: z.boolean().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    draft: z.boolean().optional(),
    demoUrl: z.string().optional(),
    repoUrl: z.string().optional(),
  }),
});

const work = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/work" }),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    dateStart: z.coerce.date(),
    dateEnd: z.union([z.coerce.date(), z.literal("Present")]),
  }),
});

const legal = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/legal" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
  }),
});

export const collections = { blog, projects, work, legal };
```

---

## QUERYING COLLECTIONS

All collections queried via `getCollection()` in page routes:

```typescript
import { getCollection } from "astro:content";

// Get all entries
const allPosts = await getCollection("blog");

// Filter drafts
const published = allPosts.filter(post => !post.data.draft);

// Sort by date (newest first)
const sorted = published.sort((a, b) => 
  b.data.date.getTime() - a.data.date.getTime()
);

// Render entry content
const { Content } = await entry.render();
```

**Available collections**: `"blog"`, `"projects"`, `"work"`, `"legal"`

---

## FILE NAMING CONVENTIONS

- **Blog posts**: `NN-kebab-case-title/index.md` (numbered for chronological ordering)
- **Projects**: `kebab-case-project/index.md`
- **Work entries**: `company-role.md` (flat, single file)
- **Legal docs**: `document-name.md` (flat, single file)

**Example paths**:
```
src/content/blog/08-Building-a-Secure-SSH-Manager-with-Go-A-Developers-Guide/index.md
src/content/projects/payment-gateway/index.mdx
src/content/work/streamuniverse-devops.md
src/content/legal/privacy.md
```

---

## ADDING NEW CONTENT

### New Blog Post
1. Create directory: `src/content/blog/NN-title/`
2. Add `index.md` with frontmatter + content
3. Optionally add images to same directory

### New Project
1. Create directory: `src/content/projects/project-name/`
2. Add `index.md` or `index.mdx` with frontmatter
3. If MDX, import components: `import MyComponent from "@components/MyComponent.astro"`

### New Work Entry
1. Add file: `src/content/work/company-role.md`
2. Include frontmatter with company, role, dates

### New Legal Doc
1. Add file: `src/content/legal/doc-name.md`
2. Include title + date frontmatter

---

## KNOWN PATTERNS

1. **Draft filtering**: Always filter `!entry.data.draft` in public routes. No auto-hiding.
2. **Date handling**: `z.coerce.date()` converts YAML date strings → JavaScript Date objects.
3. **Slugs**: Auto-generated from file path. `blog/01-intro/index.md` → slug: `01-intro`.
4. **MDX usage**: Only `projects` and `work` collections support MDX. `blog` is Markdown-only.
5. **Asset colocation**: Store images in content subdirectories; reference via relative paths in markdown.

---

**For questions about content structure, schemas, or adding new entries, refer to this document.**
