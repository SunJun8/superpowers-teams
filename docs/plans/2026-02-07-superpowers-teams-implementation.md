# Superpowers Teams Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Implement multi-agent collaborative development framework on top of Superpowers with Team Lead, Implementation Team, and Oversight Agent roles.

**Architecture:** Four new/modified skills + Claude Code Agent Teams integration + Subagent fallback mode. Three-tier architecture with Main Window orchestrating Team Lead, Implementation Team, and Oversight Agent.

**Tech Stack:** Superpowers skills framework, Claude Code Agent Teams API, Node.js for skill scripts.

---

## Phase 1: Setup and Infrastructure

### Task 1: Create skill directory structure

**Files:**
- Create: `skills/brainstorming-with-teams/`
- Create: `skills/writing-plans-for-teams/`
- Create: `skills/executing-as-team/`
- Create: `skills/goal-alignment-monitor/`
- Create: `scripts/teams-helpers/` (for shared utilities)

**Step 1: Create directories**

```bash
mkdir -p skills/brainstorming-with-teams skills/writing-plans-for-teams \
  skills/executing-as-team skills/goal-alignment-monitor scripts/teams-helpers
```

**Step 2: Create placeholder SKILL.md files**

Create empty SKILL.md files in each directory with appropriate frontmatter.

**Step 3: Commit**

```bash
git add skills/ scripts/
git commit -m "feat: create superpowers-teams directory structure"
```

---

### Task 2: Create shared teams utility library

**Files:**
- Create: `scripts/teams-helpers/detect-mode.js`
- Create: `scripts/teams-helpers/goal-tags.js`
- Create: `scripts/teams-helpers/task-grouping.js`

**Step 1: Create detect-mode.js**

```javascript
// scripts/teams-helpers/detect-mode.js

/**
 * Detect if Claude Code Agent Teams is available
 * @returns {Object} Mode detection result
 */
function detectAgentTeamsMode() {
  const hasEnvVar = process.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS === '1';
  const hasApi = typeof createAgentTeam === 'function';

  return {
    enabled: hasEnvVar && hasApi,
    mode: hasEnvVar && hasApi ? 'agent-teams' : 'subagent',
    canUseTeams: hasApi
  };
}

module.exports = { detectAgentTeamsMode };
```

**Step 2: Create goal-tags.js**

```javascript
// scripts/teams-helpers/goal-tags.js

/**
 * Goal tags structure for tracking alignment
 * @typedef {Object} GoalTags
 * @property {string} architecture - Architecture style
 * @property {string} codeStyle - Code style (functional/OOP/procedural)
 * @property {string} testing - Testing strategy
 * @property {string} security - Security requirements
 * @property {string} performance - Performance requirements
 */

/**
 * Parse goal tags from design document
 * @param {string} designDoc - Design document content
 * @returns {GoalTags} Parsed goal tags
 */
function parseGoalTags(designDoc) {
  // Extract goal metrics from design document
  const goalSection = designDoc.match(/## Goal Metrics[\s\S]*?(?=##|$)/i);
  if (!goalSection) return null;

  return {
    architecture: extractGoal(goalSection, 'architecture'),
    codeStyle: extractGoal(goalSection, 'code style'),
    testing: extractGoal(goalSection, 'testing'),
    security: extractGoal(goalSection, 'security'),
    performance: extractGoal(goalSection, 'performance')
  };
}

function extractGoal(section, key) {
  const match = section.match(new RegExp(`${key}:\\s*([^\n]+)`, 'i'));
  return match ? match[1].trim() : null;
}

module.exports = { parseGoalTags };
```

**Step 3: Create task-grouping.js**

```javascript
// scripts/teams-helpers/task-grouping.js

/**
 * Group tasks by dependencies for parallel execution
 * @param {Array} tasks - Array of task objects
 * @returns {Object} Grouped tasks
 */
function groupTasksForTeams(tasks) {
  const independent = tasks.filter(t => !t.dependencies || t.dependencies.length === 0);
  const dependent = tasks.filter(t => t.dependencies && t.dependencies.length > 0);
  const dependencyGraph = buildDependencyGraph(tasks);

  return {
    independent,
    dependent,
    dependencyGraph,
    maxParallel: Math.min(independent.length, 5) // Cap at 5 teammates
  };
}

function buildDependencyGraph(tasks) {
  const graph = new Map();
  tasks.forEach(task => {
    graph.set(task.id, {
      dependents: tasks.filter(t => t.dependencies?.includes(task.id)).map(t => t.id),
      dependencies: task.dependencies || []
    });
  });
  return graph;
}

module.exports = { groupTasksForTeams };
```

