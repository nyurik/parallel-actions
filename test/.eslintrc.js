module.exports = {
  'env': {
    'mocha': true
  },
  rules: {
    // It is okay to import devDependencies in tests.
    'import/no-extraneous-dependencies': [2, { devDependencies: true }],
  },
};
