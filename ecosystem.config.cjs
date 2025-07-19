module.exports = {
  apps: [
    {
      name: "wip-pos-listener",
      script: "./index.ts",
      interpreter: "node",
      interpreter_args: "--import tsx",
    },
  ],
};
