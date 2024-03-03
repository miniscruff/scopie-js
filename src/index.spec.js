const scenarios = require('./scopie_scenarios.json');
const scopie = require('./index.js')
const { isAllowed } = scopie;

function testIsAllowed() {
  for (let tc of scenarios.isAllowedTests) {
    // console.log("-- starting test:", tc.id)
    try {
      const res = isAllowed(tc.variables, tc.scopes, tc.actor);
      console.log("the result:", res)
      if (tc.error !== undefined) {
        tc.assert = `expected error but got none`;
        console.table(tc);
        break
      } else if (res !== tc.result) {
        tc.assert = `${res} !== ${tc.result}`;
        console.table(tc);
        break
      }
    } catch (e) {
      if (tc.error === undefined) {
        tc.assert = `expected no error but got one`;
        console.log(e)
        console.table(tc);
        break
      } else if (e !== tc.error) {
        tc.assert = `${e} !== ${tc.error}`;
        console.table(tc);
        break
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
