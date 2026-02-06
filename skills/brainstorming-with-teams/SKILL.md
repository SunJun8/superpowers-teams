---
name: brainstorming-with-teams
description: "Team-focused brainstorming that extracts qualitative goals (architecture style, code style, UX, testing strategy) for Oversight Agent monitoring. Use BEFORE any creative work in Teams mode."
---

# Brainstorming with Teams

## Overview

Enhanced brainstorming skill for Teams mode that:
1. Documents design discussions with team context
2. Extracts qualitative goal metrics for Oversight Agent
3. Generates structured design summary

## When to Use

Use this skill **BEFORE any creative work** (features, components, functionality) when:
- Building a new feature from scratch
- Designing a new architecture
- Planning significant refactoring
- Exploring alternative approaches

**This replaces the standard `brainstorming` skill when in Teams mode.**

## The Process

### Step 1: Understand the Context

Follow the base `brainstorming` skill process:
- Check current project state (files, docs, recent commits)
- Ask questions one at a time to refine the idea
- Focus on: purpose, constraints, success criteria

### Step 2: Explore Approaches

Still follow the base skill:
- Propose 2-3 different approaches with trade-offs
- Present options conversationally with recommendation
- Lead with your recommended option

### Step 3: Present Design (Teams Edition)

Follow the base skill pattern:
- Break into sections of 200-300 words
- Ask after each section whether it looks right

**NEW: Include Team Context in design sections**

### Step 4: Extract Goal Metrics

After design validation, extract qualitative goal metrics:

```markdown
## Goal Metrics

### Architecture Style
[microservices|monolithic|plugin-based|standard]

### Code Style
[functional|OOP|procedural|standard]

### User Experience
[CLI|Web API|Mixed|Standard CLI]

### Testing Strategy
[unit|integration|e2e|none|Combined]

### Performance Requirements
[Response time targets, throughput, resource limits - or 'none']

### Security Requirements
[Authentication, authorization, data protection - or 'none']
```

**These metrics will be passed to Oversight Agent for alignment checking.**

### Step 5: Save Design Document

Use standard Superpowers format:
- Location: `docs/plans/YYYY-MM-DD-<topic>-design.md`
- Include the Goal Metrics section

## Goal Metrics Format

### Required Metrics

| Metric | Options | Description |
|--------|---------|-------------|
| Architecture | microservices, monolithic, plugin-based | System structure |
| Code Style | functional, OOP, procedural | Programming paradigm |
| User Experience | CLI, Web API, Mixed | Primary interface |
| Testing | unit, integration, e2e, Combined | Test coverage strategy |

### Optional Metrics

| Metric | Options | Description |
|--------|---------|-------------|
| Performance | Specific targets or 'none' | Response time, throughput |
| Security | Specific requirements or 'none' | Auth, encryption, compliance |

### Example Goal Metrics Section

```markdown
## Goal Metrics

### Architecture Style
microservices - Separate services for auth, users, content

### Code Style
functional - Pure functions, immutable data, no side effects

### User Experience
CLI - Command-line interface with structured output

### Testing Strategy
unit+integration - Unit tests for utilities, integration for APIs

### Performance Requirements
< 100ms response time for API endpoints
Support 1000 concurrent connections

### Security Requirements
JWT-based authentication
Role-based access control (RBAC)
Data encryption at rest and in transit
```

## Output Format

### Design Document Structure

```markdown
# [Feature Name] Design Document

> **For Claude:** This document is for Teams mode. Use `superpowers:writing-plans-for-teams` to create implementation plans.

## Overview
[200-300 words]

## Architecture
[200-300 words]

## Components
[200-300 words]

## Data Flow
[200-300 words]

## Error Handling
[200-300 words]

## Testing
[200-300 words]

## Goal Metrics
[Extracted metrics as per format above]

## Open Questions
[Any items needing clarification]
```

## Team Integration

### Passing Context to Team Lead

When design is complete, pass context to `writing-plans-for-teams`:
- Full design document
- Extracted goal metrics
- Key decisions and trade-offs considered

### Example Handoff

```
Design document saved to `docs/plans/2026-02-07-feature-design.md`

Key decisions:
1. Chose microservices for scalability
2. Functional style for testability
3. JWT for stateless authentication

Ready for planning with Teams mode.
```

## After the Design

**Documentation:**
- ✅ Write validated design to `docs/plans/YYYY-MM-DD-<topic>-design.md`
- ✅ Commit the design document to git

**Implementation (if continuing):**
- Ask: "Ready to set up for implementation with Teams mode?"
- Use `superpowers:using-git-worktrees` to create isolated workspace
- Use `superpowers:writing-plans-for-teams` to create implementation plan with goal tags

## Key Principles

All base `brainstorming` principles apply:
- **One question at a time** - Don't overwhelm
- **Multiple choice preferred** - Easier to answer
- **YAGNI ruthlessly** - Remove unnecessary features
- **Explore alternatives** - Always propose 2-3 approaches

**Plus Teams-specific:**
- **Extract goals early** - Goal metrics drive Oversight monitoring
- **Document team context** - Decisions affect all team members
- **Keep metrics simple** - Complex goals are hard to validate

## Example Workflow

```
You: I want to build a user authentication system.

[Understanding phase...]
- Ask about scale (100 vs 1M users)
- Ask about compliance (GDPR, SOC2)
- Ask about integration (existing auth?)

[Exploration phase...]
- Option A: JWT tokens with bcrypt
- Option B: OAuth2 with social login
- Option C: Session-based with Redis
- Recommendation: Option A (JWT + bcrypt)

[Design presentation...]

[After approval]

## Goal Metrics

### Architecture Style
microservices - Separate auth service

### Code Style
functional - Pure functions for validation

### User Experience
CLI - Admin commands only

### Testing Strategy
unit+integration - 80% coverage

### Performance Requirements
< 50ms for token validation

### Security Requirements
bcrypt for password hashing, JWT for tokens

[Save to docs/plans/...]

Ready for planning!
```

## Common Mistakes

### ❌ Forgetting Goal Metrics

**Wrong:** Design document without goal section
**Right:** Always include Goal Metrics section

### ❌ Vague Metrics

**Wrong:** "Good performance"
**Right:** "< 100ms response time"

### ❌ Over-Engineering Goals

**Wrong:** 20 specific requirements
**Right:** 4-6 key metrics for Oversight to track

## Integration Points

- **Before:** User requirements discussion
- **After:** `writing-plans-for-teams` with goal tags
- **During:** Team Lead uses metrics for task assignment
- **Monitoring:** Oversight Agent uses metrics for alignment checks
