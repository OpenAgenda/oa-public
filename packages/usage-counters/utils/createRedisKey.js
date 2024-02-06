export default function createRedisKey(
  prefix,
  actorNamespace,
  actorIdentifier,
  targetNamespace = null,
) {
  if (targetNamespace == null) return `${prefix}:${actorNamespace}:${actorIdentifier}`;
  return `${prefix}:${targetNamespace}:${actorNamespace}:${actorIdentifier}`;
}
