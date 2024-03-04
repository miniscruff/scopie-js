/* eslint-disable jest/no-conditional-expect, jest/no-conditional-in-test */
import scenarios from './scopie_scenarios.json';
import { isAllowed, validateScope } from '.';

describe('is allowed', () => {
  it.each(scenarios.isAllowedTests)('$tc.id', (tc) => {
    expect.assertions(1);
    const testFn = () => isAllowed(tc.variables, tc.scopes, tc.actor);
    if (tc.error === undefined) {
      expect(testFn()).toBe(tc.result);
    } else {
      expect(testFn).toThrow(tc.error);
    }
  });
});

describe('is valid', () => {
  it.each(scenarios.scopeValidTests)('$tc.id', (tc) => {
    expect.assertions(1);
    const err = validateScope(tc.scope);
    if (tc.error === undefined) {
      expect(err).toBeUndefined();
    } else {
      expect(err.message).toStrictEqual(tc.error);
    }
  });
});
