import ky from 'ky';

const jelasticControlEnv = `https://app.jpe.infomaniak.com/1.0/environment`;

export default async function getNodes(envName, jelasticAccessToken) {
  const envInfo = await ky
    .get(`${jelasticControlEnv}/control/rest/getenvinfo`, {
      searchParams: {
        session: jelasticAccessToken,
        envName,
      },
    })
    .json();

  const nodes = envInfo.nodes.map((node) => ({
    ...node,
    groupDisplayName: envInfo.nodeGroups.find((g) => g.name === node.nodeGroup)
      .displayName,
  }));

  return {
    all: () => nodes,
    byGroups: (groups) =>
      nodes.filter((node) => groups.includes(node.groupDisplayName)),
  };
}
