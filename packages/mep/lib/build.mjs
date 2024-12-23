import execCommands from './execCommands.mjs';

export default function build({ dir, envVars }) {
  const { CDN: pushToCDN = false } = process.env;

  const commands = [
    `cd ${dir}`,
    'cd oa',
    'echo yarn turbo prepack build',
    'yarn turbo prepack build',
  ];

  if (pushToCDN === '1') {
    commands.push(
      `cd ${dir}/oa/packages/next`,
      'yarn push'
    );
  }

  return execCommands(commands, envVars);
}
