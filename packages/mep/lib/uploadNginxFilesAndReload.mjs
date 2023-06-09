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
  });

  await rsync(nginxNodes, `${dir}/oa/packages/cibul-templates/dist`, '/var/lib/nginx/static', { SSHKeyPath });

  await rsync(nginxNodes, `${dir}/nginx`, remoteNginxDir, {
    SSHKeyPath,
    options: ['verbose', 'archive', 'compress', 'force'],
  });

  await rexec(nginxNodes, [
    `cp ${remoteNginxDir}/nginx.conf /etc/nginx/nginx.conf`,
    `ln -sf ${remoteNginxDir}/conf.d/server_params /etc/nginx/conf.d/server_params`,
    `ln -sf ${remoteNginxDir}/conf.d/nodejs_params /etc/nginx/conf.d/nodejs_params`,
    `ln -sf ${remoteNginxDir}/conf.d/nextjs_params /etc/nginx/conf.d/nextjs_params`,
    `ln -sf ${remoteNginxDir}/conf.d/static_params /etc/nginx/conf.d/static_params`,
    'sudo service nginx reload'
  ], { SSHKeyPath });
}