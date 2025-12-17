module.exports = {
  apps : [${appArgList}].map((args) => ({
    name: args,
    script: 'server.js',
    args,
    cwd: '/root/oa/packages/cibul-node',
    node_args: '${node_args}',
    instances: ${instances},
    exec_mode: 'cluster',
    env: ${env},
    log_date_format: 'YYYY-MM-DD HH:mm Z',
  }))
};