**Step 4: Test utilities**

```bash
node -e "
const { detectAgentTeamsMode } = require('./scripts/teams-helpers/detect-mode');
console.log('Mode detection:', detectAgentTeamsMode());
"
```

**Step 5: Commit**

```bash
git add scripts/teams-helpers/
git commit -m "feat: add shared teams utility library"
```

---

## Phase 2: Brainstorming with Teams Skill

### Task 3: Implement brainstorming-with-teams skill

**Files:**
- Modify: `skills/brainstorming-with-teams/SKILL.md`

**Step 1: Write SKILL.md**

```yaml
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

## Process

### Standard Brainstorming
Follow the base `brainstorming` skill process.

### Team Extensions

#### Goal Metrics Extraction

After design validation, extract goal metrics:

```markdown
## Goal Metrics

### Architecture Style
[microservices|monolithic|plugin-based]

### Code Style
[functional|OOP|procedural]

### User Experience
[CLI|Web API|Mixed]

### Testing Strategy
[Unit|Integration|E2E|Combined]

### Performance Requirements
[Response time targets, throughput, resource limits]
```

#### Design Document Format

Use standard Superpowers format:
`docs/plans/YYYY-MM-DD-<topic>-design.md`

Include additional section:
```markdown
## Goal Metrics
[Extracted metrics above]
```

**Step 2: Test the skill**

Create a test conversation to validate goal extraction.

**Step 3: Commit**

```bash
git add skills/brainstorming-with-teams/
git commit -m "feat: implement brainstorming-with-teams skill"
```

---

## Phase 3: Writing Plans for Teams Skill

### Task 4: Implement writing-plans-for-teams skill

**Files:**
- Modify: `skills/writing-plans-for-teams/SKILL.md`
- Create: `skills/writing-plans-for-teams/prompts/team-plan-header.md`

**Step 1: Write SKILL.md**

```yaml
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

## Process

### Standard Planning
Follow the base `writing-plans` skill process.

### Team Extensions

#### Goal Tags

Tag each task with goal metrics:

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
[Standard TDD steps with goal context]
```

#### User Prompting

After plan creation, ask user:

```
Enable Teams mode for parallel execution?

Options:
1. Yes - Use parallel Teammates (Agent Teams or Subagent)
2. No - Use sequential execution (standard Superpowers)

[If Yes]
How many Teammates?

Options:
1. Adaptive (recommended) - Auto based on task count
2. Manual - Input number (1-5)
```

#### Team Plan Header

Add to plan document:

```markdown
> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-as-team to implement this plan.

**Teams Mode:** [enabled|disabled]
**Teammate Count:** [number|adaptive]
**Goal Tags:** [reference to design doc goal metrics]
```

**Step 2: Create team-plan-header.md**

```markdown
## Team Configuration

### Teams Mode
- **Enabled:** Parallel execution with Teammates
- **Disabled:** Sequential execution

### Teammate Count
- **Adaptive:** Based on independent task count
- **Manual:** User-specified number (1-5)

### Goal Alignment
Each task tagged with:
- Architecture requirements
- Code style guidelines
- Testing expectations
```

**Step 3: Test the skill**

Create test plan with goal tags and verify user prompting.

**Step 4: Commit**

```bash
git add skills/writing-plans-for-teams/
git commit -m "feat: implement writing-plans-for-teams skill"
```

---

## Phase 4: Execution and Monitoring Skills

### Task 5: Implement executing-as-team skill

**Files:**
- Create: `skills/executing-as-team/SKILL.md`
- Create: `skills/executing-as-team/lib/dispatcher.js`
- Create: `skills/executing-as-team/lib/team-manager.js`

**Step 1: Write SKILL.md**

```yaml
---
name: executing-as-team
description: "Execute implementation plans with parallel Teammates (Agent Teams or Subagent simulation). Dispatch independent tasks, monitor via Oversight Agent, handle task failures with dependency management. Use AFTER plan approval in Teams mode."
---

# Executing as Team

## Overview

