/**
 * tests/integration/teams-mode.test.js
 *
 * Integration tests for Superpowers Teams mode
 */

const path = require('path');

// Import helpers
const { detectAgentTeamsMode } = require('../../scripts/teams-helpers/detect-mode');
const { parseGoalTags, validateGoalTags, formatGoalTags } = require('../../scripts/teams-helpers/goal-tags');
const { groupTasksForTeams, suggestTeammateCount, validateDependencies } = require('../../scripts/teams-helpers/task-grouping');

describe('Teams Mode Integration', () => {
  describe('Mode Detection', () => {
    test('should detect Agent Teams mode when enabled', () => {
      // Mock environment
      process.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = '1';

      const mode = detectAgentTeamsMode();

      expect(mode.envVarSet).toBe(true);
      expect(mode.mode).toBe('agent-teams');

      // Cleanup
      delete process.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS;
    });

    test('should fallback to subagent when disabled', () => {
      delete process.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS;

      const mode = detectAgentTeamsMode();

      expect(mode.envVarSet).toBe(false);
      expect(mode.mode).toBe('subagent');
    });
  });

  describe('Goal Tags Parsing', () => {
    test('should parse complete goal metrics', () => {
      const designDoc = `
## Goal Metrics
Architecture: microservices
Code Style: functional
Testing: unit
Security: JWT
Performance: < 100ms
`;

      const tags = parseGoalTags(designDoc);

      expect(tags.architecture).toBe('microservices');
      expect(tags.codeStyle).toBe('functional');
      expect(tags.testing).toBe('unit');
      expect(tags.security).toBe('JWT');
      expect(tags.performance).toBe('< 100ms');
    });

    test('should use defaults when no goal section', () => {
      const tags = parseGoalTags('No goals here');

      expect(tags.architecture).toBe('standard');
      expect(tags.codeStyle).toBe('standard');
      expect(tags.testing).toBe('unit');
    });

    test('should validate goal tags', () => {
      const validTags = {
        architecture: 'microservices',
        codeStyle: 'functional',
        testing: 'unit',
        security: 'none',
        performance: 'none'
      };

      const result = validateGoalTags(validTags);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should format goal tags for display', () => {
      const tags = {
        architecture: 'microservices',
        codeStyle: 'functional',
        testing: 'unit',
        security: 'JWT',
        performance: 'none'
      };

      const formatted = formatGoalTags(tags);

      expect(formatted).toContain('**Goal Tags:**');
      expect(formatted).toContain('- architecture: microservices');
      expect(formatted).toContain('- style: functional');
    });
  });

  describe('Task Grouping', () => {
    test('should group independent and dependent tasks', () => {
      const tasks = [
        { id: '1', title: 'Setup', dependencies: [] },
        { id: '2', title: 'Auth', dependencies: ['1'] },
        { id: '3', title: 'API', dependencies: ['1'] },
        { id: '4', title: 'Tests', dependencies: ['2', '3'] }
      ];

      const groups = groupTasksForTeams(tasks);

      expect(groups.independent).toHaveLength(1);
      expect(groups.independent[0].id).toBe('1');
      expect(groups.dependent).toHaveLength(3);
      expect(groups.maxParallel).toBe(1);
    });

    test('should handle multiple independent tasks', () => {
      const tasks = [
        { id: '1', title: 'Setup', dependencies: [] },
        { id: '2', title: 'Utils', dependencies: [] },
        { id: '3', title: 'Auth', dependencies: ['1'] }
      ];

      const groups = groupTasksForTeams(tasks);

      expect(groups.independent).toHaveLength(2);
      expect(groups.maxParallel).toBe(2);
    });

    test('should cap parallel at 5', () => {
      const tasks = [
        { id: String(i), title: `Task ${i}`, dependencies: [] }
        for (let i = 1; i <= 10; i++)
      ];

      const groups = groupTasksForTeams(tasks);

      expect(groups.maxParallel).toBe(5);
    });

    test('should validate dependencies for cycles', () => {
      const tasks = [
        { id: '1', title: 'Task 1', dependencies: ['2'] },
        { id: '2', title: 'Task 2', dependencies: ['1'] }
      ];

      const result = validateDependencies(tasks);

      expect(result.valid).toBe(false);
      expect(result.cycleDetected).toBe(true);
    });

    test('should suggest appropriate teammate count', () => {
      const tasks = [
        { id: '1', title: 'Task 1', dependencies: [] },
        { id: '2', title: 'Task 2', dependencies: [] },
        { id: '3', title: 'Task 3', dependencies: ['1'] }
      ];

      const suggestion = suggestTeammateCount(tasks);

      expect(suggestion.count).toBe(2);
      expect(suggestion.reason).toContain('Adaptive');
    });
  });

  describe('End-to-End Flow', () => {
    test('should complete full Teams mode flow', () => {
      // Step 1: Detect mode
      const mode = detectAgentTeamsMode();
      expect(mode.mode).toBe('subagent'); // Fallback in test

      // Step 2: Parse goals
      const designDoc = `
## Goal Metrics
Architecture: microservices
Code Style: functional
Testing: unit+integration
`;
      const tags = parseGoalTags(designDoc);
      expect(tags.architecture).toBe('microservices');

      // Step 3: Group tasks
      const tasks = [
        { id: '1', title: 'Setup', dependencies: [], goalTags: tags },
        { id: '2', title: 'Auth', dependencies: ['1'], goalTags: tags },
        { id: '3', title: 'API', dependencies: [], goalTags: tags }
      ];
      const groups = groupTasksForTeams(tasks);
      expect(groups.independent).toHaveLength(2);
      expect(groups.maxParallel).toBe(2);

      // Step 4: Suggest teammates
      const suggestion = suggestTeammateCount(tasks);
      expect(suggestion.count).toBe(2);

      // Step 5: Validate
      const depsValid = validateDependencies(tasks);
      expect(depsValid.valid).toBe(true);

      expect(true).toBe(true); // All steps passed
    });
  });
});

// Run tests
if (require.main === module) {
  const Jasmine = require('jasmine');
  const jasmine = new Jasmine();
  jasmine.loadConfig({
    spec_files: ['tests/integration/**/*.test.js'],
    random: false
  });
  jasmine.execute();
}

module.exports = { describe, test, expect, beforeEach, afterEach };
