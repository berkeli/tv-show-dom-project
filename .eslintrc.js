module.exports = {
  ignorePatterns: ['shows.js', 'episodes.js'],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'max-len': 'off',
    radix: 'off',
    'no-console': 'off',
  },
};
