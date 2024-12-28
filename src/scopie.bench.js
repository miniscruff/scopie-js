// eslint-disable-next-line
import scenarios from './scenarios.json' with { type: "json" };

import { isAllowed } from './scopie.js';
import { Bench } from 'tinybench';

const bench = new Bench({
  time: 500,
  iterations: 10000,
  warmupTime: 1,
});

for (let tc of scenarios.benchmarks) {
  bench.add(tc.id, () => {
    isAllowed(tc.actionScopes, tc.actorRules, tc.variables);
  })
}

bench.runSync();

console.table(bench.table());
