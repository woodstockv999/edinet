module.exports = {
  apps: [{
    name: "edinet",
    script: "node_modules/.bin/next",
    args: "start -p 3010",
    cwd: __dirname,
    env: {
      NODE_ENV: "production",
      NEXT_PUBLIC_BASE_PATH: "/edinet",
    },
  }],
};
