---
title: "Email Alias Generator: Test Registration Flows Without the Email Chaos"
summary: "Generate unlimited email aliases from a single inbox. Perfect for testing user registration flows, protecting your privacy, and tracking down who leaked your data."
date: "June 30 2026"
tags: ["tools", "development", "productivity", "privacy"]
draft: false
demoUrl: https://email-alias.mdhn.my.id
repoUrl: https://github.com/mhdramadhanarvin/email-alias-generator
---

Testing a new SaaS platform. You need to register three different accounts to verify the onboarding flow works end-to-end. Problem: you only have one email address, and the system blocks duplicate registrations.

Sound familiar?

This is the exact frustration that pushed me to build [Email Alias Generator](https://email-alias.mdhn.my.id) — a free, client-side tool that generates unlimited unique email aliases from a single inbox. No signup required. No backend. No data leaving your browser.

## The Problem with Testing Registration Flows

As a developer, I test a lot of platforms. Registration flows, email verification, OTP validation — all critical paths that need real-world testing.

But here's the reality:

- Most platforms block duplicate emails
- Creating throwaway email accounts is slow and annoying
- Managing multiple inboxes to collect OTP codes is a nightmare
- Some services require phone verification on top of email
- You need a different email for every test environment

You end up spending more time managing email accounts than actually testing the product.

## How Email Aliases Actually Work

Here's the thing most people don't realize: **your email provider already supports aliases**.

### Gmail's Dot Notation

Gmail ignores dots in the local part of your email address. These all deliver to the same inbox:

```
johndoe@gmail.com    →  your real inbox
john.doe@gmail.com   →  your real inbox
j.ohndoe@gmail.com   →  your real inbox
johndo.e@gmail.com   →  your real inbox
```

Same inbox. Different addresses. No configuration needed.

### The Math Behind It

For a username with `n` characters, you have `2^(n-1)` possible dot combinations. A 7-character name like `johndoe` generates **64 unique aliases**. An 8-character name generates **128 combinations**.

The Email Alias Generator automates this. Paste your email, pick how many dots to allow, and it generates all valid combinations instantly.

## Features That Make It Actually Useful

### One-Click Generation

Enter your email. Click generate. Get up to 20 aliases in milliseconds. No waiting, no API calls, no loading spinners.

### Copy Individual or Bulk

Each alias has its own copy button. Or hit "Copy All" to grab the entire list for bulk operations.

### Export to File

Download your aliases as a `.txt` file. Keep them for reference, import into your testing tools, or save for later.

### Shuffle Mode

Randomize the order of your aliases. Useful when you want variety and don't want to use the same first alias every time.

### 100% Client-Side

Your email is never sent to any server. The generation happens entirely in your browser. Refresh the page and the state clears. That's intentional — no data persistence means no data exposure.

## The Tech Stack

Built with a minimal, focused stack:

- **React 18** + **Vite** — Fast dev experience, optimized production builds
- **TypeScript** — Strict mode, zero `any` types
- **Tailwind CSS** — Utility-first styling with a custom dark theme
- **Lucide React** — Clean, consistent iconography
- **Cloudflare Pages** — Edge-deployed, globally fast, zero backend costs

The entire production bundle is **204KB** (55KB gzipped). Code splitting ensures you load only what you need.

## Real-World Use Cases

### 1. QA Testing

Test the same registration flow repeatedly without hitting "email already exists." Use a different alias for each test run. All OTP codes land in your real inbox.

### 2. Privacy & Data Tracking

Use a unique alias for every service you sign up for. If you start receiving spam on one specific alias, you know exactly which company leaked your data.

### 3. Development Staging

Test email workflows across multiple environments. Use `johndoe+staging1@gmail.com` for one environment, `johndoe+staging2@gmail.com` for another — and let the Gmail plus-addressing combine with dot-notation for maximum alias coverage.

### 4. B2B Demo Environments

Running demos? Generate fresh aliases for each prospect so you can track which demo emails get opened without revealing your real address.

## How to Use It Right Now

### Generate Aliases

1. Go to [email-alias.mdhn.my.id](https://email-alias.mdhn.my.id)
2. Enter any Gmail address (e.g., `yourname@gmail.com`)
3. Click **Generate**
4. Copy the aliases you need

### Important: Use Them Correctly

- **Gmail only**: This tool generates dot-notation aliases, which work with Gmail. Yahoo and some other providers support this too, but the primary target is Gmail.
- **One alias per registration**: Use each alias once. Reusing an alias on the same platform defeats the purpose.
- **No password recovery**: Remember your aliases. Gmail won't help you recover access to `j.oh.ndoe@gmail.com` if you forget you created it.

## What I Learned Building It

### Performance Matters in Utilities

This is a tool, not a landing page. Users expect it to be fast. The alias generation algorithm uses bit manipulation to generate all combinations in a single pass — no loops within loops, no unnecessary allocations. The result: generation is instant even for long email prefixes.

### Minimalism Scales

No user accounts. No database. No authentication. No backend. This decision came from the core problem: users need aliases NOW, not after they create an account. Every friction point you remove increases the tool's utility.

### Dark Mode Isn't Optional

Developers live in dark mode. Every dev tool, every code editor, every terminal — dark by default. Building a developer-focused utility with a light mode option would be tone-deaf. Commit to dark. Do it well.

## Get Started

**[Try Email Alias Generator →](https://email-alias.mdhn.my.id)**

No signup. No tracking. Works in your browser right now.

---

_Built with React, Vite, TypeScript, and Tailwind. Deployed on Cloudflare Pages. The source is open and available if you want to see how it works under the hood._
