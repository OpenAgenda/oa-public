module.exports = {
  apps : [{
    name: 'server',
    script: 'server.js',
    args: '${args}',
    cwd: '/root/oa/packages/cibul-node',
    instances: 1,
    exec_mode: 'cluster',
    env: ${env},
  }]
};
