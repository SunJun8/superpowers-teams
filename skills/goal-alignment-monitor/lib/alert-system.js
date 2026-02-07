/**
 * skills/goal-alignment-monitor/lib/alert-system.js
 *
 * Alert and reporting system for goal alignment
 *
 * Error handling: Consistent pattern using Result objects
 * - Success: { success: true, data: ... }
 * - Failure: { success: false, error: ... }
 */

class AlertSystem {
  /**
   * Create alert system
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.notificationQueue = [];
    this.alertHistory = [];
    this.criticalAlertsSent = false;
    this.options = options;
  }

  /**
   * Send an alert
   * @param {Object} alert - Alert information
   * @returns {Promise<void>}
   */
  async sendAlert(alert) {
    const severityOrder = { critical: 0, warning: 1, info: 2 };

    // Add timestamp
    alert.timestamp = new Date().toISOString();
    alert.id = this.generateAlertId();

    // Store in history
    this.alertHistory.push(alert);

    // Immediate notification for critical
    if (alert.severity === 'critical') {
      this.criticalAlertsSent = true;
      await this.notifyImmediately(alert);
    } else {
      // Queue for batch notification
      this.queueNotification(alert);
    }
  }

  /**
   * Generate unique alert ID
   * @returns {string} Alert ID
   */
  generateAlertId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 4);
    return `alert-${timestamp}-${random}`;
  }

  /**
   * Send immediate notification (critical alerts)
   * @param {Object} alert - Alert
   */
  async notifyImmediately(alert) {
    // In real implementation, this would:
    // - Send to main session
    // - Display prominently
    // - Potentially pause execution

    const message = this.formatCriticalAlert(alert);
    console.log(`🚨 CRITICAL ALERT: ${message}`);

    // Example notification structure
    return {
      type: 'critical-alert',
      alertId: alert.id,
      message,
      actionRequired: true
    };
  }

  /**
   * Queue notification (non-critical)
   * @param {Object} alert - Alert
   */
  queueNotification(alert) {
    this.notificationQueue.push(alert);
  }

  /**
   * Send batch notifications
   * @returns {Promise<Object>} Batch result
   */
  async sendBatchNotifications() {
    if (this.notificationQueue.length === 0) {
      return { sent: 0 };
    }

    const batch = [...this.notificationQueue];
    this.notificationQueue = [];

    const formatted = this.formatBatchAlert(batch);

    // In real implementation, this would send to main session
    console.log(`📋 Batch Alert (${batch.length}):`, formatted.summary);

    return {
      sent: batch.length,
      alerts: batch,
      summary: formatted.summary
    };
  }

  /**
   * Format critical alert message
   * @param {Object} alert - Alert
   * @returns {string} Formatted message
   */
  formatCriticalAlert(alert) {
    return `[${alert.taskId}] ${alert.type}: ${alert.issues.map(i => i.message).join(', ')}`;
  }

  /**
   * Format batch alert summary
   * @param {Array} alerts - Alerts
   * @returns {Object} Formatted batch
   */
  formatBatchAlert(alerts) {
    const critical = alerts.filter(a => a.severity === 'critical').length;
    const warning = alerts.filter(a => a.severity === 'warning').length;
    const info = alerts.filter(a => a.severity === 'info').length;

    return {
      summary: `${critical} critical, ${warning} warning, ${info} info`,
      byTask: this.groupByTask(alerts)
    };
  }

  /**
   * Group alerts by task
   * @param {Array} alerts - Alerts
   * @returns {Object} Grouped alerts
   */
  groupByTask(alerts) {
    const grouped = {};

    for (const alert of alerts) {
      const taskId = alert.taskId || 'unknown';
      if (!grouped[taskId]) {
        grouped[taskId] = [];
      }
      grouped[taskId].push({
        type: alert.type,
        severity: alert.severity,
        message: alert.issues.map(i => i.message).join(', ')
      });
    }

    return grouped;
  }

  /**
   * Clear notifications
   * @param {string} taskId - Task ID to clear (optional)
   */
  clearNotifications(taskId = null) {
    if (taskId) {
      this.notificationQueue = this.notificationQueue.filter(
        n => n.taskId !== taskId
      );
    } else {
      this.notificationQueue = [];
    }
  }

  /**
   * Get alert history
   * @param {Object} filters - Filter options
   * @returns {Array} Filtered history
   */
  getHistory(filters = {}) {
    let history = [...this.alertHistory];

    if (filters.taskId) {
      history = history.filter(a => a.taskId === filters.taskId);
    }

    if (filters.severity) {
      history = history.filter(a => a.severity === filters.severity);
    }

    if (filters.since) {
      history = history.filter(a => new Date(a.timestamp) > new Date(filters.since));
    }

    return history;
  }
}

