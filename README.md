# parallel-actions

This library simplifies running parallel actions with dependencies, ensuring only the actions with complete dependencies run in parallel.

## Example

Run multiple SQL commands that require certain ordering, e.g. `REFRESH MATERIALIZED VIEW` must be run in the order of their dependencies.
In this example we refresh 3 materialized views, two of which are based on real tables, and the 3rd depends on the first two.
`parallel-actions` lib will simplify execution, making sure `v3` does not start until `v1` and `v2` are complete.

```js
const { Pool } = require('pg');
const pexec = require('parallel-actions');

async function run() {
  // Use PostgreSQL pool to run queries and restrict the number of simultaneous connections.
  const pgpool = new Pool({host: '...', port: '...', database: '...', max: 5});

  // Which views we need to refresh, and what are their dependencies.
  const views = {
    v1: {view: 'view1'},
    v2: {view: 'view2'},
    v3: {view: 'view3', dependsOn: ['v1', 'v2']},
  };
 
  await pexec(views, (v) => pgpool.query(`REFRESH MATERIALIZED VIEW ${v.view};`));
}
```
