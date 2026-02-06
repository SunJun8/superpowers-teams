---
title: Superpowers Teams Design
date: 2026-02-07
status: Draft
author: JoJo
---

# Superpowers Teams Design Document

## Executive Summary

**Core Goal:** Create an independent framework on top of Superpowers that supports multi-agent collaborative development.

**Key Features:**
- Three-tier architecture: Main Window → Team Lead → Implementation Team + Oversight
- Claude Code Agent Teams integration (primary) + Subagent fallback
- Five-phase workflow: Goal Setting → Task Allocation → Execution → Review → Completion
- Four new skills + two modified skills

---

## Chapter 1: Architecture Overview

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Main Window                          │
│  Responsibilities:                                      │
│  - Orchestrate task workflows                          │
│  - Communicate with user for next steps                │
│  - Manage team lifecycle                               │
└─────────────────────────────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
         ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Team Lead   │  │  Impl. Team  │  │   Oversight  │
│  (Leader)    │  │  (Executors) │  │  (Monitor)   │
├──────────────┤  ├──────────────┤  ├──────────────┤
│ Brainstorming│  │ Teammate 1   │  │ Goal Monitor │
│ Planning     │  │ Teammate 2   │  │ Deviation    │
│ Goal Setting │  │ Teammate 3   │  │ Alert/Correct│
└──────────────┘  └──────────────┘  └──────────────┘
```

### Agent Teams Integration

- **Primary:** Claude Code Agent Teams (experimental feature, detected via `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`)
- **Fallback:** Subagent mechanism (simulate three roles with Subagent instances)

### Relationship with Existing Skills

| New Skill | Based On | Unique Functionality |
|-----------|----------|---------------------|
| `brainstorming-with-teams` | `brainstorming` | Team context passing, goal metrics extraction |
| `writing-plans-for-teams` | `writing-plans` | Goal tags, task dependency analysis, user prompting |
| `executing-as-team` | `dispatching-parallel-agents` + `subagent-driven-development` | True parallel execution, Oversight monitoring |
| `goal-alignment-monitor` | **New** | Goal alignment checking, deviation alerts |

### Unchanged Skills

- `test-driven-development` - TDD workflow unchanged
- `systematic-debugging` - Debugging workflow unchanged
- `using-git-worktrees` - Git worktree workflow unchanged
- `finishing-a-development-branch` - Completion workflow unchanged

---

## Chapter 2: Five-Phase Workflow

### Phase 1: Goal Setting

```
┌─────────────────────────────────────────────────────────┐
│  Team Lead (Main Window)                                │
├─────────────────────────────────────────────────────────┤
│  1. brainstorming-with-teams                            │
│     - Discuss requirements with user                    │
│     - Explore 2-3 design approaches                     │
│     - Present in sections (200-300 words/section)      │
│                                                          │
│  2. Generate Design Document                            │
│     - docs/plans/YYYY-MM-DD-<topic>-design.md         │
│     - Markdown format (consistent with Superpowers)     │
│                                                          │
│  3. Extract Goal Metrics                                │
│     - Qualitative: architecture consistency, code style,│
│                    user experience                      │
│     - Pass to Oversight Agent                           │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  Oversight Agent                                        │
├─────────────────────────────────────────────────────────┤
│  Receive goal metrics, establish baseline               │
└─────────────────────────────────────────────────────────┘
```

**Input:** User requirements
**Output:** Design document + goal metrics
**New Skill:** `brainstorming-with-teams`
**Based On:** `brainstorming`

---

### Phase 2: Task Allocation

```
┌─────────────────────────────────────────────────────────┐
│  Team Lead (Main Window)                                │
├─────────────────────────────────────────────────────────┤
│  1. writing-plans-for-teams                             │
│     - Create detailed implementation plan               │
│     - Each task takes 2-5 minutes                       │
│     - Include file paths, code, verification steps      │
│     - Tag each task with goal metrics                  │
│                                                          │
│  2. Task Grouping                                       │
│     - Identify independent tasks (can parallelize)     │
│     - Identify dependent tasks (sequential)           │
│     - Generate task dependency graph                   │
│                                                          │
│  3. Ask User                                            │
│     - "Enable Teams mode?"                             │
│     - "How many Teammates for parallel execution?"     │
│     - "Adaptive mode or manual count?"                  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  Wait for User │
                    └───────────────┘
