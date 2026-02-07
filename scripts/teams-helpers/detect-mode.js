/**
 * scripts/teams-helpers/detect-mode.js
 *
 * Detect if Claude Code Agent Teams is available
 */

/**
 * Detect if Claude Code Agent Teams is enabled
 * @returns {Object} Mode detection result
 */
function detectAgentTeamsMode() {
  const hasEnvVar = process.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS === '1';
  const hasApi = typeof createAgentTeam === 'function';

  return {
    enabled: hasEnvVar && hasApi,
    mode: hasEnvVar && hasApi ? 'agent-teams' : 'subagent',
    canUseTeams: hasApi,
    envVarSet: hasEnvVar
  };
}

/**
 * Check if we should use Teams mode
 * @param {Object} options - Configuration options
 * @returns {string} 'agent-teams' | 'subagent'
 */
function shouldUseTeamsMode(options = {}) {
  const detection = detectAgentTeamsMode();

  if (!options.forceTeams) {
    return detection.enabled ? 'agent-teams' : 'subagent';
  }

  return detection.mode;
}

module.exports = {
  detectAgentTeamsMode,
  shouldUseTeamsMode
};