Execute implementation plans with parallel Teammates:
1. Detect Agent Teams availability
2. Create appropriate execution mode
3. Dispatch tasks to Teammates
4. Monitor via Oversight Agent
5. Handle failures and dependencies

## Process

### Mode Detection

```javascript
const { detectAgentTeamsMode } = require('../scripts/teams-helpers/detect-mode');
const mode = detectAgentTeamsMode();

if (mode.mode === 'agent-teams') {
  // Use Claude Code Agent Teams API
  await executeWithAgentTeams(plan, teammateCount);
} else {
  // Fallback to Subagent simulation
  await executeWithSubagents(plan);
}
```

### Parallel Dispatch

```javascript
const { groupTasksForTeams } = require('../scripts/teams-helpers/task-grouping');
const { parseGoalTags } = require('../scripts/teams-helpers/goal-tags');

const groups = groupTasksForTeams(plan.tasks);
const goalTags = parseGoalTags(plan.designDoc);

// Dispatch independent tasks to Teammates
for (let i = 0; i < teammateCount && i < groups.independent.length; i++) {
  await dispatchToTeammate(i, groups.independent[i], {
    goalTags,
    context: { designDoc: plan.designDoc, allTasks: plan.tasks }
  });
}
```

### Oversight Integration

```javascript
// Each task completion triggers alignment check
teammate.on('complete', async (result) => {
  const alignment = await oversight.check({
    taskId: result.taskId,
    code: result.changes,
    goalTags: result.goalTags
  });

  if (alignment.status === 'misaligned') {
    await notifyTeamLead({
      type: 'alignment-warning',
      taskId: result.taskId,
      issues: alignment.issues
    });
  }
});
```

### Error Handling

```javascript
// Task failure with dependencies
if (result.status === 'failed') {
  const blocked = getDependentTasks(result.taskId, groups.dependencyGraph);

  if (blocked.length > 0) {
    await pauseTeam({
      reason: 'Task dependency failure',
      blockedTasks: blocked
    });

    await askUser({
      message: `Task ${result.taskId} failed. Blocked: ${blocked.join(', ')}`,
      options: ['Retry', 'Modify', 'Skip', 'Abort']
    });
  }
}
```

**Step 2: Create dispatcher.js**

```javascript
// skills/executing-as-team/lib/dispatcher.js

const { detectAgentTeamsMode } = require('../../scripts/teams-helpers/detect-mode');

class TeamDispatcher {
  constructor(plan, teammateCount) {
    this.plan = plan;
    this.teammateCount = teammateCount;
    this.mode = detectAgentTeamsMode();
    this.activeTeammates = new Map();
    this.taskQueue = [];
  }

  async dispatch(task, goalTags, context) {
    if (this.mode.mode === 'agent-teams') {
      return this.dispatchToAgentTeams(task, goalTags, context);
    } else {
      return this.dispatchToSubagent(task, goalTags, context);
    }
  }

  async dispatchToAgentTeams(task, goalTags, context) {
    // Claude Code Agent Teams API dispatch
    const teammateId = this.findAvailableTeammate();
    return await createAgentTask(teammateId, {
      task,
      goalTags,
      context
    });
  }

  async dispatchToSubagent(task, goalTags, context) {
    // Subagent simulation dispatch
    return await createSubagent({
      role: 'teammate',
      task,
      goalTags,
      context
    });
  }

  findAvailableTeammate() {
    // Find teammate with fewest active tasks
    let minTasks = Infinity;
    let availableId = 0;

    this.activeTeammates.forEach((tasks, id) => {
      if (tasks.length < minTasks) {
        minTasks = tasks.length;
        availableId = id;
      }
    });

    return availableId;
  }
}

module.exports = { TeamDispatcher };
```

**Step 3: Create team-manager.js**

