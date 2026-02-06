/**
 * skills/goal-alignment-monitor/lib/checkers.js
 *
 * Alignment checkers for different goal types
 */

class AlignmentChecker {
  constructor() {
    this.checkers = {
      architecture: new ArchitectureChecker(),
      style: new StyleChecker(),
      testing: new TestingChecker(),
      performance: new PerformanceChecker(),
      security: new SecurityChecker()
    };
  }

  /**
   * Run all applicable checks
   * @param {Object} code - Code changes
   * @param {Object} tests - Test results
   * @param {Object} goalTags - Goal tags
   * @returns {Promise<Object>} Check result
   */
  async checkAll(code, tests, goalTags) {
    const results = {};

    for (const [key, checker] of Object.entries(this.checkers)) {
      const goalValue = goalTags[key];
      if (goalValue && goalValue !== 'none' && goalValue !== 'standard') {
        results[key] = await checker.check(code, tests, goalValue);
      }
    }

    return this.combineResults(results);
  }

  /**
   * Combine individual check results
   * @param {Object} results - Individual results
   * @returns {Object} Combined result
   */
  combineResults(results) {
    const issues = [];
    let critical = false;

    for (const [key, result] of Object.entries(results)) {
      if (!result.passed) {
        for (const issue of result.issues) {
          issues.push({
            category: key,
            message: issue.message,
            severity: issue.severity || 'warning',
            location: issue.location
          });
        }
        if (result.critical) critical = true;
      }
    }

    return {
      passed: issues.length === 0,
      issues,
      critical,
      details: results
    };
  }
}

class ArchitectureChecker {
  /**
   * Check architecture alignment
   * @param {Object} code - Code changes
   * @param {Object} tests - Test results
   * @param {string} requirement - Architecture requirement
   * @returns {Promise<Object>} Check result
   */
  async check(code, tests, requirement) {
    const issues = [];

    // Analyze code structure
    const structure = this.analyzeStructure(code);

    // Check against requirement
    switch (requirement.toLowerCase()) {
      case 'microservices':
        if (structure.hasCircularDeps) {
          issues.push({
            message: 'Circular dependencies detected',
            severity: 'critical',
            location: structure.dependencyGraph
          });
        }
        if (!structure.hasServiceBoundaries) {
          issues.push({
            message: 'Missing service boundaries',
            severity: 'warning'
          });
        }
        break;

      case 'monolithic':
        if (structure.hasExternalAPIs) {
          issues.push({
            message: 'External APIs in monolithic architecture',
            severity: 'info'
          });
        }
        break;

      case 'functional':
        if (structure.hasMutableGlobals) {
          issues.push({
            message: 'Mutable global state in functional code',
            severity: 'warning'
          });
        }
        break;

      default:
        // Standard check - basic structure
        if (structure.complexity > 10) {
          issues.push({
            message: 'High cyclomatic complexity',
            severity: 'warning'
          });
        }
    }

    return {
      passed: !issues.some(i => i.severity === 'critical'),
      issues,
      critical: issues.some(i => i.severity === 'critical')
    };
  }

  /**
   * Analyze code structure
   * @param {Object} code - Code changes
   * @returns {Object} Structure analysis
   */
  analyzeStructure(code) {
    // Placeholder - in real implementation, this would:
    // - Parse AST
    // - Build dependency graph
    // - Detect patterns
    // - Calculate complexity

    return {
      hasCircularDeps: false,
      hasServiceBoundaries: true,
      hasMutableGlobals: false,
      hasExternalAPIs: false,
      complexity: 5,
      dependencyGraph: []
    };
  }
}

class StyleChecker {
  /**
   * Check code style alignment
   * @param {Object} code - Code changes
   * @param {Object} tests - Test results
   * @param {string} requirement - Style requirement
   * @returns {Promise<Object>} Check result
   */
  async check(code, tests, requirement) {
    const issues = [];

    const style = this.analyzeStyle(code);

    switch (requirement.toLowerCase()) {
      case 'functional':
        if (style.hasClasses) {
          issues.push({
            message: 'Classes found in functional code',
            severity: 'info'
          });
        }
        if (style.hasSideEffects) {
          issues.push({
            message: 'Side effects detected',
            severity: 'warning'
          });
        }
        break;

      case 'oop':
        if (style.functionalPatternUsed) {
          issues.push({
            message: 'Functional patterns in OOP code',
            severity: 'info'
          });
        }
        break;

      case 'procedural':
        // Procedural is flexible, just check basic structure
        break;

      default:
        // Standard style check
        if (style.lintingErrors > 0) {
          issues.push({
            message: `${style.lintingErrors} linting errors`,
            severity: 'warning'
          });
        }
        if (style.formattingIssues > 0) {
          issues.push({
            message: `${style.formattingIssues} formatting issues`,
            severity: 'info'
          });
        }
    }

    return {
      passed: issues.length === 0,
      issues,
      critical: false
    };
  }

