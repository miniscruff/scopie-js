/* eslint-disable jest/no-conditional-expect, jest/no-conditional-in-test, no-unused-vars */
import scenarios from './scenarios.json';
import { isAllowed, validateScopes } from './scopie';

describe('is allowed', () => {
  it.each(scenarios.isAllowedTests)(
    '$id',
    ({
      id, rules, scopes, variables, error, result,
    }) => {
      expect.assertions(1);
      const testFn = () => isAllowed(scopes, rules, variables);
      if (error === undefined) {
        expect(testFn()).toBe(result);
      } else {
        expect(testFn).toThrow(error);
      }
    },
  );
});

describe('is valid', () => {
  it.each(scenarios.validateScopesTests)(
    '$id',
    ({ id, scopes, error }) => {
      expect.assertions(1);
      const err = validateScopes(scopes);
      if (error === undefined) {
        expect(err).toBeUndefined();
      } else {
        expect(err.message).toStrictEqual(error);
      }
    },
  );
});
