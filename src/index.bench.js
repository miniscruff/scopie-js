import scenarios from './scopie_scenarios.json' with { type: "json" };
import { isAllowed } from './index.js';
import { Bench } from 'tinybench';

const bench = new Bench({
  time: 500,
  iterations: 10000,
  warmupTime: 1,
});

for (let tc of scenarios.benchmarks) {
  bench.add(tc.id, () => {
    isAllowed(tc.variables, tc.scopes, tc.actor)
  })
}

await bench.warmup();
await bench.run();

console.table(bench.table());
