module.exports = {
  apps : ['api'].map((args) => ({
    name: args,
    script: 'server.js',
    args,
    cwd: '/root/oa/packages/cibul-node',
    node_args: '--max-old-space-size=4096',
    instances: 1,
    exec_mode: 'cluster',
    env: {
  "NODE_ENV": "production",
  "PORT": 3000
},
  }))
};
