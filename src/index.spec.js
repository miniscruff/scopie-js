const scenarios = require('./scopie_scenarios.json');
const scopie = require('./index.js')
const { isAllowed } = scopie;

function testValidations() {
  for (let tc of scenarios.validations) {
    console.log("-- starting test:", tc.id)
    try {
      const res = isAllowed(tc.variables, tc.scopes, tc.actor);
      if (tc.error !== undefined) {
        console.error(`${tc.id} failed: expected error but got none`);
      } else if (res !== tc.result) {
        console.error(`${tc.id} failed: ${res} !== ${tc.result}`);
      }
    } catch (e) {
      if (tc.error !== undefined) {
        console.error(`${tc.id} failed: expected no error but got one`);
      } else if (e !== tc.error) {
        console.error(`${tc.id} failed: ${e} !== ${tc.error}`);
      }
    }
    console.log("-- ending test:", tc.id)
  }
}

function runBenchmarks() {
  for (let tc of scenarios.benchmarks) {
    const res = isAllowed(tc.variables, tc.scopes, tc.actor);
    if (res !== tc.result) {
      console.error(`${tc.id} failed: ${res} !== ${tc.result}`);
    }
  }
}

testValidations();
runBenchmarks();
