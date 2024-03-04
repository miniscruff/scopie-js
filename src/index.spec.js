import scenarios from './scopie_scenarios.json';
import { isAllowed, validateScope } from '.';

describe('is allowed', () => {
  for (let tc of scenarios.isAllowedTests) {
    test(tc.id, () => {
      const testFn = () => isAllowed(tc.variables, tc.scopes, tc.actor)
      if (tc.error === undefined) {
        expect(testFn()).toBe(tc.result)
      } else {
        expect(testFn).toThrow(tc.error)
      }
    })
  }
})

describe('is valid', () => {
  for (let tc of scenarios.scopeValidTests) {
    test(tc.id, () => {
      const err = validateScope(tc.scope)
      if (tc.error === undefined) {
        expect(err).toBe(undefined)
      } else {
        expect(err.message).toEqual(tc.error)
      }
    })
  }
})
