module.exports = {
  apps: [
    {
      name: "wip-pos-listener",
      script: "./index.ts",
      interpreter: "tsx",
      ignore_watch: ["node_modules", "\\.git", "*.log"],
    },
  ],
};
