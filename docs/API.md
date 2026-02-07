# Superpowers Teams API Reference

## External API Functions

These functions must be provided by the runtime environment:

### createAgentTask(teammateId, config)

Dispatch a task to an Agent Teams teammate.

**Parameters:**
- `teammateId` (number): The teammate identifier
- `config` (Object): Task configuration
  - `task` (Object): Task details
  - `goalTags` (Object): Goal metrics for alignment
  - `context` (Object): Shared context
  - `plan` (Object): Plan information

**Returns:**
- `Promise<Object>`: Task result
  - `success` (boolean)
  - `taskId` (string)
  - `result` (Object) or `error` (string)

**Example:**
```javascript
const result = await createAgentTask(0, {
  task: { id: '1', title: 'Setup' },
  goalTags: { architecture: 'microservices', style: 'functional' },
  context: { designDoc: '...', allTasks: [...] },
  plan: { title: 'Auth Service', goal: 'JWT auth', architecture: 'microservices' }
});
```

### createSubagent(config)

Create a subagent for task execution (fallback mode).

**Parameters:**
- `config` (Object): Subagent configuration
  - `role` (string): Agent role ('team-lead', 'teammate', 'oversight')
  - `task` (Object): Task details
  - `goalTags` (Object): Goal metrics
  - `context` (Object): Shared context

**Returns:**
- `Promise<Object>`: Subagent result
  - `success` (boolean)
  - `taskId` (string)
  - `result` (Object) or `error` (string)

**Example:**
```javascript
const result = await createSubagent({
  role: 'teammate',
  task: { id: '2', title: 'Auth Service' },
  goalTags: { architecture: 'microservices', security: 'JWT' },
  context: { designDoc: '...', completedTasks: ['1'] }
});
```

## Utility Functions

### detectAgentTeamsMode()

Detect current execution mode.

**Returns:**
- `Object`: Mode detection result
  - `enabled` (boolean): Agent Teams is available and enabled
  - `mode` (string): `'agent-teams'` or `'subagent'`
  - `canUseTeams` (boolean): Agent Teams API is available
  - `envVarSet` (boolean): Environment variable is set

**Example:**
```javascript
const { detectAgentTeamsMode } = require('../scripts/teams-helpers/detect-mode');

const mode = detectAgentTeamsMode();
if (mode.mode === 'agent-teams') {
  // Use Agent Teams
} else {
  // Use Subagent fallback
}
```

### parseGoalTags(designDoc)

Parse goal metrics from design document.

**Parameters:**
- `designDoc` (string): Design document content

**Returns:**
- `Object`: Parsed goal tags
  - `architecture` (string): Architecture style
  - `codeStyle` (string): Code style
  - `testing` (string): Testing strategy
  - `security` (string): Security requirements
  - `performance` (string): Performance requirements
  - `userExperience` (string): UX type

**Example:**
```javascript
const { parseGoalTags } = require('../scripts/teams-helpers/goal-tags');

const tags = parseGoalTags(designDoc);
// { architecture: 'microservices', codeStyle: 'functional', ... }
```

### groupTasksForTeams(tasks)

Group tasks by dependencies for parallel execution.

**Parameters:**
- `tasks` (Array): Array of task objects

**Returns:**
- `Object`: Grouped tasks
  - `independent` (Array): Tasks with no dependencies
  - `dependent` (Array): Tasks with dependencies
  - `dependencyGraph` (Map): Dependency relationships
  - `maxParallel` (number): Maximum parallel teammates
  - `totalTasks` (number): Total task count
  - `parallelizableTasks` (number): Independent task count

**Example:**
```javascript
const { groupTasksForTeams } = require('../scripts/teams-helpers/task-grouping');

const groups = groupTasksForTasks(tasks);
// { independent: [...], dependent: [...], maxParallel: 3, ... }
```

## Alignment Checking

### AlignmentChecker

Check code alignment with goal metrics.

**Methods:**

#### checkAll(code, tests, goalTags)

Run all applicable alignment checks.

**Parameters:**
- `code` (Object): Code changes
- `tests` (Object): Test results
- `goalTags` (Object): Goal metrics

**Returns:**
- `Promise<Object>`: Check result
  - `passed` (boolean): All checks passed
  - `issues` (Array): Array of issues
  - `critical` (boolean): Critical issues found

**Example:**
```javascript
const { AlignmentChecker } = require('./lib/checkers');

const checker = new AlignmentChecker();
const result = await checker.checkAll(
  { files: ['src/auth.js'] },
  { passed: 10, failed: 0, coverage: 92 },
  { architecture: 'microservices', style: 'functional' }
);
// { passed: true, issues: [], critical: false }
```

## Alert System

### AlertSystem

Manage alerts and notifications.

**Methods:**

#### sendAlert(alert)

Send an alert.

**Parameters:**
- `alert` (Object): Alert information
  - `taskId` (string): Task identifier
  - `type` (string): Alert type
  - `severity` (string): 'critical', 'warning', or 'info'
  - `issues` (Array): Array of issues

**Example:**
```javascript
const alertSystem = new AlertSystem();

await alertSystem.sendAlert({
  taskId: 'Task 3',
  type: 'alignment-misalignment',
  severity: 'warning',
  issues: [{ category: 'style', message: 'Side effects detected' }]
});
```

### generateMilestoneReport(options)

Generate milestone progress report.

**Parameters:**
- `options` (Object): Report options
  - `taskResults` (Array): Completed task results
  - `goals` (Object): Goal metrics
  - `milestoneName` (string): Milestone identifier

**Returns:**
- `Promise<Object>`: Milestone report
  - `summary` (Object): Task completion summary
  - `status` (string): 'aligned', 'partial', or 'misaligned'
  - `goalAchievements` (Object): Per-goal achievements
  - `recommendations` (Array): Improvement suggestions

## Error Handling Pattern

All functions follow consistent error handling:

```javascript
// Success case
return {
  success: true,
  data: result
};

// Failure case
return {
  success: false,
  error: errorMessage
};

// Usage
const result = await someFunction();
if (result.success) {
  processResult(result.data);
} else {
  handleError(result.error);
}
```
