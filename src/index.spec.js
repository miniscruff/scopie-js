const scenarios = require('./scopie_scenarios.json');
const scopie = require('./index.js')
const { isAllowed } = scopie;

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

/* TODO: Is valid scope tests
describe('other', () => {
  for (let tc of scenarios.scopeValidTests) {
    test(tc.id, () => {
      expect(isVa
    })
  }
})
*/
