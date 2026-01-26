/* eslint-disable jest/no-conditional-expect, jest/no-conditional-in-test, no-unused-vars */
import scenarios from './scenarios.json';
import { isAllowed, validateActions, validatePermissions } from './scopie';

describe('is allowed', () => {
  it.each(scenarios.isAllowedTests)(
    '$id',
    ({
      id, actions, permissions, variables, error, result,
    }) => {
      expect.assertions(1);
      const testFn = () => isAllowed(actions, permissions, variables);
      if (error === undefined) {
        expect(testFn()).toBe(result);
      } else {
        expect(testFn).toThrow(error);
      }
    },
  );
});

describe('is valid actions', () => {
  it.each(scenarios.validateActionsTests)(
    '$id',
    ({ id, actions, error }) => {
      expect.assertions(1);
      const err = validateActions(actions);
      if (error === undefined) {
        expect(err).toBeUndefined();
      } else {
        expect(err.message).toStrictEqual(error);
      }
    },
  );
});

describe('is valid permissions', () => {
  it.each(scenarios.validatePermissionsTests)(
    '$id',
    ({ id, permissions, error }) => {
      expect.assertions(1);
      const err = validatePermissions(permissions);
      if (error === undefined) {
        expect(err).toBeUndefined();
      } else {
        expect(err.message).toStrictEqual(error);
      }
    },
  );
});
