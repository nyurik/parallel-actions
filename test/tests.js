const { describe, it } = require('mocha');
const assert = require('assert');

const runner = require('../lib/lib');

describe('Parallel Actions Tests', () => {
  it('executes things in the right order', async () => {
    function executor(action, id, dependencies) {
      assert.strictEqual(id, action.id);
      assert.deepStrictEqual(new Set(dependencies), new Set(action.dependsOn || [undefined]));
      return Promise.resolve(id);
    }

    function test(actions) {
      Object.entries(actions).forEach(([id, action]) => {
        // eslint-disable-next-line no-param-reassign
        action.id = id;
      });
      return runner(actions, executor);
    }

    await test({});
    await test({ a1: {} });
    await test({
      a1: {},
      a2: { dependsOn: ['a1'] },
    });
    await test({
      a1: { dependsOn: ['a2'] },
      a2: {},
    });
    await test({
      a1: {},
      a2: {},
      a3: { dependsOn: ['a1', 'a2'] },
    });
    await test({
      a1: {},
      a2: {},
      a3: { dependsOn: ['a1'] },
      a4: { dependsOn: ['a1', 'a3'] },
      a5: { dependsOn: ['a2', 'a4'] },
    });
  });
});
