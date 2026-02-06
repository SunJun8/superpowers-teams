---
name: writing-plans-for-teams
description: "Create implementation plans with goal tags (architecture, code style, testing strategy, UX requirements) and task dependency analysis for Teammate assignment. Ask user about Teams mode and Teammate count. Use AFTER design approval in Teams mode."
---

# Writing Plans for Teams

## Overview

Enhanced planning skill for Teams mode that:
1. Adds goal tags to each task
2. Analyzes task dependencies
3. Prompts user for Teams mode and Teammate count
4.-ready Generates execution plan for `executing-as-team`

**This replaces the standard `writing-plans` skill when in Teams mode.**

## When to Use

Use this skill **AFTER design approval** when:
- Design document is complete and validated
- Goal metrics are extracted (from `brainstorming-with-teams`)
- Ready to create implementation plan

## The Process

### Step 1: Load Design Document

Read the design document created by `brainstorming-with-teams`:
- Location: `docs/plans/YYYY-MM-DD-<topic>-design.md`
- Extract Goal Metrics section
- Understand architecture and components

### Step 2: Create Implementation Plan

Follow base `writing-plans` structure:
- Bite-sized tasks (2-5 minutes each)
- TDD approach (RED → GREEN → REFACTOR)
- Exact file paths
- Complete code in plan

### Step 3: Add Team Extensions

**NEW: Add goal tags to each task**

```markdown
### Task N: [Component Name]

**Goal Tags:**
- architecture: [from design doc]
- style: [from design doc]
- testing: [from design doc]
- security: [optional]
- performance: [optional]

**Files:**
- Create: `path/to/file`
- Modify: `path/to/existing:line-range`

**Steps:**
1. Write failing test
2. Run test (verify fail)
3. Write minimal code
4. Run test (verify pass)
5. Commit
```

**NEW: Mark task dependencies**

```markdown
**Dependencies:**
- [Task ID or description]
- [Leave empty if independent]
```

### Step 4: Analyze Dependencies

Use task grouping utilities:
```javascript
const { groupTasksForTeams } = require('../scripts/teams-helpers/task-grouping');
const groups = groupTasksForTeams(plan.tasks);

// Identify:
// - Independent tasks (can parallelize)
// - Dependent tasks (sequential)
// - Dependency chains
```

### Step 5: User Prompting

**After plan creation, prompt user:**

```
Implementation plan complete.

Enable Teams mode for parallel execution?

Options:
1. Yes - Use parallel Teammates (Agent Teams or Subagent)
2. No - Use sequential execution (standard Superpowers)
```

**[If Yes]**

```
How many Teammates for parallel execution?

Options:
1. Adaptive (recommended) - Auto based on task count
2. Manual - Input number (1-5)

[If Adaptive selected]
Based on your plan:
- Independent tasks: [N]
- Suggested: [N] teammates
```

### Step 6: Add Team Header

Add to plan document header:

```markdown
> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-as-team` to implement this plan.

**Teams Mode:** [enabled|disabled]
**Teammate Count:** [number|adaptive]
**Goal Tags Reference:** See design document Goal Metrics section
**Task Count:** [N] tasks ([M] independent, [K] dependent)
```

## Plan Document Structure

```markdown
# [Feature Name] Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-as-team` to implement this plan.

**Goal:** [One sentence]

**Architecture:** [From design doc]

**Tech Stack:** [Key technologies]

**Teams Mode:** enabled
**Teammate Count:** adaptive
**Independent Tasks:** [N]
**Dependent Tasks:** [N]

---

### Task 1: [Name]

**Goal Tags:**
- architecture: [X]
- style: [Y]
- testing: [Z]

**Files:**
- Create: `path`
- Modify: `path:range`

**Steps:**
1. [RED] Write failing test
2. [GREEN] Write minimal code
3. [REFACTOR] Improve
4. Verify and commit

**Dependencies:** None

---

### Task 2: [Name]

**Goal Tags:**
- architecture: [X]
- style: [Y]
- testing: [Z]

...

**Dependencies:**
- Task 1
```

## Example Plan

```markdown
# User Authentication Implementation Plan

> **For Claude:** Use `superpowers:executing-as-team`.

**Goal:** JWT-based user authentication with bcrypt password hashing

**Teams Mode:** enabled
**Teammate Count:** adaptive

---

### Task 1: Setup project structure

**Goal Tags:**
- architecture: microservices
- style: functional
- testing: unit

**Files:**
- Create: `package.json`
- Create: `src/index.js`
- Create: `tests/setup.js`

**Steps:**
1. Write failing test for setup
2. Create minimal package.json
3. Create index.js entry point
4. Create test setup
5. Verify all pass
6. Commit

**Dependencies:** None

---

### Task 2: Implement JWT utilities

**Goal Tags:**
- architecture: microservices
- style: functional
- testing: unit

**Files:**
- Create: `src/auth/jwt.js`
- Create: `tests/auth/jwt.test.js`

**Steps:**
1. Write failing test for generateToken()
2. Implement generateToken()
3. Write failing test for verifyToken()
4. Implement verifyToken()
5. Write failing test for decodeToken()
6. Implement decodeToken()
7. Verify all pass
8. Commit

**Dependencies:** Task 1

---

### Task 3: Implement password hashing

**Goal Tags:**
- architecture: microservices
- style: functional
- security: bcrypt

**Files:**
- Create: `src/auth/password.js`
- Create: `tests/auth/password.test.js`

**Steps:**
1. Write failing test for hashPassword()
2. Implement hashPassword() with bcrypt
3. Write failing test for verifyPassword()
4. Implement verifyPassword()
5. Verify all pass
6. Commit

**Dependencies:** Task 1
```

## User Interaction Examples

### Example 1: Enable Teams Mode

```
You: Enable Teams mode for parallel execution?

User: Yes

You: How many Teammates?

Options:
1. Adaptive (recommended)
2. Manual

User: Adaptive

You: Based on your plan:
- Independent tasks: 2 (Task 1, Task 5)
- Suggested: 2 teammates

Starting with 2 teammates.
```

### Example 2: Disable Teams Mode

```
You: Enable Teams mode for parallel execution?

User: No

You: Using sequential execution (standard Superpowers).

Use `superpowers:subagent-driven-development` for implementation.
```

## Key Differences from Base Skill

| Aspect | Base `writing-plans` | Teams Version |
|--------|---------------------|---------------|
| Task format | Standard | + Goal tags |
| Dependencies | Not marked | Explicitly marked |
| User prompt | Execution method | + Teams mode + Teammate count |
| Output skill | `executing-plans` | `executing-as-team` |

## Integration Points

- **Before:** `brainstorming-with-teams` (design + goal metrics)
- **After:** `executing-as-team` (parallel implementation)
- **Utilities:** `scripts/teams-helpers/` (task grouping)

## Common Mistakes

### ❌ Missing Goal Tags

**Wrong:** Task without goal tags
**Right:** Every task has goal tags section

### ❌ Unmarked Dependencies

**Wrong:** Assuming dependencies are obvious
**Right:** Explicitly mark dependencies for every task

### ❌ Wrong Teammate Count

**Wrong:** Always using 5 teammates
**Right:** Use adaptive or ask user preference

## Validation Checklist

Before saving plan:
- [ ] All tasks have goal tags
- [ ] All dependencies marked
- [ ] Task count matches dependency graph
- [ ] User prompted for Teams mode
- [ ] User confirmed Teammate count (if enabled)
- [ ] Header includes Teams configuration