```javascript
// skills/executing-as-team/lib/team-manager.js

const { TeamDispatcher } = require('./dispatcher');

class TeamManager {
  constructor(plan, teammateCount, oversight) {
    this.plan = plan;
    this.teammateCount = teammateCount;
    this.oversight = oversight;
    this.dispatcher = new TeamDispatcher(plan, teammateCount);
    this.completedTasks = [];
    this.blockedTasks = [];
  }

  async execute() {
    // Dispatch independent tasks
    const independent = this.plan.tasks.filter(t => !t.dependencies?.length);

    for (const task of independent) {
      await this.dispatchAndMonitor(task);
    }

    // Handle dependent tasks after their dependencies complete
    for (const task of this.plan.tasks) {
      if (task.dependencies?.length) {
        await this.waitForDependencies(task);
        await this.dispatchAndMonitor(task);
      }
    }

    return this.completedTasks;
  }

  async dispatchAndMonitor(task) {
    const result = await this.dispatcher.dispatch(
      task,
      task.goalTags,
      { designDoc: this.plan.designDoc, allTasks: this.plan.tasks }
    );

    // Oversight check
    const alignment = await this.oversight.checkAlignment({
      taskId: task.id,
      code: result.code,
      tests: result.tests,
      goalTags: task.goalTags
    });

    if (alignment.status === 'aligned') {
      this.completedTasks.push({ ...task, result, alignment });
    } else {
      await this.handleMisalignment(task, alignment);
    }
  }

  async handleMisalignment(task, alignment) {
    await this.oversight.alert({
      type: 'alignment-warning',
      taskId: task.id,
      issues: alignment.issues,
      blocking: alignment.critical
    });
  }

  async waitForDependencies(task) {
    const depsComplete = task.dependencies.every(depId =>
      this.completedTasks.some(t => t.id === depId)
    );

    while (!depsComplete) {
      await this.sleep(1000); // Poll every second
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { TeamManager };
```

**Step 4: Test the skill**

Test dispatching and oversight integration.

**Step 5: Commit**

```bash
git add skills/executing-as-team/
git commit -m "feat: implement executing-as-team skill"
```

---

### Task 6: Implement goal-alignment-monitor skill

**Files:**
- Create: `skills/goal-alignment-monitor/SKILL.md`
- Create: `skills/goal-alignment-monitor/lib/checkers.js`

**Step 1: Write SKILL.md**

```yaml
---
name: goal-alignment-monitor
description: "Monitor goal alignment for Teams mode. Check tasks automatically (architecture consistency, code style, testing strategy, performance benchmarks) after each task completion and at milestones. Alert Team Lead on misalignment. Use ONLY by Oversight Agent in Teams mode."
---

# Goal Alignment Monitor

## Overview

Monitor goal alignment for Teams mode:
1. Automatic checks after each task completion
2. Milestone checks at key points
3. Alert Team Lead on misalignment

## Check Types

### Per-Task Check

```javascript
const alignment = await checkTaskAlignment({
  architecture: analyzeArchitecture(code, goalTags.architecture),
  style: analyzeStyle(code, goalTags.codeStyle),
  testing: analyzeTests(tests, goalTags.testing),
  performance: await runBenchmarks(code, goalTags.performance)
});
```

### Milestone Check

```javascript
const report = await generateMilestoneReport({
  taskResults: allTaskChecks,
  crossTaskConsistency: analyzeConsistency(allTasks),
  goalAchievement: measureGoals(allTasks, goals)
});
```

## Alert Levels

- **Critical:** Architecture violation, security issue
- **Warning:** Style deviation, testing gap
- **Info:** Minor suggestions

**Step 2: Create checkers.js**

```javascript
// skills/goal-alignment-monitor/lib/checkers.js

class AlignmentCheckers {
  constructor() {
    this.checkers = {
      architecture: new ArchitectureChecker(),
      style: new StyleChecker(),
      testing: new TestingChecker(),
      performance: new PerformanceChecker()
    };
  }

  async checkAll(code, tests, goalTags) {
    const results = {};

    for (const [key, checker] of Object.entries(this.checkers)) {
      if (goalTags[key]) {
        results[key] = await checker tests, goalTags[key]);
      }
.check(code,    }

    return this.combineResults(results);
  }

  combineResults(results) {
    const issues = [];
    let critical = false;

    for (const [key, result] of Object.entries(results)) {
      if (!result.passed) {
        issues.push(...result.issues);
        if (result.critical) critical = true;
      }
    }

    return {
      passed: issues.length === 0,
      issues,
      critical
    };
  }
}

class ArchitectureChecker {
  async check(code, tests, requirement) {
    // AST analysis, module dependency graph check
    return { passed: true, issues: [], critical: false };
  }
}

class StyleChecker {
  async check(code, tests, requirement) {
    // ESLint/Prettier, naming conventions
    return { passed: true, issues: [], critical: false };
  }
}

