# MS-003 — Foundation Refactor

## Status

In Progress

---

# Goal

Refactor the Human OS codebase into a scalable architecture without changing any existing functionality or user experience.

This milestone focuses exclusively on improving maintainability, modularity, and future extensibility.

No visible feature changes are expected.

---

# Objectives

- Modularize the Brain
- Modularize Memory
- Improve folder organization
- Reduce coupling
- Improve developer experience
- Preserve all existing functionality

---

# Non-Goals

This milestone will NOT introduce:

- New AI capabilities
- New UI features
- New integrations
- New APIs
- New onboarding steps

---

# Success Criteria

- Existing pages continue working.
- Chat continues functioning.
- Memory continues functioning.
- Dashboard continues functioning.
- Sidebar navigation continues functioning.
- Personalized AI continues functioning.
- No breaking changes.

---

# Refactor Plan

## Phase 1

Memory Modularization

Current:

brain/memory.ts

Target:

brain/memory/
    engine.ts
    extractor.ts
    prompt.ts
    store.ts
    types.ts
    index.ts

---

## Phase 2

Brain Cleanup

Separate:

- Context
- Knowledge
- Profile
- Orchestrator
- Runtime

into clearly defined modules.

---

## Phase 3

Shared State

Introduce dedicated state modules.

Examples:

- Memory
- Profile
- Mission
- Planner
- Dashboard

---

## Phase 4

Component Organization

Separate UI into feature folders.

Example:

components/

chat/

dashboard/

memory/

planner/

common/

layout/

---

# Definition of Done

Before completing MS-003:

- Build passes
- No runtime errors
- All pages load
- Chat works
- Memory works
- Dashboard works
- Documentation updated
- Commit created

---

# Architecture Rule

Every future feature must satisfy:

Feature
↓

Brain
↓

State
↓

API
↓

UI

Never the reverse.

---

# Future Milestones

MS-004 — Conversation Memory v2

MS-005 — Planner Intelligence

MS-006 — Mission Engine

MS-007 — Calendar Intelligence

MS-008 — Knowledge Graph