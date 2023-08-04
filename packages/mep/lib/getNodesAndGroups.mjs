import axios from 'axios';

const jelasticControlEnv = `https://app.jpe.infomaniak.com/1.0/environment`;
const jelasticDomain = 'gate.jpe.infomaniak.com';

const getNodeGroupNames = ({ nodeGroups }, displayNames) => nodeGroups
  .filter(g => displayNames ? displayNames.includes(g.displayName) : true)
  .map(g => g.name);

export default async function getNodesAndGroups(envName, groups, {
  jelasticAccessToken,
  user = 'root'
}) {
  const {
    data: envInfo
  } = await axios.get(`${jelasticControlEnv}/control/rest/getenvinfo`, {
    params: {
      session: jelasticAccessToken,
      envName,
    }
  });

  const nodeGroupNames = getNodeGroupNames(envInfo, groups);

  const nodeGroups = envInfo.nodeGroups
  .filter(({
    name,
  }) => nodeGroupNames.includes(name))
  .map(g => ({
    ...g,
    endpoint: `${g.name}.${envInfo.env.domain}`
  }));

  return {
    nodes: envInfo
      .nodes
      .filter(n => nodeGroupNames.includes(n.nodeGroup))
      .map(node => ({
        groupDisplayName: nodeGroups.find(g => g.name === node.nodeGroup).displayName,
        name: node.name,
        endpoint: node.url.replace(/^http(s|):\/\//, ''),
        connectionEndpoint: `${user}@${node.url.replace(/^http(s|):\/\//, '')}`,
      })),
    nodeGroups,
  };
}
