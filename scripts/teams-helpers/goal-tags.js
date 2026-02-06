/**
 * scripts/teams-helpers/goal-tags.js
 *
 * Goal tags structure and parsing utilities
 */

/**
 * Goal tags structure for tracking alignment
 * @typedef {Object} GoalTags
 * @property {string} architecture - Architecture style
 * @property {string} codeStyle - Code style (functional/OOP/procedural)
 * @property {string} testing - Testing strategy
 * @property {string} security - Security requirements
 * @property {string} performance - Performance requirements
 * @property {string} userExperience - UX type
 */

/**
 * Default goal tags
 * @returns {GoalTags} Default values
 */
function getDefaultGoalTags() {
  return {
    architecture: 'standard',
    codeStyle: 'standard',
    testing: 'unit',
    security: 'none',
    performance: 'none',
    userExperience: 'cli'
  };
}

/**
 * Parse goal tags from design document
 * @param {string} designDoc - Design document content
 * @returns {GoalTags|null} Parsed goal tags or null if not found
 */
function parseGoalTags(designDoc) {
  if (!designDoc) return getDefaultGoalTags();

  // Try to extract goal metrics section
  const goalSection = designDoc.match(/## Goal Metrics[\s\S]*?(?=## |---|$)/i);
  if (!goalSection) return getDefaultGoalTags();

  const sectionText = goalSection[0];

  return {
    architecture: extractGoal(sectionText, 'architecture') || 'standard',
    codeStyle: extractGoal(sectionText, 'code style') || 'standard',
    testing: extractGoal(sectionText, 'testing') || 'unit',
    security: extractGoal(sectionText, 'security') || 'none',
    performance: extractGoal(sectionText, 'performance') || 'none',
    userExperience: extractGoal(sectionText, 'user experience') || 'cli'
  };
}

/**
 * Extract a single goal value from section text
 * @param {string} section - Section content
 * @param {string} key - Goal key to extract
 * @returns {string|null} Extracted value or null
 */
function extractGoal(section, key) {
  // Match various formats: "Key: Value", "Key = Value", "- Key: Value"
  const patterns = [
    new RegExp(`${key}[:=]\\s*([^\n]+)`, 'i'),
    new RegExp(`-+\\s*${key}[:=]\\s*([^\n]+)`, 'i'),
    new RegExp(`\\*\\s*${key}[:=]\\s*([^\n]+)`, 'i')
  ];

  for (const pattern of patterns) {
    const match = section.match(pattern);
    if (match) return match[1].trim();
  }

  return null;
}

/**
 * Format goal tags for display
 * @param {GoalTags} tags - Goal tags
 * @returns {string} Formatted string
 */
function formatGoalTags(tags) {
  const lines = ['**Goal Tags:**'];

  if (tags.architecture !== 'standard') {
    lines.push(`- architecture: ${tags.architecture}`);
  }
  if (tags.codeStyle !== 'standard') {
    lines.push(`- style: ${tags.codeStyle}`);
  }
  if (tags.testing !== 'unit') {
    lines.push(`- testing: ${tags.testing}`);
  }
  if (tags.security !== 'none') {
    lines.push(`- security: ${tags.security}`);
  }
  if (tags.performance !== 'none') {
    lines.push(`- performance: ${tags.performance}`);
  }

  return lines.join('\n');
}

/**
 * Validate goal tags structure
 * @param {Object} tags - Tags to validate
 * @returns {Object} Validation result
 */
function validateGoalTags(tags) {
  const validArchitectures = ['microservices', 'monolithic', 'plugin-based', 'standard'];
  const validStyles = ['functional', 'oop', 'procedural', 'standard'];
  const validTesting = ['unit', 'integration', 'e2e', 'none', 'unit+integration'];

  const errors = [];

  if (!validArchitectures.includes(tags.architecture)) {
    errors.push(`Invalid architecture: ${tags.architecture}`);
  }
  if (!validStyles.includes(tags.codeStyle)) {
    errors.push(`Invalid code style: ${tags.codeStyle}`);
  }
  if (!validTesting.includes(tags.testing)) {
    errors.push(`Invalid testing: ${tags.testing}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  getDefaultGoalTags,
  parseGoalTags,
  formatGoalTags,
  extractGoal,
  validateGoalTags
};
