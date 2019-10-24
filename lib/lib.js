/**
 * Executes all actions in parallel. If action lists dependencies, make sure dependent actions finish running first.
 * @param {Object.<string, {dependsOn: string[]=, result: Promise=, ...}>} actions is an object with action IDs as keys,
 *       optional dependsOn being an array of other action IDs that must complete before this action is ran, and
 *       result will be set after this function is ran. All other values will be ignored (could be used by executor).
 * @param {!function(object, string, Array): Promise} executor runs a single action. The returned promise is set as each action's result.
 * @param {Promise=} rootPromise actions will be ran after this promise is resolved. If not given, actions will run right away.
 * @returns {Promise} resolves when all actions are done.
 */
module.exports = function (actions, executor, rootPromise) {
  if (!rootPromise) {
    rootPromise = Promise.resolve();
  }
  if (!actions) {
    // on empty list of actions resolves when rootPromise is resolved
    return rootPromise;
  }
  while (true) {
    let done = true;
    let hasUnresolved = false;
    for (let [id, action] of Object.entries(actions)) {
      if (!action.result) {
        const dependencies = !action.dependsOn ? [rootPromise] : action.dependsOn.map(v => {
          if (!actions[v]) throw new Error(`Query '${id}' depends on an undefined dependency '${v}'`);
          return actions[v].result;
        });
        // If every dependency has a result (Promise), execute this action after they all finish
        if (dependencies.every(v => v)) {
          action.result = Promise.all(dependencies).then((v) => executor(action, id, v));
          done = false;
        } else {
          hasUnresolved = true;
        }
      }
    }
    if (done) {
      if (hasUnresolved) {
        const ids = Object.keys(actions).filter(k => !actions[k].result);
        throw new Error(`Found circular dependencies between ${ids.join(', ')}`);
      } else {
        return Promise.all(Object.values(actions).map(v => v.result));
      }
    }
  }
};
