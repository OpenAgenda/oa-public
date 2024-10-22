module.exports = {
  apps : [{
    name: 'next',
    script: '../../node_modules/.bin/next',
    args: 'start -p ${port} --keepAliveTimeout 56000',
    cwd: '/root/oa/packages/next',
    instances: 4,
    exec_mode: 'cluster'
  }]
};
