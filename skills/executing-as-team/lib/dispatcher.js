/**
 * skills/executing-as-team/lib/dispatcher.js
 *
 * Task dispatcher for parallel Teammate execution
 */

const { detectAgentTeamsMode } = require('../../scripts/teams-helpers/detect-mode');

class TeamDispatcher {
  /**
   * Create dispatcher for a plan
   * @param {Object} plan - Implementation plan
   * @param {number} teammateCount - Number of teammates
   */
  constructor(plan, teammateCount) {
    this.plan = plan;
    this.teammateCount = teammateCount;
    this.mode = detectAgentTeamsMode();
    this.activeTeammates = new Map();
    this.taskQueue = [];
    this.completedTasks = new Map();

    // Initialize teammates
    for (let i = 0; i < teammateCount; i++) {
      this.activeTeammates.set(i, {
        id: i,
        currentTask: null,
        status: 'idle'
      });
    }
  }

  /**
   * Dispatch a task to a teammate
   * @param {Object} task - Task to dispatch
   * @param {Object} goalTags - Goal tags for this task
   * @param {Object} context - Shared context
   * @returns {Promise<Object>} Dispatch result
   */
  async dispatch(task, goalTags, context) {
    if (this.mode.mode === 'agent-teams') {
      return await this.dispatchToAgentTeams(task, goalTags, context);
    } else {
      return await this.dispatchToSubagent(task, goalTags, context);
    }
  }

  /**
   * Dispatch to Claude Code Agent Teams API
   * @param {Object} task - Task to dispatch
   * @param {Object} goalTags - Goal tags
   * @param {Object} context - Shared context
   * @returns {Promise<Object>} Dispatch result
   */
  async dispatchToAgentTeams(task, goalTags, context) {
    const teammateId = this.findAvailableTeammate();

    // Update teammate status
    this.activeTeammates.get(teammateId).currentTask = task.id;
    this.activeTeammates.get(teammateId).status = 'working';

    try {
      // Call Claude Code Agent Teams API
      const result = await createAgentTask(teammateId, {
        task,
        goalTags,
        context: {
          ...context,
          plan: {
            title: this.plan.title,
            goal: this.plan.goal,
            architecture: this.plan.architecture
          }
        }
      });

      return {
        success: true,
        taskId: task.id,
        teammateId,
        result
      };
    } catch (error) {
      return {
        success: false,
        taskId: task.id,
        teammateId,
        error: error.message
      };
    }
  }

  /**
   * Dispatch to Subagent (fallback mode)
   * @param {Object} task - Task to dispatch
   * @param {Object} goalTags - Goal tags
   * @param {Object} context - Shared context
   * @returns {Promise<Object>} Dispatch result
   */
  async dispatchToSubagent(task, goalTags, context) {
    const teammateId = this.findAvailableTeammate();

    this.activeTeammates.get(teammateId).currentTask = task.id;
    this.activeTeammates.get(teammateId).status = 'working';

    try {
      // Create subagent with team context
      const result = await createSubagent({
        role: 'teammate',
        task,
        goalTags,
        context: {
          ...context,
          plan: {
            title: this.plan.title,
            goal: this.plan.goal,
            architecture: this.plan.architecture
          }
        }
      });

      return {
        success: true,
        taskId: task.id,
        teammateId,
        result
      };
    } catch (error) {
      return {
        success: false,
        taskId: task.id,
        teammateId,
        error: error.message
      };
    }
  }

  /**
   * Find the teammate with fewest active tasks
   * @returns {number} Teammate ID
   */
  findAvailableTeammate() {
    let minTasks = Infinity;
    let availableId = 0;

    this.activeTeammates.forEach((teammate, id) => {
      if (teammate.status === 'idle' || teammate.status === 'working') {
        const taskCount = teammate.currentTask ? 1 : 0;
        if (taskCount < minTasks) {
          minTasks = taskCount;
          availableId = id;
        }
      }
    });

    return availableId;
  }

  /**
   * Mark a task as complete
   * @param {string} taskId - Task ID
   * @param {Object} result - Task result
   */
  completeTask(taskId, result) {
    // Find which teammate completed it
    this.activeTeammates.forEach((teammate, id) => {
      if (teammate.currentTask === taskId) {
        teammate.currentTask = null;
        teammate.status = 'idle';
      }
    });

    this.completedTasks.set(taskId, result);
  }

  /**
   * Mark a task as failed
   * @param {string} taskId - Task ID
   * @param {Object} error - Error information
   */
  failTask(taskId, error) {
    this.activeTeammates.forEach((teammate, id) => {
      if (teammate.currentTask === taskId) {
        teammate.currentTask = null;
        teammate.status = 'failed';
      }
    });

    this.completedTasks.set(taskId, {
      success: false,
      error
    });
  }

  /**
   * Get dispatcher status
   * @returns {Object} Status information
   */
  getStatus() {
    const teammates = [];
    this.activeTeammates.forEach((t, id) => {
      teammates.push({
        id,
        status: t.status,
        currentTask: t.currentTask
      });
    });

    return {
      mode: this.mode.mode,
      teammateCount: this.teammateCount,
      teammates,
      completedTasks: this.completedTasks.size,
      totalTasks: this.plan.tasks?.length || 0
    };
  }
}

module.exports = { TeamDispatcher };
