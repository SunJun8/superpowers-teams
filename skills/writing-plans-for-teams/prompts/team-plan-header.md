## Team Configuration

### Teams Mode
- **Enabled:** Parallel execution with Teammates
- **Disabled:** Sequential execution (standard Superpowers)

### Teammate Count
- **Adaptive:** Based on independent task count
  - 1 independent task → 1 teammate
  - 2-3 independent tasks → match task count
  - 4+ independent tasks → 4 teammates (recommended max)

- **Manual:** User-specified number (1-5)
  - More teammates = more parallel work
  - More teammates = more coordination overhead

### Goal Alignment

Each task tagged with goal metrics from design document:

```markdown
**Goal Tags:**
- architecture: [from design doc]
- style: [from design doc]
- testing: [from design doc]
- security: [optional]
- performance: [optional]
```

### Task Dependencies

Tasks marked with dependencies:

```markdown
**Dependencies:**
- Task 1: [task ID or description]
```

Independent tasks can run in parallel. Dependent tasks wait for their dependencies.

## Example

```
Teams Mode: Enabled
Teammate Count: Adaptive (3 independent tasks)

Task 1: Setup project structure
Goal Tags:
- architecture: microservices
- style: functional

Task 2: Implement auth service
Goal Tags:
- architecture: microservices
- style: functional
Dependencies: Task 1

Task 3: Create user API
Goal Tags:
- architecture: microservices
- style: functional
Dependencies: Task 2

Task 4: Write unit tests
Goal Tags:
- testing: unit
Dependencies: Task 2, Task 3
```