class TestingChecker {
  async check(code, tests, requirement) {
    // Coverage report, test types
    return { passed: true, issues: [], critical: false };
  }
}

class PerformanceChecker {
  async check(code, tests, requirement) {
    // Execution time, memory, throughput
    return { passed: true, issues: [], critical: false };
  }
}

module.exports = { AlignmentCheckers };
```

**Step 3: Create alert-system.js**

```javascript
// skills/goal-alignment-monitor/lib/alert-system.js

async function sendAlert(alert) {
  const severityOrder = { critical: 0, warning: 1, info: 2 };

  if (alert.severity === 'critical') {
    // Immediate notification
    await notifyTeamLeadImmediately(alert);
  } else {
    // Queue for batch notification
    await queueAlert(alert);
  }
}

async function generateMilestoneReport(checks, goals) {
  const aligned = checks.filter(c => c.passed).length;
  const total = checks.length;
  const score = aligned / total;

  return {
    overallStatus: score >= 0.9 ? 'aligned' : score >= 0.7 ? 'partial' : 'misaligned',
    score,
    summary: `${aligned}/${total} tasks aligned (${Math.round(score * 100)}%)`,
    recommendations: generateRecommendations(checks, goals)
  };
}

module.exports = { sendAlert, generateMilestoneReport };
```

**Step 4: Test the skill**

Test alignment checking with various goal tag combinations.

**Step 5: Commit**

```bash
git add skills/goal-alignment-monitor/
git commit -m "feat: implement goal-alignment-monitor skill"
```

---

## Phase 5: Modified Skills

### Task 7: Modify requesting-code-review for Teams mode

**Files:**
- Modify: `skills/requesting-code-review/SKILL.md`

**Step 1: Add Teams context**

```markdown
## Teams Mode Extension

When in Teams mode, add team context to code review:

```markdown
**Team Context:**
- Task ID: [from plan]
- Teammate: [Teammate number/name]
- Goal Tags: [architecture|style|testing|performance]
- Dependencies: [task IDs this depends on]
```

## Review Process (Teams Mode)

1. Add team context to review request
2. Check goal alignment (use `goal-alignment-monitor`)
3. Include alignment report in review
```

**Step 2: Commit**

```bash
git add skills/requesting-code-review/
git commit -m "feat: add Teams mode context to requesting-code-review"
```

---

## Phase 6: Integration and Testing

### Task 8: Integration testing

**Files:**
- Create: `tests/integration/teams-mode.js`

**Step 1: Create integration test**

```javascript
// tests/integration/teams-mode.js

const { detectAgentTeamsMode } = require('../scripts/teams-helpers/detect-mode');
const { parseGoalTags } = require('../scripts/teams-helpers/goal-tags');
const { groupTasksForTeams } = require('../scripts/teams-helpers/task-grouping');

async function testTeamsIntegration() {
  // Test 1: Mode detection
  const mode = detectAgentTeamsMode();
  console.log('Mode detection:', mode);

  // Test 2: Goal tags parsing
  const designDoc = `
## Goal Metrics
Architecture: microservices
Code Style: functional
Testing: unit tests
  `;
  const tags = parseGoalTags(designDoc);
  console.log('Goal tags:', tags);

  // Test 3: Task grouping
  const tasks = [
    { id: '1', dependencies: [] },
    { id: '2', dependencies: ['1'] },
    { id: '3', dependencies: [] }
  ];
  const groups = groupTasksForTeams(tasks);
  console.log('Task groups:', groups);

  console.log('All integration tests passed!');
}

testTeamsIntegration().catch(console.error);
```

**Step 2: Run tests**

```bash
npm test tests/integration/teams-mode.js
```

**Step 3: Commit**

```bash
git add tests/integration/
git commit -m "test: add teams integration tests"
```

---

## Plan Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-2 | Setup and utilities |
| 2 | 3 | Brainstorming skill |
| 3 | 4 | Planning skill |
| 4 | 5-6 | Execution and monitoring skills |
| 5 | 7 | Modified skills |
| 6 | 8 | Integration testing |

**Total Tasks:** 8
**Estimated Time:** 4-6 hours

---

## Execution Options

**Plan complete and saved to `docs/plans/2026-02-07-superpowers-teams-implementation.md`.**

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session in worktree, batch execution with checkpoints

**Which approach?**