```

**Input:** Design document
**Output:** Implementation plan + task grouping + user choice
**New Skill:** `writing-plans-for-teams`
**Based On:** `writing-plans`

---

### Phase 3: Execution Monitoring

```
┌─────────────────────────────────────────────────────────┐
│  Team Lead (Main Window)                                │
├─────────────────────────────────────────────────────────┤
│  1. Create Teams                                        │
│     - Check CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS       │
│     - Enabled → Create Agent Teams                      │
│     - Disabled → Use Subagent simulation                │
│                                                          │
│  2. Assign Tasks                                        │
│     - Distribute independent tasks to Teammates        │
│     - Start parallel execution                          │
└─────────────────────────────────────────────────────────┘
         
         ┌────────────────────────────────────────┐
         │         Implementation Team            │
         ├────────────────────────────────────────┤
         │  Teammate 1    Teammate 2    Teammate 3│
         │  ├─ Task A     ├─ Task B     ├─ Task C │
         │  ├─ TDD        ├─ TDD        ├─ TDD    │
         │  └─ Commit     └─ Commit     └─ Commit │
         └────────────────────────────────────────┘
                          │
                          │ After each task completes
                          ▼
         ┌────────────────────────────────────────┐
         │       Oversight Agent                   │
         ├────────────────────────────────────────┤
         │  1. Check task completion status        │
         │  2. Read code and test results         │
         │  3. Goal alignment check (auto)        │
         │     - Code analysis: architecture check │
         │     - Test results: coverage, perf      │
         │     - Code style: linting, format      │
         │  4. Send alert/correction              │
         │     - Aligned ✅ → Continue            │
         │     - Deviated ❌ → Notify Main        │
         └────────────────────────────────────────┘
                          │
                          ▼
         ┌────────────────────────────────────────┐
         │         Team Lead (Main Window)         │
         ├────────────────────────────────────────┤
         │  Receive Oversight alerts              │
         │  - Decide action (retry/modify/skip)    │
         │  - Notify user                         │
         └────────────────────────────────────────┘
