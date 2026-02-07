---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements. In Teams mode, adds team context for goal alignment checking.
---

# Requesting Code Review

Dispatch superpowers:code-reviewer subagent to catch issues before they cascade.

**Core principle:** Review early, review often.

**Teams Mode Extension:** When in Teams mode, include team context (task ID, Teammate, goal tags) for alignment-aware reviews.

## When to Request Review

**Mandatory:**
- After each task in subagent-driven development
- After completing major feature
- Before merge to main

**Optional but valuable:**
- When stuck (fresh perspective)
- Before refactoring (baseline check)
- After fixing complex bug

## How to Request

**1. Get git SHAs:**
```bash
BASE_SHA=$(git rev-parse HEAD~1)  # or origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. Dispatch code-reviewer subagent:**

Use Task tool with superpowers:code-reviewer type, fill template at `code-reviewer.md`

**Placeholders:**
- `{WHAT_WAS_IMPLEMENTED}` - What you just built
- `{PLAN_OR_REQUIREMENTS}` - What it should do
- `{BASE_SHA}` - Starting commit
- `{HEAD_SHA}` - Ending commit
- `{DESCRIPTION}` - Brief summary

**3. Act on feedback:**
- Fix Critical issues immediately
- Fix Important issues before proceeding
- Note Minor issues for later
- Push back if reviewer is wrong (with reasoning)

## Example

```
[Just completed Task 2: Add verification function]

You: Let me request code review before proceeding.

BASE_SHA=$(git log --oneline | grep "Task 1" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[Dispatch superpowers:code-reviewer subagent]
  WHAT_WAS_IMPLEMENTED: Verification and repair functions for conversation index
  PLAN_OR_REQUIREMENTS: Task 2 from docs/plans/deployment-plan.md
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661
  DESCRIPTION: Added verifyIndex() and repairIndex() with 4 issue types

[Subagent returns]:
  Strengths: Clean architecture, real tests
  Issues:
    Important: Missing progress indicators
    Minor: Magic number (100) for reporting interval
  Assessment: Ready to proceed

You: [Fix progress indicators]
[Continue to Task 3]
```

## Integration with Workflows

**Subagent-Driven Development:**
- Review after EACH task
- Catch issues before they compound
- Fix before moving to next task

**Executing Plans:**
- Review after each batch (3 tasks)
- Get feedback, apply, continue

**Ad-Hoc Development:**
- Review before merge
- Review when stuck

## Red Flags

**Never:**
- Skip review because "it's simple"
- Ignore Critical issues
- Proceed with unfixed Important issues
- Argue with valid technical feedback

**If reviewer wrong:**
- Push back with technical reasoning
- Show code/tests that prove it works
- Request clarification

See template at: requesting-code-review/code-reviewer.md

---

## Teams Mode Extension

When in Teams mode (enabled by `writing-plans-for-teams`), code review includes additional team context for goal alignment checking.

### Team Context Format

```markdown
**Team Context:**
- Task ID: [from plan, e.g., "Task 2"]
- Teammate: [Teammate number or ID, e.g., "Teammate 1"]
- Goal Tags:
  - architecture: [from design doc]
  - style: [from design doc]
  - testing: [from design doc]
  - security: [optional]
  - performance: [optional]
- Dependencies: [task IDs this task depends on]
```

### Teams Mode Review Process

1. **Add Team Context** to review request
2. **Run Goal Alignment Check** using `goal-alignment-monitor`
3. **Include Alignment Report** in review summary
4. **Flag Misaligned Issues** as Critical if goals are violated

### Example in Teams Mode

```
[Just completed Task 3 in Teams mode]

You: Requesting code review with team context.

BASE_SHA=$(git rev-parse HEAD~1)
HEAD_SHA=$(git rev-parse HEAD)

[Dispatch superpowers:code-reviewer subagent]
  WHAT_WAS_IMPLEMENTED: JWT token generation and verification
  PLAN_OR_REQUIREMENTS: Task 3 from docs/plans/auth-plan.md
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661
  DESCRIPTION: Implemented generateToken() and verifyToken()

  **Team Context:**
  - Task ID: Task 3
  - Teammate: Teammate 2
  - Goal Tags:
    - architecture: microservices
    - style: functional
    - testing: unit
    - security: JWT

[Oversight Agent runs alignment check...]
  ✅ Architecture: Aligned (no service coupling)
  ✅ Style: Aligned (pure functions)
  ⚠️ Testing: Minor issue (coverage 75%, target 80%)
  ✅ Security: Aligned (JWT implementation correct)

[Code-reviewer subagent returns with alignment context]
  Strengths: Clean functional implementation
  Issues:
    Minor: Test coverage 75% (goal: 80%)
  Alignment Check:
    Status: Partially Aligned
    Issues: 1 (testing coverage)
  Assessment: Ready to proceed

You: [Add 2 more test cases to reach 80%]
[Commit and continue]
```

### Integration with Goal Alignment

When `goal-alignment-monitor` is active:
- Review request includes goal tags
- Oversight Agent checks alignment
- Alignment report is included in review summary
- Misaligned issues are flagged appropriately

### Modified Review Template for Teams

The `code-reviewer.md` template should include:

```markdown
**If in Teams mode:**

1. Check Team Context section for goal tags
2. Verify implementation aligns with stated goals:
   - Architecture: Does it match the stated style?
   - Code Style: Are patterns consistent with goal?
   - Testing: Does coverage meet requirements?
   - Security/Performance: Are requirements met?
3. Flag any goal violations in Issues section
4. Include alignment status in Assessment
```
