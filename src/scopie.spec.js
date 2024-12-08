/* eslint-disable jest/no-conditional-expect, jest/no-conditional-in-test, no-unused-vars */
import scenarios from './scopie_scenarios.json';
import { isAllowed, validateScope } from './scopie';

describe('is allowed', () => {
  it.each(scenarios.isAllowedTests)(
    '$id',
    ({
      id, actorRules, actionScopes, variables, error, result,
    }) => {
      expect.assertions(1);
      const testFn = () => isAllowed(actionScopes, actorRules, variables);
      if (error === undefined) {
        expect(testFn()).toBe(result);
      } else {
        expect(testFn).toThrow(error);
      }
    },
  );
});

describe('is valid', () => {
  it.each(scenarios.scopeValidTests)(
    '$id',
    ({ id, scope, error }) => {
      expect.assertions(1);
      const err = validateScope(scope);
      if (error === undefined) {
        expect(err).toBeUndefined();
      } else {
        expect(err.message).toStrictEqual(error);
      }
    },
  );
});
