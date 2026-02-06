/**
 * skills/executing-as-team/lib/team-manager.js
 *
 * Team management for parallel task execution
 */

const { TeamDispatcher } = require('./dispatcher');
const { groupTasksForTeams } = require('../../scripts/teams-helpers/task-grouping');

class TeamManager {
  /**
   * Create team manager for a plan
   * @param {Object} plan - Implementation plan
   * @param {number} teammateCount - Number of teammates
   * @param {Object} oversight - Oversight agent instance
   */
  constructor(plan, teammateCount, oversight) {
    this.plan = plan;
    this.teammateCount = teammateCount;
    this.oversight = oversight;
    this.dispatcher = new TeamDispatcher(plan, teammateCount);
    this.completedTasks = [];
    this.blockedTasks = [];
    this.runningTasks = [];
    this.taskResults = new Map();
  }

  /**
   * Execute all tasks in the plan
   * @returns {Promise<Object>} Execution result
   */
  async execute() {
    console.log(`Starting execution with ${this.teammateCount} teammates`);

    // Group tasks
    const groups = groupTasksForTeams(this.plan.tasks);

    console.log(`Independent tasks: ${groups.independent.length}`);
    console.log(`Dependent tasks: ${groups.dependent.length}`);

    // Dispatch independent tasks first
    await this.dispatchIndependentTasks(groups.independent);

    // Handle dependent tasks
    await this.dispatchDependentTasks(groups.dependent, groups.dependencyGraph);

    // Return results
    return {
      completed: this.completedTasks,
      blocked: this.blockedTasks,
      results: this.taskResults,
      summary: this.generateSummary()
    };
  }

  /**
   * Dispatch independent tasks in parallel
   * @param {Array} tasks - Independent tasks
   */
  async dispatchIndependentTasks(tasks) {
    const promises = [];

    for (let i = 0; i < Math.min(tasks.length, this.teammateCount); i++) {
      const task = tasks[i];
      if (task) {
        promises.push(this.dispatchAndMonitor(task));
      }
    }

    await Promise.all(promises);
  }

  /**
   * Dispatch dependent tasks after their dependencies complete
   * @param {Array} tasks - Dependent tasks
   * @param {Map} dependencyGraph - Dependency graph
   */
  async dispatchDependentTasks(tasks, dependencyGraph) {
    for (const task of tasks) {
      // Wait for dependencies
      await this.waitForDependencies(task);

      // Check if still not blocked
      if (!this.blockedTasks.includes(task.id)) {
        await this.dispatchAndMonitor(task);
      }
    }
  }

  /**
   * Dispatch a task and monitor with Oversight
   * @param {Object} task - Task to dispatch
   * @returns {Promise<Object>} Task result
   */
  async dispatchAndMonitor(task) {
    console.log(`Dispatching task: ${task.id}`);

    // Get goal tags from task
    const goalTags = task.goalTags || {};

    // Prepare context
    const context = {
      designDoc: this.plan.designDoc || '',
      allTasks: this.plan.tasks,
      completedTasks: this.completedTasks.map(t => t.id)
    };

    // Dispatch
    const dispatchResult = await this.dispatcher.dispatch(task, goalTags, context);

    if (!dispatchResult.success) {
      console.log(`Task ${task.id} dispatch failed: ${dispatchResult.error}`);
      return this.handleTaskFailure(task, dispatchResult.error);
    }

    // Track running task
    this.runningTasks.push(task.id);

    // Wait for task completion
    const result = await this.waitForTaskCompletion(dispatchResult);

    // Remove from running
    this.runningTasks = this.runningTasks.filter(id => id !== task.id);

    if (result.success) {
      // Run Oversight check
      const alignment = await this.runOversightCheck(task, result);

      // Record completion
      this.completedTasks.push({
        ...task,
        result,
        alignment
      });

      this.taskResults.set(task.id, {
        success: true,
        alignment,
        result
      });

      console.log(`Task ${task.id} completed with alignment: ${alignment.status}`);
    } else {
      this.handleTaskFailure(task, result.error);
    }

    return result;
  }

  /**
   * Wait for a task to complete
   * @param {Object} dispatchResult - Dispatch result
   * @returns {Promise<Object>} Task completion result
   */
  async waitForTaskCompletion(dispatchResult) {
    // In a real implementation, this would poll or use callbacks
    // For now, return the dispatch result
    return dispatchResult.result;
  }

