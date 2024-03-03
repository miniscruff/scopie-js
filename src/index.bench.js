const scenarios = require('./scopie_scenarios.json');
const scopie = require('./index.js')
const { isAllowed } = scopie;

const Bench = require('tinybench');
const bench = new Bench.Bench({
  time: 500,
  iterations: 10000,
  warmupTime: 1,
});

for (let tc of scenarios.benchmarks) {
  bench.add(tc.id, () => {
      isAllowed(tc.variables, tc.scopes, tc.actor)
  })
}

async function run() {
  await bench.warmup();
  await bench.run();

  console.table(bench.table());
}

run();