  /**
   * Analyze code style
   * @param {Object} code - Code changes
   * @returns {Object} Style analysis
   */
  analyzeStyle(code) {
    return {
      hasClasses: false,
      hasSideEffects: false,
      functionalPatternUsed: false,
      lintingErrors: 0,
      formattingIssues: 0,
      namingConventions: 'consistent'
    };
  }
}

class TestingChecker {
  /**
   * Check testing alignment
   * @param {Object} code - Code changes
   * @param {Object} tests - Test results
   * @param {string} requirement - Testing requirement
   * @returns {Promise<Object>} Check result
   */
  async check(code, tests, requirement) {
    const issues = [];
    const testResults = tests || {};

    // Check test coverage
    const coverage = testResults.coverage || 0;

    // Parse requirement
    const requirements = requirement.toLowerCase().split('+').map(r => r.trim());

    // Check unit tests
    if (requirements.includes('unit')) {
      if (testResults.unitTests === 0) {
        issues.push({
          message: 'No unit tests found',
          severity: 'warning'
        });
      } else if (coverage < 80) {
        issues.push({
          message: `Unit test coverage ${coverage}% (target: 80%)`,
          severity: 'info'
        });
      }
    }

    // Check integration tests
    if (requirements.includes('integration')) {
      if (testResults.integrationTests === 0) {
        issues.push({
          message: 'No integration tests found',
          severity: 'warning'
        });
      }
    }

    // Check E2E tests
    if (requirements.includes('e2e')) {
      if (testResults.e2eTests === 0) {
        issues.push({
          message: 'No E2E tests found',
          severity: 'info'
        });
      }
    }

    // Check test success
    if (testResults.failed > 0) {
      issues.push({
        message: `${testResults.failed} test(s) failed`,
        severity: 'critical'
      });
    }

    return {
      passed: !issues.some(i => i.severity === 'critical'),
      issues,
      critical: issues.some(i => i.severity === 'critical'),
      coverage
    };
  }
}

class PerformanceChecker {
  /**
   * Check performance alignment
   * @param {Object} code - Code changes
   * @param {Object} tests - Test results
   * @param {string} requirement - Performance requirement
   * @returns {Promise<Object>} Check result
   */
  async check(code, tests, requirement) {
    const issues = [];
    const perfResults = tests?.performance || {};

    // Parse requirement (e.g., "< 100ms")
    const timeMatch = requirement.match(/<\\s*(\\d+)ms/i);
    const throughputMatch = requirement.match(/(\\d+)\\s*concurrent/i);

    if (timeMatch) {
      const targetTime = parseInt(timeMatch[1]);
      const actualTime = perfResults.avgResponseTime || 0;

      if (actualTime > targetTime) {
        issues.push({
          message: `Response time ${actualTime}ms exceeds target ${targetTime}ms`,
          severity: actualTime > targetTime * 2 ? 'critical' : 'warning'
        });
      }
    }

    if (throughputMatch) {
      const targetConcurrent = parseInt(throughputMatch[1]);
      const actualConcurrent = perfResults.concurrentCapacity || 0;

      if (actualConcurrent < targetConcurrent) {
        issues.push({
          message: `Concurrent capacity ${actualConcurrent} below target ${targetConcurrent}`,
          severity: 'warning'
        });
      }
    }

    return {
      passed: issues.length === 0,
      issues,
      critical: issues.some(i => i.severity === 'critical')
    };
  }
}

class SecurityChecker {
  /**
   * Check security alignment
   * @param {Object} code - Code changes
   * @param {Object} tests - Test results
   * @param {string} requirement - Security requirement
   * @returns {Promise<Object>} Check result
   */
  async check(code, tests, requirement) {
    const issues = [];
    const securityResults = tests?.security || {};

    // Check for security issues
    if (securityResults.hardcodedSecrets) {
      issues.push({
        message: 'Hardcoded secrets detected',
        severity: 'critical',
        location: securityResults.secretLocations
      });
    }

    if (securityResults.sqlInjectionRisk) {
      issues.push({
        message: 'SQL injection vulnerability detected',
        severity: 'critical'
      });
    }

    if (securityResults.xssRisk) {
      issues.push({
        message: 'XSS vulnerability risk detected',
        severity: 'warning'
      });
    }

    // Check authentication
    if (requirement.toLowerCase().includes('jwt')) {
      if (!securityResults.usesJWT) {
        issues.push({
          message: 'JWT authentication not implemented',
          severity: 'warning'
        });
      }
    }

    if (requirement.toLowerCase().includes('bcrypt')) {
      if (!securityResults.usesBcrypt) {
        issues.push({
          message: 'bcrypt hashing not used for passwords',
          severity: 'warning'
        });
      }
    }

    return {
      passed: !issues.some(i => i.severity === 'critical'),
      issues,
      critical: issues.some(i => i.severity === 'critical')
    };
  }
}

module.exports = { AlignmentChecker };
