/**
 * scripts/teams-helpers/task-grouping.js
 *
 * Task grouping utilities for parallel execution
 */

/**
 * Group tasks by dependencies for parallel execution
 * @param {Array} tasks - Array of task objects
 * @returns {Object} Grouped tasks
 */
function groupTasksForTeams(tasks) {
  if (!tasks || tasks.length === 0) {
    return {
      independent: [],
      dependent: [],
      dependencyGraph: new Map(),
      maxParallel: 0
    };
  }

  const independent = tasks.filter(t => !t.dependencies || t.dependencies.length === 0);
  const dependent = tasks.filter(t => t.dependencies && t.dependencies.length > 0);
  const dependencyGraph = buildDependencyGraph(tasks);

  // Calculate max parallel teammates (cap at 5)
  const maxParallel = Math.min(independent.length, 5);

  return {
    independent,
    dependent,
    dependencyGraph,
    maxParallel,
    totalTasks: tasks.length,
    parallelizableTasks: independent.length
  };
}

/**
 * Build dependency graph from tasks
 * @param {Array} tasks - Array of task objects
 * @returns {Map} Dependency graph
 */
function buildDependencyGraph(tasks) {
  const graph = new Map();

  tasks.forEach(task => {
    graph.set(task.id || task.title, {
      dependents: [],
      dependencies: task.dependencies || [],
      task: task
    });
  });

  // Populate dependents
  tasks.forEach(task => {
    const taskId = task.id || task.title;
    const node = graph.get(taskId);

    task.dependencies?.forEach(depId => {
      const depNode = graph.get(depId);
      if (depNode) {
        depNode.dependents.push(taskId);
      }
    });
  });

  return graph;
}

/**
 * Get all tasks that depend on a specific task
 * @param {string} taskId - Task ID
 * @param {Map} dependencyGraph - Dependency graph
 * @returns {Array} Dependent task IDs
 */
function getDependentTasks(taskId, dependencyGraph) {
  const node = dependencyGraph.get(taskId);
  return node ? node.dependents : [];
}

/**
 * Get all dependencies for a specific task
 * @param {string} taskId - Task ID
 * @param {Map} dependencyGraph - Dependency graph
 * @returns {Array} Dependency task IDs
 */
function getDependencyTasks(taskId, dependencyGraph) {
  const node = dependencyGraph.get(taskId);
  return node ? node.dependencies : [];
}

/**
 * Check if a task's dependencies are all complete
 * @param {string} taskId - Task ID
 * @param {Map} dependencyGraph - Dependency graph
 * @param {Array} completedTasks - List of completed task IDs
 * @returns {boolean} True if all dependencies are complete
 */
function areDependenciesComplete(taskId, dependencyGraph, completedTasks) {
  const dependencies = getDependencyTasks(taskId, dependencyGraph);
  return dependencies.every(depId => completedTasks.includes(depId));
}

/**
 * Calculate execution order for tasks
 * @param {Array} tasks - Array of task objects
 * @param {Map} dependencyGraph - Dependency graph
 * @returns {Array} Ordered task IDs
 */
function calculateExecutionOrder(tasks, dependencyGraph) {
  const inDegree = new Map();
  const queue = [];
  const order = [];

  // Calculate in-degree for each node
  tasks.forEach(task => {
    const taskId = task.id || task.title;
    const deps = task.dependencies || [];
    inDegree.set(taskId, deps.length);
  });

  // Add nodes with zero in-degree to queue
  inDegree.forEach((degree, taskId) => {
    if (degree === 0) queue.push(taskId);
  });

  // Process queue
  while (queue.length > 0) {
    const current = queue.shift();
    order.push(current);

    // Get dependents and reduce their in-degree
    const dependents = getDependentTasks(current, dependencyGraph);
    dependents.forEach(depId => {
      const currentDegree = inDegree.get(depId);
      inDegree.set(depId, currentDegree - 1);
      if (currentDegree - 1 === 0) {
        queue.push(depId);
      }
    });
  }

  return order;
}

/**
 * Validate no circular dependencies
 * @param {Array} tasks - Array of task objects
 * @returns {Object} Validation result
 */
function validateDependencies(tasks) {
  const graph = buildDependencyGraph(tasks);
  const order = calculateExecutionOrder(tasks, graph);

  return {
    valid: order.length === tasks.length,
    cycleDetected: order.length !== tasks.length
  };
}

/**
 * Suggest optimal teammate count based on tasks
 * @param {Array} tasks - Array of task objects
 * @returns {Object} Suggestion
 */
function suggestTeammateCount(tasks) {
  const { independent, maxParallel } = groupTasksForTeams(tasks);

  if (independent.length === 0) {
    return { count: 1, reason: 'All tasks have dependencies, sequential execution needed' };
  }

  if (independent.length === 1) {
    return { count: 1, reason: 'Only one independent task' };
  }

  if (independent.length <= 3) {
    return { count: independent.length, reason: 'Small number of independent tasks' };
  }

  return {
    count: maxParallel,
    reason: `Adaptive: ${independent.length} independent tasks, capped at ${maxParallel}`
  };
}

module.exports = {
  groupTasksForTeams,
  buildDependencyGraph,
  getDependentTasks,
  getDependencyTasks,
  areDependenciesComplete,
  calculateExecutionOrder,
  validateDependencies,
  suggestTeammateCount
};
