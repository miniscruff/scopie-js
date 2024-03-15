/* eslint-disable jest/no-conditional-expect, jest/no-conditional-in-test */
import scenarios from './scopie_scenarios.json';
import { isAllowed, validateScope } from './scopie.js';

describe('is allowed', () => {
  it.each(scenarios.isAllowedTests)(
    '$id',
    ({
      id, variables, scopes, actor, error, result, /* eslint-disable-line no-unused-vars */
    }) => {
      expect.assertions(1);
      const testFn = () => isAllowed(variables, scopes, actor);
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
    ({ id, scope, error }) => { /* eslint-disable-line no-unused-vars */
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
