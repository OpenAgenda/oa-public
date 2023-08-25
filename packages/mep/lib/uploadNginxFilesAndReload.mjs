import rsync from './rsync.mjs';
import rexec from './rexec.mjs';
import getNodesAndGroups from './getNodesAndGroups.mjs';

export default async function uploadNginxFilesAndReload({
  dir,
  webEnvName,
  jelasticAccessToken,
  SSHKeyPath,
  remoteNginxDir,
}) {
  const {
    nodes: nginxNodes,
  } = await getNodesAndGroups(webEnvName, ['nginx'], {
    jelasticAccessToken,
    user: 'nginx',
  });

  await rsync(nginxNodes, `${dir}/oa/packages/cibul-templates/dist`, '/var/lib/nginx/static', { SSHKeyPath });

  await rsync(nginxNodes, `${dir}/nginx`, remoteNginxDir, {
    SSHKeyPath,
    options: '-aAXEWHx',
  });

  await rexec(nginxNodes, [
    `sudo cp ${remoteNginxDir}/nginx.conf /etc/nginx/nginx.conf`,
    `sudo ln -sf ${remoteNginxDir}/conf.d/server_params /etc/nginx/conf.d/server_params`,
    `sudo ln -sf ${remoteNginxDir}/conf.d/nodejs_params /etc/nginx/conf.d/nodejs_params`,
    `sudo ln -sf ${remoteNginxDir}/conf.d/nextjs_params /etc/nginx/conf.d/nextjs_params`,
    `sudo ln -sf ${remoteNginxDir}/conf.d/static_params /etc/nginx/conf.d/static_params`,
    'sudo service nginx reload'
  ], { SSHKeyPath });
}
