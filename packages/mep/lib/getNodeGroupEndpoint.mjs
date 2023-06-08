export default function getNodeGroupEndpoint(nodeGroups, displayName) {
  return nodeGroups.find(g => g.displayName === displayName).endpoint;
}