  /**
   * Run Oversight alignment check
   * @param {Object} task - Task that completed
   * @param {Object} result - Task result
   * @returns {Promise<Object>} Alignment check result
   */
  async runOversightCheck(task, result) {
    if (!this.oversight) {
      return { status: 'not-checked', reason: 'No oversight agent' };
    }

    try {
      return await this.oversight.checkAlignment({
        taskId: task.id,
        code: result.code || result.changes || [],
        tests: result.tests || [],
        goalTags: task.goalTags || {}
      });
    } catch (error) {
      return {
        status: 'error',
        reason: error.message
      };
    }
  }

  /**
   * Wait for task dependencies to complete
   * @param {Object} task - Task to check
   */
  async waitForDependencies(task) {
    if (!task.dependencies || task.dependencies.length === 0) {
      return;
    }

    const dependencies = task.dependencies;

    for (const depId of dependencies) {
      // Check if dependency is in completed list
      const isComplete = this.completedTasks.some(t => t.id === depId);
      const isBlocked = this.blockedTasks.includes(depId);
      const isRunning = this.runningTasks.includes(depId);

      if (!isComplete && !isBlocked && !isRunning) {
        // Dependency not started, need to wait
        await this.waitForDependencyStart(depId);
      }

      // Wait for completion
      while (!isComplete && !isBlocked) {
        await this.sleep(1000);
        isComplete = this.completedTasks.some(t => t.id === depId);
        isBlocked = this.blockedTasks.includes(depId);
        isRunning = this.runningTasks.includes(depId);

        // If dependency failed or blocked, this task becomes blocked
        if (isBlocked) {
          this.blockedTasks.push(task.id);
          console.log(`Task ${task.id} blocked by ${depId}`);
          return;
        }
      }
    }
  }

  /**
   * Wait for a dependency to start
   * @param {string} depId - Dependency task ID
   */
  async waitForDependencyStart(depId) {
    while (!this.runningTasks.includes(depId) &&
           !this.completedTasks.some(t => t.id === depId) &&
           !this.blockedTasks.includes(depId)) {
      await this.sleep(500);
    }
  }

  /**
   * Handle task failure
   * @param {Object} task - Failed task
   * @param {string} error - Error message
   */
  async handleTaskFailure(task, error) {
    console.log(`Task ${task.id} failed: ${error}`);

    // Check for dependent tasks
    const groups = groupTasksForTeams(this.plan.tasks);
    const dependents = this.getDependentTasks(task.id, groups.dependencyGraph);

    if (dependents.length > 0) {
      // Block dependent tasks
      for (const depId of dependents) {
        if (!this.blockedTasks.includes(depId)) {
          this.blockedTasks.push(depId);
          console.log(`Blocked dependent task: ${depId}`);
        }
      }
    }

    // Record failure
    this.taskResults.set(task.id, {
      success: false,
      error,
      blockedDependents: dependents
    });

    return {
      success: false,
      taskId: task.id,
      error,
      blockedDependents: dependents
    };
  }

  /**
   * Get tasks that depend on a task
   * @param {string} taskId - Task ID
   * @param {Map} dependencyGraph - Dependency graph
   * @returns {Array} Dependent task IDs
   */
  getDependentTasks(taskId, dependencyGraph) {
    const node = dependencyGraph.get(taskId);
    return node ? node.dependents : [];
  }

  /**
   * Sleep helper
   * @param {number} ms - Milliseconds to sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate execution summary
   * @returns {Object} Summary
   */
  generateSummary() {
    const completed = this.completedTasks.length;
    const blocked = this.blockedTasks.length;
    const total = this.plan.tasks?.length || 0;

    const aligned = this.completedTasks.filter(t => t.alignment?.status === 'aligned').length;
    const misaligned = this.completedTasks.filter(t => t.alignment?.status === 'misaligned').length;

    return {
      totalTasks: total,
      completedTasks: completed,
      blockedTasks: blocked,
      alignedTasks: aligned,
      misalignedTasks: misaligned,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      alignmentRate: completed > 0 ? Math.round((aligned / completed) * 100) : 0
    };
  }
}

module.exports = { TeamManager };
