import rsync from './rsync.mjs';
import rexec from './rexec.mjs';

export default async function uploadNginxFilesAndReload({
  dir,
  nodes,
  SSHKeyPath,
  remoteNginxDir,
}) {
  await rsync(
    nodes,
    `${dir}/oa/packages/cibul-templates/dist`,
    '/var/lib/nginx/static',
    {
      SSHKeyPath,
      user: 'nginx',
    },
  );

  await rsync(nodes, `${dir}/nginx`, remoteNginxDir, {
    SSHKeyPath,
    user: 'nginx',
    options: '-aAXEWHx',
  });

  await rexec(
    nodes,
    [
      `sudo cp ${remoteNginxDir}/nginx.conf /etc/nginx/nginx.conf`,
      `sudo ln -sf ${remoteNginxDir}/conf.d/common /etc/nginx/conf.d/common`,
      `sudo ln -sf ${remoteNginxDir}/conf.d/server_params /etc/nginx/conf.d/server_params`,
      `sudo ln -sf ${remoteNginxDir}/conf.d/nodejs_params /etc/nginx/conf.d/nodejs_params`,
      `sudo ln -sf ${remoteNginxDir}/conf.d/nextjs_params /etc/nginx/conf.d/nextjs_params`,
      `sudo ln -sf ${remoteNginxDir}/conf.d/static_params /etc/nginx/conf.d/static_params`,
      'sudo service nginx reload',
    ],
    {
      SSHKeyPath,
      user: 'nginx',
    },
  );
}
