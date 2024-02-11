const scenarios = require('./scopie_scenarios.json');
const scopie = require('./index.js')
const { isAllowed } = scopie;

function testIsAllowed() {
  for (let tc of scenarios.isAllowedTests) {
    // console.log("-- starting test:", tc.id)
    try {
      const res = isAllowed(tc.variables, tc.scopes, tc.actor);
      if (tc.error !== undefined) {
        console.table(tc);
        console.error(`## ${tc.id} failed: expected error but got none`);
      } else if (res !== tc.result) {
        console.table(tc);
        console.error(`## ${tc.id} failed: ${res} !== ${tc.result}`);
      }
    } catch (e) {
      if (tc.error === undefined) {
        console.table(tc);
        console.error(`## ${tc.id} failed: expected no error but got one: ${e}`);
      } else if (e.message !== tc.error) {
        console.table(tc);
        console.error(`## ${tc.id} failed: ${e} !== ${tc.error}`);
      }
    }
    // console.log("-- ending test:", tc.id)
    /*
    scopie-106 in scopes@0: scope was empty !==
    scopie-106 in scopes@0: scope was empty
    */
  }
}

/*
function runBenchmarks() {
  for (let tc of scenarios.benchmarks) {
    const res = isAllowed(tc.variables, tc.scopes, tc.actor);
    if (res !== tc.result) {
      console.error(`${tc.id} failed: ${res} !== ${tc.result}`);
    }
  }
}
*/

testIsAllowed();
//runBenchmarks();
