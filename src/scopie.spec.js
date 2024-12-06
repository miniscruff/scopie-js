/* eslint-disable jest/no-conditional-expect, jest/no-conditional-in-test */
import scenarios from './scopie_scenarios.json';
import { isAllowed, validateScope } from './scopie';

describe('is allowed', () => {
  it.each(scenarios.isAllowedTests)(
    '$id',
    ({
      id, actorRules, actionScopes, variables, error, result, /* eslint-disable-line no-unused-vars */
    }) => {
      expect.assertions(1);
      const testFn = () => isAllowed(actorRules, actionScopes, variables);
      if (error === undefined) {
        expect(testFn()).toBe(result);
      } else {
        console.log(id, actorRules, actionScopes)
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