```

**Input:** Implementation plan + Teammate count
**Output:** Completed tasks + alignment reports
**New Skills:** `executing-as-team`, `goal-alignment-monitor`
**Reused Logic:** `dispatching-parallel-agents` (parallel dispatch), `subagent-driven-development` (Subagent simulation)

---

### Phase 4: Review Loop

```
┌─────────────────────────────────────────────────────────┐
│  Implementation Team                                    │
├─────────────────────────────────────────────────────────┤
│  1. requesting-code-review (modified)                   │
│     - Trigger after each task completes                 │
│     - Add team context (task ID, Teammate info)        │
│     - Generate code review report                       │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  Oversight Agent                                        │
├─────────────────────────────────────────────────────────┤
│  2. goal-alignment-check (milestone check)             │
│     - Trigger at key milestones                        │
│     - Check overall goal alignment                     │
│     - Generate milestone report                         │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  Team Lead (Main Window)                               │
├─────────────────────────────────────────────────────────┤
│  3. Merge reports                                      │
│     - Collect code review reports                      │
│     - Collect alignment check reports                  │
│     - Present to user                                  │
└─────────────────────────────────────────────────────────┘
```

**Input:** Completed tasks
**Output:** Code review reports + milestone report
**Modified Skill:** `requesting-code-review` (add team context)
**New Skill:** `goal-alignment-monitor` (milestone check)

---

### Phase 5: Completion

```
┌─────────────────────────────────────────────────────────┐
│  Team Lead (Main Window)                                │
├─────────────────────────────────────────────────────────┤
│  1. Verify goal achievement                            │
│     - Run full test suite                              │
│     - Check against goal metrics                       │
│     - Generate final report                            │
│                                                          │
│  2. Use finishing-a-development-branch                  │
│     - Verify tests                                     │
│     - Present options (merge/PR/keep/discard)           │
│     - Execute user choice                              │
│                                                          │
│  3. Clean up team                                      │
│     - Dismiss Agent Teams or Subagent                   │
│     - Commit design document to git                    │
└─────────────────────────────────────────────────────────┘
```

**Input:** All completed tasks
**Output:** Final report + git operations
**Based On:** `finishing-a-development-branch`

---

## Chapter 3: New Skills Detail

### Skill 1: brainstorming-with-teams

**Based On:** `brainstorming`

**New Features:**

1. **Team Context Passing**
   - Record key decisions during discussion
   - Extract goal metrics for Oversight Agent
   - Generate structured design summary

2. **Goal Metrics Extraction**
   ```
   Qualitative Metrics:
   - Architecture Style: [Microservices/Monolithic/Plugin-based]
   - Code Style: [Functional/OOP/Procedural]
   - User Experience: [CLI/Web/API/Mixed]
   - Testing Strategy: [Unit/Integration/E2E]
   - Performance Requirements: [Response Time/Throughput/Limits]
   ```

3. **Output Format**
   - `docs/plans/YYYY-MM-DD-<topic>-design.md` (Markdown)
   - Sections: Overview, Architecture, Components, Data Flow, Error Handling, Testing, Goal Metrics

**Description:**
```yaml
name: brainstorming-with-teams
description: "Team-focused brainstorming that extracts qualitative goals (architecture style, code style, UX, testing strategy) for Oversight Agent monitoring. Use BEFORE any creative work in Teams mode."
```

---

### Skill 2: writing-plans-for-teams

**Based On:** `writing-plans`

**New Features:**

1. **Task Goal Tagging**
   ```markdown
   ## Task 1: Implement user authentication

   **Goal Tags:**
   - architecture: microservices (separate auth service)
   - style: functional (pure functions, no side effects)
   - testing: unit tests for each function
   - security: JWT tokens, bcrypt hashing

   **Steps:**
   1. Create `src/auth/service.ts`
   2. Implement `login()` function
   ...
   ```

2. **Task Dependency Analysis**
   - Identify independent tasks (can parallelize)
   - Identify dependent tasks (sequential)
   - Generate task dependency graph

3. **User Prompting**
   ```
   Enable Teams mode?

   Options:
   1. Yes - Detected Agent Teams, use parallel mode
   2. No - Use Subagent fallback mode
   3. Cancel - Use standard Superpowers workflow

   How many Teammates for parallel execution?

   Options:
   1. Adaptive (recommended) - Auto based on task count
   2. Manual - Input count (1-5)
   ```

**Description:**
```yaml
name: writing-plans-for-teams
description: "Create implementation plans with goal tags (architecture, code style, testing strategy, UX requirements) and task dependency analysis for Teammate assignment. Ask user about Teams mode and Teammate count. Use AFTER design approval in Teams mode."
```

---

### Skill 3: executing-as-team

**Based On:** `dispatching-parallel-agents` + `subagent-driven-development`

**Core Functions:**

1. **Environment Detection and Mode Selection**
   ```typescript
   const hasAgentTeams = process.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS === '1';

   if (hasAgentTeams) {
     await createAgentTeam({
       teamLead: 'main',
       teammates: teammateCount,
       oversight: 'independent'
     });
   } else {
     await useSubagentSimulation({
       roles: ['team-lead', 'teammate', 'oversight'],
       mode: 'sequential'
     });
   }
   ```

2. **Parallel Task Dispatch**
   - Use task grouping from `writing-plans-for-teams`
   - Distribute independent tasks to different Teammates
   - Pass goal tags and context

3. **Oversight Monitoring Integration**
   ```typescript
   teammate.on('taskComplete', async (result) => {
     const alignment = await oversight.checkAlignment({
       taskId: result.taskId,
       code: result.code,
       tests: result.tests,
       goalTags: result.goalTags
     });

     if (alignment.status === 'misaligned') {
       await mainSession.notify({
         type: 'alignment-warning',
         taskId: result.taskId,
         issues: alignment.issues
       });
     }
   });
   ```

4. **Error Handling and Dependency Management**
   ```typescript
   if (taskResult.status === 'failed') {
     const dependents = plan.tasks.filter(t =>
       t.dependencies.includes(taskResult.taskId)
     );

     if (dependents.length > 0) {
       await pauseTeam({
         reason: 'Task dependency failure',
         blockedTasks: dependents.map(t => t.id)
       });

       await mainSession.askUser({
         message: `Task ${taskResult.taskId} failed. Blocked: ${dependents.map(t => t.id).join(', ')}`,
         options: ['Retry', 'Modify task', 'Skip and continue', 'Abort']
       });
     }
   }
   ```

5. **Reused Logic**
   - Parallel dispatch: `dispatching-parallel-agents` task identification
   - Subagent mode: `subagent-driven-development` prompt templates

**Description:**
```yaml
name: executing-as-team
description: "Execute implementation plans with parallel Teammates (Agent Teams or Subagent simulation). Dispatch independent tasks, monitor via Oversight Agent, handle task failures with dependency management. Use AFTER plan approval in Teams mode."
```

---

### Skill 4: goal-alignment-monitor

**Type:** Brand new skill

**Core Functions:**

1. **Per-Task Check**
   ```typescript
   interface TaskAlignmentCheck {
     taskId: string;
     code: CodeChange[];
     tests: TestResult[];
     goalTags: GoalTags;
   }

   const alignment = await checkTaskAlignment({
     architecture: analyzeArchitecture(code, goalTags.architecture),
     style: analyzeStyle(code, goalTags.style),
     testing: analyzeTests(tests, goalTags.testing),
     performance: await runBenchmarks(code, goalTags.performance)
   });

   return {
     status: alignment.passed ? 'aligned' : 'misaligned',
     issues: alignment.issues,
     suggestions: alignment.suggestions
   };
   ```

2. **Milestone Check**
   ```typescript
   interface MilestoneCheck {
     milestone: string;
     tasks: string[];
     goals: GoalTags;
   }

   const report = await generateMilestoneReport({
     taskResults: allTaskChecks,
     crossTaskConsistency: analyzeConsistency(allTasks),
     goalAchievement: measureGoals(allTasks, goals),
     risks: identifyRisks(allTasks, goals)
   });

   return {
     overallStatus: 'aligned' | 'partial' | 'misaligned',
     summary: report.summary,
     detailedFindings: report.findings,
     recommendations: report.recommendations
   };
   ```

3. **Auto Detection Methods**
   - **Architecture Consistency**: AST analysis, module dependency graph, design pattern matching
   - **Code Style**: ESLint/Prettier, function signature analysis, naming conventions
   - **Testing Strategy**: Coverage report, test types (unit/integration/E2E)
   - **Performance Benchmarks**: Execution time, memory usage, throughput tests

4. **Alert Mechanism**
   ```typescript
   if (alignment.status === 'misaligned') {
     await notifyTeamLead({
       severity: 'critical' | 'warning' | 'info',
       taskId: check.taskId,
       issues: alignment.issues,
       blocking: alignment.critical
     });
   }
   ```

**Description:**
```yaml
name: goal-alignment-monitor
description: "Monitor goal alignment for Teams mode. Check tasks automatically (architecture consistency, code style, testing strategy, performance benchmarks) after each task completion and at milestones. Alert Team Lead on misalignment. Use ONLY by Oversight Agent in Teams mode."
```

---

## Appendix A: Skill Summary

| Skill | Type | Description |
|-------|------|-------------|
| `brainstorming-with-teams` | Modified | Add team context and goal metrics extraction |
| `writing-plans-for-teams` | Modified | Add goal tags, task dependency analysis, user prompting |
| `executing-as-team` | New | Parallel execution, Oversight integration, error handling |
| `goal-alignment-monitor` | New | Automatic alignment check, milestone check, alerts |

---

## Appendix B: Configuration and Persistence

**Configuration:**
- Ask user at runtime, do not persist

**State Persistence:**
- Save design documents to git
- Do not save runtime state
- Restart fresh each session

---

## Appendix C: Error Handling Strategy

- **Task Failure:** Check dependencies, pause team, ask user
- **Dependency Chain:** If Task B depends on Task A and Task A fails, pause Task B
- **User Intervention:** Notify main window, let user decide (retry/modify/skip/abort)

---

*Document Version: 1.0*
*Created: 2026-02-07*
*Status: Draft - Pending Implementation*
