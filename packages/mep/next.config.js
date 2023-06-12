module.exports = {
  apps : [{
    name: 'next',
    script: '../../node_modules/.bin/next',
    args: 'start -p ${port}',
    cwd: '/root/oa/packages/next',
    instances: 1,
    exec_mode: 'cluster'
  }]
};
