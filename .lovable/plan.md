
## What I'll build

Since you skipped the scope question, I'm defaulting to a **two-part deliverable** that gives you both something to show and something to send to investors/partners:

1. A polished, multi-section **CivicOS landing/pitch site** inside this app.
2. A downloadable **strategy document** (Markdown + PDF) containing the full design brief.

No backend, no AI wiring, no auth yet — this is the vision/pitch layer. The MVP build is a separate follow-up once direction is locked.

---

## 1. Landing / pitch site

Design direction: government-grade trust meets modern product marketing. Deep indigo + saffron accent, Inter/Space Grotesk pairing, generous whitespace, mobile-first, subtle motion. Ashoka-inspired mark (abstract, not the official emblem).

Route structure (TanStack file-based):

```text
src/routes/
  index.tsx              Home: hero, problem, solution, feature grid, CTA
  features.tsx           Deep dive on 8 core modules
  architecture.tsx       AI stack, system architecture, data flow diagrams
  journeys.tsx           User journey walkthroughs (RTI, scheme, grievance...)
  pitch.tsx              Business model, market, competition, roadmap, ask
  __root.tsx             Updated head metadata + shared nav/footer
```

Sections on Home:
- Hero: "India's Citizen Operating System" + voice-first demo mock
- Problem: fragmentation stats, 3-column pain points
- Solution: "Describe your problem. We handle the rest." with animated example prompts
- 8 core modules as bento grid
- How it works (3-step)
- Competitive table (UMANG, CPGRAMS, DigiLocker, Nyaaya, etc.)
- Trust & security strip
- Footer CTA

Components: reuse shadcn `card`, `badge`, `button`, `tabs`, `accordion` for feature deep-dives and competitor comparison.

Head metadata per route: unique title/description/OG for each page.

## 2. Strategy document artifact

Single Markdown file written to `/mnt/documents/CivicOS_Strategy.md` covering every section you listed:

- Executive Summary
- Problem Statement
- Vision & Mission
- Target Users & Personas
- Market Opportunity (TAM/SAM/SOM for India)
- Unique Value Proposition
- Core Features (8 modules, detailed)
- AI Architecture (intent detection, RAG, OCR, STT/TTS, translation, agent orchestration — with recommended models)
- Technical Architecture (frontend, backend, DB, cloud, integrations)
- User Journeys (6 flows, step-by-step)
- Database Schema (key tables)
- API Design (representative endpoints)
- Security & Privacy (DPDP Act compliance, encryption, audit)
- UI Wireframes (text descriptions)
- Business Model (7 revenue streams)
- Go-to-Market Strategy (phased India rollout)
- Risk Analysis (legal, adoption, tech, regulatory)
- Product Roadmap (MVP → V1 → V2)
- Future AI Enhancements
- Investor Pitch Summary
- Competitive Analysis vs UMANG / CPGRAMS / DigiLocker / Nyaaya / Navparv / ZAT LAW / Sanhita AI / NyayAI

Delivered as `<presentation-artifact>` so you can download it directly.

## Out of scope (this pass)

- No Lovable Cloud / auth / DB provisioning
- No real AI calls or chat implementation
- No government API integrations
- No user accounts or trackers

## Next step after this

Once you approve, the natural follow-up is a **Phase-1 MVP**: enable Lovable Cloud, wire the AI Citizen Assistant chat (Gemini via Lovable AI Gateway) with a seed RAG corpus of schemes + rights, plus the Complaint/RTI generator. I'll propose that as a fresh plan when you're ready.

---

Approve to build, or tell me to shift scope (e.g. skip the doc, or jump straight to MVP).
