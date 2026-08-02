# EDD-001 — Orchestrator v2

**Status:** Draft

**Owner:** Human OS

**Related Documents:**

- HUMAN_OS_ARCHITECTURE_V1.md
- ADR-001-Orchestrator.md

---

# 1. Overview

This document describes the implementation plan for evolving the Human OS orchestrator into the central coordination layer of the platform.

The orchestrator already coordinates several capabilities, including intent detection, skill routing, context construction, and AI invocation.

The goal of Orchestrator v2 is to integrate additional platform capabilities while preserving existing behavior.

---

# 2. Problem Statement

Today the orchestrator coordinates:

- Brain initialization
- Intent detection
- Skill routing
- Context building
- AI provider

However, Human OS now contains additional capabilities that are not yet integrated:

- Digital DNA
- Profile Engine
- Profile Enrichment Engine

As a result, the AI does not yet benefit from long-term knowledge about the user.

---

# 3. Goals

The objectives of Orchestrator v2 are:

- Integrate the Human Profile into the orchestration pipeline.
- Execute the Enrichment Engine during conversation.
- Preserve existing runtime behavior.
- Prepare the orchestrator for future Memory integration.
- Maintain a single orchestration layer.

---

# 4. Non-Goals

This milestone does NOT include:

- Memory persistence
- Planner integration
- UI changes
- Dashboard updates
- Voice support
- Multi-agent orchestration

These capabilities will be introduced in future milestones.

---

# 5. Current Request Flow

User

↓

Initialize Brain

↓

Extract Memory

↓

Detect Intent

↓

Execute Skills

↓

Build Context

↓

AI Service

↓

Response

---

# 6. Target Request Flow

User

↓

Initialize Brain

↓

Load Human Profile

↓

Run Enrichment Engine

↓

Extract Memory

↓

Detect Intent

↓

Execute Skills

↓

Build Context

↓

AI Service

↓

Profile Update (Future)

↓

Memory Update (Future)

↓

Response

---

# 7. Implementation Plan

Phase 1

- Load Human Profile.
- Execute Enrichment Engine.
- Preserve existing behavior.

Phase 2

- Inject Human Profile into the Context Builder.

Phase 3

- Allow AI responses to update the profile.

Phase 4

- Introduce Memory integration.

---

# 8. Risks

Potential risks include:

- Changing request order.
- Breaking skill routing.
- Increasing orchestration complexity.
- Tight coupling between modules.

These risks will be mitigated through incremental implementation and behavior-preserving refactoring.

---

# 9. Success Criteria

The milestone is considered complete when:

- Existing behavior remains unchanged.
- Human Profile is available to the orchestrator.
- Enrichment Engine executes successfully.
- All tests continue to pass.
- The architecture remains modular.

---

# 10. Future Work

Future milestones will extend the orchestrator with:

- Long-term Memory
- Planner
- Calendar
- Email
- GitHub
- Voice
- Vision
- Multi-agent coordination

Orchestrator v2 provides the architectural foundation for these capabilities.