/**
 * Generate milestone report
 * @param {Object} options - Report options
 * @returns {Promise<Object>} Report
 */
async function generateMilestoneReport(options) {
  const {
    taskResults = [],
    goals = {},
    milestoneName = 'Milestone'
  } = options;

  const aligned = taskResults.filter(r => r.alignment?.status === 'aligned').length;
  const misaligned = taskResults.filter(r => r.alignment?.status === 'misaligned').length;
  const notChecked = taskResults.filter(r => !r.alignment).length;
  const total = taskResults.length;

  const score = total > 0 ? Math.round((aligned / total) * 100) : 0;

  // Generate recommendations
  const recommendations = [];

  if (misaligned > 0) {
    const misalignedTasks = taskResults
      .filter(r => r.alignment?.status === 'misaligned')
      .map(r => r.id || r.taskId);

    recommendations.push({
      type: 'fix-misaligned',
      priority: 'high',
      message: `Review and fix ${misalignedTasks.length} misaligned task(s): ${misalignedTasks.join(', ')}`
    });
  }

  if (score < 80) {
    recommendations.push({
      type: 'improve-alignment',
      priority: 'medium',
      message: `Alignment score ${score}% is below 80% target`
    });
  }

  // Check goal-specific metrics
  const goalAchievements = {};

  for (const [goalKey, goalValue] of Object.entries(goals)) {
    const relevantTasks = taskResults.filter(r => r.goalTags?.[goalKey]);
    const goalAligned = relevantTasks.filter(
      r => r.alignment?.details?.[goalKey]?.passed
    ).length;

    goalAchievements[goalKey] = {
      target: goalValue,
      aligned: goalAligned,
      total: relevantTasks.length,
      percentage: relevantTasks.length > 0
        ? Math.round((goalAligned / relevantTasks.length) * 100)
        : 100
    };
  }

  return {
    milestone: milestoneName,
    timestamp: new Date().toISOString(),
    summary: {
      totalTasks: total,
      aligned,
      misaligned,
      notChecked,
      score
    },
    status: score >= 90 ? 'aligned' : score >= 70 ? 'partial' : 'misaligned',
    goalAchievements,
    recommendations,
    details: taskResults.map(r => ({
      id: r.id || r.taskId,
      status: r.alignment?.status || 'not-checked',
      issues: r.alignment?.issues?.length || 0
    }))
  };
}

/**
 * Ask user for decision on misalignment
 * @param {Object} alert - Alert information
 * @returns {Promise<Object>} User decision
 */
async function askUserDecision(alert) {
  // In real implementation, this would:
  // - Send message to main session
  // - Wait for user response

  const question = `
Misalignment detected for task ${alert.taskId}:

Issues:
${alert.issues.map(i => `- [${i.severity}] ${i.message}`).join('\n')}

How would you like to proceed?

Options:
1. Fix and retry
2. Adjust goal expectations
3. Skip task
4. Abort execution
`;

  // Placeholder - would wait for user input
  return {
    action: 'pending',
    taskId: alert.taskId
  };
}

module.exports = {
  AlertSystem,
  generateMilestoneReport,
  askUserDecision
};
